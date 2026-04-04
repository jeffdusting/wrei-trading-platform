# WP5 — Token & Instrument Specification

**Document Reference:** WR-WREI-WP5 | **Date:** 4 April 2026
**Purpose:** Define metadata schemas, lifecycle states, pricing mechanics, and agentic negotiation interaction for all tradeable products on the WREI platform
**Source Documents:** WR-STR-008 (Tokenisation Strategy), WREI Tokenisation Practical Paper, WP1 (ESC Market Audit), WP3 (Codebase Assessment)
**Status:** Draft for Jeff's review — conflicts with existing documents flagged for resolution

---

## 1. Instrument Taxonomy

The WREI platform trades three categories of instrument, each with distinct characteristics. The platform data model must accommodate all three through a unified interface while preserving their regulatory and operational differences.

| Category | Examples | Regulatory Status | Registry | Settlement | Tokenised |
|---|---|---|---|---|---|
| **Australian Environmental Certificates** | ESC, VEEC, PRC, ACCU, LGC, STC | ESCs: not financial products; ACCUs: financial products | TESSA (ESC/PRC), CER (ACCU/SMC), ESC Vic (VEEC), CER (LGC/STC) | Bilateral + registry transfer | No (traditional certificates) |
| **WREI Carbon Credit Tokens** | WREI-CC | Financial product (ACCU-equivalent classification expected) | WREI blockchain (primary), Verra/GS (cross-registered) | On-chain T+0 | Yes |
| **WREI Asset Co Tokens** | WREI-ACO | Financial product (managed investment scheme) | WREI blockchain | On-chain T+0 | Yes |

### 1.1 Design Principle — Unified Trading Interface

From a user's perspective, all three instrument categories should be tradeable through the same Bloomberg Terminal interface. The platform abstracts the underlying settlement and registry complexity — a trader sees a consistent order entry, negotiation, and confirmation flow regardless of whether they are buying ESCs (settled via TESSA transfer) or WREI carbon tokens (settled on-chain).

The data model achieves this through a base `Instrument` interface that each category extends with type-specific metadata.

---

## 2. Base Instrument Schema

All tradeable products on the platform share this core schema.

```typescript
interface Instrument {
  // Identity
  instrumentId: string;                    // Platform-unique identifier (UUID v4)
  instrumentType: InstrumentType;          // 'ESC' | 'VEEC' | 'PRC' | 'ACCU' | 'LGC' | 'STC' | 'WREI_CC' | 'WREI_ACO'
  instrumentCategory: InstrumentCategory;  // 'certificate' | 'carbon_token' | 'asset_token'
  displayName: string;                     // Human-readable name
  ticker: string;                          // Short code for market ticker (e.g., 'ESC', 'WREI-CC', 'WREI-ACO')

  // Quantity
  quantity: number;                        // Number of units
  unitOfMeasure: string;                   // 'MWh' (ESC), 'tCO2e' (carbon), 'fraction' (asset)

  // Pricing
  currentPrice: number;                    // Current market/reference price (A$)
  currency: 'AUD' | 'USD';                // Pricing currency
  pricingSource: PricingSource;            // 'live_feed' | 'scraped' | 'simulated' | 'negotiated'
  lastPriceUpdate: string;                 // ISO 8601 timestamp

  // Provenance
  issuer: string;                          // Issuing entity
  vintage: string;                         // Year of creation/generation
  registryId?: string;                     // Registry-specific identifier (TESSA cert ID, CER unit ID, blockchain hash)
  registryName?: string;                   // 'TESSA' | 'CER' | 'Verra' | 'Gold_Standard' | 'WREI_Blockchain'

  // Status
  status: InstrumentStatus;                // See lifecycle states (§4)
  createdAt: string;                       // ISO 8601
  updatedAt: string;                       // ISO 8601

  // Compliance
  jurisdictions: string[];                 // Applicable jurisdictions ['NSW', 'VIC', 'AU', 'Global']
  regulatoryClassification: string;        // 'not_financial_product' | 'financial_product' | 'managed_investment'
  complianceFlags: ComplianceFlag[];       // Any active compliance holds or restrictions
}
```

---

## 3. Type-Specific Metadata Schemas

### 3.1 Australian Environmental Certificate (ESC, VEEC, PRC, ACCU, LGC, STC)

```typescript
interface CertificateMetadata {
  // Scheme-specific
  scheme: 'ESS' | 'PDRS' | 'VEU' | 'ERF' | 'RET' | 'SRES';
  schemeAdministrator: string;             // 'IPART' | 'CER' | 'ESC_Victoria'
  activityType?: string;                   // e.g., 'Commercial Lighting', 'Heat Pump', 'HIR', 'Savanna Burning'
  methodologyReference?: string;           // e.g., 'ESS Rule Schedule 3', 'ERF Method: Carbon Credits (Carbon Farming Initiative—Avoided Deforestation 1.1)'
  
  // Certificate-specific
  certificateNumber?: string;              // TESSA/CER certificate number
  accreditedProvider?: string;             // ACP name (for ESC/VEEC)
  projectId?: string;                      // ERF project ID (for ACCU)
  
  // Compliance context
  penaltyRate?: number;                    // Current penalty rate (A$ per certificate shortfall)
  surrenderDeadline?: string;              // Annual surrender deadline
  complianceYear?: string;                 // e.g., '2026'
  
  // Settlement
  settlementMethod: 'registry_transfer';   // All certificates settle via registry transfer
  registryTransferSteps: string[];         // ['Trade Confirmed', 'Transfer Initiated in TESSA', 'Transfer Recorded', 'Settlement Complete']
  estimatedSettlementDays: number;         // Typically 1–3 business days for ESC
}
```

### 3.2 WREI Carbon Credit Token

```typescript
interface WREICarbonTokenMetadata {
  // Verification
  verificationStandards: ('ISO_14064_2' | 'Verra_VCS' | 'Gold_Standard')[];
  wreiVerificationScore: number;           // 0–100 quality score
  wreiPremiumMultiplier: number;           // Currently 1.5x over standard VCM
  
  // Generation source
  generationSource: 'vessel_efficiency' | 'modal_shift' | 'construction_avoidance';
  sourceContributionPct: number;           // Percentage of total credit from this source
  
  // Provenance chain
  provenance: {
    vesselId: string;
    vesselName: string;
    route: string;
    operationalPeriod: {
      start: string;                       // ISO 8601
      end: string;                         // ISO 8601
    };
    energyData: {
      electricConsumption: number;          // kWh/passenger-km (measured)
      dieselBaseline: number;              // kWh/passenger-km (Parramatta Class reference)
      passengersTransported: number;
      routeDistanceKm: number;
    };
    emissionsSavedTonnes: number;          // Verified tonnes CO2e
    baselineMethodology: string;           // Reference to calculation methodology
  };
  
  // Blockchain
  blockchainNetwork: string;               // e.g., 'Hedera' | 'Ethereum' | 'Polygon'
  tokenStandard: string;                   // 'ERC-7518' (Zoniqx DyCIST) | 'CorTenX' | 'Native'
  contractAddress?: string;
  mintTransactionHash: string;
  
  // Yield (accruing model per WR-STR-008)
  yieldModel: 'accruing';                 // NAV-accruing, not distribution
  projectedAnnualYield: number;           // 8% per WR-STR-008
  
  // Retirement
  retirementEligible: boolean;
  retirementPurpose?: string;             // 'Safeguard Mechanism' | 'Voluntary ESG' | 'ISSB S2 Compliance' | 'CORSIA'
  retirementTransactionHash?: string;
  
  // Settlement
  settlementMethod: 'on_chain';
  settlementCycle: 'T+0';
}
```

### 3.3 WREI Asset Co Token

```typescript
interface WREIAssetCoTokenMetadata {
  // Underlying asset
  underlyingAsset: {
    spvName: string;                       // 'Water Roads LeaseCo Pty Ltd'
    assetClass: 'maritime_infrastructure';
    vesselCount: number;
    vesselType: string;                    // 'Candela C-8 Electric Hydrofoil'
    deepPowerUnits: number;
    totalCapex: number;                    // A$473M at scale
  };
  
  // Fractional interest
  totalTokenSupply: number;
  tokenHolderEquity: number;              // A$131M tokenised equity
  fractionPerToken: number;               // 1 / totalTokenSupply
  
  // Yield (distribution model per WR-STR-008)
  yieldModel: 'distribution';             // Periodic distributions
  grossLeaseYield: number;                // 12.9%
  equityYield: number;                    // 28.3%
  distributionFrequency: 'quarterly';
  nextDistributionDate?: string;
  
  // Financial metrics
  annualLeaseIncome: number;              // A$61.1M at steady state
  annualDebtService: number;              // A$23.9M
  netCashFlow: number;                    // A$37.1M
  cashOnCashMultiple: number;             // 3.0x lifetime
  
  // Operational metrics (live from vessel telemetry)
  fleetUtilisation?: number;              // % of available service hours operated
  averagePassengerLoad?: number;          // Average passengers per trip
  operationalRoutes?: number;             // Number of active routes
  
  // Blockchain
  blockchainNetwork: string;
  tokenStandard: string;
  contractAddress?: string;
  
  // Regulatory
  afslRequired: true;                     // Managed investment scheme
  wholesaleOnly: boolean;                 // Initially true (s708 exemption)
  custodian?: string;                     // Institutional custodian name
  
  // Settlement
  settlementMethod: 'on_chain';
  settlementCycle: 'T+0';
  redemptionWindow: 'quarterly';          // Matches lease income cycles
}
```

---

## 4. Lifecycle States

### 4.1 Certificate Lifecycle (ESC, VEEC, ACCU, etc.)

```
Created → Registered → Active → [Listed] → [Under Negotiation] → Traded → Transfer Pending → Transferred → [Surrendered | Voluntarily Retired]
```

| State | Description | Trigger |
|---|---|---|
| Created | Certificate generated from eligible activity | ACP creates via TESSA/CER |
| Registered | Certificate registered in scheme registry, fees paid | Registry confirmation |
| Active | Available for trading | Registration complete |
| Listed | Posted on WREI platform for sale | Seller lists |
| Under Negotiation | AI negotiation in progress | Buyer initiates negotiation |
| Traded | Trade agreed, pending settlement | Negotiation/order completed |
| Transfer Pending | Registry transfer initiated | Settlement process started |
| Transferred | Ownership transferred in registry | Registry confirms transfer |
| Surrendered | Certificate surrendered for compliance | Scheme participant action |
| Voluntarily Retired | Certificate retired for voluntary offset | Holder action |

### 4.2 WREI Carbon Credit Token Lifecycle

```
Data Collected → Verified → Minted → Active → [Listed] → [Under Negotiation] → Traded → Settled → [Retired | Redeemed]
```

| State | Description | Trigger |
|---|---|---|
| Data Collected | Vessel telemetry captured for operational period | Automated data pipeline |
| Verified | WREI verification engine confirms emission savings against baseline | Verification complete |
| Minted | Token minted on blockchain with immutable metadata | Smart contract execution |
| Active | Available for trading | Mint confirmed |
| Listed | Posted on WREI platform for sale | Seller/platform lists |
| Under Negotiation | AI negotiation in progress | Buyer initiates |
| Traded | Trade agreed | Negotiation/order completed |
| Settled | On-chain transfer complete (T+0) | Blockchain confirmation |
| Retired | Permanently retired for compliance/voluntary offset | On-chain retirement |
| Redeemed | Converted to stablecoin/fiat | Redemption request processed |

### 4.3 WREI Asset Co Token Lifecycle

```
SPV Established → Token Designed → Minted → Primary Offering → Active → [Listed] → [Under Negotiation] → Traded → Settled → [Redeemed]
```

| State | Description | Trigger |
|---|---|---|
| SPV Established | LeaseCo SPV legally constituted | Legal process |
| Token Designed | Token parameters set (supply, yield, compliance rules) | Design approval |
| Minted | Tokens minted with compliance controls embedded | Smart contract deployment |
| Primary Offering | Initial distribution to wholesale investors | Offering launch |
| Active | Available for secondary trading | Primary allocation complete |
| Listed | Posted on trading platform | Holder lists for sale |
| Under Negotiation | AI negotiation in progress | Buyer initiates |
| Traded | Trade agreed | Negotiation/order completed |
| Settled | On-chain transfer complete (T+0) | Blockchain confirmation |
| Redeemed | Converted to cash at NAV via quarterly redemption window | Redemption request processed |

---

## 5. Pricing Mechanics

### 5.1 Conflict Resolution — Existing Codebase vs. Market Reality

**Conflict identified:** The current codebase (`negotiation-config.ts`) uses pricing parameters that were set for the demo environment and do not reflect actual market prices for the instruments the platform will now trade.

| Parameter | Current Codebase Value | Actual Market / Strategy Value | Resolution |
|---|---|---|---|
| Anchor price | A$150 (generic demo) | ESC: ~A$23 / WREI-CC: A$28.12 / WREI-ACO: per token NAV | Replace with per-instrument pricing configuration |
| Price floor | A$120 (generic demo) | ESC: determined by creation cost (~A$15–18) / WREI-CC: A$22.80 (1.5× dMRV minimum) | Per-instrument floors |
| Max concession per round | 5% (generic) | Should vary by instrument and counterparty type | Per-persona and per-instrument configuration |
| VCM spot reference | A$8.45 | Current VCM spot (volatile, needs live feed) | Connect to live feed, fall back to cached |
| WREI premium | 1.85× | WR-STR-008 specifies 1.5× as the base premium | **Conflict: codebase uses 1.85× but strategy docs use 1.5×. Recommend aligning to 1.5× per WR-STR-008. Jeff to confirm.** |

**Recommended action:** Replace the single pricing configuration with a per-instrument pricing engine.

### 5.2 Per-Instrument Pricing Configuration

```typescript
interface InstrumentPricingConfig {
  instrumentType: InstrumentType;
  
  // Reference pricing
  spotPriceSource: 'live_feed' | 'scraped' | 'manual' | 'simulated';
  spotPriceFeedUrl?: string;               // API endpoint for live pricing
  spotPriceUpdateInterval: number;         // Seconds between updates
  fallbackPrice: number;                   // Used when feed unavailable
  
  // Negotiation parameters
  anchorPrice: number;                     // Starting price for AI negotiation
  anchorMethod: 'spot' | 'fixed' | 'premium_over_spot';
  premiumMultiplier?: number;              // For WREI tokens: 1.5× over reference
  priceFloor: number;                      // Minimum acceptable price
  priceCeiling: number;                    // Maximum price (for buyer protection)
  maxConcessionPerRound: number;           // Percentage
  maxTotalConcession: number;              // Percentage from anchor
  
  // Penalty/reference thresholds (for compliance instruments)
  penaltyRate?: number;                    // ESC/VEEC penalty rate (ceiling reference)
  
  // Volume pricing
  volumeDiscountThresholds?: {
    quantity: number;
    discountPct: number;
  }[];
}
```

### 5.3 ESC Pricing Configuration (Illustrative)

```typescript
const ESC_PRICING: InstrumentPricingConfig = {
  instrumentType: 'ESC',
  spotPriceSource: 'scraped',              // Ecovantage/Northmore Gordon
  spotPriceUpdateInterval: 86400,          // Daily
  fallbackPrice: 23.00,                    // Current spot ~A$23
  anchorPrice: 23.00,
  anchorMethod: 'spot',
  priceFloor: 18.00,                       // Below creation cost, unlikely
  priceCeiling: 29.48,                     // 2026 penalty rate (IPART)
  maxConcessionPerRound: 3,                // Tighter than demo (ESC is a smaller-value instrument)
  maxTotalConcession: 10,
  penaltyRate: 29.48,                      // IPART 2026 penalty rate
  volumeDiscountThresholds: [
    { quantity: 50000, discountPct: 1 },
    { quantity: 100000, discountPct: 2 },
    { quantity: 500000, discountPct: 3.5 },
  ],
};
```

---

## 6. Agentic Negotiation Interaction

### 6.1 How Instruments Interact with the AI Negotiator

The agentic negotiation engine needs instrument-aware behaviour. The AI agent must understand the specific characteristics, market dynamics, and compliance context of whatever instrument is being traded.

**Instrument context injection:** When a negotiation session starts, the platform injects the instrument's full metadata, pricing configuration, and relevant market context into the Claude Opus 4 system prompt. This replaces the current generic system prompt with instrument-specific trading intelligence.

**Per-instrument negotiation strategies:**

| Instrument | Negotiation Style | Key Considerations |
|---|---|---|
| ESC | Price-anchored bilateral | Penalty rate as ceiling, creation cost as floor, vintage matters, compliance deadline urgency creates leverage |
| VEEC | Similar to ESC | Higher value (~A$83), scheme target changes critical, activity type affects quality perception |
| ACCU | Method-aware | Price varies significantly by method type (HIR vs. savanna vs. energy efficiency), co-benefits (Indigenous, biodiversity) command premium |
| WREI-CC | Premium-justified | Must articulate WREI verification premium credibly, reference dMRV benchmarks, provenance depth as value driver |
| WREI-ACO | Yield-focused | Negotiation around yield expectations, NAV discount/premium, redemption terms, comparable infrastructure yields |

### 6.2 Negotiation State Extension

The existing `NegotiationState` interface needs extension to carry instrument context:

```typescript
interface TradingNegotiationState extends NegotiationState {
  instrument: Instrument;                  // Full instrument being traded
  instrumentPricing: InstrumentPricingConfig;
  marketContext: {
    spotPrice: number;
    spotTrend: 'rising' | 'falling' | 'stable';
    volumeAvailable: number;
    daysToSurrenderDeadline?: number;       // For compliance instruments
    penaltyExposure?: number;               // Buyer's penalty risk in A$
    recentComparableTradePrice?: number;
  };
  settlementPreferences: {
    method: 'registry_transfer' | 'on_chain';
    urgency: 'immediate' | 'standard' | 'flexible';
    paymentTerms: string;                  // e.g., 'T+1', 'Net 30'
  };
}
```

---

## 7. Settlement Adapter Specification

Each instrument type settles differently. The platform abstracts this behind a `SettlementAdapter` interface.

```typescript
interface SettlementAdapter {
  // Initiate settlement for a completed trade
  initiateSettlement(trade: CompletedTrade): Promise<SettlementRecord>;
  
  // Check settlement status
  getSettlementStatus(settlementId: string): Promise<SettlementStatus>;
  
  // Confirm settlement complete
  confirmSettlement(settlementId: string): Promise<SettlementConfirmation>;
  
  // Cancel/reverse settlement (if possible)
  cancelSettlement(settlementId: string): Promise<CancellationResult>;
}
```

### 7.1 Settlement Adapters Required

| Adapter | Instruments | Settlement Mechanism | Initial Implementation |
|---|---|---|---|
| `TessaSettlementAdapter` | ESC, PRC | Manual TESSA registry transfer; platform generates transfer instructions and tracks confirmation | Simulated (with manual confirmation step) |
| `CerSettlementAdapter` | ACCU, SMC, LGC, STC | CER Unit & Certificate Registry API (CorTenX); target live integration | Simulated (with CorTenX API stub) |
| `VeecSettlementAdapter` | VEEC | ESC Victoria registry transfer | Simulated (mirrors TESSA pattern) |
| `BlockchainSettlementAdapter` | WREI-CC, WREI-ACO | On-chain atomic settlement (T+0) | Simulated (with transaction hash generation) |
| `ZoniqxSettlementAdapter` | WREI-CC, WREI-ACO (optional) | Zoniqx zConnect settlement | Stubbed API contracts only |
| `CortenxSettlementAdapter` | Any (optional) | Trovio CorTenX sub-registry | Stubbed API contracts only |

---

## 8. Compliance Integration Points

### 8.1 Per-Instrument Compliance Rules

```typescript
interface ComplianceRules {
  instrumentType: InstrumentType;
  
  // Trading eligibility
  requiresKYC: boolean;
  requiresAFSL: boolean;
  wholesaleOnly: boolean;
  
  // Transaction limits
  maxSingleTradeValue?: number;            // A$ threshold triggering additional checks
  maxDailyVolume?: number;
  
  // Reporting
  reportingObligations: {
    authority: string;                     // 'ASIC' | 'AUSTRAC' | 'IPART' | 'CER'
    reportType: string;
    frequency: string;
    threshold?: number;                    // Trigger threshold
  }[];
  
  // AI disclosure
  aiNegotiationDisclosure: boolean;        // Must disclose AI involvement
  aiDisclosureText: string;               // Standard disclosure wording
}
```

### 8.2 AI Disclosure Requirement

All instrument types traded via agentic negotiation must carry the following disclosure:

> "This trade was negotiated with the assistance of an AI-powered negotiation agent. The agent operates within defined price and volume constraints set by the platform and/or the counterparty. All negotiation transcripts are recorded and available for audit."

This disclosure appears on trade confirmations, settlement documents, and in the audit trail.

---

## 9. Conflicts with Existing Documents — Resolution Required

| # | Conflict | Source A | Source B | Recommended Resolution | Jeff Decision Required |
|---|---|---|---|---|---|
| 1 | WREI premium multiplier | Codebase: 1.85× | WR-STR-008: 1.5× | Align to 1.5× per strategy document | Yes |
| 2 | Anchor price | Codebase: A$150 | ESC market: ~A$23 | Replace with per-instrument pricing | Confirm approach |
| 3 | Carbon token yield | Codebase: 8% | Practical Paper: variable (carbon price dependent) | Use 8% as projection, clearly label as "projected" not "guaranteed" | Confirm |
| 4 | Asset co token yield | Codebase: 28.3% | Practical Paper: 28.3% equity yield | Consistent — no conflict | N/A |
| 5 | Token standard | Codebase: Zoniqx DyCIST/ERC-7518 | WP1/Direction: flexibility across Zoniqx, CorTenX, and built-in-house | Make token standard configurable, not hard-coded | Confirm approach |
| 6 | Settlement cycle | Codebase: not specified | Strategy: T+0 for tokens, T+1–3 for certificates | Per-instrument settlement configuration | Confirm |

---

## 10. Implementation Notes

### 10.1 Database Schema Implications

The instrument taxonomy requires the following Vercel Postgres tables (minimum):

- `instruments` — base instrument records with type-specific metadata in JSONB columns
- `trades` — trade records linking buyer, seller, instrument, price, quantity, status
- `negotiations` — AI negotiation session records with full transcript
- `settlements` — settlement tracking per trade
- `audit_log` — immutable audit trail of all platform actions
- `pricing_config` — per-instrument pricing configurations
- `compliance_records` — regulatory reporting and compliance tracking

### 10.2 Existing Codebase Alignment

The existing `CarbonCreditToken` interface in `lib/types.ts` aligns well with the `WREICarbonTokenMetadata` schema defined here. The primary addition is the `Instrument` base interface and the certificate-specific schemas for ESC/VEEC/ACCU trading. The refactoring required is additive rather than destructive — the existing type system is extended, not replaced.

---

*This document is prepared for Jeff's review. Items marked "Jeff Decision Required" in §9 need resolution before implementation.*
