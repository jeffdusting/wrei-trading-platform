"""
Supply-Side Participant Intelligence
======================================

Estimates ESC supply by tracking ACP (Accredited Certificate Provider)
creation behaviour, method-level pipelines, and concentration risk.

Data sources (see PARTICIPANT_DATA_INVENTORY.md):
  - IPART ACP Register (public, HTML on-page)
  - IPART ACP Certificate Creation Document
  - TESSA Registry of Certificates (public, searchable web interface)
  - IPART Annual Report to Minister
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import date
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Reference data: known ACPs and creation volumes
# ---------------------------------------------------------------------------
# Source: IPART ACP register and annual compliance reports
# Top 10 ACPs by estimated ESC creation volume (FY2023-24 data)

KNOWN_ACPS: List[Dict[str, Any]] = [
    {
        "name": "Ecovantage",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "IHEAB", "CLESF", "MBM"],
        "estimated_annual_creation": 1_200_000,
        "rank": 1,
        "notes": "Largest ACP, diversified across methods, also provides market updates",
    },
    {
        "name": "Energy Saving Schemes (ESS Group)",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "IHEAB", "CLESF"],
        "estimated_annual_creation": 800_000,
        "rank": 2,
        "notes": "Major residential and commercial provider",
    },
    {
        "name": "Green Energy Trading",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "CLESF", "MBM"],
        "estimated_annual_creation": 650_000,
        "rank": 3,
        "notes": "Strong in commercial lighting, exposure to CLESF phase-out",
    },
    {
        "name": "DemandManager",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "IHEAB", "PIAMV"],
        "estimated_annual_creation": 550_000,
        "rank": 4,
        "notes": "Also provides certificate pricing data, growing PIAMV capability",
    },
    {
        "name": "Energy Efficiency Certificates (EEC)",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "CLESF"],
        "estimated_annual_creation": 450_000,
        "rank": 5,
        "notes": "Mid-tier, significant CLESF exposure",
    },
    {
        "name": "Jabiru Energy",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "IHEAB"],
        "estimated_annual_creation": 400_000,
        "rank": 6,
        "notes": "Residential focused",
    },
    {
        "name": "SolarHub",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "PIAMV"],
        "estimated_annual_creation": 350_000,
        "rank": 7,
        "notes": "Solar-adjacent residential energy efficiency",
    },
    {
        "name": "Australian Energy Foundation",
        "accreditation_status": "current",
        "accredited_methods": ["HEER", "IHEAB"],
        "estimated_annual_creation": 300_000,
        "rank": 8,
        "notes": "Not-for-profit, community programs",
    },
    {
        "name": "CertificateTech",
        "accreditation_status": "current",
        "accredited_methods": ["CLESF", "MBM"],
        "estimated_annual_creation": 280_000,
        "rank": 9,
        "notes": "Heavily CLESF-dependent — high risk from method ending",
    },
    {
        "name": "Bright Spark Energy",
        "accreditation_status": "current",
        "accredited_methods": ["CLESF"],
        "estimated_annual_creation": 250_000,
        "rank": 10,
        "notes": "CLESF-only ACP — will lose all accredited methods by 31 March 2026",
    },
]


# ---------------------------------------------------------------------------
# Method-level data
# ---------------------------------------------------------------------------

# ESC creation methods with known end dates and estimated shares
ESC_METHODS: Dict[str, Dict[str, Any]] = {
    "CLESF": {
        "name": "Commercial Lighting (ESS-CLESF)",
        "end_date": date(2026, 3, 31),
        "estimated_share_2025": 0.25,
        "estimated_monthly_creation": 130_000,
        "status": "ending",
        "notes": "500k+ ESCs rush-registered in final days before closure",
    },
    "SONA": {
        "name": "Sale of New Appliances",
        "end_date": date(2025, 11, 30),
        "estimated_share_2025": 0.06,
        "estimated_monthly_creation": 30_000,
        "status": "ended",
        "notes": "Ended 30 November 2025",
    },
    "F8F9": {
        "name": "Gas Boiler Replacement (F8/F9)",
        "end_date": date(2026, 6, 30),
        "estimated_share_2025": 0.04,
        "estimated_monthly_creation": 20_000,
        "status": "ending",
        "notes": "Ending 30 June 2026",
    },
    "HEER": {
        "name": "Home Energy Efficiency Retrofits",
        "end_date": None,
        "estimated_share_2025": 0.28,
        "estimated_monthly_creation": 150_000,
        "status": "active",
        "notes": "Growing — expanding residential scope, doorknocking ban may slow",
    },
    "IHEAB": {
        "name": "In-Home Energy Audit & Build",
        "end_date": None,
        "estimated_share_2025": 0.29,
        "estimated_monthly_creation": 155_000,
        "status": "active",
        "notes": "Monthly reporting started October 2025",
    },
    "MBM": {
        "name": "Measurement-Based Method",
        "end_date": None,
        "estimated_share_2025": 0.04,
        "estimated_monthly_creation": 20_000,
        "status": "active",
        "notes": "Industrial/commercial energy monitoring",
    },
    "PIAMV": {
        "name": "Power Infrastructure & Motor Vehicle",
        "end_date": None,
        "estimated_share_2025": 0.04,
        "estimated_monthly_creation": 25_000,
        "status": "active",
        "notes": "Growing category, EV-related activities",
    },
}


# ---------------------------------------------------------------------------
# ACPRegistry
# ---------------------------------------------------------------------------

@dataclass
class ACPEntry:
    """A single Accredited Certificate Provider."""
    name: str
    accreditation_status: str  # current, cancelled, suspended
    accredited_methods: List[str]
    estimated_annual_creation: int
    rank: int
    notes: str = ""

    @property
    def only_ending_methods(self) -> bool:
        """True if all accredited methods have known end dates."""
        for method_code in self.accredited_methods:
            method_info = ESC_METHODS.get(method_code, {})
            if method_info.get("end_date") is None:
                return False
        return True

    @property
    def ending_method_exposure(self) -> float:
        """Fraction of accredited methods that are ending."""
        if not self.accredited_methods:
            return 0.0
        ending = sum(
            1 for m in self.accredited_methods
            if ESC_METHODS.get(m, {}).get("end_date") is not None
        )
        return ending / len(self.accredited_methods)


class ACPRegistry:
    """
    Registry of Accredited Certificate Providers.

    Currently initialised from embedded reference data derived from
    IPART ACP register and annual compliance reports. When IPART's
    online register becomes scrapeable, this class will load dynamically.
    """

    def __init__(self) -> None:
        self.acps: List[ACPEntry] = []
        self._load_reference_data()

    def _load_reference_data(self) -> None:
        """Load ACPs from embedded reference data."""
        for entry in KNOWN_ACPS:
            self.acps.append(ACPEntry(
                name=entry["name"],
                accreditation_status=entry["accreditation_status"],
                accredited_methods=entry["accredited_methods"],
                estimated_annual_creation=entry["estimated_annual_creation"],
                rank=entry["rank"],
                notes=entry.get("notes", ""),
            ))

    def get_active_acps(self) -> List[ACPEntry]:
        """Return only currently accredited ACPs."""
        return [a for a in self.acps if a.accreditation_status == "current"]

    def get_top_acps(self, n: int = 10) -> List[ACPEntry]:
        """Return top N ACPs by estimated creation volume."""
        return sorted(
            self.acps,
            key=lambda a: a.estimated_annual_creation,
            reverse=True,
        )[:n]

    def acps_with_only_ending_methods(self) -> List[ACPEntry]:
        """ACPs whose only accredited methods have known end dates."""
        return [a for a in self.acps if a.only_ending_methods]

    def total_estimated_creation(self) -> int:
        """Total estimated annual creation across all tracked ACPs."""
        return sum(a.estimated_annual_creation for a in self.acps)


# ---------------------------------------------------------------------------
# CreationPipelineEstimator
# ---------------------------------------------------------------------------

@dataclass
class MethodPipelineEstimate:
    """Forward creation estimate for a single method."""
    method_code: str
    method_name: str
    active_acp_count: int
    historical_monthly_creation: int
    estimated_monthly_going_forward: int
    end_date: Optional[date]
    weeks_remaining: Optional[int]
    status: str
    notes: str = ""


class CreationPipelineEstimator:
    """
    Estimates the certificate creation pipeline by method.

    Produces a 26-week forward creation schedule by method,
    accounting for known end dates and eligibility changes.
    """

    def __init__(self, registry: Optional[ACPRegistry] = None) -> None:
        self.registry = registry or ACPRegistry()

    def _active_acps_for_method(self, method_code: str) -> int:
        """Count ACPs accredited for a given method."""
        return sum(
            1 for a in self.registry.get_active_acps()
            if method_code in a.accredited_methods
        )

    def estimate_method_pipeline(
        self,
        method_code: str,
        ref_date: Optional[date] = None,
    ) -> MethodPipelineEstimate:
        """Estimate forward creation for a single method."""
        ref = ref_date or date.today()
        method = ESC_METHODS.get(method_code, {})
        if not method:
            return MethodPipelineEstimate(
                method_code=method_code,
                method_name="Unknown",
                active_acp_count=0,
                historical_monthly_creation=0,
                estimated_monthly_going_forward=0,
                end_date=None,
                weeks_remaining=None,
                status="unknown",
            )

        end = method.get("end_date")
        weeks_remaining = None
        estimated_monthly = method["estimated_monthly_creation"]

        if end and end <= ref:
            # Method has already ended
            estimated_monthly = 0
            weeks_remaining = 0
        elif end:
            days_left = (end - ref).days
            weeks_remaining = max(0, days_left // 7)
            # Ramp-down: assume creation accelerates near end (rush registrations)
            # then drops to zero
            if weeks_remaining <= 4:
                estimated_monthly = int(estimated_monthly * 1.5)  # Rush period

        return MethodPipelineEstimate(
            method_code=method_code,
            method_name=method.get("name", method_code),
            active_acp_count=self._active_acps_for_method(method_code),
            historical_monthly_creation=method["estimated_monthly_creation"],
            estimated_monthly_going_forward=estimated_monthly,
            end_date=end,
            weeks_remaining=weeks_remaining,
            status=method.get("status", "active"),
        )

    def forward_creation_schedule(
        self,
        horizon_weeks: int = 26,
        ref_date: Optional[date] = None,
    ) -> List[Dict[str, Any]]:
        """
        Produce a week-by-week forward creation schedule.

        Returns list of dicts: [{week: 1, total: N, by_method: {...}}, ...]
        """
        ref = ref_date or date.today()
        schedule: List[Dict[str, Any]] = []

        for week in range(1, horizon_weeks + 1):
            week_date = ref + __import__("datetime").timedelta(weeks=week)
            week_total = 0
            by_method: Dict[str, int] = {}

            for method_code in ESC_METHODS:
                method = ESC_METHODS[method_code]
                end = method.get("end_date")
                monthly = method["estimated_monthly_creation"]

                if end and week_date > end:
                    weekly_est = 0
                elif end:
                    days_to_end = (end - week_date).days
                    if days_to_end <= 28:
                        weekly_est = int(monthly * 1.5 / 4.33)  # Rush
                    else:
                        weekly_est = int(monthly / 4.33)
                else:
                    weekly_est = int(monthly / 4.33)

                by_method[method_code] = weekly_est
                week_total += weekly_est

            schedule.append({
                "week": week,
                "week_date": week_date.isoformat(),
                "total_creation": week_total,
                "by_method": by_method,
            })

        return schedule

    def total_26w_creation_estimate(
        self,
        ref_date: Optional[date] = None,
    ) -> int:
        """Total estimated ESC creation over next 26 weeks."""
        schedule = self.forward_creation_schedule(26, ref_date)
        return sum(w["total_creation"] for w in schedule)

    def methods_ending_within_26w(
        self,
        ref_date: Optional[date] = None,
    ) -> int:
        """Count of methods with end dates within 26 weeks of ref_date."""
        ref = ref_date or date.today()
        cutoff = ref + __import__("datetime").timedelta(weeks=26)
        count = 0
        for method in ESC_METHODS.values():
            end = method.get("end_date")
            if end and ref < end <= cutoff:
                count += 1
        return count


# ---------------------------------------------------------------------------
# ACPConcentrationAnalyser
# ---------------------------------------------------------------------------

class ACPConcentrationAnalyser:
    """
    Analyses ACP concentration risk — if a small number of ACPs produce
    a disproportionate share of creation, single ACP exits become
    material supply shocks.
    """

    def __init__(self, registry: Optional[ACPRegistry] = None) -> None:
        self.registry = registry or ACPRegistry()

    def top_n_creation_share(self, n: int = 5) -> float:
        """Share of total creation by top N ACPs."""
        total = self.registry.total_estimated_creation()
        if total == 0:
            return 0.0
        top = self.registry.get_top_acps(n)
        top_total = sum(a.estimated_annual_creation for a in top)
        return top_total / total

    def method_concentration(self, method_code: str) -> Dict[str, Any]:
        """
        Concentration of creation within a method.

        Returns: {top3_share, top3_names, vulnerability}
        """
        acps_in_method = [
            a for a in self.registry.get_active_acps()
            if method_code in a.accredited_methods
        ]

        if not acps_in_method:
            return {"top3_share": 0.0, "top3_names": [], "vulnerability": "unknown"}

        total = sum(a.estimated_annual_creation for a in acps_in_method)
        if total == 0:
            return {"top3_share": 0.0, "top3_names": [], "vulnerability": "unknown"}

        top3 = sorted(acps_in_method, key=lambda a: a.estimated_annual_creation, reverse=True)[:3]
        top3_total = sum(a.estimated_annual_creation for a in top3)
        top3_share = top3_total / total

        if top3_share > 0.60:
            vulnerability = "high"
        elif top3_share > 0.40:
            vulnerability = "medium"
        else:
            vulnerability = "low"

        return {
            "top3_share": top3_share,
            "top3_names": [a.name for a in top3],
            "vulnerability": vulnerability,
        }

    def supply_vulnerability_score(self) -> str:
        """
        Overall supply vulnerability: high, medium, or low.

        High = top 3 ACPs produce >60% of creation in any single active method.
        Medium = top 3 produce 40–60%.
        Low = top 3 produce <40%.
        """
        worst = "low"
        for method_code, method_info in ESC_METHODS.items():
            if method_info.get("status") not in ("active", "ending"):
                continue
            conc = self.method_concentration(method_code)
            v = conc["vulnerability"]
            if v == "high":
                return "high"
            if v == "medium":
                worst = "medium"
        return worst

    def get_xgboost_features(
        self,
        ref_date: Optional[date] = None,
    ) -> Dict[str, float]:
        """
        Return supply-side features for XGBoost integration.

        Features:
          - top10_acp_creation_share
          - active_acp_count
          - methods_ending_within_26w
          - creation_pipeline_26w_total
          - supply_vulnerability_score (encoded: high=3, medium=2, low=1)
        """
        pipeline = CreationPipelineEstimator(self.registry)

        vuln_map = {"high": 3.0, "medium": 2.0, "low": 1.0}

        return {
            "top10_acp_creation_share": self.top_n_creation_share(10),
            "active_acp_count": float(len(self.registry.get_active_acps())),
            "methods_ending_within_26w": float(pipeline.methods_ending_within_26w(ref_date)),
            "creation_pipeline_26w_total": float(pipeline.total_26w_creation_estimate(ref_date)),
            "supply_vulnerability_score": vuln_map.get(self.supply_vulnerability_score(), 1.0),
        }
