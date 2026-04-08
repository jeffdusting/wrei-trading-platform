"""
Demand-Side Participant Intelligence
======================================

Estimates ESC demand by tracking scheme participant (electricity retailer)
behaviour. Uses IPART published data, retailer annual reports, and media
signals to forecast aggregate and per-retailer ESC obligation and
procurement patterns.

Data sources (see PARTICIPANT_DATA_INVENTORY.md):
  - IPART Individual Energy Savings Targets (annual, public)
  - IPART Annual Compliance Report to Minister
  - IPART NSW Retail Electricity Market Report
  - Retailer annual reports (ORG, AGL, CLP)
  - AER Annual Retail Markets Report
"""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import requests

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Reference data: top scheme participants and estimated market shares
# ---------------------------------------------------------------------------
# Source: IPART NSW Retail Electricity Market Report 2024-25
# The "Big 3" hold ~74% of NSW small customer load.
# Remaining ~26% split among ~30+ smaller retailers.

KNOWN_PARTICIPANTS: List[Dict[str, Any]] = [
    {
        "name": "Origin Energy",
        "entity_type": "retailer",
        "asx_code": "ORG",
        "parent_company": None,
        "estimated_nsw_market_share": 0.27,
        "tier": 1,
        "total_customers_national": 4_700_000,
        "notes": "Tier 1 liable entity, FY2025 4.7M customers nationally",
    },
    {
        "name": "AGL Energy",
        "entity_type": "retailer",
        "asx_code": "AGL",
        "parent_company": None,
        "estimated_nsw_market_share": 0.25,
        "tier": 1,
        "total_customers_national": 4_500_000,
        "notes": "Tier 1, met ESS targets every year since inception (per AGL ESS/PDRS submission)",
    },
    {
        "name": "EnergyAustralia",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": "CLP Holdings (HK:0002)",
        "estimated_nsw_market_share": 0.22,
        "tier": 1,
        "total_customers_national": 1_600_000,
        "notes": "Tier 1, subsidiary of CLP Holdings, EBITDAF A$690M (2025)",
    },
    {
        "name": "Alinta Energy",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": "Chow Tai Fook Enterprises",
        "estimated_nsw_market_share": 0.06,
        "tier": 2,
        "total_customers_national": 1_100_000,
        "notes": "Growing NSW presence, no ESS-specific public disclosure",
    },
    {
        "name": "Red Energy",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": "Snowy Hydro (Commonwealth-owned)",
        "estimated_nsw_market_share": 0.05,
        "tier": 2,
        "total_customers_national": 500_000,
        "notes": "Shares Snowy Hydro parent with Lumo Energy",
    },
    {
        "name": "Lumo Energy",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": "Snowy Hydro (Commonwealth-owned)",
        "estimated_nsw_market_share": 0.03,
        "tier": 2,
        "total_customers_national": 300_000,
        "notes": "Shares Snowy Hydro parent with Red Energy",
    },
    {
        "name": "Momentum Energy",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": "Hydro Tasmania (Tasmanian Government)",
        "estimated_nsw_market_share": 0.02,
        "tier": 3,
        "total_customers_national": 150_000,
        "notes": "Small NSW presence, government-owned parent",
    },
    {
        "name": "Enova Energy",
        "entity_type": "retailer",
        "asx_code": None,
        "parent_company": None,
        "estimated_nsw_market_share": 0.01,
        "tier": 3,
        "total_customers_national": 12_000,
        "notes": "Community-owned retailer, Northern Rivers NSW",
    },
]


# ---------------------------------------------------------------------------
# ESS Scheme target data (from Electricity Supply Act Schedule 5)
# ---------------------------------------------------------------------------

# Annual ESS energy savings targets (GWh) — from Schedule 5
# These are the aggregate scheme targets; individual retailer targets are
# proportional to their liable acquisitions (MWh of NSW electricity sales).
ESS_ANNUAL_TARGETS: Dict[int, Dict[str, Any]] = {
    2023: {"target_gwh": 8.5, "energy_conversion_factor": 1.0, "esc_target_million": 5.8},
    2024: {"target_gwh": 9.0, "energy_conversion_factor": 1.0, "esc_target_million": 6.1},
    2025: {"target_gwh": 9.5, "energy_conversion_factor": 1.0, "esc_target_million": 6.4},
    2026: {"target_gwh": 10.0, "energy_conversion_factor": 1.0, "esc_target_million": 6.8},
}

# Surrender deadlines (ESS compliance year runs calendar year,
# surrender deadline is 30 June of the following year)
SURRENDER_DEADLINES = [
    {"compliance_year": 2025, "surrender_date": date(2026, 6, 30)},
    {"compliance_year": 2026, "surrender_date": date(2027, 6, 30)},
]


# ---------------------------------------------------------------------------
# SchemeParticipantRegistry
# ---------------------------------------------------------------------------

@dataclass
class SchemeParticipant:
    """A single ESS scheme participant (electricity retailer)."""
    name: str
    entity_type: str
    asx_code: Optional[str]
    parent_company: Optional[str]
    estimated_nsw_market_share: float
    tier: int
    total_customers_national: int
    notes: str = ""
    financial_stress_signals: List[Dict[str, Any]] = field(default_factory=list)


class SchemeParticipantRegistry:
    """
    Registry of ESS scheme participants with estimated market shares
    and obligation data.

    Currently initialised from embedded reference data derived from:
      - IPART NSW Retail Electricity Market Report 2024-25
      - Retailer annual reports (ORG, AGL, CLP)
      - AER Annual Retail Markets Report 2024-25

    When IPART's online participant list becomes scrapeable (requires
    Playwright for JS-rendered content), this class will load dynamically.
    """

    def __init__(self) -> None:
        self.participants: List[SchemeParticipant] = []
        self._load_reference_data()

    def _load_reference_data(self) -> None:
        """Load participants from embedded reference data."""
        for entry in KNOWN_PARTICIPANTS:
            self.participants.append(SchemeParticipant(
                name=entry["name"],
                entity_type=entry["entity_type"],
                asx_code=entry.get("asx_code"),
                parent_company=entry.get("parent_company"),
                estimated_nsw_market_share=entry["estimated_nsw_market_share"],
                tier=entry["tier"],
                total_customers_national=entry["total_customers_national"],
                notes=entry.get("notes", ""),
            ))

    def get_top_participants(self, n: int = 5) -> List[SchemeParticipant]:
        """Return top N participants by estimated market share."""
        return sorted(
            self.participants,
            key=lambda p: p.estimated_nsw_market_share,
            reverse=True,
        )[:n]

    def total_tracked_market_share(self) -> float:
        """Sum of tracked participants' market share."""
        return sum(p.estimated_nsw_market_share for p in self.participants)


# ---------------------------------------------------------------------------
# RetailerObligationEstimator
# ---------------------------------------------------------------------------

@dataclass
class ObligationEstimate:
    """Estimated ESC obligation for a single retailer in a given year."""
    participant_name: str
    compliance_year: int
    estimated_liable_acquisitions_mwh: float
    energy_conversion_factor: float
    estimated_esc_obligation: int
    surrender_deadline: date
    confidence: float  # 0–1
    data_source: str


class RetailerObligationEstimator:
    """
    Estimates each retailer's annual ESC obligation from public data.

    Methodology:
      obligation = liable_acquisitions_MWh × energy_conversion_factor × scheme_target_ratio

    Where liable acquisitions are estimated from:
      (a) Market share × total NSW electricity consumption (~70 TWh/yr)
      (b) Cross-referenced against IPART compliance reports where available
    """

    # Total NSW annual electricity consumption (MWh) — from AEMO NEM data
    NSW_ANNUAL_CONSUMPTION_MWH = 70_000_000  # ~70 TWh

    def __init__(
        self,
        registry: Optional[SchemeParticipantRegistry] = None,
    ) -> None:
        self.registry = registry or SchemeParticipantRegistry()

    def estimate_obligation(
        self,
        participant: SchemeParticipant,
        compliance_year: int,
    ) -> ObligationEstimate:
        """Estimate a single retailer's ESC obligation for a given year."""
        target_data = ESS_ANNUAL_TARGETS.get(compliance_year, ESS_ANNUAL_TARGETS[max(ESS_ANNUAL_TARGETS.keys())])
        total_esc_target = int(target_data["esc_target_million"] * 1_000_000)

        # Estimate liable acquisitions from market share
        liable_mwh = self.NSW_ANNUAL_CONSUMPTION_MWH * participant.estimated_nsw_market_share

        # Individual obligation is proportional to market share
        estimated_obligation = int(total_esc_target * participant.estimated_nsw_market_share)

        # Find surrender deadline
        surrender = date(compliance_year + 1, 6, 30)
        for dl in SURRENDER_DEADLINES:
            if dl["compliance_year"] == compliance_year:
                surrender = dl["surrender_date"]
                break

        return ObligationEstimate(
            participant_name=participant.name,
            compliance_year=compliance_year,
            estimated_liable_acquisitions_mwh=liable_mwh,
            energy_conversion_factor=target_data["energy_conversion_factor"],
            estimated_esc_obligation=estimated_obligation,
            surrender_deadline=surrender,
            confidence=0.6,  # Moderate — based on market share estimates
            data_source="IPART market share + ESS Schedule 5 targets",
        )

    def estimate_all_obligations(
        self,
        compliance_year: int,
    ) -> List[ObligationEstimate]:
        """Estimate obligations for all tracked participants."""
        return [
            self.estimate_obligation(p, compliance_year)
            for p in self.registry.participants
        ]

    def aggregate_demand_by_quarter(
        self,
        compliance_year: int,
    ) -> Dict[str, int]:
        """
        Estimate quarterly ESC demand, accounting for surrender deadlines.

        Procurement pattern:
          Q1-Q2: ~20% (early compliance, large retailers)
          Q3:    ~30% (mid-year procurement ramp)
          Q4:    ~50% (deadline-driven purchasing)
        """
        obligations = self.estimate_all_obligations(compliance_year)
        total = sum(o.estimated_esc_obligation for o in obligations)

        return {
            "Q1": int(total * 0.10),
            "Q2": int(total * 0.10),
            "Q3": int(total * 0.30),
            "Q4": int(total * 0.50),
        }

    def obligation_concentration_hhi(
        self,
        compliance_year: int,
    ) -> float:
        """
        Herfindahl-Hirschman Index of obligation distribution.

        HHI ranges from 0 (perfectly distributed) to 10,000 (monopoly).
        Values above 2,500 indicate high concentration.
        """
        obligations = self.estimate_all_obligations(compliance_year)
        total = sum(o.estimated_esc_obligation for o in obligations)
        if total == 0:
            return 0.0
        shares = [(o.estimated_esc_obligation / total) * 100 for o in obligations]
        return sum(s ** 2 for s in shares)

    def days_to_next_surrender_deadline(self, ref_date: Optional[date] = None) -> int:
        """Days from ref_date to the next ESC surrender deadline (30 June)."""
        ref = ref_date or date.today()
        year = ref.year
        deadline = date(year, 6, 30)
        if ref > deadline:
            deadline = date(year + 1, 6, 30)
        return (deadline - ref).days

    def retailer_stress_signal_count(self) -> int:
        """Count retailers showing financial stress signals."""
        return sum(
            1 for p in self.registry.participants
            if p.financial_stress_signals
        )

    def get_xgboost_features(
        self,
        compliance_year: int,
        ref_date: Optional[date] = None,
    ) -> Dict[str, float]:
        """
        Return demand-side features for XGBoost integration.

        Features:
          - top5_retailer_obligation_total
          - obligation_concentration_hhi
          - days_to_next_surrender_deadline
          - retailer_stress_signal_count
          - demand_media_signal_score
        """
        top5 = self.registry.get_top_participants(5)
        top5_obligations = [self.estimate_obligation(p, compliance_year) for p in top5]
        top5_total = sum(o.estimated_esc_obligation for o in top5_obligations)

        return {
            "top5_retailer_obligation_total": float(top5_total),
            "obligation_concentration_hhi": self.obligation_concentration_hhi(compliance_year),
            "days_to_next_surrender_deadline": float(self.days_to_next_surrender_deadline(ref_date)),
            "retailer_stress_signal_count": float(self.retailer_stress_signal_count()),
            "demand_media_signal_score": 0.0,  # Updated by RetailerMediaMonitor
        }


# ---------------------------------------------------------------------------
# RetailerMediaMonitor
# ---------------------------------------------------------------------------

@dataclass
class ParticipantSignal:
    """Structured signal from media monitoring."""
    participant_name: str
    signal_type: str  # demand_increase | demand_decrease | penalty_preference | compliance_surplus
    estimated_volume_impact: int  # certificates affected
    confidence: float
    source: str
    published_date: str


class RetailerMediaMonitor:
    """
    Monitors public media and ASX announcements for ESC-relevant signals
    from top retailers.

    Keywords monitored: ESS, energy savings, certificate, surrender,
    compliance, penalty, renewable, NSW retail, customer growth,
    customer loss, market exit.

    In production, this would scrape ASX announcements and news feeds.
    Currently provides a framework with manual signal injection.
    """

    KEYWORDS = [
        "ESS", "energy savings", "certificate", "surrender",
        "compliance", "penalty", "renewable", "NSW retail",
        "customer growth", "customer loss", "market exit",
    ]

    def __init__(self) -> None:
        self.signals: List[ParticipantSignal] = []

    def add_signal(self, signal: ParticipantSignal) -> None:
        """Manually inject a signal (for testing or manual intelligence)."""
        self.signals.append(signal)

    def get_active_signals(
        self,
        lookback_days: int = 90,
    ) -> List[ParticipantSignal]:
        """Return signals from the last N days."""
        cutoff = (date.today() - timedelta(days=lookback_days)).isoformat()
        return [s for s in self.signals if s.published_date >= cutoff]

    def net_demand_signal_score(self, lookback_days: int = 90) -> float:
        """
        Net demand signal score from media monitoring.

        Positive = demand increasing signals dominate.
        Negative = demand decreasing / penalty preference signals dominate.
        Range: approximately -1.0 to +1.0.
        """
        active = self.get_active_signals(lookback_days)
        if not active:
            return 0.0

        score = 0.0
        for s in active:
            if s.signal_type == "demand_increase":
                score += s.confidence
            elif s.signal_type == "demand_decrease":
                score -= s.confidence
            elif s.signal_type == "penalty_preference":
                score -= s.confidence * 0.5  # Penalty preference reduces demand
            elif s.signal_type == "compliance_surplus":
                score -= s.confidence * 0.3  # Surplus indicates lower urgency

        # Normalise to [-1, 1]
        if abs(score) > 1.0:
            score = score / abs(score)
        return score
