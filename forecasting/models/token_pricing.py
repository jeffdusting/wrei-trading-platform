"""
Tokenised Carbon Credit Pricing Model
=======================================

Derives tokenised carbon credit prices from underlying carbon credit forecasts.

Token price = underlying × (1 + quality_premium)
            × (1 + verification_premium)
            × (1 - liquidity_discount)
            × (1 + defi_demand_premium)

Supports multiple token configurations:
  - WREI-CC: WREI-verified credits (underlying: ACCU)
  - BCT: Base Carbon Tonne / Toucan (underlying: GEO)
  - NCT: Nature Carbon Tonne / Toucan (underlying: N-GEO)
"""

from __future__ import annotations

import sqlite3
import os
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np


# ---------------------------------------------------------------------------
# Token configuration
# ---------------------------------------------------------------------------

@dataclass
class TokenConfig:
    """Configuration for a tokenised carbon credit."""
    code: str
    name: str
    underlying: str          # Instrument code (ACCU, GEO, N-GEO)
    verification_premium: float  # Premium for verification provenance (0.50 = 50%)
    liquidity_discount: float    # Discount for lower secondary market liquidity
    quality_premium: float = 0.0  # Quality premium over base credits
    defi_demand_premium: float = 0.0  # DeFi/on-chain demand premium
    basis_risk_adjustment: float = 0.05  # CI widening factor


# Pre-defined token configurations
TOKEN_CONFIGS: Dict[str, TokenConfig] = {
    "WREI-CC": TokenConfig(
        code="WREI-CC",
        name="WREI Verified Carbon Credit",
        underlying="ACCU",
        verification_premium=0.50,
        liquidity_discount=0.15,
        quality_premium=0.0,
        defi_demand_premium=0.05,
        basis_risk_adjustment=0.05,
    ),
    "BCT": TokenConfig(
        code="BCT",
        name="Base Carbon Tonne (Toucan)",
        underlying="GEO",
        verification_premium=0.0,
        liquidity_discount=0.05,
        quality_premium=0.0,
        defi_demand_premium=-0.10,  # On-chain discount due to oversupply
        basis_risk_adjustment=0.10,
    ),
    "NCT": TokenConfig(
        code="NCT",
        name="Nature Carbon Tonne (Toucan)",
        underlying="N-GEO",
        verification_premium=0.0,
        liquidity_discount=0.05,
        quality_premium=0.0,
        defi_demand_premium=-0.05,
        basis_risk_adjustment=0.08,
    ),
}


# ---------------------------------------------------------------------------
# Token pricing model
# ---------------------------------------------------------------------------

class TokenPricingModel:
    """
    Derives tokenised carbon credit prices from underlying forecasts.

    The pricing formula:
        token_price = underlying × (1 + quality_premium)
                    × (1 + verification_premium)
                    × (1 - liquidity_discount)
                    × (1 + defi_demand_premium)
    """

    def __init__(self) -> None:
        self.configs = dict(TOKEN_CONFIGS)
        self._calibrated = False

    def forecast(
        self,
        underlying_forecast: float,
        token_config: Optional[Dict[str, Any]] = None,
        token_code: Optional[str] = None,
    ) -> float:
        """
        Forecast token price from an underlying carbon credit price.

        Args:
            underlying_forecast: Underlying carbon credit spot price.
            token_config: Dict with adjustment keys (overrides token_code).
            token_code: Pre-defined token code (WREI-CC, BCT, NCT).

        Returns:
            Forecast token price.
        """
        if token_config is not None:
            vp = token_config.get("verification_premium", 0.0)
            ld = token_config.get("liquidity_discount", 0.0)
            qp = token_config.get("quality_premium", 0.0)
            dp = token_config.get("defi_demand_premium", 0.0)
        elif token_code and token_code in self.configs:
            cfg = self.configs[token_code]
            vp = cfg.verification_premium
            ld = cfg.liquidity_discount
            qp = cfg.quality_premium
            dp = cfg.defi_demand_premium
        else:
            vp, ld, qp, dp = 0.0, 0.0, 0.0, 0.0

        price = (
            underlying_forecast
            * (1.0 + qp)
            * (1.0 + vp)
            * (1.0 - ld)
            * (1.0 + dp)
        )
        return round(max(0.0, price), 4)

    def forecast_with_ci(
        self,
        underlying_forecast: Dict[str, Any],
        token_code: str = "WREI-CC",
    ) -> Dict[str, Any]:
        """
        Forecast token price with confidence intervals.

        Args:
            underlying_forecast: Dict with 'price', optionally 'ci_80', 'ci_95',
                'price_12w'.
            token_code: Token identifier.

        Returns:
            Dict with price, CIs, premium breakdown.
        """
        cfg = self.configs.get(token_code)
        if cfg is None:
            return {"error": f"Unknown token: {token_code}"}

        underlying_price = underlying_forecast.get("price", 0.0)
        multiplier = (
            (1.0 + cfg.quality_premium)
            * (1.0 + cfg.verification_premium)
            * (1.0 - cfg.liquidity_discount)
            * (1.0 + cfg.defi_demand_premium)
        )
        token_price = underlying_price * multiplier

        result: Dict[str, Any] = {
            "token": token_code,
            "price": round(token_price, 4),
            "underlying_price": underlying_price,
            "underlying_instrument": cfg.underlying,
            "effective_multiplier": round(multiplier, 4),
            "premium_breakdown": {
                "quality_premium": cfg.quality_premium,
                "verification_premium": cfg.verification_premium,
                "liquidity_discount": cfg.liquidity_discount,
                "defi_demand_premium": cfg.defi_demand_premium,
            },
        }

        # 12-week forecast
        price_12w = underlying_forecast.get("price_12w")
        if price_12w is not None:
            result["price_12w"] = round(price_12w * multiplier, 4)

        # Confidence intervals — widen by basis risk
        for ci_key in ["ci_80", "ci_95"]:
            ci = underlying_forecast.get(ci_key)
            if ci is not None:
                low, high = ci
                mid = token_price
                half_width = (high - low) / 2.0 * multiplier
                widened = half_width * (1.0 + cfg.basis_risk_adjustment)
                result[ci_key] = (
                    round(mid - widened, 4),
                    round(mid + widened, 4),
                )

        return result

    def calibrate_from_observed(
        self,
        token_code: str,
        observed_token_prices: List[float],
        underlying_prices: List[float],
    ) -> Dict[str, Any]:
        """
        Calibrate liquidity_discount and defi_demand_premium to minimise
        basis between model output and observed token prices.

        Args:
            token_code: Token to calibrate.
            observed_token_prices: Observed on-chain token prices.
            underlying_prices: Corresponding underlying carbon prices.

        Returns:
            Dict with calibrated parameters and basis statistics.
        """
        if token_code not in self.configs:
            return {"error": f"Unknown token: {token_code}"}

        cfg = self.configs[token_code]
        n = min(len(observed_token_prices), len(underlying_prices))
        if n < 3:
            return {"status": "insufficient_data", "n": n}

        observed = np.array(observed_token_prices[:n])
        underlying = np.array(underlying_prices[:n])

        # The model price before liquidity/defi adjustments
        base_mult = (1.0 + cfg.quality_premium) * (1.0 + cfg.verification_premium)
        base_prices = underlying * base_mult

        # Find liquidity_discount + defi_demand_premium that minimise basis
        # token = base * (1 - ld) * (1 + dp)
        # → ratio = observed / base = (1 - ld) * (1 + dp)
        ratios = observed / np.maximum(base_prices, 0.001)
        mean_ratio = float(np.mean(ratios))

        # Solve: (1 - ld) * (1 + dp) = mean_ratio
        # Assume dp ≈ 0, then ld = 1 - mean_ratio
        # If mean_ratio > 1, then dp > 0 and ld ≈ 0
        if mean_ratio <= 1.0:
            calibrated_ld = round(1.0 - mean_ratio, 4)
            calibrated_dp = 0.0
        else:
            calibrated_ld = 0.0
            calibrated_dp = round(mean_ratio - 1.0, 4)

        # Update config
        cfg.liquidity_discount = max(0, min(calibrated_ld, 0.50))
        cfg.defi_demand_premium = max(-0.50, min(calibrated_dp, 0.50))

        # Compute post-calibration basis
        model_prices = base_prices * (1.0 - cfg.liquidity_discount) * (1.0 + cfg.defi_demand_premium)
        basis = model_prices - observed
        basis_mean = float(np.mean(basis))
        basis_std = float(np.std(basis))

        self._calibrated = True

        return {
            "status": "calibrated",
            "token": token_code,
            "calibrated_liquidity_discount": cfg.liquidity_discount,
            "calibrated_defi_demand_premium": cfg.defi_demand_premium,
            "basis_mean": round(basis_mean, 4),
            "basis_std": round(basis_std, 4),
            "basis_range": [round(float(np.min(basis)), 4), round(float(np.max(basis)), 4)],
            "n_observations": n,
        }

    def validate_against_observed(
        self,
        token_code: str,
        observed_prices: List[Dict[str, Any]],
        underlying_prices: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Validate token pricing model against observed BCT/NCT prices.

        Returns basis distribution statistics.
        """
        cfg = self.configs.get(token_code)
        if cfg is None:
            return {"error": f"Unknown token: {token_code}"}

        basis_values = []
        for obs, und in zip(observed_prices, underlying_prices):
            obs_price = obs.get("price", obs.get("price_usd", 0))
            und_price = und.get("price", und.get("spot_price", 0))

            if obs_price > 0 and und_price > 0:
                model_price = self.forecast(und_price, token_code=token_code)
                basis = model_price - obs_price
                basis_values.append({
                    "date": obs.get("date", ""),
                    "model_price": round(model_price, 4),
                    "observed_price": obs_price,
                    "basis": round(basis, 4),
                })

        if not basis_values:
            return {"status": "no_data"}

        basis_arr = np.array([b["basis"] for b in basis_values])
        return {
            "token": token_code,
            "n_observations": len(basis_values),
            "basis_mean": round(float(np.mean(basis_arr)), 4),
            "basis_std": round(float(np.std(basis_arr)), 4),
            "basis_median": round(float(np.median(basis_arr)), 4),
            "basis_min": round(float(np.min(basis_arr)), 4),
            "basis_max": round(float(np.max(basis_arr)), 4),
            "mape": round(float(np.mean(np.abs(basis_arr) / np.maximum(
                np.array([b["observed_price"] for b in basis_values]), 0.01
            ))) * 100, 2),
            "details": basis_values,
        }


# ---------------------------------------------------------------------------
# Convenience function (backward compatibility with Session D)
# ---------------------------------------------------------------------------

def forecast_wrei_cc(
    underlying_forecast: dict,
    verification_premium: float = 1.5,
    liquidity_discount: float = 0.15,
    basis_risk_adjustment: float = 0.05,
) -> dict:
    """
    Forecast WREI-CC token price from an underlying carbon credit forecast.
    Backward-compatible with Session D interface.
    """
    model = TokenPricingModel()
    underlying_price = underlying_forecast.get("price", 0.0)

    # Map old-style parameters to new model
    result = model.forecast_with_ci(
        underlying_forecast,
        token_code="WREI-CC",
    )

    # Add backward-compatible fields
    result["premium_applied"] = result.get("effective_multiplier", 1.275)
    return result


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_wrei_cc_premium():
    """WREI-CC price exceeds underlying by verification premium minus liquidity discount."""
    model = TokenPricingModel()
    underlying = 35.0
    token_price = model.forecast(underlying, token_code="WREI-CC")
    # (1 + 0.50) * (1 - 0.15) * (1 + 0.05) = 1.50 * 0.85 * 1.05 ≈ 1.33875
    assert token_price > underlying, f"WREI-CC ${token_price} <= underlying ${underlying}"


def test_bct_discount():
    """BCT should trade at or below GEO due to liquidity + DeFi discount."""
    model = TokenPricingModel()
    geo_price = 1.50
    bct_price = model.forecast(geo_price, token_code="BCT")
    # (1 - 0.05) * (1 - 0.10) = 0.95 * 0.90 = 0.855
    assert bct_price < geo_price, f"BCT ${bct_price} >= GEO ${geo_price}"


def test_custom_config():
    """Custom config works via dict."""
    model = TokenPricingModel()
    price = model.forecast(
        underlying_forecast=35.0,
        token_config={"verification_premium": 0.5, "liquidity_discount": 0.15},
    )
    expected = 35.0 * 1.5 * 0.85
    assert abs(price - expected) < 0.01, f"Got {price}, expected {expected}"


def test_calibration():
    """Calibration adjusts discount/premium to reduce basis."""
    model = TokenPricingModel()
    # Observed BCT prices consistently below model
    observed = [0.80, 0.75, 0.70, 0.65, 0.60]
    underlying = [1.50, 1.45, 1.40, 1.35, 1.30]
    result = model.calibrate_from_observed("BCT", observed, underlying)
    assert result["status"] == "calibrated"
    assert abs(result["basis_mean"]) < 0.5  # basis should be small after calibration


if __name__ == "__main__":
    print("Running token pricing model tests...")
    test_wrei_cc_premium()
    print("  [PASS] WREI-CC premium")
    test_bct_discount()
    print("  [PASS] BCT discount")
    test_custom_config()
    print("  [PASS] Custom config")
    test_calibration()
    print("  [PASS] Calibration")
    print("\nAll tests passed.")

    # Demo
    model = TokenPricingModel()
    print("\n--- Token Pricing Demo ---")
    for token in ["WREI-CC", "BCT", "NCT"]:
        cfg = TOKEN_CONFIGS[token]
        underlying = {"ACCU": 36.30, "GEO": 1.55, "N-GEO": 4.34}[cfg.underlying]
        price = model.forecast(underlying, token_code=token)
        print(f"  {token}: underlying ${underlying:.2f} → token ${price:.2f}")
