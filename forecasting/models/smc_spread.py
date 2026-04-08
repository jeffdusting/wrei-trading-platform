"""
SMC (Safeguard Mechanism Credit) Spread Model
===============================================

Models the ACCU–SMC spread as a mean-reverting Ornstein-Uhlenbeck process.
SMCs trade at a discount to ACCUs ($0.50–$2.00 historically) because they
cannot be banked or traded on the secondary market as freely.

SMC forecast = ACCU forecast − spread_estimate

Calibrated from CER quarterly data and ANREU market observations.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import numpy as np
from scipy.optimize import minimize


# ---------------------------------------------------------------------------
# SMC spread parameters
# ---------------------------------------------------------------------------

@dataclass
class SMCSpreadParams:
    """Parameters for the mean-reverting SMC spread model."""
    theta: float = 0.08       # mean-reversion speed (per week)
    mu: float = 1.25          # long-run mean spread (AUD)
    sigma: float = 0.30       # volatility (AUD per sqrt-week)
    min_spread: float = 0.10  # minimum plausible spread
    max_spread: float = 5.00  # maximum plausible spread


# Calibrated from CER quarterly data — SMCs traded at $0.50–$2.00 discount
DEFAULT_SPREAD_PARAMS = SMCSpreadParams(
    theta=0.08,
    mu=1.25,
    sigma=0.30,
    min_spread=0.10,
    max_spread=5.00,
)

# Regime-dependent spreads: tighter in balanced market, wider in stress
REGIME_SPREAD_PARAMS: Dict[str, SMCSpreadParams] = {
    "post_compliance": SMCSpreadParams(theta=0.06, mu=0.80, sigma=0.20),
    "building": SMCSpreadParams(theta=0.08, mu=1.25, sigma=0.30),
    "compliance_window": SMCSpreadParams(theta=0.12, mu=1.80, sigma=0.45),
}


# ---------------------------------------------------------------------------
# Spread estimation
# ---------------------------------------------------------------------------

def estimate_spread_params(
    spread_series: np.ndarray,
    dt: float = 1.0,
) -> SMCSpreadParams:
    """
    Estimate spread OU parameters from observed ACCU–SMC spreads via MLE.

    Args:
        spread_series: 1-D array of observed spreads (equally spaced).
        dt: time step between observations (1.0 = one week).

    Returns:
        Fitted SMCSpreadParams.
    """
    def neg_log_likelihood(params):
        theta, mu, sigma = params
        if theta <= 0 or sigma <= 0:
            return 1e12
        n = len(spread_series) - 1
        if n <= 0:
            return 1e12

        exp_neg = math.exp(-theta * dt)
        var = (sigma ** 2) / (2.0 * theta) * (1.0 - math.exp(-2.0 * theta * dt))
        if var <= 0:
            return 1e12

        nll = 0.0
        for i in range(n):
            expected = spread_series[i] * exp_neg + mu * (1.0 - exp_neg)
            residual = spread_series[i + 1] - expected
            nll += 0.5 * math.log(2.0 * math.pi * var) + residual ** 2 / (2.0 * var)
        return nll

    result = minimize(
        neg_log_likelihood,
        x0=[0.08, float(np.mean(spread_series)), float(np.std(np.diff(spread_series)))],
        method="L-BFGS-B",
        bounds=[(1e-4, 2.0), (0.01, 10.0), (1e-4, 5.0)],
    )

    theta, mu, sigma = result.x
    return SMCSpreadParams(theta=theta, mu=mu, sigma=sigma)


# ---------------------------------------------------------------------------
# Spread simulation and forecast
# ---------------------------------------------------------------------------

@dataclass
class SMCSpreadForecast:
    """Forecast of the ACCU–SMC spread at a single horizon."""
    horizon_weeks: int
    mean_spread: float
    lower_80: float
    upper_80: float
    lower_95: float
    upper_95: float


def simulate_spread_paths(
    current_spread: float,
    params: SMCSpreadParams,
    n_steps: int,
    n_paths: int = 5000,
    dt: float = 1.0,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """
    Simulate mean-reverting spread paths.

    Returns:
        Array of shape (n_paths, n_steps + 1).
    """
    if rng is None:
        rng = np.random.default_rng(42)

    paths = np.zeros((n_paths, n_steps + 1))
    paths[:, 0] = current_spread

    exp_neg = math.exp(-params.theta * dt)
    std_step = math.sqrt(
        params.sigma ** 2 / (2.0 * params.theta)
        * (1.0 - math.exp(-2.0 * params.theta * dt))
    )

    for t in range(1, n_steps + 1):
        noise = rng.normal(0.0, std_step, size=n_paths)
        expected = paths[:, t - 1] * exp_neg + params.mu * (1.0 - exp_neg)
        paths[:, t] = expected + noise
        # Clamp to plausible range
        paths[:, t] = np.clip(paths[:, t], params.min_spread, params.max_spread)

    return paths


def forecast_spread(
    current_spread: float,
    horizons: Optional[List[int]] = None,
    params: Optional[SMCSpreadParams] = None,
    regime: Optional[str] = None,
    n_paths: int = 5000,
) -> List[SMCSpreadForecast]:
    """
    Forecast the ACCU–SMC spread at specified horizons.

    Args:
        current_spread: Current observed spread (AUD).
        horizons: Forecast horizons in weeks (default [1, 4, 12, 26]).
        params: Custom spread parameters (overrides regime).
        regime: One of 'post_compliance', 'building', 'compliance_window'.
        n_paths: Number of Monte Carlo paths.

    Returns:
        List of SMCSpreadForecast.
    """
    if horizons is None:
        horizons = [1, 4, 12, 26]

    if params is None:
        if regime and regime in REGIME_SPREAD_PARAMS:
            params = REGIME_SPREAD_PARAMS[regime]
        else:
            params = DEFAULT_SPREAD_PARAMS

    max_h = max(horizons)
    paths = simulate_spread_paths(current_spread, params, max_h, n_paths)

    results = []
    for h in horizons:
        spreads_at_h = paths[:, h]
        mean_s = float(np.mean(spreads_at_h))
        results.append(SMCSpreadForecast(
            horizon_weeks=h,
            mean_spread=round(mean_s, 4),
            lower_80=round(float(np.percentile(spreads_at_h, 10)), 4),
            upper_80=round(float(np.percentile(spreads_at_h, 90)), 4),
            lower_95=round(float(np.percentile(spreads_at_h, 2.5)), 4),
            upper_95=round(float(np.percentile(spreads_at_h, 97.5)), 4),
        ))

    return results


# ---------------------------------------------------------------------------
# SMC price forecast (ACCU price − spread)
# ---------------------------------------------------------------------------

@dataclass
class SMCPriceForecast:
    """Combined SMC price forecast."""
    horizon_weeks: int
    accu_price: float
    spread: float
    smc_price: float
    smc_lower_80: float
    smc_upper_80: float


def forecast_smc_price(
    accu_forecasts: List[dict],
    current_spread: float = 1.25,
    regime: Optional[str] = None,
) -> List[SMCPriceForecast]:
    """
    Derive SMC price forecasts from ACCU forecasts and spread model.

    Args:
        accu_forecasts: List of dicts with keys 'horizon_weeks' and 'mean'.
        current_spread: Current ACCU–SMC spread.
        regime: Market regime for spread dynamics.

    Returns:
        List of SMCPriceForecast.
    """
    horizons = [fc["horizon_weeks"] if isinstance(fc, dict) else fc.horizon_weeks
                for fc in accu_forecasts]
    spread_forecasts = forecast_spread(current_spread, horizons, regime=regime)

    results = []
    for accu_fc, spread_fc in zip(accu_forecasts, spread_forecasts):
        accu_price = accu_fc["mean"] if isinstance(accu_fc, dict) else accu_fc.mean
        smc_price = accu_price - spread_fc.mean_spread

        results.append(SMCPriceForecast(
            horizon_weeks=spread_fc.horizon_weeks,
            accu_price=round(accu_price, 2),
            spread=round(spread_fc.mean_spread, 2),
            smc_price=round(max(0, smc_price), 2),
            smc_lower_80=round(max(0, accu_price - spread_fc.upper_80), 2),
            smc_upper_80=round(max(0, accu_price - spread_fc.lower_80), 2),
        ))

    return results


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_spread_mean_reversion():
    """Spread reverts to mu from both sides."""
    params = SMCSpreadParams(theta=0.10, mu=1.25, sigma=0.30)

    # Start above mu
    paths_high = simulate_spread_paths(3.0, params, n_steps=52, n_paths=2000)
    mean_at_52 = np.mean(paths_high[:, -1])
    assert mean_at_52 < 2.0, f"Expected reversion toward mu=1.25, got {mean_at_52:.2f}"

    # Start below mu
    paths_low = simulate_spread_paths(0.20, params, n_steps=52, n_paths=2000)
    mean_at_52_low = np.mean(paths_low[:, -1])
    assert mean_at_52_low > 0.80, f"Expected reversion toward mu=1.25, got {mean_at_52_low:.2f}"


def test_smc_discount():
    """SMC price is always less than ACCU price."""
    accu_forecasts = [
        {"horizon_weeks": 1, "mean": 36.00},
        {"horizon_weeks": 4, "mean": 36.50},
        {"horizon_weeks": 12, "mean": 37.00},
        {"horizon_weeks": 26, "mean": 37.50},
    ]
    smc_results = forecast_smc_price(accu_forecasts, current_spread=1.25)
    for smc_fc in smc_results:
        assert smc_fc.smc_price < smc_fc.accu_price, (
            f"SMC price {smc_fc.smc_price} >= ACCU price {smc_fc.accu_price}"
        )


def test_spread_bounded():
    """Spread stays within plausible range."""
    params = SMCSpreadParams(theta=0.05, mu=1.25, sigma=1.0, min_spread=0.10, max_spread=5.00)
    paths = simulate_spread_paths(1.25, params, n_steps=52, n_paths=3000)
    assert np.all(paths >= 0.10), "Spread below minimum"
    assert np.all(paths <= 5.00), "Spread above maximum"


if __name__ == "__main__":
    print("Running SMC spread model tests...")
    test_spread_mean_reversion()
    print("  [PASS] Spread mean reversion")
    test_smc_discount()
    print("  [PASS] SMC discount")
    test_spread_bounded()
    print("  [PASS] Spread bounded")
    print("\nAll tests passed.")

    # Demo
    print("\n--- Demo: SMC price forecast ---")
    accu_forecasts = [
        {"horizon_weeks": 1, "mean": 36.30},
        {"horizon_weeks": 4, "mean": 36.50},
        {"horizon_weeks": 12, "mean": 37.00},
        {"horizon_weeks": 26, "mean": 37.50},
    ]
    smc_results = forecast_smc_price(accu_forecasts, current_spread=1.25, regime="building")
    for fc in smc_results:
        print(f"  {fc.horizon_weeks:2d}w: ACCU=${fc.accu_price:.2f}  "
              f"spread=${fc.spread:.2f}  "
              f"SMC=${fc.smc_price:.2f}  "
              f"80%=[${fc.smc_lower_80:.2f}, ${fc.smc_upper_80:.2f}]")
