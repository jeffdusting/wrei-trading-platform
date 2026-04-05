/**
 * Procurement Trigger — Scans client compliance positions and generates
 * procurement recommendations for shortfalls.
 *
 * Risk classification:
 *   green  — >80% covered AND >90 days to deadline
 *   amber  — 50-80% covered OR 30-90 days to deadline
 *   red    — <50% covered OR <30 days to deadline
 */

import { getClientsByOrganisation, getClientSurrenderStatus } from '@/lib/db/queries/clients';
import type { ClientRow, SurrenderRow } from '@/lib/db/queries/clients';
import type { ProcurementRecommendation, RiskLevel, TimingSignal } from './types';

// ---------------------------------------------------------------------------
// Forecast data types (from /api/v1/intelligence/forecast)
// ---------------------------------------------------------------------------

interface ForecastHorizon {
  horizonWeeks: number;
  priceForecast: number;
  confidenceIntervals: {
    ci80: { lower: number | null; upper: number | null };
    ci95: { lower: number | null; upper: number | null };
  };
}

interface ForecastResponse {
  instrument: string;
  currentSpot: number;
  forecasts: ForecastHorizon[];
}

// Demo forecast data (used when API unavailable)
const DEMO_FORECAST: ForecastResponse = {
  instrument: 'ESC',
  currentSpot: 23.10,
  forecasts: [
    { horizonWeeks: 1, priceForecast: 23.85, confidenceIntervals: { ci80: { lower: 23.10, upper: 24.60 }, ci95: { lower: 22.50, upper: 25.20 } } },
    { horizonWeeks: 4, priceForecast: 24.30, confidenceIntervals: { ci80: { lower: 22.80, upper: 25.80 }, ci95: { lower: 21.90, upper: 26.70 } } },
    { horizonWeeks: 12, priceForecast: 25.50, confidenceIntervals: { ci80: { lower: 22.00, upper: 29.00 }, ci95: { lower: 20.50, upper: 30.50 } } },
    { horizonWeeks: 26, priceForecast: 27.20, confidenceIntervals: { ci80: { lower: 21.00, upper: 33.40 }, ci95: { lower: 18.50, upper: 35.90 } } },
  ],
};

// ---------------------------------------------------------------------------
// Penalty rates by instrument (from certificate-config.ts)
// ---------------------------------------------------------------------------

const PENALTY_RATES: Record<string, number> = {
  ESC: 29.48,
  VEEC: 120.00,
  PRC: 5.00,
  ACCU: 75.00,
  LGC: 15.00,
  STC: 40.00,
};

// ---------------------------------------------------------------------------
// Risk classification
// ---------------------------------------------------------------------------

function classifyRisk(coveragePct: number, daysToDeadline: number): RiskLevel {
  if (coveragePct < 50 || daysToDeadline < 30) return 'red';
  if (coveragePct < 80 || daysToDeadline < 90) return 'amber';
  return 'green';
}

function buildRecommendedAction(risk: RiskLevel, shortfall: number, instrument: string): string {
  switch (risk) {
    case 'red':
      return `Urgent: procure ${shortfall.toLocaleString()} ${instrument} immediately to avoid penalty exposure`;
    case 'amber':
      return `Priority: source ${shortfall.toLocaleString()} ${instrument} within 30 days`;
    case 'green':
      return `Monitor: ${shortfall.toLocaleString()} ${instrument} shortfall — schedule procurement`;
  }
}

// ---------------------------------------------------------------------------
// Forecast fetching
// ---------------------------------------------------------------------------

async function fetchLatestForecast(instrument: string): Promise<ForecastResponse> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resp = await fetch(`${baseUrl}/api/v1/intelligence/forecast?instrument=${instrument}`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    });
    if (resp.ok) {
      const json = await resp.json();
      if (json.data?.forecasts?.length > 0) {
        return {
          instrument: json.data.instrument ?? instrument,
          currentSpot: json.data.forecasts[0]?.priceForecast ?? DEMO_FORECAST.currentSpot,
          forecasts: json.data.forecasts,
        };
      }
    }
  } catch {
    // Fall through to demo data
  }
  return DEMO_FORECAST;
}

// ---------------------------------------------------------------------------
// Timing signal logic — combines forecast with urgency
// ---------------------------------------------------------------------------

interface TimingResult {
  signal: TimingSignal;
  forecastPrice4w: number;
  forecastConfidence: number;
  explanation: string;
}

function computeTimingSignal(
  currentSpot: number,
  forecast: ForecastResponse,
  riskLevel: RiskLevel,
  daysToDeadline: number
): TimingResult {
  const fc4w = forecast.forecasts.find(f => f.horizonWeeks === 4);
  const forecastPrice4w = fc4w?.priceForecast ?? currentSpot;
  const ci80 = fc4w?.confidenceIntervals.ci80;
  const ciWidth = ci80 ? (ci80.upper ?? forecastPrice4w) - (ci80.lower ?? forecastPrice4w) : 0;
  const forecastConfidence = Math.max(0.3, Math.min(0.95, 1 - (ciWidth / forecastPrice4w)));

  const priceDiff = forecastPrice4w - currentSpot;
  const threshold = 0.50; // $0.50 threshold

  // Base timing from forecast
  let baseSignal: 'BUY_NOW' | 'WAIT' | 'MARKET';
  let baseExplanation: string;

  if (priceDiff > threshold) {
    baseSignal = 'BUY_NOW';
    baseExplanation = `Price forecast to rise from A$${currentSpot.toFixed(2)} to A$${forecastPrice4w.toFixed(2)} at 4-week horizon (+A$${priceDiff.toFixed(2)})`;
  } else if (priceDiff < -threshold) {
    baseSignal = 'WAIT';
    baseExplanation = `Price forecast to soften from A$${currentSpot.toFixed(2)} to A$${forecastPrice4w.toFixed(2)} at 4-week horizon (−A$${Math.abs(priceDiff).toFixed(2)})`;
  } else {
    baseSignal = 'MARKET';
    baseExplanation = `Current price A$${currentSpot.toFixed(2)} is fair value — 4-week forecast A$${forecastPrice4w.toFixed(2)} within tolerance`;
  }

  // Override logic: combine timing with urgency
  let finalSignal: TimingSignal;
  let finalExplanation: string;

  if (baseSignal === 'WAIT' && riskLevel === 'red' && daysToDeadline < 30) {
    finalSignal = 'BUY_NOW_DEADLINE';
    finalExplanation = `${baseExplanation}. However, deadline pressure overrides timing — only ${daysToDeadline} days remaining`;
  } else if (baseSignal === 'BUY_NOW' && riskLevel === 'green') {
    finalSignal = 'CONSIDER';
    finalExplanation = `${baseExplanation}. Good price but no urgency — consider opportunistic procurement`;
  } else {
    finalSignal = baseSignal;
    finalExplanation = baseExplanation;
  }

  return { signal: finalSignal, forecastPrice4w, forecastConfidence, explanation: finalExplanation };
}

// ---------------------------------------------------------------------------
// Evaluate a single surrender record
// ---------------------------------------------------------------------------

function evaluateSurrender(
  client: ClientRow,
  surrender: SurrenderRow,
  forecast?: ForecastResponse
): ProcurementRecommendation | null {
  const shortfall = Math.max(0, surrender.target_quantity - surrender.surrendered_quantity);
  if (shortfall === 0) return null;

  const penaltyRate = surrender.penalty_rate ?? PENALTY_RATES[surrender.scheme] ?? 0;
  const penaltyExposure = shortfall * penaltyRate;

  // Calculate days to deadline
  let daysToDeadline = 365; // default if no deadline set
  if (surrender.surrender_deadline) {
    const deadline = new Date(surrender.surrender_deadline);
    const now = new Date();
    daysToDeadline = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  // Coverage percentage: how much of target is already held or surrendered
  const covered = surrender.surrendered_quantity;
  const coveragePct = surrender.target_quantity > 0
    ? (covered / surrender.target_quantity) * 100
    : 100;

  const riskLevel = classifyRisk(coveragePct, daysToDeadline);

  // Compute forecast-connected timing signal
  let timingSignal: TimingSignal | null = null;
  let forecastPrice4w: number | null = null;
  let forecastConfidence: number | null = null;
  let timingExplanation: string | null = null;

  if (forecast) {
    const timing = computeTimingSignal(forecast.currentSpot, forecast, riskLevel, daysToDeadline);
    timingSignal = timing.signal;
    forecastPrice4w = timing.forecastPrice4w;
    forecastConfidence = timing.forecastConfidence;
    timingExplanation = timing.explanation;
  }

  return {
    clientId: client.id,
    clientName: client.name,
    instrument: surrender.scheme,
    target: surrender.target_quantity,
    held: 0, // populated from holdings below if available
    surrendered: surrender.surrendered_quantity,
    shortfall,
    penaltyExposure,
    penaltyRate,
    urgency: daysToDeadline,
    riskLevel,
    recommendedAction: buildRecommendedAction(riskLevel, shortfall, surrender.scheme),
    complianceYear: surrender.compliance_year,
    surrenderDeadline: surrender.surrender_deadline,
    timingSignal,
    forecastPrice4w,
    forecastConfidence,
    timingExplanation,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate all clients in an organisation for compliance shortfalls.
 * Fetches latest forecast to produce timing signals for each recommendation.
 * Returns recommendations sorted by risk (red first, then amber, then green).
 */
export async function evaluateClientNeeds(
  orgId: string
): Promise<ProcurementRecommendation[]> {
  const clients = await getClientsByOrganisation(orgId);
  const recommendations: ProcurementRecommendation[] = [];

  // Fetch forecast once for all evaluations
  const forecast = await fetchLatestForecast('ESC');

  for (const client of clients) {
    const surrenders = await getClientSurrenderStatus(client.id);

    for (const surrender of surrenders) {
      if (surrender.status === 'compliant' || surrender.status === 'penalty_paid') {
        continue;
      }

      const rec = evaluateSurrender(client, surrender, forecast);
      if (rec) {
        recommendations.push(rec);
      }
    }
  }

  // Sort: red > amber > green, then by penalty exposure descending
  const riskOrder: Record<RiskLevel, number> = { red: 0, amber: 1, green: 2 };
  recommendations.sort((a, b) => {
    const riskDiff = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    return b.penaltyExposure - a.penaltyExposure;
  });

  return recommendations;
}

/**
 * Evaluate a single client's compliance position with forecast timing.
 */
export async function evaluateSingleClient(
  clientId: string,
  clientName: string
): Promise<ProcurementRecommendation[]> {
  const surrenders = await getClientSurrenderStatus(clientId);
  const recommendations: ProcurementRecommendation[] = [];
  const forecast = await fetchLatestForecast('ESC');

  for (const surrender of surrenders) {
    if (surrender.status === 'compliant' || surrender.status === 'penalty_paid') {
      continue;
    }

    const rec = evaluateSurrender(
      { id: clientId, name: clientName } as ClientRow,
      surrender,
      forecast
    );
    if (rec) {
      recommendations.push(rec);
    }
  }

  return recommendations;
}

/** Export forecast fetcher for use in client reporting */
export { fetchLatestForecast };
export type { ForecastResponse, ForecastHorizon };
