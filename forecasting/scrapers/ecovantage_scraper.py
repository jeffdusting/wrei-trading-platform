#!/usr/bin/env python3
"""
Ecovantage Market Update Scraper (Python)

Scrapes the Ecovantage weekly market update page for:
  - ESC spot price
  - Weekly creation volumes
  - Activity breakdown

Also provides scrape_historical() for backfilling archive pages.

Mirrors the TypeScript adapter in lib/data-feeds/adapters/ecovantage-scraper.ts
but outputs structured data for the forecasting pipeline.
"""

import json
import re
import sys
import time
from datetime import datetime
from typing import Any, List, Optional

import requests
from bs4 import BeautifulSoup

from forecasting.scrapers.base import ScrapedDocument

SOURCE_URL = "https://www.ecovantage.com.au/energy-certificate-market-update/"
ARCHIVE_URL = "https://www.ecovantage.com.au/energy-certificate-market-update/"
SOURCE_NAME = "ecovantage"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 15


def strip_html(html: str) -> str:
    """Strip HTML to plain text for regex extraction."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)


def scrape_ecovantage() -> Optional[dict[str, Any]]:
    """
    Scrape the Ecovantage market update page.
    Returns dict with price, volume, and activity data, or None on failure.
    """
    try:
        resp = requests.get(
            SOURCE_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[{SOURCE_NAME}] Request failed: {e}", file=sys.stderr)
        return None

    text = strip_html(resp.text)
    now = datetime.utcnow().isoformat()
    result: dict[str, Any] = {
        "source": SOURCE_NAME,
        "scraped_at": now,
    }

    # --- ESC spot price ---
    esc_patterns = [
        r"ESC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Energy\s+Savings?\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in esc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                result["esc_spot_price"] = price
                break

    # --- Weekly creation volume ---
    volume_patterns = [
        r"([\d,]+)\s*(?:ESCs?|certificates?)\s*(?:were\s+)?(?:created|registered)\s*(?:this\s+week)?",
        r"(?:weekly|week'?s?)\s*(?:ESC)?\s*(?:creation|registrations?)\s*[:\s]*([\d,]+)",
        r"(?:created|registered)\s*[:\s]*([\d,]+)\s*(?:ESCs?|certificates?)",
    ]
    for pattern in volume_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            vol_str = match.group(1).replace(",", "")
            volume = int(vol_str)
            if 1_000 < volume < 1_000_000:
                result["weekly_creation_volume"] = volume
                break

    # --- Activity breakdown ---
    activities: dict[str, int] = {}
    activity_patterns = {
        "commercial_lighting": [
            r"commercial\s+lighting[:\s]*([\d,]+)",
            r"lighting\s+upgrades?[:\s]*([\d,]+)",
        ],
        "heer": [
            r"HEER[:\s]*([\d,]+)",
            r"home\s+energy\s+efficiency[:\s]*([\d,]+)",
        ],
        "iheab": [
            r"IHEAB[:\s]*([\d,]+)",
            r"in[- ]home\s+(?:energy\s+)?audit[:\s]*([\d,]+)",
        ],
        "piamv": [
            r"PIAMV[:\s]*([\d,]+)",
            r"power\s+infrastructure[:\s]*([\d,]+)",
        ],
    }
    for activity, patterns in activity_patterns.items():
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                val = int(match.group(1).replace(",", ""))
                if 100 < val < 500_000:
                    activities[activity] = val
                    break

    if activities:
        result["creation_by_activity"] = activities

    if "esc_spot_price" not in result and "weekly_creation_volume" not in result:
        print(f"[{SOURCE_NAME}] No data extracted from page", file=sys.stderr)
        return None

    return result


def extract_prices_from_text(text: str) -> dict[str, Any]:
    """
    Extract all certificate prices from page text.
    Returns dict of instrument -> price.
    """
    prices: dict[str, Any] = {}

    # ESC spot price
    esc_patterns = [
        r"ESC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Energy\s+Savings?\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in esc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["esc_spot_price"] = price
                break

    # VEEC spot price
    veec_patterns = [
        r"VEEC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Victorian\s+Energy\s+Efficiency\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in veec_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["veec_spot_price"] = price
                break

    # LGC spot price
    lgc_patterns = [
        r"LGC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Large.scale\s+Generation\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in lgc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["lgc_spot_price"] = price
                break

    # STC spot price
    stc_patterns = [
        r"STC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Small.scale\s+Technology\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in stc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 100:
                prices["stc_spot_price"] = price
                break

    # ACCU spot price
    accu_patterns = [
        r"ACCU[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Australian\s+Carbon\s+Credit\s+Units?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in accu_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["accu_spot_price"] = price
                break

    # PRC spot price (Peak Reduction Certificates)
    prc_patterns = [
        r"PRC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
        r"Peak\s+Reduction\s+Certificates?[:\s]*\$?([\d]+\.[\d]{2})",
    ]
    for pattern in prc_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["prc_spot_price"] = price
                break

    # ESC creation volume
    volume_patterns = [
        r"([\d,]+)\s*(?:ESCs?|certificates?)\s*(?:were\s+)?(?:created|registered)",
        r"(?:weekly|week'?s?)\s*(?:ESC)?\s*(?:creation|registrations?)\s*[:\s]*([\d,]+)",
        r"(?:created|registered)\s*[:\s]*([\d,]+)\s*(?:ESCs?|certificates?)",
    ]
    for pattern in volume_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            vol_str = match.group(1).replace(",", "")
            volume = int(vol_str)
            if 1_000 < volume < 1_000_000:
                prices["esc_creation_volume"] = volume
                break

    return prices


def _extract_publication_date(text: str) -> Optional[datetime]:
    """Extract publication date from page text."""
    date_patterns = [
        # "12 March 2024", "5 January 2023"
        r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
        # "March 12, 2024"
        r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})",
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                groups = match.groups()
                if groups[0].isdigit():
                    return datetime.strptime(f"{groups[0]} {groups[1]} {groups[2]}", "%d %B %Y")
                else:
                    return datetime.strptime(f"{groups[1]} {groups[0]} {groups[2]}", "%d %B %Y")
            except ValueError:
                continue
    return None


def scrape_historical(
    start_date: str = "2022-01-01",
    end_date: str = "2026-04-07",
    max_pages: int = 50,
) -> List[ScrapedDocument]:
    """
    Scrape Ecovantage weekly market update page for certificate prices.

    The Ecovantage market update page is a single page (not paginated)
    that contains the latest weekly commentary with embedded prices for
    ESC, VEEC, LGC, STC, ACCU, and PRC certificates.

    The page text is split by "Market Update | DATE" markers to extract
    multiple weekly updates if present.

    Args:
        start_date: ISO date string, earliest date to include.
        end_date: ISO date string, latest date to include.
        max_pages: Unused (kept for API compatibility).

    Returns:
        List of ScrapedDocument instances with extracted price data.
    """
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    documents: List[ScrapedDocument] = []

    print(f"  [ecovantage] Fetching market update page: {SOURCE_URL}")
    try:
        resp = requests.get(
            SOURCE_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"  [ecovantage] Request failed: {e}", file=sys.stderr)
        return documents

    soup = BeautifulSoup(resp.text, "html.parser")
    text = soup.get_text(separator=" ", strip=True)

    # Find "Market Update | DATE" markers to split sections
    marker_pattern = (
        r"Market\s+Update\s*\|\s*"
        r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+\d{4})"
    )
    markers = list(re.finditer(marker_pattern, text))

    # The page is a single weekly update (not paginated).
    # Use the date range marker or first individual date as publication date.
    range_pattern = (
        r"(\d{1,2}\s+\w+)\s*[\-–]\s*"
        r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|"
        r"September|October|November|December)\s+\d{4})"
    )
    range_match = re.search(range_pattern, text)

    # Use the most recent date from markers or the range end date
    pub_date = None
    if markers:
        try:
            pub_date = datetime.strptime(markers[0].group(1), "%d %B %Y")
        except ValueError:
            pass
    if pub_date is None and range_match:
        try:
            pub_date = datetime.strptime(range_match.group(2), "%d %B %Y")
        except ValueError:
            pass
    if pub_date is None:
        pub_date = _extract_publication_date(text)
    if pub_date is None:
        pub_date = datetime.utcnow()

    if pub_date >= start_dt and pub_date <= end_dt:
        # Extract all certificate prices from the commentary
        prices = _extract_prices_from_commentary(text)
        if not prices:
            prices = extract_prices_from_text(text)

        if prices:
            content = json.dumps({"prices": prices, "raw_excerpt": text[:5000]})
            documents.append(ScrapedDocument(
                source_name=SOURCE_NAME,
                source_url=SOURCE_URL,
                document_url=f"{SOURCE_URL}#{pub_date.strftime('%Y-%m-%d')}",
                title=f"Ecovantage Market Update {pub_date.strftime('%d %B %Y')}",
                published_date=pub_date,
                content_text=content,
                document_type="market_update",
                content_hash=ScrapedDocument.compute_hash(content),
            ))

    print(f"  [ecovantage] Historical scrape complete: {len(documents)} documents")
    return documents


def _extract_prices_from_commentary(text: str) -> dict[str, Any]:
    """
    Extract certificate prices from Ecovantage weekly commentary.

    The page has sections like:
      "Energy Saving Certificates (ESCs) ... finish the week at $24.50"
      "Victorian Energy Efficiency Certificates (VEECs) ... trading at $86.50"
    """
    prices: dict[str, Any] = {}

    # ESC price — look for "finish(ed) the week at $X.XX" near ESC context
    esc_section = _find_section(text, [
        "Energy Saving Certificates", "ESCs)", "Energy-Savings Certificates",
    ])
    if esc_section:
        # "finish the week at $24.50" or "closed ... at $X"
        for pattern in [
            r"finish(?:ed|ing)?\s+(?:the\s+)?week\s+at\s+\$([\d]+\.[\d]{2})",
            r"clos(?:ed|ing)\s+(?:the\s+)?week\s+at\s+\$([\d]+\.[\d]{2})",
            r"spot\s+price\s+(?:jumped|rose|fell|dropped|finished|closed)\s.*?\$([\d]+\.[\d]{2})",
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, esc_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 5 < price < 100:
                    prices["esc_spot_price"] = price
                    break
    if "esc_spot_price" not in prices:
        prices.update({k: v for k, v in extract_prices_from_text(text).items() if k == "esc_spot_price"})

    # VEEC price (note: page may render "C ertificates" with extra space)
    veec_section = _find_section(text, [
        "Victorian Energy Efficiency C ertificates",
        "Victorian Energy Efficiency Certificates",
        "VEECs)",
    ])
    if veec_section:
        for pattern in [
            r"finish(?:ed|ing)?\s+(?:the\s+)?week\s+at\s+\$([\d]+\.[\d]{2})",
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
            r"clos(?:ed|ing).*?at\s+\$([\d]+\.[\d]{2})",
            r"\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, veec_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 20 < price < 200:
                    prices["veec_spot_price"] = price
                    break

    # LGC price
    lgc_section = _find_section(text, [
        "Large-Scale Generation Certificates", "LGCs)",
    ])
    if lgc_section:
        for pattern in [
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
            r"finish(?:ed|ing)?\s+.*?at\s+\$([\d]+\.[\d]{2})",
            r"ended\s+.*?at\s+\$([\d]+\.[\d]{2})",
            r"\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, lgc_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 0.5 < price < 100:
                    prices["lgc_spot_price"] = price
                    break

    # STC price
    stc_section = _find_section(text, [
        "Small-Scale Technology Certificates", "STCs)",
    ])
    if stc_section:
        for pattern in [
            r"finish(?:ed|ing)?\s+.*?at\s+\$([\d]+\.[\d]{2})",
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
            r"\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, stc_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 20 < price < 50:
                    prices["stc_spot_price"] = price
                    break

    # PRC price
    prc_section = _find_section(text, [
        "Peak Reduction Certificates", "PRCs)",
    ])
    if prc_section:
        for pattern in [
            r"finish(?:ed|ing)?\s+.*?at\s+\$([\d]+\.[\d]{2})",
            r"(?:opened|closed)\s+.*?(?:the\s+)?week\s+at\s+\$([\d]+\.[\d]{2})",
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
            r"spot\s+price\s+.*?\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, prc_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 0.5 < price < 50:
                    prices["prc_spot_price"] = price
                    break

    # ACCU price
    accu_section = _find_section(text, [
        "Australian Carbon Credit Units", "ACCUs)",
    ])
    if accu_section:
        for pattern in [
            r"finish(?:ed|ing)?\s+.*?at\s+\$([\d]+\.[\d]{2})",
            r"trading\s+at\s+\$([\d]+\.[\d]{2})",
            r"\$([\d]+\.[\d]{2})",
        ]:
            m = re.search(pattern, accu_section, re.IGNORECASE)
            if m:
                price = float(m.group(1))
                if 10 < price < 200:
                    prices["accu_spot_price"] = price
                    break

    # ESC creation volume
    vol_patterns = [
        r"([\d,]+)\s*(?:ESCs?|certificates?)\s*(?:were\s+)?(?:created|registered)",
        r"registrations?\s+(?:leapt|jumped|rose)\s+to\s+(?:just\s+over\s+)?([\d,]+(?:\.\d+)?)\s*(?:million|m)?\s*(?:ESCs?|certificates?)",
        r"([\d,]+)\s*(?:ESCs?|certificates?)\s*(?:over|in)\s+(?:the\s+)?(?:past|last)\s+\d+\s+days?",
    ]
    for pattern in vol_patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            vol_str = m.group(1).replace(",", "")
            volume = int(float(vol_str))
            # Check for "million" in the match
            if "million" in m.group(0).lower() or "m " in m.group(0).lower():
                volume = int(volume * 1_000_000)
            if 1_000 < volume < 5_000_000:
                prices["esc_creation_volume"] = volume
                break

    return prices


def _find_section(text: str, headers: List[str]) -> Optional[str]:
    """
    Find a certificate section by its header in the page text.
    Returns the text from the header until the next certificate section.

    Skips short matches (nav menu items) and finds the actual
    commentary section with substantial content (>100 chars).
    """
    section_markers = [
        "Large-Scale Generation Certificates",
        "Victorian Energy Efficiency",
        "Energy Saving Certificates",
        "Energy-Savings Certificates",
        "Peak Reduction Certificates",
        "Australian Carbon Credit Units",
        "Small-Scale Technology Certificates",
        "Sign Up", "Learn More", "Contact Us",
    ]

    # Find ALL occurrences of the headers, then pick the one with
    # actual commentary content (contains "$" and is substantial)
    candidates: List[int] = []
    for header in headers:
        start = 0
        while True:
            idx = text.find(header, start)
            if idx < 0:
                break
            candidates.append(idx)
            start = idx + 1

    best_section: Optional[str] = None
    for start_pos in candidates:
        # Find the end of this section
        best_end = len(text)
        for marker in section_markers:
            idx = text.find(marker, start_pos + 20)
            if idx > start_pos and idx < best_end:
                best_end = idx

        section = text[start_pos:best_end]
        # Prefer sections containing price data ($ signs)
        if len(section) > 100 and "$" in section:
            return section
        if len(section) > 100 and best_section is None:
            best_section = section

    return best_section


def main() -> None:
    """Test the Ecovantage scraper."""
    print(f"Scraping {SOURCE_URL}...")
    data = scrape_ecovantage()
    if data:
        print(f"Result: {json.dumps(data, indent=2)}")
    else:
        print("No data extracted (site may be unavailable or structure changed)")


if __name__ == "__main__":
    if "--test" in sys.argv:
        main()
    else:
        main()
