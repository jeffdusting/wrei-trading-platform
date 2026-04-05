#!/usr/bin/env python3
"""
Monitoring Orchestrator
========================

Runs after daily data ingestion to check for new intelligence
and detect anomalies in structured market data.

Usage:
    python3 forecasting/monitoring/run_monitor.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.monitoring.monitor import run_monitor, store_alert, _get_db_connection
from forecasting.monitoring.anomaly_detector import detect_anomalies


def main() -> None:
    print("=" * 60)
    print("WREI ESC Market Intelligence — Monitoring Run")
    print("=" * 60)

    # 1. Run source monitors (IPART, brokers, DCCEEW)
    monitor_result = run_monitor()

    # 2. Run anomaly detection on structured data
    anomaly_alerts = detect_anomalies()

    # 3. Store anomaly alerts
    conn = _get_db_connection()
    stored = 0
    for alert in anomaly_alerts:
        alert_id = store_alert(conn, alert)
        if alert_id:
            stored += 1
    if conn:
        conn.close()

    # 4. Summary
    total_alerts = monitor_result["alerts_generated"] + len(anomaly_alerts)
    total_stored = monitor_result["alerts_stored"] + stored

    print(f"\n{'=' * 60}")
    print(f"MONITORING SUMMARY")
    print(f"{'=' * 60}")
    print(f"  Source alerts:  {monitor_result['alerts_generated']}")
    print(f"  Anomaly alerts: {len(anomaly_alerts)}")
    print(f"  Total alerts:   {total_alerts}")
    print(f"  Stored to DB:   {total_stored}")
    print(f"  Regime change:  {monitor_result['regime_change_detected']}")

    # Output combined results as JSON
    combined = {
        "monitor": monitor_result,
        "anomalies": [a.to_dict() for a in anomaly_alerts],
        "total_alerts": total_alerts,
    }
    print(f"\n{json.dumps(combined, indent=2, default=str)}")


if __name__ == "__main__":
    main()
