// =============================================================================
// WREI Enterprise — Database Query Functions
//
// Enterprise-specific tables: diagnostic_assessments, attribution_records,
// pipeline_projects, entity_hierarchy, entity_compliance
// Shared base tables are accessed via @shared/lib/db query functions.
// =============================================================================

import { sql } from '@shared/lib/db/connection'

// ---------------------------------------------------------------------------
// Diagnostic Assessments
// ---------------------------------------------------------------------------

export interface DiagnosticAssessment {
  id: string
  project_name: string
  jurisdiction: 'NSW' | 'VIC'
  scheme: 'ESS' | 'VEU'
  method: string
  activity_type: string | null
  eligible: boolean
  disqualifiers: string[]
  yield_estimate: number | null
  yield_inputs: Record<string, unknown>
  current_value: number | null
  forecast_value: number | null
  status: 'draft' | 'complete' | 'archived'
  created_by: string | null
  division: string | null
  client: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateDiagnosticInput {
  project_name: string
  jurisdiction: 'NSW' | 'VIC'
  scheme: 'ESS' | 'VEU'
  method: string
  activity_type?: string
  eligible: boolean
  disqualifiers?: string[]
  yield_estimate?: number
  yield_inputs?: Record<string, unknown>
  current_value?: number
  forecast_value?: number
  status?: 'draft' | 'complete' | 'archived'
  created_by?: string
  division?: string
  client?: string
  notes?: string
}

export async function createDiagnosticAssessment(input: CreateDiagnosticInput) {
  const result = await sql`
    INSERT INTO diagnostic_assessments (
      project_name, jurisdiction, scheme, method, activity_type,
      eligible, disqualifiers, yield_estimate, yield_inputs,
      current_value, forecast_value, status, created_by, division, client, notes
    ) VALUES (
      ${input.project_name}, ${input.jurisdiction}, ${input.scheme},
      ${input.method}, ${input.activity_type ?? null},
      ${input.eligible}, ${JSON.stringify(input.disqualifiers ?? [])},
      ${input.yield_estimate ?? null}, ${JSON.stringify(input.yield_inputs ?? {})},
      ${input.current_value ?? null}, ${input.forecast_value ?? null},
      ${input.status ?? 'draft'}, ${input.created_by ?? null},
      ${input.division ?? null}, ${input.client ?? null}, ${input.notes ?? null}
    )
    RETURNING *
  `
  return result.rows[0] as DiagnosticAssessment
}

export async function getDiagnosticAssessment(id: string) {
  const result = await sql`
    SELECT * FROM diagnostic_assessments WHERE id = ${id}
  `
  return result.rows[0] as DiagnosticAssessment | undefined
}

export async function listDiagnosticAssessments(filters?: {
  jurisdiction?: string
  scheme?: string
  status?: string
  division?: string
}) {
  if (!filters || Object.keys(filters).length === 0) {
    const result = await sql`
      SELECT * FROM diagnostic_assessments ORDER BY created_at DESC LIMIT 100
    `
    return result.rows as DiagnosticAssessment[]
  }

  const result = await sql`
    SELECT * FROM diagnostic_assessments
    WHERE
      (${filters.jurisdiction ?? null}::text IS NULL OR jurisdiction = ${filters.jurisdiction ?? ''})
      AND (${filters.scheme ?? null}::text IS NULL OR scheme = ${filters.scheme ?? ''})
      AND (${filters.status ?? null}::text IS NULL OR status = ${filters.status ?? ''})
      AND (${filters.division ?? null}::text IS NULL OR division = ${filters.division ?? ''})
    ORDER BY created_at DESC LIMIT 100
  `
  return result.rows as DiagnosticAssessment[]
}

// ---------------------------------------------------------------------------
// Attribution Records
// ---------------------------------------------------------------------------

export interface AttributionRecord {
  id: string
  assessment_id: string | null
  asset_owner: string
  asset_owner_type: string | null
  facility_operator: string | null
  operator_type: string | null
  tenant: string | null
  tenant_type: string | null
  bill_payer: 'owner' | 'operator' | 'tenant' | null
  contract_holder: 'owner' | 'operator' | 'tenant' | null
  cost_passthrough: 'direct' | 'embedded' | 'none' | null
  equipment_control: 'owner' | 'operator' | 'tenant' | null
  eligible_saver: string | null
  split_incentive: boolean
  confidence: 'high' | 'medium' | 'low' | null
  required_actions: string[]
  created_at: string
  updated_at: string
}

export interface CreateAttributionInput {
  assessment_id?: string
  asset_owner: string
  asset_owner_type?: string
  facility_operator?: string
  operator_type?: string
  tenant?: string
  tenant_type?: string
  bill_payer?: 'owner' | 'operator' | 'tenant'
  contract_holder?: 'owner' | 'operator' | 'tenant'
  cost_passthrough?: 'direct' | 'embedded' | 'none'
  equipment_control?: 'owner' | 'operator' | 'tenant'
  eligible_saver?: string
  split_incentive?: boolean
  confidence?: 'high' | 'medium' | 'low'
  required_actions?: string[]
}

export async function createAttributionRecord(input: CreateAttributionInput) {
  const result = await sql`
    INSERT INTO attribution_records (
      assessment_id, asset_owner, asset_owner_type,
      facility_operator, operator_type, tenant, tenant_type,
      bill_payer, contract_holder, cost_passthrough, equipment_control,
      eligible_saver, split_incentive, confidence, required_actions
    ) VALUES (
      ${input.assessment_id ?? null}, ${input.asset_owner}, ${input.asset_owner_type ?? null},
      ${input.facility_operator ?? null}, ${input.operator_type ?? null},
      ${input.tenant ?? null}, ${input.tenant_type ?? null},
      ${input.bill_payer ?? null}, ${input.contract_holder ?? null},
      ${input.cost_passthrough ?? null}, ${input.equipment_control ?? null},
      ${input.eligible_saver ?? null}, ${input.split_incentive ?? false},
      ${input.confidence ?? null}, ${JSON.stringify(input.required_actions ?? [])}
    )
    RETURNING *
  `
  return result.rows[0] as AttributionRecord
}

export async function getAttributionByAssessment(assessmentId: string) {
  const result = await sql`
    SELECT * FROM attribution_records WHERE assessment_id = ${assessmentId}
  `
  return result.rows[0] as AttributionRecord | undefined
}

// ---------------------------------------------------------------------------
// Pipeline Projects
// ---------------------------------------------------------------------------

export interface PipelineProject {
  id: string
  assessment_id: string | null
  project_name: string
  client: string | null
  division: string | null
  scheme: 'ESS' | 'VEU' | null
  method: string | null
  stage: 'diagnostic' | 'validation' | 'implementation' | 'mv_audit' | 'registration' | 'sale'
  estimated_yield: number | null
  estimated_value: number | null
  probability_weight: number
  notes: string | null
  archived: boolean
  created_at: string
  updated_at: string
}

export interface CreatePipelineInput {
  assessment_id?: string
  project_name: string
  client?: string
  division?: string
  scheme?: 'ESS' | 'VEU'
  method?: string
  stage?: string
  estimated_yield?: number
  estimated_value?: number
  probability_weight?: number
  notes?: string
}

export async function createPipelineProject(input: CreatePipelineInput) {
  const result = await sql`
    INSERT INTO pipeline_projects (
      assessment_id, project_name, client, division,
      scheme, method, stage, estimated_yield, estimated_value,
      probability_weight, notes
    ) VALUES (
      ${input.assessment_id ?? null}, ${input.project_name},
      ${input.client ?? null}, ${input.division ?? null},
      ${input.scheme ?? null}, ${input.method ?? null},
      ${input.stage ?? 'diagnostic'}, ${input.estimated_yield ?? null},
      ${input.estimated_value ?? null}, ${input.probability_weight ?? 0.10},
      ${input.notes ?? null}
    )
    RETURNING *
  `
  return result.rows[0] as PipelineProject
}

export async function listPipelineProjects(filters?: {
  stage?: string
  division?: string
  scheme?: string
  archived?: boolean
}) {
  const result = await sql`
    SELECT * FROM pipeline_projects
    WHERE archived = ${filters?.archived ?? false}
    ORDER BY stage, created_at DESC
  `
  return result.rows as PipelineProject[]
}

export async function updatePipelineStage(id: string, stage: string) {
  const WEIGHTS: Record<string, number> = {
    diagnostic: 0.10, validation: 0.25, implementation: 0.50,
    mv_audit: 0.75, registration: 0.90, sale: 1.00,
  }
  const result = await sql`
    UPDATE pipeline_projects
    SET stage = ${stage}, probability_weight = ${WEIGHTS[stage] ?? 0.10}, updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `
  return result.rows[0] as PipelineProject | undefined
}

export async function archivePipelineProject(id: string) {
  await sql`UPDATE pipeline_projects SET archived = true, updated_at = now() WHERE id = ${id}`
}

// ---------------------------------------------------------------------------
// Entity Hierarchy
// ---------------------------------------------------------------------------

export interface EntityNode {
  id: string
  parent_id: string | null
  entity_name: string
  entity_type: 'group' | 'division' | 'business_unit' | 'client' | 'facility'
  division: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export async function createEntity(input: {
  parent_id?: string
  entity_name: string
  entity_type: string
  division?: string
  metadata?: Record<string, unknown>
}) {
  const result = await sql`
    INSERT INTO entity_hierarchy (parent_id, entity_name, entity_type, division, metadata)
    VALUES (
      ${input.parent_id ?? null}, ${input.entity_name}, ${input.entity_type},
      ${input.division ?? null}, ${JSON.stringify(input.metadata ?? {})}
    )
    RETURNING *
  `
  return result.rows[0] as EntityNode
}

export async function listEntities(parentId?: string) {
  if (parentId) {
    const result = await sql`
      SELECT * FROM entity_hierarchy WHERE parent_id = ${parentId} ORDER BY entity_name
    `
    return result.rows as EntityNode[]
  }
  const result = await sql`
    SELECT * FROM entity_hierarchy ORDER BY entity_type, entity_name
  `
  return result.rows as EntityNode[]
}

export async function getEntityTree() {
  const result = await sql`
    WITH RECURSIVE tree AS (
      SELECT *, 0 AS depth FROM entity_hierarchy WHERE parent_id IS NULL
      UNION ALL
      SELECT e.*, t.depth + 1
      FROM entity_hierarchy e JOIN tree t ON e.parent_id = t.id
    )
    SELECT * FROM tree ORDER BY depth, entity_name
  `
  return result.rows as (EntityNode & { depth: number })[]
}

// ---------------------------------------------------------------------------
// Entity Compliance
// ---------------------------------------------------------------------------

export interface EntityCompliance {
  id: string
  entity_id: string
  scheme: 'ESS' | 'VEU'
  compliance_year: number
  target: number
  surrendered: number
  shortfall: number
  penalty_rate: number | null
  deadline: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export async function createEntityCompliance(input: {
  entity_id: string
  scheme: 'ESS' | 'VEU'
  compliance_year: number
  target: number
  surrendered?: number
  penalty_rate?: number
  deadline?: string
  notes?: string
}) {
  const result = await sql`
    INSERT INTO entity_compliance (
      entity_id, scheme, compliance_year, target, surrendered,
      penalty_rate, deadline, notes
    ) VALUES (
      ${input.entity_id}, ${input.scheme}, ${input.compliance_year},
      ${input.target}, ${input.surrendered ?? 0},
      ${input.penalty_rate ?? null}, ${input.deadline ?? null}, ${input.notes ?? null}
    )
    RETURNING *
  `
  return result.rows[0] as EntityCompliance
}

export async function getEntityCompliance(entityId: string) {
  const result = await sql`
    SELECT * FROM entity_compliance WHERE entity_id = ${entityId}
    ORDER BY compliance_year DESC, scheme
  `
  return result.rows as EntityCompliance[]
}

export async function getComplianceSummary() {
  const result = await sql`
    SELECT
      eh.id AS entity_id,
      eh.entity_name,
      eh.entity_type,
      COALESCE(SUM(ec.target), 0) AS total_target,
      COALESCE(SUM(ec.surrendered), 0) AS total_surrendered,
      COALESCE(SUM(GREATEST(ec.target - ec.surrendered, 0)), 0) AS total_shortfall,
      MIN(ec.deadline) AS next_deadline,
      COUNT(ec.id) AS obligation_count
    FROM entity_hierarchy eh
    LEFT JOIN entity_compliance ec ON ec.entity_id = eh.id
    GROUP BY eh.id, eh.entity_name, eh.entity_type
    HAVING COUNT(ec.id) > 0
    ORDER BY total_shortfall DESC
  `
  return result.rows
}
