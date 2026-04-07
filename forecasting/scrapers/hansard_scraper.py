#!/usr/bin/env python3
"""
NSW Parliamentary Hansard Scraper

Monitors NSW Hansard for debate entries mentioning energy policy, the Energy
Savings Scheme, certificates, and IPART.
"""

import re
import sys
from datetime import datetime
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

from forecasting.scrapers.base import ScrapedDocument

SOURCE_NAME = "nsw_hansard"
SOURCE_URL = "https://www.parliament.nsw.gov.au/hansard"
DOCUMENT_TYPE = "hansard"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 20

SEARCH_TERMS = [
    "energy savings scheme",
    "energy efficiency",
    "IPART",
    "certificates",
    "emissions",
]

KEYWORDS = re.compile(
    r"energy\s+savings\s+scheme|energy\s+efficiency|IPART|"
    r"certificate|emissions|ESS\b|carbon|climate\s+change",
    re.IGNORECASE,
)


def scrape() -> List[ScrapedDocument]:
    """Scrape NSW Hansard for energy-policy-related entries."""
    docs: List[ScrapedDocument] = []

    # Try the search endpoint for each term
    search_url = f"{SOURCE_URL}/Pages/HansardSearch.aspx"
    for term in SEARCH_TERMS:
        try:
            resp = requests.get(
                search_url,
                params={"search": term},
                headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"[{SOURCE_NAME}] Search for '{term}' failed: {e}", file=sys.stderr)
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        docs.extend(_extract_items(soup))

    # Also try the main Hansard listing page
    try:
        resp = requests.get(
            SOURCE_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for el in soup.select("a[href]"):
            text = el.get_text(strip=True)
            if len(text) < 10 or not KEYWORDS.search(text):
                continue
            href = el["href"]
            base = "https://www.parliament.nsw.gov.au"
            doc_url = href if href.startswith("http") else f"{base}{href}"
            docs.append(
                ScrapedDocument(
                    source_name=SOURCE_NAME,
                    source_url=SOURCE_URL,
                    document_url=doc_url,
                    title=text[:500],
                    published_date=None,
                    content_text=text,
                    document_type=DOCUMENT_TYPE,
                    content_hash=ScrapedDocument.compute_hash(text),
                )
            )
    except requests.RequestException as e:
        print(f"[{SOURCE_NAME}] Main page failed: {e}", file=sys.stderr)

    result = _deduplicate(docs)
    print(f"[{SOURCE_NAME}] Found {len(result)} hansard entries")
    return result


def _extract_items(soup: BeautifulSoup) -> List[ScrapedDocument]:
    """Extract search result items from Hansard search results."""
    items: List[ScrapedDocument] = []
    base = "https://www.parliament.nsw.gov.au"

    selectors = [".search-result", "article", ".result-item", "li.item"]
    for selector in selectors:
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
            doc_url = href if href.startswith("http") else f"{base}{href}"

            pub_date = _extract_date(el)
            content = text[:5000]

            items.append(
                ScrapedDocument(
                    source_name=SOURCE_NAME,
                    source_url=SOURCE_URL,
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
    date_el = el.find(class_=re.compile(r"date", re.IGNORECASE))
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
    for doc in results[:5]:
        print(f"  [{doc.published_date or 'no date'}] {doc.title[:80]}")
