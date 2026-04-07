#!/usr/bin/env python3
"""
Northmore Gordon Certificate Prices Scraper (Python)

Scrapes the Northmore Gordon certificate prices page for:
  - ESC daily/spot price
  - Forward prices where available

Also provides scrape_historical() for backfilling from article archives.

Mirrors the TypeScript adapter in lib/data-feeds/adapters/northmore-scraper.ts
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

SOURCE_URL = "https://northmoregordon.com/certificate-prices/"
ARTICLES_URL = "https://northmoregordon.com/articles/"
SOURCE_NAME = "northmore-gordon"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 15


def strip_html(html: str) -> str:
    """Strip HTML to plain text."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style"]):
        tag.decompose()
    return soup.get_text(separator=" ", strip=True)


def scrape_northmore_gordon() -> Optional[dict[str, Any]]:
    """
    Scrape the Northmore Gordon certificate prices page.
    Returns dict with ESC price data, or None on failure.
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

    html = resp.text
    text = strip_html(html)
    soup = BeautifulSoup(html, "html.parser")
    now = datetime.utcnow().isoformat()

    result: dict[str, Any] = {
        "source": SOURCE_NAME,
        "scraped_at": now,
    }

    # --- Try table-based extraction first ---
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        for row in rows:
            cells = row.find_all(["td", "th"])
            if len(cells) >= 2:
                label = cells[0].get_text(strip=True)
                value_text = cells[1].get_text(strip=True)
                # Check if this row is about ESCs
                if re.search(r"\bESC\b|Energy\s+Saving", label, re.IGNORECASE):
                    price_match = re.search(r"\$?([\d]+\.[\d]{2})", value_text)
                    if price_match:
                        price = float(price_match.group(1))
                        if 0 < price < 200:
                            result["esc_spot_price"] = price
                    # Check for forward prices in subsequent columns
                    if len(cells) >= 3:
                        fwd_text = cells[2].get_text(strip=True)
                        fwd_match = re.search(r"\$?([\d]+\.[\d]{2})", fwd_text)
                        if fwd_match:
                            result["esc_forward_3m"] = float(fwd_match.group(1))
                    if len(cells) >= 4:
                        fwd_text = cells[3].get_text(strip=True)
                        fwd_match = re.search(r"\$?([\d]+\.[\d]{2})", fwd_text)
                        if fwd_match:
                            result["esc_forward_6m"] = float(fwd_match.group(1))

    # --- Fallback: regex on plain text ---
    if "esc_spot_price" not in result:
        esc_patterns = [
            r"ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
            r"Energy\s+Savings?\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
            r"NSW\s+ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        ]
        for pattern in esc_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                price = float(match.group(1))
                if 0 < price < 200:
                    result["esc_spot_price"] = price
                    break

    if "esc_spot_price" not in result:
        print(f"[{SOURCE_NAME}] No ESC price extracted from page", file=sys.stderr)
        return None

    return result


def _extract_prices_from_text(text: str) -> dict[str, Any]:
    """Extract certificate prices from article text."""
    prices: dict[str, Any] = {}

    # ESC
    for pattern in [
        r"ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        r"Energy\s+Savings?\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        r"NSW\s+ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["esc_spot_price"] = price
                break

    # VEEC
    for pattern in [
        r"VEEC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        r"Victorian\s+Energy\s+Efficiency\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["veec_spot_price"] = price
                break

    # LGC
    for pattern in [
        r"LGC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        r"Large.scale\s+Generation\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["lgc_spot_price"] = price
                break

    # STC
    for pattern in [
        r"STC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
        r"Small.scale\s+Technology\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 100:
                prices["stc_spot_price"] = price
                break

    # ACCU
    for pattern in [
        r"ACCU[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})",
    ]:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            price = float(match.group(1))
            if 0 < price < 200:
                prices["accu_spot_price"] = price
                break

    return prices


def _extract_publication_date(text: str) -> Optional[datetime]:
    """Extract publication date from article text."""
    date_patterns = [
        r"(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})",
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
    Scrape NMG for certificate price data.

    The NMG certificate-prices page is JS-rendered, so prices may not
    appear in raw HTML. Falls back to scraping the current prices page
    and any articles that contain price data.

    Args:
        start_date: ISO date string, earliest date to include.
        end_date: ISO date string, latest date to include.
        max_pages: Maximum pages to crawl in the articles section.

    Returns:
        List of ScrapedDocument instances with extracted price data.
    """
    start_dt = datetime.fromisoformat(start_date)
    end_dt = datetime.fromisoformat(end_date)
    documents: List[ScrapedDocument] = []

    # 1. Try the certificate prices page (may be JS-rendered)
    print(f"  [nmg] Fetching certificate prices page: {SOURCE_URL}")
    try:
        resp = requests.get(
            SOURCE_URL,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html"},
            timeout=TIMEOUT_S,
        )
        resp.raise_for_status()
        text = strip_html(resp.text)
        prices = _extract_prices_from_text(text)
        if prices:
            now = datetime.utcnow()
            content = json.dumps({"prices": prices, "raw_excerpt": text[:3000]})
            documents.append(ScrapedDocument(
                source_name=SOURCE_NAME,
                source_url=SOURCE_URL,
                document_url=f"{SOURCE_URL}#{now.strftime('%Y-%m-%d')}",
                title=f"NMG Certificate Prices {now.strftime('%d %B %Y')}",
                published_date=now,
                content_text=content,
                document_type="market_update",
                content_hash=ScrapedDocument.compute_hash(content),
            ))
            print(f"  [nmg] Extracted prices from certificate prices page: {list(prices.keys())}")
        else:
            print("  [nmg] Certificate prices page is JS-rendered — no prices in HTML")
    except requests.RequestException as e:
        print(f"  [nmg] Certificate prices page failed: {e}", file=sys.stderr)

    # 2. Scan articles page for market-related articles
    print(f"  [nmg] Scanning articles page: {ARTICLES_URL}")
    seen_urls: set[str] = set()
    for page_num in range(1, min(max_pages, 5) + 1):
        url = ARTICLES_URL if page_num == 1 else f"{ARTICLES_URL}page/{page_num}/"
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_S)
            if resp.status_code == 404:
                break
            resp.raise_for_status()
        except requests.RequestException:
            break

        soup = BeautifulSoup(resp.text, "html.parser")
        found_any = False

        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            text_label = a_tag.get_text(strip=True).lower()

            if href.startswith("/"):
                href = f"https://northmoregordon.com{href}"

            if href in seen_urls or "northmoregordon.com" not in href:
                continue

            # Filter for articles that might contain price data
            if not any(kw in text_label or kw in href.lower() for kw in [
                "certificate", "esc", "veec", "lgc", "price", "market",
            ]):
                continue

            seen_urls.add(href)
            found_any = True

            try:
                art_resp = requests.get(href, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_S)
                art_resp.raise_for_status()
                art_text = strip_html(art_resp.text)
                art_prices = _extract_prices_from_text(art_text)
                pub_date = _extract_publication_date(art_text)

                if art_prices and pub_date and start_dt <= pub_date <= end_dt:
                    content = json.dumps({"prices": art_prices, "raw_excerpt": art_text[:3000]})
                    documents.append(ScrapedDocument(
                        source_name=SOURCE_NAME,
                        source_url=ARTICLES_URL,
                        document_url=href,
                        title=f"NMG Market Update {pub_date.strftime('%d %B %Y')}",
                        published_date=pub_date,
                        content_text=content,
                        document_type="market_update",
                        content_hash=ScrapedDocument.compute_hash(content),
                    ))
            except requests.RequestException:
                pass

            time.sleep(0.5)

        if not found_any:
            break
        time.sleep(0.5)

    print(f"  [nmg] Historical scrape complete: {len(documents)} documents")
    return documents


def main() -> None:
    """Test the Northmore Gordon scraper."""
    print(f"Scraping {SOURCE_URL}...")
    data = scrape_northmore_gordon()
    if data:
        print(f"Result: {json.dumps(data, indent=2)}")
    else:
        print("No data extracted (site may be unavailable or structure changed)")


if __name__ == "__main__":
    main()
