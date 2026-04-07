"""
WREI-CC Tokenised Carbon Credit Pricing Model
===============================================

Derives the WREI-CC token price from an underlying carbon credit forecast
(typically ACCU or VCU), applying:
  - Verification premium (WREI dMRV adds provenance assurance)
  - Liquidity discount (token secondary market is less liquid than the underlying)
  - Basis risk adjustment (widens CIs for token/underlying divergence)

Formula:
    WREI-CC price = underlying * verification_premium * (1 - liquidity_discount)
"""

from __future__ import annotations

from typing import Any, Dict, Optional, Tuple


def forecast_wrei_cc(
    underlying_forecast: dict,
    verification_premium: float = 1.5,
    liquidity_discount: float = 0.15,
    basis_risk_adjustment: float = 0.05,
) -> dict:
    """
    Forecast WREI-CC token price from an underlying carbon credit forecast.

    Args:
        underlying_forecast: Dict with at least 'price' (float). Optionally
            includes 'ci_80' (tuple), 'ci_95' (tuple), 'price_12w' (float).
        verification_premium: Multiplier for WREI dMRV verification
            (default 1.5 = 50% premium over unverified credits).
        liquidity_discount: Discount for lower secondary market liquidity
            (default 0.15 = 15% discount).
        basis_risk_adjustment: CI widening factor for token/underlying
            price divergence risk (default 0.05 = 5%).

    Returns:
        Dict with:
            - price: WREI-CC spot forecast
            - price_12w: 12-week forecast (if available)
            - ci_80: 80% confidence interval
            - ci_95: 95% confidence interval
            - premium_applied: effective premium multiplier
            - underlying_price: original underlying price
    """
    underlying_price = underlying_forecast.get("price", 0.0)
    effective_multiplier = verification_premium * (1.0 - liquidity_discount)
    wrei_cc_price = underlying_price * effective_multiplier

    result: Dict[str, Any] = {
        "price": round(wrei_cc_price, 4),
        "premium_applied": round(effective_multiplier, 4),
        "underlying_price": underlying_price,
        "verification_premium": verification_premium,
        "liquidity_discount": liquidity_discount,
    }

    # 12-week forecast
    price_12w = underlying_forecast.get("price_12w")
    if price_12w is not None:
        result["price_12w"] = round(price_12w * effective_multiplier, 4)

    # Confidence intervals — widen by basis risk adjustment
    ci_80 = underlying_forecast.get("ci_80")
    if ci_80 is not None:
        low, high = ci_80
        midpoint = wrei_cc_price
        half_width = (high - low) / 2.0 * effective_multiplier
        widened = half_width * (1.0 + basis_risk_adjustment)
        result["ci_80"] = (
            round(midpoint - widened, 4),
            round(midpoint + widened, 4),
        )

    ci_95 = underlying_forecast.get("ci_95")
    if ci_95 is not None:
        low, high = ci_95
        midpoint = wrei_cc_price
        half_width = (high - low) / 2.0 * effective_multiplier
        widened = half_width * (1.0 + basis_risk_adjustment)
        result["ci_95"] = (
            round(midpoint - widened, 4),
            round(midpoint + widened, 4),
        )

    return result
