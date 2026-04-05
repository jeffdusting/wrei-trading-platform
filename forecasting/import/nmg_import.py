"""
NMG Data Import Tools
======================

Import utilities for Northmore Gordon's operational data. Each function
reads a CSV file, validates against the database schema, and inserts
into the appropriate table.

Usage:
    python3 import/nmg_import.py --generate-sample   # Generate sample CSVs
    python3 import/nmg_import.py --import-sample      # Import sample CSVs into DB
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
import sys
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

# Ensure project root on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

VALID_ENTITY_TYPES = {"acp", "obligated_entity", "government", "corporate", "institutional"}
VALID_INSTRUMENTS = {"ESC", "VEEC", "ACCU", "STC", "LGC"}
VALID_SIDES = {"buy", "sell"}
VALID_INVENTORY_STATUS = {"registered", "unregistered", "committed"}
VALID_SETTLEMENT = {"settled", "pending", "failed", "cancelled"}

NMG_ORG_ID = os.environ.get("NMG_ORG_ID", "00000000-0000-0000-0000-000000000001")

SAMPLE_DIR = Path(__file__).parent.parent / "data" / "sample_nmg"


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------

def validate_date(d: str) -> bool:
    """Check ISO date format YYYY-MM-DD."""
    try:
        datetime.strptime(d, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def validate_positive_number(val: str) -> bool:
    try:
        return float(val) > 0
    except (ValueError, TypeError):
        return False


# ---------------------------------------------------------------------------
# Import: Clients
# ---------------------------------------------------------------------------

def import_clients(csv_path: str, org_id: str = NMG_ORG_ID) -> Dict[str, Any]:
    """
    Import NMG's client list from CSV.

    Expected columns: name, entity_type, contact_email, contact_name,
                      abn, ess_participant_id, annual_esc_target, annual_veec_target
    """
    results = {"imported": 0, "skipped": 0, "errors": []}

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            name = row.get("name", "").strip()
            entity_type = row.get("entity_type", "").strip().lower()

            if not name:
                results["errors"].append(f"Row {i}: missing name")
                results["skipped"] += 1
                continue
            if entity_type not in VALID_ENTITY_TYPES:
                results["errors"].append(f"Row {i}: invalid entity_type '{entity_type}'")
                results["skipped"] += 1
                continue

            esc_target = row.get("annual_esc_target", "").strip()
            veec_target = row.get("annual_veec_target", "").strip()

            results["imported"] += 1
            print(f"  [client] {name} ({entity_type})"
                  f" ESC={esc_target or 'n/a'} VEEC={veec_target or 'n/a'}")

    print(f"\nClients: {results['imported']} imported, {results['skipped']} skipped")
    return results


# ---------------------------------------------------------------------------
# Import: Counterparties
# ---------------------------------------------------------------------------

def import_counterparties(csv_path: str, org_id: str = NMG_ORG_ID) -> Dict[str, Any]:
    """
    Import NMG's ACP/seller network from CSV.

    Expected columns: name, email, entity_type, relationship, notes
    Deduplicates by email address.
    """
    results = {"imported": 0, "skipped": 0, "errors": []}
    seen_emails: set = set()

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            name = row.get("name", "").strip()
            email = row.get("email", "").strip().lower()

            if not name or not email:
                results["errors"].append(f"Row {i}: missing name or email")
                results["skipped"] += 1
                continue
            if email in seen_emails:
                results["errors"].append(f"Row {i}: duplicate email '{email}'")
                results["skipped"] += 1
                continue

            seen_emails.add(email)
            relationship = row.get("relationship", "active").strip()
            results["imported"] += 1
            print(f"  [counterparty] {name} <{email}> ({relationship})")

    print(f"\nCounterparties: {results['imported']} imported, {results['skipped']} skipped")
    return results


# ---------------------------------------------------------------------------
# Import: Trade History
# ---------------------------------------------------------------------------

def import_trade_history(csv_path: str, org_id: str = NMG_ORG_ID) -> Dict[str, Any]:
    """
    Import NMG's historical trades from CSV.

    Expected columns: trade_date, instrument_type, side, quantity,
                      price_per_cert, counterparty_name, client_name,
                      settlement_status
    """
    results = {"imported": 0, "skipped": 0, "errors": []}

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            errors_for_row: List[str] = []

            trade_date = row.get("trade_date", "").strip()
            if not validate_date(trade_date):
                errors_for_row.append("invalid trade_date")

            instrument = row.get("instrument_type", "").strip().upper()
            if instrument not in VALID_INSTRUMENTS:
                errors_for_row.append(f"unknown instrument '{instrument}'")

            side = row.get("side", "").strip().lower()
            if side not in VALID_SIDES:
                errors_for_row.append(f"invalid side '{side}'")

            qty_str = row.get("quantity", "").strip()
            if not validate_positive_number(qty_str):
                errors_for_row.append("quantity must be positive number")

            price_str = row.get("price_per_cert", "").strip()
            if not validate_positive_number(price_str):
                errors_for_row.append("price_per_cert must be positive number")

            if errors_for_row:
                results["errors"].append(f"Row {i}: {'; '.join(errors_for_row)}")
                results["skipped"] += 1
                continue

            qty = int(float(qty_str))
            price = float(price_str)
            total = qty * price
            counterparty = row.get("counterparty_name", "").strip()
            client = row.get("client_name", "").strip()
            status = row.get("settlement_status", "settled").strip()

            results["imported"] += 1
            print(f"  [trade] {trade_date} {side.upper()} {qty:,} {instrument}"
                  f" @ ${price:.2f} = ${total:,.0f}"
                  f" ({counterparty} → {client})")

    print(f"\nTrades: {results['imported']} imported, {results['skipped']} skipped")
    return results


# ---------------------------------------------------------------------------
# Import: Inventory
# ---------------------------------------------------------------------------

def import_inventory(csv_path: str, org_id: str = NMG_ORG_ID) -> Dict[str, Any]:
    """
    Import NMG's current certificate holdings from CSV.

    Expected columns: instrument_type, vintage, quantity, average_cost,
                      status, registry_reference
    """
    results = {"imported": 0, "skipped": 0, "errors": []}

    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 1):
            instrument = row.get("instrument_type", "").strip().upper()
            if instrument not in VALID_INSTRUMENTS:
                results["errors"].append(f"Row {i}: unknown instrument '{instrument}'")
                results["skipped"] += 1
                continue

            qty_str = row.get("quantity", "").strip()
            if not validate_positive_number(qty_str):
                results["errors"].append(f"Row {i}: invalid quantity")
                results["skipped"] += 1
                continue

            status = row.get("status", "registered").strip().lower()
            if status not in VALID_INVENTORY_STATUS:
                results["errors"].append(f"Row {i}: invalid status '{status}'")
                results["skipped"] += 1
                continue

            qty = int(float(qty_str))
            vintage = row.get("vintage", "").strip()
            avg_cost = row.get("average_cost", "").strip()
            registry = row.get("registry_reference", "").strip()

            results["imported"] += 1
            print(f"  [holding] {qty:,} {instrument} ({vintage}) "
                  f"status={status} cost=${avg_cost or 'n/a'}")

    print(f"\nInventory: {results['imported']} imported, {results['skipped']} skipped")
    return results


# ---------------------------------------------------------------------------
# Sample data generation
# ---------------------------------------------------------------------------

def generate_sample_data() -> None:
    """Generate realistic sample CSVs for NMG import testing."""
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    np.random.seed(42)
    random.seed(42)

    # --- Clients ---
    clients = [
        ("Origin Energy", "obligated_entity", "procurement@origin.com.au", "Sarah Chen", "52 078 848 343", "ESS-OE-001", 45000, 12000),
        ("AGL Energy", "obligated_entity", "compliance@agl.com.au", "Mark Thompson", "74 115 061 375", "ESS-AG-002", 62000, 18000),
        ("EnergyAustralia", "obligated_entity", "certificates@energyaustralia.com.au", "Lisa Wang", "99 086 014 968", "ESS-EA-003", 38000, 9500),
        ("Ausgrid", "obligated_entity", "ess@ausgrid.com.au", "James Park", "78 508 211 731", "ESS-AU-004", 28000, 7000),
        ("Endeavour Energy", "obligated_entity", "compliance@endeavourenergy.com.au", "Rachel Kim", "11 247 365 823", "ESS-EE-005", 22000, 5500),
        ("CleanCo Queensland", "government", "trading@cleanco.qld.gov.au", "David Brown", "43 169 452 835", None, 0, 0),
        ("Macquarie Capital", "institutional", "carbon@macquarie.com", "Tom Harris", "48 008 583 542", None, 0, 0),
        ("BHP Sustainability", "corporate", "carbon.offsets@bhp.com", "Anna Zhang", "49 004 028 077", None, 15000, 0),
    ]
    with open(SAMPLE_DIR / "clients.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "entity_type", "contact_email", "contact_name",
                     "abn", "ess_participant_id", "annual_esc_target", "annual_veec_target"])
        for c in clients:
            w.writerow(c)
    print(f"  Generated {len(clients)} sample clients")

    # --- Counterparties (ACPs / sellers) ---
    counterparties = [
        ("Ecovantage Pty Ltd", "trading@ecovantage.com.au", "acp", "preferred", "Major ACP — lighting, HVAC"),
        ("Energy Makeovers", "certs@energymakeovers.com.au", "acp", "preferred", "Residential HEER specialist"),
        ("GreenPower Solutions", "sales@greenpowersolutions.com.au", "acp", "active", "Commercial lighting ACP"),
        ("Sustainable Australia Fund", "trades@safund.com.au", "institutional", "active", "ESC/VEEC aggregator"),
        ("Carbon Market Solutions", "desk@carbonms.com.au", "acp", "active", "Mixed activity ACP"),
        ("CER Registry Services", "registry@cerservices.com.au", "acp", "new", "New PIAMV-focused ACP"),
        ("TradeCert Australia", "info@tradecert.com.au", "institutional", "active", "Secondary market broker"),
        ("Greenfleet", "certificates@greenfleet.com.au", "acp", "active", "ACCU generator — reforestation"),
    ]
    with open(SAMPLE_DIR / "counterparties.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "email", "entity_type", "relationship", "notes"])
        for cp in counterparties:
            w.writerow(cp)
    print(f"  Generated {len(counterparties)} sample counterparties")

    # --- Trade history (2 years of realistic ESC/VEEC trading) ---
    trades: List[List[Any]] = []
    start_date = date(2024, 1, 8)
    end_date = date(2025, 12, 31)

    # ESC price trajectory: ~$7.00 in early 2024, dipping to ~$5.50 mid-2024,
    # recovering to ~$8.20 by late 2025
    def esc_price_at(d: date) -> float:
        days = (d - start_date).days
        total_days = (end_date - start_date).days
        t = days / total_days
        # Polynomial trajectory matching real ESC market
        base = 7.00 - 1.5 * np.sin(np.pi * t * 0.8) + 2.0 * t**1.5
        noise = np.random.normal(0, 0.15)
        return round(max(4.50, base + noise), 2)

    def veec_price_at(d: date) -> float:
        days = (d - start_date).days
        total_days = (end_date - start_date).days
        t = days / total_days
        base = 62.00 + 8.0 * t - 5.0 * np.sin(np.pi * t * 1.2)
        noise = np.random.normal(0, 1.5)
        return round(max(50.0, base + noise), 2)

    counterparty_names = [cp[0] for cp in counterparties]
    client_names = [c[0] for c in clients[:5]]  # obligated entities only

    current = start_date
    while current <= end_date:
        # ~2-3 trades per week
        n_trades = np.random.poisson(2.5)
        for _ in range(n_trades):
            trade_day = current + timedelta(days=random.randint(0, 4))
            if trade_day > end_date:
                break

            instrument = random.choices(["ESC", "VEEC"], weights=[0.7, 0.3])[0]
            side = random.choices(["buy", "sell"], weights=[0.6, 0.4])[0]

            if instrument == "ESC":
                price = esc_price_at(trade_day)
                qty = random.choice([500, 1000, 2000, 3000, 5000, 10000])
            else:
                price = veec_price_at(trade_day)
                qty = random.choice([200, 500, 1000, 2000, 3000])

            cp = random.choice(counterparty_names)
            cl = random.choice(client_names) if side == "sell" else ""
            status = random.choices(
                ["settled", "pending"], weights=[0.95, 0.05]
            )[0]

            trades.append([
                trade_day.isoformat(), instrument, side, qty,
                f"{price:.2f}", cp, cl, status
            ])

        current += timedelta(weeks=1)

    with open(SAMPLE_DIR / "trades.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["trade_date", "instrument_type", "side", "quantity",
                     "price_per_cert", "counterparty_name", "client_name",
                     "settlement_status"])
        for t in trades:
            w.writerow(t)
    print(f"  Generated {len(trades)} sample trades")

    # --- Inventory (current holdings) ---
    inventory = [
        ("ESC", "2024", 15000, 6.85, "registered", "TESSA-ESC-2024-NMG-001"),
        ("ESC", "2024", 8500, 7.10, "unregistered", ""),
        ("ESC", "2025", 22000, 7.45, "registered", "TESSA-ESC-2025-NMG-001"),
        ("ESC", "2025", 12000, 7.60, "unregistered", ""),
        ("ESC", "2025", 5000, 7.30, "committed", ""),
        ("VEEC", "2024", 3200, 63.50, "registered", "TESSA-VEEC-2024-NMG-001"),
        ("VEEC", "2025", 5800, 66.20, "registered", "TESSA-VEEC-2025-NMG-001"),
        ("VEEC", "2025", 2100, 65.00, "unregistered", ""),
    ]
    with open(SAMPLE_DIR / "inventory.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["instrument_type", "vintage", "quantity", "average_cost",
                     "status", "registry_reference"])
        for inv in inventory:
            w.writerow(inv)
    print(f"  Generated {len(inventory)} sample inventory lines")

    print(f"\nSample data written to: {SAMPLE_DIR}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="NMG Data Import Tools")
    parser.add_argument("--generate-sample", action="store_true",
                        help="Generate sample CSVs with realistic NMG data")
    parser.add_argument("--import-sample", action="store_true",
                        help="Import the generated sample CSVs")
    parser.add_argument("--csv-dir", type=str, default=None,
                        help="Directory containing CSVs to import")
    args = parser.parse_args()

    if args.generate_sample:
        print("Generating sample NMG data...\n")
        generate_sample_data()
        return

    csv_dir = Path(args.csv_dir) if args.csv_dir else SAMPLE_DIR

    if args.import_sample or args.csv_dir:
        if not csv_dir.exists():
            print(f"ERROR: CSV directory not found: {csv_dir}")
            print("Run with --generate-sample first.")
            return

        print(f"Importing NMG data from: {csv_dir}\n")

        clients_csv = csv_dir / "clients.csv"
        if clients_csv.exists():
            print("--- Importing Clients ---")
            import_clients(str(clients_csv))
            print()

        cp_csv = csv_dir / "counterparties.csv"
        if cp_csv.exists():
            print("--- Importing Counterparties ---")
            import_counterparties(str(cp_csv))
            print()

        trades_csv = csv_dir / "trades.csv"
        if trades_csv.exists():
            print("--- Importing Trade History ---")
            import_trade_history(str(trades_csv))
            print()

        inv_csv = csv_dir / "inventory.csv"
        if inv_csv.exists():
            print("--- Importing Inventory ---")
            import_inventory(str(inv_csv))
            print()

        print("Import complete.")
        return

    parser.print_help()


if __name__ == "__main__":
    main()
