/**
 * Seller Outreach — Generates personalised RFQ drafts for a procurement
 * recommendation across multiple counterparties.
 *
 * Each draft is written to the correspondence table with status 'drafted',
 * awaiting broker approval before dispatch.
 */

import { generateRFQDraft } from './ai-draft-engine';
import { createCorrespondence } from '@/lib/db/queries/correspondence';
import { rowToCorrespondence } from './types';
import type {
  ProcurementRecommendation,
  Counterparty,
  DraftCorrespondence,
  GenerateRFQResult,
} from './types';

/**
 * Generate RFQ drafts for each counterparty and persist them.
 *
 * All drafts share a thread ID so they can be grouped later.
 * The client name is NOT included in the RFQ body (confidentiality).
 */
export async function generateRFQBatch(
  recommendation: ProcurementRecommendation,
  counterparties: Counterparty[],
  context: { orgId: string; userId: string }
): Promise<GenerateRFQResult> {
  const threadId = crypto.randomUUID();
  const drafts: DraftCorrespondence[] = [];
  let totalTokensUsed = 0;

  for (const cp of counterparties) {
    const draftResult = await generateRFQDraft(recommendation, cp, {
      userId: context.userId,
      organisationId: context.orgId,
    });

    totalTokensUsed += draftResult.tokensUsed;

    // Persist to DB
    try {
      const row = await createCorrespondence(context.orgId, context.userId, {
        type: 'rfq',
        counterpartyName: cp.name,
        counterpartyEmail: cp.contactEmail,
        subject: draftResult.subject,
        body: draftResult.body,
        threadId,
        relatedClientId: recommendation.clientId,
        relatedInstrument: recommendation.instrument,
        aiModel: draftResult.model,
        aiTokensUsed: draftResult.tokensUsed,
      });

      drafts.push(rowToCorrespondence(row));
    } catch {
      // If DB write fails, return an in-memory draft so the UI still works
      drafts.push({
        id: crypto.randomUUID(),
        organisationId: context.orgId,
        type: 'rfq',
        counterpartyName: cp.name,
        counterpartyEmail: cp.contactEmail,
        subject: draftResult.subject,
        body: draftResult.body,
        status: 'drafted',
        threadId,
        relatedClientId: recommendation.clientId,
        relatedInstrument: recommendation.instrument,
        aiModel: draftResult.model,
        aiTokensUsed: draftResult.tokensUsed,
        rejectionReason: null,
        createdBy: context.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sentAt: null,
      });
    }
  }

  return { drafts, totalTokensUsed };
}

// ---------------------------------------------------------------------------
// Demo counterparties (used when no DB counterparties are configured)
// ---------------------------------------------------------------------------

export const DEMO_COUNTERPARTIES: Counterparty[] = [
  {
    id: 'cp-1',
    name: 'Green Energy Trading',
    contactName: 'Sarah Mitchell',
    contactEmail: 'sarah.mitchell@greenenergy.com.au',
    instruments: ['ESC', 'VEEC', 'PRC'],
    relationship: 'preferred',
    notes: 'Long-standing relationship. Competitive on ESC pricing.',
  },
  {
    id: 'cp-2',
    name: 'Sustainable Markets Australia',
    contactName: 'James Chen',
    contactEmail: 'j.chen@sustainablemarkets.com.au',
    instruments: ['ESC', 'ACCU', 'LGC'],
    relationship: 'active',
    notes: 'Strong ACCU inventory. Prefers larger parcels.',
  },
  {
    id: 'cp-3',
    name: 'Pacific Carbon Solutions',
    contactName: 'Emma Rodriguez',
    contactEmail: 'e.rodriguez@pacificcarbon.com.au',
    instruments: ['ACCU', 'LGC', 'STC'],
    relationship: 'active',
    notes: null,
  },
  {
    id: 'cp-4',
    name: 'Ecovantage Energy',
    contactName: 'David Park',
    contactEmail: 'd.park@ecovantage.com.au',
    instruments: ['ESC', 'VEEC', 'STC'],
    relationship: 'preferred',
    notes: 'Major ESC creator. Can supply large volumes directly.',
  },
  {
    id: 'cp-5',
    name: 'CORE Markets',
    contactName: 'Alex Thompson',
    contactEmail: 'a.thompson@coremarkets.com.au',
    instruments: ['ESC', 'VEEC', 'ACCU', 'LGC', 'STC', 'PRC'],
    relationship: 'active',
    notes: 'Full-service broker. Access to all certificate types.',
  },
];

/** Filter demo counterparties to those who trade the required instrument */
export function getCounterpartiesForInstrument(instrument: string): Counterparty[] {
  return DEMO_COUNTERPARTIES.filter(cp => cp.instruments.includes(instrument));
}
