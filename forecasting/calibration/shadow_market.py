"""
Shadow Market Calibration
==========================

Calibrates the shadow supply estimate using NMG's actual inventory data.

The key insight: NMG's TESSA registry shows only registered certificates.
Their total inventory (registered + unregistered + committed) is larger.
The ratio (total / visible) gives a broker-specific shadow multiplier.
Scaling this to the whole market refines the state-space model's
shadow supply observation.

Usage:
    python3 calibration/shadow_market.py
    python3 calibration/shadow_market.py --inventory-csv path/to/inventory.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import numpy as np

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class ShadowCalibration:
    """Result of shadow market calibration."""
    # NMG-specific
    nmg_registered_total: int          # Visible on TESSA
    nmg_unregistered_total: int        # Pending registration
    nmg_committed_total: int           # Allocated to clients, not yet transferred
    nmg_total_inventory: int           # All holdings
    nmg_shadow_multiplier: float       # total / registered

    # Market-wide estimate
    nmg_market_share_pct: float        # NMG's share of total ESC/VEEC market
    visible_registry_surplus: int      # From public registry data
    estimated_market_shadow_supply: int
    calibrated_total_supply: int       # visible + shadow

    # Model update
    prior_shadow_estimate: int
    posterior_shadow_estimate: int
    confidence_improvement_pct: float


# ---------------------------------------------------------------------------
# Inventory analysis
# ---------------------------------------------------------------------------

def load_inventory(csv_path: str) -> List[Dict[str, Any]]:
    """Load inventory CSV into list of dicts."""
    rows = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "instrument_type": row.get("instrument_type", "").strip().upper(),
                "vintage": row.get("vintage", "").strip(),
                "quantity": int(float(row.get("quantity", "0"))),
                "average_cost": float(row.get("average_cost", "0") or "0"),
                "status": row.get("status", "registered").strip().lower(),
                "registry_reference": row.get("registry_reference", "").strip(),
            })
    return rows


def compute_nmg_inventory(inventory: List[Dict[str, Any]]) -> Dict[str, Dict[str, int]]:
    """
    Aggregate NMG inventory by instrument and status.

    Returns: { "ESC": { "registered": N, "unregistered": N, "committed": N }, ... }
    """
    result: Dict[str, Dict[str, int]] = {}
    for item in inventory:
        inst = item["instrument_type"]
        status = item["status"]
        if inst not in result:
            result[inst] = {"registered": 0, "unregistered": 0, "committed": 0}
        if status in result[inst]:
            result[inst][status] += item["quantity"]
    return result


# ---------------------------------------------------------------------------
# Shadow multiplier calculation
# ---------------------------------------------------------------------------

def compute_shadow_multiplier(
    registered: int,
    unregistered: int,
    committed: int,
) -> float:
    """
    Shadow multiplier = total_inventory / visible_inventory.

    If registered is zero, returns 1.0 (no shadow estimate possible).
    """
    total = registered + unregistered + committed
    if registered <= 0:
        return 1.0
    return total / registered


def estimate_market_shadow(
    visible_registry_surplus: int,
    nmg_shadow_multiplier: float,
    nmg_market_share_weight: float,
) -> int:
    """
    Scale NMG's shadow multiplier to the whole market.

    market_shadow_supply = visible × (nmg_multiplier ^ (1 / market_share_weight))

    The market_share_weight dampens the multiplier — if NMG holds 10% of the
    market, their shadow ratio is only partially representative.
    """
    if nmg_market_share_weight <= 0 or nmg_shadow_multiplier <= 1.0:
        return 0

    # Scale: raise multiplier to power of (1 / weight) to extrapolate
    # But cap the exponent to avoid unreasonable extrapolation
    exponent = min(1.0 / nmg_market_share_weight, 3.0)
    market_multiplier = nmg_shadow_multiplier ** exponent

    shadow = int(visible_registry_surplus * (market_multiplier - 1.0))
    return max(0, shadow)


# ---------------------------------------------------------------------------
# Main calibration
# ---------------------------------------------------------------------------

# Default market assumptions (from P10 analysis)
DEFAULT_VISIBLE_SURPLUS = 2_800_000     # ESC registry surplus (IPART data)
DEFAULT_NMG_ANNUAL_VOLUME = 450_000     # NMG's annual ESC trade volume
DEFAULT_MARKET_ANNUAL_VOLUME = 5_200_000  # Total ESC market annual volume
DEFAULT_PRIOR_SHADOW_FRACTION = 0.08    # 8% shadow fraction from state-space model


def calibrate(
    inventory_csv: Optional[str] = None,
    visible_surplus: int = DEFAULT_VISIBLE_SURPLUS,
    nmg_annual_volume: int = DEFAULT_NMG_ANNUAL_VOLUME,
    market_annual_volume: int = DEFAULT_MARKET_ANNUAL_VOLUME,
    prior_shadow_fraction: float = DEFAULT_PRIOR_SHADOW_FRACTION,
) -> ShadowCalibration:
    """
    Run full shadow market calibration.

    1. Load NMG inventory
    2. Compute shadow multiplier
    3. Estimate NMG market share
    4. Scale to market-wide shadow supply
    5. Compare with prior estimate
    """
    # Load inventory
    if inventory_csv is None:
        inventory_csv = str(
            Path(__file__).parent.parent / "data" / "sample_nmg" / "inventory.csv"
        )
    inventory = load_inventory(inventory_csv)
    by_instrument = compute_nmg_inventory(inventory)

    # Aggregate across all instruments
    total_registered = sum(d["registered"] for d in by_instrument.values())
    total_unregistered = sum(d["unregistered"] for d in by_instrument.values())
    total_committed = sum(d["committed"] for d in by_instrument.values())
    total_inventory = total_registered + total_unregistered + total_committed

    nmg_multiplier = compute_shadow_multiplier(
        total_registered, total_unregistered, total_committed
    )

    # Market share
    nmg_market_share = nmg_annual_volume / max(market_annual_volume, 1)

    # Market-wide shadow estimate
    market_shadow = estimate_market_shadow(
        visible_surplus, nmg_multiplier, nmg_market_share
    )
    calibrated_total = visible_surplus + market_shadow

    # Prior comparison
    prior_shadow = int(visible_surplus * prior_shadow_fraction)
    posterior_shadow = market_shadow

    # Confidence improvement: tighter CI from calibrated data vs prior guess
    if prior_shadow > 0:
        confidence_improvement = (1.0 - abs(posterior_shadow - prior_shadow) / prior_shadow) * 100
    else:
        confidence_improvement = 0.0

    return ShadowCalibration(
        nmg_registered_total=total_registered,
        nmg_unregistered_total=total_unregistered,
        nmg_committed_total=total_committed,
        nmg_total_inventory=total_inventory,
        nmg_shadow_multiplier=round(nmg_multiplier, 4),
        nmg_market_share_pct=round(nmg_market_share * 100, 2),
        visible_registry_surplus=visible_surplus,
        estimated_market_shadow_supply=market_shadow,
        calibrated_total_supply=calibrated_total,
        prior_shadow_estimate=prior_shadow,
        posterior_shadow_estimate=posterior_shadow,
        confidence_improvement_pct=round(confidence_improvement, 2),
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Shadow Market Calibration")
    parser.add_argument("--inventory-csv", type=str, default=None)
    args = parser.parse_args()

    print("Running shadow market calibration...\n")
    result = calibrate(inventory_csv=args.inventory_csv)

    print("=" * 60)
    print("SHADOW MARKET CALIBRATION RESULTS")
    print("=" * 60)
    print(f"\n  NMG Inventory Breakdown:")
    print(f"    Registered (TESSA):     {result.nmg_registered_total:>10,}")
    print(f"    Unregistered:           {result.nmg_unregistered_total:>10,}")
    print(f"    Committed:              {result.nmg_committed_total:>10,}")
    print(f"    Total:                  {result.nmg_total_inventory:>10,}")
    print(f"    Shadow multiplier:      {result.nmg_shadow_multiplier:>10.2f}x")
    print(f"\n  Market Estimates:")
    print(f"    NMG market share:       {result.nmg_market_share_pct:>9.1f}%")
    print(f"    Visible registry:       {result.visible_registry_surplus:>10,}")
    print(f"    Shadow supply:          {result.estimated_market_shadow_supply:>10,}")
    print(f"    Calibrated total:       {result.calibrated_total_supply:>10,}")
    print(f"\n  Model Update:")
    print(f"    Prior shadow estimate:  {result.prior_shadow_estimate:>10,}")
    print(f"    Posterior estimate:      {result.posterior_shadow_estimate:>10,}")
    print(f"    Confidence improvement: {result.confidence_improvement_pct:>9.1f}%")

    # Save results
    output_path = Path(__file__).parent.parent / "data" / "shadow_calibration.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(asdict(result), f, indent=2)
    print(f"\n  Results saved to: {output_path}")


if __name__ == "__main__":
    main()
