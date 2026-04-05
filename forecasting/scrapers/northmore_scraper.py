#!/usr/bin/env python3
"""
Northmore Gordon Certificate Prices Scraper (Python)

Scrapes the Northmore Gordon certificate prices page for:
  - ESC daily/spot price
  - Forward prices where available

Mirrors the TypeScript adapter in lib/data-feeds/adapters/northmore-scraper.ts
but outputs structured data for the forecasting pipeline.
"""

import json
import re
import sys
from datetime import datetime
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://northmoregordon.com/certificate-prices/"
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
