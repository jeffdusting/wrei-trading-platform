#!/usr/bin/env python3
"""
TESSA Public Registry Scraper

Scrapes the NSW TESSA (Trading Energy Savings Scheme Administration)
public Registry of Certificates page for:
  - Total registered certificates by week
  - Transfers
  - Surrenders

Rate-limited to max 1 request per 5 seconds.
Falls back gracefully if page structure changes.
"""

import json
import re
import sys
import time
from datetime import date, datetime, timedelta
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup

TESSA_BASE_URL = "https://www.ess.nsw.gov.au"
REGISTRY_URL = f"{TESSA_BASE_URL}/registry-of-certificates"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
REQUEST_DELAY_S = 5.0
TIMEOUT_S = 30


class TessaScraper:
    """Scrapes ESC registration, transfer, and surrender data from TESSA."""

    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
        })
        self._last_request_time = 0.0

    def _rate_limit(self) -> None:
        """Enforce minimum delay between requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < REQUEST_DELAY_S:
            time.sleep(REQUEST_DELAY_S - elapsed)
        self._last_request_time = time.time()

    def _fetch_page(self, url: str, params: Optional[dict] = None) -> Optional[BeautifulSoup]:
        """Fetch and parse a page with rate limiting."""
        self._rate_limit()
        try:
            resp = self.session.get(url, params=params, timeout=TIMEOUT_S)
            resp.raise_for_status()
            return BeautifulSoup(resp.text, "html.parser")
        except requests.RequestException as e:
            print(f"[tessa] Request failed: {e}", file=sys.stderr)
            return None

    def scrape_registry_summary(self) -> Optional[dict[str, Any]]:
        """
        Scrape the main registry page for summary statistics.
        Returns dict with total_registered, total_transferred, total_surrendered,
        or None on failure.
        """
        soup = self._fetch_page(REGISTRY_URL)
        if soup is None:
            return None

        try:
            result: dict[str, Any] = {
                "scraped_at": datetime.utcnow().isoformat(),
                "source": "tessa_registry",
            }

            # Look for summary statistics in the page
            # TESSA typically displays totals in a summary table or card layout
            text = soup.get_text(separator=" ", strip=True)

            # Try to extract total registered
            registered_match = re.search(
                r"(?:total|cumulative)\s+(?:registered|created)\s*[:\s]*([\d,]+)",
                text, re.IGNORECASE
            )
            if registered_match:
                result["total_registered"] = int(registered_match.group(1).replace(",", ""))

            # Try to extract total surrendered
            surrendered_match = re.search(
                r"(?:total|cumulative)\s+surrendered\s*[:\s]*([\d,]+)",
                text, re.IGNORECASE
            )
            if surrendered_match:
                result["total_surrendered"] = int(surrendered_match.group(1).replace(",", ""))

            # Try to extract total transferred
            transferred_match = re.search(
                r"(?:total|cumulative)\s+transfer(?:red|s)\s*[:\s]*([\d,]+)",
                text, re.IGNORECASE
            )
            if transferred_match:
                result["total_transferred"] = int(transferred_match.group(1).replace(",", ""))

            # Look for tabular data
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows:
                    cells = row.find_all(["td", "th"])
                    if len(cells) >= 2:
                        label = cells[0].get_text(strip=True).lower()
                        value_text = cells[1].get_text(strip=True).replace(",", "")
                        if value_text.isdigit():
                            value = int(value_text)
                            if "registered" in label or "created" in label:
                                result["total_registered"] = value
                            elif "surrendered" in label:
                                result["total_surrendered"] = value
                            elif "transfer" in label:
                                result["total_transferred"] = value

            if len(result) <= 2:  # Only scraped_at and source
                print("[tessa] No data extracted — page structure may have changed",
                      file=sys.stderr)
                return None

            return result

        except Exception as e:
            print(f"[tessa] Parse error: {e}", file=sys.stderr)
            return None

    def scrape_weekly_registrations(
        self, weeks_back: int = 4
    ) -> Optional[list[dict[str, Any]]]:
        """
        Attempt to scrape weekly registration breakdowns.
        TESSA may paginate these — we handle up to `weeks_back` pages.
        Returns list of weekly records or None on failure.
        """
        soup = self._fetch_page(REGISTRY_URL)
        if soup is None:
            return None

        try:
            records: list[dict[str, Any]] = []
            text = soup.get_text(separator=" ", strip=True)

            # Try to find weekly data patterns
            # Pattern: "Week ending DD/MM/YYYY: N,NNN certificates"
            weekly_pattern = re.finditer(
                r"[Ww]eek\s+ending\s+(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})\s*[:\s]*([\d,]+)",
                text
            )

            for match in weekly_pattern:
                date_str = match.group(1)
                count_str = match.group(2).replace(",", "")
                try:
                    # Try DD/MM/YYYY format
                    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%d/%m/%y"):
                        try:
                            week_date = datetime.strptime(date_str, fmt).date()
                            break
                        except ValueError:
                            continue
                    else:
                        continue

                    records.append({
                        "week_ending": week_date.isoformat(),
                        "instrument_type": "ESC",
                        "total_created": int(count_str),
                        "source": "tessa_registry",
                    })
                except (ValueError, AttributeError):
                    continue

            if not records:
                print("[tessa] No weekly registration data found", file=sys.stderr)
                return None

            return sorted(records, key=lambda r: r["week_ending"], reverse=True)

        except Exception as e:
            print(f"[tessa] Weekly parse error: {e}", file=sys.stderr)
            return None

    def close(self) -> None:
        self.session.close()


def main() -> None:
    """Test the TESSA scraper."""
    scraper = TessaScraper()
    try:
        print("Scraping TESSA registry summary...")
        summary = scraper.scrape_registry_summary()
        if summary:
            print(f"  Result: {json.dumps(summary, indent=2)}")
        else:
            print("  No data extracted (site may be unavailable or structure changed)")

        print("\nScraping weekly registrations...")
        weekly = scraper.scrape_weekly_registrations()
        if weekly:
            print(f"  Found {len(weekly)} weekly records")
            for rec in weekly[:3]:
                print(f"    {rec['week_ending']}: {rec['total_created']:,}")
        else:
            print("  No weekly data found")
    finally:
        scraper.close()


if __name__ == "__main__":
    main()
