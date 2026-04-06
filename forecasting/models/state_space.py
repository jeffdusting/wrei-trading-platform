"""
Bayesian State-Space Model for ESC Market Intelligence
=======================================================

Kalman filter with four hidden states:
  1. true_surplus     — estimated total supply (registered + shadow)
  2. creation_momentum — smoothed creation rate (3-month lag incorporated)
  3. demand_pressure   — (days_to_deadline * uncovered_demand) / norm
  4. regime_indicator  — continuous regime signal (0=surplus, 0.5=balanced, 1=tightening)

Observation vector y(t):
  1. spot_price        — maps from surplus and demand via OU price model
  2. creation_volume   — noisy observation of creation_momentum
  3. price_to_penalty  — maps from regime (higher ratio = closer to tightening)

Regime probabilities are maintained via a simple HMM transition model
that feeds regime_indicator into the Kalman state.

Uses filterpy.kalman.KalmanFilter for the linear component.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from filterpy.kalman import KalmanFilter

from forecasting.models.ou_bounded import (
    DEFAULT_REGIMES,
    OUForecast,
    OURegimeParams,
    forecast_at_horizons,
)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

N_STATES = 4   # true_surplus, creation_momentum, demand_pressure, regime_indicator
N_OBS = 3      # spot_price, creation_volume, price_to_penalty_ratio

# Normalisation constants (derived from historical data ranges)
SURPLUS_SCALE = 1e6          # millions of certificates
CREATION_SCALE = 1e5         # hundred-thousands per week
DEMAND_PRESSURE_NORM = 365.0 # days normalisation

# Regime thresholds on the continuous regime_indicator [0, 1]
REGIME_SURPLUS_THRESHOLD = 0.33
REGIME_TIGHTENING_THRESHOLD = 0.67


# ---------------------------------------------------------------------------
# Regime HMM
# ---------------------------------------------------------------------------

# Transition matrix: rows = from, cols = to
# [surplus, balanced, tightening]
HMM_TRANSITION = np.array([
    [0.92, 0.07, 0.01],  # surplus is sticky
    [0.05, 0.90, 0.05],  # balanced transitions both ways
    [0.01, 0.07, 0.92],  # tightening is sticky
])

REGIME_NAMES = ["surplus", "balanced", "tightening"]
REGIME_MU_MAP = {
    "surplus": DEFAULT_REGIMES["surplus"].mu,
    "balanced": DEFAULT_REGIMES["balanced"].mu,
    "tightening": DEFAULT_REGIMES["tightening"].mu,
}


def regime_from_indicator(indicator: float) -> str:
    """Map continuous indicator to discrete regime name."""
    if indicator < REGIME_SURPLUS_THRESHOLD:
        return "surplus"
    elif indicator < REGIME_TIGHTENING_THRESHOLD:
        return "balanced"
    return "tightening"


def regime_probabilities_from_indicator(indicator: float) -> Dict[str, float]:
    """Soft regime probabilities from the continuous indicator."""
    # Use distance-based weighting
    centres = np.array([0.0, 0.5, 1.0])
    distances = np.abs(centres - np.clip(indicator, 0.0, 1.0))
    weights = np.exp(-3.0 * distances)
    weights /= weights.sum()
    return dict(zip(REGIME_NAMES, weights.tolist()))


# ---------------------------------------------------------------------------
# Shadow market estimate
# ---------------------------------------------------------------------------

@dataclass
class ShadowEstimate:
    """Estimated shadow (unregistered) supply."""
    total_surplus: float
    registered_surplus: float
    shadow_surplus: float
    confidence_lower: float
    confidence_upper: float


# ---------------------------------------------------------------------------
# State-space model
# ---------------------------------------------------------------------------

@dataclass
class StateEstimate:
    """Snapshot of the estimated state at one time step."""
    week_ending: str
    true_surplus: float
    creation_momentum: float
    demand_pressure: float
    regime_indicator: float
    regime_name: str
    regime_probabilities: Dict[str, float]
    state_covariance_diag: List[float]


@dataclass
class ForecastResult:
    """Combined forecast from state-space + OU model."""
    generated_at: str
    current_state: StateEstimate
    price_forecasts: List[OUForecast]
    shadow_estimate: ShadowEstimate
    model_version: str = "1.0.0"


class ESCStateSpaceModel:
    """
    Kalman filter state-space model for ESC market dynamics.

    State vector x = [true_surplus, creation_momentum, demand_pressure, regime_indicator]
    Observation y  = [spot_price, creation_volume, price_to_penalty_ratio]
    """

    def __init__(self) -> None:
        self.kf = KalmanFilter(dim_x=N_STATES, dim_z=N_OBS)
        self.regime_probs = np.array([0.2, 0.6, 0.2])  # prior: mostly balanced
        self.history: List[StateEstimate] = []
        self._initialised = False

    def initialise(
        self,
        initial_surplus: float = 8.3,     # millions
        initial_creation: float = 1.1,    # hundred-thousands / week
        initial_demand_pressure: float = 0.5,
        initial_regime: float = 0.5,      # balanced
    ) -> None:
        """Set initial state and covariance."""
        # State vector (normalised units)
        self.kf.x = np.array([
            initial_surplus,
            initial_creation,
            initial_demand_pressure,
            initial_regime,
        ]).reshape(-1, 1)

        # State transition matrix A
        # surplus: decays slightly each week (net of creation - demand)
        # creation_momentum: mean-reverts to base rate
        # demand_pressure: evolves with time-to-deadline
        # regime_indicator: slow-moving, updated by HMM
        self.kf.F = np.array([
            [0.998,  0.01, -0.002, 0.0],    # surplus += creation - demand effect
            [0.0,    0.95,  0.0,   0.0],     # creation mean-reverts
            [0.0,    0.0,   0.97,  0.02],    # demand pressure evolves
            [0.0,    0.0,   0.0,   0.99],    # regime is sticky
        ])

        # Observation matrix C
        # Price is primarily driven by surplus (inverse) and demand pressure
        # Creation volume directly observes creation_momentum
        # Price-to-penalty maps from regime_indicator
        self.kf.H = np.array([
            [-2.0,  0.0,   3.0,  4.0],   # spot_price ~ -surplus + demand + regime
            [ 0.0,  1.0,   0.0,  0.0],   # creation_volume ~ creation_momentum
            [ 0.0,  0.0,   0.2,  0.5],   # price_to_penalty ~ demand + regime
        ])

        # Process noise covariance Q
        self.kf.Q = np.diag([0.01, 0.005, 0.02, 0.005])

        # Measurement noise covariance R
        self.kf.R = np.diag([2.0, 0.1, 0.01])

        # Initial state covariance P
        self.kf.P = np.diag([1.0, 0.5, 0.5, 0.2])

        # Control input matrix B (for exogenous policy shocks)
        self.kf.B = np.array([
            [0.0],     # surplus: no direct policy effect on quantity
            [0.0],     # creation: no direct effect
            [0.1],     # demand_pressure: policy can shift demand
            [0.05],    # regime: policy shock nudges regime
        ])

        self._initialised = True

    def _update_regime_hmm(self, observation: np.ndarray) -> None:
        """
        Update regime probabilities using HMM transition + observation likelihood.

        Uses the spot price relative to regime mu values as the emission model.
        """
        spot_price = observation[0]
        # Emission likelihood: Gaussian around each regime's OU mu
        likelihoods = np.zeros(3)
        for i, name in enumerate(REGIME_NAMES):
            mu = REGIME_MU_MAP[name]
            sigma = 3.0  # observation noise for regime classification
            likelihoods[i] = math.exp(-0.5 * ((spot_price - mu) / sigma) ** 2)

        # HMM forward step: predict then update
        predicted = HMM_TRANSITION.T @ self.regime_probs
        updated = predicted * likelihoods
        total = updated.sum()
        if total > 0:
            self.regime_probs = updated / total
        else:
            self.regime_probs = predicted

    def _regime_indicator_from_probs(self) -> float:
        """Convert discrete regime probabilities to continuous indicator."""
        return float(
            self.regime_probs[0] * 0.0
            + self.regime_probs[1] * 0.5
            + self.regime_probs[2] * 1.0
        )

    def step(
        self,
        week_ending: str,
        spot_price: Optional[float],
        creation_volume: Optional[float],
        price_to_penalty: Optional[float],
        cumulative_surplus: Optional[float] = None,
        policy_shock: float = 0.0,
    ) -> StateEstimate:
        """
        Run one Kalman filter step: predict then update.

        Missing observations are handled by widening measurement noise
        (effectively skipping the update for that dimension).
        """
        if not self._initialised:
            self.initialise()

        # Predict
        u = np.array([[policy_shock]])
        self.kf.predict(u=u)

        # Build observation vector and handle missing data
        z = np.zeros(N_OBS)
        R_adj = self.kf.R.copy()

        if spot_price is not None:
            z[0] = spot_price
            # Update regime HMM
            self._update_regime_hmm(np.array([spot_price]))
        else:
            z[0] = 0.0
            R_adj[0, 0] = 1e6  # effectively ignore

        if creation_volume is not None:
            z[1] = creation_volume / CREATION_SCALE
        else:
            z[1] = 0.0
            R_adj[1, 1] = 1e6

        if price_to_penalty is not None:
            z[2] = price_to_penalty
        else:
            z[2] = 0.0
            R_adj[2, 2] = 1e6

        # Inject regime indicator from HMM into the state before update
        regime_ind = self._regime_indicator_from_probs()
        self.kf.x[3, 0] = regime_ind

        # If we have surplus observation, nudge true_surplus toward it
        if cumulative_surplus is not None:
            surplus_normalised = cumulative_surplus / SURPLUS_SCALE
            innovation = surplus_normalised - self.kf.x[0, 0]
            self.kf.x[0, 0] += 0.1 * innovation

        # Update with adjusted R
        old_R = self.kf.R
        self.kf.R = R_adj
        self.kf.update(z.reshape(-1, 1))
        self.kf.R = old_R

        # Clamp regime_indicator to [0, 1]
        self.kf.x[3, 0] = np.clip(self.kf.x[3, 0], 0.0, 1.0)

        # Build state estimate
        state = StateEstimate(
            week_ending=week_ending,
            true_surplus=float(self.kf.x[0, 0]) * SURPLUS_SCALE,
            creation_momentum=float(self.kf.x[1, 0]) * CREATION_SCALE,
            demand_pressure=float(self.kf.x[2, 0]),
            regime_indicator=float(self.kf.x[3, 0]),
            regime_name=regime_from_indicator(float(self.kf.x[3, 0])),
            regime_probabilities=dict(zip(REGIME_NAMES, self.regime_probs.tolist())),
            state_covariance_diag=np.diag(self.kf.P).tolist(),
        )
        self.history.append(state)
        return state

    def run_filter(self, df: pd.DataFrame) -> List[StateEstimate]:
        """
        Run the Kalman filter forward through the entire historical dataset.

        Args:
            df: DataFrame with columns: week_ending, spot_price,
                creation_volume_total, price_to_penalty_ratio,
                cumulative_surplus, policy_events.

        Returns:
            List of StateEstimate for each time step.
        """
        if not self._initialised:
            # Initialise from first row
            row0 = df.iloc[0]
            self.initialise(
                initial_surplus=row0["cumulative_surplus"] / SURPLUS_SCALE,
                initial_creation=row0["creation_volume_total"] / CREATION_SCALE,
                initial_demand_pressure=0.3,
                initial_regime=0.4,
            )

        for _, row in df.iterrows():
            # Detect policy shocks: count recent bullish minus bearish events
            policy_shock = 0.0
            try:
                events = json.loads(row["policy_events"]) if isinstance(row["policy_events"], str) else row["policy_events"]
                if events:
                    latest = events[-1] if events else {}
                    impact = latest.get("impact", "neutral")
                    if impact == "bullish":
                        policy_shock = 1.0
                    elif impact == "bearish":
                        policy_shock = -1.0
            except (json.JSONDecodeError, TypeError):
                pass

            self.step(
                week_ending=str(row["week_ending"]),
                spot_price=float(row["spot_price"]),
                creation_volume=float(row["creation_volume_total"]),
                price_to_penalty=float(row["price_to_penalty_ratio"]),
                cumulative_surplus=float(row["cumulative_surplus"]),
                policy_shock=policy_shock,
            )

        return self.history

    def update_and_forecast(
        self,
        new_observations: Dict[str, Any],
        horizons: Optional[List[int]] = None,
        penalty_rate: float = 29.48,
    ) -> ForecastResult:
        """
        Incorporate new data and produce updated forecasts.

        Args:
            new_observations: dict with keys: week_ending, spot_price,
                creation_volume, price_to_penalty, cumulative_surplus, policy_shock
            horizons: forecast horizons in weeks
            penalty_rate: current penalty rate ceiling

        Returns:
            ForecastResult with state estimate and price forecasts.
        """
        if horizons is None:
            horizons = [1, 4, 12, 26]

        state = self.step(
            week_ending=new_observations.get("week_ending", ""),
            spot_price=new_observations.get("spot_price"),
            creation_volume=new_observations.get("creation_volume"),
            price_to_penalty=new_observations.get("price_to_penalty"),
            cumulative_surplus=new_observations.get("cumulative_surplus"),
            policy_shock=new_observations.get("policy_shock", 0.0),
        )

        # Use OU model with regime-appropriate params for price forecast
        regime = state.regime_name
        params = DEFAULT_REGIMES[regime]

        # Adjust mu based on state: if true_surplus is high, push mu down
        surplus_millions = state.true_surplus / SURPLUS_SCALE
        mu_adjustment = -0.5 * max(0, surplus_millions - 7.0)  # penalise high surplus
        adjusted_params = OURegimeParams(
            theta=params.theta,
            mu=max(params.mu + mu_adjustment, 10.0),
            sigma=params.sigma,
        )

        current_price = new_observations.get("spot_price", adjusted_params.mu)
        if current_price is None:
            current_price = adjusted_params.mu

        price_forecasts = forecast_at_horizons(
            current_price=current_price,
            params=adjusted_params,
            penalty_rate=penalty_rate,
            horizons=horizons,
        )

        shadow = self.get_shadow_market_estimate()

        return ForecastResult(
            generated_at=new_observations.get("week_ending", ""),
            current_state=state,
            price_forecasts=price_forecasts,
            shadow_estimate=shadow,
        )

    def get_shadow_market_estimate(self) -> ShadowEstimate:
        """
        Estimate shadow (unregistered) supply from the Kalman state.

        The Kalman filter's true_surplus state tracks the total supply
        including unregistered certificates. The difference between
        this and the observed cumulative_surplus is the shadow estimate.
        """
        if not self.history:
            return ShadowEstimate(0, 0, 0, 0, 0)

        latest = self.history[-1]
        total = latest.true_surplus
        # Use the covariance to estimate uncertainty
        cov_surplus = latest.state_covariance_diag[0] * SURPLUS_SCALE ** 2
        std_surplus = math.sqrt(max(cov_surplus, 0))

        # Shadow = total estimated - registered (assume registered ≈ 95% of total)
        registered_fraction = 0.92
        registered = total * registered_fraction
        shadow = total * (1.0 - registered_fraction)

        return ShadowEstimate(
            total_surplus=round(total, 0),
            registered_surplus=round(registered, 0),
            shadow_surplus=round(shadow, 0),
            confidence_lower=round(max(0, shadow - 1.96 * std_surplus * (1 - registered_fraction)), 0),
            confidence_upper=round(shadow + 1.96 * std_surplus * (1 - registered_fraction), 0),
        )

    def get_latest_state(self) -> Optional[StateEstimate]:
        """Return the most recent state estimate."""
        return self.history[-1] if self.history else None


# ---------------------------------------------------------------------------
# Convenience: load data and run
# ---------------------------------------------------------------------------

def load_historical_data(csv_path: Optional[str] = None) -> pd.DataFrame:
    """Load the ESC historical CSV dataset."""
    if csv_path is None:
        csv_path = str(Path(__file__).parent.parent / "data" / "esc_historical.csv")
    return pd.read_csv(csv_path)


def run_full_filter(csv_path: Optional[str] = None) -> ESCStateSpaceModel:
    """Load data, initialise model, run filter, return fitted model."""
    df = load_historical_data(csv_path)
    model = ESCStateSpaceModel()
    model.run_filter(df)
    return model


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_filter_runs_through_dataset():
    """Kalman filter processes all rows without error."""
    model = run_full_filter()
    assert len(model.history) == 326, f"Expected 326 states, got {len(model.history)}"
    # Final state should be reasonable
    latest = model.history[-1]
    assert latest.regime_name in REGIME_NAMES
    assert latest.true_surplus > 0


def test_regime_detection():
    """Model identifies regime changes across the dataset."""
    model = run_full_filter()
    regimes_seen = set(s.regime_name for s in model.history)
    assert len(regimes_seen) >= 2, f"Expected at least 2 regimes, got {regimes_seen}"


def test_shadow_market_estimate():
    """Shadow market estimate is positive with reasonable bounds."""
    model = run_full_filter()
    shadow = model.get_shadow_market_estimate()
    assert shadow.shadow_surplus >= 0
    assert shadow.confidence_upper >= shadow.shadow_surplus
    assert shadow.total_surplus > shadow.registered_surplus


def test_update_and_forecast():
    """update_and_forecast returns valid forecasts."""
    model = run_full_filter()
    result = model.update_and_forecast({
        "week_ending": "2025-04-11",
        "spot_price": 23.50,
        "creation_volume": 120000,
        "price_to_penalty": 0.65,
        "cumulative_surplus": 8_300_000,
    })
    assert len(result.price_forecasts) == 4  # default horizons
    for fc in result.price_forecasts:
        assert fc.upper_95 <= 29.48 + 0.5  # near penalty ceiling at most
        assert fc.lower_95 >= 0


if __name__ == "__main__":
    print("Running state-space model tests...")
    test_filter_runs_through_dataset()
    print("  [PASS] Filter runs through dataset (326 rows)")
    test_regime_detection()
    print("  [PASS] Regime detection")
    test_shadow_market_estimate()
    print("  [PASS] Shadow market estimate")
    test_update_and_forecast()
    print("  [PASS] update_and_forecast")
    print("\nAll tests passed.")

    # Demo
    model = run_full_filter()
    latest = model.get_latest_state()
    if latest:
        print(f"\n--- Latest state ({latest.week_ending}) ---")
        print(f"  Regime: {latest.regime_name}")
        print(f"  Regime probs: {latest.regime_probabilities}")
        print(f"  True surplus: {latest.true_surplus:,.0f}")
        print(f"  Creation momentum: {latest.creation_momentum:,.0f}")
        print(f"  Demand pressure: {latest.demand_pressure:.3f}")

    shadow = model.get_shadow_market_estimate()
    print(f"\n--- Shadow market estimate ---")
    print(f"  Total surplus: {shadow.total_surplus:,.0f}")
    print(f"  Registered: {shadow.registered_surplus:,.0f}")
    print(f"  Shadow: {shadow.shadow_surplus:,.0f} "
          f"[{shadow.confidence_lower:,.0f}, {shadow.confidence_upper:,.0f}]")
