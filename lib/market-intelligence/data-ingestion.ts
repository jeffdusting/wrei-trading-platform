/**
 * Market Intelligence Data Ingestion — TypeScript integration layer
 *
 * Bridges the Python forecasting pipeline with the Next.js application:
 *  - runDailyIngestion()        — triggers Python run_daily.py
 *  - getLatestMetrics()         — queries market_metrics table
 *  - getHistoricalPrices()      — queries market_data_daily table
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { sql } from '@/lib/db/connection';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Python pipeline execution
// ---------------------------------------------------------------------------

/**
 * Run the daily data ingestion pipeline (Python scrapers + derived metrics).
 * Returns stdout/stderr from the Python process.
 */
export async function runDailyIngestion(): Promise<{
  success: boolean;
  stdout: string;
  stderr: string;
}> {
  const scriptPath = path.resolve(process.cwd(), 'forecasting', 'scrapers', 'run_daily.py');

  try {
    const { stdout, stderr } = await execAsync(`python3 ${scriptPath}`, {
      timeout: 120_000, // 2 minute timeout
      cwd: path.resolve(process.cwd(), 'forecasting', 'scrapers'),
      env: {
        ...process.env,
        PYTHONPATH: path.resolve(process.cwd(), 'forecasting'),
      },
    });

    return { success: true, stdout, stderr };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      stdout: '',
      stderr: message,
    };
  }
}

// ---------------------------------------------------------------------------
// Market metrics queries
// ---------------------------------------------------------------------------

export interface MarketMetrics {
  date: string;
  instrumentType: string;
  cumulativeSurplus: number | null;
  creationVelocity4w: number | null;
  creationVelocity12w: number | null;
  impliedAnnualDemand: number | null;
  surplusRunwayYears: number | null;
  daysToSurrender: number | null;
  priceToPenaltyRatio: number | null;
  penaltyRate: number | null;
  forwardCurveSlope: number | null;
  regimeIndicator: string | null;
}

/**
 * Get the latest derived market metrics for an instrument type.
 * Returns the most recent row from market_metrics.
 */
export async function getLatestMetrics(
  instrumentType: string = 'ESC'
): Promise<MarketMetrics | null> {
  try {
    const { rows } = await sql`
      SELECT date, instrument_type, cumulative_surplus,
             creation_velocity_4w, creation_velocity_12w,
             implied_annual_demand, surplus_runway_years,
             days_to_surrender, price_to_penalty_ratio,
             penalty_rate, forward_curve_slope, regime_indicator
      FROM market_metrics
      WHERE instrument_type = ${instrumentType}
      ORDER BY date DESC
      LIMIT 1
    `;

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
      date: r.date,
      instrumentType: r.instrument_type,
      cumulativeSurplus: r.cumulative_surplus ? Number(r.cumulative_surplus) : null,
      creationVelocity4w: r.creation_velocity_4w ? Number(r.creation_velocity_4w) : null,
      creationVelocity12w: r.creation_velocity_12w ? Number(r.creation_velocity_12w) : null,
      impliedAnnualDemand: r.implied_annual_demand ? Number(r.implied_annual_demand) : null,
      surplusRunwayYears: r.surplus_runway_years ? Number(r.surplus_runway_years) : null,
      daysToSurrender: r.days_to_surrender ? Number(r.days_to_surrender) : null,
      priceToPenaltyRatio: r.price_to_penalty_ratio ? Number(r.price_to_penalty_ratio) : null,
      penaltyRate: r.penalty_rate ? Number(r.penalty_rate) : null,
      forwardCurveSlope: r.forward_curve_slope ? Number(r.forward_curve_slope) : null,
      regimeIndicator: r.regime_indicator,
    };
  } catch {
    // DB not available — expected in demo mode
    return null;
  }
}

// ---------------------------------------------------------------------------
// Historical price queries
// ---------------------------------------------------------------------------

export interface HistoricalPriceRow {
  date: string;
  instrumentType: string;
  spotPrice: number | null;
  spotVolume: number | null;
  forward3mPrice: number | null;
  forward6mPrice: number | null;
  forward12mPrice: number | null;
  source: string;
}

/**
 * Get historical daily prices for an instrument from the market_data_daily table.
 */
export async function getHistoricalPrices(
  instrumentType: string = 'ESC',
  days: number = 90
): Promise<HistoricalPriceRow[]> {
  try {
    const { rows } = await sql`
      SELECT date, instrument_type, spot_price, spot_volume,
             forward_3m_price, forward_6m_price, forward_12m_price, source
      FROM market_data_daily
      WHERE instrument_type = ${instrumentType}
        AND date >= CURRENT_DATE - ${days}::int
      ORDER BY date ASC
    `;

    return rows.map(r => ({
      date: r.date,
      instrumentType: r.instrument_type,
      spotPrice: r.spot_price ? Number(r.spot_price) : null,
      spotVolume: r.spot_volume ? Number(r.spot_volume) : null,
      forward3mPrice: r.forward_3m_price ? Number(r.forward_3m_price) : null,
      forward6mPrice: r.forward_6m_price ? Number(r.forward_6m_price) : null,
      forward12mPrice: r.forward_12m_price ? Number(r.forward_12m_price) : null,
      source: r.source,
    }));
  } catch {
    return [];
  }
}
