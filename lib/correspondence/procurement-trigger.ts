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
import type { ProcurementRecommendation, RiskLevel } from './types';

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
// Evaluate a single surrender record
// ---------------------------------------------------------------------------

function evaluateSurrender(
  client: ClientRow,
  surrender: SurrenderRow
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
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Evaluate all clients in an organisation for compliance shortfalls.
 * Returns recommendations sorted by risk (red first, then amber, then green).
 */
export async function evaluateClientNeeds(
  orgId: string
): Promise<ProcurementRecommendation[]> {
  const clients = await getClientsByOrganisation(orgId);
  const recommendations: ProcurementRecommendation[] = [];

  for (const client of clients) {
    const surrenders = await getClientSurrenderStatus(client.id);

    for (const surrender of surrenders) {
      if (surrender.status === 'compliant' || surrender.status === 'penalty_paid') {
        continue;
      }

      const rec = evaluateSurrender(client, surrender);
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
 * Evaluate a single client's compliance position.
 */
export async function evaluateSingleClient(
  clientId: string,
  clientName: string
): Promise<ProcurementRecommendation[]> {
  const surrenders = await getClientSurrenderStatus(clientId);
  const recommendations: ProcurementRecommendation[] = [];

  for (const surrender of surrenders) {
    if (surrender.status === 'compliant' || surrender.status === 'penalty_paid') {
      continue;
    }

    const rec = evaluateSurrender(
      { id: clientId, name: clientName } as ClientRow,
      surrender
    );
    if (rec) {
      recommendations.push(rec);
    }
  }

  return recommendations;
}
