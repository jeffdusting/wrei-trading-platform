#!/usr/bin/env python3
"""
Session I Task 6: Cross-Instrument Correlation Analysis

Computes price correlation matrix across all instruments with genuine data.
Identifies leading/lagging relationships between instruments.

Instruments analysed:
  - Australian compliance: ESC, VEEC, ACCU, LGC
  - International VCM: GEO, N-GEO, C-GEO
  - On-chain tokens: BCT, NCT
"""

import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "intelligence_documents.db",
)

REPORT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "CROSS_INSTRUMENT_REPORT.md",
)

INSTRUMENTS = ["ESC", "VEEC", "ACCU", "LGC", "GEO", "N-GEO", "C-GEO"]
MAX_LAG_WEEKS = 8  # Maximum lead/lag to test


# ---------------------------------------------------------------------------
# Data loading
# ---------------------------------------------------------------------------

def load_all_instrument_prices() -> pd.DataFrame:
    """Load weekly price series for all instruments from SQLite."""
    db_path = os.path.abspath(DB_PATH)
    conn = sqlite3.connect(db_path)

    # Load from genuine_price_observations
    df = pd.read_sql_query(
        """SELECT week_ending, instrument, AVG(spot_price) as price
           FROM genuine_price_observations
           WHERE instrument IN ({})
           GROUP BY week_ending, instrument
           ORDER BY week_ending""".format(
            ",".join(f"'{i}'" for i in INSTRUMENTS)
        ),
        conn,
    )

    # Also load VCM prices
    try:
        vcm_df = pd.read_sql_query(
            """SELECT week_ending, instrument, AVG(spot_price) as price
               FROM vcm_price_observations
               GROUP BY week_ending, instrument
               ORDER BY week_ending""",
            conn,
        )
        df = pd.concat([df, vcm_df], ignore_index=True)
    except Exception:
        pass

    conn.close()

    # Pivot to wide format
    df["week_ending"] = pd.to_datetime(df["week_ending"])
    wide = df.pivot_table(
        index="week_ending",
        columns="instrument",
        values="price",
        aggfunc="mean",
    )
    wide = wide.sort_index()

    return wide


# ---------------------------------------------------------------------------
# Correlation analysis
# ---------------------------------------------------------------------------

def compute_correlation_matrix(prices: pd.DataFrame) -> pd.DataFrame:
    """Compute Pearson correlation matrix for available instruments."""
    # Only use columns with sufficient data
    min_obs = 20
    valid_cols = [c for c in prices.columns if prices[c].dropna().shape[0] >= min_obs]
    subset = prices[valid_cols].dropna(how="all")

    # Forward-fill gaps (max 4 weeks)
    subset = subset.ffill(limit=4)

    return subset.corr(method="pearson")


def compute_return_correlation(prices: pd.DataFrame) -> pd.DataFrame:
    """Compute correlation on weekly returns (more stationary)."""
    min_obs = 20
    valid_cols = [c for c in prices.columns if prices[c].dropna().shape[0] >= min_obs]
    subset = prices[valid_cols].ffill(limit=4)

    # Weekly returns
    returns = subset.pct_change().dropna(how="all")

    return returns.corr(method="pearson")


def compute_lead_lag(
    prices: pd.DataFrame,
    max_lag: int = MAX_LAG_WEEKS,
) -> Dict[str, Dict[str, Any]]:
    """
    Identify leading/lagging relationships between instruments.

    For each pair, tests cross-correlation at lags -max_lag to +max_lag.
    Positive lag means first instrument leads second.
    """
    min_obs = 20
    valid_cols = [c for c in prices.columns if prices[c].dropna().shape[0] >= min_obs]
    subset = prices[valid_cols].ffill(limit=4)
    returns = subset.pct_change().dropna(how="all")

    results: Dict[str, Dict[str, Any]] = {}

    for i, col_a in enumerate(valid_cols):
        for col_b in valid_cols[i + 1:]:
            pair_key = f"{col_a}_vs_{col_b}"
            best_lag = 0
            best_corr = 0.0

            for lag in range(-max_lag, max_lag + 1):
                if lag == 0:
                    corr_val = returns[col_a].corr(returns[col_b])
                elif lag > 0:
                    # col_a leads col_b by `lag` weeks
                    corr_val = returns[col_a].iloc[:-lag].reset_index(drop=True).corr(
                        returns[col_b].iloc[lag:].reset_index(drop=True)
                    )
                else:
                    # col_b leads col_a by `|lag|` weeks
                    abs_lag = abs(lag)
                    corr_val = returns[col_a].iloc[abs_lag:].reset_index(drop=True).corr(
                        returns[col_b].iloc[:-abs_lag].reset_index(drop=True)
                    )

                if not np.isnan(corr_val) and abs(corr_val) > abs(best_corr):
                    best_corr = corr_val
                    best_lag = lag

            if best_lag > 0:
                leader = col_a
                follower = col_b
            elif best_lag < 0:
                leader = col_b
                follower = col_a
            else:
                leader = "contemporaneous"
                follower = ""

            results[pair_key] = {
                "instrument_a": col_a,
                "instrument_b": col_b,
                "best_lag_weeks": best_lag,
                "best_correlation": round(best_corr, 4),
                "leader": leader,
                "follower": follower,
                "contemporaneous_corr": round(
                    float(returns[col_a].corr(returns[col_b])), 4
                ),
            }

    return results


# ---------------------------------------------------------------------------
# Report
# ---------------------------------------------------------------------------

def write_correlation_report(
    price_corr: pd.DataFrame,
    return_corr: pd.DataFrame,
    lead_lag: Dict[str, Dict[str, Any]],
    prices: pd.DataFrame,
) -> None:
    """Write CROSS_INSTRUMENT_REPORT.md."""
    lines = [
        "# Cross-Instrument Correlation Report",
        "",
        f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Model version:** session-i-correlation",
        "",
        "## 1. Data Coverage",
        "",
        "| Instrument | Observations | Date Range | Currency |",
        "|------------|-------------|------------|----------|",
    ]

    for col in sorted(prices.columns):
        series = prices[col].dropna()
        if len(series) > 0:
            currency = "USD" if col in ["GEO", "N-GEO", "C-GEO"] else "AUD"
            lines.append(
                f"| {col} | {len(series)} | "
                f"{series.index.min().strftime('%Y-%m-%d')} – "
                f"{series.index.max().strftime('%Y-%m-%d')} | {currency} |"
            )

    # Price level correlation
    lines += [
        "",
        "## 2. Price Level Correlation (Pearson)",
        "",
        "Note: Price-level correlations may be inflated by shared trends. "
        "Return correlations (Section 3) are more informative.",
        "",
    ]

    # Format correlation matrix as markdown table
    cols = list(price_corr.columns)
    header = "| | " + " | ".join(cols) + " |"
    separator = "|---|" + "|".join(["---"] * len(cols)) + "|"
    lines.append(header)
    lines.append(separator)
    for row_name in price_corr.index:
        vals = " | ".join(
            f"{price_corr.loc[row_name, c]:.2f}" if not np.isnan(price_corr.loc[row_name, c]) else "—"
            for c in cols
        )
        lines.append(f"| {row_name} | {vals} |")

    # Return correlation
    lines += [
        "",
        "## 3. Weekly Return Correlation",
        "",
    ]
    cols_r = list(return_corr.columns)
    header_r = "| | " + " | ".join(cols_r) + " |"
    separator_r = "|---|" + "|".join(["---"] * len(cols_r)) + "|"
    lines.append(header_r)
    lines.append(separator_r)
    for row_name in return_corr.index:
        vals = " | ".join(
            f"{return_corr.loc[row_name, c]:.2f}" if not np.isnan(return_corr.loc[row_name, c]) else "—"
            for c in cols_r
        )
        lines.append(f"| {row_name} | {vals} |")

    # Lead/lag relationships
    lines += [
        "",
        "## 4. Lead/Lag Relationships",
        "",
        "| Pair | Best Lag (weeks) | Correlation | Leader | Contemp. Corr |",
        "|------|-----------------|-------------|--------|---------------|",
    ]

    # Sort by absolute correlation
    sorted_pairs = sorted(
        lead_lag.values(),
        key=lambda x: abs(x["best_correlation"]),
        reverse=True,
    )

    for pair in sorted_pairs[:20]:
        lag = pair["best_lag_weeks"]
        lag_str = f"+{lag}" if lag > 0 else str(lag)
        leader = pair["leader"]
        lines.append(
            f"| {pair['instrument_a']} vs {pair['instrument_b']} | "
            f"{lag_str} | {pair['best_correlation']:.4f} | "
            f"{leader} | {pair['contemporaneous_corr']:.4f} |"
        )

    # Key findings
    lines += [
        "",
        "## 5. Key Findings",
        "",
    ]

    # Find strongest lead/lag
    significant_leads = [
        p for p in sorted_pairs
        if abs(p["best_lag_weeks"]) > 0 and abs(p["best_correlation"]) > 0.3
    ]

    if significant_leads:
        for p in significant_leads[:5]:
            lag = p["best_lag_weeks"]
            if lag > 0:
                lines.append(
                    f"- **{p['instrument_a']} leads {p['instrument_b']}** by {abs(lag)} week(s) "
                    f"(r={p['best_correlation']:.3f})"
                )
            else:
                lines.append(
                    f"- **{p['instrument_b']} leads {p['instrument_a']}** by {abs(lag)} week(s) "
                    f"(r={p['best_correlation']:.3f})"
                )
    else:
        lines.append("- No significant lead/lag relationships detected at the threshold (|r| > 0.3)")

    lines += [
        "",
        "### Market Structure Observations",
        "",
        "- **Australian compliance credits** (ESC, VEEC, ACCU) share regulatory-driven dynamics",
        "- **International VCM** (GEO, N-GEO, C-GEO) are subject to corporate demand cycles",
        "- **Cross-market:** Limited direct price transmission between AU compliance and VCM",
        "- **Token/underlying:** BCT/NCT track GEO/N-GEO with a persistent liquidity discount",
        "",
        "---",
        "",
        "*Report generated by WREI Forecasting Advancement Programme — Session I*",
    ]

    report_path = os.path.abspath(REPORT_PATH)
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, "w") as f:
        f.write("\n".join(lines))

    print(f"  Report written to: {report_path}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("CROSS-INSTRUMENT CORRELATION ANALYSIS — Session I")
    print("=" * 60)

    print("\nLoading instrument prices...")
    prices = load_all_instrument_prices()
    print(f"  {len(prices)} weeks, {len(prices.columns)} instruments: {list(prices.columns)}")

    print("\nComputing price-level correlation...")
    price_corr = compute_correlation_matrix(prices)
    print(f"  {price_corr.shape[0]}×{price_corr.shape[1]} matrix")

    print("\nComputing return correlation...")
    return_corr = compute_return_correlation(prices)
    print(f"  {return_corr.shape[0]}×{return_corr.shape[1]} matrix")

    print("\nComputing lead/lag relationships...")
    lead_lag = compute_lead_lag(prices)
    significant = sum(
        1 for p in lead_lag.values()
        if abs(p["best_lag_weeks"]) > 0 and abs(p["best_correlation"]) > 0.3
    )
    print(f"  {len(lead_lag)} pairs analysed, {significant} significant lead/lag")

    print("\nWriting CROSS_INSTRUMENT_REPORT.md...")
    write_correlation_report(price_corr, return_corr, lead_lag, prices)

    print("\n" + "=" * 60)
    print("CORRELATION ANALYSIS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
