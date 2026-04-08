-- =============================================================================
-- WREI Enterprise (Downer) — Database Schema
-- Separate Postgres instance from broker
-- Includes shared base tables + enterprise-specific tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SHARED BASE TABLES (same as broker — instruments, pricing, forecasts)
-- ---------------------------------------------------------------------------

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

CREATE TABLE IF NOT EXISTS price_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id     UUID         NOT NULL REFERENCES instruments(id),
  price             NUMERIC(18,4) NOT NULL,
  source            VARCHAR(64)  NOT NULL,
  recorded_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_price_history_instrument_time
  ON price_history (instrument_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  instrument_type VARCHAR(20) NOT NULL,
  horizon_weeks INTEGER NOT NULL,
  price_forecast DECIMAL(10,4) NOT NULL,
  price_lower_80 DECIMAL(10,4),
  price_upper_80 DECIMAL(10,4),
  price_lower_95 DECIMAL(10,4),
  price_upper_95 DECIMAL(10,4),
  volume_forecast DECIMAL(14,0),
  surplus_forecast DECIMAL(14,0),
  regime_probability JSONB,
  model_version VARCHAR(20),
  metadata JSONB
);

CREATE TABLE IF NOT EXISTS market_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  instrument_type VARCHAR(20) NOT NULL,
  cumulative_surplus DECIMAL(14,0),
  creation_velocity_4w DECIMAL(10,2),
  creation_velocity_12w DECIMAL(10,2),
  implied_annual_demand DECIMAL(14,0),
  surplus_runway_years DECIMAL(6,2),
  days_to_surrender INTEGER,
  price_to_penalty_ratio DECIMAL(6,4),
  penalty_rate DECIMAL(8,2),
  shadow_supply_estimate DECIMAL(14,0),
  forward_curve_slope DECIMAL(8,4),
  regime_indicator VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, instrument_type)
);

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

-- ---------------------------------------------------------------------------
-- ENTERPRISE-SPECIFIC TABLES
-- ---------------------------------------------------------------------------

-- Pre-validation diagnostic assessments
CREATE TABLE IF NOT EXISTS diagnostic_assessments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name      VARCHAR(256) NOT NULL,
  jurisdiction      VARCHAR(8)   NOT NULL CHECK (jurisdiction IN ('NSW', 'VIC')),
  scheme            VARCHAR(8)   NOT NULL CHECK (scheme IN ('ESS', 'VEU')),
  method            VARCHAR(32)  NOT NULL,
  activity_type     VARCHAR(64),
  eligible          BOOLEAN      NOT NULL DEFAULT false,
  disqualifiers     JSONB        NOT NULL DEFAULT '[]',
  yield_estimate    DECIMAL(14,2),
  yield_inputs      JSONB        NOT NULL DEFAULT '{}',
  current_value     DECIMAL(14,2),
  forecast_value    DECIMAL(14,2),
  status            VARCHAR(16)  NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'complete', 'archived')),
  created_by        VARCHAR(128),
  division          VARCHAR(128),
  client            VARCHAR(256),
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_diagnostic_jurisdiction
  ON diagnostic_assessments (jurisdiction, scheme, status);

-- Energy cost attribution outcomes
CREATE TABLE IF NOT EXISTS attribution_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     UUID         REFERENCES diagnostic_assessments(id),
  asset_owner       VARCHAR(256) NOT NULL,
  asset_owner_type  VARCHAR(32),
  facility_operator VARCHAR(256),
  operator_type     VARCHAR(32),
  tenant            VARCHAR(256),
  tenant_type       VARCHAR(32),
  bill_payer        VARCHAR(32)  CHECK (bill_payer IN ('owner', 'operator', 'tenant')),
  contract_holder   VARCHAR(32)  CHECK (contract_holder IN ('owner', 'operator', 'tenant')),
  cost_passthrough  VARCHAR(32)  CHECK (cost_passthrough IN ('direct', 'embedded', 'none')),
  equipment_control VARCHAR(32)  CHECK (equipment_control IN ('owner', 'operator', 'tenant')),
  eligible_saver    VARCHAR(256),
  split_incentive   BOOLEAN      NOT NULL DEFAULT false,
  confidence        VARCHAR(16)  CHECK (confidence IN ('high', 'medium', 'low')),
  required_actions  JSONB        NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_attribution_assessment
  ON attribution_records (assessment_id);

-- Project pipeline tracking
CREATE TABLE IF NOT EXISTS pipeline_projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     UUID         REFERENCES diagnostic_assessments(id),
  project_name      VARCHAR(256) NOT NULL,
  client            VARCHAR(256),
  division          VARCHAR(128),
  scheme            VARCHAR(8)   CHECK (scheme IN ('ESS', 'VEU')),
  method            VARCHAR(32),
  stage             VARCHAR(32)  NOT NULL DEFAULT 'diagnostic'
                      CHECK (stage IN ('diagnostic', 'validation', 'implementation', 'mv_audit', 'registration', 'sale')),
  estimated_yield   DECIMAL(14,2),
  estimated_value   DECIMAL(14,2),
  probability_weight DECIMAL(4,2) NOT NULL DEFAULT 0.10,
  notes             TEXT,
  archived          BOOLEAN      NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage
  ON pipeline_projects (stage, archived);
CREATE INDEX IF NOT EXISTS idx_pipeline_division
  ON pipeline_projects (division);

-- Entity hierarchy for compliance tracking
CREATE TABLE IF NOT EXISTS entity_hierarchy (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id         UUID         REFERENCES entity_hierarchy(id),
  entity_name       VARCHAR(256) NOT NULL,
  entity_type       VARCHAR(32)  NOT NULL CHECK (entity_type IN ('group', 'division', 'business_unit', 'client', 'facility')),
  division          VARCHAR(128),
  metadata          JSONB        NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entity_parent
  ON entity_hierarchy (parent_id);

-- Per-entity compliance obligations
CREATE TABLE IF NOT EXISTS entity_compliance (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id         UUID         NOT NULL REFERENCES entity_hierarchy(id),
  scheme            VARCHAR(8)   NOT NULL CHECK (scheme IN ('ESS', 'VEU')),
  compliance_year   INTEGER      NOT NULL,
  target            DECIMAL(14,2) NOT NULL DEFAULT 0,
  surrendered       DECIMAL(14,2) NOT NULL DEFAULT 0,
  shortfall         DECIMAL(14,2) GENERATED ALWAYS AS (GREATEST(target - surrendered, 0)) STORED,
  penalty_rate      DECIMAL(8,2),
  deadline          DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (entity_id, scheme, compliance_year)
);
CREATE INDEX IF NOT EXISTS idx_entity_compliance_deadline
  ON entity_compliance (deadline);
