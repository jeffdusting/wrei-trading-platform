/**
 * WREI Multi-Agent Committee Mode Tests
 * Enhancement A3: Comprehensive tests for committee configuration,
 * voting logic, turn-taking, perspective generation, and response parsing.
 *
 * Tests: 25 tests across 6 describe blocks
 */

import {
  CommitteeConfig,
  CommitteeMember,
  CommitteeMemberRole,
  CommitteeStance,
  CommitteePerspective,
  CommitteeResponse,
  VotingMode,
  TurnTakingProtocol,
  DEFAULT_COMMITTEE_MEMBERS,
  createCommitteeConfig,
  validateCommitteeConfig,
  getNextSpeaker,
  isRoundComplete,
  getCurrentSpeaker,
  advanceSpeaker,
  tallyVotes,
  determineMemberStance,
  generateMemberConcerns,
  generateMemberConditions,
  buildCommitteeSystemPromptSection,
  parseCommitteeResponse,
} from '@/lib/committee-mode';

// =============================================================================
// TEST: Committee Configuration
// =============================================================================

describe('Committee Configuration', () => {
  test('1. createCommitteeConfig returns valid default configuration', () => {
    const config = createCommitteeConfig();

    expect(config.enabled).toBe(true);
    expect(config.votingMode).toBe('majority');
    expect(config.turnTakingProtocol).toBe('sequential');
    expect(config.members).toHaveLength(4);
    expect(config.currentSpeakerIndex).toBe(0);
    expect(config.roundsCompleted).toBe(0);
    expect(config.decisions).toHaveLength(0);
  });

  test('2. createCommitteeConfig accepts overrides', () => {
    const config = createCommitteeConfig({
      votingMode: 'unanimous',
      turnTakingProtocol: 'round_robin',
    });

    expect(config.votingMode).toBe('unanimous');
    expect(config.turnTakingProtocol).toBe('round_robin');
    // Defaults still apply for non-overridden fields
    expect(config.enabled).toBe(true);
    expect(config.members).toHaveLength(4);
  });

  test('3. DEFAULT_COMMITTEE_MEMBERS has correct roles', () => {
    const roles = DEFAULT_COMMITTEE_MEMBERS.map(m => m.role);
    expect(roles).toContain('cio');
    expect(roles).toContain('risk_manager');
    expect(roles).toContain('compliance_officer');
    expect(roles).toContain('esg_lead');
    expect(roles).toHaveLength(4);
  });

  test('4. Each default member has required properties', () => {
    for (const member of DEFAULT_COMMITTEE_MEMBERS) {
      expect(member.name).toBeTruthy();
      expect(member.title).toBeTruthy();
      expect(member.priorities.length).toBeGreaterThan(0);
      expect(['conservative', 'moderate', 'aggressive']).toContain(member.riskTolerance);
      expect(member.approvalThreshold).toBeGreaterThan(0);
      expect(member.approvalThreshold).toBeLessThanOrEqual(1);
      expect(member.weight).toBeGreaterThan(0);
      expect(member.stance).toBe('defer'); // Default stance
    }
  });

  test('5. Members have distinct voting weights', () => {
    const cio = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'cio')!;
    const risk = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'risk_manager')!;
    const esg = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'esg_lead')!;

    // CIO should have highest weight
    expect(cio.weight).toBeGreaterThan(risk.weight);
    expect(cio.weight).toBeGreaterThan(esg.weight);
  });
});

// =============================================================================
// TEST: Configuration Validation
// =============================================================================

describe('Committee Configuration Validation', () => {
  test('6. Valid default configuration passes validation', () => {
    const config = createCommitteeConfig();
    const result = validateCommitteeConfig(config);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('7. Empty members array fails validation', () => {
    const config = createCommitteeConfig({ members: [] });
    const result = validateCommitteeConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Committee must have at least one member');
  });

  test('8. Duplicate roles fail validation', () => {
    const members = [
      { ...DEFAULT_COMMITTEE_MEMBERS[0] },
      { ...DEFAULT_COMMITTEE_MEMBERS[0] }, // Duplicate CIO
    ];
    const config = createCommitteeConfig({ members });
    const result = validateCommitteeConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate committee role'))).toBe(true);
  });

  test('9. Invalid approval threshold fails validation', () => {
    const members = [
      { ...DEFAULT_COMMITTEE_MEMBERS[0], approvalThreshold: 1.5 },
    ];
    const config = createCommitteeConfig({ members });
    const result = validateCommitteeConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid approval threshold'))).toBe(true);
  });

  test('10. Invalid weight fails validation', () => {
    const members = [
      { ...DEFAULT_COMMITTEE_MEMBERS[0], weight: 0 },
    ];
    const config = createCommitteeConfig({ members });
    const result = validateCommitteeConfig(config);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('invalid weight'))).toBe(true);
  });
});

// =============================================================================
// TEST: Turn-Taking Logic
// =============================================================================

describe('Turn-Taking Protocol', () => {
  test('11. Sequential turn-taking advances through all members', () => {
    let config = createCommitteeConfig({
      turnTakingProtocol: 'sequential',
      currentSpeakerIndex: 0,
    });

    // First speaker (index 0 -> next is 1)
    expect(getNextSpeaker(config)).toBe(1);

    config.currentSpeakerIndex = 1;
    expect(getNextSpeaker(config)).toBe(2);

    config.currentSpeakerIndex = 2;
    expect(getNextSpeaker(config)).toBe(3);

    // Wraps around
    config.currentSpeakerIndex = 3;
    expect(getNextSpeaker(config)).toBe(0);
  });

  test('12. Round robin wraps correctly', () => {
    const config = createCommitteeConfig({
      turnTakingProtocol: 'round_robin',
      currentSpeakerIndex: 3,
    });

    expect(getNextSpeaker(config)).toBe(0);
  });

  test('13. isRoundComplete detects end of round', () => {
    const config = createCommitteeConfig();

    // Not complete at start
    config.currentSpeakerIndex = 0;
    expect(isRoundComplete(config)).toBe(false);

    // Not complete in middle
    config.currentSpeakerIndex = 2;
    expect(isRoundComplete(config)).toBe(false);

    // Complete at last member
    config.currentSpeakerIndex = 3; // 4 members, so index 3 is last
    expect(isRoundComplete(config)).toBe(true);
  });

  test('14. getCurrentSpeaker returns correct member', () => {
    const config = createCommitteeConfig();

    config.currentSpeakerIndex = 0;
    expect(getCurrentSpeaker(config)?.role).toBe('cio');

    config.currentSpeakerIndex = 1;
    expect(getCurrentSpeaker(config)?.role).toBe('risk_manager');

    config.currentSpeakerIndex = 2;
    expect(getCurrentSpeaker(config)?.role).toBe('compliance_officer');

    config.currentSpeakerIndex = 3;
    expect(getCurrentSpeaker(config)?.role).toBe('esg_lead');
  });

  test('15. advanceSpeaker increments round count at end of round', () => {
    const config = createCommitteeConfig({
      currentSpeakerIndex: 3, // Last speaker
      roundsCompleted: 0,
    });

    const updated = advanceSpeaker(config);
    expect(updated.roundsCompleted).toBe(1);
    expect(updated.currentSpeakerIndex).toBe(0); // Wrapped back
  });

  test('16. advanceSpeaker does not increment round mid-round', () => {
    const config = createCommitteeConfig({
      currentSpeakerIndex: 1,
      roundsCompleted: 0,
    });

    const updated = advanceSpeaker(config);
    expect(updated.roundsCompleted).toBe(0); // No increment
    expect(updated.currentSpeakerIndex).toBe(2);
  });
});

// =============================================================================
// TEST: Voting Logic
// =============================================================================

describe('Voting Logic', () => {
  const createMembersWithStances = (stances: CommitteeStance[]): CommitteeMember[] => {
    return DEFAULT_COMMITTEE_MEMBERS.map((m, i) => ({
      ...m,
      stance: stances[i] || 'defer',
      reasoning: `Test reasoning for ${m.role}`,
      concerns: ['Test concern'],
      conditions: stances[i] === 'conditional_approve' ? ['Test condition'] : [],
    }));
  };

  test('17. Unanimous voting requires all approvals', () => {
    const members = createMembersWithStances(['approve', 'approve', 'approve', 'approve']);
    const decision = tallyVotes(members, 'unanimous');

    expect(decision.outcome).toBe('approved');
    expect(decision.approvalCount).toBe(4);
    expect(decision.rejectionCount).toBe(0);
  });

  test('18. Unanimous voting rejects with any rejection', () => {
    const members = createMembersWithStances(['approve', 'approve', 'reject', 'approve']);
    const decision = tallyVotes(members, 'unanimous');

    expect(decision.outcome).toBe('rejected');
    expect(decision.rejectionCount).toBe(1);
  });

  test('19. Majority voting approves with majority approvals', () => {
    const members = createMembersWithStances(['approve', 'approve', 'approve', 'defer']);
    const decision = tallyVotes(members, 'majority');

    expect(decision.outcome).toBe('approved');
    expect(decision.approvalCount).toBe(3);
  });

  test('20. Majority voting defers without majority', () => {
    const members = createMembersWithStances(['approve', 'defer', 'defer', 'defer']);
    const decision = tallyVotes(members, 'majority');

    expect(decision.outcome).toBe('deferred');
    expect(decision.deferralCount).toBe(3);
  });

  test('21. Weighted voting uses member weights', () => {
    // CIO weight=3, Risk=2, Compliance=2, ESG=1 => total=8
    // CIO (approve:3) + ESG (approve:1) = 4 out of 8 = exactly 50%, NOT > 50%
    const members = createMembersWithStances(['approve', 'defer', 'defer', 'approve']);
    const decision = tallyVotes(members, 'weighted');

    // 4/8 = exactly 50%, so NOT > 50%, so deferred
    expect(decision.outcome).toBe('deferred');

    // Now add risk manager approval: 3+2+1 = 6 out of 8 = 75%
    const members2 = createMembersWithStances(['approve', 'approve', 'defer', 'approve']);
    const decision2 = tallyVotes(members2, 'weighted');
    expect(decision2.outcome).toBe('approved');
  });

  test('22. Conditional approvals are tracked separately', () => {
    const members = createMembersWithStances([
      'approve', 'conditional_approve', 'conditional_approve', 'approve'
    ]);
    const decision = tallyVotes(members, 'majority');

    expect(decision.outcome).toBe('conditionally_approved');
    expect(decision.conditionalCount).toBe(2);
    expect(decision.conditions.length).toBeGreaterThan(0);
  });

  test('23. Decision includes summary and next steps', () => {
    const members = createMembersWithStances(['approve', 'approve', 'approve', 'approve']);
    const decision = tallyVotes(members, 'majority');

    expect(decision.summary).toBeTruthy();
    expect(decision.summary.length).toBeGreaterThan(0);
    expect(decision.nextSteps).toBeInstanceOf(Array);
    expect(decision.nextSteps.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// TEST: Member Stance Determination
// =============================================================================

describe('Member Stance Determination', () => {
  test('24. Early rounds default to defer', () => {
    const cio = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'cio')!;
    const stance = determineMemberStance(cio, 150, 150, 1, 'opening');
    expect(stance).toBe('defer');
  });

  test('25. CIO approves when price meets threshold in later rounds', () => {
    const cio = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'cio')!;
    // Price at anchor (100% of anchor), threshold is 0.90
    const stance = determineMemberStance(cio, 150, 150, 5, 'negotiation');
    expect(stance).toBe('approve');
  });

  test('26. Risk manager requires higher threshold', () => {
    const riskMgr = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'risk_manager')!;
    // At exactly the threshold, risk manager gives conditional approval
    const priceAtThreshold = 150 * riskMgr.approvalThreshold;
    const stance = determineMemberStance(riskMgr, priceAtThreshold, 150, 5, 'negotiation');
    expect(stance).toBe('conditional_approve');
  });

  test('27. Compliance officer approves based on process, not just price', () => {
    const compliance = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'compliance_officer')!;
    // Round 3 with price at anchor
    const stance = determineMemberStance(compliance, 150, 150, 3, 'negotiation');
    expect(stance).toBe('approve');
  });

  test('28. Member concerns are role-specific', () => {
    const riskMgr = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'risk_manager')!;
    const concerns = generateMemberConcerns(riskMgr, 120, 150, 'negotiation');

    expect(concerns.length).toBeGreaterThan(0);
    // Risk manager should mention volatility
    expect(concerns.some(c => c.toLowerCase().includes('volatility'))).toBe(true);
  });

  test('29. Member conditions are generated for conditional approval', () => {
    const cio = DEFAULT_COMMITTEE_MEMBERS.find(m => m.role === 'cio')!;
    const conditions = generateMemberConditions(cio, 135, 150);

    expect(conditions.length).toBeGreaterThan(0);
    expect(conditions.some(c => c.toLowerCase().includes('board') || c.toLowerCase().includes('pricing'))).toBe(true);
  });
});

// =============================================================================
// TEST: System Prompt and Response Parsing
// =============================================================================

describe('Committee System Prompt and Response Parsing', () => {
  test('30. buildCommitteeSystemPromptSection generates valid prompt section', () => {
    const config = createCommitteeConfig();
    const promptSection = buildCommitteeSystemPromptSection(config);

    expect(promptSection).toContain('committee_mode');
    expect(promptSection).toContain('COMMITTEE MEMBERS');
    expect(promptSection).toContain('Chief Investment Officer');
    expect(promptSection).toContain('Risk Manager');
    expect(promptSection).toContain('Compliance Officer');
    expect(promptSection).toContain('ESG Lead');
    expect(promptSection).toContain('committeePerspectives');
    expect(promptSection).toContain(config.votingMode);
  });

  test('31. parseCommitteeResponse handles valid AI response', () => {
    const config = createCommitteeConfig();
    const rawResponse = {
      response: 'The committee has reviewed the proposal.',
      committeePerspectives: [
        {
          role: 'cio',
          name: 'Alexandra Chen',
          stance: 'conditional_approve',
          response: 'CIO assessment positive.',
          concerns: ['Portfolio fit needs verification'],
          conditions: ['Board memo required'],
          keyMetrics: { portfolioFit: 'Strong' },
        },
        {
          role: 'risk_manager',
          name: 'David Okonkwo',
          stance: 'defer',
          response: 'Risk assessment in progress.',
          concerns: ['Volatility analysis pending'],
          conditions: [],
          keyMetrics: { riskGrade: 'B+' },
        },
        {
          role: 'compliance_officer',
          name: 'Sarah Martinez',
          stance: 'conditional_approve',
          response: 'Compliance review underway.',
          concerns: ['KYC pending'],
          conditions: ['AML verification required'],
          keyMetrics: { regulatoryStatus: 'Pending' },
        },
        {
          role: 'esg_lead',
          name: 'James Whitfield',
          stance: 'approve',
          response: 'ESG metrics verified.',
          concerns: [],
          conditions: [],
          keyMetrics: { esgScore: 85 },
        },
      ],
    };

    const result = parseCommitteeResponse(
      rawResponse, config, 145, 150, 4, 'negotiation'
    );

    expect(result.perspectives).toHaveLength(4);
    expect(result.perspectives[0].role).toBe('cio');
    expect(result.perspectives[0].stance).toBe('conditional_approve');
    expect(result.consolidatedResponse).toContain('committee');
  });

  test('32. parseCommitteeResponse falls back to defaults on empty response', () => {
    const config = createCommitteeConfig();
    const result = parseCommitteeResponse(
      {}, config, 145, 150, 4, 'negotiation'
    );

    expect(result.perspectives).toHaveLength(4);
    // Default perspectives should have roles matching committee members
    const roles = result.perspectives.map(p => p.role);
    expect(roles).toContain('cio');
    expect(roles).toContain('risk_manager');
    expect(roles).toContain('compliance_officer');
    expect(roles).toContain('esg_lead');
  });

  test('33. parseCommitteeResponse handles invalid stance gracefully', () => {
    const config = createCommitteeConfig();
    const rawResponse = {
      committeePerspectives: [
        {
          role: 'cio',
          name: 'Test',
          stance: 'invalid_stance', // Invalid
          response: 'Test',
          concerns: [],
          conditions: [],
          keyMetrics: {},
        },
      ],
    };

    const result = parseCommitteeResponse(
      rawResponse, config, 145, 150, 4, 'negotiation'
    );

    // Should fall back to 'defer' for invalid stance
    expect(result.perspectives[0].stance).toBe('defer');
  });

  test('34. parseCommitteeResponse generates decision when ready', () => {
    const config = createCommitteeConfig({ roundsCompleted: 2 });
    const rawResponse = {
      response: 'Committee decision.',
      committeePerspectives: [
        { role: 'cio', stance: 'approve', response: 'Approve', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'risk_manager', stance: 'approve', response: 'Approve', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'compliance_officer', stance: 'approve', response: 'Approve', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'esg_lead', stance: 'approve', response: 'Approve', concerns: [], conditions: [], keyMetrics: {} },
      ],
    };

    const result = parseCommitteeResponse(
      rawResponse, config, 145, 150, 5, 'negotiation'
    );

    // With roundsCompleted >= 1, round >= 3, and no deferrals, a decision should be made
    expect(result.decision).not.toBeNull();
    expect(result.decision?.outcome).toBe('approved');
  });

  test('35. parseCommitteeResponse does not generate decision in early rounds', () => {
    const config = createCommitteeConfig({ roundsCompleted: 0 });
    const rawResponse = {
      response: 'Early round.',
      committeePerspectives: [
        { role: 'cio', stance: 'approve', response: 'Test', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'risk_manager', stance: 'approve', response: 'Test', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'compliance_officer', stance: 'approve', response: 'Test', concerns: [], conditions: [], keyMetrics: {} },
        { role: 'esg_lead', stance: 'approve', response: 'Test', concerns: [], conditions: [], keyMetrics: {} },
      ],
    };

    const result = parseCommitteeResponse(
      rawResponse, config, 145, 150, 1, 'opening'
    );

    // Too early for a decision (round < 3 or roundsCompleted < 1)
    expect(result.decision).toBeNull();
  });
});
