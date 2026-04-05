#!/usr/bin/env python3
"""
IPART Energy Sustainability Schemes Monitor

Monitors the IPART ESS news/newsletter page for:
  - New publications
  - Rule changes
  - Compliance notices
  - Consultation papers

Returns structured items for the AI signal extraction pipeline (P10-C).
"""

import json
import re
import sys
from datetime import datetime
from typing import Any, Optional

import requests
from bs4 import BeautifulSoup

IPART_ESS_URL = "https://www.ipart.nsw.gov.au/Home/Industries/Energy/Energy-Savings-Scheme"
IPART_NEWS_URL = "https://www.ipart.nsw.gov.au/Home/Industries/Energy/Energy-Savings-Scheme/News"
SOURCE_NAME = "ipart"
USER_AGENT = "WREI-Platform/1.0 (market-data-feed)"
TIMEOUT_S = 20


def scrape_ipart_news() -> Optional[list[dict[str, Any]]]:
    """
    Scrape the IPART ESS news page for recent publications and updates.
    Returns list of news items with title, date, URL, and content summary.
    """
    items: list[dict[str, Any]] = []

    for url in [IPART_NEWS_URL, IPART_ESS_URL]:
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

        # Look for news/publication items — IPART uses various listing patterns
        # Try common patterns: article tags, news-item divs, list items with links
        selectors = [
            "article",
            ".news-item",
            ".publication-item",
            ".listing-item",
            "li.item",
        ]

        for selector in selectors:
            elements = soup.select(selector)
            for el in elements:
                item = _parse_news_element(el, url)
                if item:
                    items.append(item)

        # Fallback: look for links with date-like text nearby
        if not items:
            links = soup.find_all("a", href=True)
            for link in links:
                href = link.get("href", "")
                text = link.get_text(strip=True)
                # Filter for ESS-related links
                if not re.search(r"(?:ESS|energy.sav|certific|scheme)", text, re.IGNORECASE):
                    continue
                if len(text) < 10:
                    continue

                item: dict[str, Any] = {
                    "title": text[:500],
                    "url": href if href.startswith("http") else f"https://www.ipart.nsw.gov.au{href}",
                    "source": SOURCE_NAME,
                    "scraped_at": datetime.utcnow().isoformat(),
                }

                # Try to find a date near the link
                parent = link.parent
                if parent:
                    parent_text = parent.get_text(strip=True)
                    date_match = re.search(
                        r"(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+(\d{4})",
                        parent_text, re.IGNORECASE
                    )
                    if date_match:
                        try:
                            item["date"] = datetime.strptime(
                                date_match.group(0)[:20], "%d %b %Y"
                            ).date().isoformat()
                        except ValueError:
                            pass

                items.append(item)

    if not items:
        print(f"[{SOURCE_NAME}] No news items found", file=sys.stderr)
        return None

    # Deduplicate by title
    seen: set[str] = set()
    unique: list[dict[str, Any]] = []
    for item in items:
        key = item.get("title", "")[:100]
        if key not in seen:
            seen.add(key)
            unique.append(item)

    return unique


def _parse_news_element(el: Any, base_url: str) -> Optional[dict[str, Any]]:
    """Parse a news/publication element into a structured item."""
    # Extract title
    title_el = el.find(["h2", "h3", "h4", "a"])
    if not title_el:
        return None
    title = title_el.get_text(strip=True)
    if len(title) < 5:
        return None

    # Extract link
    link_el = el.find("a", href=True)
    url = ""
    if link_el:
        href = link_el.get("href", "")
        url = href if href.startswith("http") else f"https://www.ipart.nsw.gov.au{href}"

    # Extract date
    date_str = None
    date_el = el.find(class_=re.compile(r"date", re.IGNORECASE))
    if date_el:
        date_text = date_el.get_text(strip=True)
        date_match = re.search(r"(\d{1,2})\s+(\w+)\s+(\d{4})", date_text)
        if date_match:
            try:
                date_str = datetime.strptime(
                    date_match.group(0)[:20], "%d %B %Y"
                ).date().isoformat()
            except ValueError:
                pass

    # Extract summary
    summary_el = el.find(["p", "div"], class_=re.compile(r"summary|desc|excerpt", re.IGNORECASE))
    summary = summary_el.get_text(strip=True)[:500] if summary_el else ""

    return {
        "title": title[:500],
        "url": url,
        "date": date_str,
        "summary": summary,
        "source": SOURCE_NAME,
        "scraped_at": datetime.utcnow().isoformat(),
    }


def main() -> None:
    """Test the IPART scraper."""
    print(f"Scraping IPART ESS news...")
    items = scrape_ipart_news()
    if items:
        print(f"Found {len(items)} items:")
        for item in items[:5]:
            print(f"  [{item.get('date', 'no date')}] {item['title'][:80]}")
            if item.get("url"):
                print(f"    {item['url']}")
    else:
        print("No items found (site may be unavailable or structure changed)")


if __name__ == "__main__":
    main()
