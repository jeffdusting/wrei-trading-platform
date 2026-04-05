/**
 * SQL schema definitions for the WREI Trading Platform.
 *
 * Tables:
 *   instruments      — tradeable carbon credit / Asset Co instruments
 *   trades           — executed trade records
 *   negotiations     — AI negotiation session state
 *   settlements      — settlement lifecycle tracking
 *   pricing_config   — per-instrument pricing parameters
 *   price_history    — time-series price snapshots
 *   audit_log        — append-only compliance audit trail
 *   feed_status      — external data-feed health
 */

export const SCHEMA_VERSION = 6;

export const CREATE_ORGANISATIONS = `
CREATE TABLE IF NOT EXISTS organisations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              VARCHAR(255)  NOT NULL,
  type              VARCHAR(50)   NOT NULL DEFAULT 'broker'
                      CHECK (type IN ('broker','acp','obligated_entity','institutional','platform')),
  white_label_config JSONB,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_USERS = `
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255)  UNIQUE NOT NULL,
  password_hash     VARCHAR(255)  NOT NULL,
  name              VARCHAR(255)  NOT NULL,
  role              VARCHAR(50)   NOT NULL DEFAULT 'trader'
                      CHECK (role IN ('admin','broker','trader','compliance','readonly')),
  organisation_id   UUID          REFERENCES organisations(id),
  organisation_name VARCHAR(255),
  api_key           VARCHAR(64)   UNIQUE,
  api_key_created_at TIMESTAMPTZ,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  last_login        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_SESSIONS = `
CREATE TABLE IF NOT EXISTS sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id),
  token             VARCHAR(255)  UNIQUE NOT NULL,
  expires_at        TIMESTAMPTZ   NOT NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_INSTRUMENTS = `
CREATE TABLE IF NOT EXISTS instruments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol          VARCHAR(32)  NOT NULL UNIQUE,
  name            VARCHAR(128) NOT NULL,
  token_type      VARCHAR(32)  NOT NULL CHECK (token_type IN ('carbon_credits','asset_co','dual_portfolio')),
  credit_type     VARCHAR(16)  CHECK (credit_type IN ('carbon','esc','both')),
  verification    VARCHAR(64),
  unit            VARCHAR(16)  NOT NULL DEFAULT 'tCO2e',
  status          VARCHAR(16)  NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','retired')),
  metadata        JSONB        NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
`;

export const CREATE_TRADES = `
CREATE TABLE IF NOT EXISTS trades (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id     UUID         NOT NULL REFERENCES instruments(id),
  negotiation_id    UUID         REFERENCES negotiations(id),
  direction         VARCHAR(8)   NOT NULL CHECK (direction IN ('buy','sell')),
  quantity          NUMERIC(18,4) NOT NULL,
  price_per_unit    NUMERIC(18,4) NOT NULL,
  total_value       NUMERIC(18,4) NOT NULL,
  currency          VARCHAR(8)   NOT NULL DEFAULT 'USD',
  buyer_persona     VARCHAR(64),
  status            VARCHAR(16)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','settled','cancelled')),
  executed_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  settled_at        TIMESTAMPTZ,
  metadata          JSONB        NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
`;

export const CREATE_NEGOTIATIONS = `
CREATE TABLE IF NOT EXISTS negotiations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id     UUID         REFERENCES instruments(id),
  persona_type      VARCHAR(64)  NOT NULL,
  credit_type       VARCHAR(16)  NOT NULL DEFAULT 'carbon',
  token_type        VARCHAR(32)  NOT NULL DEFAULT 'carbon_credits',
  phase             VARCHAR(16)  NOT NULL DEFAULT 'opening'
                      CHECK (phase IN ('opening','elicitation','negotiation','closure','escalation')),
  round             INT          NOT NULL DEFAULT 1,
  anchor_price      NUMERIC(18,4) NOT NULL,
  current_offer     NUMERIC(18,4) NOT NULL,
  price_floor       NUMERIC(18,4) NOT NULL,
  total_concession  NUMERIC(8,4) NOT NULL DEFAULT 0,
  outcome           VARCHAR(16)  CHECK (outcome IN ('agreed','deferred','escalated')),
  buyer_profile     JSONB        NOT NULL DEFAULT '{}',
  messages          JSONB        NOT NULL DEFAULT '[]',
  state_snapshot    JSONB        NOT NULL DEFAULT '{}',
  started_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
`;

export const CREATE_SETTLEMENTS = `
CREATE TABLE IF NOT EXISTS settlements (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id          UUID         NOT NULL REFERENCES trades(id),
  method            VARCHAR(32)  NOT NULL DEFAULT 'zconnect'
                      CHECK (method IN ('zconnect','manual','registry')),
  status            VARCHAR(16)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','processing','completed','failed')),
  blockchain_hash   VARCHAR(128),
  settled_at        TIMESTAMPTZ,
  metadata          JSONB        NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
`;

export const CREATE_PRICING_CONFIG = `
CREATE TABLE IF NOT EXISTS pricing_config (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id     UUID         NOT NULL REFERENCES instruments(id),
  anchor_price      NUMERIC(18,4) NOT NULL,
  price_floor       NUMERIC(18,4) NOT NULL,
  premium_multiplier NUMERIC(8,4) NOT NULL DEFAULT 1.5,
  max_concession_per_round NUMERIC(8,4) NOT NULL DEFAULT 0.05,
  max_total_concession     NUMERIC(8,4) NOT NULL DEFAULT 0.20,
  min_rounds_before_concession INT NOT NULL DEFAULT 3,
  effective_from    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  effective_to      TIMESTAMPTZ,
  metadata          JSONB        NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (instrument_id, effective_from)
);
`;

export const CREATE_PRICE_HISTORY = `
CREATE TABLE IF NOT EXISTS price_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id     UUID         NOT NULL REFERENCES instruments(id),
  price             NUMERIC(18,4) NOT NULL,
  source            VARCHAR(64)  NOT NULL,
  recorded_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_history_instrument_time
  ON price_history (instrument_id, recorded_at DESC);
`;

export const CREATE_AUDIT_LOG = `
CREATE TABLE IF NOT EXISTS audit_log (
  id                BIGSERIAL PRIMARY KEY,
  entity_type       VARCHAR(32)  NOT NULL,
  entity_id         UUID         NOT NULL,
  action            VARCHAR(32)  NOT NULL,
  actor             VARCHAR(128) NOT NULL DEFAULT 'system',
  details           JSONB        NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON audit_log (entity_type, entity_id, created_at DESC);
`;

export const CREATE_FEED_STATUS = `
CREATE TABLE IF NOT EXISTS feed_status (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_name         VARCHAR(64)  NOT NULL UNIQUE,
  status            VARCHAR(16)  NOT NULL DEFAULT 'unknown'
                      CHECK (status IN ('healthy','degraded','down','unknown')),
  last_success_at   TIMESTAMPTZ,
  last_failure_at   TIMESTAMPTZ,
  error_message     TEXT,
  metadata          JSONB        NOT NULL DEFAULT '{}',
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
`;

export const CREATE_CLIENTS = `
CREATE TABLE IF NOT EXISTS clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID          NOT NULL REFERENCES organisations(id),
  name              VARCHAR(255)  NOT NULL,
  entity_type       VARCHAR(50)   NOT NULL
                      CHECK (entity_type IN ('acp','obligated_entity','government','corporate','institutional')),
  contact_email     VARCHAR(255),
  contact_name      VARCHAR(255),
  abn               VARCHAR(20),
  ess_participant_id VARCHAR(100),
  annual_esc_target  INTEGER,
  annual_veec_target INTEGER,
  safeguard_facility_id VARCHAR(100),
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  metadata          JSONB         NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_CLIENT_HOLDINGS = `
CREATE TABLE IF NOT EXISTS client_holdings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID          NOT NULL REFERENCES clients(id),
  instrument_type   VARCHAR(20)   NOT NULL,
  quantity          INTEGER       NOT NULL DEFAULT 0,
  average_cost      DECIMAL(12,4),
  total_cost        DECIMAL(14,2),
  vintage           VARCHAR(10),
  registry_reference VARCHAR(255),
  status            VARCHAR(20)   NOT NULL DEFAULT 'held'
                      CHECK (status IN ('held','pending_transfer','surrendered','retired')),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_SURRENDER_TRACKING = `
CREATE TABLE IF NOT EXISTS surrender_tracking (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID          NOT NULL REFERENCES clients(id),
  compliance_year     VARCHAR(10)   NOT NULL,
  scheme              VARCHAR(20)   NOT NULL,
  target_quantity     INTEGER       NOT NULL,
  surrendered_quantity INTEGER      NOT NULL DEFAULT 0,
  shortfall           INTEGER       GENERATED ALWAYS AS (target_quantity - surrendered_quantity) STORED,
  penalty_rate        DECIMAL(8,2),
  penalty_exposure    DECIMAL(14,2) GENERATED ALWAYS AS (
    GREATEST(0, target_quantity - surrendered_quantity) * penalty_rate
  ) STORED,
  surrender_deadline  DATE,
  status              VARCHAR(20)   NOT NULL DEFAULT 'in_progress'
                        CHECK (status IN ('in_progress','compliant','shortfall','penalty_paid')),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now()
);
`;

export const CREATE_CORRESPONDENCE = `
CREATE TABLE IF NOT EXISTS correspondence (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id     UUID          NOT NULL REFERENCES organisations(id),
  type                VARCHAR(20)   NOT NULL DEFAULT 'general'
                        CHECK (type IN ('rfq','quote','confirmation','follow_up','general')),
  counterparty_name   VARCHAR(255)  NOT NULL,
  counterparty_email  VARCHAR(255)  NOT NULL,
  subject             VARCHAR(500)  NOT NULL,
  body                TEXT          NOT NULL,
  status              VARCHAR(20)   NOT NULL DEFAULT 'drafted'
                        CHECK (status IN ('drafted','approved','sent','rejected','replied')),
  thread_id           UUID,
  related_client_id   UUID          REFERENCES clients(id),
  related_instrument  VARCHAR(20),
  ai_model            VARCHAR(100),
  ai_tokens_used      INTEGER,
  rejection_reason    TEXT,
  created_by          UUID          NOT NULL REFERENCES users(id),
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  sent_at             TIMESTAMPTZ
);
`;

export const CREATE_WEBHOOK_REGISTRATIONS = `
CREATE TABLE IF NOT EXISTS webhook_registrations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id   UUID          NOT NULL REFERENCES organisations(id),
  url               VARCHAR(2048) NOT NULL,
  events            JSONB         NOT NULL DEFAULT '[]',
  secret            VARCHAR(128)  NOT NULL,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_registrations_org
  ON webhook_registrations (organisation_id, is_active);
`;

export const CREATE_ALERT_RULES = `
CREATE TABLE IF NOT EXISTS alert_rules (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL REFERENCES users(id),
  organisation_id   UUID          NOT NULL REFERENCES organisations(id),
  type              VARCHAR(32)   NOT NULL
                      CHECK (type IN ('price_cross','volume_threshold','compliance_deadline','compliance_shortfall','settlement_status','feed_health')),
  name              VARCHAR(255)  NOT NULL,
  instrument        VARCHAR(32),
  condition         VARCHAR(16)   NOT NULL
                      CHECK (condition IN ('above','below','equals','crosses')),
  threshold         NUMERIC(18,4) NOT NULL,
  is_active         BOOLEAN       NOT NULL DEFAULT true,
  metadata          JSONB         NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alert_rules_org_active
  ON alert_rules (organisation_id, is_active) WHERE is_active = true;
`;

export const CREATE_ALERT_EVENTS = `
CREATE TABLE IF NOT EXISTS alert_events (
  id                BIGSERIAL PRIMARY KEY,
  rule_id           UUID          NOT NULL REFERENCES alert_rules(id),
  type              VARCHAR(32)   NOT NULL,
  severity          VARCHAR(16)   NOT NULL
                      CHECK (severity IN ('info','warning','critical')),
  title             VARCHAR(255)  NOT NULL,
  message           TEXT,
  data              JSONB         NOT NULL DEFAULT '{}',
  acknowledged_at   TIMESTAMPTZ,
  acknowledged_by   UUID          REFERENCES users(id),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alert_events_rule_time
  ON alert_events (rule_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_events_unacked
  ON alert_events (acknowledged_at, created_at DESC) WHERE acknowledged_at IS NULL;
`;

/** Ordered list of DDL statements — must run in this order due to FK deps. */
export const ALL_TABLES = [
  CREATE_ORGANISATIONS,  // before users (users references organisations)
  CREATE_USERS,          // before sessions (sessions references users)
  CREATE_SESSIONS,
  CREATE_INSTRUMENTS,
  CREATE_NEGOTIATIONS,   // before trades (trades references negotiations)
  CREATE_TRADES,
  CREATE_SETTLEMENTS,
  CREATE_PRICING_CONFIG,
  CREATE_PRICE_HISTORY,
  CREATE_AUDIT_LOG,
  CREATE_FEED_STATUS,
  CREATE_CLIENTS,            // after organisations (clients references organisations)
  CREATE_CLIENT_HOLDINGS,    // after clients (client_holdings references clients)
  CREATE_SURRENDER_TRACKING, // after clients (surrender_tracking references clients)
  CREATE_CORRESPONDENCE,     // after clients, users (FK deps)
  CREATE_WEBHOOK_REGISTRATIONS, // after organisations
  CREATE_ALERT_RULES,          // after users, organisations
  CREATE_ALERT_EVENTS,         // after alert_rules, users
] as const;
