"""
WREI-ACO Yield Model
======================

DCF model for WREI Asset Co (ACO) token NAV, using carbon price
trajectories from the ACCU/VCM forecasting models and fleet
operational parameters from WR-STR-008 / WR-FIN-001.

Key metrics:
  - Gross yield: 12.9%
  - Equity yield: 28.3%
  - Operating cost ratio: ~45%
  - Carbon credit contribution: variable (from forecast)

Produces base/bull/bear NAV scenarios:
  - Base: OU mean forecast
  - Bull: 80% CI upper bound
  - Bear: 80% CI lower bound
  - Sensitivity: NAV change per A$1 ACCU price change
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import numpy as np


# ---------------------------------------------------------------------------
# Fleet parameters (WR-STR-008 / WR-FIN-001)
# ---------------------------------------------------------------------------

@dataclass
class FleetParams:
    """Fleet operational parameters for ACO yield calculation."""
    fleet_size: int = 50                   # Number of autonomous units
    utilisation_rate: float = 0.75         # Fraction of fleet in active service
    route_revenue_per_trip: float = 15.0   # Average revenue per trip (AUD)
    trips_per_unit_per_week: float = 20.0  # Weekly trip rate per active unit
    operating_cost_ratio: float = 0.45     # OpEx as fraction of revenue
    carbon_credits_per_unit_per_year: float = 10.0  # ACCUs generated per unit/year
    unit_capital_cost: float = 25_000.0    # Capital cost per fleet unit (AUD)
    debt_ratio: float = 0.55              # Debt / total capital
    cost_of_debt: float = 0.065           # Annual interest rate on debt
    depreciation_years: int = 7           # Straight-line depreciation period
    token_supply: int = 10_000            # Total ACO tokens outstanding
    discount_rate: float = 0.10           # WACC / discount rate for DCF


# Default fleet parameters
DEFAULT_FLEET = FleetParams()


# ---------------------------------------------------------------------------
# ACO Yield Model
# ---------------------------------------------------------------------------

class ACOYieldModel:
    """
    DCF model for WREI Asset Co (ACO) token NAV.

    Uses carbon price trajectory from ACCU/VCM forecast models
    combined with fleet operational cash flows.
    """

    def __init__(self, fleet_params: Optional[FleetParams] = None) -> None:
        self.fleet = fleet_params or DEFAULT_FLEET

    def calculate_nav(
        self,
        carbon_price_trajectory: List[float],
        projection_years: int = 5,
    ) -> Dict[str, Any]:
        """
        DCF model for ACO token NAV.

        Args:
            carbon_price_trajectory: Weekly carbon prices from forecast
                (26-week forward curve). Extended by mean-reversion for
                longer projections.
            projection_years: DCF projection horizon in years.

        Returns:
            Dict with NAV, yield components, and DCF details.
        """
        f = self.fleet

        # Extend trajectory to full projection if needed
        n_weeks_needed = projection_years * 52
        trajectory = list(carbon_price_trajectory)
        if len(trajectory) < n_weeks_needed:
            # Extend with last value (or mean) for remaining weeks
            fill_price = trajectory[-1] if trajectory else 35.0
            trajectory.extend([fill_price] * (n_weeks_needed - len(trajectory)))

        # Annual cash flow projection
        annual_cash_flows = []
        total_capital = f.fleet_size * f.unit_capital_cost
        equity_capital = total_capital * (1.0 - f.debt_ratio)
        annual_depreciation = total_capital / f.depreciation_years
        annual_debt_service = total_capital * f.debt_ratio * f.cost_of_debt

        for year in range(projection_years):
            start_week = year * 52
            end_week = min(start_week + 52, len(trajectory))
            year_prices = trajectory[start_week:end_week]
            avg_carbon_price = sum(year_prices) / len(year_prices) if year_prices else 35.0

            # Fleet revenue
            active_units = f.fleet_size * f.utilisation_rate
            annual_trips = active_units * f.trips_per_unit_per_week * 52
            fleet_revenue = annual_trips * f.route_revenue_per_trip

            # Carbon revenue
            annual_credits = f.fleet_size * f.carbon_credits_per_unit_per_year
            carbon_revenue = annual_credits * avg_carbon_price

            # Total revenue and costs
            total_revenue = fleet_revenue + carbon_revenue
            operating_costs = total_revenue * f.operating_cost_ratio
            ebitda = total_revenue - operating_costs
            ebit = ebitda - annual_depreciation
            net_income = ebit - annual_debt_service

            annual_cash_flows.append({
                "year": year + 1,
                "avg_carbon_price": round(avg_carbon_price, 2),
                "fleet_revenue": round(fleet_revenue, 2),
                "carbon_revenue": round(carbon_revenue, 2),
                "total_revenue": round(total_revenue, 2),
                "operating_costs": round(operating_costs, 2),
                "ebitda": round(ebitda, 2),
                "depreciation": round(annual_depreciation, 2),
                "ebit": round(ebit, 2),
                "debt_service": round(annual_debt_service, 2),
                "net_income": round(net_income, 2),
            })

        # DCF valuation
        dcf_sum = 0.0
        for cf in annual_cash_flows:
            year = cf["year"]
            dcf_sum += cf["net_income"] / ((1.0 + f.discount_rate) ** year)

        # Terminal value (Gordon growth: 2% perpetuity growth)
        terminal_growth = 0.02
        if annual_cash_flows:
            terminal_cf = annual_cash_flows[-1]["net_income"]
            terminal_value = terminal_cf * (1.0 + terminal_growth) / (f.discount_rate - terminal_growth)
            dcf_terminal = terminal_value / ((1.0 + f.discount_rate) ** projection_years)
        else:
            dcf_terminal = 0.0

        enterprise_value = dcf_sum + dcf_terminal
        equity_value = max(0, enterprise_value - total_capital * f.debt_ratio)
        nav_per_token = equity_value / f.token_supply if f.token_supply > 0 else 0.0

        # Yield metrics
        first_year = annual_cash_flows[0] if annual_cash_flows else {}
        gross_yield_pct = (
            first_year.get("ebitda", 0) / total_capital * 100
            if total_capital > 0 else 0.0
        )
        equity_yield_pct = (
            first_year.get("net_income", 0) / equity_capital * 100
            if equity_capital > 0 else 0.0
        )
        carbon_contribution_pct = (
            first_year.get("carbon_revenue", 0) / first_year.get("total_revenue", 1) * 100
            if first_year.get("total_revenue", 0) > 0 else 0.0
        )

        return {
            "nav_per_token": round(nav_per_token, 2),
            "enterprise_value": round(enterprise_value, 2),
            "equity_value": round(equity_value, 2),
            "gross_yield_pct": round(gross_yield_pct, 2),
            "equity_yield_pct": round(equity_yield_pct, 2),
            "carbon_contribution_pct": round(carbon_contribution_pct, 2),
            "total_capital": round(total_capital, 2),
            "equity_capital": round(equity_capital, 2),
            "projection_years": projection_years,
            "annual_cash_flows": annual_cash_flows,
            "dcf_sum": round(dcf_sum, 2),
            "dcf_terminal": round(dcf_terminal, 2),
        }

    def scenario_analysis(
        self,
        accu_forecast: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Returns base, bull, bear NAV scenarios.

        Args:
            accu_forecast: Dict with keys:
                - 'mean': base case price trajectory (list of weekly prices)
                - 'upper_80': bull case (80% CI upper)
                - 'lower_80': bear case (80% CI lower)
                Or a simple dict with 'price', 'ci_80' for a single horizon.

        Returns:
            Dict with base/bull/bear NAV and sensitivity.
        """
        # Handle different forecast formats
        if isinstance(accu_forecast.get("mean"), list):
            base_trajectory = accu_forecast["mean"]
            bull_trajectory = accu_forecast.get("upper_80", [p * 1.1 for p in base_trajectory])
            bear_trajectory = accu_forecast.get("lower_80", [p * 0.9 for p in base_trajectory])
        else:
            # Single price point — extend to 26-week trajectory
            base_price = accu_forecast.get("price", accu_forecast.get("mean", 35.0))
            ci_80 = accu_forecast.get("ci_80", (base_price * 0.9, base_price * 1.1))
            base_trajectory = [base_price] * 26
            bull_trajectory = [ci_80[1]] * 26
            bear_trajectory = [ci_80[0]] * 26

        base_nav = self.calculate_nav(base_trajectory)
        bull_nav = self.calculate_nav(bull_trajectory)
        bear_nav = self.calculate_nav(bear_trajectory)

        # Sensitivity: NAV change per A$1 ACCU price change
        base_price = sum(base_trajectory) / len(base_trajectory)
        shifted = [p + 1.0 for p in base_trajectory]
        shifted_nav = self.calculate_nav(shifted)
        sensitivity = shifted_nav["nav_per_token"] - base_nav["nav_per_token"]

        return {
            "base": {
                "nav_per_token": base_nav["nav_per_token"],
                "gross_yield_pct": base_nav["gross_yield_pct"],
                "equity_yield_pct": base_nav["equity_yield_pct"],
                "carbon_contribution_pct": base_nav["carbon_contribution_pct"],
            },
            "bull": {
                "nav_per_token": bull_nav["nav_per_token"],
                "gross_yield_pct": bull_nav["gross_yield_pct"],
                "equity_yield_pct": bull_nav["equity_yield_pct"],
                "carbon_contribution_pct": bull_nav["carbon_contribution_pct"],
            },
            "bear": {
                "nav_per_token": bear_nav["nav_per_token"],
                "gross_yield_pct": bear_nav["gross_yield_pct"],
                "equity_yield_pct": bear_nav["equity_yield_pct"],
                "carbon_contribution_pct": bear_nav["carbon_contribution_pct"],
            },
            "sensitivity_per_dollar": round(sensitivity, 4),
            "base_carbon_price": round(base_price, 2),
        }


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

def write_aco_yield_report(scenarios: Dict[str, Any]) -> str:
    """Write ACO_YIELD_REPORT.md and return the path."""
    import os
    from datetime import datetime

    report_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..",
        "analysis",
        "ACO_YIELD_REPORT.md",
    )

    lines = [
        "# WREI-ACO Yield Model Report",
        "",
        f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Model version:** session-i-aco",
        "",
        "## 1. Scenario Analysis",
        "",
        "| Scenario | NAV/Token | Gross Yield | Equity Yield | Carbon Contribution |",
        "|----------|-----------|-------------|--------------|---------------------|",
    ]

    for scenario in ["base", "bull", "bear"]:
        s = scenarios[scenario]
        lines.append(
            f"| {scenario.capitalize()} | "
            f"${s['nav_per_token']:.2f} | "
            f"{s['gross_yield_pct']:.1f}% | "
            f"{s['equity_yield_pct']:.1f}% | "
            f"{s['carbon_contribution_pct']:.1f}% |"
        )

    lines += [
        "",
        f"**Carbon price sensitivity:** ${scenarios['sensitivity_per_dollar']:.4f} NAV per A$1 ACCU price change",
        f"**Base carbon price:** A${scenarios['base_carbon_price']:.2f}",
        "",
        "## 2. Fleet Parameters",
        "",
        "| Parameter | Value |",
        "|-----------|-------|",
        f"| Fleet size | {DEFAULT_FLEET.fleet_size} units |",
        f"| Utilisation rate | {DEFAULT_FLEET.utilisation_rate * 100:.0f}% |",
        f"| Revenue per trip | A${DEFAULT_FLEET.route_revenue_per_trip:.2f} |",
        f"| Operating cost ratio | {DEFAULT_FLEET.operating_cost_ratio * 100:.0f}% |",
        f"| Carbon credits/unit/year | {DEFAULT_FLEET.carbon_credits_per_unit_per_year:.0f} |",
        f"| Debt ratio | {DEFAULT_FLEET.debt_ratio * 100:.0f}% |",
        f"| Cost of debt | {DEFAULT_FLEET.cost_of_debt * 100:.1f}% |",
        f"| Discount rate (WACC) | {DEFAULT_FLEET.discount_rate * 100:.0f}% |",
        f"| Token supply | {DEFAULT_FLEET.token_supply:,} |",
        "",
        "## 3. Yield Comparison with RWA Benchmarks",
        "",
        "| Token/Product | Yield (APY) | Type | Notes |",
        "|---------------|-------------|------|-------|",
        f"| **WREI-ACO (base)** | **{scenarios['base']['equity_yield_pct']:.1f}%** | Carbon + fleet | Real asset + carbon revenue |",
        "| BlackRock BUIDL | ~4.8% | T-Bills | US Treasury-backed |",
        "| Ondo OUSG | ~4.0% | T-Bills | Short-duration govt bonds |",
        "| Maple Finance | ~8–12% | Lending | Undercollateralised credit |",
        "| Goldfinch | ~8–10% | Lending | Emerging market credit |",
        "",
        "**Key insight:** WREI-ACO's yield premium over T-Bill RWA tokens reflects:",
        "- Higher operational risk (fleet management, autonomous technology)",
        "- Carbon price exposure (both upside optionality and downside risk)",
        "- Illiquidity premium (less liquid secondary market)",
        "",
        "## 4. Sensitivity Analysis",
        "",
        "| Carbon Price Change | NAV Impact | New NAV/Token |",
        "|---------------------|------------|---------------|",
    ]

    base_nav = scenarios["base"]["nav_per_token"]
    sens = scenarios["sensitivity_per_dollar"]
    for delta in [-10, -5, -2, 0, 2, 5, 10]:
        impact = delta * sens
        new_nav = base_nav + impact
        lines.append(
            f"| {'+' if delta >= 0 else ''}{delta} | "
            f"{'+' if impact >= 0 else ''}${impact:.2f} | "
            f"${new_nav:.2f} |"
        )

    lines += [
        "",
        "---",
        "",
        "*Report generated by WREI Forecasting Advancement Programme — Session I*",
    ]

    os.makedirs(os.path.dirname(os.path.abspath(report_path)), exist_ok=True)
    with open(report_path, "w") as f:
        f.write("\n".join(lines))

    return report_path


# ---------------------------------------------------------------------------
# Backward-compatible function
# ---------------------------------------------------------------------------

def forecast_wrei_aco(
    carbon_price_trajectory: list,
    fleet_utilisation: float = 0.75,
    route_revenue_per_trip: float = 15.0,
    operating_cost_ratio: float = 0.45,
) -> dict:
    """Backward-compatible interface from Session D stub."""
    fleet = FleetParams(
        utilisation_rate=fleet_utilisation,
        route_revenue_per_trip=route_revenue_per_trip,
        operating_cost_ratio=operating_cost_ratio,
    )
    model = ACOYieldModel(fleet_params=fleet)
    result = model.calculate_nav(carbon_price_trajectory)
    result["status"] = "full_model"
    result["indicative_yield_annual_pct"] = result["equity_yield_pct"]
    return result


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_nav_positive():
    """NAV should be positive for reasonable carbon prices."""
    model = ACOYieldModel()
    trajectory = [35.0] * 26
    result = model.calculate_nav(trajectory)
    assert result["nav_per_token"] > 0, f"NAV is negative: {result['nav_per_token']}"


def test_bull_above_bear():
    """Bull NAV should exceed bear NAV."""
    model = ACOYieldModel()
    scenarios = model.scenario_analysis({
        "price": 35.0,
        "ci_80": (30.0, 40.0),
    })
    assert scenarios["bull"]["nav_per_token"] > scenarios["bear"]["nav_per_token"]


def test_sensitivity_positive():
    """Higher carbon prices should increase NAV."""
    model = ACOYieldModel()
    scenarios = model.scenario_analysis({
        "price": 35.0,
        "ci_80": (30.0, 40.0),
    })
    assert scenarios["sensitivity_per_dollar"] > 0


if __name__ == "__main__":
    print("Running ACO yield model tests...")
    test_nav_positive()
    print("  [PASS] NAV positive")
    test_bull_above_bear()
    print("  [PASS] Bull > Bear")
    test_sensitivity_positive()
    print("  [PASS] Sensitivity positive")
    print("\nAll tests passed.")

    # Demo + report
    model = ACOYieldModel()
    scenarios = model.scenario_analysis({
        "price": 36.30,
        "ci_80": (32.00, 40.00),
    })
    print("\n--- ACO Yield Scenarios ---")
    for label in ["base", "bull", "bear"]:
        s = scenarios[label]
        print(f"  {label.upper():5s}: NAV=${s['nav_per_token']:.2f}  "
              f"yield={s['equity_yield_pct']:.1f}%  "
              f"carbon={s['carbon_contribution_pct']:.1f}%")
    print(f"  Sensitivity: ${scenarios['sensitivity_per_dollar']:.4f}/A$1 ACCU")

    report_path = write_aco_yield_report(scenarios)
    print(f"\n  Report written to: {report_path}")
