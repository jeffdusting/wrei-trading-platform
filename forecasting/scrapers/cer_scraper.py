#!/usr/bin/env python3
"""
Clean Energy Regulator (CER) Scraper

Monitors ANREU transaction reports, ACCU issuance data, ERF project
registrations, and CER media releases.

Also provides scrape_quarterly_reports() for backfilling ACCU price/volume
data from CER Quarterly Carbon Market Reports.
"""

import json
import re
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup

from forecasting.scrapers.base import ScrapedDocument

SOURCE_NAME = "cer"
SOURCE_URL = "https://www.cleanenergyregulator.gov.au"
QUARTERLY_REPORTS_URL = "https://cer.gov.au/markets/reports-and-data/quarterly-carbon-market-reports"
DOCUMENT_TYPE = "registry_update"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 20

TARGET_PATHS = [
    "/Infohub",
    "/DocumentAssets",
    "/About/Pages/News-and-updates.aspx",
    "/ERF/Pages/Emissions-Reduction-Fund.aspx",
]

KEYWORDS = re.compile(
    r"ANREU|ACCU|issuance|transaction|registry|emissions?\s+reduction|"
    r"ERF|project\s+registration|carbon\s+credit|safeguard|certificate|"
    r"clean\s+energy|media\s+release",
    re.IGNORECASE,
)


def scrape() -> List[ScrapedDocument]:
    """Scrape CER for registry updates and media releases."""
    docs: List[ScrapedDocument] = []

    for path in TARGET_PATHS:
        url = f"{SOURCE_URL}{path}"
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"[{SOURCE_NAME}] Request to {url} failed: {e}", file=sys.stderr)
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        docs.extend(_extract_items(soup, url))

    print(f"[{SOURCE_NAME}] Found {len(docs)} registry items")
    return _deduplicate(docs)


def _extract_items(soup: BeautifulSoup, page_url: str) -> List[ScrapedDocument]:
    """Extract document items from a CER page."""
    items: List[ScrapedDocument] = []

    selectors = [
        "article", ".media-release", ".news-item",
        ".listing-item", "li.item", ".views-row",
    ]
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
            doc_url = href if href.startswith("http") else f"{SOURCE_URL}{href}"

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

    # Fallback: keyword-matched links
    if not items:
        for link in soup.find_all("a", href=True):
            text = link.get_text(strip=True)
            if len(text) < 10 or not KEYWORDS.search(text):
                continue
            href = link["href"]
            doc_url = href if href.startswith("http") else f"{SOURCE_URL}{href}"
            items.append(
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


def scrape_quarterly_reports() -> List[ScrapedDocument]:
    """
    Scrape CER Quarterly Carbon Market Report pages for ACCU price and
    issuance volume data.

    Attempts to download the reports page and find links to quarterly
    report data. Extracts ACCU spot price series and issuance volumes
    from report text (falls back to page text if XLSX not available).

    Returns:
        List of ScrapedDocument instances with ACCU data.
    """
    docs: List[ScrapedDocument] = []

    print(f"  [cer] Fetching quarterly reports page: {QUARTERLY_REPORTS_URL}")
    try:
        resp = requests.get(
            QUARTERLY_REPORTS_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  [cer] Quarterly reports page failed: {e}", file=sys.stderr)
        return docs

    soup = BeautifulSoup(resp.text, "html.parser")

    # Find links to individual quarterly report pages or XLSX files
    report_links: List[dict[str, str]] = []
    for a_tag in soup.find_all("a", href=True):
        href = a_tag["href"]
        text = a_tag.get_text(strip=True)
        if any(kw in text.lower() or kw in href.lower() for kw in [
            "quarterly", "carbon-market", "accu", "carbon market report",
        ]):
            if href.startswith("/"):
                href = f"https://cer.gov.au{href}"
            elif not href.startswith("http"):
                href = f"https://cer.gov.au/{href}"
            report_links.append({"url": href, "title": text})

    # Also try the main page text for ACCU data
    page_text = soup.get_text(separator=" ", strip=True)
    accu_data = _extract_accu_data(page_text)
    if accu_data:
        content = json.dumps(accu_data)
        docs.append(ScrapedDocument(
            source_name=SOURCE_NAME,
            source_url=SOURCE_URL,
            document_url=QUARTERLY_REPORTS_URL,
            title="CER Quarterly Carbon Market Reports — Summary",
            published_date=datetime.utcnow(),
            content_text=content,
            document_type="quarterly_report",
            content_hash=ScrapedDocument.compute_hash(content),
        ))

    # Follow individual report links
    seen_urls: set[str] = set()
    for link_info in report_links[:20]:
        url = link_info["url"]
        if url in seen_urls:
            continue
        seen_urls.add(url)

        # Skip XLSX downloads (we'd need openpyxl; focus on HTML pages)
        if url.lower().endswith((".xlsx", ".xls", ".pdf")):
            continue

        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
        except requests.RequestException as e:
            print(f"  [cer] Report page failed: {url}: {e}", file=sys.stderr)
            continue

        report_soup = BeautifulSoup(resp.text, "html.parser")
        report_text = report_soup.get_text(separator=" ", strip=True)

        accu_data = _extract_accu_data(report_text)
        pub_date = _extract_date_from_text(report_text)

        if accu_data:
            content = json.dumps(accu_data)
            docs.append(ScrapedDocument(
                source_name=SOURCE_NAME,
                source_url=SOURCE_URL,
                document_url=url,
                title=link_info["title"][:500],
                published_date=pub_date,
                content_text=content,
                document_type="quarterly_report",
                content_hash=ScrapedDocument.compute_hash(content),
            ))

        time.sleep(0.5)

    print(f"  [cer] Quarterly reports scrape complete: {len(docs)} documents")
    return docs


def _extract_accu_data(text: str) -> Optional[Dict[str, Any]]:
    """Extract ACCU spot price and issuance volume from report text."""
    data: Dict[str, Any] = {}

    # ACCU spot price
    accu_price_patterns = [
        r"ACCU\s*(?:spot\s*)?price[:\s]*\$?([\d]+\.[\d]{2})",
        r"ACCU[s]?\s*(?:were|traded|at|price)[:\s]*\$?([\d]+\.[\d]{2})",
        r"carbon\s+credit\s+units?[:\s]*\$?([\d]+\.[\d]{2})",
        r"\$?([\d]+\.[\d]{2})\s*(?:per\s+)?ACCU",
    ]
    for pattern in accu_price_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 10 < price < 200:
                data["accu_spot_price"] = price
                break

    # ACCU issuance volume
    volume_patterns = [
        r"([\d,]+(?:\.\d+)?)\s*(?:million)?\s*ACCUs?\s*(?:were\s+)?(?:issued|created)",
        r"(?:issued|created)\s*(?:approximately\s*)?([\d,]+(?:\.\d+)?)\s*(?:million)?\s*ACCUs?",
        r"ACCU\s*issuance[:\s]*([\d,]+(?:\.\d+)?)\s*(?:million)?",
    ]
    for pattern in volume_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            vol_str = match.group(1).replace(",", "")
            volume = float(vol_str)
            # Check for "million" qualifier
            if "million" in match.group(0).lower():
                volume *= 1_000_000
            if volume > 100:
                data["accu_issuance_volume"] = int(volume)
                break

    return data if data else None


def _extract_date_from_text(text: str) -> Optional[datetime]:
    """Extract a date from text (various formats)."""
    patterns = [
        r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        r"Q([1-4])\s+(\d{4})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            groups = match.groups()
            try:
                if len(groups) == 3 and groups[0].isdigit():
                    return datetime.strptime(f"{groups[0]} {groups[1]} {groups[2]}", "%d %B %Y")
                elif len(groups) == 2 and groups[0][0].isalpha():
                    return datetime.strptime(f"1 {groups[0]} {groups[1]}", "%d %B %Y")
                elif len(groups) == 2 and groups[0].isdigit():
                    quarter = int(groups[0])
                    month = {1: 3, 2: 6, 3: 9, 4: 12}[quarter]
                    return datetime(int(groups[1]), month, 1)
            except (ValueError, KeyError):
                continue
    return None


if __name__ == "__main__":
    results = scrape()
    for doc in results[:5]:
        print(f"  [{doc.published_date or 'no date'}] {doc.title[:80]}")
