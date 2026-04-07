#!/usr/bin/env python3
"""
Curated Media Scraper

Monitors curated Australian energy and climate media sources for ESC and
energy market coverage:
  - Australian Financial Review (AFR) energy section
  - Sydney Morning Herald (SMH) environment/energy
  - RenewEconomy
  - AEMO newsroom
  - Energy Efficiency Council (EEC) news
"""

import re
import sys
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

from forecasting.scrapers.base import ScrapedDocument

SOURCE_NAME = "media"
SOURCE_URL = "multiple"
DOCUMENT_TYPE = "media"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 20

KEYWORDS = re.compile(
    r"ESC\b|energy\s+savings\s+certificate|ESS\s+scheme|VEEC|"
    r"energy\s+efficiency|certificate\s+market|penalty\s+rate|"
    r"surrender\s+obligation|carbon\s+credit|emissions?\s+reduction|"
    r"safeguard\s+mechanism|ACCU|clean\s+energy|renewable\s+energy\s+target",
    re.IGNORECASE,
)


@dataclass
class MediaSource:
    name: str
    url: str
    selectors: List[str]


SOURCES = [
    MediaSource(
        name="afr_energy",
        url="https://www.afr.com/companies/energy",
        selectors=["article", "[data-testid='ArticleCard']", ".stories-list li"],
    ),
    MediaSource(
        name="smh_environment",
        url="https://www.smh.com.au/environment",
        selectors=["article", "[data-testid='ArticleCard']", ".stories-list li"],
    ),
    MediaSource(
        name="reneweconomy",
        url="https://reneweconomy.com.au",
        selectors=["article", ".post-item", ".entry-title"],
    ),
    MediaSource(
        name="aemo_newsroom",
        url="https://aemo.com.au/newsroom",
        selectors=["article", ".news-item", ".media-release", ".listing-item"],
    ),
    MediaSource(
        name="eec_news",
        url="https://www.eec.org.au/news",
        selectors=["article", ".news-item", ".views-row", "li.item"],
    ),
]


def scrape() -> List[ScrapedDocument]:
    """Scrape all curated media sources for ESC-related articles."""
    docs: List[ScrapedDocument] = []

    for source in SOURCES:
        try:
            source_docs = _scrape_source(source)
            docs.extend(source_docs)
        except Exception as e:
            print(f"[{SOURCE_NAME}] {source.name} failed: {e}", file=sys.stderr)
            continue

    result = _deduplicate(docs)
    print(f"[{SOURCE_NAME}] Found {len(result)} media articles across {len(SOURCES)} sources")
    return result


def _scrape_source(source: MediaSource) -> List[ScrapedDocument]:
    """Scrape a single media source."""
    items: List[ScrapedDocument] = []

    try:
        resp = requests.get(
            source.url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[{SOURCE_NAME}] Request to {source.url} failed: {e}", file=sys.stderr)
        return items

    soup = BeautifulSoup(resp.text, "html.parser")

    for selector in source.selectors:
        for el in soup.select(selector):
            text = el.get_text(" ", strip=True)
            if not KEYWORDS.search(text):
                continue

            title_el = el.find(["h2", "h3", "h4", "a"])
            title = title_el.get_text(strip=True) if title_el else text[:200]
            if len(title) < 10:
                continue

            link_el = el.find("a", href=True)
            href = link_el["href"] if link_el else ""
            if href and not href.startswith("http"):
                # Derive base from source URL
                from urllib.parse import urlparse
                parsed = urlparse(source.url)
                base = f"{parsed.scheme}://{parsed.netloc}"
                href = f"{base}{href}"
            doc_url = href or source.url

            pub_date = _extract_date(el)
            content = text[:5000]

            items.append(
                ScrapedDocument(
                    source_name=f"{SOURCE_NAME}:{source.name}",
                    source_url=source.url,
                    document_url=doc_url,
                    title=title[:500],
                    published_date=pub_date,
                    content_text=content,
                    document_type=DOCUMENT_TYPE,
                    content_hash=ScrapedDocument.compute_hash(content),
                )
            )

    return items


def _extract_date(el) -> Optional[datetime]:
    """Try to extract a date from an element."""
    # Look for time element first (common in news sites)
    time_el = el.find("time")
    if time_el:
        dt_attr = time_el.get("datetime", "")
        if dt_attr:
            for fmt in ["%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z"]:
                try:
                    return datetime.strptime(dt_attr[:19], fmt[:len(dt_attr[:19])+2])
                except ValueError:
                    continue

    date_el = el.find(class_=re.compile(r"date|time|published", re.IGNORECASE))
    target = date_el if date_el else el
    text = target.get_text(strip=True)
    match = re.search(
        r"(\d{1,2})\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
        r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|"
        r"Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})",
        text, re.IGNORECASE,
    )
    if match:
        try:
            fmt = "%d %B %Y" if len(match.group(2)) > 3 else "%d %b %Y"
            return datetime.strptime(match.group(0)[:20], fmt)
        except ValueError:
            pass
    return None


def _deduplicate(docs: List[ScrapedDocument]) -> List[ScrapedDocument]:
    seen: set[str] = set()
    unique: List[ScrapedDocument] = []
    for doc in docs:
        if doc.content_hash not in seen:
            seen.add(doc.content_hash)
            unique.append(doc)
    return unique


if __name__ == "__main__":
    results = scrape()
    for doc in results[:10]:
        print(f"  [{doc.source_name}] [{doc.published_date or 'no date'}] {doc.title[:80]}")
