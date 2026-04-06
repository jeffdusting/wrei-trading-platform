#!/usr/bin/env python3
"""
Daily Scraper Orchestrator

Runs all market data scrapers, computes derived metrics, and logs results.
Designed to be called by Vercel Cron or manual execution.

Usage:
  python3 run_daily.py              # Run all scrapers
  python3 run_daily.py --dry-run    # Run scrapers but don't persist to DB
"""

import json
import os
import sys
from datetime import date, datetime
from typing import Any, Optional

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ecovantage_scraper import scrape_ecovantage
from northmore_scraper import scrape_northmore_gordon
from tessa_scraper import TessaScraper
from ipart_scraper import scrape_ipart_news

DB_URL = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")


def get_db_connection():
    """Get a psycopg2 connection if DATABASE_URL is set."""
    if not DB_URL:
        return None
    try:
        import psycopg2
        return psycopg2.connect(DB_URL)
    except Exception as e:
        print(f"[db] Connection failed: {e}", file=sys.stderr)
        return None


def store_market_data(conn, data: dict[str, Any]) -> None:
    """Store scraped price data in market_data_daily."""
    if not conn or "esc_spot_price" not in data:
        return
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO market_data_daily (date, instrument_type, spot_price, source)
               VALUES (%s, %s, %s, %s)
               ON CONFLICT (date, instrument_type, source) DO UPDATE
               SET spot_price = EXCLUDED.spot_price""",
            (date.today().isoformat(), "ESC", data["esc_spot_price"], data["source"]),
        )
        # Store forward prices if available
        if "esc_forward_3m" in data:
            cur.execute(
                """UPDATE market_data_daily SET forward_3m_price = %s
                   WHERE date = %s AND instrument_type = %s AND source = %s""",
                (data["esc_forward_3m"], date.today().isoformat(), "ESC", data["source"]),
            )
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[db] store_market_data error: {e}", file=sys.stderr)
        conn.rollback()


def store_creation_volume(conn, data: dict[str, Any]) -> None:
    """Store weekly creation volume in creation_volumes."""
    if not conn or "weekly_creation_volume" not in data:
        return
    try:
        # Use Friday of current week as week_ending
        today = date.today()
        days_to_friday = (4 - today.weekday()) % 7
        week_ending = today if today.weekday() == 4 else today.replace(
            day=today.day + days_to_friday
        )

        by_activity = data.get("creation_by_activity")
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO creation_volumes (week_ending, instrument_type, total_created, by_activity, source)
               VALUES (%s, %s, %s, %s, %s)
               ON CONFLICT (week_ending, instrument_type) DO UPDATE
               SET total_created = EXCLUDED.total_created, by_activity = EXCLUDED.by_activity""",
            (
                week_ending.isoformat(), "ESC",
                data["weekly_creation_volume"],
                json.dumps(by_activity) if by_activity else None,
                data["source"],
            ),
        )
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[db] store_creation_volume error: {e}", file=sys.stderr)
        conn.rollback()


def compute_derived_metrics(
    spot_price: Optional[float],
    creation_volume: Optional[int],
) -> dict[str, Any]:
    """
    Compute derived market metrics from raw data.
    Uses current ESC scheme parameters.
    """
    metrics: dict[str, Any] = {
        "date": date.today().isoformat(),
        "instrument_type": "ESC",
    }

    # Penalty rate (IPART 2026 ESS)
    penalty_rate = 29.48
    metrics["penalty_rate"] = penalty_rate

    if spot_price:
        metrics["price_to_penalty_ratio"] = round(spot_price / penalty_rate, 4)

    # Days to next surrender deadline (31 March)
    today = date.today()
    surrender = date(today.year, 3, 31)
    if today > surrender:
        surrender = date(today.year + 1, 3, 31)
    metrics["days_to_surrender"] = (surrender - today).days

    # Placeholder metrics (will be enriched with historical data in P10-B)
    # These require time-series lookback that the daily scraper doesn't have alone
    if creation_volume:
        # Annualise the weekly figure
        metrics["creation_velocity_4w"] = creation_volume  # single week proxy
        metrics["creation_velocity_12w"] = creation_volume
        metrics["implied_annual_demand"] = creation_volume * 52

    return metrics


def store_metrics(conn, metrics: dict[str, Any]) -> None:
    """Store derived metrics in market_metrics table."""
    if not conn:
        return
    try:
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO market_metrics (
                   date, instrument_type, penalty_rate, price_to_penalty_ratio,
                   days_to_surrender, creation_velocity_4w, creation_velocity_12w,
                   implied_annual_demand
               ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
               ON CONFLICT (date, instrument_type) DO UPDATE SET
                   penalty_rate = EXCLUDED.penalty_rate,
                   price_to_penalty_ratio = EXCLUDED.price_to_penalty_ratio,
                   days_to_surrender = EXCLUDED.days_to_surrender,
                   creation_velocity_4w = EXCLUDED.creation_velocity_4w,
                   creation_velocity_12w = EXCLUDED.creation_velocity_12w,
                   implied_annual_demand = EXCLUDED.implied_annual_demand""",
            (
                metrics.get("date"), metrics.get("instrument_type"),
                metrics.get("penalty_rate"), metrics.get("price_to_penalty_ratio"),
                metrics.get("days_to_surrender"), metrics.get("creation_velocity_4w"),
                metrics.get("creation_velocity_12w"), metrics.get("implied_annual_demand"),
            ),
        )
        conn.commit()
        cur.close()
    except Exception as e:
        print(f"[db] store_metrics error: {e}", file=sys.stderr)
        conn.rollback()


def run_all(dry_run: bool = False) -> dict[str, Any]:
    """Run all scrapers and compute derived metrics."""
    results: dict[str, Any] = {
        "timestamp": datetime.utcnow().isoformat(),
        "scrapers": {},
    }

    conn = None if dry_run else get_db_connection()

    # --- Ecovantage ---
    print("[1/4] Ecovantage...")
    try:
        eco_data = scrape_ecovantage()
        if eco_data:
            results["scrapers"]["ecovantage"] = {"status": "ok", "data": eco_data}
            if not dry_run:
                store_market_data(conn, eco_data)
                store_creation_volume(conn, eco_data)
        else:
            results["scrapers"]["ecovantage"] = {"status": "no_data"}
    except Exception as e:
        results["scrapers"]["ecovantage"] = {"status": "error", "error": str(e)}
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- Northmore Gordon ---
    print("[2/4] Northmore Gordon...")
    try:
        nmg_data = scrape_northmore_gordon()
        if nmg_data:
            results["scrapers"]["northmore_gordon"] = {"status": "ok", "data": nmg_data}
            if not dry_run:
                store_market_data(conn, nmg_data)
        else:
            results["scrapers"]["northmore_gordon"] = {"status": "no_data"}
    except Exception as e:
        results["scrapers"]["northmore_gordon"] = {"status": "error", "error": str(e)}
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- TESSA ---
    print("[3/4] TESSA...")
    tessa = TessaScraper()
    try:
        summary = tessa.scrape_registry_summary()
        if summary:
            results["scrapers"]["tessa"] = {"status": "ok", "data": summary}
        else:
            results["scrapers"]["tessa"] = {"status": "no_data"}
    except Exception as e:
        results["scrapers"]["tessa"] = {"status": "error", "error": str(e)}
        print(f"  ERROR: {e}", file=sys.stderr)
    finally:
        tessa.close()

    # --- IPART ---
    print("[4/4] IPART...")
    try:
        ipart_items = scrape_ipart_news()
        if ipart_items:
            results["scrapers"]["ipart"] = {
                "status": "ok",
                "items_count": len(ipart_items),
            }
        else:
            results["scrapers"]["ipart"] = {"status": "no_data"}
    except Exception as e:
        results["scrapers"]["ipart"] = {"status": "error", "error": str(e)}
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- Derived metrics ---
    spot_price = None
    creation_volume = None

    eco_result = results["scrapers"].get("ecovantage", {})
    if eco_result.get("status") == "ok":
        spot_price = eco_result["data"].get("esc_spot_price")
        creation_volume = eco_result["data"].get("weekly_creation_volume")

    if spot_price is None:
        nmg_result = results["scrapers"].get("northmore_gordon", {})
        if nmg_result.get("status") == "ok":
            spot_price = nmg_result["data"].get("esc_spot_price")

    print("\nComputing derived metrics...")
    metrics = compute_derived_metrics(spot_price, creation_volume)
    results["metrics"] = metrics

    if not dry_run:
        store_metrics(conn, metrics)

    if conn:
        conn.close()

    # --- Summary ---
    ok_count = sum(1 for s in results["scrapers"].values() if s["status"] == "ok")
    total = len(results["scrapers"])
    print(f"\nDone: {ok_count}/{total} scrapers returned data")
    if spot_price:
        print(f"  ESC spot: ${spot_price:.2f}")
    if creation_volume:
        print(f"  Weekly creation: {creation_volume:,}")
    print(f"  Days to surrender: {metrics.get('days_to_surrender')}")

    return results


def main() -> None:
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("=== DRY RUN (no DB persistence) ===\n")
    results = run_all(dry_run=dry_run)
    print(f"\nFull results: {json.dumps(results, indent=2, default=str)}")


if __name__ == "__main__":
    main()
