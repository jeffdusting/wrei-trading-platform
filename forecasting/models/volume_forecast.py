"""
ESC Volume Forecast Model
==========================

Decomposes ESC creation volume by activity type using IPART activity
registration data, then forecasts creation, surrender, and net flow
at weekly frequency for 26 weeks.

Activity types:
  - Commercial Lighting (CL) — declining, phase-out completing 31 Dec 2026
  - Home Energy Efficiency Retrofits (HEER) — growing
  - Industrial, Commercial and Agricultural (IHEAB) — growing
  - Power Infrastructure and Motor Vehicles (PIAMV) — stable
  - Other activities — stable to growing
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Output dataclass
# ---------------------------------------------------------------------------

@dataclass
class VolumeForeccast:
    """Volume forecast output at weekly frequency."""
    creation_forecast: List[float]        # Weekly creation volumes (26 weeks)
    surrender_forecast: List[float]       # Weekly surrender volumes (26 weeks)
    net_flow_forecast: List[float]        # creation - surrender per week
    activity_breakdown: Dict[str, List[float]]  # Per-activity weekly creation
    forecast_start_date: str              # ISO date of first forecast week
    horizon_weeks: int


# ---------------------------------------------------------------------------
# Activity type parameters (calibrated from IPART annual reports 2022-2025)
# ---------------------------------------------------------------------------

# Annual creation volumes by activity (certificates, approximate from IPART)
# These are baseline 2024 values; trends apply from here.
ACTIVITY_PARAMS: Dict[str, dict] = {
    "CL": {
        "baseline_annual": 380_000,    # Commercial lighting — declining
        "trend": "declining",
        "annual_growth_rate": -0.45,   # ~45% annual decline toward phase-out
        "phase_out_date": date(2026, 12, 31),
        "seasonal_peak_quarters": [2, 3],  # Q2-Q3 installation peak
        "seasonal_amplitude": 0.15,
    },
    "HEER": {
        "baseline_annual": 1_900_000,  # Home energy efficiency — growing
        "trend": "growing",
        "annual_growth_rate": 0.12,    # ~12% annual growth
        "phase_out_date": None,
        "seasonal_peak_quarters": [2, 3],  # Residential retrofit peak
        "seasonal_amplitude": 0.25,
    },
    "IHEAB": {
        "baseline_annual": 1_200_000,  # Industrial/commercial/ag — growing
        "trend": "growing",
        "annual_growth_rate": 0.08,    # ~8% annual growth
        "phase_out_date": None,
        "seasonal_peak_quarters": [1, 4],  # End-of-FY capital works
        "seasonal_amplitude": 0.10,
    },
    "PIAMV": {
        "baseline_annual": 600_000,    # Power infra / motor vehicles — stable
        "trend": "stable",
        "annual_growth_rate": 0.02,    # ~2% annual growth
        "phase_out_date": None,
        "seasonal_peak_quarters": [3, 4],
        "seasonal_amplitude": 0.08,
    },
    "OTHER": {
        "baseline_annual": 420_000,    # Other activities — stable to growing
        "trend": "growing",
        "annual_growth_rate": 0.05,    # ~5% annual growth
        "phase_out_date": None,
        "seasonal_peak_quarters": [2, 3],
        "seasonal_amplitude": 0.10,
    },
}

# Surrender parameters (from IPART annual compliance reports)
# Total annual ESC obligation target ~5.2M for 2025, growing ~3% per year
SURRENDER_PARAMS = {
    "annual_obligation_2025": 5_200_000,
    "obligation_growth_rate": 0.03,
    # Surrender is heavily seasonal: Q4-heavy procurement, June 30 and Dec 31 deadlines
    # Weekly distribution weights by quarter (sum to ~1.0 over 52 weeks)
    "quarterly_weights": {
        1: 0.15,  # Q1 Jan-Mar: post-deadline quiet
        2: 0.25,  # Q2 Apr-Jun: ramp toward Jun 30 deadline
        3: 0.18,  # Q3 Jul-Sep: post-deadline quiet
        4: 0.42,  # Q4 Oct-Dec: heavy procurement for Dec 31 deadline
    },
}

BASELINE_YEAR = 2024


# ---------------------------------------------------------------------------
# Forecaster
# ---------------------------------------------------------------------------

class VolumeForecaster:
    """Produces weekly ESC creation and surrender volume forecasts."""

    def __init__(
        self,
        activity_params: Optional[Dict[str, dict]] = None,
        surrender_params: Optional[dict] = None,
        reference_date: Optional[date] = None,
    ) -> None:
        self.activity_params = activity_params or ACTIVITY_PARAMS
        self.surrender_params = surrender_params or SURRENDER_PARAMS
        self.reference_date = reference_date or date.today()

    def _years_from_baseline(self, target_date: date) -> float:
        """Fractional years from the baseline year start."""
        baseline_start = date(BASELINE_YEAR, 1, 1)
        return (target_date - baseline_start).days / 365.25

    def _quarter_of_date(self, d: date) -> int:
        """Return 1-4 for the quarter of the given date."""
        return (d.month - 1) // 3 + 1

    def _seasonal_factor(self, d: date, peak_quarters: List[int], amplitude: float) -> float:
        """
        Seasonal adjustment factor for a given date.

        Returns a multiplier centred on 1.0, peaking in the specified quarters.
        Uses a sinusoidal approximation.
        """
        quarter = self._quarter_of_date(d)
        if quarter in peak_quarters:
            return 1.0 + amplitude
        else:
            return 1.0 - amplitude * len(peak_quarters) / (4 - len(peak_quarters))

    def _weekly_creation_for_activity(
        self, activity: str, week_date: date
    ) -> float:
        """Forecast weekly creation volume for a single activity type."""
        params = self.activity_params[activity]
        years_elapsed = self._years_from_baseline(week_date)

        # Base annual volume with trend
        growth = params["annual_growth_rate"]
        if params["trend"] == "declining" and params.get("phase_out_date"):
            phase_out = params["phase_out_date"]
            if week_date >= phase_out:
                return 0.0
            # Linear ramp-down to zero at phase-out date
            days_remaining = (phase_out - week_date).days
            total_days = (phase_out - date(BASELINE_YEAR, 1, 1)).days
            ramp_fraction = max(0.0, days_remaining / total_days)
            annual_volume = params["baseline_annual"] * ramp_fraction
        else:
            annual_volume = params["baseline_annual"] * (1.0 + growth) ** years_elapsed

        # Convert to weekly
        weekly_base = annual_volume / 52.0

        # Apply seasonal adjustment
        seasonal = self._seasonal_factor(
            week_date, params["seasonal_peak_quarters"], params["seasonal_amplitude"]
        )

        return max(0.0, weekly_base * seasonal)

    def _weekly_surrender(self, week_date: date) -> float:
        """Forecast weekly surrender volume based on obligation targets."""
        sp = self.surrender_params
        years_from_2025 = (week_date - date(2025, 1, 1)).days / 365.25
        annual_obligation = sp["annual_obligation_2025"] * (
            1.0 + sp["obligation_growth_rate"]
        ) ** max(0.0, years_from_2025)

        quarter = self._quarter_of_date(week_date)
        q_weight = sp["quarterly_weights"][quarter]

        # 13 weeks per quarter, distribute the quarterly share evenly
        weekly_surrender = (annual_obligation * q_weight) / 13.0
        return max(0.0, weekly_surrender)

    def forecast(self, horizon_weeks: int = 26) -> VolumeForeccast:
        """
        Generate volume forecasts at weekly frequency.

        Args:
            horizon_weeks: Number of weeks to forecast (default 26).

        Returns:
            VolumeForeccast with creation, surrender, net flow, and
            activity breakdown at weekly frequency.
        """
        creation_forecast: List[float] = []
        surrender_forecast: List[float] = []
        net_flow_forecast: List[float] = []
        activity_breakdown: Dict[str, List[float]] = {
            act: [] for act in self.activity_params
        }

        start_date = self.reference_date + timedelta(weeks=1)

        for week_idx in range(horizon_weeks):
            week_date = start_date + timedelta(weeks=week_idx)

            # Creation by activity
            total_creation = 0.0
            for activity in self.activity_params:
                vol = self._weekly_creation_for_activity(activity, week_date)
                activity_breakdown[activity].append(round(vol))
                total_creation += vol

            creation_forecast.append(round(total_creation))

            # Surrender
            surrender = self._weekly_surrender(week_date)
            surrender_forecast.append(round(surrender))

            # Net flow
            net_flow_forecast.append(round(total_creation - surrender))

        return VolumeForeccast(
            creation_forecast=creation_forecast,
            surrender_forecast=surrender_forecast,
            net_flow_forecast=net_flow_forecast,
            activity_breakdown=activity_breakdown,
            forecast_start_date=start_date.isoformat(),
            horizon_weeks=horizon_weeks,
        )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Running ESC volume forecast...\n")
    vf = VolumeForecaster()
    result = vf.forecast(horizon_weeks=26)

    print(f"Forecast start: {result.forecast_start_date}")
    print(f"Horizon: {result.horizon_weeks} weeks\n")

    print(f"{'Week':>4}  {'Creation':>10}  {'Surrender':>10}  {'Net Flow':>10}")
    print("-" * 44)
    for i in range(result.horizon_weeks):
        print(
            f"{i+1:>4}  {result.creation_forecast[i]:>10,.0f}  "
            f"{result.surrender_forecast[i]:>10,.0f}  {result.net_flow_forecast[i]:>10,.0f}"
        )

    print(f"\nActivity breakdown (week 1):")
    for act, vals in result.activity_breakdown.items():
        print(f"  {act:>6}: {vals[0]:>10,.0f}")
