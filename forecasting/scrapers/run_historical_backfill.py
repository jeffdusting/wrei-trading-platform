#!/usr/bin/env python3
"""
Historical Backfill Runner

Runs historical scrapers for Ecovantage, Northmore Gordon, and CER,
stores results in the SQLite intelligence database, cross-validates
ESC prices between sources, and generates a backfill report.

Usage:
    python -m forecasting.scrapers.run_historical_backfill
"""

import json
import os
import sqlite3
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

# Ensure project root is on path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from forecasting.scrapers.base import ScrapedDocument
from forecasting.scrapers.ecovantage_scraper import scrape_historical as eco_historical
from forecasting.scrapers.northmore_scraper import scrape_historical as nmg_historical
from forecasting.scrapers.cer_scraper import scrape_quarterly_reports

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "intelligence_documents.db")

# Schema for the genuine_price_observations table
CREATE_PRICES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS genuine_price_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_ending TEXT NOT NULL,
    source_name TEXT NOT NULL,
    instrument TEXT NOT NULL,
    spot_price REAL NOT NULL,
    creation_volume INTEGER,
    data_quality TEXT NOT NULL DEFAULT 'genuine_weekly',
    document_url TEXT,
    published_date TEXT,
    ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(week_ending, source_name, instrument)
);
"""

CREATE_PRICES_INDEX_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_gpo_week ON genuine_price_observations(week_ending);",
    "CREATE INDEX IF NOT EXISTS idx_gpo_instrument ON genuine_price_observations(instrument);",
]


def _init_prices_table(db_path: str) -> None:
    """Ensure the genuine_price_observations table exists."""
    conn = sqlite3.connect(db_path)
    try:
        conn.execute(CREATE_PRICES_TABLE_SQL)
        for idx_sql in CREATE_PRICES_INDEX_SQL:
            conn.execute(idx_sql)
        conn.commit()
    finally:
        conn.close()


def _add_data_quality_column(db_path: str) -> None:
    """Add data_quality column to the intelligence documents table if missing."""
    conn = sqlite3.connect(db_path)
    try:
        # Check if column exists
        cursor = conn.execute("PRAGMA table_info(public_intelligence_documents)")
        columns = [row[1] for row in cursor.fetchall()]
        if "data_quality" not in columns:
            conn.execute(
                "ALTER TABLE public_intelligence_documents ADD COLUMN data_quality TEXT DEFAULT 'scraped'"
            )
            conn.commit()
            print("[db] Added data_quality column to public_intelligence_documents")
    finally:
        conn.close()


def _friday_of_week(dt: datetime) -> str:
    """Return the ISO date string of the Friday of the week containing dt."""
    days_to_friday = (4 - dt.weekday()) % 7
    friday = dt.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta
    friday = friday + timedelta(days=days_to_friday)
    return friday.strftime("%Y-%m-%d")


def _store_document(db_path: str, doc: ScrapedDocument, data_quality: str = "genuine_weekly") -> bool:
    """Store a ScrapedDocument in the intelligence DB. Returns True if inserted."""
    conn = sqlite3.connect(db_path)
    try:
        pub_date = None
        if doc.published_date:
            pub_date = doc.published_date.isoformat() if isinstance(doc.published_date, datetime) else str(doc.published_date)

        cursor = conn.execute(
            """INSERT OR IGNORE INTO public_intelligence_documents
                (source_url, document_url, source_name, document_type,
                 title, published_date, content_hash, relevance_score,
                 content_text, data_quality)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                doc.source_url, doc.document_url, doc.source_name,
                doc.document_type, doc.title, pub_date,
                doc.content_hash, 1.0, doc.content_text, data_quality,
            ),
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def _store_price_observation(
    db_path: str,
    week_ending: str,
    source_name: str,
    instrument: str,
    spot_price: float,
    creation_volume: Optional[int],
    document_url: str,
    published_date: Optional[str],
) -> bool:
    """Store a structured price observation. Returns True if inserted."""
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.execute(
            """INSERT OR REPLACE INTO genuine_price_observations
                (week_ending, source_name, instrument, spot_price,
                 creation_volume, data_quality, document_url, published_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                week_ending, source_name, instrument, spot_price,
                creation_volume, "genuine_weekly", document_url, published_date,
            ),
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def _extract_and_store_prices(db_path: str, docs: List[ScrapedDocument], source: str) -> Dict[str, int]:
    """Extract prices from scraped documents and store in genuine_price_observations."""
    counts: Dict[str, int] = {}

    for doc in docs:
        if not doc.published_date:
            continue

        week_ending = _friday_of_week(doc.published_date)
        pub_date_str = doc.published_date.isoformat() if isinstance(doc.published_date, datetime) else str(doc.published_date)

        # Parse prices from content_text (JSON)
        try:
            content = json.loads(doc.content_text)
            prices = content.get("prices", content)  # May be nested or flat
        except (json.JSONDecodeError, TypeError):
            continue

        # Map price keys to instrument codes
        instrument_map = {
            "esc_spot_price": "ESC",
            "veec_spot_price": "VEEC",
            "lgc_spot_price": "LGC",
            "stc_spot_price": "STC",
            "accu_spot_price": "ACCU",
            "prc_spot_price": "PRC",
        }

        creation_volume = prices.get("esc_creation_volume")

        for price_key, instrument in instrument_map.items():
            if price_key in prices:
                stored = _store_price_observation(
                    db_path, week_ending, source, instrument,
                    prices[price_key], creation_volume if instrument == "ESC" else None,
                    doc.document_url, pub_date_str,
                )
                if stored:
                    counts[instrument] = counts.get(instrument, 0) + 1

    return counts


def _cross_validate_esc(db_path: str) -> Dict[str, Any]:
    """
    Cross-validate ESC spot prices between Ecovantage and NMG for
    overlapping weeks. Flag discrepancies exceeding A$0.50.
    """
    conn = sqlite3.connect(db_path)
    try:
        rows = conn.execute("""
            SELECT e.week_ending, e.spot_price AS eco_price, n.spot_price AS nmg_price,
                   ABS(e.spot_price - n.spot_price) AS discrepancy
            FROM genuine_price_observations e
            JOIN genuine_price_observations n
                ON e.week_ending = n.week_ending
                AND e.instrument = n.instrument
            WHERE e.source_name = 'ecovantage'
              AND n.source_name = 'northmore-gordon'
              AND e.instrument = 'ESC'
            ORDER BY e.week_ending
        """).fetchall()

        weeks_compared = len(rows)
        discrepancies = [r for r in rows if r[3] > 0.50]
        max_disc = max((r[3] for r in rows), default=0.0)

        result = {
            "weeks_compared": weeks_compared,
            "discrepancies_over_050": len(discrepancies),
            "max_discrepancy": round(max_disc, 2),
            "details": [
                {
                    "week_ending": r[0],
                    "ecovantage_price": r[1],
                    "nmg_price": r[2],
                    "discrepancy": round(r[3], 2),
                }
                for r in discrepancies
            ],
        }

        if discrepancies:
            print(f"  [cross-validation] {len(discrepancies)} weeks with ESC discrepancy > $0.50:")
            for d in result["details"][:5]:
                print(f"    {d['week_ending']}: Eco ${d['ecovantage_price']:.2f} vs NMG ${d['nmg_price']:.2f} (Δ${d['discrepancy']:.2f})")
        else:
            print(f"  [cross-validation] {weeks_compared} weeks compared — no discrepancies > $0.50")

        return result
    finally:
        conn.close()


def _generate_backfill_report(
    db_path: str,
    eco_count: int,
    nmg_count: int,
    cer_count: int,
    cross_validation: Dict[str, Any],
    errors: List[str],
) -> Dict[str, Any]:
    """Generate the backfill summary report."""
    conn = sqlite3.connect(db_path)
    try:
        # Date range
        row = conn.execute(
            "SELECT MIN(week_ending), MAX(week_ending) FROM genuine_price_observations"
        ).fetchone()
        date_range = {"start": row[0] or "N/A", "end": row[1] or "N/A"}

        # Instruments covered
        instruments = [r[0] for r in conn.execute(
            "SELECT DISTINCT instrument FROM genuine_price_observations ORDER BY instrument"
        ).fetchall()]

        # ACCU observations from CER
        cer_accu = conn.execute(
            "SELECT COUNT(*) FROM genuine_price_observations WHERE source_name = 'cer' AND instrument = 'ACCU'"
        ).fetchone()[0]

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "ecovantage_observations": eco_count,
            "nmg_observations": nmg_count,
            "cer_accu_observations": cer_count + cer_accu,
            "date_range": date_range,
            "cross_validation": {
                "weeks_compared": cross_validation["weeks_compared"],
                "discrepancies_over_050": cross_validation["discrepancies_over_050"],
                "max_discrepancy": cross_validation["max_discrepancy"],
            },
            "instruments_covered": instruments,
            "errors": errors,
        }
    finally:
        conn.close()


def run_backfill() -> Dict[str, Any]:
    """Execute the full historical backfill pipeline."""
    db_path = os.path.abspath(DB_PATH)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    print("=" * 60)
    print("HISTORICAL BACKFILL — Session B")
    print("=" * 60)

    # Init DB schema
    _init_prices_table(db_path)
    _add_data_quality_column(db_path)

    errors: List[str] = []

    # --- 2a: Ecovantage historical ---
    print("\n[1/4] Ecovantage historical scrape (2022-01-01 to present)...")
    try:
        eco_docs = eco_historical(start_date="2022-01-01", end_date="2026-04-07")
        for doc in eco_docs:
            _store_document(db_path, doc, data_quality="genuine_weekly")
        eco_prices = _extract_and_store_prices(db_path, eco_docs, "ecovantage")
        eco_total = sum(eco_prices.values())
        print(f"  Ecovantage: {len(eco_docs)} documents, {eco_total} price observations")
        for inst, count in sorted(eco_prices.items()):
            print(f"    {inst}: {count} observations")
    except Exception as e:
        eco_total = 0
        eco_docs = []
        errors.append(f"ecovantage: {e}")
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- 2b: NMG historical ---
    print("\n[2/4] Northmore Gordon historical scrape (2022-01-01 to present)...")
    try:
        nmg_docs = nmg_historical(start_date="2022-01-01", end_date="2026-04-07")
        for doc in nmg_docs:
            _store_document(db_path, doc, data_quality="genuine_weekly")
        nmg_prices = _extract_and_store_prices(db_path, nmg_docs, "northmore-gordon")
        nmg_total = sum(nmg_prices.values())
        print(f"  NMG: {len(nmg_docs)} documents, {nmg_total} price observations")
        for inst, count in sorted(nmg_prices.items()):
            print(f"    {inst}: {count} observations")
    except Exception as e:
        nmg_total = 0
        nmg_docs = []
        errors.append(f"nmg: {e}")
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- 2c: Cross-validation ---
    print("\n[3/4] Cross-validating ESC prices...")
    cross_validation = _cross_validate_esc(db_path)

    # --- 2d: CER quarterly reports ---
    print("\n[4/4] CER quarterly reports scrape...")
    try:
        cer_docs = scrape_quarterly_reports()
        for doc in cer_docs:
            _store_document(db_path, doc, data_quality="genuine_weekly")
        cer_prices = _extract_and_store_prices(db_path, cer_docs, "cer")
        cer_total = sum(cer_prices.values())
        print(f"  CER: {len(cer_docs)} documents, {cer_total} price observations")
    except Exception as e:
        cer_total = 0
        errors.append(f"cer: {e}")
        print(f"  ERROR: {e}", file=sys.stderr)

    # --- 2e: Generate report ---
    print("\nGenerating backfill report...")
    report = _generate_backfill_report(
        db_path, eco_total, nmg_total, cer_total,
        cross_validation, errors,
    )

    report_path = os.path.join(os.path.dirname(__file__), "backfill_report.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Report written to {report_path}")

    # Summary
    print("\n" + "=" * 60)
    print("BACKFILL SUMMARY")
    print("=" * 60)
    print(f"  Ecovantage observations: {eco_total}")
    print(f"  NMG observations: {nmg_total}")
    print(f"  CER observations: {cer_total}")
    print(f"  Date range: {report['date_range']['start']} to {report['date_range']['end']}")
    print(f"  Instruments: {', '.join(report['instruments_covered'])}")
    print(f"  Cross-validation: {cross_validation['weeks_compared']} weeks, "
          f"{cross_validation['discrepancies_over_050']} discrepancies > $0.50")
    if errors:
        print(f"  Errors: {len(errors)}")
        for err in errors:
            print(f"    - {err}")

    return report


if __name__ == "__main__":
    run_backfill()
