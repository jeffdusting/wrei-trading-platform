/**
 * WREI Four-Layer Architecture Type Definitions
 *
 * Comprehensive type system for the WREI tokenization technical architecture:
 * 1. Measurement Layer: Vessel telemetry and emissions calculations
 * 2. Verification Layer: Triple-standard compliance (ISO 14064-2, Verra VCS, Gold Standard)
 * 3. Tokenization Layer: Smart contract mechanics and provenance
 * 4. Distribution Layer: DeFi protocol integration and settlement
 */

// =================== MEASUREMENT LAYER TYPES ===================

export interface VesselTelemetryData {
  vesselId: string;
  energyConsumption: number; // kWh/passenger-km
  passengerCount: number;
  routeDistance: number; // km
  timestamp: string; // ISO 8601
  operationalMode: 'steady_state' | 'deep_power' | 'ramp_up';
}

export interface GHGCalculation {
  scope1: number; // Direct emissions (tCO2e)
  scope2: number; // Indirect emissions (tCO2e)
  scope3: number; // Value chain emissions (tCO2e)
  avoidedEmissions: number; // Emissions avoided (tCO2e)
  netBenefit: number; // Net carbon benefit (tCO2e)
}

export interface MeasurementResult {
  vesselEfficiency: number; // Percentage efficiency
  emissionsAvoided: number; // tCO2e
  carbonCreditsGenerated: number; // Tradeable credits
  measurementVerified: boolean;
  ghgCalculation: GHGCalculation;
}

export interface FleetTelemetry {
  fleetSize: number;
  totalEfficiency: number;
  averageUtilization: number;
  combinedEmissionsReduction: number;
}

export interface ModalShiftData {
  modalShiftPercentage: number; // % of passengers shifting to water transport
  emissionsReduction: number; // tCO2e reduced through modal shift
  alternativeTransportBaseline: number; // Baseline emissions from alternative transport
}

export interface ConstructionAvoidanceData {
  constructionAvoidancePercentage: number; // % construction emissions avoided
  emissionsReduction: number; // tCO2e reduced through avoiding road/rail construction
  constructionBaseline: number; // Baseline emissions from construction
}

// =================== VERIFICATION LAYER TYPES ===================

export interface VerificationAuditTrail {
  step: string;
  timestamp: string;
  verifier: string;
  result: 'passed' | 'failed' | 'pending';
  signature: string;
}

export interface ISO14064Verification {
  standard: 'ISO 14064-2';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  auditTrail: VerificationAuditTrail[];
  blockchainHash: string;
  verifierSignature: string;
  certificationBody: string;
}

export interface VerraVerification {
  standard: 'Verra VCS';
  projectId: string;
  vintageYear: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  qualityScore: number; // 0-100
  registryEntry: string;
  permanenceRating: number;
}

export interface GoldStandardVerification {
  standard: 'Gold Standard';
  sdgAlignment: string[]; // UN Sustainable Development Goals
  impactScore: number; // 0-10
  verificationStatus: 'pending' | 'verified' | 'rejected';
  socialBenefits: string[];
  communityParticipation: number;
}

export interface TripleStandardVerification {
  standards: string[];
  compositeScore: number; // 0-100
  verificationConfidence: 'low' | 'medium' | 'high';
  consensusHash: string;
  verificationDate: string;
  allStandardsVerified: boolean;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// =================== TOKENIZATION LAYER TYPES ===================

export interface CarbonCreditTokenization {
  tokenType: 'carbon_credits';
  tokenAmount: number;
  tokenPrice: number; // A$ per tonne
  smartContractAddress: string;
  tokenId: string;
  immutableProvenance: boolean;
  verificationHash: string;
  mintingDate: string;
}

export interface AssetCoTokenization {
  tokenType: 'asset_co';
  underlyingAssetValue: number; // A$
  expectedYield: number; // Percentage
  tokenPrice: number; // A$ per token
  dividendMechanism: 'quarterly_distribution' | 'nav_accruing';
  smartContractAddress: string;
  assetId: string;
  leaseIncome: number; // Annual A$
}

export interface DualPortfolioTokenization {
  tokenType: 'dual_portfolio';
  carbonComponent: number; // A$ value
  assetComponent: number; // A$ value
  correlationDiscount: number; // Percentage benefit
  totalValue: number; // A$
  crossCollateralEnabled: boolean;
  portfolioWeights: {
    carbon: number;
    asset: number;
  };
}

export interface ProvenanceChain {
  provenanceChain: string[]; // Hash chain from measurement to distribution
  immutable: boolean;
  timestampLocked: boolean;
  verificationSteps: number;
}

export type TokenizationProcess = CarbonCreditTokenization | AssetCoTokenization | DualPortfolioTokenization;

// =================== DISTRIBUTION LAYER TYPES ===================

export interface TradeOrder {
  tokenType: 'carbon_credits' | 'asset_co' | 'dual_portfolio';
  amount: number;
  price: number; // A$
  buyerAddress: string;
  sellerAddress: string;
  orderType?: 'market' | 'limit';
}

export interface AtomicSettlement {
  settlementTime: 'T+0' | 'T+1' | 'T+2';
  atomic: boolean;
  nonCustodial: boolean;
  crossChain: boolean;
  settlementHash: string;
  gasOptimized: boolean;
  settlementCost: number; // A$
}

export interface CrossCollateralPosition {
  carbonCredits: { amount: number; value: number };
  assetCoTokens: { amount: number; value: number };
  totalPortfolioValue: number;
}

export interface CrossCollateralMetrics {
  carbonLTV: number; // Loan-to-value ratio for carbon credits
  assetLTV: number; // Loan-to-value ratio for asset co tokens
  portfolioLTV: number; // Enhanced LTV for dual portfolio
  borrowingCapacity: number; // Total borrowing capacity A$
  carbonBorrowingCapacity: number; // Carbon-only borrowing A$
  correlationBenefit: number; // Additional borrowing from correlation
}

export interface AMMMetrics {
  spotPrice: number; // Current market price A$
  slippageTolerance: number; // Percentage slippage
  liquidityDepth: number; // Total liquidity A$
  yieldFarmingRewards: number; // APY percentage
  feeTier: number; // Trading fee percentage
  volume24h: number; // 24-hour volume A$
}

export interface YieldFarmingStrategy {
  stakedTokens: {
    carbon: number;
    asset: number;
  };
  stakingDuration: number; // Days
  yieldBooster: number; // Multiplier for dual portfolio
  compoundingFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface YieldFarmingMetrics {
  baseAPY: number; // Base annual percentage yield
  boostedAPY: number; // Yield with booster applied
  compoundedReturns: number; // Expected returns with compounding
  liquidityMining: boolean;
  autoCompounding: boolean;
  impermanentLossProtection: boolean;
}

// =================== ARCHITECTURE STATE TYPES ===================

export interface WREIArchitectureState {
  measurement: {
    vesselCount: number;
    totalEfficiency: number;
    measurementsProcessed: number;
  };
  verification: {
    standardsCompliant: number;
    verificationRate: number;
    averageScore: number;
  };
  tokenization: {
    tokensIssued: number;
    totalValue: number; // A$
    provenanceVerified: boolean;
  };
  distribution: {
    tradingVolume: number; // A$
    liquidityDepth: number; // A$
    settlementSuccess: number; // Percentage
  };
}

export interface ArchitectureConsistency {
  dataConsistent: boolean;
  layerAlignment: boolean;
  valuePreservation: boolean;
  provenanceIntact: boolean;
  errorCount: number;
  warnings: string[];
}

// =================== LAYER INTERFACE DEFINITIONS ===================

export interface MeasurementLayer {
  processTelemetry(data: VesselTelemetryData): MeasurementResult;
  calculateGHGEmissions(data: VesselTelemetryData): GHGCalculation;
  getFleetTelemetry(fleetType: 'regular' | 'deep_power'): FleetTelemetry;
  calculateModalShift(): ModalShiftData;
  calculateConstructionAvoidance(): ConstructionAvoidanceData;
}

export interface VerificationLayer {
  verifyISO14064(data: GHGCalculation): ISO14064Verification;
  verifyVerra(data: GHGCalculation): VerraVerification;
  verifyGoldStandard(data: GHGCalculation): GoldStandardVerification;
  verifyTripleStandard(data: MeasurementResult | GHGCalculation): TripleStandardVerification;
}

export interface TokenizationLayer {
  tokenizeCarbonCredits(verification: any): CarbonCreditTokenization;
  tokenizeAssetCo(assetData: any): AssetCoTokenization;
  tokenizeDualPortfolio(dualData: any): DualPortfolioTokenization;
  linkProvenance(data: any): ProvenanceChain;
}

export interface DistributionLayer {
  simulateAtomicSettlement(order: TradeOrder): AtomicSettlement;
  calculateCrossCollateral(position: CrossCollateralPosition): CrossCollateralMetrics;
  simulateAMM(pool: any): AMMMetrics;
  simulateYieldFarming(strategy: YieldFarmingStrategy): YieldFarmingMetrics;
}

// =================== UTILITY TYPES ===================

export interface WREIArchitectureMetrics {
  totalVessels: 110; // 88 regular + 22 deep power
  vesselEfficiency: 47.2; // Average efficiency percentage
  modalShift: 47.9; // Modal shift percentage
  constructionAvoidance: 4.8; // Construction avoidance percentage
  carbonPrice: 150; // A$/tonne
  assetYield: 28.3; // Asset Co yield percentage
  fleetValue: 473_000_000; // Total fleet value A$
  equityValue: 131_000_000; // Tokenized equity value A$
}

export type ArchitectureLayerName = 'measurement' | 'verification' | 'tokenization' | 'distribution';

export interface LayerPerformanceMetrics {
  layer: ArchitectureLayerName;
  processingTime: number; // milliseconds
  throughput: number; // operations per second
  errorRate: number; // percentage
  availability: number; // percentage uptime
}