"""
Probabilistic Scenario Narrative Generator
============================================

Calls Claude Sonnet 4 to produce a plain-English narrative explaining a
forecast in the context of active market signals and regime probabilities.

The narrative is aimed at an ESC broker or portfolio manager and covers:
  1. What the forecast says and what is driving it
  2. Key risks and signals that could change the outlook
  3. What a broker should consider doing in the current regime

Uses the AI service router if available, otherwise calls the Claude API
directly via HTTP.
"""

from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List, Optional

import requests


ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
DEFAULT_MODEL = "claude-sonnet-4-20250514"
ANTHROPIC_VERSION = "2023-06-01"
MAX_TOKENS = 512
TEMPERATURE = 0.3

SYSTEM_PROMPT = (
    "You are a senior ESC market analyst writing a concise forecast briefing "
    "for an Australian energy certificate broker. Write in plain English. "
    "Be specific — cite prices, percentages, and signal names. "
    "Three paragraphs maximum. No markdown headers. No bullet points. "
    "Australian spelling throughout."
)


def _get_api_key() -> Optional[str]:
    return os.environ.get("ANTHROPIC_API_KEY")


def _build_user_prompt(
    forecast: dict,
    active_signals: list,
    regime_probabilities: dict,
    instrument: str = "ESC",
) -> str:
    """Build the user prompt from forecast data."""
    parts = [f"Instrument: {instrument}"]

    # Forecast summary
    price_4w = forecast.get("price_forecast_4w")
    price_12w = forecast.get("price_forecast_12w")
    ci_80 = forecast.get("confidence_interval_80")
    current = forecast.get("current_price")
    action = forecast.get("recommended_action", "hold")
    confidence = forecast.get("action_confidence", 0.5)

    if current is not None:
        parts.append(f"Current price: A${current:.2f}")
    if price_4w is not None:
        parts.append(f"4-week forecast: A${price_4w:.2f}")
    if price_12w is not None:
        parts.append(f"12-week forecast: A${price_12w:.2f}")
    if ci_80:
        parts.append(f"80% confidence interval (4w): A${ci_80[0]:.2f}–A${ci_80[1]:.2f}")
    parts.append(f"Recommended action: {action} (confidence: {confidence:.0%})")

    # Regime
    if regime_probabilities:
        regime_str = ", ".join(
            f"{k}: {v:.0%}" for k, v in regime_probabilities.items()
        )
        parts.append(f"Regime probabilities: {regime_str}")

    # Active signals
    if active_signals:
        parts.append(f"\nActive signals ({len(active_signals)}):")
        for sig in active_signals[:5]:
            cat = sig.get("event_category", "unknown")
            supply = sig.get("supply_impact_pct", 0)
            demand = sig.get("demand_impact_pct", 0)
            conf = sig.get("signal_confidence", 0)
            parts.append(
                f"  - {cat}: supply {supply:+.1%}, demand {demand:+.1%} "
                f"(confidence {conf:.0%})"
            )
    else:
        parts.append("\nNo active policy signals.")

    # Decision value context
    decision_value = forecast.get("estimated_value_per_cert")
    adjusted_value = forecast.get("adjusted_decision_value")
    if decision_value is not None:
        parts.append(f"\nEstimated value per certificate: A${decision_value:.2f}")
    if adjusted_value is not None:
        parts.append(f"Market-impact-adjusted decision value: A${adjusted_value:,.0f}")

    parts.append(
        "\nWrite a three-paragraph forecast briefing covering: "
        "(1) what the forecast says and what drives it, "
        "(2) key risks and signals, "
        "(3) what the broker should consider doing."
    )

    return "\n".join(parts)


def generate_forecast_narrative(
    forecast: dict,
    active_signals: list,
    regime_probabilities: dict,
    instrument: str = "ESC",
) -> str:
    """
    Generate a plain-English narrative for a forecast.

    Args:
        forecast: Dict with price_forecast_4w, price_forecast_12w,
            confidence_interval_80, recommended_action, etc.
        active_signals: List of active signal dicts from the extractor.
        regime_probabilities: Dict of regime → probability.
        instrument: Instrument code (default "ESC").

    Returns:
        Multi-paragraph narrative string. Falls back to a template-based
        narrative if the API is unavailable.
    """
    api_key = _get_api_key()

    if api_key:
        try:
            return _generate_via_api(
                forecast, active_signals, regime_probabilities, instrument, api_key
            )
        except Exception:
            pass

    # Fallback: template-based narrative
    return _generate_template_narrative(
        forecast, active_signals, regime_probabilities, instrument
    )


def _generate_via_api(
    forecast: dict,
    active_signals: list,
    regime_probabilities: dict,
    instrument: str,
    api_key: str,
) -> str:
    """Call Claude API for narrative generation."""
    user_prompt = _build_user_prompt(
        forecast, active_signals, regime_probabilities, instrument
    )

    headers = {
        "x-api-key": api_key,
        "anthropic-version": ANTHROPIC_VERSION,
        "content-type": "application/json",
    }
    payload = {
        "model": DEFAULT_MODEL,
        "max_tokens": MAX_TOKENS,
        "temperature": TEMPERATURE,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_prompt}],
    }

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
            return text
        except (requests.RequestException, KeyError) as exc:
            if attempt < 2:
                time.sleep(1.0 * (attempt + 1))
                continue
            raise RuntimeError(
                f"Narrative generation failed after 3 attempts: {exc}"
            ) from exc

    return ""  # unreachable


def _generate_template_narrative(
    forecast: dict,
    active_signals: list,
    regime_probabilities: dict,
    instrument: str,
) -> str:
    """
    Template-based fallback when Claude API is unavailable.

    Produces a structured narrative from the forecast data without
    requiring an API call.
    """
    price_4w = forecast.get("price_forecast_4w", 0)
    price_12w = forecast.get("price_forecast_12w", 0)
    current = forecast.get("current_price", 0)
    action = forecast.get("recommended_action", "hold")
    confidence = forecast.get("action_confidence", 0.5)
    ci_80 = forecast.get("confidence_interval_80", (0, 0))

    # Determine dominant regime
    dominant_regime = max(regime_probabilities, key=regime_probabilities.get) if regime_probabilities else "balanced"
    dominant_prob = regime_probabilities.get(dominant_regime, 0.5) if regime_probabilities else 0.5

    # Paragraph 1: Forecast summary
    direction = "higher" if price_4w > current else "lower" if price_4w < current else "unchanged"
    p1 = (
        f"The {instrument} ensemble model forecasts the spot price at "
        f"A${price_4w:.2f} over the next four weeks, {direction} from the "
        f"current A${current:.2f}. The 12-week outlook points to A${price_12w:.2f}, "
        f"with an 80% confidence band of A${ci_80[0]:.2f} to A${ci_80[1]:.2f}. "
        f"The market is currently assessed as {dominant_regime} with "
        f"{dominant_prob:.0%} probability."
    )

    # Paragraph 2: Risks and signals
    if active_signals:
        n_signals = len(active_signals)
        categories = set(s.get("event_category", "unknown") for s in active_signals)
        supply_impacts = [s.get("supply_impact_pct", 0) for s in active_signals]
        net_supply = sum(supply_impacts)
        direction_word = "tightening" if net_supply < 0 else "loosening" if net_supply > 0 else "neutral"
        p2 = (
            f"There are {n_signals} active signal(s) across {', '.join(categories)} "
            f"categories, with a net supply {direction_word} bias. "
            f"Key risk factors include potential method end dates and regulatory "
            f"changes that could accelerate supply contraction. The primary downside "
            f"risk remains surplus overhang if demand growth disappoints."
        )
    else:
        p2 = (
            f"No active policy signals are currently flagged. The primary risk "
            f"to the forecast is a regime shift — either supply tightening from "
            f"activity method end dates or surplus expansion from weaker-than-expected "
            f"demand. Monitor IPART regulatory announcements and weekly creation "
            f"velocity data for early regime change indicators."
        )

    # Paragraph 3: Action recommendation
    if action == "buy":
        p3 = (
            f"The model recommends buying with {confidence:.0%} confidence. "
            f"Brokers should consider accumulating {instrument} certificates at "
            f"current levels, particularly if the forecast proves conservative "
            f"and the market enters a sustained tightening regime."
        )
    elif action == "sell":
        p3 = (
            f"The model recommends selling with {confidence:.0%} confidence. "
            f"Brokers should consider reducing {instrument} exposure at current "
            f"levels and locking in gains ahead of potential price softening."
        )
    else:
        p3 = (
            f"The model recommends holding with {confidence:.0%} confidence. "
            f"Brokers should maintain current {instrument} positions and wait for "
            f"stronger directional signals before committing to new trades."
        )

    return f"{p1}\n\n{p2}\n\n{p3}"
