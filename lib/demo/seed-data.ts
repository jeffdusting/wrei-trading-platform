// =============================================================================
// WREI Platform — Demo Mode Data Seeding (WP4 §9.2)
//
// Generates and inserts demo data into Vercel Postgres when DEMO_MODE=true.
// Covers: price history (30 days, all instruments), simulated counterparties,
// pre-executed trades, obligated entity compliance positions, sample tokens.
//
// Activation: set DEMO_MODE=true in environment
// Idempotent: checks for existing seed data before inserting
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DemoCounterparty {
  id: string
  name: string
  riskRating: 'A' | 'B' | 'C'
  inventoryESC: number
  inventoryVEEC: number
  inventoryACCU: number
  contactEmail: string
}

export interface DemoPricePoint {
  instrument: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface DemoTrade {
  id: string
  instrumentId: string
  direction: 'buy' | 'sell'
  quantity: number
  price: number
  status: 'pending' | 'confirmed' | 'settled'
  counterparty: string
  createdAt: string
}

export interface DemoCompliancePosition {
  entity: string
  target2026: number
  surrendered: number
  held: number
  shortfall: number
  status: 'on_track' | 'at_risk'
}

export interface DemoTokenMetadata {
  tokenId: string
  tokenType: 'WREI-CC' | 'WREI-ACO'
  name: string
  metadata: Record<string, unknown>
}

export interface SeedDataSet {
  priceHistory: DemoPricePoint[]
  counterparties: DemoCounterparty[]
  trades: DemoTrade[]
  compliancePositions: DemoCompliancePosition[]
  tokens: DemoTokenMetadata[]
}

// ---------------------------------------------------------------------------
// Price generation — bounded random walk with daily variance
// ---------------------------------------------------------------------------

function generatePriceHistory(
  instrument: string,
  basePrice: number,
  volatility: number,
  days: number = 30,
): DemoPricePoint[] {
  const points: DemoPricePoint[] = []
  let price = basePrice
  const now = new Date()

  for (let d = days; d >= 0; d--) {
    const date = new Date(now)
    date.setDate(date.getDate() - d)
    const dateStr = date.toISOString().slice(0, 10)

    const change = (Math.random() - 0.48) * volatility * price
    price = Math.max(basePrice * 0.85, Math.min(basePrice * 1.15, price + change))

    const intraday = price * volatility * 0.5
    const open = parseFloat((price + (Math.random() - 0.5) * intraday).toFixed(2))
    const high = parseFloat((Math.max(open, price) + Math.random() * intraday).toFixed(2))
    const low = parseFloat((Math.min(open, price) - Math.random() * intraday).toFixed(2))
    const close = parseFloat(price.toFixed(2))
    const volume = Math.floor(10_000 + Math.random() * 50_000)

    points.push({ instrument, date: dateStr, open, high, low, close, volume })
  }
  return points
}

// ---------------------------------------------------------------------------
// Seed data generators
// ---------------------------------------------------------------------------

function generateAllPriceHistory(): DemoPricePoint[] {
  return [
    ...generatePriceHistory('ESC', 23.00, 0.02),
    ...generatePriceHistory('VEEC', 83.50, 0.015),
    ...generatePriceHistory('PRC', 2.85, 0.03),
    ...generatePriceHistory('ACCU', 35.00, 0.025),
    ...generatePriceHistory('LGC', 5.25, 0.04),
    ...generatePriceHistory('STC', 39.50, 0.005),
    ...generatePriceHistory('WREI-CC', 22.80, 0.02),
    ...generatePriceHistory('WREI-ACO', 1000.00, 0.01),
  ]
}

function generateCounterparties(): DemoCounterparty[] {
  return [
    { id: 'CP-001', name: 'EfficientAus Solutions', riskRating: 'A', inventoryESC: 180_000, inventoryVEEC: 45_000, inventoryACCU: 0, contactEmail: 'trading@efficientaus.com.au' },
    { id: 'CP-002', name: 'GreenCert NSW', riskRating: 'A', inventoryESC: 150_000, inventoryVEEC: 0, inventoryACCU: 25_000, contactEmail: 'ops@greencertnsw.com.au' },
    { id: 'CP-003', name: 'ESC Direct Pty Ltd', riskRating: 'B', inventoryESC: 120_000, inventoryVEEC: 30_000, inventoryACCU: 0, contactEmail: 'trade@escdirect.com.au' },
    { id: 'CP-004', name: 'CarbonTrade Australia', riskRating: 'B', inventoryESC: 100_000, inventoryVEEC: 20_000, inventoryACCU: 50_000, contactEmail: 'desk@carbontrade.com.au' },
    { id: 'CP-005', name: 'National Energy Services', riskRating: 'A', inventoryESC: 200_000, inventoryVEEC: 60_000, inventoryACCU: 15_000, contactEmail: 'markets@nes.com.au' },
  ]
}

function generateTrades(): DemoTrade[] {
  const now = new Date()
  return [
    {
      id: 'TRD-DEMO-001',
      instrumentId: 'ESC',
      direction: 'buy',
      quantity: 25_000,
      price: 22.80,
      status: 'settled',
      counterparty: 'EfficientAus Solutions',
      createdAt: new Date(now.getTime() - 3 * 86_400_000).toISOString(),
    },
    {
      id: 'TRD-DEMO-002',
      instrumentId: 'VEEC',
      direction: 'buy',
      quantity: 5_000,
      price: 83.20,
      status: 'confirmed',
      counterparty: 'National Energy Services',
      createdAt: new Date(now.getTime() - 1 * 86_400_000).toISOString(),
    },
    {
      id: 'TRD-DEMO-003',
      instrumentId: 'ESC',
      direction: 'buy',
      quantity: 50_000,
      price: 23.10,
      status: 'pending',
      counterparty: 'GreenCert NSW',
      createdAt: new Date(now.getTime() - 2 * 3_600_000).toISOString(),
    },
  ]
}

function generateCompliancePositions(): DemoCompliancePosition[] {
  return [
    { entity: 'Origin Energy', target2026: 850_000, surrendered: 620_000, held: 180_000, shortfall: 50_000, status: 'at_risk' },
    { entity: 'AGL Energy', target2026: 1_200_000, surrendered: 950_000, held: 300_000, shortfall: 0, status: 'on_track' },
  ]
}

function generateTokens(): DemoTokenMetadata[] {
  return [
    {
      tokenId: 'WREI-CC-2026-0001',
      tokenType: 'WREI-CC',
      name: 'WREI Carbon Credit — Sydney Route Modal Shift',
      metadata: {
        verificationStandard: 'ISO 14064-2 + Verra VCS + Gold Standard',
        generationSource: 'Water Roads Sydney Route — modal shift + vessel efficiency',
        vintage: '2026-Q1',
        emissionsSavedTonnes: 847.3,
        dmrvScore: 94,
        provenanceChain: ['Vessel Telemetry', 'WREI Calculation Engine', 'Blockchain Verification', 'Token Mint'],
        blockchainTxHash: '0x7a3f...e91b',
        tokenStandard: 'ERC-7518 (DyCIST)',
        spotPrice: 22.80,
        wreiPremium: 1.5,
      },
    },
    {
      tokenId: 'WREI-ACO-2026-0001',
      tokenType: 'WREI-ACO',
      name: 'WREI Asset Co Token — LeaseCo Fleet Interest',
      metadata: {
        underlyingAsset: 'Candela C-8 Electric Hydrofoil Fleet',
        fleetSize: 88,
        capex: 473_000_000,
        equityYield: 0.283,
        navPerToken: 1000,
        dividendSchedule: 'Quarterly',
        cashOnCashMultiple: 3.0,
        afslRequired: true,
        wholesaleOnly: true,
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Check if demo mode is enabled */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.DEMO_MODE === 'true'
}

/** Generate the full seed data set (no DB required — pure data) */
export function generateSeedData(): SeedDataSet {
  return {
    priceHistory: generateAllPriceHistory(),
    counterparties: generateCounterparties(),
    trades: generateTrades(),
    compliancePositions: generateCompliancePositions(),
    tokens: generateTokens(),
  }
}

/** Seed data into Vercel Postgres. Idempotent — checks for existing data. */
export async function seedDemoData(): Promise<{ seeded: boolean; message: string }> {
  if (!isDemoMode()) {
    return { seeded: false, message: 'DEMO_MODE is not enabled' }
  }

  try {
    const { sql } = await import('@/lib/db/connection')

    // Check if already seeded
    const { rows } = await sql`SELECT COUNT(*) as count FROM trades WHERE id LIKE 'TRD-DEMO-%'`
    if (rows[0]?.count > 0) {
      return { seeded: false, message: 'Demo data already present' }
    }

    const data = generateSeedData()

    // Seed trades
    for (const trade of data.trades) {
      await sql`
        INSERT INTO trades (id, instrument_id, direction, quantity, price, status, counterparty, created_at)
        VALUES (${trade.id}, ${trade.instrumentId}, ${trade.direction}, ${trade.quantity}, ${trade.price}, ${trade.status}, ${trade.counterparty}, ${trade.createdAt})
        ON CONFLICT (id) DO NOTHING
      `
    }

    // Seed price history
    for (const p of data.priceHistory) {
      await sql`
        INSERT INTO price_history (instrument_id, recorded_at, price, source)
        VALUES (${p.instrument}, ${p.date}, ${p.close}, ${'demo-seed'})
        ON CONFLICT DO NOTHING
      `
    }

    // Seed audit trail entries for demo trades
    for (const trade of data.trades) {
      await sql`
        INSERT INTO audit_log (entity_type, entity_id, action, actor, details)
        VALUES (${'trade'}, ${trade.id}, ${'trade_initiated'}, ${'demo-seed'}, ${JSON.stringify({ quantity: trade.quantity, price: trade.price, counterparty: trade.counterparty })})
      `
    }

    return { seeded: true, message: `Seeded ${data.trades.length} trades, ${data.priceHistory.length} price points` }
  } catch {
    return { seeded: false, message: 'Database unavailable — demo data available in-memory only' }
  }
}
