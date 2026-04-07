"""
Shared base dataclass for all document scrapers.
"""

import hashlib
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class ScrapedDocument:
    source_name: str
    source_url: str
    document_url: str
    title: str
    published_date: Optional[datetime]
    content_text: str
    document_type: str  # gazette, federal_policy, registry_update, hansard, media, regulatory
    content_hash: str   # SHA-256 of normalised content_text

    @staticmethod
    def compute_hash(text: str) -> str:
        """Compute SHA-256 hash of normalised (stripped, lowered) text."""
        normalised = text.strip().lower()
        return hashlib.sha256(normalised.encode("utf-8")).hexdigest()
