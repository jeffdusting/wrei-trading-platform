'use client';

/**
 * WREI Multi-Agent Committee Panel
 * Enhancement A3: Displays committee member perspectives, stances, and voting progress.
 *
 * Shows each committee member with their role, current stance, and reasoning.
 * Includes a voting progress indicator and committee decision display.
 */

import React from 'react';
import {
  CommitteeConfig,
  CommitteePerspective,
  CommitteeDecision,
  CommitteeStance,
  CommitteeMemberRole,
  CommitteeResponse,
} from '@/lib/committee-mode';

// =============================================================================
// TYPES
// =============================================================================

interface CommitteePanelProps {
  config: CommitteeConfig;
  latestResponse: CommitteeResponse | null;
  isDiscussionVisible: boolean;
  onToggleDiscussion: () => void;
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StanceBadge({ stance }: { stance: CommitteeStance }) {
  const stanceConfig: Record<CommitteeStance, { label: string; bgColour: string; textColour: string }> = {
    approve: { label: 'Approve', bgColour: 'bg-emerald-100', textColour: 'text-emerald-800' },
    conditional_approve: { label: 'Conditional', bgColour: 'bg-amber-100', textColour: 'text-amber-800' },
    defer: { label: 'Reviewing', bgColour: 'bg-slate-100', textColour: 'text-slate-600' },
    reject: { label: 'Reject', bgColour: 'bg-red-100', textColour: 'text-red-800' },
  };

  const config = stanceConfig[stance];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full bloomberg-section-label font-medium ${config.bgColour} ${config.textColour}`}
      data-testid={`stance-badge-${stance}`}
    >
      {config.label}
    </span>
  );
}

function RoleIcon({ role }: { role: CommitteeMemberRole }) {
  const icons: Record<CommitteeMemberRole, string> = {
    cio: 'CIO',
    risk_manager: 'RM',
    compliance_officer: 'CO',
    esg_lead: 'ESG',
  };

  const colours: Record<CommitteeMemberRole, string> = {
    cio: 'bg-blue-500',
    risk_manager: 'bg-orange-500',
    compliance_officer: 'bg-purple-500',
    esg_lead: 'bg-green-500',
  };

  return (
    <div
      className={`w-8 h-8 rounded-full ${colours[role]} flex items-center justify-center text-white bloomberg-section-label`}
      data-testid={`role-icon-${role}`}
    >
      {icons[role]}
    </div>
  );
}

// =============================================================================
// MEMBER CARD
// =============================================================================

function CommitteeMemberCard({
  perspective,
  showDiscussion,
}: {
  perspective: CommitteePerspective;
  showDiscussion: boolean;
}) {
  return (
    <div
      className="border border-slate-200 rounded-lg p-3 bg-white"
      data-testid={`committee-member-${perspective.role}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <RoleIcon role={perspective.role} />
          <div>
            <p className="bloomberg-small-text  text-slate-800">{perspective.name}</p>
            <p className="bloomberg-section-label text-slate-500">{perspective.title}</p>
          </div>
        </div>
        <StanceBadge stance={perspective.stance} />
      </div>

      {showDiscussion && (
        <div className="mt-2 space-y-2">
          <p className="bloomberg-small-text text-slate-700" data-testid={`member-response-${perspective.role}`}>
            {perspective.response}
          </p>

          {perspective.concerns.length > 0 && (
            <div>
              <p className="bloomberg-section-label font-medium text-slate-500 mb-1">Concerns:</p>
              <ul className="bloomberg-section-label text-slate-600 list-disc pl-4 space-y-0.5">
                {perspective.concerns.map((concern, i) => (
                  <li key={i}>{concern}</li>
                ))}
              </ul>
            </div>
          )}

          {perspective.conditions.length > 0 && (
            <div>
              <p className="bloomberg-section-label font-medium text-amber-600 mb-1">Conditions:</p>
              <ul className="bloomberg-section-label text-amber-700 list-disc pl-4 space-y-0.5">
                {perspective.conditions.map((condition, i) => (
                  <li key={i}>{condition}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(perspective.keyMetrics).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(perspective.keyMetrics).map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 bloomberg-section-label text-slate-600"
                >
                  <span className="font-medium mr-1">{formatMetricKey(key)}:</span>
                  {String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatMetricKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

// =============================================================================
// VOTING PROGRESS
// =============================================================================

function VotingProgress({
  perspectives,
  votingMode,
}: {
  perspectives: CommitteePerspective[];
  votingMode: string;
}) {
  const total = perspectives.length;
  const approvals = perspectives.filter(p => p.stance === 'approve').length;
  const conditionals = perspectives.filter(p => p.stance === 'conditional_approve').length;
  const rejections = perspectives.filter(p => p.stance === 'reject').length;
  const deferrals = perspectives.filter(p => p.stance === 'defer').length;

  const approvalPercentage = total > 0 ? ((approvals + conditionals) / total) * 100 : 0;

  return (
    <div className="mb-3" data-testid="voting-progress">
      <div className="flex items-center justify-between mb-1">
        <span className="bloomberg-section-label font-medium text-slate-500">
          Committee Progress ({votingMode} voting)
        </span>
        <span className="bloomberg-section-label text-slate-400">
          {approvals + conditionals}/{total} supporting
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full flex">
          {approvals > 0 && (
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(approvals / total) * 100}%` }}
              data-testid="progress-approve"
            />
          )}
          {conditionals > 0 && (
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(conditionals / total) * 100}%` }}
              data-testid="progress-conditional"
            />
          )}
          {rejections > 0 && (
            <div
              className="bg-red-400 h-full"
              style={{ width: `${(rejections / total) * 100}%` }}
              data-testid="progress-reject"
            />
          )}
          {deferrals > 0 && (
            <div
              className="bg-slate-300 h-full"
              style={{ width: `${(deferrals / total) * 100}%` }}
              data-testid="progress-defer"
            />
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1">
        <div className="flex gap-3 bloomberg-section-label text-slate-500">
          {approvals > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />{approvals} Approved</span>}
          {conditionals > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />{conditionals} Conditional</span>}
          {deferrals > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />{deferrals} Reviewing</span>}
          {rejections > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" />{rejections} Rejected</span>}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DECISION DISPLAY
// =============================================================================

function DecisionDisplay({ decision }: { decision: CommitteeDecision }) {
  const outcomeConfig: Record<CommitteeDecision['outcome'], { label: string; colour: string; border: string }> = {
    approved: { label: 'Investment Approved', colour: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200' },
    conditionally_approved: { label: 'Conditionally Approved', colour: 'bg-amber-50 text-amber-800', border: 'border-amber-200' },
    deferred: { label: 'Decision Deferred', colour: 'bg-slate-50 text-slate-700', border: 'border-slate-200' },
    rejected: { label: 'Investment Rejected', colour: 'bg-red-50 text-red-800', border: 'border-red-200' },
  };

  const config = outcomeConfig[decision.outcome];

  return (
    <div
      className={`rounded-lg p-3 ${config.colour} border ${config.border}`}
      data-testid="committee-decision"
    >
      <h4 className=" bloomberg-small-text mb-1" data-testid="decision-outcome">
        {config.label}
      </h4>
      <p className="bloomberg-section-label mb-2">{decision.summary}</p>

      {decision.conditions.length > 0 && (
        <div className="mb-2">
          <p className="bloomberg-section-label font-medium mb-1">Outstanding Conditions:</p>
          <ul className="bloomberg-section-label list-disc pl-4 space-y-0.5">
            {decision.conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      {decision.nextSteps.length > 0 && (
        <div>
          <p className="bloomberg-section-label font-medium mb-1">Next Steps:</p>
          <ul className="bloomberg-section-label list-disc pl-4 space-y-0.5">
            {decision.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CommitteePanel({
  config,
  latestResponse,
  isDiscussionVisible,
  onToggleDiscussion,
}: CommitteePanelProps) {
  if (!config.enabled) return null;

  const perspectives = latestResponse?.perspectives || [];
  const decision = latestResponse?.decision || null;

  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
      data-testid="committee-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="bloomberg-small-text text-slate-800">Investment Committee</h3>
          <p className="bloomberg-section-label text-slate-500">
            {config.votingMode.charAt(0).toUpperCase() + config.votingMode.slice(1)} voting
            {config.roundsCompleted > 0 ? ` | Round ${config.roundsCompleted}` : ''}
          </p>
        </div>
        <button
          onClick={onToggleDiscussion}
          className="bloomberg-section-label text-sky-600 hover:text-sky-700 font-medium px-2 py-1 rounded hover:bg-sky-50 transition-colors"
          data-testid="toggle-discussion"
        >
          {isDiscussionVisible ? 'Hide Discussion' : 'Show Discussion'}
        </button>
      </div>

      {/* Voting Progress */}
      {perspectives.length > 0 && (
        <VotingProgress
          perspectives={perspectives}
          votingMode={config.votingMode}
        />
      )}

      {/* Committee Members */}
      <div className="space-y-2" data-testid="committee-members">
        {perspectives.length > 0 ? (
          perspectives.map(perspective => (
            <CommitteeMemberCard
              key={perspective.role}
              perspective={perspective}
              showDiscussion={isDiscussionVisible}
            />
          ))
        ) : (
          config.members.map(member => (
            <div
              key={member.role}
              className="border border-slate-200 rounded-lg p-3 bg-white"
              data-testid={`committee-member-${member.role}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RoleIcon role={member.role} />
                  <div>
                    <p className="bloomberg-small-text  text-slate-800">{member.name}</p>
                    <p className="bloomberg-section-label text-slate-500">{member.title}</p>
                  </div>
                </div>
                <StanceBadge stance={member.stance} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Committee Decision */}
      {decision && (
        <div className="mt-3">
          <DecisionDisplay decision={decision} />
        </div>
      )}
    </div>
  );
}
