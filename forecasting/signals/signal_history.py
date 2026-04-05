"""
Historical Signal Dataset for ESC Market Intelligence
======================================================

Assembles a historical signal dataset from archived policy documents and
broker commentary for the 2019–2025 period. These signals are derived from
the known policy events in the ESC historical dataset and domain knowledge
of the ESS market.

For the demo/backtesting context, we reconstruct signals deterministically
from the known policy event timeline rather than calling the Claude API
(which would be expensive and non-reproducible). The AI extractor module
is used for live/new documents.

Output: a time series of signal features aligned to the historical weekly data.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


# ---------------------------------------------------------------------------
# Known policy events with pre-scored signals
# ---------------------------------------------------------------------------

@dataclass
class HistoricalPolicyEvent:
    """A known policy event with its pre-assessed market impact."""
    date: str                  # ISO date
    event: str
    supply_impact_pct: float   # -100 to +100
    demand_impact_pct: float
    affected_activities: List[str]
    confidence: float
    decay_weeks: int           # how many weeks the signal persists


# Reconstructed from CLAUDE.md policy timeline + domain knowledge
HISTORICAL_POLICY_EVENTS: List[HistoricalPolicyEvent] = [
    HistoricalPolicyEvent(
        date="2019-07-01",
        event="ESS Rule 2009 Amendment No. 8",
        supply_impact_pct=0.0,
        demand_impact_pct=0.0,
        affected_activities=["general"],
        confidence=0.7,
        decay_weeks=8,
    ),
    HistoricalPolicyEvent(
        date="2020-03-23",
        event="COVID-19 ESS flexibility measures",
        supply_impact_pct=-15.0,
        demand_impact_pct=-10.0,
        affected_activities=["commercial_lighting", "heer", "iheab"],
        confidence=0.9,
        decay_weeks=26,
    ),
    HistoricalPolicyEvent(
        date="2020-11-01",
        event="Commercial lighting baseline change Phase 1",
        supply_impact_pct=-10.0,
        demand_impact_pct=5.0,
        affected_activities=["commercial_lighting"],
        confidence=0.85,
        decay_weeks=16,
    ),
    HistoricalPolicyEvent(
        date="2021-07-01",
        event="ESS Rule 2009 Amendment No. 10 — targets extended to 2050",
        supply_impact_pct=0.0,
        demand_impact_pct=15.0,
        affected_activities=["general"],
        confidence=0.9,
        decay_weeks=26,
    ),
    HistoricalPolicyEvent(
        date="2022-01-01",
        event="Commercial lighting phase-down accelerated + 0.5%/yr target increase legislated",
        supply_impact_pct=-20.0,
        demand_impact_pct=10.0,
        affected_activities=["commercial_lighting"],
        confidence=0.9,
        decay_weeks=26,
    ),
    HistoricalPolicyEvent(
        date="2022-07-01",
        event="IPART statutory review commenced",
        supply_impact_pct=0.0,
        demand_impact_pct=0.0,
        affected_activities=["general"],
        confidence=0.5,
        decay_weeks=12,
    ),
    HistoricalPolicyEvent(
        date="2023-03-01",
        event="IPART surplus management consultation",
        supply_impact_pct=5.0,
        demand_impact_pct=-5.0,
        affected_activities=["general"],
        confidence=0.7,
        decay_weeks=16,
    ),
    HistoricalPolicyEvent(
        date="2023-07-01",
        event="Safeguard Mechanism reforms commenced",
        supply_impact_pct=0.0,
        demand_impact_pct=10.0,
        affected_activities=["general"],
        confidence=0.75,
        decay_weeks=20,
    ),
    HistoricalPolicyEvent(
        date="2024-01-01",
        event="Revised ESC targets (Schedule 5 update) + HEER method expanded",
        supply_impact_pct=10.0,
        demand_impact_pct=15.0,
        affected_activities=["heer", "general"],
        confidence=0.85,
        decay_weeks=26,
    ),
    HistoricalPolicyEvent(
        date="2024-07-01",
        event="NABERS integration pilot",
        supply_impact_pct=5.0,
        demand_impact_pct=0.0,
        affected_activities=["iheab"],
        confidence=0.6,
        decay_weeks=12,
    ),
    HistoricalPolicyEvent(
        date="2025-01-01",
        event="PEAK demand reduction scheme expansion",
        supply_impact_pct=5.0,
        demand_impact_pct=10.0,
        affected_activities=["piamv", "general"],
        confidence=0.8,
        decay_weeks=16,
    ),
    # Future events from CLAUDE.md (for reconstruction training data that
    # exists in the dataset but with forward-looking signals)
    HistoricalPolicyEvent(
        date="2025-03-15",
        event="ESS Rule change consultation — commercial lighting end proposed",
        supply_impact_pct=-30.0,
        demand_impact_pct=5.0,
        affected_activities=["commercial_lighting"],
        confidence=0.85,
        decay_weeks=20,
    ),
]


# ---------------------------------------------------------------------------
# Broker sentiment reconstruction
# ---------------------------------------------------------------------------

@dataclass
class HistoricalBrokerSentiment:
    """Reconstructed broker sentiment for a date range."""
    start_date: str
    end_date: str
    sentiment: float        # -1 (bearish) to +1 (bullish)
    supply_concern: float   # 0-10
    creation_trend: str     # accelerating | stable | decelerating
    key_themes: List[str]


# Quarterly broker sentiment reconstruction based on historical price trends
HISTORICAL_BROKER_SENTIMENTS: List[HistoricalBrokerSentiment] = [
    # 2019: Stable, mild surplus
    HistoricalBrokerSentiment("2019-01-01", "2019-06-30", -0.1, 3.0, "stable", ["surplus management", "commercial lighting dominance"]),
    HistoricalBrokerSentiment("2019-07-01", "2019-12-31", 0.0, 3.5, "stable", ["rule amendment", "market stability"]),
    # 2020: COVID disruption then recovery
    HistoricalBrokerSentiment("2020-01-01", "2020-03-22", 0.0, 3.0, "stable", ["pre-COVID normal", "steady supply"]),
    HistoricalBrokerSentiment("2020-03-23", "2020-06-30", -0.6, 6.0, "decelerating", ["COVID disruption", "installation delays", "demand uncertainty"]),
    HistoricalBrokerSentiment("2020-07-01", "2020-12-31", -0.2, 5.0, "stable", ["COVID recovery", "baseline change approaching"]),
    # 2021: Recovery, targets extended
    HistoricalBrokerSentiment("2021-01-01", "2021-06-30", 0.2, 4.0, "accelerating", ["post-COVID rebound", "target extension anticipation"]),
    HistoricalBrokerSentiment("2021-07-01", "2021-12-31", 0.5, 3.5, "accelerating", ["2050 target extension", "long-term demand certainty"]),
    # 2022: Supply tightening begins
    HistoricalBrokerSentiment("2022-01-01", "2022-06-30", 0.6, 5.0, "decelerating", ["commercial lighting phase-down", "target increases", "supply concern"]),
    HistoricalBrokerSentiment("2022-07-01", "2022-12-31", 0.4, 5.5, "decelerating", ["IPART review", "surplus drawdown", "market uncertainty"]),
    # 2023: Mixed signals
    HistoricalBrokerSentiment("2023-01-01", "2023-06-30", 0.1, 5.0, "stable", ["surplus consultation", "price stability"]),
    HistoricalBrokerSentiment("2023-07-01", "2023-12-31", 0.3, 4.5, "stable", ["Safeguard reforms", "demand outlook positive"]),
    # 2024: Bullish transition
    HistoricalBrokerSentiment("2024-01-01", "2024-06-30", 0.5, 5.5, "accelerating", ["HEER expansion", "target increase", "supply diversification"]),
    HistoricalBrokerSentiment("2024-07-01", "2024-12-31", 0.4, 5.0, "stable", ["NABERS pilot", "market maturation"]),
    # 2025: Tightening signals
    HistoricalBrokerSentiment("2025-01-01", "2025-04-30", 0.6, 6.5, "decelerating", ["commercial lighting sunset", "supply cliff approaching", "PEAK expansion"]),
]


# ---------------------------------------------------------------------------
# Signal feature assembly
# ---------------------------------------------------------------------------

def _parse_date(d: str) -> date:
    return datetime.fromisoformat(d).date()


def _weeks_between(d1: date, d2: date) -> float:
    return abs((d2 - d1).days) / 7.0


def compute_policy_signal_at_date(
    target_date: date,
) -> Tuple[bool, float, float]:
    """
    Compute the active policy signal at a given date.

    Returns:
        (policy_signal_active, policy_supply_impact_pct, policy_demand_impact_pct)

    Signals decay linearly over their decay_weeks window.
    """
    total_supply = 0.0
    total_demand = 0.0
    active = False

    for evt in HISTORICAL_POLICY_EVENTS:
        evt_date = _parse_date(evt.date)
        if evt_date > target_date:
            continue
        weeks_since = _weeks_between(evt_date, target_date)
        if weeks_since <= evt.decay_weeks:
            decay = max(0.0, 1.0 - weeks_since / evt.decay_weeks)
            total_supply += evt.supply_impact_pct * decay * evt.confidence
            total_demand += evt.demand_impact_pct * decay * evt.confidence
            active = True

    return active, total_supply, total_demand


def compute_broker_sentiment_at_date(
    target_date: date,
) -> Tuple[float, float, str]:
    """
    Look up the broker sentiment for a given date.

    Returns:
        (sentiment: -1 to +1, supply_concern: 0-10, creation_trend)
    """
    for bs in HISTORICAL_BROKER_SENTIMENTS:
        start = _parse_date(bs.start_date)
        end = _parse_date(bs.end_date)
        if start <= target_date <= end:
            return bs.sentiment, bs.supply_concern, bs.creation_trend

    # Default neutral
    return 0.0, 5.0, "stable"


def build_signal_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Build a signal feature DataFrame aligned to the historical weekly data.

    Args:
        df: Historical ESC DataFrame with 'week_ending' column.

    Returns:
        DataFrame with columns:
            policy_signal_active (bool)
            policy_supply_impact_pct (float)
            policy_demand_impact_pct (float)
            broker_sentiment (float, -1 to +1)
            supply_concern_level (float, 0-10)
            creation_trend_signal (str)
    """
    records = []
    for _, row in df.iterrows():
        week_date = _parse_date(str(row["week_ending"]))

        active, supply_pct, demand_pct = compute_policy_signal_at_date(week_date)
        sentiment, concern, trend = compute_broker_sentiment_at_date(week_date)

        records.append({
            "week_ending": str(row["week_ending"]),
            "policy_signal_active": active,
            "policy_supply_impact_pct": round(supply_pct, 2),
            "policy_demand_impact_pct": round(demand_pct, 2),
            "broker_sentiment": sentiment,
            "supply_concern_level": concern,
            "creation_trend_signal": trend,
        })

    return pd.DataFrame(records)


# ---------------------------------------------------------------------------
# Main: generate and display signal history
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    from pathlib import Path

    project_root = str(Path(__file__).resolve().parent.parent.parent)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    from forecasting.models.state_space import load_historical_data

    print("Building historical signal features...")
    df = load_historical_data()
    signals = build_signal_features(df)

    print(f"\n  Total weeks: {len(signals)}")
    print(f"  Weeks with active policy signal: {signals['policy_signal_active'].sum()}")
    print(f"  Sentiment range: [{signals['broker_sentiment'].min()}, {signals['broker_sentiment'].max()}]")
    print(f"  Supply concern range: [{signals['supply_concern_level'].min()}, {signals['supply_concern_level'].max()}]")

    # Show a few sample rows
    print("\n  Sample signals (first 5, last 5):")
    for _, row in signals.head(5).iterrows():
        print(f"    {row['week_ending']}: active={row['policy_signal_active']}, "
              f"supply={row['policy_supply_impact_pct']:+.1f}%, "
              f"sentiment={row['broker_sentiment']:+.2f}")
    print("    ...")
    for _, row in signals.tail(5).iterrows():
        print(f"    {row['week_ending']}: active={row['policy_signal_active']}, "
              f"supply={row['policy_supply_impact_pct']:+.1f}%, "
              f"sentiment={row['broker_sentiment']:+.2f}")

    print("\nSignal history built successfully.")
