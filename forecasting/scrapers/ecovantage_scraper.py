#!/usr/bin/env python3
"""
Ecovantage Market Update Scraper (Python)

Scrapes the Ecovantage weekly market update page for:
  - ESC spot price
  - Weekly creation volumes
  - Activity breakdown

Mirrors the TypeScript adapter in lib/data-feeds/adapters/ecovantage-scraper.ts
but outputs structured data for the forecasting pipeline.
"""

import json
import re
import sys
from datetime import datetime
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup

SOURCE_URL = "https://www.ecovantage.com.au/energy-certificate-market-update/"
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
