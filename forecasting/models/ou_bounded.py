"""
Bounded Ornstein-Uhlenbeck Model for ESC Price Dynamics
========================================================

Implements dP(t) = theta * (mu(regime) - P(t)) dt + sigma * dW(t)
subject to P(t) <= penalty_rate (reflecting boundary).

Three regimes:
  - surplus:    low mu (~$15-$20), slow theta, moderate sigma
  - balanced:   moderate mu (~$22-$25), moderate theta, moderate sigma
  - tightening: high mu (~$26-$28), fast theta, higher sigma

Parameter estimation via maximum likelihood on discretised OU.
Monte Carlo simulation for n-step-ahead forecasts with confidence intervals.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import numpy as np
from scipy.optimize import minimize


# ---------------------------------------------------------------------------
# Regime parameter definitions
# ---------------------------------------------------------------------------

@dataclass
class OURegimeParams:
    """Parameters for one OU regime."""
    theta: float   # mean-reversion speed (per week)
    mu: float      # long-run mean price (AUD)
    sigma: float   # volatility (AUD per sqrt-week)


# Default regime parameters (calibrated to ESC historical ranges)
DEFAULT_REGIMES: Dict[str, OURegimeParams] = {
    "surplus": OURegimeParams(theta=0.03, mu=18.0, sigma=0.8),
    "balanced": OURegimeParams(theta=0.08, mu=23.5, sigma=1.0),
    "tightening": OURegimeParams(theta=0.15, mu=27.0, sigma=1.4),
}


# ---------------------------------------------------------------------------
# Forecast result
# ---------------------------------------------------------------------------

@dataclass
class OUForecast:
    """Forecast at a single horizon."""
    horizon_weeks: int
    mean: float
    lower_80: float
    upper_80: float
    lower_95: float
    upper_95: float


# ---------------------------------------------------------------------------
# Maximum likelihood estimation
# ---------------------------------------------------------------------------

def ou_log_likelihood(
    params: Tuple[float, float, float],
    prices: np.ndarray,
    dt: float = 1.0,
) -> float:
    """
    Negative log-likelihood for discretised OU process.

    For the OU process, the transition density is Gaussian:
      P(t+dt) | P(t) ~ N(P(t)*exp(-theta*dt) + mu*(1 - exp(-theta*dt)),
                         sigma^2/(2*theta) * (1 - exp(-2*theta*dt)))
    """
    theta, mu, sigma = params
    if theta <= 0 or sigma <= 0:
        return 1e12

    n = len(prices) - 1
    if n <= 0:
        return 1e12

    exp_neg_theta_dt = math.exp(-theta * dt)
    variance = (sigma ** 2) / (2.0 * theta) * (1.0 - math.exp(-2.0 * theta * dt))

    if variance <= 0:
        return 1e12

    nll = 0.0
    for i in range(n):
        expected = prices[i] * exp_neg_theta_dt + mu * (1.0 - exp_neg_theta_dt)
        residual = prices[i + 1] - expected
        nll += 0.5 * math.log(2.0 * math.pi * variance) + residual ** 2 / (2.0 * variance)

    return nll


def estimate_ou_params(
    prices: np.ndarray,
    dt: float = 1.0,
    initial_guess: Optional[Tuple[float, float, float]] = None,
) -> OURegimeParams:
    """
    Estimate (theta, mu, sigma) from a price series via MLE.

    Args:
        prices: 1-D array of observed prices (equally spaced).
        dt: time step between observations (1.0 = one week).
        initial_guess: starting (theta, mu, sigma) for optimiser.

    Returns:
        Fitted OURegimeParams.
    """
    if initial_guess is None:
        initial_guess = (0.08, float(np.mean(prices)), float(np.std(np.diff(prices))))

    result = minimize(
        ou_log_likelihood,
        x0=initial_guess,
        args=(prices, dt),
        method="L-BFGS-B",
        bounds=[(1e-4, 2.0), (1.0, 50.0), (1e-4, 10.0)],
    )

    theta, mu, sigma = result.x
    return OURegimeParams(theta=theta, mu=mu, sigma=sigma)


# ---------------------------------------------------------------------------
# Bounded simulation (reflecting boundary at penalty_rate)
# ---------------------------------------------------------------------------

def simulate_paths(
    current_price: float,
    params: OURegimeParams,
    penalty_rate: float,
    n_steps: int,
    n_paths: int = 5000,
    dt: float = 1.0,
    rng: Optional[np.random.Generator] = None,
) -> np.ndarray:
    """
    Simulate OU paths with reflecting boundary at penalty_rate.

    Returns:
        Array of shape (n_paths, n_steps + 1) including the initial price.
    """
    if rng is None:
        rng = np.random.default_rng(42)

    paths = np.zeros((n_paths, n_steps + 1))
    paths[:, 0] = current_price

    exp_neg_theta_dt = math.exp(-params.theta * dt)
    std_step = math.sqrt(
        params.sigma ** 2 / (2.0 * params.theta) * (1.0 - math.exp(-2.0 * params.theta * dt))
    )

    for t in range(1, n_steps + 1):
        noise = rng.normal(0.0, std_step, size=n_paths)
        expected = paths[:, t - 1] * exp_neg_theta_dt + params.mu * (1.0 - exp_neg_theta_dt)
        paths[:, t] = expected + noise

        # Reflecting boundary: prices that exceed the penalty rate are
        # reflected back below it
        over = paths[:, t] > penalty_rate
        paths[over, t] = 2.0 * penalty_rate - paths[over, t]

        # Floor at zero (prices cannot be negative)
        paths[:, t] = np.maximum(paths[:, t], 0.0)

    return paths


# ---------------------------------------------------------------------------
# Forecast with confidence intervals
# ---------------------------------------------------------------------------

def forecast_at_horizons(
    current_price: float,
    params: OURegimeParams,
    penalty_rate: float,
    horizons: List[int],
    n_paths: int = 5000,
    dt: float = 1.0,
    rng: Optional[np.random.Generator] = None,
) -> List[OUForecast]:
    """
    Generate price forecasts at specified horizons (in weeks).

    Returns:
        List of OUForecast with mean and confidence intervals.
    """
    max_horizon = max(horizons)
    paths = simulate_paths(
        current_price, params, penalty_rate, max_horizon, n_paths, dt, rng
    )

    results = []
    for h in horizons:
        prices_at_h = paths[:, h]
        mean_price = float(np.mean(prices_at_h))
        lower_80 = float(np.percentile(prices_at_h, 10.0))
        upper_80 = float(np.percentile(prices_at_h, 90.0))
        lower_95 = float(np.percentile(prices_at_h, 2.5))
        upper_95 = float(np.percentile(prices_at_h, 97.5))

        results.append(OUForecast(
            horizon_weeks=h,
            mean=round(mean_price, 4),
            lower_80=round(lower_80, 4),
            upper_80=round(upper_80, 4),
            lower_95=round(lower_95, 4),
            upper_95=round(upper_95, 4),
        ))

    return results


# ---------------------------------------------------------------------------
# Convenience function
# ---------------------------------------------------------------------------

def forecast(
    current_price: float,
    regime: str = "balanced",
    penalty_rate: float = 35.86,
    horizons: Optional[List[int]] = None,
    custom_params: Optional[OURegimeParams] = None,
    n_paths: int = 5000,
) -> List[OUForecast]:
    """
    High-level forecast interface.

    Args:
        current_price: Current ESC spot price (AUD).
        regime: One of 'surplus', 'balanced', 'tightening'.
        penalty_rate: Penalty rate ceiling (AUD per ESC).
        horizons: Forecast horizons in weeks (default [1, 4, 12, 26]).
        custom_params: Override regime params with custom OURegimeParams.
        n_paths: Number of Monte Carlo paths.

    Returns:
        List of OUForecast objects at each horizon.
    """
    if horizons is None:
        horizons = [1, 4, 12, 26]

    if custom_params is not None:
        params = custom_params
    else:
        if regime not in DEFAULT_REGIMES:
            raise ValueError(f"Unknown regime '{regime}'. Must be one of: {list(DEFAULT_REGIMES.keys())}")
        params = DEFAULT_REGIMES[regime]

    return forecast_at_horizons(
        current_price=current_price,
        params=params,
        penalty_rate=penalty_rate,
        horizons=horizons,
        n_paths=n_paths,
    )


# ---------------------------------------------------------------------------
# Unit tests (run with: python -m pytest forecasting/models/ou_bounded.py)
# ---------------------------------------------------------------------------

def test_mean_reversion():
    """Process started far from mu converges toward mu."""
    params = OURegimeParams(theta=0.10, mu=25.0, sigma=1.0)
    # Start far below mu
    paths_low = simulate_paths(10.0, params, 40.0, n_steps=52, n_paths=2000)
    mean_at_52 = np.mean(paths_low[:, -1])
    assert mean_at_52 > 20.0, f"Expected convergence toward mu=25, got {mean_at_52:.2f}"

    # Start far above mu
    paths_high = simulate_paths(35.0, params, 40.0, n_steps=52, n_paths=2000)
    mean_at_52_high = np.mean(paths_high[:, -1])
    assert mean_at_52_high < 30.0, f"Expected convergence toward mu=25, got {mean_at_52_high:.2f}"


def _load_current_penalty_rate() -> float:
    """Load the current year's ESC penalty rate from the JSON reference file."""
    import json
    from datetime import datetime

    json_path = Path(__file__).parent.parent / "reference_data" / "penalty_rates.json"
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
        rates = {int(y): float(r) for y, r in data["esc"]["rates"].items()}
        current_year = datetime.now().year
        return rates.get(current_year, rates[max(rates.keys())])
    except Exception:
        return 35.86  # fallback


def test_bounded_by_penalty_rate():
    """No forecast path exceeds the penalty rate."""
    params = OURegimeParams(theta=0.05, mu=27.0, sigma=2.0)
    penalty = _load_current_penalty_rate()
    paths = simulate_paths(27.0, params, penalty, n_steps=52, n_paths=3000)
    assert np.all(paths <= penalty), "Some paths exceeded the penalty rate ceiling"


def test_confidence_intervals_widen():
    """Confidence intervals widen with forecast horizon."""
    results = forecast(24.0, regime="balanced", horizons=[1, 4, 12, 26])
    widths = [(r.upper_80 - r.lower_80) for r in results]
    for i in range(1, len(widths)):
        assert widths[i] >= widths[i - 1] * 0.95, (
            f"CI width at h={results[i].horizon_weeks} ({widths[i]:.2f}) "
            f"not wider than at h={results[i-1].horizon_weeks} ({widths[i-1]:.2f})"
        )


def test_parameter_estimation_recovery():
    """MLE recovers known parameters from simulated data."""
    true_params = OURegimeParams(theta=0.10, mu=25.0, sigma=1.2)
    rng = np.random.default_rng(123)
    # Simulate a long path
    paths = simulate_paths(25.0, true_params, 50.0, n_steps=500, n_paths=1, rng=rng)
    prices = paths[0]

    estimated = estimate_ou_params(prices, dt=1.0, initial_guess=(0.05, 20.0, 0.8))

    assert abs(estimated.theta - true_params.theta) < 0.05, (
        f"theta: estimated {estimated.theta:.4f} vs true {true_params.theta}"
    )
    assert abs(estimated.mu - true_params.mu) < 3.0, (
        f"mu: estimated {estimated.mu:.4f} vs true {true_params.mu}"
    )
    assert abs(estimated.sigma - true_params.sigma) < 0.5, (
        f"sigma: estimated {estimated.sigma:.4f} vs true {true_params.sigma}"
    )


if __name__ == "__main__":
    print("Running OU bounded model tests...")
    test_mean_reversion()
    print("  [PASS] Mean reversion")
    test_bounded_by_penalty_rate()
    print("  [PASS] Bounded by penalty rate")
    test_confidence_intervals_widen()
    print("  [PASS] Confidence intervals widen")
    test_parameter_estimation_recovery()
    print("  [PASS] Parameter estimation recovery")
    print("\nAll tests passed.")

    # Demo forecast
    print("\n--- Demo: balanced regime, current price $24.00 ---")
    results = forecast(24.0, regime="balanced")
    for r in results:
        print(f"  {r.horizon_weeks:2d}w: ${r.mean:.2f}  "
              f"80%=[${r.lower_80:.2f}, ${r.upper_80:.2f}]  "
              f"95%=[${r.lower_95:.2f}, ${r.upper_95:.2f}]")
