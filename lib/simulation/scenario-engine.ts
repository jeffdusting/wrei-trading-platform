/**
 * WREI Core Scenario Simulation Engine
 * Manages scenario context, state tracking, and simulation orchestration
 * Version: 6.3.0
 */

export interface SimulationContext {
  sessionId: string;
  scenarioId: string;
  userId: string;
  startTime: Date;
  currentStep: number;
  totalSteps: number;
  persona: InvestorPersona;
  state: SimulationState;
  metadata: Record<string, any>;
  performance: PerformanceMetrics;
}

export interface InvestorPersona {
  id: string;
  name: string;
  role: string;
  organization: string;
  aum: string;
  experience: string;
  techComfort: 'Low' | 'Medium' | 'Medium-High' | 'High' | 'Very High';
  investmentAuthority: string;
  keyDrivers: string[];
  preferences: PersonaPreferences;
}

export interface PersonaPreferences {
  communicationStyle: 'formal' | 'professional' | 'casual';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  decisionMakingSpeed: 'deliberate' | 'standard' | 'fast';
  dataDetailLevel: 'summary' | 'detailed' | 'comprehensive';
  complianceRequirements: string[];
}

export interface SimulationState {
  currentPhase: 'discovery' | 'analysis' | 'evaluation' | 'decision' | 'execution';
  completedActions: string[];
  availableActions: string[];
  contextualData: Record<string, any>;
  userInputs: UserInput[];
  systemResponses: SystemResponse[];
}

export interface UserInput {
  timestamp: Date;
  type: 'click' | 'input' | 'selection' | 'navigation';
  data: any;
  contextualInfo: string;
}

export interface SystemResponse {
  timestamp: Date;
  type: 'ui_update' | 'data_provision' | 'guidance' | 'feedback';
  content: any;
  triggeredBy: string;
}

export interface PerformanceMetrics {
  startTime: Date;
  currentTime: Date;
  stepsCompleted: number;
  errorsEncountered: number;
  assistanceRequested: number;
  timePerStep: number[];
  engagementScore: number;
  satisfactionIndicators: string[];
}

export class ScenarioEngine {
  private context: SimulationContext;
  private stepDefinitions: Map<string, ScenarioStep>;
  private eventListeners: Map<string, Function[]>;

  constructor(scenarioId: string, persona: InvestorPersona) {
    this.context = this.initializeContext(scenarioId, persona);
    this.stepDefinitions = new Map();
    this.eventListeners = new Map();
    this.loadScenarioDefinition(scenarioId);
  }

  private initializeContext(scenarioId: string, persona: InvestorPersona): SimulationContext {
    return {
      sessionId: this.generateSessionId(),
      scenarioId,
      userId: `sim_user_${Date.now()}`,
      startTime: new Date(),
      currentStep: 0,
      totalSteps: 0,
      persona,
      state: {
        currentPhase: 'discovery',
        completedActions: [],
        availableActions: [],
        contextualData: {},
        userInputs: [],
        systemResponses: []
      },
      metadata: {
        version: '6.3.0',
        simulationType: 'guided_workflow',
        features: ['context_tracking', 'performance_monitoring', 'api_simulation']
      },
      performance: {
        startTime: new Date(),
        currentTime: new Date(),
        stepsCompleted: 0,
        errorsEncountered: 0,
        assistanceRequested: 0,
        timePerStep: [],
        engagementScore: 100,
        satisfactionIndicators: []
      }
    };
  }

  private generateSessionId(): string {
    return `wrei_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadScenarioDefinition(scenarioId: string): void {
    // Load scenario-specific step definitions
    const scenarioSteps = this.getScenarioSteps(scenarioId);
    this.context.totalSteps = scenarioSteps.length;

    scenarioSteps.forEach((step, index) => {
      this.stepDefinitions.set(`${scenarioId}_step_${index}`, step);
    });

    // Initialize available actions for first step
    if (scenarioSteps.length > 0) {
      this.context.state.availableActions = scenarioSteps[0].availableActions;
    }
  }

  private getScenarioSteps(scenarioId: string): ScenarioStep[] {
    // Define scenario-specific steps
    switch (scenarioId) {
      case 'scenario-01': // Infrastructure Fund Discovery
        return this.getInfrastructureFundSteps();
      case 'scenario-02': // ESG Impact Investment Analysis
        return this.getESGAnalysisSteps();
      default:
        return this.getDefaultScenarioSteps();
    }
  }

  private getInfrastructureFundSteps(): ScenarioStep[] {
    return [
      {
        id: 'discovery_landing',
        title: 'Platform Discovery',
        description: 'Initial exploration of WREI platform capabilities',
        phase: 'discovery',
        estimatedDuration: 5,
        availableActions: [
          'review_value_proposition',
          'explore_token_details',
          'access_professional_interface'
        ],
        successCriteria: ['value_proposition_reviewed'],
        contextualGuidance: 'Review the platform overview focusing on infrastructure fund benefits',
        mockApiCalls: ['get_platform_overview', 'get_token_specifications']
      },
      {
        id: 'professional_classification',
        title: 'Professional Investor Classification',
        description: 'Classify as professional investor and access institutional features',
        phase: 'discovery',
        estimatedDuration: 3,
        availableActions: [
          'select_professional_pathway',
          'verify_aum_requirements',
          'access_institutional_pricing'
        ],
        successCriteria: ['professional_status_confirmed'],
        contextualGuidance: 'Select professional investor pathway for institutional access',
        mockApiCalls: ['verify_professional_status', 'get_institutional_pricing']
      },
      {
        id: 'token_analysis',
        title: 'Carbon Credit Token Analysis',
        description: 'Deep dive into token specifications and financial metrics',
        phase: 'analysis',
        estimatedDuration: 15,
        availableActions: [
          'analyze_yield_structure',
          'review_risk_metrics',
          'compare_benchmarks',
          'export_analysis_data'
        ],
        successCriteria: ['yield_analysis_complete', 'risk_assessment_complete'],
        contextualGuidance: 'Focus on IRR (8%), NPV calculations, and Sharpe ratio (1.2+)',
        mockApiCalls: ['get_financial_metrics', 'get_risk_analysis', 'get_benchmark_data']
      },
      // Additional steps would be defined here...
    ];
  }

  private getESGAnalysisSteps(): ScenarioStep[] {
    return [
      {
        id: 'esg_discovery',
        title: 'ESG Platform Discovery',
        description: 'Explore ESG-specific features and impact measurement capabilities',
        phase: 'discovery',
        estimatedDuration: 7,
        availableActions: [
          'review_esg_credentials',
          'explore_impact_metrics',
          'access_sustainability_data'
        ],
        successCriteria: ['esg_credentials_reviewed'],
        contextualGuidance: 'Focus on impact measurement and ESG rating integration',
        mockApiCalls: ['get_esg_ratings', 'get_impact_metrics', 'get_sustainability_data']
      }
      // Additional ESG-specific steps...
    ];
  }

  private getDefaultScenarioSteps(): ScenarioStep[] {
    return [
      {
        id: 'generic_discovery',
        title: 'Platform Exploration',
        description: 'General platform exploration and feature discovery',
        phase: 'discovery',
        estimatedDuration: 10,
        availableActions: [
          'explore_platform',
          'review_features',
          'access_documentation'
        ],
        successCriteria: ['platform_explored'],
        contextualGuidance: 'Explore the platform features at your own pace',
        mockApiCalls: ['get_platform_features']
      }
    ];
  }

  // Core simulation methods
  public async executeAction(actionId: string, parameters: any = {}): Promise<ActionResult> {
    const startTime = Date.now();

    try {
      // Record user input
      this.recordUserInput('action', { actionId, parameters });

      // Validate action is available
      if (!this.context.state.availableActions.includes(actionId)) {
        throw new Error(`Action ${actionId} is not available in current context`);
      }

      // Execute the action
      const result = await this.processAction(actionId, parameters);

      // Update context based on result
      this.updateContextFromAction(actionId, result);

      // Update performance metrics
      this.updatePerformanceMetrics(startTime, true);

      // Check for step completion
      this.checkStepCompletion();

      return result;

    } catch (error) {
      this.updatePerformanceMetrics(startTime, false);
      this.context.performance.errorsEncountered++;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
        nextActions: this.context.state.availableActions
      };
    }
  }

  private async processAction(actionId: string, parameters: any): Promise<ActionResult> {
    // Simulate realistic processing time based on action complexity
    const processingTime = this.getActionProcessingTime(actionId);
    await this.delay(processingTime);

    // Generate action-specific results
    switch (actionId) {
      case 'review_value_proposition':
        return this.handleValuePropositionReview();
      case 'analyze_yield_structure':
        return this.handleYieldAnalysis(parameters);
      case 'export_analysis_data':
        return this.handleDataExport(parameters);
      default:
        return this.handleGenericAction(actionId, parameters);
    }
  }

  private getActionProcessingTime(actionId: string): number {
    // Simulate realistic API response times
    const baseTime = 200; // Base 200ms
    const complexityMultipliers: Record<string, number> = {
      'review_value_proposition': 1,
      'analyze_yield_structure': 3,
      'export_analysis_data': 5,
      'access_professional_interface': 2
    };

    return baseTime * (complexityMultipliers[actionId] || 1);
  }

  private handleValuePropositionReview(): ActionResult {
    return {
      success: true,
      data: {
        content: 'WREI carbon credits provide institutional-grade access to verified carbon offset markets...',
        keyPoints: [
          'Institutional minimum investment: A$10M',
          'Target yield: 8% IRR over 5-year holding period',
          'Risk profile: Moderate (25% volatility)',
          'ESG impact: 100,000 tonnes CO2 offset per A$10M investment'
        ]
      },
      nextActions: ['explore_token_details', 'access_professional_interface'],
      metadata: { completionTime: Date.now(), stepProgress: 0.3 }
    };
  }

  private handleYieldAnalysis(parameters: any): ActionResult {
    return {
      success: true,
      data: {
        irr: 0.087,
        npv: 2750000,
        sharpeRatio: 1.23,
        volatility: 0.25,
        benchmark_comparison: {
          infrastructure_reits: 0.065,
          outperformance: '+15%'
        }
      },
      nextActions: ['review_risk_metrics', 'compare_benchmarks'],
      metadata: { completionTime: Date.now(), stepProgress: 0.7 }
    };
  }

  private handleDataExport(parameters: any): ActionResult {
    return {
      success: true,
      data: {
        exportFormat: parameters.format || 'pdf',
        downloadUrl: `/api/export/${this.context.sessionId}/analysis.pdf`,
        fileSize: '2.3MB',
        contents: ['Executive Summary', 'Financial Analysis', 'Risk Assessment', 'Compliance Notes']
      },
      nextActions: ['schedule_committee_review', 'proceed_to_next_phase'],
      metadata: { completionTime: Date.now(), stepProgress: 1.0 }
    };
  }

  private handleGenericAction(actionId: string, parameters: any): ActionResult {
    return {
      success: true,
      data: { message: `Action ${actionId} completed successfully`, parameters },
      nextActions: this.context.state.availableActions.filter(a => a !== actionId),
      metadata: { completionTime: Date.now() }
    };
  }

  public getContext(): SimulationContext {
    return { ...this.context };
  }

  public getCurrentStep(): ScenarioStep | null {
    const stepKey = `${this.context.scenarioId}_step_${this.context.currentStep}`;
    return this.stepDefinitions.get(stepKey) || null;
  }

  public getProgress(): ProgressInfo {
    return {
      currentStep: this.context.currentStep,
      totalSteps: this.context.totalSteps,
      percentage: (this.context.currentStep / this.context.totalSteps) * 100,
      timeElapsed: Date.now() - this.context.startTime.getTime(),
      estimatedTimeRemaining: this.calculateEstimatedTimeRemaining()
    };
  }

  private calculateEstimatedTimeRemaining(): number {
    const avgTimePerStep = this.context.performance.timePerStep.length > 0
      ? this.context.performance.timePerStep.reduce((a, b) => a + b, 0) / this.context.performance.timePerStep.length
      : 30000; // Default 30 seconds per step

    const remainingSteps = this.context.totalSteps - this.context.currentStep;
    return remainingSteps * avgTimePerStep;
  }

  // Helper methods
  private recordUserInput(type: string, data: any): void {
    this.context.state.userInputs.push({
      timestamp: new Date(),
      type: type as any,
      data,
      contextualInfo: `Step ${this.context.currentStep}: ${this.getCurrentStep()?.title || 'Unknown'}`
    });
  }

  private updateContextFromAction(actionId: string, result: ActionResult): void {
    if (result.success) {
      this.context.state.completedActions.push(actionId);

      if (result.nextActions) {
        this.context.state.availableActions = result.nextActions;
      }

      // Store result data in context
      this.context.state.contextualData[actionId] = result.data;
    }
  }

  private updatePerformanceMetrics(startTime: number, success: boolean): void {
    const duration = Date.now() - startTime;
    this.context.performance.timePerStep.push(duration);
    this.context.performance.currentTime = new Date();

    if (!success) {
      this.context.performance.engagementScore = Math.max(0, this.context.performance.engagementScore - 5);
    }
  }

  private checkStepCompletion(): void {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return;

    const completedCriteria = currentStep.successCriteria.filter(criteria =>
      this.context.state.completedActions.includes(criteria) ||
      this.context.state.contextualData[criteria]
    );

    if (completedCriteria.length === currentStep.successCriteria.length) {
      this.context.currentStep++;
      this.context.performance.stepsCompleted++;

      // Transition to next step
      const nextStep = this.getCurrentStep();
      if (nextStep) {
        this.context.state.availableActions = nextStep.availableActions;
        this.context.state.currentPhase = nextStep.phase;
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Supporting interfaces
export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  phase: 'discovery' | 'analysis' | 'evaluation' | 'decision' | 'execution';
  estimatedDuration: number; // minutes
  availableActions: string[];
  successCriteria: string[];
  contextualGuidance: string;
  mockApiCalls: string[];
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  nextActions?: string[];
  metadata?: Record<string, any>;
}

export interface ProgressInfo {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  timeElapsed: number;
  estimatedTimeRemaining: number;
}