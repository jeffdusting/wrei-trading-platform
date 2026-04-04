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

export const SCHEMA_VERSION = 2;

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
] as const;
