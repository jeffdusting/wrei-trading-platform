/**
 * Alert rule evaluation logic.
 *
 * Each rule type has a dedicated evaluator that checks current market/system
 * data against the rule's condition and threshold.
 */

import type { AlertRule, AlertEvent, AlertSeverity, AlertType } from './types';

// ---------------------------------------------------------------------------
// Market data snapshot (passed into evaluation)
// ---------------------------------------------------------------------------

export interface MarketSnapshot {
  prices: Record<string, number>;           // instrument → current price
  volumes: Record<string, number>;          // instrument → 24h volume
  feedStatuses: Record<string, string>;     // feed name → 'healthy'|'degraded'|'down'
  complianceDeadlines: Array<{
    clientId: string;
    scheme: string;
    deadline: string;
    daysRemaining: number;
    shortfall: number;
  }>;
  settlements: Array<{
    tradeId: string;
    status: string;
    updatedAt: string;
  }>;
}

// ---------------------------------------------------------------------------
// Evaluation result
// ---------------------------------------------------------------------------

interface EvalResult {
  triggered: boolean;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Per-type evaluators
// ---------------------------------------------------------------------------

function evaluatePriceCross(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const instrument = rule.instrument ?? '';
  const price = snapshot.prices[instrument];
  if (price === undefined) return { triggered: false, severity: 'info', title: '', message: '', data: {} };

  const crossed =
    rule.condition === 'above' ? price > rule.threshold :
    rule.condition === 'below' ? price < rule.threshold :
    rule.condition === 'equals' ? price === rule.threshold :
    false; // 'crosses' treated as above for simplicity

  return {
    triggered: crossed,
    severity: 'warning',
    title: `Price alert: ${instrument}`,
    message: `${instrument} price ${price.toFixed(2)} is ${rule.condition} threshold ${rule.threshold.toFixed(2)}`,
    data: { instrument, price, threshold: rule.threshold, condition: rule.condition },
  };
}

function evaluateVolumeThreshold(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const instrument = rule.instrument ?? '';
  const volume = snapshot.volumes[instrument] ?? 0;
  const triggered = volume > rule.threshold;

  return {
    triggered,
    severity: 'info',
    title: `Volume alert: ${instrument}`,
    message: `${instrument} 24h volume ${volume.toLocaleString()} exceeds threshold ${rule.threshold.toLocaleString()}`,
    data: { instrument, volume, threshold: rule.threshold },
  };
}

function evaluateComplianceDeadline(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const approaching = snapshot.complianceDeadlines.filter(d => d.daysRemaining <= rule.threshold);
  if (approaching.length === 0) return { triggered: false, severity: 'info', title: '', message: '', data: {} };

  const most = approaching.reduce((a, b) => a.daysRemaining < b.daysRemaining ? a : b);
  return {
    triggered: true,
    severity: most.daysRemaining <= 7 ? 'critical' : 'warning',
    title: 'Compliance deadline approaching',
    message: `${most.scheme} surrender due in ${most.daysRemaining} days for client ${most.clientId}`,
    data: { deadlines: approaching },
  };
}

function evaluateComplianceShortfall(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const shortfalls = snapshot.complianceDeadlines.filter(d => d.shortfall > rule.threshold);
  if (shortfalls.length === 0) return { triggered: false, severity: 'info', title: '', message: '', data: {} };

  return {
    triggered: true,
    severity: 'critical',
    title: 'Compliance shortfall detected',
    message: `${shortfalls.length} client(s) with shortfall exceeding ${rule.threshold} certificates`,
    data: { shortfalls },
  };
}

function evaluateSettlementStatus(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const stuck = snapshot.settlements.filter(s => s.status === 'failed');
  if (stuck.length === 0) return { triggered: false, severity: 'info', title: '', message: '', data: {} };

  return {
    triggered: true,
    severity: 'critical',
    title: 'Settlement failure detected',
    message: `${stuck.length} trade(s) with failed settlement`,
    data: { settlements: stuck },
  };
}

function evaluateFeedHealth(rule: AlertRule, snapshot: MarketSnapshot): EvalResult {
  const degraded = Object.entries(snapshot.feedStatuses).filter(([, s]) => s !== 'healthy');
  if (degraded.length === 0) return { triggered: false, severity: 'info', title: '', message: '', data: {} };

  const hasDown = degraded.some(([, s]) => s === 'down');
  return {
    triggered: true,
    severity: hasDown ? 'critical' : 'warning',
    title: 'Data feed issue',
    message: `${degraded.length} feed(s) degraded or down: ${degraded.map(([n]) => n).join(', ')}`,
    data: { feeds: Object.fromEntries(degraded) },
  };
}

// ---------------------------------------------------------------------------
// Evaluator dispatch
// ---------------------------------------------------------------------------

const EVALUATORS: Record<AlertType, (rule: AlertRule, snapshot: MarketSnapshot) => EvalResult> = {
  price_cross: evaluatePriceCross,
  volume_threshold: evaluateVolumeThreshold,
  compliance_deadline: evaluateComplianceDeadline,
  compliance_shortfall: evaluateComplianceShortfall,
  settlement_status: evaluateSettlementStatus,
  feed_health: evaluateFeedHealth,
};

/**
 * Evaluate a single rule against the current market snapshot.
 * Returns an AlertEvent (without id/created_at) if triggered, or null.
 */
export function evaluateRule(
  rule: AlertRule,
  snapshot: MarketSnapshot,
): Omit<AlertEvent, 'id' | 'created_at' | 'acknowledged_at' | 'acknowledged_by'> | null {
  const evaluator = EVALUATORS[rule.type];
  if (!evaluator) return null;

  const result = evaluator(rule, snapshot);
  if (!result.triggered) return null;

  return {
    rule_id: rule.id,
    type: rule.type,
    severity: result.severity,
    title: result.title,
    message: result.message,
    data: result.data,
  };
}
