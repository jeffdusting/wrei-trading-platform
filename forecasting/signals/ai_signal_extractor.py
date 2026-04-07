"""
AI Signal Extraction for ESC Market Intelligence
==================================================

Calls the Claude API (via HTTP) to process unstructured text and extract
structured market signals from:
  1. IPART policy documents (consultation papers, rule changes, compliance notices)
  2. Broker market commentary (Ecovantage, Northmore Gordon weekly updates)
  3. Legislative records (NSW parliamentary, DCCEEW publications)

Returns structured JSON signals that feed into the ML counterfactual model.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Dict, List, Optional

import requests


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
DEFAULT_MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 500
MAX_EXTRACTION_TOKENS = 512
ANTHROPIC_VERSION = "2023-06-01"
MAX_CALLS_PER_RUN = 30


def _get_api_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not key:
        raise EnvironmentError("ANTHROPIC_API_KEY not set")
    return key


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class PolicySignal:
    """Structured signal extracted from a policy document."""
    affected_activities: List[str]
    supply_impact_direction: str   # increase | decrease | neutral
    supply_impact_magnitude_pct: float
    demand_impact_direction: str   # increase | decrease | neutral
    implementation_date: Optional[str]
    confidence: float
    summary: str
    source_type: str = "policy_change"
    extraction_date: str = field(default_factory=lambda: date.today().isoformat())


@dataclass
class BrokerSentiment:
    """Structured sentiment extracted from broker commentary."""
    overall_sentiment: str        # bullish | neutral | bearish
    price_direction: str          # up | flat | down
    key_themes: List[str]
    creation_trend: str           # accelerating | stable | decelerating
    supply_concern_level: float   # 0-10
    notable_data_points: List[Dict[str, Any]]
    source: str = ""
    extraction_date: str = field(default_factory=lambda: date.today().isoformat())


@dataclass
class LegislativeSignal:
    """Structured signal from legislative/regulatory records."""
    signal_type: str              # target_adjustment | new_scheme | sunset_clause | amendment
    affected_scheme: str
    change_description: str
    effective_date: Optional[str]
    supply_impact_pct: float
    demand_impact_pct: float
    confidence: float
    source: str = ""
    extraction_date: str = field(default_factory=lambda: date.today().isoformat())


# ---------------------------------------------------------------------------
# Claude API call helper
# ---------------------------------------------------------------------------

def _call_claude(prompt: str, system: str, max_retries: int = 2) -> Dict[str, Any]:
    """Call Claude API and return parsed JSON response."""
    api_key = _get_api_key()
    headers = {
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
    }
    payload = {
        "model": DEFAULT_MODEL,
        "max_tokens": MAX_TOKENS,
        "system": system,
        "messages": [{"role": "user", "content": prompt}],
    }

    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(
                ANTHROPIC_API_URL,
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()
            text = data["content"][0]["text"]
            # Strip markdown code fences if present
            text = text.strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
            return json.loads(text)
        except (requests.RequestException, json.JSONDecodeError, KeyError) as exc:
            if attempt < max_retries:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise RuntimeError(f"Claude API call failed after {max_retries + 1} attempts: {exc}") from exc

    return {}  # unreachable


# ---------------------------------------------------------------------------
# Enhanced signal extraction (P2-C)
# ---------------------------------------------------------------------------

ENHANCED_SYSTEM_PROMPT = (
    "You are an expert analyst of the Australian Energy Savings Certificate (ESC) "
    "market. You are extracting structured market signals from a document to feed "
    "into a quantitative forecasting model.\n\n"
    "The ESC market operates under the NSW Energy Savings Scheme (ESS), administered "
    "by IPART. Key dynamics:\n"
    "- ESC prices are bounded above by the IPART penalty rate (currently A$29.48/certificate)\n"
    "- Supply is driven by certificate creation from accredited activities (commercial "
    "lighting phase-out completing Dec 2026 removes ~22% of creation volume)\n"
    "- Demand is driven by obligated entity surrender requirements\n"
    "- The market has three regimes: surplus (oversupplied, prices low), balanced, "
    "tightening (undersupplied, prices approach penalty ceiling)\n\n"
    "Analyse the following document and extract a structured signal. Be conservative "
    "— only flag a signal as active if the document contains specific, actionable "
    "information that would change a trader's view of ESC supply, demand, or pricing "
    "within the next 26 weeks.\n\n"
    "Respond with ONLY a JSON object matching this exact schema:\n"
    "{\n"
    '    "policy_signal_active": true/false,\n'
    '    "supply_impact_pct": float between -1.0 and 1.0 (negative = supply reduction, positive = supply increase),\n'
    '    "demand_impact_pct": float between -1.0 and 1.0 (negative = demand reduction, positive = demand increase),\n'
    '    "signal_confidence": float between 0.0 and 1.0,\n'
    '    "signal_horizon_weeks": integer 1-26,\n'
    '    "regime_override_prob": float between 0.0 and 1.0 (probability the market regime should change as a result),\n'
    '    "regime_override_direction": "tightening" or "surplus" or "none",\n'
    '    "event_category": one of "rule_change", "penalty_determination", "activity_phaseout", '
    '"scheme_expansion", "compliance_enforcement", "political_signal", "market_commentary", "cross_scheme"\n'
    "}"
)

VALID_EVENT_CATEGORIES = {
    "rule_change", "penalty_determination", "activity_phaseout",
    "scheme_expansion", "compliance_enforcement", "political_signal",
    "market_commentary", "cross_scheme",
}

VALID_REGIME_DIRECTIONS = {"tightening", "surplus", "none"}


def extract_signal(document: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract an enhanced structured signal from a single document.

    Args:
        document: Dict with keys from the ingestion pipeline —
            source_name, document_type, title, published_date, content_text.

    Returns:
        Dict with the enhanced signal schema including signal_source,
        signal_confidence, signal_horizon_weeks, regime_override_prob,
        regime_override_direction, and event_category.
    """
    source_name = document.get("source_name", "unknown")
    document_type = document.get("document_type", "unknown")
    published_date = document.get("published_date", "unknown")
    title = document.get("title", "")
    content_text = document.get("content_text", "")

    prompt = (
        f"Document source: {source_name}\n"
        f"Document type: {document_type}\n"
        f"Published: {published_date}\n"
        f"Title: {title}\n\n"
        f"Content:\n{content_text[:8000]}"
    )

    api_key = _get_api_key()
    headers = {
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
    }
    payload = {
        "model": DEFAULT_MODEL,
        "max_tokens": MAX_EXTRACTION_TOKENS,
        "temperature": 0,
        "system": ENHANCED_SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": prompt}],
    }

    result: Dict[str, Any] = {}
    for attempt in range(3):
        try:
            resp = requests.post(
                ANTHROPIC_API_URL,
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            text = resp.json()["content"][0]["text"].strip()
            if text.startswith("```"):
                text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
            result = json.loads(text)
            break
        except (requests.RequestException, json.JSONDecodeError, KeyError) as exc:
            if attempt < 2:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise RuntimeError(
                f"Signal extraction failed after 3 attempts: {exc}"
            ) from exc

    # Normalise and clamp values
    signal: Dict[str, Any] = {
        "policy_signal_active": bool(result.get("policy_signal_active", False)),
        "supply_impact_pct": max(-1.0, min(1.0, float(result.get("supply_impact_pct", 0.0)))),
        "demand_impact_pct": max(-1.0, min(1.0, float(result.get("demand_impact_pct", 0.0)))),
        "signal_source": source_name,
        "signal_confidence": max(0.0, min(1.0, float(result.get("signal_confidence", 0.5)))),
        "signal_horizon_weeks": max(1, min(26, int(result.get("signal_horizon_weeks", 12)))),
        "regime_override_prob": max(0.0, min(1.0, float(result.get("regime_override_prob", 0.0)))),
        "regime_override_direction": (
            result.get("regime_override_direction", "none")
            if result.get("regime_override_direction") in VALID_REGIME_DIRECTIONS
            else "none"
        ),
        "event_category": (
            result.get("event_category", "market_commentary")
            if result.get("event_category") in VALID_EVENT_CATEGORIES
            else "market_commentary"
        ),
    }
    return signal


# ---------------------------------------------------------------------------
# Legacy extraction functions (preserved for backward compatibility)
# ---------------------------------------------------------------------------

POLICY_SYSTEM = (
    "You are analysing a policy document from the NSW Energy Savings Scheme regulator. "
    "Extract a structured assessment of its impact on the ESC market. "
    "Return JSON only, no preamble."
)

POLICY_SCHEMA = (
    "Return this exact JSON schema: "
    '{ "affected_activities": [list of strings], '
    '"supply_impact_direction": "increase"|"decrease"|"neutral", '
    '"supply_impact_magnitude_pct": number (-100 to +100), '
    '"demand_impact_direction": "increase"|"decrease"|"neutral", '
    '"implementation_date": "YYYY-MM-DD" or null, '
    '"confidence": number (0-1), '
    '"summary": "one sentence" }'
)


def extract_policy_signal(
    document_text: str,
    document_type: str,
    publication_date: str,
) -> PolicySignal:
    """
    Extract a structured policy signal from an IPART document.

    Args:
        document_text: Full text of the policy document.
        document_type: consultation_paper | position_paper | rule_change | compliance_notice
        publication_date: ISO date string.

    Returns:
        PolicySignal with structured impact assessment.
    """
    prompt = (
        f"Document type: {document_type}\n"
        f"Publication date: {publication_date}\n\n"
        f"{POLICY_SCHEMA}\n\n"
        f"Document text:\n{document_text[:8000]}"
    )

    result = _call_claude(prompt, POLICY_SYSTEM)

    return PolicySignal(
        affected_activities=result.get("affected_activities", []),
        supply_impact_direction=result.get("supply_impact_direction", "neutral"),
        supply_impact_magnitude_pct=float(result.get("supply_impact_magnitude_pct", 0)),
        demand_impact_direction=result.get("demand_impact_direction", "neutral"),
        implementation_date=result.get("implementation_date"),
        confidence=float(result.get("confidence", 0.5)),
        summary=result.get("summary", ""),
        extraction_date=date.today().isoformat(),
    )


BROKER_SYSTEM = (
    "You are analysing a weekly ESC market commentary from an Australian "
    "environmental certificate broker. Return JSON only, no preamble."
)

BROKER_SCHEMA = (
    "Return this exact JSON schema: "
    '{ "overall_sentiment": "bullish"|"neutral"|"bearish", '
    '"price_direction": "up"|"flat"|"down", '
    '"key_themes": [list of 2-4 theme strings], '
    '"creation_trend": "accelerating"|"stable"|"decelerating", '
    '"supply_concern_level": number (0-10), '
    '"notable_data_points": [{ "metric": string, "value": string, "context": string }] }'
)


def extract_broker_sentiment(
    commentary_text: str,
    source: str,
    publication_date: str,
) -> BrokerSentiment:
    """
    Extract structured sentiment from a broker weekly market update.

    Args:
        commentary_text: Full text of the weekly update.
        source: Broker name (e.g. "Ecovantage", "Northmore Gordon").
        publication_date: ISO date string.

    Returns:
        BrokerSentiment with market sentiment assessment.
    """
    prompt = (
        f"Source: {source}\n"
        f"Publication date: {publication_date}\n\n"
        f"{BROKER_SCHEMA}\n\n"
        f"Commentary text:\n{commentary_text[:8000]}"
    )

    result = _call_claude(prompt, BROKER_SYSTEM)

    return BrokerSentiment(
        overall_sentiment=result.get("overall_sentiment", "neutral"),
        price_direction=result.get("price_direction", "flat"),
        key_themes=result.get("key_themes", []),
        creation_trend=result.get("creation_trend", "stable"),
        supply_concern_level=float(result.get("supply_concern_level", 5)),
        notable_data_points=result.get("notable_data_points", []),
        source=source,
        extraction_date=date.today().isoformat(),
    )


LEGISLATIVE_SYSTEM = (
    "You are analysing text from NSW parliamentary records or DCCEEW publications "
    "for changes relevant to the Energy Savings Scheme. Return JSON only, no preamble."
)

LEGISLATIVE_SCHEMA = (
    "Return this exact JSON schema: "
    '{ "signal_type": "target_adjustment"|"new_scheme"|"sunset_clause"|"amendment", '
    '"affected_scheme": string, '
    '"change_description": string, '
    '"effective_date": "YYYY-MM-DD" or null, '
    '"supply_impact_pct": number (-100 to +100), '
    '"demand_impact_pct": number (-100 to +100), '
    '"confidence": number (0-1) }'
)


def extract_legislative_signal(
    text: str,
    source: str,
) -> LegislativeSignal:
    """
    Extract ESS-relevant changes from legislative/regulatory text.

    Args:
        text: Text from NSW parliamentary records or DCCEEW publications.
        source: Source identifier.

    Returns:
        LegislativeSignal with structured change assessment.
    """
    prompt = (
        f"Source: {source}\n\n"
        f"{LEGISLATIVE_SCHEMA}\n\n"
        f"Text:\n{text[:8000]}"
    )

    result = _call_claude(prompt, LEGISLATIVE_SYSTEM)

    return LegislativeSignal(
        signal_type=result.get("signal_type", "amendment"),
        affected_scheme=result.get("affected_scheme", "ESS"),
        change_description=result.get("change_description", ""),
        effective_date=result.get("effective_date"),
        supply_impact_pct=float(result.get("supply_impact_pct", 0)),
        demand_impact_pct=float(result.get("demand_impact_pct", 0)),
        confidence=float(result.get("confidence", 0.5)),
        source=source,
        extraction_date=date.today().isoformat(),
    )


# ---------------------------------------------------------------------------
# Batch processing (P2-C — ingestion pipeline integration)
# ---------------------------------------------------------------------------

def extract_signals_batch(
    documents: List[Dict[str, Any]],
    db_path: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Process queued documents from the ingestion pipeline and extract signals.

    Each document dict should match the schema returned by
    ``IntelligencePipeline.get_pending_documents()`` — keys include id,
    source_name, document_type, title, published_date, content_text.

    Results are written back to the SQLite database via ``mark_extracted``.
    A maximum of MAX_CALLS_PER_RUN (30) API calls are made per invocation;
    remaining documents are left queued for the next run.

    Args:
        documents: List of document dicts from the ingestion pipeline.
        db_path: Optional path to the SQLite DB.  When *None* the pipeline
            default is used.

    Returns:
        List of active signal dicts (only those with policy_signal_active=True).
    """
    # Lazy import to avoid circular dependency at module level
    from forecasting.ingestion.pipeline import IntelligencePipeline

    pipeline = IntelligencePipeline(db_path=db_path)
    active_signals: List[Dict[str, Any]] = []
    calls_made = 0

    for doc in documents:
        if calls_made >= MAX_CALLS_PER_RUN:
            break

        doc_id = doc.get("id")
        try:
            signal = extract_signal(doc)
            calls_made += 1

            # Write result back to SQLite
            if doc_id is not None:
                pipeline.mark_extracted(doc_id, json.dumps(signal))

            if signal.get("policy_signal_active"):
                active_signals.append(signal)

        except Exception:
            # Skip failed documents — they remain queued (signal_extracted=0)
            continue

        # Rate-limit delay between calls
        if calls_made < MAX_CALLS_PER_RUN and calls_made < len(documents):
            time.sleep(0.5)

    return active_signals


# ---------------------------------------------------------------------------
# Self-test (offline — does not call API)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("AI Signal Extractor module loaded successfully.")
    print(f"  API URL: {ANTHROPIC_API_URL}")
    print(f"  Model: {DEFAULT_MODEL}")
    print(f"  Max tokens: {MAX_TOKENS}")

    # Test dataclass creation
    ps = PolicySignal(
        affected_activities=["commercial_lighting"],
        supply_impact_direction="decrease",
        supply_impact_magnitude_pct=-25.0,
        demand_impact_direction="neutral",
        implementation_date="2026-03-31",
        confidence=0.8,
        summary="Commercial lighting method ends March 2026",
    )
    print(f"\n  Sample PolicySignal: {ps.summary}")

    bs = BrokerSentiment(
        overall_sentiment="bullish",
        price_direction="up",
        key_themes=["supply tightening", "target increase"],
        creation_trend="decelerating",
        supply_concern_level=7.0,
        notable_data_points=[],
        source="Ecovantage",
    )
    print(f"  Sample BrokerSentiment: {bs.overall_sentiment}, concern={bs.supply_concern_level}")

    ls = LegislativeSignal(
        signal_type="sunset_clause",
        affected_scheme="ESS",
        change_description="Commercial lighting method ends",
        effective_date="2026-03-31",
        supply_impact_pct=-20.0,
        demand_impact_pct=0.0,
        confidence=0.9,
    )
    print(f"  Sample LegislativeSignal: {ls.signal_type}, supply impact={ls.supply_impact_pct}%")
    print("\nAll dataclass tests passed.")
