#!/usr/bin/env python3
"""
Session G: Genuine ESC Price History Acquisition

Runs multiple strategies in priority order to collect genuine weekly ESC spot
prices covering mid-2022 to present. Strategies:

1. Wayback Machine CDX API (archived Ecovantage pages — no JS needed)
2. Playwright rendering of live Ecovantage market update page
3. Playwright rendering of Northmore Gordon articles
4. Shell Energy market updates
5. IPART annual reports / scheme data
6. AFMA environmental product data

Consolidates all sources, cross-validates, stores in SQLite, and produces
a backfill report JSON.
"""

import json
import os
import re
import sqlite3
import sys
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "data",
    "intelligence_documents.db",
)

REPORT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "genuine_backfill_report.json",
)

USER_AGENT = "WREI-Platform/1.0 (market-research)"
TIMEOUT_S = 30

# ---------------------------------------------------------------------------
# DB setup
# ---------------------------------------------------------------------------

CREATE_PRICES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS genuine_price_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_ending TEXT NOT NULL,
    source_name TEXT NOT NULL,
    instrument TEXT NOT NULL,
    spot_price REAL NOT NULL,
    creation_volume INTEGER,
    data_quality TEXT NOT NULL DEFAULT 'genuine_weekly',
    document_url TEXT,
    published_date TEXT,
    ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(week_ending, source_name, instrument)
);
"""


def init_db() -> str:
    """Ensure DB and table exist. Returns absolute DB path."""
    db_path = os.path.abspath(DB_PATH)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    try:
        conn.execute(CREATE_PRICES_TABLE_SQL)
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_gpo_week ON genuine_price_observations(week_ending);"
        )
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_gpo_instrument ON genuine_price_observations(instrument);"
        )
        conn.commit()
    finally:
        conn.close()
    return db_path


def store_price(
    db_path: str,
    week_ending: str,
    source_name: str,
    instrument: str,
    spot_price: float,
    creation_volume: Optional[int] = None,
    document_url: str = "",
    published_date: str = "",
) -> bool:
    """Store a price observation. Returns True if inserted/updated."""
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.execute(
            """INSERT OR REPLACE INTO genuine_price_observations
                (week_ending, source_name, instrument, spot_price,
                 creation_volume, data_quality, document_url, published_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                week_ending, source_name, instrument, spot_price,
                creation_volume, "genuine_weekly", document_url, published_date,
            ),
        )
        conn.commit()
        return cursor.rowcount > 0
    finally:
        conn.close()


def friday_of_week(dt: datetime) -> str:
    """Return ISO date string of the Friday of the week containing dt."""
    days_to_friday = (4 - dt.weekday()) % 7
    friday = dt + timedelta(days=days_to_friday)
    return friday.strftime("%Y-%m-%d")


# ---------------------------------------------------------------------------
# Price extraction helpers
# ---------------------------------------------------------------------------

def extract_publication_date(text: str) -> Optional[datetime]:
    """Extract publication date from text."""
    patterns = [
        # "12 March 2024"
        (r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
         "%d %B %Y", lambda g: f"{g[0]} {g[1]} {g[2]}"),
        # "March 12, 2024"
        (r"(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})",
         "%B %d %Y", lambda g: f"{g[0]} {g[1]} {g[2]}"),
    ]
    for pattern, fmt, formatter in patterns:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            try:
                return datetime.strptime(formatter(m.groups()), fmt)
            except ValueError:
                continue
    return None


# ---------------------------------------------------------------------------
# Section-aware price extraction for Ecovantage pages
# ---------------------------------------------------------------------------

# Instrument section markers in the order they typically appear on Ecovantage
SECTION_MARKERS = [
    ("VEEC", [r"VEEC\s*:", r"Victorian Energy Efficiency C\s*ertificates"]),
    ("STC", [r"STC\s*:", r"Small.Scale Technology Certificates"]),
    ("ESC", [r"ESC\s*:", r"Energy.Saving[s]?\s+Certificates"]),
    ("LGC", [r"LGC\s*:", r"Large.Scale Generation Certificates"]),
    ("ACCU", [r"ACCU\s*:", r"Australian Carbon Credit Units"]),
    ("PRC", [r"PRC\s*:", r"Peak Reduction Certificates"]),
]

# Reasonable price ranges per instrument (AUD)
PRICE_RANGES: Dict[str, Tuple[float, float]] = {
    "ESC": (5.0, 50.0),
    "VEEC": (20.0, 200.0),
    "LGC": (0.5, 100.0),
    "STC": (20.0, 50.0),
    "ACCU": (10.0, 200.0),
    "PRC": (0.1, 50.0),
}


def _find_section_boundaries(text: str) -> Dict[str, str]:
    """
    Split Ecovantage market update text into instrument sections.
    Returns {instrument_code: section_text}.
    """
    # Find positions of all section markers
    positions: List[Tuple[int, str]] = []
    for instrument, patterns in SECTION_MARKERS:
        for pattern in patterns:
            for m in re.finditer(pattern, text, re.IGNORECASE):
                # Only count substantial matches (not nav menu items)
                positions.append((m.start(), instrument))

    if not positions:
        return {}

    # Sort by position
    positions.sort(key=lambda x: x[0])

    # Deduplicate: for each instrument, keep the first match that leads
    # into substantial content (>50 chars with a $)
    sections: Dict[str, str] = {}
    for i, (pos, instrument) in enumerate(positions):
        if instrument in sections:
            continue
        # Section end = start of next section
        end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        section = text[pos:end]
        if len(section) > 50 and "$" in section:
            sections[instrument] = section

    return sections


def _extract_closing_price(section: str, price_range: Tuple[float, float]) -> Optional[float]:
    """
    Extract the closing/last spot price from an instrument section.
    Prefers: closing/Friday price > last price mentioned.
    """
    lo, hi = price_range

    # Priority 1: explicit closing/Friday/end-of-week price
    closing_patterns = [
        r"clos(?:ed|ing)\s+(?:the\s+)?(?:week|market)\s+(?:.*?)\$([\d]+\.[\d]{2})",
        r"finish(?:ed|ing)?\s+(?:the\s+)?week\s+(?:.*?)\$([\d]+\.[\d]{2})",
        r"Friday\s+(?:.*?)\$([\d]+\.[\d]{2})",
        r"(?:end|close)\s+of\s+(?:the\s+)?week\s+(?:.*?)\$([\d]+\.[\d]{2})",
    ]
    for pattern in closing_patterns:
        m = re.search(pattern, section, re.IGNORECASE)
        if m:
            price = float(m.group(1))
            if lo < price < hi:
                return price

    # Priority 2: last dollar amount in the section (often the closing price)
    all_prices = re.findall(r"\$([\d]+\.[\d]{2})", section)
    for p_str in reversed(all_prices):
        price = float(p_str)
        if lo < price < hi:
            return price

    return None


def _extract_creation_volume_from_section(section: str) -> Optional[int]:
    """Extract creation/registration volume from an ESC section."""
    patterns = [
        r"[Rr]egistrations?\s+(?:held|leapt|jumped|rose|fell|dropped|were|totalled)?\s*(?:steady\s+)?(?:with\s+|at\s+|to\s+)?([\d,]+)(?:k)\s*(?:over|in|for)",
        r"([\d,]+)(?:k)\s*(?:ESCs?|certificates?)\s*(?:were\s+)?(?:created|registered)",
        r"([\d,]+)\s*(?:ESCs?|certificates?)\s*(?:were\s+)?(?:created|registered)",
    ]
    for pattern in patterns:
        m = re.search(pattern, section, re.IGNORECASE)
        if m:
            vol_str = m.group(1).replace(",", "")
            volume = int(float(vol_str))
            # Handle "k" suffix (e.g., "197k" = 197,000)
            if "k" in m.group(0).lower() and volume < 10_000:
                volume *= 1_000
            if 1_000 < volume < 5_000_000:
                return volume
    return None


def store_all_prices(
    db_path: str,
    text: str,
    pub_date: datetime,
    source_name: str,
    document_url: str,
) -> Dict[str, int]:
    """
    Extract and store all certificate prices from text using section-aware
    parsing. Returns counts by instrument.
    """
    week = friday_of_week(pub_date)
    pub_str = pub_date.isoformat()
    counts: Dict[str, int] = {}

    # Try section-aware extraction first (works for Ecovantage pages)
    sections = _find_section_boundaries(text)

    creation_vol = None

    if sections:
        # Section-aware parsing
        for instrument, section in sections.items():
            price_range = PRICE_RANGES.get(instrument, (0.1, 200.0))
            price = _extract_closing_price(section, price_range)
            if price is not None:
                vol = None
                if instrument == "ESC":
                    creation_vol = _extract_creation_volume_from_section(section)
                    vol = creation_vol
                stored = store_price(
                    db_path, week, source_name, instrument, price,
                    vol, document_url, pub_str,
                )
                if stored:
                    counts[instrument] = counts.get(instrument, 0) + 1
    else:
        # Fallback: simple regex extraction for non-Ecovantage sources
        # For each instrument, search in the full text but require instrument
        # keyword proximity
        instrument_keywords = {
            "ESC": [r"ESC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
                    r"Energy.Saving[s]?\s+Certificates?[^$]*?\$([\d]+\.[\d]{2})"],
            "VEEC": [r"VEEC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})",
                     r"Victorian\s+Energy\s+Efficiency[^$]*?\$([\d]+\.[\d]{2})"],
            "LGC": [r"LGC[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})"],
            "ACCU": [r"ACCU[s]?\s*(?:spot|price|market)?[:\s]*\$?([\d]+\.[\d]{2})"],
        }
        for instrument, patterns in instrument_keywords.items():
            price_range = PRICE_RANGES.get(instrument, (0.1, 200.0))
            for pattern in patterns:
                m = re.search(pattern, text, re.IGNORECASE)
                if m:
                    price = float(m.group(1))
                    if price_range[0] < price < price_range[1]:
                        stored = store_price(
                            db_path, week, source_name, instrument, price,
                            None, document_url, pub_str,
                        )
                        if stored:
                            counts[instrument] = counts.get(instrument, 0) + 1
                        break

    return counts


# ---------------------------------------------------------------------------
# Strategy 1: Wayback Machine CDX API
# ---------------------------------------------------------------------------

def strategy_wayback(db_path: str) -> Dict[str, Any]:
    """
    Query Wayback Machine CDX API for archived Ecovantage market update pages.
    Fetch each archived snapshot and extract prices.
    """
    print("\n[Strategy 1] Wayback Machine CDX API — Ecovantage archives...")
    result = {"snapshots_found": 0, "snapshots_fetched": 0, "prices": {}, "errors": []}

    cdx_url = "http://web.archive.org/cdx/search/cdx"
    params = {
        "url": "ecovantage.com.au/energy-certificate-market-update*",
        "output": "json",
        "from": "20220101",
        "to": "20260408",
        "fl": "timestamp,original,statuscode",
        "filter": "statuscode:200",
        "collapse": "timestamp:8",  # One snapshot per day
    }

    try:
        resp = requests.get(cdx_url, params=params, timeout=30)
        resp.raise_for_status()
        data = json.loads(resp.text)
    except Exception as e:
        result["errors"].append(f"CDX API failed: {e}")
        print(f"  CDX API failed: {e}")
        return result

    if len(data) <= 1:
        print("  No snapshots found")
        return result

    # First row is header: ["timestamp", "original", "statuscode"]
    snapshots = data[1:]
    result["snapshots_found"] = len(snapshots)
    print(f"  Found {len(snapshots)} Wayback Machine snapshots")

    # Fetch each snapshot (rate-limited)
    total_prices: Dict[str, int] = {}
    for i, snap in enumerate(snapshots):
        timestamp, original_url, status = snap[0], snap[1], snap[2]
        wayback_url = f"https://web.archive.org/web/{timestamp}/{original_url}"

        try:
            resp = requests.get(
                wayback_url,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
            result["snapshots_fetched"] += 1
        except Exception as e:
            result["errors"].append(f"Snapshot {timestamp}: {e}")
            continue

        # Strip HTML
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style"]):
            tag.decompose()
        text = soup.get_text(separator=" ", strip=True)

        # Try to extract a publication date from the page content
        pub_date = extract_publication_date(text)
        if pub_date is None:
            # Fall back to Wayback timestamp
            try:
                pub_date = datetime.strptime(timestamp[:8], "%Y%m%d")
            except ValueError:
                continue

        # Extract and store prices
        counts = store_all_prices(
            db_path, text, pub_date, "ecovantage_wayback", wayback_url,
        )
        for inst, c in counts.items():
            total_prices[inst] = total_prices.get(inst, 0) + c

        # Rate limit: 1 request per second to be polite to archive.org
        if i < len(snapshots) - 1:
            time.sleep(1.0)

        # Progress
        if (i + 1) % 10 == 0:
            print(f"  Processed {i + 1}/{len(snapshots)} snapshots...")

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  Wayback complete: {result['snapshots_fetched']} fetched, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Strategy 2: Playwright rendering of live Ecovantage
# ---------------------------------------------------------------------------

def strategy_ecovantage_playwright(db_path: str) -> Dict[str, Any]:
    """Use Playwright to render the live Ecovantage market update page."""
    print("\n[Strategy 2] Playwright — live Ecovantage page...")
    result = {"pages_fetched": 0, "prices": {}, "errors": []}

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        result["errors"].append("Playwright not installed")
        print("  Playwright not available, skipping")
        return result

    urls = [
        "https://www.ecovantage.com.au/energy-certificate-market-update/",
    ]
    # Also try paginated archive pages
    for page_num in range(2, 20):
        urls.append(
            f"https://www.ecovantage.com.au/energy-certificate-market-update/page/{page_num}/"
        )

    total_prices: Dict[str, int] = {}

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({"User-Agent": USER_AGENT})

            for url in urls:
                try:
                    page.goto(url, timeout=30000)
                    page.wait_for_load_state("networkidle", timeout=15000)
                except Exception as e:
                    # Stop if we get a 404 (paginated pages exhausted)
                    if "404" in str(e) or "ERR_" in str(e):
                        break
                    result["errors"].append(f"{url}: {e}")
                    continue

                result["pages_fetched"] += 1
                content = page.content()
                soup = BeautifulSoup(content, "html.parser")
                text = soup.get_text(separator=" ", strip=True)

                # The page might contain multiple weekly updates.
                # Try to split by date markers.
                date_pattern = (
                    r"Market\s+Update\s*\|\s*"
                    r"(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|"
                    r"September|October|November|December)\s+\d{4})"
                )
                markers = list(re.finditer(date_pattern, text))

                if markers:
                    # Process each section between date markers
                    for j, marker in enumerate(markers):
                        start = marker.start()
                        end = markers[j + 1].start() if j + 1 < len(markers) else len(text)
                        section = text[start:end]
                        try:
                            pub_date = datetime.strptime(marker.group(1), "%d %B %Y")
                        except ValueError:
                            continue
                        counts = store_all_prices(
                            db_path, section, pub_date, "ecovantage_live", url,
                        )
                        for inst, c in counts.items():
                            total_prices[inst] = total_prices.get(inst, 0) + c
                else:
                    # Single page — try to find publication date
                    pub_date = extract_publication_date(text)
                    if pub_date:
                        counts = store_all_prices(
                            db_path, text, pub_date, "ecovantage_live", url,
                        )
                        for inst, c in counts.items():
                            total_prices[inst] = total_prices.get(inst, 0) + c

                time.sleep(1.0)  # Rate limit

            browser.close()
    except Exception as e:
        result["errors"].append(f"Playwright error: {e}")
        print(f"  Playwright error: {e}")

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  Ecovantage Playwright: {result['pages_fetched']} pages, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Strategy 3: Northmore Gordon articles via Playwright
# ---------------------------------------------------------------------------

def strategy_nmg_playwright(db_path: str) -> Dict[str, Any]:
    """Scrape Northmore Gordon articles for market data using Playwright."""
    print("\n[Strategy 3] Playwright — Northmore Gordon articles...")
    result = {"articles_found": 0, "articles_with_prices": 0, "prices": {}, "errors": []}

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        result["errors"].append("Playwright not installed")
        print("  Playwright not available, skipping")
        return result

    total_prices: Dict[str, int] = {}

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({"User-Agent": USER_AGENT})

            # Fetch article listing pages
            article_urls: List[str] = []

            for page_num in range(1, 15):
                if page_num == 1:
                    list_url = "https://northmoregordon.com/articles/"
                else:
                    list_url = f"https://northmoregordon.com/articles/page/{page_num}/"

                try:
                    page.goto(list_url, timeout=30000)
                    page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    break  # No more pages

                # Extract article links
                links = page.query_selector_all("a[href*='/articles/']")
                for link in links:
                    href = link.get_attribute("href")
                    if href and "/articles/" in href and href not in article_urls:
                        # Filter for market-related articles
                        link_text = link.text_content() or ""
                        if any(kw in link_text.lower() for kw in [
                            "market", "certificate", "esc", "veec", "lgc",
                            "energy saving", "price", "trading", "outlook",
                        ]):
                            if not href.startswith("http"):
                                href = f"https://northmoregordon.com{href}"
                            article_urls.append(href)

                time.sleep(1.0)

            result["articles_found"] = len(article_urls)
            print(f"  Found {len(article_urls)} market-related NMG articles")

            # Fetch each article
            for i, art_url in enumerate(article_urls[:50]):  # Cap at 50
                try:
                    page.goto(art_url, timeout=30000)
                    page.wait_for_load_state("networkidle", timeout=15000)
                except Exception as e:
                    result["errors"].append(f"{art_url}: {e}")
                    continue

                content = page.content()
                soup = BeautifulSoup(content, "html.parser")
                text = soup.get_text(separator=" ", strip=True)

                pub_date = extract_publication_date(text)
                if pub_date is None:
                    continue

                # Only include articles from 2022 onwards
                if pub_date.year < 2022:
                    continue

                counts = store_all_prices(
                    db_path, text, pub_date, "northmore_gordon", art_url,
                )
                if counts:
                    result["articles_with_prices"] += 1
                for inst, c in counts.items():
                    total_prices[inst] = total_prices.get(inst, 0) + c

                time.sleep(1.0)

                if (i + 1) % 10 == 0:
                    print(f"  Processed {i + 1}/{len(article_urls)} NMG articles...")

            browser.close()
    except Exception as e:
        result["errors"].append(f"Playwright error: {e}")
        print(f"  Playwright error: {e}")

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  NMG: {result['articles_with_prices']} articles with prices, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Strategy 4: Shell Energy market updates
# ---------------------------------------------------------------------------

def strategy_shell_energy(db_path: str) -> Dict[str, Any]:
    """Scrape Shell Energy certificates market updates."""
    print("\n[Strategy 4] Shell Energy market updates...")
    result = {"pages_fetched": 0, "prices": {}, "errors": []}

    # Known Shell Energy market update URLs
    known_urls = [
        "https://shellenergy.com.au/energy-insights/certificates-market-update-march-2024/",
    ]

    # Also try to find more via their energy-insights listing
    try:
        resp = requests.get(
            "https://shellenergy.com.au/energy-insights/",
            headers={"User-Agent": USER_AGENT},
            timeout=TIMEOUT_S,
        )
        if resp.ok:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "certificate" in href.lower() or "market-update" in href.lower():
                    if not href.startswith("http"):
                        href = f"https://shellenergy.com.au{href}"
                    if href not in known_urls:
                        known_urls.append(href)
    except Exception as e:
        result["errors"].append(f"Shell Energy listing: {e}")

    total_prices: Dict[str, int] = {}

    for url in known_urls:
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
            result["pages_fetched"] += 1
        except Exception as e:
            result["errors"].append(f"{url}: {e}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text(separator=" ", strip=True)

        pub_date = extract_publication_date(text)
        if pub_date is None:
            continue

        counts = store_all_prices(
            db_path, text, pub_date, "shell_energy", url,
        )
        for inst, c in counts.items():
            total_prices[inst] = total_prices.get(inst, 0) + c

        time.sleep(1.0)

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  Shell Energy: {result['pages_fetched']} pages, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Strategy 5: IPART / Energy Sustainability Schemes
# ---------------------------------------------------------------------------

def strategy_ipart(db_path: str) -> Dict[str, Any]:
    """Scrape IPART annual reports and scheme data for ESC price references."""
    print("\n[Strategy 5] IPART / Energy Sustainability Schemes...")
    result = {"pages_fetched": 0, "prices": {}, "errors": []}

    urls = [
        "https://www.energysustainabilityschemes.nsw.gov.au/",
        "https://www.energysustainabilityschemes.nsw.gov.au/About-the-Schemes/Energy-Savings-Scheme",
    ]

    # Try to find report/publication pages
    try:
        resp = requests.get(
            "https://www.energysustainabilityschemes.nsw.gov.au/",
            headers={"User-Agent": USER_AGENT},
            timeout=TIMEOUT_S,
        )
        if resp.ok:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if any(kw in href.lower() for kw in [
                    "report", "publication", "annual", "review", "compliance",
                ]):
                    if not href.startswith("http"):
                        href = f"https://www.energysustainabilityschemes.nsw.gov.au{href}"
                    if href not in urls:
                        urls.append(href)
    except Exception as e:
        result["errors"].append(f"IPART listing: {e}")

    total_prices: Dict[str, int] = {}

    for url in urls[:10]:  # Cap
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
            result["pages_fetched"] += 1
        except Exception as e:
            result["errors"].append(f"{url}: {e}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text(separator=" ", strip=True)

        # IPART reports may contain annual or quarterly price ranges
        # Look for price data specifically
        pub_date = extract_publication_date(text)
        if pub_date is None:
            continue

        counts = store_all_prices(
            db_path, text, pub_date, "ipart", url,
        )
        for inst, c in counts.items():
            total_prices[inst] = total_prices.get(inst, 0) + c

        time.sleep(1.0)

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  IPART: {result['pages_fetched']} pages, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Strategy 6: AFMA environmental products
# ---------------------------------------------------------------------------

def strategy_afma(db_path: str) -> Dict[str, Any]:
    """Check AFMA for environmental product market data."""
    print("\n[Strategy 6] AFMA environmental products...")
    result = {"pages_fetched": 0, "prices": {}, "errors": []}

    urls = [
        "https://afma.com.au/",
        "https://afma.com.au/standards/market-conventions",
    ]

    total_prices: Dict[str, int] = {}

    for url in urls:
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_S,
            )
            resp.raise_for_status()
            result["pages_fetched"] += 1
        except Exception as e:
            result["errors"].append(f"{url}: {e}")
            continue

        soup = BeautifulSoup(resp.text, "html.parser")
        text = soup.get_text(separator=" ", strip=True)

        # Look for environmental product links
        for a in soup.find_all("a", href=True):
            href = a["href"]
            link_text = a.get_text()
            if any(kw in link_text.lower() for kw in ["environmental", "certificate", "carbon"]):
                if not href.startswith("http"):
                    href = f"https://afma.com.au{href}"
                try:
                    sub_resp = requests.get(
                        href,
                        headers={"User-Agent": USER_AGENT},
                        timeout=TIMEOUT_S,
                    )
                    if sub_resp.ok:
                        sub_soup = BeautifulSoup(sub_resp.text, "html.parser")
                        sub_text = sub_soup.get_text(separator=" ", strip=True)
                        pub_date = extract_publication_date(sub_text)
                        if pub_date:
                            counts = store_all_prices(
                                db_path, sub_text, pub_date, "afma", href,
                            )
                            for inst, c in counts.items():
                                total_prices[inst] = total_prices.get(inst, 0) + c
                except Exception:
                    pass
                time.sleep(1.0)

    result["prices"] = total_prices
    esc_count = total_prices.get("ESC", 0)
    print(f"  AFMA: {result['pages_fetched']} pages, {esc_count} ESC observations")
    return result


# ---------------------------------------------------------------------------
# Cross-validation
# ---------------------------------------------------------------------------

def cross_validate(db_path: str) -> Dict[str, Any]:
    """Cross-validate ESC prices between sources for overlapping weeks."""
    conn = sqlite3.connect(db_path)
    try:
        # Get all ESC observations grouped by week
        rows = conn.execute("""
            SELECT week_ending, source_name, spot_price
            FROM genuine_price_observations
            WHERE instrument = 'ESC'
            ORDER BY week_ending, source_name
        """).fetchall()

        # Group by week
        weeks: Dict[str, List[Tuple[str, float]]] = {}
        for week, source, price in rows:
            weeks.setdefault(week, []).append((source, price))

        multi_source_weeks = {w: sources for w, sources in weeks.items() if len(sources) > 1}
        discrepancies = []
        for week, sources in multi_source_weeks.items():
            prices = [s[1] for s in sources]
            max_disc = max(prices) - min(prices)
            if max_disc > 0.50:
                discrepancies.append({
                    "week_ending": week,
                    "sources": {s: p for s, p in sources},
                    "discrepancy": round(max_disc, 2),
                })

        result = {
            "weeks_with_multiple_sources": len(multi_source_weeks),
            "discrepancies_over_050": len(discrepancies),
            "max_discrepancy": max((d["discrepancy"] for d in discrepancies), default=0.0),
            "details": discrepancies[:10],
        }

        print(f"\n  Cross-validation: {len(multi_source_weeks)} multi-source weeks, "
              f"{len(discrepancies)} with discrepancy > $0.50")
        return result
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Gap analysis
# ---------------------------------------------------------------------------

def find_gaps(db_path: str) -> List[str]:
    """Find weeks with no ESC price data between the first and last observation."""
    conn = sqlite3.connect(db_path)
    try:
        rows = conn.execute("""
            SELECT DISTINCT week_ending
            FROM genuine_price_observations
            WHERE instrument = 'ESC'
            ORDER BY week_ending
        """).fetchall()

        if len(rows) < 2:
            return []

        observed_weeks = {r[0] for r in rows}
        first = datetime.strptime(rows[0][0], "%Y-%m-%d")
        last = datetime.strptime(rows[-1][0], "%Y-%m-%d")

        # Generate all Fridays between first and last
        gaps = []
        current = first
        while current <= last:
            week_str = current.strftime("%Y-%m-%d")
            if week_str not in observed_weeks:
                gaps.append(week_str)
            current += timedelta(weeks=1)

        return gaps
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Report generation
# ---------------------------------------------------------------------------

def generate_report(
    db_path: str,
    strategy_results: Dict[str, Dict[str, Any]],
    cross_val: Dict[str, Any],
    gaps: List[str],
) -> Dict[str, Any]:
    """Generate the genuine_backfill_report.json."""
    conn = sqlite3.connect(db_path)
    try:
        # Total ESC observations
        esc_total = conn.execute(
            "SELECT COUNT(*) FROM genuine_price_observations WHERE instrument = 'ESC'"
        ).fetchone()[0]

        # Date range
        date_range_row = conn.execute(
            "SELECT MIN(week_ending), MAX(week_ending) FROM genuine_price_observations WHERE instrument = 'ESC'"
        ).fetchone()

        # Instruments covered
        instruments = [r[0] for r in conn.execute(
            "SELECT DISTINCT instrument FROM genuine_price_observations ORDER BY instrument"
        ).fetchall()]

        # Source counts
        source_counts = {}
        for r in conn.execute(
            "SELECT source_name, COUNT(*) FROM genuine_price_observations WHERE instrument = 'ESC' GROUP BY source_name"
        ).fetchall():
            source_counts[r[0]] = r[1]

        report = {
            "generated_at": datetime.utcnow().isoformat(),
            "total_genuine_observations": esc_total,
            "date_range": {
                "start": date_range_row[0] or "N/A",
                "end": date_range_row[1] or "N/A",
            },
            "sources": source_counts,
            "instruments_covered": instruments,
            "cross_validation": {
                "weeks_with_multiple_sources": cross_val.get("weeks_with_multiple_sources", 0),
                "discrepancies_over_050": cross_val.get("discrepancies_over_050", 0),
                "max_discrepancy": cross_val.get("max_discrepancy", 0.0),
            },
            "gaps": gaps[:50],  # Cap gap list
            "gap_count": len(gaps),
            "strategy_results": {
                name: {
                    "esc_observations": res.get("prices", {}).get("ESC", 0),
                    "errors": res.get("errors", [])[:5],
                }
                for name, res in strategy_results.items()
            },
        }

        return report
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_acquisition() -> Dict[str, Any]:
    """Execute all data acquisition strategies and produce report."""
    print("=" * 60)
    print("SESSION G: GENUINE DATA ACQUISITION")
    print("=" * 60)

    db_path = init_db()

    # Run strategies in priority order
    strategy_results: Dict[str, Dict[str, Any]] = {}

    strategy_results["wayback"] = strategy_wayback(db_path)
    strategy_results["ecovantage_playwright"] = strategy_ecovantage_playwright(db_path)
    strategy_results["nmg_playwright"] = strategy_nmg_playwright(db_path)
    strategy_results["shell_energy"] = strategy_shell_energy(db_path)
    strategy_results["ipart"] = strategy_ipart(db_path)
    strategy_results["afma"] = strategy_afma(db_path)

    # Cross-validate
    print("\n[Cross-validation]")
    cross_val = cross_validate(db_path)

    # Gap analysis
    gaps = find_gaps(db_path)

    # Generate report
    report = generate_report(db_path, strategy_results, cross_val, gaps)

    # Write report
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"\nReport written to {REPORT_PATH}")

    # Summary
    print("\n" + "=" * 60)
    print("ACQUISITION SUMMARY")
    print("=" * 60)
    print(f"  Total ESC observations: {report['total_genuine_observations']}")
    print(f"  Date range: {report['date_range']['start']} to {report['date_range']['end']}")
    print(f"  Sources: {json.dumps(report['sources'], indent=4)}")
    print(f"  Instruments: {', '.join(report['instruments_covered'])}")
    print(f"  Gaps: {report['gap_count']} weeks missing")
    print(f"  Cross-validation: {report['cross_validation']}")

    return report


if __name__ == "__main__":
    run_acquisition()
