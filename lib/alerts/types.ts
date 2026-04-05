/**
 * Alert system type definitions for the WREI Trading Platform.
 *
 * Supports price, volume, compliance, settlement, and feed health alerts.
 */

// ---------------------------------------------------------------------------
// Alert types
// ---------------------------------------------------------------------------

export type AlertType =
  | 'price_cross'
  | 'volume_threshold'
  | 'compliance_deadline'
  | 'compliance_shortfall'
  | 'settlement_status'
  | 'feed_health';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export type AlertCondition = 'above' | 'below' | 'equals' | 'crosses';

// ---------------------------------------------------------------------------
// Alert rule — user-configured trigger definition
// ---------------------------------------------------------------------------

export interface AlertRule {
  id: string;
  user_id: string;
  organisation_id: string;
  type: AlertType;
  name: string;
  instrument?: string;
  condition: AlertCondition;
  threshold: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertRuleInput {
  user_id: string;
  organisation_id: string;
  type: AlertType;
  name: string;
  instrument?: string;
  condition: AlertCondition;
  threshold: number;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Alert event — triggered instance of a rule
// ---------------------------------------------------------------------------

export interface AlertEvent {
  id: number;
  rule_id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  data: Record<string, unknown>;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}
