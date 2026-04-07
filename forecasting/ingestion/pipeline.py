"""
Document ingestion pipeline for ESC market intelligence.

Processes ScrapedDocument objects through four stages:
  1. Deduplication (SHA-256 content hash)
  2. Relevance classification (keyword match + AI scoring)
  3. Content normalisation (HTML strip, whitespace collapse, truncation)
  4. SQLite storage
"""

from __future__ import annotations

import json
import logging
import os
import re
import sqlite3
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional, Set

import requests

from forecasting.scrapers.base import ScrapedDocument

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "intelligence_documents.db")

RELEVANCE_KEYWORDS = [
    "esc", "energy savings certificate", "ess", "veec",
    "energy efficiency scheme", "surrender", "creation",
    "penalty rate", "ipart", "obligated entity",
    "accredited certificate provider", "activity",
    "phase-out", "commercial lighting", "heer", "iheab",
]

MAX_CONTENT_LENGTH = 10_000

ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"
RELEVANCE_MODEL = "claude-haiku-4-5-20251001"
ANTHROPIC_VERSION = "2023-06-01"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS public_intelligence_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_url TEXT NOT NULL,
    document_url TEXT UNIQUE NOT NULL,
    source_name TEXT NOT NULL,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    published_date TEXT,
    ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
    content_hash TEXT NOT NULL,
    relevance_score REAL,
    content_text TEXT NOT NULL,
    signal_extracted INTEGER DEFAULT 0,
    signal_json TEXT
);
"""

CREATE_INDEXES_SQL = [
    "CREATE INDEX IF NOT EXISTS idx_doc_hash ON public_intelligence_documents(content_hash);",
    "CREATE INDEX IF NOT EXISTS idx_doc_type ON public_intelligence_documents(document_type);",
    "CREATE INDEX IF NOT EXISTS idx_signal_extracted ON public_intelligence_documents(signal_extracted);",
]


# ---------------------------------------------------------------------------
# Result type
# ---------------------------------------------------------------------------

@dataclass
class IngestionResult:
    """Result of processing a single document."""
    document_url: str
    title: str
    status: str          # ingested | duplicate | irrelevant | error
    relevance_score: Optional[float] = None
    relevance_tier: Optional[str] = None  # fast_track | batch | discarded
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

class IntelligencePipeline:
    """Process scraped documents through dedup, classification, and storage."""

    def __init__(self, db_path: Optional[str] = None):
        self.db_path = os.path.abspath(db_path or DB_PATH)
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        self._init_db()
        self._known_hashes: Set[str] = self._load_known_hashes()

    # -- Database setup ------------------------------------------------------

    def _init_db(self) -> None:
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(CREATE_TABLE_SQL)
            for idx_sql in CREATE_INDEXES_SQL:
                conn.execute(idx_sql)
            conn.commit()
        finally:
            conn.close()

    def _load_known_hashes(self) -> Set[str]:
        conn = sqlite3.connect(self.db_path)
        try:
            rows = conn.execute(
                "SELECT content_hash FROM public_intelligence_documents"
            ).fetchall()
            return {r[0] for r in rows}
        finally:
            conn.close()

    # -- Stage 1: Deduplication ----------------------------------------------

    def _is_duplicate(self, doc: ScrapedDocument) -> bool:
        """Check if document hash already exists. Returns True to skip."""
        if doc.content_hash in self._known_hashes:
            # Check if this is a re-publish with a newer date
            if doc.published_date is not None:
                conn = sqlite3.connect(self.db_path)
                try:
                    row = conn.execute(
                        "SELECT published_date FROM public_intelligence_documents "
                        "WHERE content_hash = ?",
                        (doc.content_hash,),
                    ).fetchone()
                    if row and row[0]:
                        existing_date = row[0]
                        new_date = doc.published_date.isoformat() if isinstance(
                            doc.published_date, datetime
                        ) else str(doc.published_date)
                        if new_date > existing_date:
                            logger.info(
                                "Document %s has newer date, flagging for re-extraction",
                                doc.document_url,
                            )
                            # Update the existing record's signal_extracted to 0
                            conn.execute(
                                "UPDATE public_intelligence_documents "
                                "SET signal_extracted = 0, published_date = ? "
                                "WHERE content_hash = ?",
                                (new_date, doc.content_hash),
                            )
                            conn.commit()
                finally:
                    conn.close()
            return True
        return False

    # -- Stage 2: Relevance classification -----------------------------------

    def _keyword_match(self, doc: ScrapedDocument) -> bool:
        """Stage 1 filter: document must contain at least one ESC keyword."""
        text_lower = (doc.title + " " + doc.content_text).lower()
        return any(kw in text_lower for kw in RELEVANCE_KEYWORDS)

    def _ai_relevance_score(self, doc: ScrapedDocument) -> Dict:
        """Stage 2 filter: Claude Haiku rates relevance 0.0-1.0.

        Returns {"relevance_score": float, "reason": str} or a fallback
        if the API key is not set or the call fails.
        """
        api_key = os.environ.get("ANTHROPIC_API_KEY", "")
        if not api_key:
            logger.warning("ANTHROPIC_API_KEY not set — defaulting relevance to 0.5")
            return {"relevance_score": 0.5, "reason": "API key not available, default score"}

        prompt = (
            "Rate the relevance of this document to the Australian Energy Savings "
            "Certificate (ESC) market on a scale of 0.0 to 1.0. Consider whether it "
            "contains information about: ESC prices, supply/demand dynamics, regulatory "
            "changes, activity eligibility, penalty rates, surrender deadlines, creation "
            "volumes, or market participant behaviour. Respond with ONLY a JSON object: "
            '{"relevance_score": 0.X, "reason": "brief explanation"}\n\n'
            f"Document title: {doc.title}\n"
            f"Document excerpt (first 2000 chars): {doc.content_text[:2000]}"
        )

        headers = {
            "x-api-key": api_key,
            "anthropic-version": ANTHROPIC_VERSION,
            "content-type": "application/json",
        }
        payload = {
            "model": RELEVANCE_MODEL,
            "max_tokens": 150,
            "messages": [{"role": "user", "content": prompt}],
        }

        for attempt in range(3):
            try:
                resp = requests.post(
                    ANTHROPIC_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=15,
                )
                resp.raise_for_status()
                text = resp.json()["content"][0]["text"].strip()
                if text.startswith("```"):
                    text = text.split("\n", 1)[1] if "\n" in text else text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    text = text.strip()
                return json.loads(text)
            except (requests.RequestException, json.JSONDecodeError, KeyError) as exc:
                logger.warning("AI relevance attempt %d failed: %s", attempt + 1, exc)
                if attempt < 2:
                    time.sleep(1.0 * (attempt + 1))
                    continue
                return {"relevance_score": 0.5, "reason": f"API call failed: {exc}"}

        return {"relevance_score": 0.5, "reason": "unreachable fallback"}

    def _classify_relevance(self, score: float) -> str:
        """Map relevance score to processing tier."""
        if score < 0.3:
            return "discarded"
        elif score <= 0.7:
            return "batch"
        else:
            return "fast_track"

    # -- Stage 3: Content normalisation --------------------------------------

    @staticmethod
    def _normalise_content(text: str) -> str:
        """Strip HTML, collapse whitespace, truncate."""
        # Remove HTML tags
        text = re.sub(r"<[^>]+>", " ", text)
        # Collapse whitespace
        text = re.sub(r"\s+", " ", text).strip()
        # Truncate
        if len(text) > MAX_CONTENT_LENGTH:
            text = text[:MAX_CONTENT_LENGTH]
        return text

    # -- Stage 4: Storage ----------------------------------------------------

    def _store_document(
        self,
        doc: ScrapedDocument,
        normalised_text: str,
        relevance_score: Optional[float],
    ) -> None:
        """Insert document into SQLite."""
        pub_date = None
        if doc.published_date is not None:
            pub_date = (
                doc.published_date.isoformat()
                if isinstance(doc.published_date, datetime)
                else str(doc.published_date)
            )

        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                """
                INSERT OR IGNORE INTO public_intelligence_documents
                    (source_url, document_url, source_name, document_type,
                     title, published_date, content_hash, relevance_score,
                     content_text)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc.source_url,
                    doc.document_url,
                    doc.source_name,
                    doc.document_type,
                    doc.title,
                    pub_date,
                    doc.content_hash,
                    relevance_score,
                    normalised_text,
                ),
            )
            conn.commit()
        finally:
            conn.close()

        self._known_hashes.add(doc.content_hash)

    # -- Public API ----------------------------------------------------------

    def process_documents(self, docs: List[ScrapedDocument]) -> List[IngestionResult]:
        """Process a batch of scraped documents through the full pipeline."""
        results: List[IngestionResult] = []

        for doc in docs:
            try:
                # Stage 1: Deduplication
                if self._is_duplicate(doc):
                    results.append(IngestionResult(
                        document_url=doc.document_url,
                        title=doc.title,
                        status="duplicate",
                    ))
                    continue

                # Stage 2a: Keyword match
                if not self._keyword_match(doc):
                    results.append(IngestionResult(
                        document_url=doc.document_url,
                        title=doc.title,
                        status="irrelevant",
                        relevance_score=0.0,
                        relevance_tier="discarded",
                    ))
                    continue

                # Stage 2b: AI relevance scoring
                ai_result = self._ai_relevance_score(doc)
                score = float(ai_result.get("relevance_score", 0.5))
                tier = self._classify_relevance(score)

                if tier == "discarded":
                    results.append(IngestionResult(
                        document_url=doc.document_url,
                        title=doc.title,
                        status="irrelevant",
                        relevance_score=score,
                        relevance_tier=tier,
                    ))
                    continue

                # Stage 3: Normalise content
                normalised = self._normalise_content(doc.content_text)

                # Stage 4: Store
                self._store_document(doc, normalised, score)

                results.append(IngestionResult(
                    document_url=doc.document_url,
                    title=doc.title,
                    status="ingested",
                    relevance_score=score,
                    relevance_tier=tier,
                ))

            except Exception as exc:
                logger.error("Failed to process %s: %s", doc.document_url, exc)
                results.append(IngestionResult(
                    document_url=doc.document_url,
                    title=doc.title,
                    status="error",
                    error=str(exc),
                ))

        return results

    def get_pending_documents(self, tier: Optional[str] = None) -> List[Dict]:
        """Retrieve documents awaiting signal extraction."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            if tier == "fast_track":
                rows = conn.execute(
                    "SELECT * FROM public_intelligence_documents "
                    "WHERE signal_extracted = 0 AND relevance_score > 0.7 "
                    "ORDER BY ingested_at DESC"
                ).fetchall()
            elif tier == "batch":
                rows = conn.execute(
                    "SELECT * FROM public_intelligence_documents "
                    "WHERE signal_extracted = 0 AND relevance_score BETWEEN 0.3 AND 0.7 "
                    "ORDER BY ingested_at DESC"
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM public_intelligence_documents "
                    "WHERE signal_extracted = 0 "
                    "ORDER BY relevance_score DESC"
                ).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    def mark_extracted(self, doc_id: int, signal_json: str) -> None:
        """Mark a document as having its signals extracted."""
        conn = sqlite3.connect(self.db_path)
        try:
            conn.execute(
                "UPDATE public_intelligence_documents "
                "SET signal_extracted = 1, signal_json = ? WHERE id = ?",
                (signal_json, doc_id),
            )
            conn.commit()
        finally:
            conn.close()
