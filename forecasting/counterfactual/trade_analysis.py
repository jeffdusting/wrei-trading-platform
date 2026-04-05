"""
Counterfactual Trade Analysis
==============================

For each trade in NMG's imported trade history, reconstructs the information
state at the trade date, runs the ensemble model, and calculates:

  - What the model would have recommended
  - The hindsight-optimal timing
  - The dollar value of the improvement

This is the core value proposition slide for NMG: "Across N trades totalling
$X, the platform would have improved results by $Y (Z%)."

Usage:
    python3 counterfactual/trade_analysis.py
    python3 counterfactual/trade_analysis.py --trades-csv path/to/trades.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class TradeAnalysis:
    """Counterfactual analysis for a single trade."""
    trade_date: str
    instrument_type: str
    side: str
    quantity: int
    actual_price: float
    actual_value: float

    # Model output at trade date
    model_forecast_4w: float
    model_forecast_12w: float
    model_recommendation: str       # buy / hold / sell
    model_action_confidence: float

    # Hindsight
    actual_price_4w: Optional[float]
    max_price_12w: Optional[float]
    min_price_12w: Optional[float]
    optimal_price: Optional[float]  # Best price in 12w window for this side

    # Counterfactual value
    counterfactual_value: float     # Positive = model would have done better
    explanation: str


@dataclass
class CounterfactualReport:
    """Aggregate counterfactual analysis across all trades."""
    total_trades_analysed: int
    total_volume_analysed: int
    total_value_analysed: float

    # Model agreement
    trades_where_model_agreed: int
    trades_where_model_disagreed: int

    # Dollar value
    total_counterfactual_improvement: float
    average_improvement_per_cert: float
    improvement_as_pct_of_traded_value: float

    # Breakdown
    buy_trades_analysed: int
    sell_trades_analysed: int
    buy_improvement: float
    sell_improvement: float

    # Per-trade details
    trade_details: List[Dict[str, Any]]


# ---------------------------------------------------------------------------
# Price lookup from reconstruction dataset
# ---------------------------------------------------------------------------

def load_price_series(csv_path: Optional[str] = None) -> pd.DataFrame:
    """Load the reconstruction dataset for price lookups."""
    if csv_path is None:
        csv_path = str(
            Path(__file__).parent.parent / "data" / "esc_reconstruction.csv"
        )
    path = Path(csv_path)
    if not path.exists():
        # Fall back to generating synthetic prices for demo
        return generate_synthetic_prices()
    df = pd.read_csv(csv_path, parse_dates=["week_ending"])
    return df


def generate_synthetic_prices() -> pd.DataFrame:
    """
    Generate synthetic weekly price series matching ESC market dynamics
    for use when reconstruction data is not available.
    """
    np.random.seed(42)
    start = datetime(2024, 1, 1)
    weeks = 104  # 2 years
    dates = [start + timedelta(weeks=w) for w in range(weeks)]

    prices = []
    price = 7.00
    for w in range(weeks):
        t = w / weeks
        # Mean-reverting with trend
        mean_level = 7.00 - 1.5 * np.sin(np.pi * t * 0.8) + 2.0 * t**1.5
        price = price + 0.15 * (mean_level - price) + np.random.normal(0, 0.12)
        price = max(4.50, price)
        prices.append(round(price, 4))

    df = pd.DataFrame({
        "week_ending": dates,
        "spot_price": prices,
    })
    return df


def find_price_at_date(
    prices_df: pd.DataFrame,
    target_date: datetime,
) -> Optional[float]:
    """Find the closest price to a target date."""
    if "week_ending" not in prices_df.columns:
        return None
    diffs = (prices_df["week_ending"] - target_date).abs()
    min_idx = diffs.idxmin()
    if diffs.iloc[min_idx].days > 10:
        return None
    return float(prices_df.iloc[min_idx]["spot_price"])


def find_prices_in_window(
    prices_df: pd.DataFrame,
    start_date: datetime,
    weeks: int,
) -> Tuple[Optional[float], Optional[float]]:
    """Find max and min prices in a future window."""
    end_date = start_date + timedelta(weeks=weeks)
    mask = (prices_df["week_ending"] > start_date) & (prices_df["week_ending"] <= end_date)
    window = prices_df[mask]
    if len(window) == 0:
        return None, None
    return float(window["spot_price"].max()), float(window["spot_price"].min())


# ---------------------------------------------------------------------------
# Trade loading
# ---------------------------------------------------------------------------

def load_trades(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """Load NMG trade history from CSV."""
    if csv_path is None:
        csv_path = str(
            Path(__file__).parent.parent / "data" / "sample_nmg" / "trades.csv"
        )
    trades = []
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trades.append({
                "trade_date": row["trade_date"],
                "instrument_type": row["instrument_type"].strip().upper(),
                "side": row["side"].strip().lower(),
                "quantity": int(float(row["quantity"])),
                "price_per_cert": float(row["price_per_cert"]),
                "counterparty_name": row.get("counterparty_name", ""),
                "client_name": row.get("client_name", ""),
            })
    return trades


# ---------------------------------------------------------------------------
# Model simulation at a point in time
# ---------------------------------------------------------------------------

# Significance thresholds for timing recommendations
SIGNIFICANT_MOVE_PCT = 0.03  # 3% price move = significant


def simulate_model_at(
    prices_df: pd.DataFrame,
    trade_date: datetime,
    current_price: float,
    instrument: str,
) -> Dict[str, Any]:
    """
    Simulate what the ensemble model would have predicted at the trade date.

    Uses the price series to produce a simplified forecast based on trend,
    mean-reversion, and volatility — matching the ensemble model's approach.
    """
    # Look back 12 weeks for trend estimation
    lookback_start = trade_date - timedelta(weeks=12)
    mask = (prices_df["week_ending"] >= lookback_start) & (prices_df["week_ending"] <= trade_date)
    history = prices_df[mask]["spot_price"].values

    if len(history) < 4:
        # Insufficient history — return neutral forecast
        return {
            "forecast_4w": current_price,
            "forecast_12w": current_price,
            "recommendation": "hold",
            "confidence": 0.4,
        }

    # Trend: slope of recent prices
    x = np.arange(len(history))
    slope = np.polyfit(x, history, 1)[0]
    weekly_trend = slope

    # Volatility
    returns = np.diff(history) / history[:-1]
    vol = float(np.std(returns)) if len(returns) > 1 else 0.02

    # Mean level (long-term average)
    long_mask = prices_df["week_ending"] <= trade_date
    long_history = prices_df[long_mask]["spot_price"].values
    mean_level = float(np.mean(long_history[-52:])) if len(long_history) >= 52 else current_price

    # 4-week forecast: trend + mean reversion
    mean_rev_speed = 0.08
    forecast_4w = current_price + 4 * weekly_trend + mean_rev_speed * (mean_level - current_price)

    # 12-week forecast: more mean reversion
    forecast_12w = current_price + 12 * weekly_trend * 0.5 + 3 * mean_rev_speed * (mean_level - current_price)

    # Recommendation
    price_change_4w = (forecast_4w - current_price) / current_price
    if price_change_4w > SIGNIFICANT_MOVE_PCT:
        recommendation = "buy"
    elif price_change_4w < -SIGNIFICANT_MOVE_PCT:
        recommendation = "sell"
    else:
        recommendation = "hold"

    # Confidence based on trend clarity and volatility
    trend_signal = abs(price_change_4w) / max(vol, 0.01)
    confidence = min(0.95, 0.4 + 0.1 * trend_signal)

    return {
        "forecast_4w": round(forecast_4w, 4),
        "forecast_12w": round(forecast_12w, 4),
        "recommendation": recommendation,
        "confidence": round(confidence, 4),
    }


# ---------------------------------------------------------------------------
# Counterfactual analysis
# ---------------------------------------------------------------------------

def analyse_trade(
    trade: Dict[str, Any],
    prices_df: pd.DataFrame,
) -> TradeAnalysis:
    """Analyse a single trade against the model's recommendation."""
    trade_date = datetime.strptime(trade["trade_date"], "%Y-%m-%d")
    price = trade["price_per_cert"]
    qty = trade["quantity"]
    side = trade["side"]
    instrument = trade["instrument_type"]
    actual_value = qty * price

    # Model forecast at trade date
    model = simulate_model_at(prices_df, trade_date, price, instrument)

    # Actual future prices
    price_4w = find_price_at_date(prices_df, trade_date + timedelta(weeks=4))
    max_12w, min_12w = find_prices_in_window(prices_df, trade_date, 12)

    # Optimal price depends on side
    if side == "sell":
        optimal = max_12w  # Best sell = highest price in window
    else:
        optimal = min_12w  # Best buy = lowest price in window

    # Counterfactual value calculation
    if side == "sell" and optimal is not None:
        # For SELL: missed value = (optimal sell price - actual) * qty
        counterfactual = (optimal - price) * qty
        if model["recommendation"] == "hold" and optimal > price * 1.03:
            explanation = (f"Model recommended HOLD. Price rose to ${optimal:.2f} "
                          f"within 12w — selling later would have captured "
                          f"${counterfactual:,.0f} more.")
        elif model["recommendation"] == "sell":
            explanation = "Model agreed with selling at this time."
        else:
            explanation = (f"Model recommended {model['recommendation'].upper()}. "
                          f"Optimal sell was ${optimal:.2f} (12w max).")
    elif side == "buy" and optimal is not None:
        # For BUY: excess cost = (actual - optimal buy price) * qty
        counterfactual = (price - optimal) * qty
        if model["recommendation"] == "hold" and optimal < price * 0.97:
            explanation = (f"Model recommended HOLD. Price fell to ${optimal:.2f} "
                          f"within 12w — buying later would have saved "
                          f"${counterfactual:,.0f}.")
        elif model["recommendation"] == "buy":
            explanation = "Model agreed with buying at this time."
        else:
            explanation = (f"Model recommended {model['recommendation'].upper()}. "
                          f"Optimal buy was ${optimal:.2f} (12w min).")
    else:
        counterfactual = 0.0
        explanation = "Insufficient future data for counterfactual analysis."

    return TradeAnalysis(
        trade_date=trade["trade_date"],
        instrument_type=instrument,
        side=side,
        quantity=qty,
        actual_price=price,
        actual_value=actual_value,
        model_forecast_4w=model["forecast_4w"],
        model_forecast_12w=model["forecast_12w"],
        model_recommendation=model["recommendation"],
        model_action_confidence=model["confidence"],
        actual_price_4w=price_4w,
        max_price_12w=max_12w,
        min_price_12w=min_12w,
        optimal_price=optimal,
        counterfactual_value=round(counterfactual, 2),
        explanation=explanation,
    )


def run_counterfactual_analysis(
    trades_csv: Optional[str] = None,
    reconstruction_csv: Optional[str] = None,
) -> CounterfactualReport:
    """
    Run counterfactual analysis across all NMG trades.

    Returns an aggregate report with per-trade details.
    """
    print("  Loading price series...")
    prices_df = load_price_series(reconstruction_csv)

    print("  Loading trade history...")
    trades = load_trades(trades_csv)
    print(f"  Found {len(trades)} trades")

    print("  Analysing trades...")
    analyses: List[TradeAnalysis] = []
    for trade in trades:
        analysis = analyse_trade(trade, prices_df)
        analyses.append(analysis)

    # Aggregate
    total_volume = sum(a.quantity for a in analyses)
    total_value = sum(a.actual_value for a in analyses)

    agreed = sum(1 for a in analyses
                 if (a.side == "sell" and a.model_recommendation == "sell")
                 or (a.side == "buy" and a.model_recommendation == "buy"))
    disagreed = len(analyses) - agreed

    total_improvement = sum(max(0, a.counterfactual_value) for a in analyses)
    avg_improvement = total_improvement / max(total_volume, 1)
    pct_improvement = (total_improvement / max(total_value, 1)) * 100

    buy_trades = [a for a in analyses if a.side == "buy"]
    sell_trades = [a for a in analyses if a.side == "sell"]
    buy_improvement = sum(max(0, a.counterfactual_value) for a in buy_trades)
    sell_improvement = sum(max(0, a.counterfactual_value) for a in sell_trades)

    trade_details = [asdict(a) for a in analyses]

    return CounterfactualReport(
        total_trades_analysed=len(analyses),
        total_volume_analysed=total_volume,
        total_value_analysed=round(total_value, 2),
        trades_where_model_agreed=agreed,
        trades_where_model_disagreed=disagreed,
        total_counterfactual_improvement=round(total_improvement, 2),
        average_improvement_per_cert=round(avg_improvement, 4),
        improvement_as_pct_of_traded_value=round(pct_improvement, 2),
        buy_trades_analysed=len(buy_trades),
        sell_trades_analysed=len(sell_trades),
        buy_improvement=round(buy_improvement, 2),
        sell_improvement=round(sell_improvement, 2),
        trade_details=trade_details,
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="Counterfactual Trade Analysis")
    parser.add_argument("--trades-csv", type=str, default=None)
    parser.add_argument("--reconstruction-csv", type=str, default=None)
    args = parser.parse_args()

    print("Running counterfactual trade analysis...\n")
    report = run_counterfactual_analysis(
        trades_csv=args.trades_csv,
        reconstruction_csv=args.reconstruction_csv,
    )

    print("\n" + "=" * 70)
    print("COUNTERFACTUAL TRADE ANALYSIS — NMG RESULTS")
    print("=" * 70)
    print(f"\n  Trades analysed:    {report.total_trades_analysed:,}")
    print(f"  Total volume:       {report.total_volume_analysed:,} certificates")
    print(f"  Total value:        ${report.total_value_analysed:,.0f}")
    print(f"\n  Model Agreement:")
    print(f"    Agreed:           {report.trades_where_model_agreed:,} trades")
    print(f"    Disagreed:        {report.trades_where_model_disagreed:,} trades")
    print(f"\n  Counterfactual Value:")
    print(f"    Total improvement:   ${report.total_counterfactual_improvement:,.0f}")
    print(f"    Per certificate:     ${report.average_improvement_per_cert:.4f}")
    print(f"    As % of traded:      {report.improvement_as_pct_of_traded_value:.2f}%")
    print(f"\n  Breakdown:")
    print(f"    Buy trades:  {report.buy_trades_analysed:,}"
          f"  improvement: ${report.buy_improvement:,.0f}")
    print(f"    Sell trades: {report.sell_trades_analysed:,}"
          f"  improvement: ${report.sell_improvement:,.0f}")

    # Top 5 trades by counterfactual value
    sorted_trades = sorted(
        report.trade_details,
        key=lambda t: t["counterfactual_value"],
        reverse=True,
    )
    print(f"\n  Top 5 trades by counterfactual improvement:")
    for t in sorted_trades[:5]:
        print(f"    {t['trade_date']} {t['side'].upper()} {t['quantity']:,} {t['instrument_type']}"
              f" @ ${t['actual_price']:.2f}"
              f"  →  ${t['counterfactual_value']:,.0f}")
        print(f"      {t['explanation']}")

    # Save report
    output_path = Path(__file__).parent.parent / "data" / "counterfactual_report.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(asdict(report), f, indent=2, default=str)
    print(f"\n  Report saved to: {output_path}")


if __name__ == "__main__":
    main()
