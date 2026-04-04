/**
 * Northmore Gordon Certificate Prices Scraper
 *
 * Fetches spot prices for ESC, VEEC, LGC, ACCU, STC from the
 * Northmore Gordon certificate prices page (WP1 §4.1 — Tier 1 source).
 *
 * Serves as a secondary/validation source alongside Ecovantage.
 * Returns ScrapedPrice[] on success, null on any failure.
 * Never throws — all errors are caught and logged.
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ScrapedPrice, ScrapeResult } from './types';

const SOURCE_URL = 'https://northmoregordon.com/certificate-prices/';
const SOURCE_NAME = 'northmore-gordon';
const FETCH_TIMEOUT_MS = 15_000;

/**
 * Northmore Gordon typically displays prices in a structured table.
 * Each row contains a certificate type name and the associated price.
 * The patterns below match both table-based and prose-based formats.
 */
const INSTRUMENT_PATTERNS: Array<{
  instrumentType: InstrumentType;
  patterns: RegExp[];
  currency: 'AUD';
}> = [
  {
    instrumentType: 'ESC',
    patterns: [
      /ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /Energy\s+Savings?\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /NSW\s+ESC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
    ],
    currency: 'AUD',
  },
  {
    instrumentType: 'VEEC',
    patterns: [
      /VEEC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /Victorian\s+Energy\s+Efficiency\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
    ],
    currency: 'AUD',
  },
  {
    instrumentType: 'LGC',
    patterns: [
      /LGC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /Large[- ]?scale\s+Generation\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
    ],
    currency: 'AUD',
  },
  {
    instrumentType: 'ACCU',
    patterns: [
      /ACCU[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /Australian\s+Carbon\s+Credit\s+Units?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
    ],
    currency: 'AUD',
  },
  {
    instrumentType: 'STC',
    patterns: [
      /STC[s]?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
      /Small[- ]?scale\s+Technology\s+Certificates?\s*[\|:\-–]?\s*\$?([\d]+\.[\d]{2})/i,
    ],
    currency: 'AUD',
  },
];

/** Strip HTML tags and normalise whitespace */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#?\w+;/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Extract price from text using patterns */
function extractPrice(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match?.[1]) {
      const price = parseFloat(match[1]);
      if (!isNaN(price) && price > 0 && price < 10_000) {
        return price;
      }
    }
  }
  return null;
}

/**
 * Scrape current certificate prices from Northmore Gordon.
 * Returns ScrapedPrice[] on success, null on failure.
 */
export async function scrapeNorthmoreGordon(): Promise<ScrapeResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(SOURCE_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'WREI-Platform/1.0 (market-data-feed)',
        'Accept': 'text/html',
      },
      cache: 'no-store',
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[${SOURCE_NAME}] HTTP ${response.status} from ${SOURCE_URL}`);
      return null;
    }

    const html = await response.text();
    const text = stripHtml(html);
    const now = new Date().toISOString();
    const results: ScrapedPrice[] = [];

    for (const entry of INSTRUMENT_PATTERNS) {
      const price = extractPrice(text, entry.patterns);
      if (price !== null) {
        results.push({
          instrumentType: entry.instrumentType,
          price,
          currency: entry.currency,
          source: SOURCE_NAME,
          timestamp: now,
        });
      }
    }

    if (results.length === 0) {
      console.warn(`[${SOURCE_NAME}] No prices extracted from page content`);
      return null;
    }

    console.log(`[${SOURCE_NAME}] Extracted ${results.length} prices`);
    return results;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[${SOURCE_NAME}] Scrape failed: ${message}`);
    return null;
  }
}

export { SOURCE_NAME, SOURCE_URL };
