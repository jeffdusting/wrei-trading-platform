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
# TESSA transfer velocity cross-validation (P3.4)
# ---------------------------------------------------------------------------

# Default TESSA transfer parameters (from historical TESSA registry data)
DEFAULT_TESSA_HISTORICAL_AVG_4W = 420_000  # Average 4-week transfer volume
DEFAULT_TESSA_DIVERGENCE_THRESHOLD = 0.20  # 20% above/below triggers signal


class ShadowMarketCalibrator:
    """
    Enhanced shadow market calibrator with TESSA transfer velocity
    cross-validation.
    """

    def __init__(
        self,
        inventory_csv: Optional[str] = None,
        visible_surplus: int = DEFAULT_VISIBLE_SURPLUS,
        nmg_annual_volume: int = DEFAULT_NMG_ANNUAL_VOLUME,
        market_annual_volume: int = DEFAULT_MARKET_ANNUAL_VOLUME,
        prior_shadow_fraction: float = DEFAULT_PRIOR_SHADOW_FRACTION,
        tessa_historical_avg_4w: int = DEFAULT_TESSA_HISTORICAL_AVG_4W,
    ) -> None:
        self.inventory_csv = inventory_csv
        self.visible_surplus = visible_surplus
        self.nmg_annual_volume = nmg_annual_volume
        self.market_annual_volume = market_annual_volume
        self.prior_shadow_fraction = prior_shadow_fraction
        self.tessa_historical_avg_4w = tessa_historical_avg_4w

    def _get_tessa_recent_volume(self) -> Optional[int]:
        """
        Attempt to get recent 4-week TESSA transfer volume from the
        scraper or cached data. Returns None if unavailable.
        """
        try:
            tessa_data_path = Path(__file__).parent.parent / "data" / "tessa_transfers.json"
            if tessa_data_path.exists():
                with open(tessa_data_path, "r") as f:
                    data = json.load(f)
                if "recent_4w_volume" in data:
                    return int(data["recent_4w_volume"])
        except Exception:
            pass
        return None

    def _tessa_velocity_signal(
        self, recent_4w_volume: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Compute TESSA transfer velocity signal.

        If transfer volume over last 4 weeks exceeds historical average
        by >20%, market is drawing down inventory (shadow supply shrinking).
        If >20% below, inventory is building (shadow supply growing).

        Returns:
            { "direction": "shrinking" | "growing" | "neutral",
              "velocity_ratio": float,
              "confidence": float }
        """
        volume = recent_4w_volume or self._get_tessa_recent_volume()

        if volume is None:
            return {
                "direction": "neutral",
                "velocity_ratio": 1.0,
                "confidence": 0.0,
            }

        ratio = volume / max(self.tessa_historical_avg_4w, 1)
        threshold = DEFAULT_TESSA_DIVERGENCE_THRESHOLD

        if ratio > 1.0 + threshold:
            direction = "shrinking"  # High transfers = drawing down inventory
        elif ratio < 1.0 - threshold:
            direction = "growing"    # Low transfers = inventory building
        else:
            direction = "neutral"

        # Confidence scales with how far from the neutral band
        deviation = abs(ratio - 1.0)
        confidence = min(1.0, deviation / 0.5)  # Full confidence at 50% deviation

        return {
            "direction": direction,
            "velocity_ratio": round(ratio, 4),
            "confidence": round(confidence, 4),
        }

    def _cross_validate(
        self,
        nmg_multiplier: float,
        tessa_signal: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Cross-validate the NMG-derived shadow multiplier against TESSA
        transfer velocity.

        NMG multiplier > 1.0 means shadow supply exists (inventory building).
        TESSA velocity signal indicates whether transfers are drawing down
        or building inventory.

        Returns:
            { "agrees": bool, "divergence_detected": bool,
              "divergence_severity": str | None,
              "shadow_uncertainty": float }
        """
        # NMG signal: multiplier > 1.6 suggests significant shadow supply
        nmg_direction = "growing" if nmg_multiplier > 1.2 else "shrinking"

        tessa_direction = tessa_signal["direction"]
        tessa_confidence = tessa_signal["confidence"]

        # Check for divergence
        divergence = False
        if tessa_confidence > 0.3 and tessa_direction != "neutral":
            # They diverge if NMG says growing but TESSA says shrinking, or vice versa
            if nmg_direction != tessa_direction:
                divergence = True

        # Shadow uncertainty: base 0.3, reduced by cross-validation agreement
        if tessa_confidence < 0.1:
            # No TESSA data — high uncertainty
            uncertainty = 0.5
        elif divergence:
            # Signals disagree — high uncertainty
            uncertainty = 0.6
        else:
            # Signals agree — lower uncertainty, scaled by TESSA confidence
            uncertainty = max(0.15, 0.4 - 0.25 * tessa_confidence)

        severity = None
        if divergence:
            severity = "high" if tessa_confidence > 0.6 else "medium"

        return {
            "agrees": not divergence,
            "divergence_detected": divergence,
            "divergence_severity": severity,
            "shadow_uncertainty": round(uncertainty, 4),
            "nmg_direction": nmg_direction,
            "tessa_direction": tessa_direction,
        }

    def estimate_with_cross_validation(
        self, tessa_recent_4w_volume: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Run shadow market estimation with TESSA cross-validation.

        Returns dict with shadow_multiplier, shadow_uncertainty,
        tessa_signal, cross_validation, and anomalies.
        """
        # Step 1: Run NMG calibration
        cal = calibrate(
            inventory_csv=self.inventory_csv,
            visible_surplus=self.visible_surplus,
            nmg_annual_volume=self.nmg_annual_volume,
            market_annual_volume=self.market_annual_volume,
            prior_shadow_fraction=self.prior_shadow_fraction,
        )

        # Step 2: TESSA velocity signal
        tessa_signal = self._tessa_velocity_signal(tessa_recent_4w_volume)

        # Step 3: Cross-validate
        xval = self._cross_validate(cal.nmg_shadow_multiplier, tessa_signal)

        # Step 4: Build anomalies list
        anomalies = []
        if xval["divergence_detected"]:
            anomalies.append({
                "type": "shadow_market_divergence",
                "severity": xval["divergence_severity"],
                "message": (
                    f"NMG inventory suggests shadow supply is {xval['nmg_direction']}, "
                    f"but TESSA transfers suggest it is {xval['tessa_direction']} "
                    f"(velocity ratio: {tessa_signal['velocity_ratio']:.2f})"
                ),
            })

        return {
            "shadow_multiplier": cal.nmg_shadow_multiplier,
            "shadow_uncertainty": xval["shadow_uncertainty"],
            "calibration": asdict(cal),
            "tessa_signal": tessa_signal,
            "cross_validation": xval,
            "anomalies": anomalies,
        }


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
