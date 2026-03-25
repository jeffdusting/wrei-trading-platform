/**
 * WREI Multi-Agent Committee Mode
 * Enhancement A3: Simulates institutional committee decision-making
 *
 * Institutional deals often involve committee decisions (board approval,
 * risk committee, compliance sign-off). This module provides committee
 * member configuration, voting logic, and turn-taking protocols.
 *
 * Committee member types:
 * - Chief Investment Officer (CIO): Overall investment strategy and portfolio fit
 * - Risk Manager: Risk assessment, volatility analysis, and exposure limits
 * - Compliance Officer: Regulatory compliance, AFSL, AML/CTF, jurisdictional
 * - ESG Lead: Environmental impact, sustainability metrics, SDG alignment
 */

// =============================================================================
// TYPES
// =============================================================================

export type CommitteeMemberRole = 'cio' | 'risk_manager' | 'compliance_officer' | 'esg_lead';

export type VotingMode = 'unanimous' | 'majority' | 'weighted';

export type TurnTakingProtocol = 'sequential' | 'round_robin';

export type CommitteeStance = 'approve' | 'conditional_approve' | 'defer' | 'reject';

export interface CommitteeMember {
  role: CommitteeMemberRole;
  name: string;
  title: string;
  priorities: string[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  approvalThreshold: number; // Price threshold relative to anchor (e.g., 0.85 = 85% of anchor)
  weight: number; // Voting weight (used in weighted mode)
  stance: CommitteeStance;
  reasoning: string;
  concerns: string[];
  conditions: string[]; // Conditions for conditional approval
}

export interface CommitteeVote {
  memberRole: CommitteeMemberRole;
  stance: CommitteeStance;
  reasoning: string;
  concerns: string[];
  conditions: string[];
  timestamp: string;
}

export interface CommitteeDecision {
  outcome: 'approved' | 'conditionally_approved' | 'deferred' | 'rejected';
  votingMode: VotingMode;
  votes: CommitteeVote[];
  approvalCount: number;
  rejectionCount: number;
  deferralCount: number;
  conditionalCount: number;
  totalWeight: number;
  approvalWeight: number;
  summary: string;
  conditions: string[]; // Aggregated conditions from all conditional approvals
  nextSteps: string[];
}

export interface CommitteeConfig {
  enabled: boolean;
  votingMode: VotingMode;
  turnTakingProtocol: TurnTakingProtocol;
  members: CommitteeMember[];
  currentSpeakerIndex: number;
  roundsCompleted: number;
  decisions: CommitteeDecision[];
}

export interface CommitteePerspective {
  role: CommitteeMemberRole;
  name: string;
  title: string;
  response: string;
  stance: CommitteeStance;
  concerns: string[];
  conditions: string[];
  keyMetrics: Record<string, string | number>;
}

export interface CommitteeResponse {
  perspectives: CommitteePerspective[];
  consolidatedResponse: string;
  decision: CommitteeDecision | null; // null if discussion ongoing, present if vote taken
  currentSpeakerIndex: number;
  roundsCompleted: number;
}

// =============================================================================
// DEFAULT COMMITTEE MEMBERS
// =============================================================================

export const DEFAULT_COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    role: 'cio',
    name: 'Alexandra Chen',
    title: 'Chief Investment Officer',
    priorities: [
      'Portfolio fit and strategic alignment',
      'Risk-adjusted return expectations',
      'Market timing and entry strategy',
      'Allocation sizing relative to AUM',
    ],
    riskTolerance: 'moderate',
    approvalThreshold: 0.90, // Willing to approve at 90% of anchor
    weight: 3,
    stance: 'defer',
    reasoning: '',
    concerns: [],
    conditions: [],
  },
  {
    role: 'risk_manager',
    name: 'David Okonkwo',
    title: 'Risk Manager',
    priorities: [
      'Volatility assessment and stress testing',
      'Counterparty risk evaluation',
      'Liquidity risk and redemption terms',
      'Concentration risk and portfolio correlation',
    ],
    riskTolerance: 'conservative',
    approvalThreshold: 0.85, // More conservative - needs larger discount
    weight: 2,
    stance: 'defer',
    reasoning: '',
    concerns: [],
    conditions: [],
  },
  {
    role: 'compliance_officer',
    name: 'Sarah Martinez',
    title: 'Compliance Officer',
    priorities: [
      'AFSL regulatory compliance',
      'AML/CTF verification requirements',
      'Jurisdictional constraints and approvals',
      'Product disclosure and investor suitability',
    ],
    riskTolerance: 'conservative',
    approvalThreshold: 0.95, // Compliance cares less about price, more about process
    weight: 2,
    stance: 'defer',
    reasoning: '',
    concerns: [],
    conditions: [],
  },
  {
    role: 'esg_lead',
    name: 'James Whitfield',
    title: 'ESG Lead',
    priorities: [
      'Environmental impact verification',
      'SDG alignment assessment',
      'Greenwashing risk evaluation',
      'Sustainability reporting requirements',
    ],
    riskTolerance: 'moderate',
    approvalThreshold: 0.92, // Values quality over price
    weight: 1,
    stance: 'defer',
    reasoning: '',
    concerns: [],
    conditions: [],
  },
];

// =============================================================================
// COMMITTEE CONFIGURATION
// =============================================================================

/**
 * Creates a new committee configuration with default members.
 */
export function createCommitteeConfig(
  overrides: Partial<CommitteeConfig> = {}
): CommitteeConfig {
  return {
    enabled: true,
    votingMode: 'majority',
    turnTakingProtocol: 'sequential',
    members: DEFAULT_COMMITTEE_MEMBERS.map(m => ({ ...m })),
    currentSpeakerIndex: 0,
    roundsCompleted: 0,
    decisions: [],
    ...overrides,
  };
}

/**
 * Validates a committee configuration for correctness.
 */
export function validateCommitteeConfig(config: CommitteeConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.members || config.members.length === 0) {
    errors.push('Committee must have at least one member');
  }

  if (config.members.length > 10) {
    errors.push('Committee cannot exceed 10 members');
  }

  const validVotingModes: VotingMode[] = ['unanimous', 'majority', 'weighted'];
  if (!validVotingModes.includes(config.votingMode)) {
    errors.push(`Invalid voting mode: ${config.votingMode}`);
  }

  const validProtocols: TurnTakingProtocol[] = ['sequential', 'round_robin'];
  if (!validProtocols.includes(config.turnTakingProtocol)) {
    errors.push(`Invalid turn-taking protocol: ${config.turnTakingProtocol}`);
  }

  // Validate each member
  const roles = new Set<CommitteeMemberRole>();
  for (const member of config.members) {
    if (roles.has(member.role)) {
      errors.push(`Duplicate committee role: ${member.role}`);
    }
    roles.add(member.role);

    if (!member.name || member.name.trim().length === 0) {
      errors.push(`Member with role ${member.role} has no name`);
    }

    if (member.weight <= 0) {
      errors.push(`Member ${member.role} has invalid weight: ${member.weight}`);
    }

    if (member.approvalThreshold <= 0 || member.approvalThreshold > 1) {
      errors.push(`Member ${member.role} has invalid approval threshold: ${member.approvalThreshold}`);
    }
  }

  // Validate weights for weighted voting
  if (config.votingMode === 'weighted') {
    const totalWeight = config.members.reduce((sum, m) => sum + m.weight, 0);
    if (totalWeight === 0) {
      errors.push('Total voting weight cannot be zero in weighted mode');
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// TURN-TAKING LOGIC
// =============================================================================

/**
 * Gets the next speaker index based on the turn-taking protocol.
 */
export function getNextSpeaker(config: CommitteeConfig): number {
  const memberCount = config.members.length;
  if (memberCount === 0) return 0;

  switch (config.turnTakingProtocol) {
    case 'sequential':
      // Sequential: CIO -> Risk -> Compliance -> ESG, then back to CIO
      return (config.currentSpeakerIndex + 1) % memberCount;

    case 'round_robin':
      // Round robin: same as sequential but tracks rounds
      return (config.currentSpeakerIndex + 1) % memberCount;

    default:
      return (config.currentSpeakerIndex + 1) % memberCount;
  }
}

/**
 * Determines if a full round of committee discussion is complete.
 */
export function isRoundComplete(config: CommitteeConfig): boolean {
  const memberCount = config.members.length;
  if (memberCount === 0) return true;

  // A round is complete when all members have spoken (next index would be 0)
  return config.currentSpeakerIndex === memberCount - 1;
}

/**
 * Gets the current speaker from the committee configuration.
 */
export function getCurrentSpeaker(config: CommitteeConfig): CommitteeMember | null {
  if (config.members.length === 0) return null;
  const index = Math.min(config.currentSpeakerIndex, config.members.length - 1);
  return config.members[index];
}

/**
 * Advances the committee to the next speaker and updates round tracking.
 */
export function advanceSpeaker(config: CommitteeConfig): CommitteeConfig {
  const updated = { ...config };
  const wasRoundComplete = isRoundComplete(config);
  updated.currentSpeakerIndex = getNextSpeaker(config);

  if (wasRoundComplete) {
    updated.roundsCompleted += 1;
  }

  return updated;
}

// =============================================================================
// VOTING LOGIC
// =============================================================================

/**
 * Converts a stance to a numerical approval score.
 */
function stanceToScore(stance: CommitteeStance): number {
  switch (stance) {
    case 'approve': return 1.0;
    case 'conditional_approve': return 0.7;
    case 'defer': return 0.0;
    case 'reject': return -1.0;
  }
}

/**
 * Tallies votes from committee members and produces a decision.
 */
export function tallyVotes(
  members: CommitteeMember[],
  votingMode: VotingMode
): CommitteeDecision {
  const votes: CommitteeVote[] = members.map(m => ({
    memberRole: m.role,
    stance: m.stance,
    reasoning: m.reasoning,
    concerns: [...m.concerns],
    conditions: [...m.conditions],
    timestamp: new Date().toISOString(),
  }));

  const approvalCount = votes.filter(v => v.stance === 'approve').length;
  const conditionalCount = votes.filter(v => v.stance === 'conditional_approve').length;
  const deferralCount = votes.filter(v => v.stance === 'defer').length;
  const rejectionCount = votes.filter(v => v.stance === 'reject').length;

  const totalWeight = members.reduce((sum, m) => sum + m.weight, 0);
  const approvalWeight = members
    .filter(m => m.stance === 'approve' || m.stance === 'conditional_approve')
    .reduce((sum, m) => sum + m.weight, 0);

  let outcome: CommitteeDecision['outcome'];

  switch (votingMode) {
    case 'unanimous':
      if (rejectionCount > 0) {
        outcome = 'rejected';
      } else if (deferralCount > 0) {
        outcome = 'deferred';
      } else if (conditionalCount > 0 && approvalCount + conditionalCount === members.length) {
        outcome = 'conditionally_approved';
      } else if (approvalCount === members.length) {
        outcome = 'approved';
      } else {
        outcome = 'deferred';
      }
      break;

    case 'majority':
      if (approvalCount > members.length / 2) {
        outcome = 'approved';
      } else if (approvalCount + conditionalCount > members.length / 2) {
        outcome = 'conditionally_approved';
      } else if (rejectionCount > members.length / 2) {
        outcome = 'rejected';
      } else {
        outcome = 'deferred';
      }
      break;

    case 'weighted': {
      const rejectWeight = members
        .filter(m => m.stance === 'reject')
        .reduce((sum, m) => sum + m.weight, 0);
      const pureApprovalWeight = members
        .filter(m => m.stance === 'approve')
        .reduce((sum, m) => sum + m.weight, 0);

      if (pureApprovalWeight > totalWeight / 2) {
        outcome = 'approved';
      } else if (approvalWeight > totalWeight / 2) {
        outcome = 'conditionally_approved';
      } else if (rejectWeight > totalWeight / 2) {
        outcome = 'rejected';
      } else {
        outcome = 'deferred';
      }
      break;
    }
  }

  // Aggregate conditions from conditional approvals
  const aggregatedConditions = votes
    .filter(v => v.stance === 'conditional_approve')
    .flatMap(v => v.conditions);

  // Generate summary
  const summary = generateDecisionSummary(outcome, votes, votingMode);

  // Generate next steps
  const nextSteps = generateNextSteps(outcome, votes);

  return {
    outcome,
    votingMode,
    votes,
    approvalCount,
    rejectionCount,
    deferralCount,
    conditionalCount,
    totalWeight,
    approvalWeight,
    summary,
    conditions: aggregatedConditions,
    nextSteps,
  };
}

/**
 * Generates a human-readable summary of the committee decision.
 */
function generateDecisionSummary(
  outcome: CommitteeDecision['outcome'],
  votes: CommitteeVote[],
  votingMode: VotingMode
): string {
  const approveNames = votes
    .filter(v => v.stance === 'approve')
    .map(v => getMemberNameForRole(v.memberRole));
  const conditionalNames = votes
    .filter(v => v.stance === 'conditional_approve')
    .map(v => getMemberNameForRole(v.memberRole));
  const rejectNames = votes
    .filter(v => v.stance === 'reject')
    .map(v => getMemberNameForRole(v.memberRole));
  const deferNames = votes
    .filter(v => v.stance === 'defer')
    .map(v => getMemberNameForRole(v.memberRole));

  switch (outcome) {
    case 'approved':
      return `Committee unanimously approves the investment. All members (${approveNames.join(', ')}) voted in favour under ${votingMode} voting.`;
    case 'conditionally_approved':
      return `Committee conditionally approves the investment (${votingMode} voting). ${conditionalNames.length > 0 ? `Conditional approvals from: ${conditionalNames.join(', ')}.` : ''} ${approveNames.length > 0 ? `Full approvals from: ${approveNames.join(', ')}.` : ''} Conditions must be met before proceeding.`;
    case 'rejected':
      return `Committee rejects the investment under ${votingMode} voting. ${rejectNames.length > 0 ? `Rejected by: ${rejectNames.join(', ')}.` : ''} Further negotiation or structural changes required.`;
    case 'deferred':
      return `Committee defers the decision under ${votingMode} voting. ${deferNames.length > 0 ? `Deferred by: ${deferNames.join(', ')}.` : ''} Additional information or negotiation rounds requested.`;
  }
}

/**
 * Gets the display name for a committee role.
 */
function getMemberNameForRole(role: CommitteeMemberRole): string {
  const member = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === role);
  return member ? member.name : role;
}

/**
 * Generates next steps based on the committee decision.
 */
function generateNextSteps(
  outcome: CommitteeDecision['outcome'],
  votes: CommitteeVote[]
): string[] {
  const steps: string[] = [];

  switch (outcome) {
    case 'approved':
      steps.push('Proceed to settlement terms negotiation');
      steps.push('Prepare investment documentation');
      steps.push('Initiate KYC/AML verification if not completed');
      break;

    case 'conditionally_approved':
      // Add specific steps for each condition
      const conditions = votes
        .filter(v => v.stance === 'conditional_approve')
        .flatMap(v => v.conditions);
      if (conditions.length > 0) {
        steps.push(`Address ${conditions.length} outstanding condition(s)`);
      }
      steps.push('Schedule follow-up committee review');
      steps.push('Prepare condition fulfilment documentation');
      break;

    case 'rejected':
      const concerns = votes
        .filter(v => v.stance === 'reject')
        .flatMap(v => v.concerns);
      if (concerns.length > 0) {
        steps.push(`Address key concerns: ${concerns.slice(0, 3).join('; ')}`);
      }
      steps.push('Consider alternative deal structure');
      steps.push('Request additional due diligence materials');
      break;

    case 'deferred':
      steps.push('Continue negotiation to gather more information');
      steps.push('Address outstanding committee member concerns');
      steps.push('Schedule next committee review round');
      break;
  }

  return steps;
}

// =============================================================================
// MEMBER PERSPECTIVE GENERATION
// =============================================================================

/**
 * Determines the appropriate stance for a committee member based on
 * the current negotiation state.
 */
export function determineMemberStance(
  member: CommitteeMember,
  currentPrice: number,
  anchorPrice: number,
  negotiationRound: number,
  phase: string
): CommitteeStance {
  const priceRatio = currentPrice / anchorPrice;

  // Early rounds: everyone defers
  if (negotiationRound < 2) {
    return 'defer';
  }

  // Check if price meets member's threshold
  const meetsThreshold = priceRatio >= member.approvalThreshold;

  // Role-specific stance logic
  switch (member.role) {
    case 'cio':
      if (meetsThreshold && phase !== 'opening') {
        return negotiationRound >= 4 ? 'approve' : 'conditional_approve';
      }
      return negotiationRound >= 6 && !meetsThreshold ? 'reject' : 'defer';

    case 'risk_manager':
      // Risk manager is more conservative
      if (priceRatio >= member.approvalThreshold + 0.05) {
        return 'approve';
      } else if (meetsThreshold) {
        return 'conditional_approve';
      }
      return negotiationRound >= 7 ? 'reject' : 'defer';

    case 'compliance_officer':
      // Compliance cares about process, approves if terms are compliant
      if (negotiationRound >= 3) {
        return meetsThreshold ? 'approve' : 'conditional_approve';
      }
      return 'defer';

    case 'esg_lead':
      // ESG lead approves based on environmental quality metrics
      if (meetsThreshold && negotiationRound >= 3) {
        return 'approve';
      }
      return negotiationRound >= 2 ? 'conditional_approve' : 'defer';

    default:
      return 'defer';
  }
}

/**
 * Generates role-specific concerns based on the committee member's priorities.
 */
export function generateMemberConcerns(
  member: CommitteeMember,
  currentPrice: number,
  anchorPrice: number,
  phase: string
): string[] {
  const priceRatio = currentPrice / anchorPrice;
  const concerns: string[] = [];

  switch (member.role) {
    case 'cio':
      if (priceRatio < 0.90) {
        concerns.push(`Current price ($${currentPrice}) represents a ${((1 - priceRatio) * 100).toFixed(1)}% discount — need to assess impact on portfolio returns`);
      }
      if (phase === 'opening') {
        concerns.push('Insufficient pricing discovery — need more negotiation rounds');
      }
      concerns.push('Assess strategic allocation fit within broader portfolio mandate');
      break;

    case 'risk_manager':
      concerns.push('Carbon price volatility (25% historical) requires stress testing');
      if (priceRatio < 0.85) {
        concerns.push(`Aggressive pricing may indicate market concerns — recommend enhanced due diligence`);
      }
      concerns.push('Counterparty concentration risk assessment required');
      concerns.push('Liquidity risk during redemption windows needs quantification');
      break;

    case 'compliance_officer':
      concerns.push('AFSL wholesale investor exemption documentation must be current');
      concerns.push('AML/CTF verification must be completed before settlement');
      if (phase === 'opening' || phase === 'elicitation') {
        concerns.push('Product disclosure obligations under MiFID II / AFSL must be satisfied');
      }
      break;

    case 'esg_lead':
      concerns.push('Triple-standard verification (ISO 14064-2, Verra, Gold Standard) must be confirmed');
      concerns.push('SDG alignment documentation required for ESG reporting');
      if (priceRatio < 0.85) {
        concerns.push('Below-market pricing may indicate verification quality concerns');
      }
      break;
  }

  return concerns;
}

/**
 * Generates role-specific conditions for conditional approval.
 */
export function generateMemberConditions(
  member: CommitteeMember,
  currentPrice: number,
  anchorPrice: number
): string[] {
  const conditions: string[] = [];
  const priceRatio = currentPrice / anchorPrice;

  switch (member.role) {
    case 'cio':
      if (priceRatio < 0.95) {
        conditions.push('Final pricing must be within 5% of anchor price for full approval');
      }
      conditions.push('Board-level investment memo required before settlement');
      break;

    case 'risk_manager':
      conditions.push('Quarterly risk reporting framework must be established');
      conditions.push('Maximum position size limited to 5% of portfolio AUM');
      if (priceRatio < 0.90) {
        conditions.push('Enhanced monitoring required for first 12 months');
      }
      break;

    case 'compliance_officer':
      conditions.push('All KYC/AML documentation must be completed and verified');
      conditions.push('AFSL compliance attestation required');
      conditions.push('Investor suitability assessment must be on file');
      break;

    case 'esg_lead':
      conditions.push('Independent verification of carbon credit provenance required');
      conditions.push('Annual ESG impact reporting commitment from WREI');
      break;
  }

  return conditions;
}

// =============================================================================
// COMMITTEE SYSTEM PROMPT SECTION
// =============================================================================

/**
 * Generates the committee-specific section of the system prompt.
 * This instructs Claude to generate responses from multiple committee
 * member perspectives in a single API call.
 */
export function buildCommitteeSystemPromptSection(config: CommitteeConfig): string {
  const members = config.members;
  const memberDescriptions = members.map(m =>
    `- **${m.name}** (${m.title}): Priorities: ${m.priorities.join(', ')}. Risk tolerance: ${m.riskTolerance}.`
  ).join('\n');

  return `
<committee_mode>
IMPORTANT: This negotiation is being evaluated by an institutional investment committee.
You must generate a response that includes perspectives from ALL committee members.

COMMITTEE MEMBERS:
${memberDescriptions}

VOTING MODE: ${config.votingMode}
TURN-TAKING: ${config.turnTakingProtocol}
ROUNDS COMPLETED: ${config.roundsCompleted}

For EVERY message in committee mode, respond with ONLY a valid JSON object (no markdown, no backticks, no preamble):
{
  "response": "The main consolidated negotiation response from the committee",
  "argumentClassification": "one of: price_challenge, fairness_appeal, time_pressure, information_request, relationship_signal, authority_constraint, emotional_expression, general",
  "emotionalState": "one of: frustrated, enthusiastic, sceptical, satisfied, neutral, pressured",
  "detectedWarmth": 5,
  "detectedDominance": 5,
  "proposedPrice": null,
  "suggestedConcession": null,
  "escalate": false,
  "escalationReason": null,
  "committeePerspectives": [
    {
      "role": "cio",
      "name": "${members.find(m => m.role === 'cio')?.name || 'CIO'}",
      "stance": "one of: approve, conditional_approve, defer, reject",
      "response": "The CIO's perspective on this round of negotiation",
      "concerns": ["List of specific concerns"],
      "conditions": ["Conditions for approval, if conditional"],
      "keyMetrics": {"portfolioFit": "assessment", "expectedReturn": "X%"}
    },
    {
      "role": "risk_manager",
      "name": "${members.find(m => m.role === 'risk_manager')?.name || 'Risk Manager'}",
      "stance": "one of: approve, conditional_approve, defer, reject",
      "response": "The Risk Manager's perspective on risk factors",
      "concerns": ["List of risk concerns"],
      "conditions": ["Risk management conditions"],
      "keyMetrics": {"volatilityAssessment": "X%", "riskGrade": "A-F"}
    },
    {
      "role": "compliance_officer",
      "name": "${members.find(m => m.role === 'compliance_officer')?.name || 'Compliance Officer'}",
      "stance": "one of: approve, conditional_approve, defer, reject",
      "response": "The Compliance Officer's regulatory assessment",
      "concerns": ["Regulatory concerns"],
      "conditions": ["Compliance conditions"],
      "keyMetrics": {"regulatoryStatus": "compliant/pending", "jurisdictionalCoverage": "X"}
    },
    {
      "role": "esg_lead",
      "name": "${members.find(m => m.role === 'esg_lead')?.name || 'ESG Lead'}",
      "stance": "one of: approve, conditional_approve, defer, reject",
      "response": "The ESG Lead's sustainability assessment",
      "concerns": ["ESG concerns"],
      "conditions": ["ESG conditions"],
      "keyMetrics": {"esgScore": "X/100", "sdgAlignment": "X SDGs"}
    }
  ]
}

IMPORTANT RULES FOR COMMITTEE RESPONSES:
1. Each committee member should have a DISTINCT perspective based on their role and priorities
2. Committee members may DISAGREE with each other — this is natural and expected
3. The consolidated "response" should synthesise the committee's overall position
4. Stances should reflect the negotiation progress: early rounds should have more "defer" stances
5. All pricing constraints from the main negotiation rules still apply
6. Each member's response should be 1-2 sentences, focused on their area of expertise
</committee_mode>`;
}

// =============================================================================
// RESPONSE PARSING
// =============================================================================

/**
 * Parses committee perspectives from the Claude API response.
 * Falls back gracefully if committee data is missing or malformed.
 */
export function parseCommitteeResponse(
  rawResponse: any,
  config: CommitteeConfig,
  currentPrice: number,
  anchorPrice: number,
  negotiationRound: number,
  phase: string
): CommitteeResponse {
  let perspectives: CommitteePerspective[] = [];

  // Try to extract committee perspectives from the AI response
  if (rawResponse?.committeePerspectives && Array.isArray(rawResponse.committeePerspectives)) {
    perspectives = rawResponse.committeePerspectives.map((p: any) => {
      const validStances: CommitteeStance[] = ['approve', 'conditional_approve', 'defer', 'reject'];
      const stance: CommitteeStance = validStances.includes(p.stance) ? p.stance : 'defer';

      return {
        role: p.role || 'cio',
        name: p.name || getMemberNameForRole(p.role || 'cio'),
        title: getMemberTitleForRole(p.role || 'cio'),
        response: p.response || '',
        stance,
        concerns: Array.isArray(p.concerns) ? p.concerns : [],
        conditions: Array.isArray(p.conditions) ? p.conditions : [],
        keyMetrics: p.keyMetrics || {},
      };
    });
  }

  // If no perspectives were parsed, generate defaults based on negotiation state
  if (perspectives.length === 0) {
    perspectives = generateDefaultPerspectives(
      config,
      currentPrice,
      anchorPrice,
      negotiationRound,
      phase
    );
  }

  // Update member stances from perspectives
  const updatedMembers = config.members.map(member => {
    const perspective = perspectives.find(p => p.role === member.role);
    if (perspective) {
      return {
        ...member,
        stance: perspective.stance,
        reasoning: perspective.response,
        concerns: perspective.concerns,
        conditions: perspective.conditions,
      };
    }
    return member;
  });

  // Determine if a vote should be taken
  const shouldVote = negotiationRound >= 3 &&
    perspectives.every(p => p.stance !== 'defer') &&
    config.roundsCompleted >= 1;

  const decision = shouldVote
    ? tallyVotes(updatedMembers, config.votingMode)
    : null;

  // Calculate next speaker for turn tracking
  const nextSpeakerIndex = getNextSpeaker(config);
  const roundComplete = isRoundComplete(config);

  return {
    perspectives,
    consolidatedResponse: rawResponse?.response || generateConsolidatedResponse(perspectives),
    decision,
    currentSpeakerIndex: nextSpeakerIndex,
    roundsCompleted: roundComplete ? config.roundsCompleted + 1 : config.roundsCompleted,
  };
}

/**
 * Gets the title for a committee member role.
 */
function getMemberTitleForRole(role: CommitteeMemberRole): string {
  const titles: Record<CommitteeMemberRole, string> = {
    cio: 'Chief Investment Officer',
    risk_manager: 'Risk Manager',
    compliance_officer: 'Compliance Officer',
    esg_lead: 'ESG Lead',
  };
  return titles[role] || role;
}

/**
 * Generates default perspectives when the AI doesn't provide committee data.
 * This ensures the committee panel always has content even if parsing fails.
 */
function generateDefaultPerspectives(
  config: CommitteeConfig,
  currentPrice: number,
  anchorPrice: number,
  negotiationRound: number,
  phase: string
): CommitteePerspective[] {
  return config.members.map(member => {
    const stance = determineMemberStance(
      member,
      currentPrice,
      anchorPrice,
      negotiationRound,
      phase
    );
    const concerns = generateMemberConcerns(member, currentPrice, anchorPrice, phase);
    const conditions = stance === 'conditional_approve'
      ? generateMemberConditions(member, currentPrice, anchorPrice)
      : [];

    return {
      role: member.role,
      name: member.name,
      title: member.title,
      response: generateDefaultMemberResponse(member, currentPrice, anchorPrice, stance, phase),
      stance,
      concerns,
      conditions,
      keyMetrics: generateDefaultKeyMetrics(member, currentPrice, anchorPrice),
    };
  });
}

/**
 * Generates a default response for a committee member when AI parsing fails.
 */
function generateDefaultMemberResponse(
  member: CommitteeMember,
  currentPrice: number,
  anchorPrice: number,
  stance: CommitteeStance,
  phase: string
): string {
  const priceRatio = ((currentPrice / anchorPrice) * 100).toFixed(1);

  switch (member.role) {
    case 'cio':
      if (stance === 'approve') return `Current pricing at ${priceRatio}% of anchor is acceptable for portfolio allocation. Recommend proceeding.`;
      if (stance === 'conditional_approve') return `Pricing trajectory is promising. Need final terms confirmation before full approval.`;
      return `Continuing price discovery at $${currentPrice}. Need more negotiation rounds for optimal entry point.`;

    case 'risk_manager':
      if (stance === 'approve') return `Risk assessment complete. Volatility parameters within acceptable bounds at current pricing.`;
      if (stance === 'conditional_approve') return `Risk profile acceptable with conditions. Quarterly monitoring and position limits required.`;
      return `Assessing risk profile at current terms. Carbon price volatility and liquidity risks under review.`;

    case 'compliance_officer':
      if (stance === 'approve') return `Regulatory framework verified. AFSL compliance, AML/CTF documentation, and jurisdictional approvals confirmed.`;
      if (stance === 'conditional_approve') return `Regulatory assessment in progress. KYC/AML verification and product disclosure requirements pending.`;
      return `Reviewing regulatory requirements. ${phase === 'opening' ? 'Initial compliance assessment in progress.' : 'AFSL and jurisdictional compliance under review.'}`;

    case 'esg_lead':
      if (stance === 'approve') return `ESG verification confirmed. Triple-standard compliance and SDG alignment meet mandate requirements.`;
      if (stance === 'conditional_approve') return `Environmental impact assessment positive. Independent verification of provenance chain required.`;
      return `Evaluating environmental impact metrics and verification standards. SDG alignment assessment ongoing.`;

    default:
      return `Assessment in progress.`;
  }
}

/**
 * Generates default key metrics for a committee member.
 */
function generateDefaultKeyMetrics(
  member: CommitteeMember,
  currentPrice: number,
  anchorPrice: number
): Record<string, string | number> {
  const priceRatio = currentPrice / anchorPrice;

  switch (member.role) {
    case 'cio':
      return {
        portfolioFit: priceRatio >= 0.90 ? 'Strong' : 'Under Review',
        expectedReturn: `${(8 + (1 - priceRatio) * 40).toFixed(1)}%`,
        allocationRecommendation: '3-5% of portfolio AUM',
      };

    case 'risk_manager':
      return {
        volatilityAssessment: '25%',
        riskGrade: priceRatio >= 0.90 ? 'B+' : 'B',
        maxDrawdown: '15%',
        sharpeRatio: '0.8',
      };

    case 'compliance_officer':
      return {
        regulatoryStatus: 'Under Review',
        jurisdictionalCoverage: 'AU, NZ, SG',
        aflsCompliance: 'Pending',
      };

    case 'esg_lead':
      return {
        esgScore: 85,
        sdgAlignment: '4 SDGs (6, 7, 13, 14)',
        verificationStandard: 'Triple-standard',
        greenwashingRisk: 'Low',
      };

    default:
      return {};
  }
}

/**
 * Generates a consolidated response from individual committee perspectives.
 */
function generateConsolidatedResponse(perspectives: CommitteePerspective[]): string {
  if (perspectives.length === 0) {
    return 'The committee is reviewing the current proposal.';
  }

  const stanceSummary = perspectives
    .map(p => `${p.name} (${p.title}): ${p.stance.replace('_', ' ')}`)
    .join('; ');

  return `Committee Status: ${stanceSummary}. The committee will continue its review.`;
}
