/**
 * WREI Trading Platform - Demo Mode State Manager
 *
 * Centralized state management for demo mode functionality
 * Provides guided tours, pre-populated data, and presentation modes
 */

import { create } from 'zustand';

export type DemoTourType =
  | 'executive-overview'
  | 'investor-deep-dive'
  | 'technical-integration'
  | 'compliance-walkthrough'
  | 'carbon-negotiation'
  | 'portfolio-analytics';

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

  // Helpers
  getCurrentStep: () => DemoStep | null;
  getTourProgress: () => number;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
  isStepCompleted: (stepId: string) => boolean;
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
  }
}));

export default useDemoMode;