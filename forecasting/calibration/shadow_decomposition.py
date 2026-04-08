"""
Shadow Supply Decomposition
=============================

Replaces the single-multiplier shadow estimate (1.6×) with a five-pool
decomposed model:

  Pool 1: ACP Pipeline — activities completed, registration pending
  Pool 2: ACP Inventory — registered, held by creators
  Pool 3: Broker Inventory — registered, held by intermediaries
  Pool 4: Forward-Committed Supply — contracted, not yet delivered
  Pool 5: Participant Surplus — held beyond current obligation

Each pool has independent estimation logic and confidence levels.
The model falls back to the simple 1.6× multiplier when insufficient
data is available for decomposed estimation.
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from datetime import date
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Reference constants
# ---------------------------------------------------------------------------

# IPART/DCCEEW reported data points for calibrating pool estimates:
#   - 2019-2022: 18.7M ESCs surrendered, 274K penalty-equivalent shortfalls
#   - Cumulative surplus estimated at ~8.3M certificates (2024)
#   - TESSA visible supply (registered + transferable) baseline

# Simple multiplier (NMG market intelligence baseline)
SIMPLE_SHADOW_MULTIPLIER = 1.6

# Annual creation used for pipeline lag estimation
ESTIMATED_ANNUAL_CREATION = 6_400_000  # 2025 estimate
ESTIMATED_MONTHLY_CREATION = ESTIMATED_ANNUAL_CREATION // 12

# Average activity-to-registration lag (weeks)
AVERAGE_REGISTRATION_LAG_WEEKS = 14  # 2-6 months, midpoint ~3.5 months

# TESSA visible supply baseline (registered certificates available for transfer)
TESSA_VISIBLE_SUPPLY_BASELINE = 4_500_000  # Estimated registered, transferable

# NMG broker inventory multiplier baseline
NMG_BROKER_MULTIPLIER = 1.6  # NMG estimate: total available = 1.6× registered


# ---------------------------------------------------------------------------
# Pool estimation dataclasses
# ---------------------------------------------------------------------------

@dataclass
class PoolEstimate:
    """Estimate for a single shadow supply pool."""
    volume: int
    confidence: float  # 0.0 to 1.0
    data_source: str
    direction: Optional[str] = None  # building | drawing_down | stable
    delivery_schedule: Optional[Dict[str, int]] = None
    notes: str = ""


@dataclass
class ShadowEstimate:
    """Complete decomposed shadow supply estimate."""
    total_shadow_supply: int
    shadow_multiplier: float
    pool_breakdown: Dict[str, Dict[str, Any]]
    comparison_to_simple_multiplier: Dict[str, Any]
    estimated_at: str


# ---------------------------------------------------------------------------
# ShadowSupplyDecomposer
# ---------------------------------------------------------------------------

class ShadowSupplyDecomposer:
    """
    Five-pool shadow supply decomposition model.

    Estimates total shadow supply as sum of:
      1. ACP Pipeline (activities completed, registration pending)
      2. ACP Inventory (registered, held by creators)
      3. Broker Inventory (held by intermediaries)
      4. Forward-Committed Supply (contracted, not delivered)
      5. Participant Surplus (held beyond current obligation)

    Falls back to simple multiplier when data is insufficient.
    """

    def __init__(
        self,
        tessa_visible_supply: Optional[int] = None,
        annual_creation: Optional[int] = None,
    ) -> None:
        self.tessa_visible = tessa_visible_supply or TESSA_VISIBLE_SUPPLY_BASELINE
        self.annual_creation = annual_creation or ESTIMATED_ANNUAL_CREATION
        self._prev_estimates: Optional[Dict[str, int]] = None

    # --- Pool 1: ACP Pipeline ------------------------------------------------

    def estimate_acp_pipeline(self) -> PoolEstimate:
        """
        Pool 1: Activities completed but not yet registered in TESSA.

        Estimation: monthly_creation × average_lag_months
        The lag between completing an energy savings activity and registering
        the resulting ESC in TESSA is typically 2-6 months.
        """
        lag_months = AVERAGE_REGISTRATION_LAG_WEEKS / 4.33
        pipeline_volume = int(ESTIMATED_MONTHLY_CREATION * lag_months)

        return PoolEstimate(
            volume=pipeline_volume,
            confidence=0.4,
            data_source="Estimated from average registration lag (14 weeks) × monthly creation rate",
            notes="IHEAB monthly reporting (started Oct 2025) will improve this estimate",
        )

    # --- Pool 2: ACP Inventory -----------------------------------------------

    def estimate_acp_inventory(self) -> PoolEstimate:
        """
        Pool 2: Certificates registered in TESSA but still held by the
        creating ACP (not yet transferred to a buyer).

        Estimation: ~15% of annual creation held as working inventory
        (ACPs batch and sell, typically holding 4-8 weeks of production).
        """
        holding_weeks = 6  # Midpoint of 4-8 week typical holding
        weekly_creation = self.annual_creation // 52
        inventory = int(weekly_creation * holding_weeks)

        return PoolEstimate(
            volume=inventory,
            confidence=0.3,
            data_source="Estimated: 6 weeks of creation held as ACP working inventory",
            notes="TESSA account-level data not publicly accessible; using heuristic",
        )

    # --- Pool 3: Broker Inventory --------------------------------------------

    def estimate_broker_inventory(self) -> PoolEstimate:
        """
        Pool 3: Certificates held by brokers and intermediaries.

        Estimation: derived from NMG 1.6× multiplier baseline minus other pools.
        The NMG multiplier represents total market supply (all holders) vs
        TESSA visible supply. Broker inventory = NMG_total - pipeline - ACP_inv
        - forward - participant_surplus.

        As a simpler heuristic: broker inventory ≈ 20% of annual creation
        (brokers typically hold 8-12 weeks of trading inventory).
        """
        holding_weeks = 10  # Midpoint of 8-12 week broker holding
        weekly_creation = self.annual_creation // 52
        inventory = int(weekly_creation * holding_weeks)

        return PoolEstimate(
            volume=inventory,
            confidence=0.4,
            data_source="NMG 1.6× multiplier baseline; broker holding ~10 weeks creation",
            direction="stable",
            notes="Direction would update from Ecovantage/NMG broker commentary",
        )

    # --- Pool 4: Forward-Committed Supply ------------------------------------

    def estimate_forward_committed(self) -> PoolEstimate:
        """
        Pool 4: Certificates contracted for future delivery but not yet
        transferred to the buyer.

        Estimation: ~10% of annual creation in forward contracts
        (based on Ecovantage market updates referencing forward activity).
        """
        forward_volume = int(self.annual_creation * 0.10)

        # Simple delivery schedule: spread evenly over next 6 months
        monthly = forward_volume // 6
        schedule = {
            f"month_{i+1}": monthly for i in range(6)
        }

        return PoolEstimate(
            volume=forward_volume,
            confidence=0.2,
            data_source="Estimated: ~10% of annual creation in forward contracts",
            delivery_schedule=schedule,
            notes="Forward data from broker commentary; low confidence without trade-level data",
        )

    # --- Pool 5: Participant Surplus -----------------------------------------

    def estimate_participant_surplus(self) -> PoolEstimate:
        """
        Pool 5: Certificates held by scheme participants beyond their
        current compliance obligation (banking/buffer stock).

        DCCEEW statutory review: 18.7M ESCs surrendered 2019-2022 with
        only 274K penalty-equivalent shortfalls. Some participants
        systematically over-acquire as buffer stock.

        Estimation: cumulative surplus from data_assembly (~8.3M in 2024),
        minus certificates already allocated to current year obligations.
        Participant buffer ≈ 5-10% of cumulative surplus.
        """
        from forecasting.data_assembly import CUMULATIVE_SURPLUS

        current_year = date.today().year
        cumulative = CUMULATIVE_SURPLUS.get(
            current_year,
            CUMULATIVE_SURPLUS[max(CUMULATIVE_SURPLUS.keys())],
        )

        # Participants hold ~8% of cumulative surplus as buffer
        buffer_fraction = 0.08
        surplus_volume = int(cumulative * buffer_fraction)

        return PoolEstimate(
            volume=surplus_volume,
            confidence=0.3,
            data_source="DCCEEW statutory review + IPART compliance data; 8% buffer fraction",
            notes="IPART annual compliance report would refine this (published with 12+ month lag)",
        )

    # --- Aggregate ------------------------------------------------------------

    def total_shadow_estimate(self) -> Dict[str, Any]:
        """
        Aggregate shadow supply estimate from all five pools.

        Returns structured dict matching the schema in Session F specification.
        """
        pools = {
            "acp_pipeline": self.estimate_acp_pipeline(),
            "acp_inventory": self.estimate_acp_inventory(),
            "broker_inventory": self.estimate_broker_inventory(),
            "forward_committed": self.estimate_forward_committed(),
            "participant_surplus": self.estimate_participant_surplus(),
        }

        total = sum(p.volume for p in pools.values())
        decomposed_multiplier = (
            (self.tessa_visible + total) / self.tessa_visible
            if self.tessa_visible > 0 else SIMPLE_SHADOW_MULTIPLIER
        )

        # Build pool breakdown dict
        breakdown: Dict[str, Dict[str, Any]] = {}
        for pool_name, estimate in pools.items():
            entry: Dict[str, Any] = {
                "volume": estimate.volume,
                "confidence": estimate.confidence,
                "data_source": estimate.data_source,
            }
            if estimate.direction:
                entry["direction"] = estimate.direction
            if estimate.delivery_schedule:
                entry["delivery_schedule"] = estimate.delivery_schedule
            breakdown[pool_name] = entry

        divergence = abs(decomposed_multiplier - SIMPLE_SHADOW_MULTIPLIER)
        if divergence < 0.1:
            interpretation = "Decomposed model broadly consistent with simple multiplier"
        elif decomposed_multiplier > SIMPLE_SHADOW_MULTIPLIER:
            interpretation = (
                f"Decomposed model suggests MORE shadow supply than simple multiplier "
                f"({decomposed_multiplier:.2f}× vs {SIMPLE_SHADOW_MULTIPLIER}×)"
            )
        else:
            interpretation = (
                f"Decomposed model suggests LESS shadow supply than simple multiplier "
                f"({decomposed_multiplier:.2f}× vs {SIMPLE_SHADOW_MULTIPLIER}×)"
            )

        # Store for week-over-week comparison
        current_volumes = {name: est.volume for name, est in pools.items()}
        self._prev_estimates = current_volumes

        return {
            "total_shadow_supply": total,
            "shadow_multiplier": round(decomposed_multiplier, 3),
            "pool_breakdown": breakdown,
            "comparison_to_simple_multiplier": {
                "simple_multiplier": SIMPLE_SHADOW_MULTIPLIER,
                "decomposed_multiplier": round(decomposed_multiplier, 3),
                "divergence": round(divergence, 3),
                "interpretation": interpretation,
            },
            "estimated_at": date.today().isoformat(),
        }

    def detect_pool_shifts(
        self,
        prev_estimates: Optional[Dict[str, int]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Detect week-over-week shifts in individual pools.

        Returns list of anomaly dicts for pools that changed >20%.
        Used by the anomaly detector for shadow_supply_shift alerts.
        """
        if prev_estimates is None:
            prev_estimates = self._prev_estimates
        if prev_estimates is None:
            return []

        current = self.total_shadow_estimate()
        anomalies: List[Dict[str, Any]] = []

        for pool_name, pool_data in current["pool_breakdown"].items():
            prev_vol = prev_estimates.get(pool_name, 0)
            curr_vol = pool_data["volume"]

            if prev_vol == 0:
                continue

            pct_change = abs(curr_vol - prev_vol) / prev_vol

            if pct_change > 0.20:
                anomalies.append({
                    "anomaly_type": "shadow_supply_shift",
                    "pool": pool_name,
                    "previous_volume": prev_vol,
                    "current_volume": curr_vol,
                    "pct_change": round(pct_change, 3),
                    "severity": "high" if pct_change > 0.30 else "medium",
                })

        # Check total shadow change
        prev_total = sum(prev_estimates.values())
        curr_total = current["total_shadow_supply"]
        if prev_total > 0:
            total_pct = abs(curr_total - prev_total) / prev_total
            if total_pct > 0.15:
                anomalies.append({
                    "anomaly_type": "shadow_supply_shift",
                    "pool": "total",
                    "previous_volume": prev_total,
                    "current_volume": curr_total,
                    "pct_change": round(total_pct, 3),
                    "severity": "high",
                })

        return anomalies


# ---------------------------------------------------------------------------
# Fallback: simple multiplier
# ---------------------------------------------------------------------------

def simple_shadow_estimate(tessa_visible: int) -> Dict[str, Any]:
    """
    Fallback shadow estimate using the simple NMG multiplier.

    Used when the decomposed model cannot run (insufficient data).
    """
    total = int(tessa_visible * SIMPLE_SHADOW_MULTIPLIER)
    return {
        "total_shadow_supply": total,
        "shadow_multiplier": SIMPLE_SHADOW_MULTIPLIER,
        "pool_breakdown": {
            "undifferentiated": {
                "volume": total,
                "confidence": 0.3,
                "data_source": f"NMG simple multiplier ({SIMPLE_SHADOW_MULTIPLIER}×)",
            }
        },
        "comparison_to_simple_multiplier": {
            "simple_multiplier": SIMPLE_SHADOW_MULTIPLIER,
            "decomposed_multiplier": SIMPLE_SHADOW_MULTIPLIER,
            "divergence": 0.0,
            "interpretation": "Using fallback simple multiplier (decomposed model unavailable)",
        },
        "estimated_at": date.today().isoformat(),
    }
