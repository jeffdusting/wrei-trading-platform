/**
 * WREI Trading Platform - Demo Mode State Manager
 *
 * Centralized state management for demo mode functionality
 * Provides guided tours, pre-populated data, and presentation modes
 */

import { create } from 'zustand';
import {
  NSW_ESC_MARKET_CONTEXT,
  CER_COMPLIANCE_FRAMEWORK,
  NORTHMORE_GORDON_CONTEXT,
  ESC_DEMO_SCENARIOS,
  type ESCDemoScenario,
  getCurrentESCMarketContext,
  getNorthmoreGordonValueProp
} from './esc-market-context';

export type DemoTourType =
  | 'executive-overview'
  | 'investor-deep-dive'
  | 'technical-integration'
  | 'compliance-walkthrough'
  | 'carbon-negotiation'
  | 'portfolio-analytics'
  // NSW ESC-specific tours
  | 'nsw-esc-executive'
  | 'nsw-esc-technical'
  | 'nsw-esc-compliance'
  | 'northmore-gordon-overview';

export type PresentationMode = 'guided' | 'self-service' | 'investor-briefing';

export interface DemoStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  highlightElement?: string;
  action?: 'click' | 'hover' | 'scroll' | 'wait';
  duration?: number;
  skipable?: boolean;
  data?: Record<string, any>;
}

export interface DemoTour {
  id: DemoTourType;
  name: string;
  description: string;
  duration: number; // minutes
  track: 'investor' | 'technical' | 'compliance' | 'executive';
  steps: DemoStep[];
  prerequisites: string[];
  outcomes: string[];
  targetAudience: string;
}

export interface DemoDataSet {
  investorProfile: any;
  marketData: any;
  negotiationHistory: any[];
  portfolioData: any;
  complianceData: any;
  analyticsData: any;
  // NSW ESC-specific data
  escMarketContext?: typeof NSW_ESC_MARKET_CONTEXT;
  escScenarios?: Record<string, ESCDemoScenario>;
  northmoreGordonContext?: typeof NORTHMORE_GORDON_CONTEXT;
}

export interface DemoProgressTracker {
  tourStartTime: number;
  completedSteps: string[];
  currentStepStartTime: number;
  interactions: DemoInteraction[];
  sessionId: string;
}

export interface DemoInteraction {
  timestamp: number;
  type: 'step_complete' | 'skip' | 'click' | 'form_submit' | 'navigation';
  stepId?: string;
  data?: any;
}

export interface DemoSessionMetrics {
  totalDuration: number;
  engagementScore: number;
  completionRate: number;
  dropOffPoints: string[];
  feedbackProvided: boolean;
}

export interface DemoModeState {
  // Core state
  isActive: boolean;
  currentTour: DemoTourType | null;
  tourStep: number;
  presentationMode: PresentationMode;

  // Data and progress
  prePopulatedData: DemoDataSet | null;
  userProgress: DemoProgressTracker | null;
  sessionMetrics: DemoSessionMetrics | null;

  // UI state
  showTourOverlay: boolean;
  highlightedElement: string | null;
  tourDirection: 'next' | 'prev' | 'skip';

  // Actions
  activateDemo: (mode?: PresentationMode) => void;
  deactivateDemo: () => void;
  startTour: (tourType: DemoTourType) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  setPrePopulatedData: (data: DemoDataSet) => void;
  trackInteraction: (interaction: Omit<DemoInteraction, 'timestamp'>) => void;
  updateSessionMetrics: (metrics: Partial<DemoSessionMetrics>) => void;

  // NSW ESC-specific actions
  loadESCMarketContext: () => void;
  selectESCScenario: (scenarioId: string) => void;
  configureNorthmoreGordonBranding: () => void;

  // Helpers
  getCurrentStep: () => DemoStep | null;
  getTourProgress: () => number;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  isStepCompleted: (stepId: string) => boolean;
  getESCDemoData: () => any;
  getNorthmoreGordonContext: () => typeof NORTHMORE_GORDON_CONTEXT;
}

// Tour definitions
export const DEMO_TOURS: Record<DemoTourType, DemoTour> = {
  'executive-overview': {
    id: 'executive-overview',
    name: 'Executive Overview',
    description: 'High-level platform capabilities and value proposition',
    duration: 12,
    track: 'executive',
    targetAudience: 'C-suite executives, fund managers',
    prerequisites: [],
    outcomes: ['Understanding of platform value', 'Market opportunity clarity', 'Next steps identified'],
    steps: [
      {
        id: 'landing-value-prop',
        title: 'Platform Value Proposition',
        description: 'WREI transforms carbon credits into yield-generating infrastructure assets',
        targetElement: '[data-demo="value-proposition"]',
        duration: 60
      },
      {
        id: 'market-context',
        title: 'Live Market Data',
        description: 'Real-time WREI Pricing Index vs traditional carbon markets',
        targetElement: '[data-demo="market-data"]',
        duration: 90
      },
      {
        id: 'ai-negotiation-preview',
        title: 'AI Negotiation Engine',
        description: 'Institutional-grade AI that understands complex requirements',
        targetElement: '[data-demo="negotiation-preview"]',
        duration: 120
      },
      {
        id: 'compliance-overview',
        title: 'Regulatory Compliance',
        description: 'Automated AFSL and multi-jurisdiction compliance',
        targetElement: '[data-demo="compliance-overview"]',
        duration: 90
      },
      {
        id: 'settlement-infrastructure',
        title: 'T+0 Settlement',
        description: 'Zoniqx zConnect atomic settlement and blockchain provenance',
        targetElement: '[data-demo="settlement-overview"]',
        duration: 60
      },
      {
        id: 'investment-case',
        title: 'Investment Case',
        description: '28.3% equity yields with infrastructure asset backing',
        targetElement: '[data-demo="investment-case"]',
        duration: 90
      }
    ]
  },

  'investor-deep-dive': {
    id: 'investor-deep-dive',
    name: 'Investor Deep Dive',
    description: 'Comprehensive institutional investor experience',
    duration: 18,
    track: 'investor',
    targetAudience: 'Portfolio managers, institutional investors',
    prerequisites: [],
    outcomes: ['Full platform experience', 'Portfolio integration clarity', 'Due diligence materials'],
    steps: [
      {
        id: 'institutional-onboarding',
        title: 'Institutional Onboarding',
        description: 'AFSL-compliant investor classification and KYC/AML verification',
        targetElement: '[data-demo="onboarding-start"]',
        duration: 180
      },
      {
        id: 'portfolio-configuration',
        title: 'Portfolio Configuration',
        description: 'Configure investment preferences and constraints',
        targetElement: '[data-demo="portfolio-config"]',
        duration: 120
      },
      {
        id: 'full-negotiation',
        title: 'Live AI Negotiation',
        description: 'Complete negotiation scenario with Margaret Richardson persona',
        targetElement: '[data-demo="negotiation-interface"]',
        duration: 480
      },
      {
        id: 'advanced-analytics',
        title: 'Portfolio Analytics',
        description: 'Monte Carlo optimization and risk-adjusted returns',
        targetElement: '[data-demo="analytics-suite"]',
        duration: 240
      },
      {
        id: 'compliance-reporting',
        title: 'Compliance Reporting',
        description: 'Automated ESG reporting and regulatory documentation',
        targetElement: '[data-demo="compliance-reports"]',
        duration: 120
      },
      {
        id: 'integration-options',
        title: 'Portfolio Integration',
        description: 'API integration and existing system connectivity',
        targetElement: '[data-demo="integration-overview"]',
        duration: 120
      }
    ]
  },

  'technical-integration': {
    id: 'technical-integration',
    name: 'Technical Integration',
    description: 'Developer-focused API and infrastructure demonstration',
    duration: 15,
    track: 'technical',
    targetAudience: 'CTOs, developers, system architects',
    prerequisites: [],
    outcomes: ['API understanding', 'Integration clarity', 'Technical requirements'],
    steps: [
      {
        id: 'api-explorer',
        title: 'Interactive API Explorer',
        description: 'Live API endpoints with authentication and testing',
        targetElement: '[data-demo="api-explorer"]',
        duration: 240
      },
      {
        id: 'blockchain-provenance',
        title: 'Blockchain Infrastructure',
        description: 'Zoniqx zProtocol tokenisation and settlement architecture',
        targetElement: '[data-demo="blockchain-viz"]',
        duration: 180
      },
      {
        id: 'real-time-data',
        title: 'Real-time Data Feeds',
        description: 'Market data integration and WebSocket connections',
        targetElement: '[data-demo="data-feeds"]',
        duration: 120
      },
      {
        id: 'performance-monitoring',
        title: 'System Performance',
        description: 'Infrastructure monitoring and system health dashboards',
        targetElement: '[data-demo="performance-dashboard"]',
        duration: 120
      },
      {
        id: 'sdk-documentation',
        title: 'Developer Resources',
        description: 'SDKs, documentation, and integration examples',
        targetElement: '[data-demo="developer-resources"]',
        duration: 90
      },
      {
        id: 'scalability-demo',
        title: 'Scalability Architecture',
        description: 'Load testing results and infrastructure scalability',
        targetElement: '[data-demo="scalability-overview"]',
        duration: 90
      }
    ]
  },

  'compliance-walkthrough': {
    id: 'compliance-walkthrough',
    name: 'Compliance Walkthrough',
    description: 'Regulatory compliance and risk management focus',
    duration: 14,
    track: 'compliance',
    targetAudience: 'Compliance officers, legal teams, risk managers',
    prerequisites: [],
    outcomes: ['Regulatory clarity', 'Risk assessment', 'Audit documentation'],
    steps: [
      {
        id: 'regulatory-mapping',
        title: 'Multi-Jurisdiction Compliance',
        description: 'Automated compliance across 23+ jurisdictions',
        targetElement: '[data-demo="regulatory-map"]',
        duration: 180
      },
      {
        id: 'afsl-compliance',
        title: 'AFSL Compliance',
        description: 'Australian Financial Services Licence compliance automation',
        targetElement: '[data-demo="afsl-compliance"]',
        duration: 150
      },
      {
        id: 'kyc-aml-workflow',
        title: 'KYC/AML Verification',
        description: 'Institutional identity verification and risk assessment',
        targetElement: '[data-demo="kyc-workflow"]',
        duration: 180
      },
      {
        id: 'esg-reporting',
        title: 'ESG Reporting',
        description: 'ISSB S2 aligned impact measurement and reporting',
        targetElement: '[data-demo="esg-reports"]',
        duration: 120
      },
      {
        id: 'audit-trails',
        title: 'Audit Documentation',
        description: 'Comprehensive audit trails and regulatory documentation',
        targetElement: '[data-demo="audit-trails"]',
        duration: 120
      },
      {
        id: 'risk-assessment',
        title: 'Risk Management',
        description: 'Automated risk assessment and monitoring systems',
        targetElement: '[data-demo="risk-dashboard"]',
        duration: 90
      }
    ]
  },

  'carbon-negotiation': {
    id: 'carbon-negotiation',
    name: 'Carbon Credit Negotiation',
    description: 'Focused AI negotiation demonstration',
    duration: 8,
    track: 'investor',
    targetAudience: 'Carbon traders, portfolio managers',
    prerequisites: [],
    outcomes: ['AI capabilities understanding', 'Pricing strategy clarity', 'Settlement process'],
    steps: [
      {
        id: 'market-context-setup',
        title: 'Market Context',
        description: 'WREI Pricing Index and competitive landscape',
        targetElement: '[data-demo="market-context"]',
        duration: 60
      },
      {
        id: 'persona-selection',
        title: 'Buyer Persona',
        description: 'Select institutional buyer type for negotiation',
        targetElement: '[data-demo="persona-selector"]',
        duration: 30
      },
      {
        id: 'live-negotiation',
        title: 'AI Negotiation',
        description: 'Live negotiation with real-time strategy explanations',
        targetElement: '[data-demo="negotiation-chat"]',
        duration: 300
      },
      {
        id: 'pricing-analysis',
        title: 'Pricing Strategy',
        description: 'AI pricing decisions and market positioning',
        targetElement: '[data-demo="pricing-analysis"]',
        duration: 90
      },
      {
        id: 'settlement-demo',
        title: 'T+0 Settlement',
        description: 'Atomic settlement and blockchain confirmation',
        targetElement: '[data-demo="settlement-process"]',
        duration: 60
      }
    ]
  },

  'portfolio-analytics': {
    id: 'portfolio-analytics',
    name: 'Portfolio Analytics Suite',
    description: 'Advanced analytics and reporting capabilities',
    duration: 10,
    track: 'investor',
    targetAudience: 'Portfolio managers, analysts, quantitative researchers',
    prerequisites: [],
    outcomes: ['Analytics capabilities', 'Risk modeling understanding', 'Reporting options'],
    steps: [
      {
        id: 'portfolio-overview',
        title: 'Portfolio Dashboard',
        description: 'Real-time portfolio performance and allocation views',
        targetElement: '[data-demo="portfolio-dashboard"]',
        duration: 90
      },
      {
        id: 'monte-carlo-modeling',
        title: 'Monte Carlo Analysis',
        description: 'Advanced scenario modeling and risk simulation',
        targetElement: '[data-demo="monte-carlo"]',
        duration: 120
      },
      {
        id: 'esg-impact-measurement',
        title: 'ESG Impact Metrics',
        description: 'Quantified environmental and social impact reporting',
        targetElement: '[data-demo="esg-metrics"]',
        duration: 120
      },
      {
        id: 'competitive-analysis',
        title: 'Market Positioning',
        description: 'Competitive benchmarking and market intelligence',
        targetElement: '[data-demo="competitive-analysis"]',
        duration: 90
      },
      {
        id: 'risk-attribution',
        title: 'Risk Attribution',
        description: 'Factor-based risk analysis and attribution reporting',
        targetElement: '[data-demo="risk-attribution"]',
        duration: 90
      },
      {
        id: 'export-reporting',
        title: 'Professional Reports',
        description: 'Multi-format export and custom report generation',
        targetElement: '[data-demo="export-suite"]',
        duration: 90
      }
    ]
  },

  // =============================================================================
  // NSW ESC-SPECIFIC DEMO TOURS (Stage 1, Step 1.1 Implementation)
  // =============================================================================

  'nsw-esc-executive': {
    id: 'nsw-esc-executive',
    name: 'NSW ESC Executive Overview',
    description: 'Executive-level demonstration of NSW Energy Savings Certificates trading capabilities',
    duration: 14,
    track: 'executive',
    targetAudience: 'C-suite executives, fund managers focusing on NSW ESC market',
    prerequisites: [],
    outcomes: ['NSW ESC market understanding', 'Northmore Gordon value proposition', 'ROI metrics for ESC trading'],
    steps: [
      {
        id: 'nsw-esc-market-overview',
        title: 'NSW ESC Market Overview',
        description: 'A$200M+ annual market with 850+ active participants and regulatory framework',
        targetElement: '[data-demo="nsw-esc-market-overview"]',
        duration: 120,
        data: {
          market_size: NSW_ESC_MARKET_CONTEXT.MARKET_SIZE,
          participants: NSW_ESC_MARKET_CONTEXT.PARTICIPANTS
        }
      },
      {
        id: 'northmore-gordon-position',
        title: 'Northmore Gordon Market Position',
        description: '12% market share with AFSL credentials and institutional client base',
        targetElement: '[data-demo="northmore-gordon-position"]',
        duration: 90,
        data: NORTHMORE_GORDON_CONTEXT.MARKET_POSITION
      },
      {
        id: 'ai-negotiation-benefits',
        title: 'AI Negotiation ROI',
        description: '15-25% pricing improvement and 40% compliance cost reduction',
        targetElement: '[data-demo="ai-negotiation-benefits"]',
        duration: 120,
        data: getNorthmoreGordonValueProp('executive')
      },
      {
        id: 'live-esc-pricing',
        title: 'Live ESC Market Data',
        description: 'Real-time AEMO pricing: A$47.80 spot, A$52.15 forward curve',
        targetElement: '[data-demo="live-esc-pricing"]',
        duration: 60,
        data: getCurrentESCMarketContext()
      },
      {
        id: 'compliance-automation',
        title: 'Regulatory Compliance Automation',
        description: 'Clean Energy Regulator compliance with automated audit trails',
        targetElement: '[data-demo="compliance-automation"]',
        duration: 90,
        data: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS
      },
      {
        id: 'executive-esc-negotiation',
        title: 'Executive ESC Negotiation Demo',
        description: 'Live negotiation: 500K ESC portfolio acquisition scenario',
        targetElement: '[data-demo="executive-esc-negotiation"]',
        duration: 240,
        data: ESC_DEMO_SCENARIOS.EXECUTIVE_HIGH_VOLUME
      },
      {
        id: 'investment-case-esc',
        title: 'NSW ESC Investment Case',
        description: 'Portfolio benefits and institutional-grade settlement infrastructure',
        targetElement: '[data-demo="investment-case-esc"]',
        duration: 120,
        data: {
          roi_metrics: (getNorthmoreGordonValueProp('executive') as any).roi_metrics,
          competitive_advantages: NORTHMORE_GORDON_CONTEXT.MARKET_POSITION.competitive_advantages
        }
      }
    ]
  },

  'nsw-esc-technical': {
    id: 'nsw-esc-technical',
    name: 'NSW ESC Technical Integration',
    description: 'Technical deep dive into NSW ESC trading system architecture and APIs',
    duration: 16,
    track: 'technical',
    targetAudience: 'CTOs, system architects, integration teams',
    prerequisites: [],
    outcomes: ['Technical architecture understanding', 'API integration clarity', 'NSW ESC data flows'],
    steps: [
      {
        id: 'esc-api-architecture',
        title: 'NSW ESC API Architecture',
        description: 'Real-time AEMO data feeds and CER registry integration',
        targetElement: '[data-demo="esc-api-architecture"]',
        duration: 150,
        data: {
          data_sources: ['AEMO', 'NSW ESC Registry', 'IPART', 'CER'],
          update_frequency: '15-minute intervals',
          api_specs: (getNorthmoreGordonValueProp('technical') as any).technical_specs
        }
      },
      {
        id: 'cer-compliance-integration',
        title: 'Clean Energy Regulator Integration',
        description: 'Automated CER compliance checking and audit trail generation',
        targetElement: '[data-demo="cer-compliance-integration"]',
        duration: 180,
        data: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_VALIDATION
      },
      {
        id: 'esc-data-flows',
        title: 'ESC Data Flow Architecture',
        description: 'Real-time market data processing and validation workflows',
        targetElement: '[data-demo="esc-data-flows"]',
        duration: 120,
        data: {
          data_flow: 'AEMO -> Validation -> Pricing Engine -> AI Negotiator',
          latency: 'Sub-50ms response times',
          throughput: '10,000 transactions/second'
        }
      },
      {
        id: 'live-technical-negotiation',
        title: 'Technical ESC Negotiation Demo',
        description: 'API-driven negotiation with real-time system integration',
        targetElement: '[data-demo="live-technical-negotiation"]',
        duration: 300,
        data: ESC_DEMO_SCENARIOS.TECHNICAL_INTEGRATION
      },
      {
        id: 'blockchain-settlement-esc',
        title: 'ESC Blockchain Settlement',
        description: 'Zoniqx zProtocol integration for T+0 atomic settlement',
        targetElement: '[data-demo="blockchain-settlement-esc"]',
        duration: 150,
        data: {
          protocol: 'Zoniqx zProtocol (DyCIST / ERC-7518)',
          settlement_time: 'T+0 atomic',
          security: 'CertiK audited smart contracts'
        }
      },
      {
        id: 'monitoring-alerting',
        title: 'System Monitoring & Alerting',
        description: 'Real-time system health and compliance monitoring dashboards',
        targetElement: '[data-demo="monitoring-alerting"]',
        duration: 90,
        data: {
          uptime_sla: '99.9% with automated failover',
          monitoring: 'Comprehensive system and compliance metrics',
          alerts: 'Real-time regulatory and system notifications'
        }
      }
    ]
  },

  'nsw-esc-compliance': {
    id: 'nsw-esc-compliance',
    name: 'NSW ESC Compliance Walkthrough',
    description: 'Comprehensive demonstration of Clean Energy Regulator compliance capabilities',
    duration: 18,
    track: 'compliance',
    targetAudience: 'Compliance officers, legal teams, risk managers, auditors',
    prerequisites: [],
    outcomes: ['CER compliance understanding', 'Audit trail capabilities', 'Risk management validation'],
    steps: [
      {
        id: 'cer-regulatory-framework',
        title: 'Clean Energy Regulator Framework',
        description: 'Complete overview of CER compliance requirements for NSW ESC trading',
        targetElement: '[data-demo="cer-regulatory-framework"]',
        duration: 180,
        data: {
          authority: CER_COMPLIANCE_FRAMEWORK.AUTHORITY,
          requirements: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS,
          penalties: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_REQUIREMENTS.MARKET_INTEGRITY.penalties
        }
      },
      {
        id: 'automated-compliance-checking',
        title: 'Automated Compliance Validation',
        description: 'Real-time CER compliance checking and certificate verification',
        targetElement: '[data-demo="automated-compliance-checking"]',
        duration: 150,
        data: CER_COMPLIANCE_FRAMEWORK.COMPLIANCE_VALIDATION.REAL_TIME_CHECKS
      },
      {
        id: 'audit-trail-generation',
        title: 'Comprehensive Audit Trails',
        description: 'Automated evidence collection and regulatory documentation',
        targetElement: '[data-demo="audit-trail-generation"]',
        duration: 120,
        data: {
          record_retention: '7 years as per CER requirements',
          audit_automation: 'Automated evidence collection',
          reporting: 'Real-time compliance reporting'
        }
      },
      {
        id: 'high-risk-scenario',
        title: 'High-Risk Certificate Assessment',
        description: 'Due diligence demonstration for potentially fraudulent ESCs',
        targetElement: '[data-demo="high-risk-scenario"]',
        duration: 360,
        data: ESC_DEMO_SCENARIOS.COMPLIANCE_AUDIT
      },
      {
        id: 'aml-ctf-integration',
        title: 'AML/CTF Compliance',
        description: 'AUSTRAC integration and suspicious activity monitoring',
        targetElement: '[data-demo="aml-ctf-integration"]',
        duration: 150,
        data: {
          austrac_integration: 'Real-time AML/CTF screening',
          monitoring: 'Automated pattern detection',
          reporting: 'Suspicious activity reporting'
        }
      },
      {
        id: 'regulatory-reporting',
        title: 'Regulatory Reporting Suite',
        description: 'Automated CER reporting and compliance documentation generation',
        targetElement: '[data-demo="regulatory-reporting"]',
        duration: 120,
        data: {
          quarterly_returns: 'Automated quarterly compliance returns',
          annual_statements: 'Annual compliance statement generation',
          ad_hoc_reporting: 'On-demand regulatory report generation'
        }
      }
    ]
  },

  'northmore-gordon-overview': {
    id: 'northmore-gordon-overview',
    name: 'Northmore Gordon Firm Overview',
    description: 'Comprehensive firm capabilities and competitive positioning demonstration',
    duration: 12,
    track: 'executive',
    targetAudience: 'Prospective clients, business development, competitive analysis',
    prerequisites: [],
    outcomes: ['Firm capability understanding', 'Competitive differentiation clarity', 'Service offering details'],
    steps: [
      {
        id: 'firm-profile-overview',
        title: 'Northmore Gordon Firm Profile',
        description: 'Established 1985, AFSL 246896, specialising in carbon credit trading',
        targetElement: '[data-demo="firm-profile"]',
        duration: 90,
        data: NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE
      },
      {
        id: 'market-position-analysis',
        title: 'Market Position & Client Base',
        description: '12% NSW ESC market share with 83 institutional clients',
        targetElement: '[data-demo="market-position"]',
        duration: 120,
        data: NORTHMORE_GORDON_CONTEXT.MARKET_POSITION
      },
      {
        id: 'service-offerings-demo',
        title: 'Comprehensive Service Offerings',
        description: 'Advisory, trading, and technology platform capabilities',
        targetElement: '[data-demo="service-offerings"]',
        duration: 180,
        data: NORTHMORE_GORDON_CONTEXT.SERVICE_OFFERINGS
      },
      {
        id: 'competitive-advantages',
        title: 'Competitive Differentiation',
        description: 'AI-powered trading, institutional settlement, regulatory expertise',
        targetElement: '[data-demo="competitive-advantages"]',
        duration: 150,
        data: {
          advantages: NORTHMORE_GORDON_CONTEXT.MARKET_POSITION.competitive_advantages,
          technology: NORTHMORE_GORDON_CONTEXT.SERVICE_OFFERINGS.TECHNOLOGY_PLATFORM
        }
      },
      {
        id: 'client-testimonials',
        title: 'Client Success Stories',
        description: 'Case studies and client testimonials across audience types',
        targetElement: '[data-demo="client-testimonials"]',
        duration: 120,
        data: {
          executive_success: 'Portfolio optimization case study',
          technical_success: 'API integration case study',
          compliance_success: 'Regulatory audit success story'
        }
      },
      {
        id: 'future-roadmap',
        title: 'Innovation Roadmap',
        description: 'Future platform enhancements and market expansion plans',
        targetElement: '[data-demo="future-roadmap"]',
        duration: 90,
        data: {
          ai_enhancements: 'Advanced AI negotiation capabilities',
          market_expansion: 'Multi-jurisdiction carbon credit support',
          technology_upgrades: 'Next-generation blockchain infrastructure'
        }
      }
    ]
  }
};

// Create the demo mode store
export const useDemoMode = create<DemoModeState>((set, get) => ({
  // Initial state
  isActive: false,
  currentTour: null,
  tourStep: 0,
  presentationMode: 'self-service',
  prePopulatedData: null,
  userProgress: null,
  sessionMetrics: null,
  showTourOverlay: false,
  highlightedElement: null,
  tourDirection: 'next',

  // Actions
  activateDemo: (mode = 'self-service') => {
    const sessionId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({
      isActive: true,
      presentationMode: mode,
      userProgress: {
        tourStartTime: Date.now(),
        completedSteps: [],
        currentStepStartTime: Date.now(),
        interactions: [],
        sessionId
      },
      sessionMetrics: {
        totalDuration: 0,
        engagementScore: 0,
        completionRate: 0,
        dropOffPoints: [],
        feedbackProvided: false
      }
    });
  },

  deactivateDemo: () => {
    const state = get();
    if (state.userProgress && state.sessionMetrics) {
      // Calculate final metrics
      const totalDuration = Date.now() - state.userProgress.tourStartTime;
      const completionRate = state.currentTour ?
        state.userProgress.completedSteps.length / DEMO_TOURS[state.currentTour].steps.length : 0;

      set(state => ({
        ...state,
        sessionMetrics: {
          ...state.sessionMetrics!,
          totalDuration,
          completionRate
        }
      }));
    }

    // Reset state
    set({
      isActive: false,
      currentTour: null,
      tourStep: 0,
      prePopulatedData: null,
      userProgress: null,
      showTourOverlay: false,
      highlightedElement: null,
      tourDirection: 'next'
    });
  },

  startTour: (tourType: DemoTourType) => {
    const tour = DEMO_TOURS[tourType];
    if (!tour) return;

    set(state => ({
      currentTour: tourType,
      tourStep: 0,
      showTourOverlay: true,
      userProgress: state.userProgress ? {
        ...state.userProgress,
        currentStepStartTime: Date.now()
      } : null
    }));

    // Track tour start
    get().trackInteraction({
      type: 'step_complete',
      stepId: 'tour_start',
      data: { tourType, tourName: tour.name }
    });
  },

  endTour: () => {
    const state = get();
    if (state.currentTour && state.userProgress) {
      const tour = DEMO_TOURS[state.currentTour];
      const completionRate = state.userProgress.completedSteps.length / tour.steps.length;

      get().trackInteraction({
        type: 'step_complete',
        stepId: 'tour_end',
        data: { completionRate, totalSteps: tour.steps.length }
      });
    }

    set({
      currentTour: null,
      tourStep: 0,
      showTourOverlay: false,
      highlightedElement: null
    });
  },

  nextStep: () => {
    const state = get();
    if (!state.currentTour) return;

    const tour = DEMO_TOURS[state.currentTour];
    const currentStep = tour.steps[state.tourStep];

    if (currentStep && state.userProgress) {
      // Mark current step as completed
      const completedSteps = [...state.userProgress.completedSteps];
      if (!completedSteps.includes(currentStep.id)) {
        completedSteps.push(currentStep.id);
      }

      get().trackInteraction({
        type: 'step_complete',
        stepId: currentStep.id,
        data: { stepIndex: state.tourStep, stepTitle: currentStep.title }
      });

      // Move to next step
      const nextStepIndex = Math.min(state.tourStep + 1, tour.steps.length - 1);
      set(state => ({
        tourStep: nextStepIndex,
        tourDirection: 'next',
        userProgress: state.userProgress ? {
          ...state.userProgress,
          completedSteps,
          currentStepStartTime: Date.now()
        } : null,
        highlightedElement: tour.steps[nextStepIndex]?.targetElement || null
      }));
    }
  },

  prevStep: () => {
    const state = get();
    if (!state.currentTour) return;

    const tour = DEMO_TOURS[state.currentTour];
    const prevStepIndex = Math.max(state.tourStep - 1, 0);

    set({
      tourStep: prevStepIndex,
      tourDirection: 'prev',
      highlightedElement: tour.steps[prevStepIndex]?.targetElement || null
    });

    get().trackInteraction({
      type: 'navigation',
      data: { action: 'prev_step', stepIndex: prevStepIndex }
    });
  },

  skipStep: () => {
    const state = get();
    if (!state.currentTour) return;

    const tour = DEMO_TOURS[state.currentTour];
    const currentStep = tour.steps[state.tourStep];

    if (currentStep?.skipable !== false) {
      get().trackInteraction({
        type: 'skip',
        stepId: currentStep?.id,
        data: { stepIndex: state.tourStep }
      });

      get().nextStep();
    }
  },

  jumpToStep: (stepIndex: number) => {
    const state = get();
    if (!state.currentTour) return;

    const tour = DEMO_TOURS[state.currentTour];
    const validIndex = Math.max(0, Math.min(stepIndex, tour.steps.length - 1));

    set({
      tourStep: validIndex,
      highlightedElement: tour.steps[validIndex]?.targetElement || null
    });

    get().trackInteraction({
      type: 'navigation',
      data: { action: 'jump_to_step', stepIndex: validIndex }
    });
  },

  setPrePopulatedData: (data: DemoDataSet) => {
    set({ prePopulatedData: data });
  },

  trackInteraction: (interaction: Omit<DemoInteraction, 'timestamp'>) => {
    set(state => ({
      userProgress: state.userProgress ? {
        ...state.userProgress,
        interactions: [
          ...state.userProgress.interactions,
          { ...interaction, timestamp: Date.now() }
        ]
      } : null
    }));
  },

  updateSessionMetrics: (metrics: Partial<DemoSessionMetrics>) => {
    set(state => ({
      sessionMetrics: state.sessionMetrics ? {
        ...state.sessionMetrics,
        ...metrics
      } : null
    }));
  },

  // NSW ESC-specific implementations
  loadESCMarketContext: () => {
    const escData = {
      escMarketContext: NSW_ESC_MARKET_CONTEXT,
      escScenarios: ESC_DEMO_SCENARIOS,
      northmoreGordonContext: NORTHMORE_GORDON_CONTEXT,
      currentMarketData: getCurrentESCMarketContext(),
    };

    set(state => ({
      prePopulatedData: {
        ...state.prePopulatedData,
        ...escData,
        investorProfile: state.prePopulatedData?.investorProfile || {},
        negotiationHistory: state.prePopulatedData?.negotiationHistory || [],
        portfolioData: state.prePopulatedData?.portfolioData || {},
        analyticsData: state.prePopulatedData?.analyticsData || {},
        marketData: {
          ...state.prePopulatedData?.marketData,
          nsw_esc: escData.currentMarketData,
        },
        complianceData: {
          ...state.prePopulatedData?.complianceData,
          cer_framework: CER_COMPLIANCE_FRAMEWORK,
        },
      },
    }));

    get().trackInteraction({
      type: 'step_complete',
      data: { action: 'load_esc_market_context', timestamp: Date.now() },
    });
  },

  selectESCScenario: (scenarioId: string) => {
    const scenario = ESC_DEMO_SCENARIOS[scenarioId];
    if (!scenario) return;

    set(state => ({
      prePopulatedData: {
        ...state.prePopulatedData,
        investorProfile: state.prePopulatedData?.investorProfile || {},
        marketData: state.prePopulatedData?.marketData || {},
        portfolioData: state.prePopulatedData?.portfolioData || {},
        complianceData: state.prePopulatedData?.complianceData || {},
        negotiationHistory: [
          {
            scenario_id: scenarioId,
            scenario_details: scenario,
            loaded_at: new Date().toISOString(),
          },
        ],
        analyticsData: {
          ...state.prePopulatedData?.analyticsData,
          selected_scenario: scenario,
          expected_outcomes: scenario.expected_outcomes,
        },
      },
    }));

    get().trackInteraction({
      type: 'step_complete',
      data: { action: 'select_esc_scenario', scenarioId, scenarioName: scenario.name },
    });
  },

  configureNorthmoreGordonBranding: () => {
    set(state => ({
      prePopulatedData: {
        ...state.prePopulatedData,
        investorProfile: state.prePopulatedData?.investorProfile || {},
        marketData: state.prePopulatedData?.marketData || {},
        negotiationHistory: state.prePopulatedData?.negotiationHistory || [],
        portfolioData: state.prePopulatedData?.portfolioData || {},
        complianceData: state.prePopulatedData?.complianceData || {},
        analyticsData: state.prePopulatedData?.analyticsData || {},
        firmContext: NORTHMORE_GORDON_CONTEXT,
        brandingConfig: {
          firm_name: NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.name,
          established: NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.established,
          regulatory_status: NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.regulatory_status,
          specialisation: NORTHMORE_GORDON_CONTEXT.FIRM_PROFILE.specialisation,
          value_propositions: NORTHMORE_GORDON_CONTEXT.CLIENT_VALUE_PROPOSITIONS,
        },
      },
    }));

    get().trackInteraction({
      type: 'step_complete',
      data: { action: 'configure_northmore_gordon_branding', timestamp: Date.now() },
    });
  },

  // Helpers
  getCurrentStep: () => {
    const state = get();
    if (!state.currentTour) return null;

    const tour = DEMO_TOURS[state.currentTour];
    return tour.steps[state.tourStep] || null;
  },

  getTourProgress: () => {
    const state = get();
    if (!state.currentTour) return 0;

    const tour = DEMO_TOURS[state.currentTour];
    return (state.tourStep + 1) / tour.steps.length;
  },

  canGoNext: () => {
    const state = get();
    if (!state.currentTour) return false;

    const tour = DEMO_TOURS[state.currentTour];
    return state.tourStep < tour.steps.length - 1;
  },

  canGoPrev: () => {
    const state = get();
    return state.tourStep > 0;
  },

  isStepCompleted: (stepId: string) => {
    const state = get();
    return state.userProgress?.completedSteps.includes(stepId) || false;
  },

  // NSW ESC-specific helper methods
  getESCDemoData: () => {
    const state = get();
    return {
      marketContext: state.prePopulatedData?.escMarketContext || NSW_ESC_MARKET_CONTEXT,
      scenarios: state.prePopulatedData?.escScenarios || ESC_DEMO_SCENARIOS,
      currentMarketData: state.prePopulatedData?.marketData?.nsw_esc || getCurrentESCMarketContext(),
      complianceFramework: state.prePopulatedData?.complianceData?.cer_framework || CER_COMPLIANCE_FRAMEWORK,
    };
  },

  getNorthmoreGordonContext: () => {
    const state = get();
    return state.prePopulatedData?.northmoreGordonContext || NORTHMORE_GORDON_CONTEXT;
  }
}));

export default useDemoMode;