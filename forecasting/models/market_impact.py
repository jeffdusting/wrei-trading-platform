"""
Market Impact Model
====================

Estimates the price impact of executing a given trade volume in the
Australian environmental certificate markets.

Uses a linear impact model: the larger the trade relative to weekly
market turnover, the more the execution price deviates from the
mid-market forecast.

Impact formula:
    volume_fraction = trade_volume / weekly_market_volume
    impact = volume_fraction * IMPACT_COEFFICIENT
    adjusted_value = raw_value * (1 - impact)
"""

from __future__ import annotations

from typing import Optional


# Default weekly market volumes (certificates traded per week)
# Derived from annual creation/turnover estimates:
#   ESC: ~6.4M annual creation / 52 ≈ 123,000
#   VEEC: ~4.4M annual target / 52 ≈ 85,000
#   ACCU: ~18.8M annual issuance / 52 ≈ 362,000
#   LGC: ~3.0M annual / 52 ≈ 58,000
#   STC: ~25M annual / 52 ≈ 481,000
DEFAULT_WEEKLY_VOLUMES: dict[str, int] = {
    "ESC": 120_000,
    "VEEC": 85_000,
    "ACCU": 360_000,
    "LGC": 58_000,
    "STC": 481_000,
}

# Impact coefficient: scales the linear impact. 0.5 means a trade equal
# to the full weekly volume would move the price by 50%.
IMPACT_COEFFICIENT = 0.5


def estimate_market_impact(
    trade_volume: int,
    instrument: str,
    weekly_market_volume: Optional[int] = None,
) -> float:
    """
    Estimate the market impact coefficient for a given trade.

    Args:
        trade_volume: Number of certificates in the trade.
        instrument: Instrument code (ESC, VEEC, ACCU, LGC, STC).
        weekly_market_volume: Override for the default weekly volume.

    Returns:
        Impact coefficient between 0 and 1, where:
            0 = no impact (infinitesimal trade)
            1 = full impact (trade equals or exceeds weekly volume)
    """
    if trade_volume <= 0:
        return 0.0

    if weekly_market_volume is None:
        weekly_market_volume = DEFAULT_WEEKLY_VOLUMES.get(instrument.upper())
        if weekly_market_volume is None:
            raise ValueError(
                f"Unknown instrument '{instrument}'. "
                f"Provide weekly_market_volume or use one of: "
                f"{list(DEFAULT_WEEKLY_VOLUMES.keys())}"
            )

    if weekly_market_volume <= 0:
        return 1.0

    volume_fraction = trade_volume / weekly_market_volume
    impact = volume_fraction * IMPACT_COEFFICIENT
    return min(impact, 1.0)


def adjust_value_for_impact(
    raw_value: float,
    trade_volume: int,
    instrument: str,
    weekly_market_volume: Optional[int] = None,
) -> float:
    """
    Adjust a raw decision value (AUD) for market impact.

    Args:
        raw_value: Unadjusted decision value.
        trade_volume: Number of certificates in the trade.
        instrument: Instrument code.
        weekly_market_volume: Override for the default weekly volume.

    Returns:
        Impact-adjusted decision value.
    """
    impact = estimate_market_impact(trade_volume, instrument, weekly_market_volume)
    return raw_value * (1.0 - impact)
