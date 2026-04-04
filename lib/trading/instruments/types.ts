// =============================================================================
// WREI Platform — Instrument Type System
// Canonical type definitions for all tradeable instruments per WP5 §2-3
// =============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** All tradeable instrument types on the WREI platform */
export type InstrumentType =
  | 'ESC'       // Energy Savings Certificate (NSW ESS)
  | 'VEEC'      // Victorian Energy Efficiency Certificate (VEU)
  | 'PRC'       // Peak Reduction Certificate (NSW PDRS)
  | 'ACCU'      // Australian Carbon Credit Unit (ERF)
  | 'LGC'       // Large-scale Generation Certificate (RET)
  | 'STC'       // Small-scale Technology Certificate (SRES)
  | 'WREI_CC'   // WREI Carbon Credit Token
  | 'WREI_ACO'; // WREI Asset Co Token

/** Broad instrument categories */
export type InstrumentCategory =
  | 'certificate'    // Australian environmental certificates
  | 'carbon_token'   // WREI blockchain-native carbon credits
  | 'asset_token';   // WREI blockchain-native asset co tokens

/** Lifecycle states shared across all instrument types */
export type InstrumentStatus =
  // Common states
  | 'created'
  | 'registered'
  | 'active'
  | 'listed'
  | 'under_negotiation'
  | 'traded'
  | 'settled'
  // Certificate-specific
  | 'transfer_pending'
  | 'transferred'
  | 'surrendered'
  | 'voluntarily_retired'
  // Token-specific
  | 'data_collected'
  | 'verified'
  | 'minted'
  | 'retired'
  | 'redeemed'
  // Asset token-specific
  | 'spv_established'
  | 'token_designed'
  | 'primary_offering';

/** Source of the instrument's current price */
export type PricingSource =
  | 'live_feed'    // Real-time API feed
  | 'scraped'      // Web-scraped market data
  | 'manual'       // Manually entered reference price
  | 'simulated'    // Simulated for demo/testing
  | 'negotiated';  // Price determined through negotiation

/** Compliance restrictions or holds on an instrument */
export type ComplianceFlag =
  | 'kyc_pending'
  | 'aml_hold'
  | 'afsl_required'
  | 'wholesale_only'
  | 'jurisdiction_restricted'
  | 'audit_pending'
  | 'surrender_deadline_imminent';

/** How anchor price is determined for negotiation */
export type AnchorMethod = 'spot' | 'fixed' | 'premium_over_spot';

// ---------------------------------------------------------------------------
// Base Instrument Interface (WP5 §2)
// ---------------------------------------------------------------------------

export interface Instrument {
  // Identity
  instrumentId: string;
  instrumentType: InstrumentType;
  instrumentCategory: InstrumentCategory;
  displayName: string;
  ticker: string;

  // Quantity
  quantity: number;
  unitOfMeasure: string;

  // Pricing
  currentPrice: number;
  currency: 'AUD' | 'USD';
  pricingSource: PricingSource;
  lastPriceUpdate: string;

  // Provenance
  issuer: string;
  vintage: string;
  registryId?: string;
  registryName?: string;

  // Status
  status: InstrumentStatus;
  createdAt: string;
  updatedAt: string;

  // Compliance
  jurisdictions: string[];
  regulatoryClassification: 'not_financial_product' | 'financial_product' | 'managed_investment';
  complianceFlags: ComplianceFlag[];
}

// ---------------------------------------------------------------------------
// Type-Specific Metadata (WP5 §3)
// ---------------------------------------------------------------------------

/** §3.1 — Australian Environmental Certificate metadata */
export interface CertificateMetadata {
  scheme: 'ESS' | 'PDRS' | 'VEU' | 'ERF' | 'RET' | 'SRES';
  schemeAdministrator: string;
  activityType?: string;
  methodologyReference?: string;

  certificateNumber?: string;
  accreditedProvider?: string;
  projectId?: string;

  penaltyRate?: number;
  surrenderDeadline?: string;
  complianceYear?: string;

  settlementMethod: 'registry_transfer';
  registryTransferSteps: string[];
  estimatedSettlementDays: number;
}

/** §3.2 — WREI Carbon Credit Token metadata */
export interface WREICarbonTokenMetadata {
  verificationStandards: ('ISO_14064_2' | 'Verra_VCS' | 'Gold_Standard')[];
  wreiVerificationScore: number;
  wreiPremiumMultiplier: number;

  generationSource: 'vessel_efficiency' | 'modal_shift' | 'construction_avoidance';
  sourceContributionPct: number;

  provenance: {
    vesselId: string;
    vesselName: string;
    route: string;
    operationalPeriod: { start: string; end: string };
    energyData: {
      electricConsumption: number;
      dieselBaseline: number;
      passengersTransported: number;
      routeDistanceKm: number;
    };
    emissionsSavedTonnes: number;
    baselineMethodology: string;
  };

  blockchainNetwork: string;
  tokenStandard: string;
  contractAddress?: string;
  mintTransactionHash: string;

  yieldModel: 'accruing';
  projectedAnnualYield: number;

  retirementEligible: boolean;
  retirementPurpose?: string;
  retirementTransactionHash?: string;

  settlementMethod: 'on_chain';
  settlementCycle: 'T+0';
}

/** §3.3 — WREI Asset Co Token metadata */
export interface WREIAssetCoTokenMetadata {
  underlyingAsset: {
    spvName: string;
    assetClass: 'maritime_infrastructure';
    vesselCount: number;
    vesselType: string;
    deepPowerUnits: number;
    totalCapex: number;
  };

  totalTokenSupply: number;
  tokenHolderEquity: number;
  fractionPerToken: number;

  yieldModel: 'distribution';
  grossLeaseYield: number;
  equityYield: number;
  distributionFrequency: 'quarterly';
  nextDistributionDate?: string;

  annualLeaseIncome: number;
  annualDebtService: number;
  netCashFlow: number;
  cashOnCashMultiple: number;

  fleetUtilisation?: number;
  averagePassengerLoad?: number;
  operationalRoutes?: number;

  blockchainNetwork: string;
  tokenStandard: string;
  contractAddress?: string;

  afslRequired: true;
  wholesaleOnly: boolean;
  custodian?: string;

  settlementMethod: 'on_chain';
  settlementCycle: 'T+0';
  redemptionWindow: 'quarterly';
}

// ---------------------------------------------------------------------------
// Pricing Configuration (WP5 §5.2)
// ---------------------------------------------------------------------------

export interface VolumeDiscountThreshold {
  quantity: number;
  discountPct: number;
}

export interface InstrumentPricingConfig {
  instrumentType: InstrumentType;

  // Reference pricing
  spotPriceSource: PricingSource;
  spotPriceFeedUrl?: string;
  spotPriceUpdateInterval: number;
  fallbackPrice: number;

  // Negotiation parameters
  anchorPrice: number;
  anchorMethod: AnchorMethod;
  premiumMultiplier?: number;
  priceFloor: number;
  priceCeiling: number;
  maxConcessionPerRound: number;
  maxTotalConcession: number;

  // Penalty/reference thresholds (compliance instruments)
  penaltyRate?: number;

  // Volume pricing
  volumeDiscountThresholds: VolumeDiscountThreshold[];

  // Display
  currency: 'AUD' | 'USD';
  unitOfMeasure: string;
}
