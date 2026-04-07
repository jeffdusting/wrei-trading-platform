"""
Anomaly Detection for ESC Market Structured Data
==================================================

Monitors structured market data for anomalies:
  1. Creation velocity slowdown (4w avg drops >20% below 12w avg)
  2. Surplus runway tightening (years-to-exhaustion < 2.0)
  3. Price-to-penalty ratio approaching ceiling (> 0.85)
  4. Forward curve inversion (backwardation)
"""

from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.monitoring.monitor import IntelligenceAlert

DB_URL = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")


def _get_db_connection():
    if not DB_URL:
        return None
    try:
        import psycopg2
        return psycopg2.connect(DB_URL)
    except Exception:
        return None


def _fetch_latest_metrics(conn) -> Optional[Dict[str, Any]]:
    """Fetch the latest market metrics from the database."""
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT creation_velocity_4w, creation_velocity_12w,
                   surplus_runway_years, price_to_penalty_ratio,
                   forward_curve_slope, cumulative_surplus
            FROM market_metrics
            WHERE instrument_type = 'ESC'
            ORDER BY date DESC LIMIT 1
        """)
        row = cur.fetchone()
        cur.close()
        if not row:
            return None
        return {
            "creation_velocity_4w": float(row[0]) if row[0] else None,
            "creation_velocity_12w": float(row[1]) if row[1] else None,
            "surplus_runway_years": float(row[2]) if row[2] else None,
            "price_to_penalty_ratio": float(row[3]) if row[3] else None,
            "forward_curve_slope": float(row[4]) if row[4] else None,
            "cumulative_surplus": float(row[5]) if row[5] else None,
        }
    except Exception as e:
        print(f"[anomaly] Metrics fetch error: {e}", file=sys.stderr)
        return None


def _fetch_forward_vs_spot(conn) -> Optional[Dict[str, float]]:
    """Fetch latest spot and forward prices to detect backwardation."""
    if not conn:
        return None
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT spot_price, forward_3m_price
            FROM market_data_daily
            WHERE instrument_type = 'ESC'
              AND spot_price IS NOT NULL
            ORDER BY date DESC LIMIT 1
        """)
        row = cur.fetchone()
        cur.close()
        if not row or not row[0]:
            return None
        return {
            "spot": float(row[0]),
            "forward_3m": float(row[1]) if row[1] else None,
        }
    except Exception:
        return None


def detect_anomalies() -> List[IntelligenceAlert]:
    """
    Run all anomaly detection checks on latest structured data.
    Returns a list of intelligence alerts for any detected anomalies.
    """
    print("  [anomaly] Running anomaly detection...")
    conn = _get_db_connection()
    alerts: List[IntelligenceAlert] = []
    now = datetime.utcnow().isoformat()

    metrics = _fetch_latest_metrics(conn)
    prices = _fetch_forward_vs_spot(conn)

    if conn:
        conn.close()

    if not metrics:
        print("  [anomaly] No metrics available — skipping.")
        return alerts

    # 1. Creation velocity slowdown
    vel_4w = metrics.get("creation_velocity_4w")
    vel_12w = metrics.get("creation_velocity_12w")
    if vel_4w is not None and vel_12w is not None and vel_12w > 0:
        ratio = vel_4w / vel_12w
        if ratio < 0.80:
            drop_pct = round((1 - ratio) * 100, 1)
            alerts.append(IntelligenceAlert(
                alert_type="creation_anomaly",
                severity="warning",
                title=f"Creation slowdown detected ({drop_pct}% below trend)",
                summary=(
                    f"4-week creation velocity ({vel_4w:,.0f}/wk) has dropped "
                    f"{drop_pct}% below the 12-week average ({vel_12w:,.0f}/wk). "
                    f"This may indicate supply tightening."
                ),
                estimated_price_impact_pct=round(drop_pct * 0.15, 2),
                source="anomaly_detector",
                source_url="",
                metadata={"velocity_4w": vel_4w, "velocity_12w": vel_12w, "ratio": ratio},
                created_at=now,
            ))

    # 2. Surplus runway tightening
    runway = metrics.get("surplus_runway_years")
    if runway is not None and runway < 2.0:
        alerts.append(IntelligenceAlert(
            alert_type="surplus",
            severity="critical" if runway < 1.0 else "warning",
            title=f"Surplus tightening — {runway:.1f} years remaining",
            summary=(
                f"Estimated years-to-exhaustion is {runway:.1f} years. "
                f"At current creation/surrender rates the surplus will be "
                f"depleted {'within a year' if runway < 1.0 else 'within two years'}."
            ),
            estimated_price_impact_pct=round(max(5.0, (2.0 - runway) * 8.0), 2),
            source="anomaly_detector",
            source_url="",
            metadata={"surplus_runway_years": runway},
            created_at=now,
        ))

    # 3. Price-to-penalty ratio approaching ceiling
    ratio = metrics.get("price_to_penalty_ratio")
    if ratio is not None and ratio > 0.85:
        alerts.append(IntelligenceAlert(
            alert_type="surplus",
            severity="critical" if ratio > 0.95 else "warning",
            title=f"Approaching penalty ceiling (ratio={ratio:.2f})",
            summary=(
                f"Price-to-penalty ratio is {ratio:.2f}, indicating the spot price "
                f"is {'at' if ratio > 0.95 else 'near'} the penalty rate ceiling. "
                f"Market participants may shift to penalty payment."
            ),
            estimated_price_impact_pct=round(-2.0 * (ratio - 0.85) * 10, 2),
            source="anomaly_detector",
            source_url="",
            metadata={"price_to_penalty_ratio": ratio},
            created_at=now,
        ))

    # 4. Forward curve inversion (backwardation)
    if prices and prices.get("forward_3m") is not None:
        spot = prices["spot"]
        forward = prices["forward_3m"]
        if forward < spot:
            discount_pct = round((1 - forward / spot) * 100, 2)
            alerts.append(IntelligenceAlert(
                alert_type="creation_anomaly",
                severity="info",
                title=f"Backwardation detected — forward {discount_pct}% below spot",
                summary=(
                    f"Forward price (${forward:.2f}) is below spot (${spot:.2f}), "
                    f"indicating the market expects price decline. "
                    f"This could signal anticipated supply increase or demand reduction."
                ),
                estimated_price_impact_pct=round(-discount_pct, 2),
                source="anomaly_detector",
                source_url="",
                metadata={"spot": spot, "forward_3m": forward, "discount_pct": discount_pct},
                created_at=now,
            ))

    print(f"  [anomaly] {len(alerts)} anomalies detected.")
    return alerts


def detect_policy_event_anomalies(
    signals: List[Dict[str, Any]],
) -> List[IntelligenceAlert]:
    """
    Detect anomalies from AI-extracted policy signals.

    Triggers on documents with:
      - relevance_score > 0.7
      - signal_confidence > 0.6
      - policy_signal_active = True

    Severity:
      - "medium" for signal_confidence 0.6–0.8
      - "high" for signal_confidence > 0.8

    Args:
        signals: List of enhanced signal dicts from extract_signal() or
            extract_signals_batch(), each optionally augmented with
            ``relevance_score`` and ``title`` from the source document.

    Returns:
        List of IntelligenceAlert for detected policy events.
    """
    alerts: List[IntelligenceAlert] = []
    now = datetime.utcnow().isoformat()

    for sig in signals:
        if not sig.get("policy_signal_active"):
            continue

        confidence = float(sig.get("signal_confidence", 0.0))
        relevance = float(sig.get("relevance_score", 1.0))

        if relevance <= 0.7 or confidence <= 0.6:
            continue

        severity = "high" if confidence > 0.8 else "medium"
        source_name = sig.get("signal_source", "unknown")
        title = sig.get("title", "Untitled document")
        category = sig.get("event_category", "unknown")
        supply_impact = sig.get("supply_impact_pct", 0.0)
        demand_impact = sig.get("demand_impact_pct", 0.0)

        # Estimate price impact from supply/demand shifts
        price_impact_pct = round((-supply_impact + demand_impact) * 5.0, 2)

        alerts.append(IntelligenceAlert(
            alert_type="policy_event_detected",
            severity=severity,
            title=f"Policy event: {category} — {title[:80]}",
            summary=(
                f"AI signal extractor detected an active policy event from "
                f"{source_name} (category: {category}). "
                f"Supply impact: {supply_impact:+.1%}, demand impact: {demand_impact:+.1%}. "
                f"Confidence: {confidence:.0%}."
            ),
            estimated_price_impact_pct=price_impact_pct,
            source="ai_signal_override",
            source_url="",
            metadata={
                "signal_confidence": confidence,
                "relevance_score": relevance,
                "event_category": category,
                "supply_impact_pct": supply_impact,
                "demand_impact_pct": demand_impact,
                "signal_source": source_name,
                "document_title": title,
            },
            created_at=now,
        ))

    return alerts


if __name__ == "__main__":
    import json
    alerts = detect_anomalies()
    for a in alerts:
        print(f"  [{a.severity}] {a.title}")
    if not alerts:
        print("  No anomalies detected.")
