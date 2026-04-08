// =============================================================================
// WREI Enterprise — ESS / VEU Scheme Rule Sets
//
// Pre-Validation Diagnostic Engine rule definitions.
// Jurisdiction → Methods → Disqualifiers → Yield Formulas
// =============================================================================

export type Jurisdiction = 'NSW' | 'VIC'
export type MethodStatus = 'active' | 'ending' | 'ended'

export interface MethodDefinition {
  code: string
  name: string
  description: string
  status: MethodStatus
  endDate?: string
  activityTypes: string[]
  yieldUnit: string
}

export interface Disqualifier {
  id: string
  question: string
  disqualifyOn: 'yes' | 'no'
  explanation: string
  applicableMethods: string[] | 'all'
}

export interface YieldInput {
  key: string
  label: string
  type: 'number' | 'select'
  unit?: string
  options?: { value: string; label: string }[]
  required: boolean
}

export interface YieldFormula {
  method: string
  inputs: YieldInput[]
  calculate: (inputs: Record<string, number | string>) => number
  unit: string
}

export interface SchemeRuleSet {
  jurisdiction: Jurisdiction
  scheme: string
  methods: MethodDefinition[]
  disqualifiers: Disqualifier[]
  yieldFormulas: YieldFormula[]
}

// ---------------------------------------------------------------------------
// ESS Rule Set (NSW)
// ---------------------------------------------------------------------------

const ESS_METHODS: MethodDefinition[] = [
  {
    code: 'HEER',
    name: 'High Efficiency Equipment Replacement',
    description: 'Replacement of existing HVAC, lighting, and other equipment with high-efficiency alternatives',
    status: 'active',
    activityTypes: ['HVAC', 'Commercial Lighting'],
    yieldUnit: 'ESC',
  },
  {
    code: 'IHEAB',
    name: 'Installing High Efficiency Appliances in Buildings',
    description: 'Installation of high-efficiency hot water systems, insulation, and building appliances',
    status: 'active',
    activityTypes: ['Hot Water', 'Insulation'],
    yieldUnit: 'ESC',
  },
  {
    code: 'MBM',
    name: 'Metered Baseline Method',
    description: 'Equipment upgrades verified by metered energy savings (motors, refrigeration, industrial)',
    status: 'active',
    activityTypes: ['Motors', 'Refrigeration', 'Industrial'],
    yieldUnit: 'ESC',
  },
  {
    code: 'PIAMV',
    name: 'Project Impact Assessment with Measurement and Verification',
    description: 'Building shell improvements, complex projects requiring M&V',
    status: 'active',
    activityTypes: ['Building Shell', 'Complex Projects'],
    yieldUnit: 'ESC',
  },
  {
    code: 'ROOA',
    name: 'Removal of Old Ozone-Depleting Appliances',
    description: 'Removal and destruction of old refrigerators containing ozone-depleting substances',
    status: 'active',
    activityTypes: ['Appliance Removal'],
    yieldUnit: 'ESC',
  },
  {
    code: 'CLESF',
    name: 'Commercial Lighting — Existing Scheduled Facility',
    description: 'Commercial lighting upgrades in existing facilities (method ended)',
    status: 'ended',
    endDate: '2026-03-31',
    activityTypes: ['Commercial Lighting'],
    yieldUnit: 'ESC',
  },
  {
    code: 'SONA',
    name: 'Sale of New Appliances',
    description: 'Sale of high-efficiency new appliances (method ended)',
    status: 'ended',
    endDate: '2025-11-30',
    activityTypes: ['Appliance Sales'],
    yieldUnit: 'ESC',
  },
  {
    code: 'F8',
    name: 'Forward Creation Formula 8',
    description: 'Forward creation method — ending June 2026',
    status: 'ending',
    endDate: '2026-06-30',
    activityTypes: ['Forward Creation'],
    yieldUnit: 'ESC',
  },
  {
    code: 'F9',
    name: 'Forward Creation Formula 9',
    description: 'Forward creation method — ending June 2026',
    status: 'ending',
    endDate: '2026-06-30',
    activityTypes: ['Forward Creation'],
    yieldUnit: 'ESC',
  },
]

const ESS_DISQUALIFIERS: Disqualifier[] = [
  {
    id: 'ess-replaced-10yr',
    question: 'Has this equipment been replaced in the last 10 years?',
    disqualifyOn: 'yes',
    explanation: 'Equipment replaced within 10 years is not eligible. The existing equipment must have been in service for at least 10 years.',
    applicableMethods: ['HEER', 'MBM'],
  },
  {
    id: 'ess-residential',
    question: 'Is the facility in a residential dwelling?',
    disqualifyOn: 'yes',
    explanation: 'This method is for commercial, industrial, or institutional premises only. Residential dwellings require IHEAB or ROOA methods.',
    applicableMethods: ['HEER', 'MBM', 'PIAMV'],
  },
  {
    id: 'ess-operational',
    question: 'Is the existing equipment currently operational?',
    disqualifyOn: 'no',
    explanation: 'The existing equipment must be operational at the time of assessment. Replacing non-functional equipment does not qualify.',
    applicableMethods: 'all',
  },
  {
    id: 'ess-acp-registered',
    question: 'Is the project proponent an Accredited Certificate Provider (ACP)?',
    disqualifyOn: 'no',
    explanation: 'Only registered ACPs can create ESCs. The energy saver must nominate a registered ACP.',
    applicableMethods: 'all',
  },
  {
    id: 'ess-nsw-site',
    question: 'Is the site located in NSW?',
    disqualifyOn: 'no',
    explanation: 'The ESS applies only to sites located in New South Wales.',
    applicableMethods: 'all',
  },
]

const ESS_YIELD_FORMULAS: YieldFormula[] = [
  {
    method: 'HEER',
    inputs: [
      { key: 'currentKw', label: 'Current system capacity', type: 'number', unit: 'kW', required: true },
      { key: 'proposedKw', label: 'Proposed system capacity', type: 'number', unit: 'kW', required: true },
      { key: 'annualHours', label: 'Annual operating hours', type: 'number', unit: 'hrs/yr', required: true },
    ],
    calculate: (inputs) => {
      const currentKw = Number(inputs.currentKw) || 0
      const proposedKw = Number(inputs.proposedKw) || 0
      const annualHours = Number(inputs.annualHours) || 0
      const savingsKw = Math.max(0, currentKw - proposedKw)
      // ESC = (savings kW × hours × 0.001 MWh/kWh) × certificate conversion factor (1.06)
      return Math.round(savingsKw * annualHours * 0.001 * 1.06)
    },
    unit: 'ESC',
  },
  {
    method: 'IHEAB',
    inputs: [
      {
        key: 'heaterType', label: 'Water heater type', type: 'select', required: true,
        options: [
          { value: 'heat_pump', label: 'Heat Pump' },
          { value: 'solar_electric', label: 'Solar Electric Boost' },
          { value: 'solar_gas', label: 'Solar Gas Boost' },
          { value: 'gas_instant', label: 'Gas Instantaneous' },
        ],
      },
      {
        key: 'climateZone', label: 'Climate zone', type: 'select', required: true,
        options: [
          { value: 'hp3', label: 'Zone 3 — Hot/Humid (North NSW)' },
          { value: 'hp4', label: 'Zone 4 — Warm/Temperate (Sydney)' },
          { value: 'hp5', label: 'Zone 5 — Cool/Temperate (Southern NSW)' },
        ],
      },
      { key: 'householdSize', label: 'Household size', type: 'number', unit: 'persons', required: true },
    ],
    calculate: (inputs) => {
      const heaterType = String(inputs.heaterType)
      const climateZone = String(inputs.climateZone)
      const householdSize = Number(inputs.householdSize) || 3
      // Simplified Schedule A lookup — base ESC per heater type × zone modifier × occupancy scale
      const baseEsc: Record<string, number> = { heat_pump: 28, solar_electric: 32, solar_gas: 22, gas_instant: 15 }
      const zoneMod: Record<string, number> = { hp3: 0.85, hp4: 1.0, hp5: 1.15 }
      const base = baseEsc[heaterType] ?? 20
      const zone = zoneMod[climateZone] ?? 1.0
      const occupancy = Math.min(Math.max(householdSize / 3, 0.7), 1.5)
      return Math.round(base * zone * occupancy)
    },
    unit: 'ESC',
  },
  {
    method: 'MBM',
    inputs: [
      { key: 'motorCount', label: 'Number of motors', type: 'number', required: true },
      { key: 'currentKw', label: 'Current motor rating', type: 'number', unit: 'kW', required: true },
      { key: 'proposedKw', label: 'Proposed motor rating', type: 'number', unit: 'kW', required: true },
      { key: 'loadFactor', label: 'Load factor', type: 'number', unit: '%', required: true },
    ],
    calculate: (inputs) => {
      const motorCount = Number(inputs.motorCount) || 1
      const currentKw = Number(inputs.currentKw) || 0
      const proposedKw = Number(inputs.proposedKw) || 0
      const loadFactor = (Number(inputs.loadFactor) || 75) / 100
      const savingsPerMotor = Math.max(0, currentKw - proposedKw) * loadFactor
      // ESC = motors × savings × 8760 hours × 0.001 MWh × conversion factor
      return Math.round(motorCount * savingsPerMotor * 8760 * 0.001 * 1.06)
    },
    unit: 'ESC',
  },
  {
    method: 'PIAMV',
    inputs: [
      { key: 'annualSavingsMwh', label: 'Estimated annual energy savings', type: 'number', unit: 'MWh/yr', required: true },
    ],
    calculate: (inputs) => {
      const savings = Number(inputs.annualSavingsMwh) || 0
      // ESC = MWh savings × conversion factor (1.06)
      return Math.round(savings * 1.06)
    },
    unit: 'ESC',
  },
  {
    method: 'ROOA',
    inputs: [
      { key: 'applianceCount', label: 'Number of appliances to remove', type: 'number', required: true },
    ],
    calculate: (inputs) => {
      const count = Number(inputs.applianceCount) || 0
      // Fixed ESC per appliance (simplified)
      return Math.round(count * 4.5)
    },
    unit: 'ESC',
  },
]

export const ESS_RULES: SchemeRuleSet = {
  jurisdiction: 'NSW',
  scheme: 'ESS',
  methods: ESS_METHODS,
  disqualifiers: ESS_DISQUALIFIERS,
  yieldFormulas: ESS_YIELD_FORMULAS,
}

// ---------------------------------------------------------------------------
// VEU Rule Set (VIC)
// ---------------------------------------------------------------------------

const VEU_METHODS: MethodDefinition[] = [
  {
    code: 'RDUE',
    name: 'Residential Ducted Upgrades — Existing',
    description: 'Upgrade of existing ducted HVAC systems in residential premises',
    status: 'active',
    activityTypes: ['HVAC'],
    yieldUnit: 'VEEC',
  },
  {
    code: 'VHEER',
    name: 'Victorian High Efficiency Equipment Replacement',
    description: 'Commercial and industrial equipment replacement with high-efficiency alternatives',
    status: 'active',
    activityTypes: ['HVAC', 'Commercial Lighting', 'Motors'],
    yieldUnit: 'VEEC',
  },
  {
    code: 'VIHEAB',
    name: 'Victorian Installing High Efficiency Appliances in Buildings',
    description: 'Installation of high-efficiency hot water and building appliances',
    status: 'active',
    activityTypes: ['Hot Water', 'Insulation'],
    yieldUnit: 'VEEC',
  },
  {
    code: 'VMBM',
    name: 'Victorian Metered Baseline Method',
    description: 'Equipment upgrades verified by metered energy savings',
    status: 'active',
    activityTypes: ['Motors', 'Refrigeration', 'Industrial'],
    yieldUnit: 'VEEC',
  },
]

const VEU_DISQUALIFIERS: Disqualifier[] = [
  {
    id: 'veu-replaced-10yr',
    question: 'Has this equipment been replaced in the last 10 years?',
    disqualifyOn: 'yes',
    explanation: 'Equipment replaced within 10 years is not eligible under VEU.',
    applicableMethods: ['VHEER', 'VMBM'],
  },
  {
    id: 'veu-operational',
    question: 'Is the existing equipment currently operational?',
    disqualifyOn: 'no',
    explanation: 'The existing equipment must be operational at the time of assessment.',
    applicableMethods: 'all',
  },
  {
    id: 'veu-victoria-site',
    question: 'Is the site located in Victoria?',
    disqualifyOn: 'no',
    explanation: 'The VEU applies only to sites located in Victoria.',
    applicableMethods: 'all',
  },
  {
    id: 'veu-accredited',
    question: 'Is the project proponent an Accredited Person (AP)?',
    disqualifyOn: 'no',
    explanation: 'Only registered Accredited Persons can create VEECs.',
    applicableMethods: 'all',
  },
]

const VEU_YIELD_FORMULAS: YieldFormula[] = [
  {
    method: 'VHEER',
    inputs: [
      { key: 'currentKw', label: 'Current system capacity', type: 'number', unit: 'kW', required: true },
      { key: 'proposedKw', label: 'Proposed system capacity', type: 'number', unit: 'kW', required: true },
      { key: 'annualHours', label: 'Annual operating hours', type: 'number', unit: 'hrs/yr', required: true },
    ],
    calculate: (inputs) => {
      const currentKw = Number(inputs.currentKw) || 0
      const proposedKw = Number(inputs.proposedKw) || 0
      const annualHours = Number(inputs.annualHours) || 0
      const savingsKw = Math.max(0, currentKw - proposedKw)
      // VEEC = savings × hours × 0.001 MWh × conversion factor (1.0)
      return Math.round(savingsKw * annualHours * 0.001 * 1.0)
    },
    unit: 'VEEC',
  },
  {
    method: 'VIHEAB',
    inputs: [
      {
        key: 'heaterType', label: 'Water heater type', type: 'select', required: true,
        options: [
          { value: 'heat_pump', label: 'Heat Pump' },
          { value: 'solar_electric', label: 'Solar Electric Boost' },
          { value: 'gas_instant', label: 'Gas Instantaneous' },
        ],
      },
      { key: 'householdSize', label: 'Household size', type: 'number', unit: 'persons', required: true },
    ],
    calculate: (inputs) => {
      const heaterType = String(inputs.heaterType)
      const householdSize = Number(inputs.householdSize) || 3
      const baseVeec: Record<string, number> = { heat_pump: 25, solar_electric: 28, gas_instant: 12 }
      const base = baseVeec[heaterType] ?? 18
      const occupancy = Math.min(Math.max(householdSize / 3, 0.7), 1.5)
      return Math.round(base * occupancy)
    },
    unit: 'VEEC',
  },
  {
    method: 'VMBM',
    inputs: [
      { key: 'motorCount', label: 'Number of motors', type: 'number', required: true },
      { key: 'currentKw', label: 'Current motor rating', type: 'number', unit: 'kW', required: true },
      { key: 'proposedKw', label: 'Proposed motor rating', type: 'number', unit: 'kW', required: true },
      { key: 'loadFactor', label: 'Load factor', type: 'number', unit: '%', required: true },
    ],
    calculate: (inputs) => {
      const motorCount = Number(inputs.motorCount) || 1
      const currentKw = Number(inputs.currentKw) || 0
      const proposedKw = Number(inputs.proposedKw) || 0
      const loadFactor = (Number(inputs.loadFactor) || 75) / 100
      const savingsPerMotor = Math.max(0, currentKw - proposedKw) * loadFactor
      return Math.round(motorCount * savingsPerMotor * 8760 * 0.001 * 1.0)
    },
    unit: 'VEEC',
  },
  {
    method: 'RDUE',
    inputs: [
      { key: 'currentKw', label: 'Current system capacity', type: 'number', unit: 'kW', required: true },
      { key: 'proposedKw', label: 'Proposed system capacity', type: 'number', unit: 'kW', required: true },
    ],
    calculate: (inputs) => {
      const currentKw = Number(inputs.currentKw) || 0
      const proposedKw = Number(inputs.proposedKw) || 0
      const savings = Math.max(0, currentKw - proposedKw)
      // Residential ducted: fixed 2000 hr assumption × conversion
      return Math.round(savings * 2000 * 0.001 * 1.0)
    },
    unit: 'VEEC',
  },
]

export const VEU_RULES: SchemeRuleSet = {
  jurisdiction: 'VIC',
  scheme: 'VEU',
  methods: VEU_METHODS,
  disqualifiers: VEU_DISQUALIFIERS,
  yieldFormulas: VEU_YIELD_FORMULAS,
}

// ---------------------------------------------------------------------------
// Activity Type → Method Mapping
// ---------------------------------------------------------------------------

export const ACTIVITY_METHOD_MAP: Record<string, { ess: string; veu: string }> = {
  'Commercial Lighting': { ess: 'CLESF', veu: 'VHEER' },
  'HVAC': { ess: 'HEER', veu: 'VHEER' },
  'Motors': { ess: 'MBM', veu: 'VMBM' },
  'Hot Water': { ess: 'IHEAB', veu: 'VIHEAB' },
  'Refrigeration': { ess: 'MBM', veu: 'VMBM' },
  'Building Shell': { ess: 'PIAMV', veu: 'VHEER' },
}

export function getRuleSet(jurisdiction: Jurisdiction): SchemeRuleSet {
  return jurisdiction === 'NSW' ? ESS_RULES : VEU_RULES
}

export function getMethodByCode(jurisdiction: Jurisdiction, code: string): MethodDefinition | undefined {
  return getRuleSet(jurisdiction).methods.find(m => m.code === code)
}

export function getDisqualifiersForMethod(jurisdiction: Jurisdiction, methodCode: string): Disqualifier[] {
  const rules = getRuleSet(jurisdiction)
  return rules.disqualifiers.filter(
    d => d.applicableMethods === 'all' || d.applicableMethods.includes(methodCode)
  )
}

export function getYieldFormula(jurisdiction: Jurisdiction, methodCode: string): YieldFormula | undefined {
  // Map VEU activity types to VEU methods when ESS method code is given
  const rules = getRuleSet(jurisdiction)
  return rules.yieldFormulas.find(f => f.method === methodCode)
}
