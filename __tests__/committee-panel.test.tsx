/**
 * WREI Committee Panel Component Tests
 * Enhancement A3: Tests for the CommitteePanel React component.
 *
 * Tests: 12 tests across 3 describe blocks
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommitteePanel from '@/components/negotiation/CommitteePanel';
import {
  CommitteeConfig,
  CommitteeResponse,
  CommitteePerspective,
  CommitteeDecision,
  createCommitteeConfig,
} from '@/lib/committee-mode';

// =============================================================================
// TEST DATA
// =============================================================================

const createMockPerspective = (
  role: 'cio' | 'risk_manager' | 'compliance_officer' | 'esg_lead',
  stance: 'approve' | 'conditional_approve' | 'defer' | 'reject' = 'defer'
): CommitteePerspective => {
  const names: Record<string, string> = {
    cio: 'Alexandra Chen',
    risk_manager: 'David Okonkwo',
    compliance_officer: 'Sarah Martinez',
    esg_lead: 'James Whitfield',
  };
  const titles: Record<string, string> = {
    cio: 'Chief Investment Officer',
    risk_manager: 'Risk Manager',
    compliance_officer: 'Compliance Officer',
    esg_lead: 'ESG Lead',
  };

  return {
    role,
    name: names[role],
    title: titles[role],
    response: `${titles[role]} assessment for this round.`,
    stance,
    concerns: stance === 'reject' ? ['Significant concerns identified'] : [],
    conditions: stance === 'conditional_approve' ? ['Additional documentation required'] : [],
    keyMetrics: { testMetric: 'value' },
  };
};

const createMockCommitteeResponse = (
  overrides: Partial<CommitteeResponse> = {}
): CommitteeResponse => ({
  perspectives: [
    createMockPerspective('cio', 'approve'),
    createMockPerspective('risk_manager', 'conditional_approve'),
    createMockPerspective('compliance_officer', 'defer'),
    createMockPerspective('esg_lead', 'approve'),
  ],
  consolidatedResponse: 'The committee is reviewing the proposal with mixed stances.',
  decision: null,
  currentSpeakerIndex: 0,
  roundsCompleted: 1,
  ...overrides,
});

const createMockDecision = (
  outcome: 'approved' | 'conditionally_approved' | 'deferred' | 'rejected' = 'approved'
): CommitteeDecision => ({
  outcome,
  votingMode: 'majority',
  votes: [
    { memberRole: 'cio', stance: 'approve', reasoning: 'Test', concerns: [], conditions: [], timestamp: new Date().toISOString() },
    { memberRole: 'risk_manager', stance: 'approve', reasoning: 'Test', concerns: [], conditions: [], timestamp: new Date().toISOString() },
    { memberRole: 'compliance_officer', stance: 'approve', reasoning: 'Test', concerns: [], conditions: [], timestamp: new Date().toISOString() },
    { memberRole: 'esg_lead', stance: 'approve', reasoning: 'Test', concerns: [], conditions: [], timestamp: new Date().toISOString() },
  ],
  approvalCount: 4,
  rejectionCount: 0,
  deferralCount: 0,
  conditionalCount: 0,
  totalWeight: 8,
  approvalWeight: 8,
  summary: 'Committee unanimously approves the investment.',
  conditions: [],
  nextSteps: ['Proceed to settlement terms negotiation'],
});

// =============================================================================
// TEST: Rendering
// =============================================================================

describe('CommitteePanel Rendering', () => {
  test('1. Renders nothing when committee is disabled', () => {
    const config = createCommitteeConfig({ enabled: false });
    const { container } = render(
      <CommitteePanel
        config={config}
        latestResponse={null}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('2. Renders panel when committee is enabled', () => {
    const config = createCommitteeConfig();
    render(
      <CommitteePanel
        config={config}
        latestResponse={null}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByTestId('committee-panel')).toBeTruthy();
    expect(screen.getByText('Investment Committee')).toBeTruthy();
  });

  test('3. Renders all committee members', () => {
    const config = createCommitteeConfig();
    render(
      <CommitteePanel
        config={config}
        latestResponse={null}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByTestId('committee-member-cio')).toBeTruthy();
    expect(screen.getByTestId('committee-member-risk_manager')).toBeTruthy();
    expect(screen.getByTestId('committee-member-compliance_officer')).toBeTruthy();
    expect(screen.getByTestId('committee-member-esg_lead')).toBeTruthy();
  });

  test('4. Renders member names and titles', () => {
    const config = createCommitteeConfig();
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByText('Alexandra Chen')).toBeTruthy();
    expect(screen.getByText('David Okonkwo')).toBeTruthy();
    expect(screen.getByText('Sarah Martinez')).toBeTruthy();
    expect(screen.getByText('James Whitfield')).toBeTruthy();
  });
});

// =============================================================================
// TEST: Voting Progress
// =============================================================================

describe('CommitteePanel Voting Progress', () => {
  test('5. Displays voting progress indicator', () => {
    const config = createCommitteeConfig();
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByTestId('voting-progress')).toBeTruthy();
  });

  test('6. Shows correct support count', () => {
    const config = createCommitteeConfig();
    // 2 approve + 1 conditional + 1 defer = 3 supporting out of 4
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByText('3/4 supporting')).toBeTruthy();
  });

  test('7. Displays stance badges correctly', () => {
    const config = createCommitteeConfig();
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    // Should show Approve, Conditional, and Reviewing badges
    expect(screen.getAllByTestId(/stance-badge-/).length).toBeGreaterThanOrEqual(3);
  });
});

// =============================================================================
// TEST: Discussion Toggle and Decision Display
// =============================================================================

describe('CommitteePanel Discussion and Decisions', () => {
  test('8. Toggle button calls onToggleDiscussion', () => {
    const mockToggle = jest.fn();
    const config = createCommitteeConfig();
    render(
      <CommitteePanel
        config={config}
        latestResponse={null}
        isDiscussionVisible={false}
        onToggleDiscussion={mockToggle}
      />
    );

    const toggleButton = screen.getByTestId('toggle-discussion');
    fireEvent.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  test('9. Shows member responses when discussion is visible', () => {
    const config = createCommitteeConfig();
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={true}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByTestId('member-response-cio')).toBeTruthy();
    expect(screen.getByTestId('member-response-risk_manager')).toBeTruthy();
  });

  test('10. Hides member responses when discussion is not visible', () => {
    const config = createCommitteeConfig();
    const response = createMockCommitteeResponse();
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.queryByTestId('member-response-cio')).toBeNull();
    expect(screen.queryByTestId('member-response-risk_manager')).toBeNull();
  });

  test('11. Displays committee decision when present', () => {
    const config = createCommitteeConfig();
    const decision = createMockDecision('approved');
    const response = createMockCommitteeResponse({ decision });
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByTestId('committee-decision')).toBeTruthy();
    expect(screen.getByTestId('decision-outcome')).toBeTruthy();
    expect(screen.getByText('Investment Approved')).toBeTruthy();
  });

  test('12. Displays rejected decision with appropriate styling', () => {
    const config = createCommitteeConfig();
    const decision = createMockDecision('rejected');
    decision.summary = 'Committee rejects the investment.';
    decision.nextSteps = ['Consider alternative deal structure'];
    const response = createMockCommitteeResponse({ decision });
    render(
      <CommitteePanel
        config={config}
        latestResponse={response}
        isDiscussionVisible={false}
        onToggleDiscussion={() => {}}
      />
    );

    expect(screen.getByText('Investment Rejected')).toBeTruthy();
    expect(screen.getByText('Consider alternative deal structure')).toBeTruthy();
  });
});
