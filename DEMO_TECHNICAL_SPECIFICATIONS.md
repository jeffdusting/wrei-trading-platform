# WREI Trading Platform - Demo Technical Specifications

**Version**: 1.0.0
**Date**: March 25, 2026
**Author**: Claude Sonnet 4 (Technical Architecture)
**Scope**: Detailed technical component specifications for demo system
**Context**: Technical implementation details for two-stage development

---

## Table of Contents

1. [Technical Architecture Overview](#technical-architecture-overview)
2. [Component Specifications](#component-specifications)
3. [API Specifications](#api-specifications)
4. [Database Design](#database-design)
5. [Security Specifications](#security-specifications)
6. [Performance Specifications](#performance-specifications)
7. [Integration Specifications](#integration-specifications)
8. [Deployment Specifications](#deployment-specifications)

---

## Technical Architecture Overview

### Technology Stack

#### Frontend Architecture
```typescript
interface FrontendStack {
  framework: 'Next.js 14';
  runtime: 'React 18.2.0';
  language: 'TypeScript 5.0+';
  styling: 'Tailwind CSS 3.3+';
  stateManagement: 'React useState/useReducer';
  routing: 'Next.js App Router';
  buildTool: 'Webpack (Next.js built-in)';
  devTools: 'React Developer Tools';
}
```

#### Backend Architecture
```typescript
interface BackendStack {
  runtime: 'Node.js 18.x';
  framework: 'Next.js API Routes';
  language: 'TypeScript 5.0+';
  aiIntegration: '@anthropic-ai/sdk 0.20+';
  httpClient: 'fetch (built-in)';
  validation: 'Zod 3.21+';
  testing: 'Jest 29.5+';
  linting: 'ESLint 8.42+';
}
```

#### Deployment Architecture
```typescript
interface DeploymentStack {
  platform: 'Vercel';
  hosting: 'Vercel Edge Network';
  functions: 'Vercel Serverless Functions';
  storage: 'In-memory (Redis for caching)';
  monitoring: 'Vercel Analytics';
  cicd: 'GitHub Actions + Vercel';
  domains: 'Vercel Domain Management';
}
```

### System Architecture Layers

```typescript
interface SystemArchitecture {
  presentationLayer: {
    components: [
      'DemoConfigurationPanel',
      'AnalyticsDashboard',
      'MultiAudienceInterface',
      'ReportingInterface'
    ];
    routes: [
      '/demo/configure',
      '/demo/execute',
      '/demo/analytics',
      '/demo/reports'
    ];
  };

  businessLogicLayer: {
    services: [
      'DemoConfigurationEngine',
      'AnalyticsEngine',
      'ScenarioManager',
      'ReportGenerator'
    ];
    utilities: [
      'InputSanitizer',
      'OutputValidator',
      'PerformanceMonitor'
    ];
  };

  dataAccessLayer: {
    managers: [
      'SessionManager',
      'CacheManager',
      'ConfigurationManager'
    ];
    providers: [
      'MarketDataProvider',
      'ScenarioDataProvider'
    ];
  };

  integrationLayer: {
    clients: [
      'ClaudeAPIClient',
      'MarketDataClient',
      'AnalyticsClient'
    ];
    adapters: [
      'ReportingAdapter',
      'ExportAdapter'
    ];
  };
}
```

---

## Component Specifications

### COMP-001: Demo Configuration Engine

#### COMP-001.1: Core Configuration Types
```typescript
// /lib/demo-configuration-types.ts

export interface DemoConfiguration {
  readonly sessionId: string;
  readonly audienceType: AudienceType;
  readonly scenarioTemplate: ScenarioTemplate;
  readonly parameters: DemoParameters;
  readonly outcomes: TargetOutcome[];
  readonly duration: number;
  readonly metadata: ConfigurationMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ScenarioTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly audienceType: AudienceType;
  readonly category: ScenarioCategory;
  readonly complexity: ComplexityLevel;
  readonly estimatedDuration: number;
  readonly defaultParameters: DemoParameters;
  readonly validationRules: ValidationRule[];
  readonly metadata: TemplateMetadata;
}

export interface DemoParameters {
  readonly marketConditions: MarketConditions;
  readonly tradingVolume: TradingVolumeConfig;
  readonly priceRanges: PriceRangeConfig;
  readonly participantProfiles: ParticipantProfile[];
  readonly regulatoryConstraints: RegulatoryConstraint[];
  readonly performanceTargets: PerformanceTarget[];
}

export interface MarketConditions {
  readonly volatility: VolatilityLevel;
  readonly liquidity: LiquidityLevel;
  readonly priceLevel: PriceLevelIndicator;
  readonly marketTrend: MarketTrend;
  readonly seasonality: SeasonalityFactor;
  readonly regulatoryEnvironment: RegulatoryEnvironment;
}

export enum AudienceType {
  EXECUTIVE = 'executive',
  TECHNICAL = 'technical',
  COMPLIANCE = 'compliance',
  MIXED = 'mixed'
}

export enum ScenarioCategory {
  SPOT_TRADING = 'spot_trading',
  FORWARD_CONTRACTS = 'forward_contracts',
  PORTFOLIO_OPTIMIZATION = 'portfolio_optimization',
  COMPLIANCE_WORKFLOW = 'compliance_workflow',
  RISK_MANAGEMENT = 'risk_management'
}

export enum ComplexityLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
```

#### COMP-001.2: Configuration Engine Implementation
```typescript
// /lib/demo-configuration-engine.ts

export class DemoConfigurationEngine {
  private static instance: DemoConfigurationEngine;
  private configurations: Map<string, DemoConfiguration> = new Map();
  private validators: ConfigurationValidator[] = [];

  private constructor() {
    this.initializeValidators();
  }

  public static getInstance(): DemoConfigurationEngine {
    if (!DemoConfigurationEngine.instance) {
      DemoConfigurationEngine.instance = new DemoConfigurationEngine();
    }
    return DemoConfigurationEngine.instance;
  }

  public async createConfiguration(
    audienceType: AudienceType,
    scenarioId: string,
    customParameters?: Partial<DemoParameters>,
    metadata?: Partial<ConfigurationMetadata>
  ): Promise<DemoConfiguration> {
    const sessionId = this.generateSessionId();
    const template = await this.getScenarioTemplate(scenarioId);

    if (!template) {
      throw new DemoConfigurationError(
        `Scenario template '${scenarioId}' not found`,
        'TEMPLATE_NOT_FOUND'
      );
    }

    if (template.audienceType !== audienceType && audienceType !== AudienceType.MIXED) {
      throw new DemoConfigurationError(
        `Template '${scenarioId}' not compatible with audience type '${audienceType}'`,
        'AUDIENCE_MISMATCH'
      );
    }

    const parameters = this.mergeParameters(template.defaultParameters, customParameters);
    const outcomes = await this.generateTargetOutcomes(template, parameters);

    const configuration: DemoConfiguration = {
      sessionId,
      audienceType,
      scenarioTemplate: template,
      parameters,
      outcomes,
      duration: template.estimatedDuration,
      metadata: {
        ...this.getDefaultMetadata(),
        ...metadata
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const validationResult = await this.validateConfiguration(configuration);
    if (!validationResult.isValid) {
      throw new DemoConfigurationError(
        `Configuration validation failed: ${validationResult.errors.join(', ')}`,
        'VALIDATION_FAILED',
        validationResult.errors
      );
    }

    this.configurations.set(sessionId, configuration);
    return configuration;
  }

  public async updateConfiguration(
    sessionId: string,
    updates: Partial<DemoConfiguration>
  ): Promise<DemoConfiguration> {
    const existingConfig = this.configurations.get(sessionId);
    if (!existingConfig) {
      throw new DemoConfigurationError(
        `Configuration with session ID '${sessionId}' not found`,
        'CONFIGURATION_NOT_FOUND'
      );
    }

    const updatedConfig: DemoConfiguration = {
      ...existingConfig,
      ...updates,
      sessionId: existingConfig.sessionId, // Prevent session ID changes
      updatedAt: new Date()
    };

    const validationResult = await this.validateConfiguration(updatedConfig);
    if (!validationResult.isValid) {
      throw new DemoConfigurationError(
        `Configuration update validation failed: ${validationResult.errors.join(', ')}`,
        'VALIDATION_FAILED',
        validationResult.errors
      );
    }

    this.configurations.set(sessionId, updatedConfig);
    return updatedConfig;
  }

  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `demo_${timestamp}_${random}`;
  }

  private async getScenarioTemplate(scenarioId: string): Promise<ScenarioTemplate | null> {
    // Implementation would load from scenario template store
    const templates = await ScenarioTemplateManager.getInstance().getAllTemplates();
    return templates.find(template => template.id === scenarioId) || null;
  }

  private mergeParameters(
    defaultParams: DemoParameters,
    customParams?: Partial<DemoParameters>
  ): DemoParameters {
    if (!customParams) return defaultParams;

    return {
      marketConditions: {
        ...defaultParams.marketConditions,
        ...customParams.marketConditions
      },
      tradingVolume: {
        ...defaultParams.tradingVolume,
        ...customParams.tradingVolume
      },
      priceRanges: {
        ...defaultParams.priceRanges,
        ...customParams.priceRanges
      },
      participantProfiles: customParams.participantProfiles || defaultParams.participantProfiles,
      regulatoryConstraints: customParams.regulatoryConstraints || defaultParams.regulatoryConstraints,
      performanceTargets: customParams.performanceTargets || defaultParams.performanceTargets
    };
  }

  private async validateConfiguration(config: DemoConfiguration): Promise<ValidationResult> {
    const results = await Promise.all(
      this.validators.map(validator => validator.validate(config))
    );

    const errors: string[] = [];
    const warnings: string[] = [];

    results.forEach(result => {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      validatedAt: new Date()
    };
  }
}

export class DemoConfigurationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'DemoConfigurationError';
  }
}
```

### COMP-002: Real-Time Analytics Engine

#### COMP-002.1: Analytics Data Types
```typescript
// /lib/analytics-types.ts

export interface AnalyticsEngine {
  calculateRealTimeMetrics(sessionData: SessionData): Promise<RealTimeMetrics>;
  updateMetrics(update: MetricsUpdate): Promise<void>;
  getHistoricalMetrics(sessionId: string, timeRange: TimeRange): Promise<HistoricalMetrics>;
  generateAnalyticsReport(sessionId: string): Promise<AnalyticsReport>;
}

export interface RealTimeMetrics {
  readonly timestamp: number;
  readonly sessionId: string;
  readonly negotiationMetrics: NegotiationMetrics;
  readonly performanceMetrics: PerformanceMetrics;
  readonly marketMetrics: MarketMetrics;
  readonly audienceMetrics: AudienceMetrics;
  readonly systemMetrics: SystemMetrics;
}

export interface NegotiationMetrics {
  readonly currentRound: number;
  readonly totalRounds: number;
  readonly currentPrice: number;
  readonly priceMovement: PriceMovement;
  readonly negotiationProgress: number; // 0-100%
  readonly timeElapsed: number; // milliseconds
  readonly estimatedTimeRemaining: number; // milliseconds
  readonly participantEngagement: ParticipantEngagement;
  readonly successProbability: number; // 0-100%
}

export interface PerformanceMetrics {
  readonly responseTime: number; // milliseconds
  readonly apiLatency: number; // milliseconds
  readonly calculationSpeed: number; // calculations per second
  readonly throughput: number; // requests per minute
  readonly errorRate: number; // 0-100%
  readonly systemHealth: SystemHealth;
  readonly resourceUsage: ResourceUsage;
}

export interface MarketMetrics {
  readonly marketPosition: number; // -100 to 100 (seller to buyer advantage)
  readonly competitiveAnalysis: CompetitiveAnalysis;
  readonly marketEfficiency: number; // 0-100%
  readonly liquidityIndex: number;
  readonly volatilityMeasure: number;
  readonly benchmarkComparison: BenchmarkComparison;
  readonly priceAccuracy: number; // 0-100%
}

export interface SystemHealth {
  readonly status: HealthStatus;
  readonly cpuUsage: number; // 0-100%
  readonly memoryUsage: number; // 0-100%
  readonly networkLatency: number; // milliseconds
  readonly diskUsage: number; // 0-100%
  readonly connectionCount: number;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  CRITICAL = 'critical',
  OFFLINE = 'offline'
}
```

#### COMP-002.2: Analytics Engine Implementation
```typescript
// /lib/analytics-engine.ts

export class RealTimeAnalyticsEngine implements AnalyticsEngine {
  private sessionMetrics: Map<string, RealTimeMetrics> = new Map();
  private updateSubscribers: Map<string, AnalyticsCallback[]> = new Map();
  private calculationWorker: AnalyticsWorker;
  private metricsCache: MetricsCache;

  constructor(
    private performanceMonitor: PerformanceMonitor,
    private marketDataProvider: MarketDataProvider
  ) {
    this.calculationWorker = new AnalyticsWorker();
    this.metricsCache = new MetricsCache();
    this.initializeMetricsCollection();
  }

  public async calculateRealTimeMetrics(sessionData: SessionData): Promise<RealTimeMetrics> {
    const startTime = performance.now();

    try {
      // Check cache first
      const cachedMetrics = await this.metricsCache.get(sessionData.sessionId);
      if (cachedMetrics && this.isCacheValid(cachedMetrics, sessionData)) {
        return cachedMetrics;
      }

      // Calculate new metrics
      const [negotiationMetrics, performanceMetrics, marketMetrics, audienceMetrics, systemMetrics] =
        await Promise.all([
          this.calculateNegotiationMetrics(sessionData),
          this.calculatePerformanceMetrics(sessionData),
          this.calculateMarketMetrics(sessionData),
          this.calculateAudienceMetrics(sessionData),
          this.calculateSystemMetrics(sessionData)
        ]);

      const metrics: RealTimeMetrics = {
        timestamp: Date.now(),
        sessionId: sessionData.sessionId,
        negotiationMetrics,
        performanceMetrics,
        marketMetrics,
        audienceMetrics,
        systemMetrics
      };

      // Cache the results
      await this.metricsCache.set(sessionData.sessionId, metrics);

      // Update performance tracking
      const calculationTime = performance.now() - startTime;
      this.performanceMonitor.recordCalculationTime('analytics', calculationTime);

      return metrics;
    } catch (error) {
      this.performanceMonitor.recordError('analytics_calculation', error);
      throw new AnalyticsError(
        `Failed to calculate real-time metrics: ${error.message}`,
        'CALCULATION_FAILED',
        { sessionId: sessionData.sessionId, error }
      );
    }
  }

  private async calculateNegotiationMetrics(sessionData: SessionData): Promise<NegotiationMetrics> {
    const { negotiationHistory, currentState, configuration } = sessionData;

    const currentRound = negotiationHistory.length;
    const latestRound = negotiationHistory[currentRound - 1];
    const currentPrice = latestRound?.finalPrice || configuration.parameters.priceRanges.target;

    const priceMovement = this.calculatePriceMovement(negotiationHistory);
    const negotiationProgress = this.calculateNegotiationProgress(sessionData);
    const participantEngagement = this.calculateParticipantEngagement(negotiationHistory);
    const successProbability = this.calculateSuccessProbability(sessionData);

    const timeElapsed = Date.now() - sessionData.startTime;
    const estimatedTimeRemaining = this.estimateRemainingTime(sessionData);

    return {
      currentRound,
      totalRounds: currentRound,
      currentPrice,
      priceMovement,
      negotiationProgress,
      timeElapsed,
      estimatedTimeRemaining,
      participantEngagement,
      successProbability
    };
  }

  private calculatePriceMovement(history: NegotiationRound[]): PriceMovement {
    if (history.length < 2) {
      return {
        direction: 'stable',
        magnitude: 0,
        velocity: 0,
        trend: 'neutral',
        momentum: 0,
        acceleration: 0
      };
    }

    const recent = history.slice(-2);
    const [previous, current] = recent;

    const priceDiff = (current.finalPrice || 0) - (previous.finalPrice || 0);
    const timeDiff = current.timestamp - previous.timestamp;

    return {
      direction: priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : 'stable',
      magnitude: Math.abs(priceDiff),
      velocity: timeDiff > 0 ? Math.abs(priceDiff) / timeDiff : 0,
      trend: this.analyzePriceTrend(history),
      momentum: this.calculateMomentum(history),
      acceleration: this.calculateAcceleration(history)
    };
  }

  private calculateNegotiationProgress(sessionData: SessionData): number {
    const { negotiationHistory, configuration } = sessionData;

    if (negotiationHistory.length === 0) return 0;

    // Multiple factors contribute to progress
    const roundProgress = Math.min(100, (negotiationHistory.length / 10) * 100); // Assume 10 rounds max
    const priceConvergence = this.calculatePriceConvergence(negotiationHistory, configuration);
    const engagementLevel = this.calculateEngagementLevel(negotiationHistory);
    const timeProgress = this.calculateTimeProgress(sessionData);

    // Weighted average
    return Math.min(100,
      roundProgress * 0.3 +
      priceConvergence * 0.4 +
      engagementLevel * 0.2 +
      timeProgress * 0.1
    );
  }

  public subscribeToUpdates(sessionId: string, callback: AnalyticsCallback): void {
    if (!this.updateSubscribers.has(sessionId)) {
      this.updateSubscribers.set(sessionId, []);
    }
    this.updateSubscribers.get(sessionId)!.push(callback);
  }

  public unsubscribeFromUpdates(sessionId: string, callback: AnalyticsCallback): void {
    const subscribers = this.updateSubscribers.get(sessionId);
    if (subscribers) {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    }
  }

  private notifySubscribers(sessionId: string, metrics: RealTimeMetrics): void {
    const subscribers = this.updateSubscribers.get(sessionId);
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in analytics callback:', error);
        }
      });
    }
  }
}

export type AnalyticsCallback = (metrics: RealTimeMetrics) => void;

export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: any
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}
```

### COMP-003: Multi-Audience Interface System

#### COMP-003.1: Adaptive Interface Types
```typescript
// /lib/interface-types.ts

export interface AdaptiveInterface {
  render(audienceType: AudienceType, context: RenderContext): React.ReactElement;
  adapt(engagementData: EngagementData): InterfaceAdaptation;
  getLayout(audienceType: AudienceType): LayoutConfiguration;
}

export interface RenderContext {
  readonly sessionId: string;
  readonly audienceType: AudienceType;
  readonly configuration: DemoConfiguration;
  readonly analytics: RealTimeMetrics;
  readonly userInteractions: UserInteraction[];
  readonly adaptationHistory: InterfaceAdaptation[];
}

export interface InterfaceAdaptation {
  readonly timestamp: number;
  readonly trigger: AdaptationTrigger;
  readonly changes: InterfaceChange[];
  readonly confidence: number; // 0-100%
  readonly reversible: boolean;
}

export interface InterfaceChange {
  readonly type: ChangeType;
  readonly component: string;
  readonly property: string;
  readonly previousValue: any;
  readonly newValue: any;
  readonly reason: string;
}

export enum AdaptationTrigger {
  ENGAGEMENT_DROP = 'engagement_drop',
  ATTENTION_LOSS = 'attention_loss',
  COMPLEXITY_MISMATCH = 'complexity_mismatch',
  TIME_PRESSURE = 'time_pressure',
  QUESTION_PATTERN = 'question_pattern',
  PERFORMANCE_ISSUE = 'performance_issue'
}

export enum ChangeType {
  CONTENT_SIMPLIFICATION = 'content_simplification',
  CONTENT_EXPANSION = 'content_expansion',
  VISUAL_ENHANCEMENT = 'visual_enhancement',
  NAVIGATION_MODIFICATION = 'navigation_modification',
  TIMING_ADJUSTMENT = 'timing_adjustment',
  INTERACTION_MODIFICATION = 'interaction_modification'
}
```

#### COMP-003.2: Audience-Specific Components
```typescript
// /components/interfaces/ExecutiveInterface.tsx

export const ExecutiveInterface: React.FC<ExecutiveInterfaceProps> = ({
  configuration,
  analytics,
  onInteraction
}) => {
  const [focusArea, setFocusArea] = useState<ExecutiveFocusArea>('overview');
  const [adaptations, setAdaptations] = useState<InterfaceAdaptation[]>([]);

  const handleEngagementChange = useCallback((engagement: EngagementData) => {
    if (engagement.level < 70) {
      // Adapt to increase engagement
      const adaptation: InterfaceAdaptation = {
        timestamp: Date.now(),
        trigger: AdaptationTrigger.ENGAGEMENT_DROP,
        changes: [{
          type: ChangeType.CONTENT_SIMPLIFICATION,
          component: 'MainDashboard',
          property: 'complexity',
          previousValue: 'detailed',
          newValue: 'simplified',
          reason: 'Engagement level dropped below threshold'
        }],
        confidence: 85,
        reversible: true
      };
      setAdaptations(prev => [...prev, adaptation]);
    }
  }, []);

  return (
    <div className="executive-interface">
      <ExecutiveHeader
        configuration={configuration}
        analytics={analytics}
      />

      <ExecutiveDashboard
        focusArea={focusArea}
        metrics={analytics}
        adaptations={adaptations}
        onFocusChange={setFocusArea}
        onInteraction={onInteraction}
      />

      <ExecutiveInsights
        analytics={analytics}
        configuration={configuration}
        adaptations={adaptations}
      />

      <ExecutiveActions
        nextSteps={generateExecutiveNextSteps(analytics)}
        onAction={onInteraction}
      />
    </div>
  );
};

interface ExecutiveInterfaceProps {
  configuration: DemoConfiguration;
  analytics: RealTimeMetrics;
  onInteraction: (interaction: UserInteraction) => void;
}

enum ExecutiveFocusArea {
  OVERVIEW = 'overview',
  ROI = 'roi',
  COMPETITIVE = 'competitive',
  RISK = 'risk',
  NEXT_STEPS = 'next_steps'
}
```

---

## API Specifications

### API-001: Demo Configuration API

#### API-001.1: Configuration Endpoints
```typescript
// /app/api/demo/configure/route.ts

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedRequest = ConfigurationRequestSchema.parse(body);

    const configurationEngine = DemoConfigurationEngine.getInstance();
    const configuration = await configurationEngine.createConfiguration(
      validatedRequest.audienceType,
      validatedRequest.scenarioId,
      validatedRequest.customParameters,
      validatedRequest.metadata
    );

    return NextResponse.json({
      success: true,
      data: configuration,
      metadata: {
        timestamp: Date.now(),
        version: '1.0.0'
      }
    });

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request format',
        details: error.errors
      }, { status: 400 });
    }

    if (error instanceof DemoConfigurationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

const ConfigurationRequestSchema = z.object({
  audienceType: z.enum(['executive', 'technical', 'compliance', 'mixed']),
  scenarioId: z.string().min(1),
  customParameters: z.object({
    marketConditions: z.object({
      volatility: z.enum(['low', 'medium', 'high']).optional(),
      liquidity: z.enum(['low', 'medium', 'high']).optional(),
      priceLevel: z.enum(['current_market', 'historical', 'projected']).optional()
    }).optional(),
    tradingVolume: z.object({
      size: z.enum(['small', 'medium', 'large']).optional(),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional()
    }).optional(),
    priceRanges: z.object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
      target: z.number().positive().optional()
    }).optional()
  }).optional(),
  metadata: z.object({
    clientName: z.string().optional(),
    presentationDate: z.string().optional(),
    customBranding: z.boolean().optional()
  }).optional()
});
```

### API-002: Analytics API

#### API-002.1: Real-Time Analytics Endpoints
```typescript
// /app/api/analytics/realtime/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'Session ID is required'
    }, { status: 400 });
  }

  try {
    const analyticsEngine = RealTimeAnalyticsEngine.getInstance();
    const metrics = await analyticsEngine.getRealTimeMetrics(sessionId);

    return NextResponse.json({
      success: true,
      data: metrics,
      metadata: {
        timestamp: Date.now(),
        sessionId,
        updateInterval: 1000 // milliseconds
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve analytics',
      details: error.message
    }, { status: 500 });
  }
}

// WebSocket connection for real-time updates
export async function UPGRADE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Session ID required', { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(request);

  socket.onopen = () => {
    const analyticsEngine = RealTimeAnalyticsEngine.getInstance();
    analyticsEngine.subscribeToUpdates(sessionId, (metrics) => {
      socket.send(JSON.stringify({
        type: 'analytics_update',
        data: metrics
      }));
    });
  };

  socket.onclose = () => {
    const analyticsEngine = RealTimeAnalyticsEngine.getInstance();
    // Cleanup subscription
  };

  return response;
}
```

### API-003: AI Integration API

#### API-003.1: Claude API Integration
```typescript
// /lib/ai/claude-client.ts

export class ClaudeAPIClient {
  private static instance: ClaudeAPIClient;
  private client: Anthropic;
  private requestQueue: RequestQueue;
  private rateLimiter: RateLimiter;

  private constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.requestQueue = new RequestQueue();
    this.rateLimiter = new RateLimiter({
      tokensPerMinute: 40000,
      requestsPerMinute: 50
    });
  }

  public static getInstance(): ClaudeAPIClient {
    if (!ClaudeAPIClient.instance) {
      ClaudeAPIClient.instance = new ClaudeAPIClient();
    }
    return ClaudeAPIClient.instance;
  }

  public async processNegotiationRequest(
    request: NegotiationRequest
  ): Promise<NegotiationResponse> {
    await this.rateLimiter.waitForCapacity(request.estimatedTokens);

    const systemPrompt = this.buildSystemPrompt(request.context);
    const userMessage = this.buildUserMessage(request);

    try {
      const response = await this.client.messages.create({
        model: process.env.NODE_ENV === 'production'
          ? 'claude-3-opus-20240229'
          : 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userMessage }
        ]
      });

      const processedResponse = this.processClaudeResponse(response, request.context);

      return {
        response: processedResponse.content,
        metadata: {
          tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
          responseTime: Date.now() - request.startTime,
          model: response.model,
          confidence: processedResponse.confidence
        }
      };

    } catch (error) {
      if (error.status === 429) {
        // Rate limit exceeded - implement exponential backoff
        await this.handleRateLimit(error);
        return this.processNegotiationRequest(request); // Retry
      }

      throw new AIIntegrationError(
        `Claude API request failed: ${error.message}`,
        'API_REQUEST_FAILED',
        { error, request }
      );
    }
  }

  private buildSystemPrompt(context: NegotiationContext): string {
    return `You are an expert carbon credit trading negotiator representing the WREI platform.

Context:
- Market: NSW Energy Savings Certificates (ESC)
- Current price range: $${context.priceRange.min} - $${context.priceRange.max} per ESC
- Market conditions: ${context.marketConditions}
- Participant type: ${context.participantType}
- Audience: ${context.audienceType}

Your role:
- Negotiate effectively within WREI platform constraints
- Demonstrate platform capabilities naturally
- Maintain professional, knowledgeable tone
- Focus on creating value for both parties

Constraints:
- Price floor: $${context.priceFloor} (never go below this)
- Maximum concession per round: 5%
- Total maximum concession: 20% from anchor price
- Must justify all positions with market data

Remember: This is a demonstration of WREI platform capabilities. Show expertise while highlighting platform features.`;
  }

  private processClaudeResponse(
    response: Anthropic.Messages.Message,
    context: NegotiationContext
  ): ProcessedResponse {
    const content = response.content[0]?.text || '';

    // Extract structured data from response
    const offer = this.extractOffer(content);
    const justification = this.extractJustification(content);
    const confidence = this.calculateConfidence(content, context);

    // Apply defense filters
    const filteredContent = this.applyDefenseFilters(content, context);

    return {
      content: filteredContent,
      offer,
      justification,
      confidence
    };
  }

  private applyDefenseFilters(content: string, context: NegotiationContext): string {
    // Remove internal reasoning markers
    let filtered = content.replace(/\[INTERNAL:.*?\]/g, '');

    // Remove debug information
    filtered = filtered.replace(/DEBUG:.*$/gm, '');

    // Remove sensitive information
    filtered = filtered.replace(/API_KEY|SECRET|PASSWORD/gi, '[REDACTED]');

    // Validate price constraints
    const priceMatches = filtered.match(/\$(\d+\.?\d*)/g);
    if (priceMatches) {
      priceMatches.forEach(priceStr => {
        const price = parseFloat(priceStr.replace('$', ''));
        if (price < context.priceFloor) {
          filtered = filtered.replace(priceStr, `$${context.priceFloor}`);
        }
      });
    }

    return filtered.trim();
  }
}

interface NegotiationRequest {
  context: NegotiationContext;
  userMessage: string;
  estimatedTokens: number;
  startTime: number;
}

interface NegotiationResponse {
  response: string;
  metadata: ResponseMetadata;
}

interface ProcessedResponse {
  content: string;
  offer?: number;
  justification?: string;
  confidence: number;
}
```

---

## Cross-References

- **Master Development Plan**: See [DEMO_DEVELOPMENT_MASTER_PLAN.md](DEMO_DEVELOPMENT_MASTER_PLAN.md)
- **Architecture Specification**: See [DEMO_ARCHITECTURE_SPECIFICATION.md](DEMO_ARCHITECTURE_SPECIFICATION.md)
- **Implementation Guide**: See [DEMO_IMPLEMENTATION_GUIDE.md](DEMO_IMPLEMENTATION_GUIDE.md)
- **Testing Strategy**: See [DEMO_TESTING_STRATEGY.md](DEMO_TESTING_STRATEGY.md)
- **Progress Tracking**: See [DEMO_PROGRESS_TRACKING.md](DEMO_PROGRESS_TRACKING.md)
- **Requirements Specification**: See [DEMO_REQUIREMENTS_SPECIFICATION.md](DEMO_REQUIREMENTS_SPECIFICATION.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-25 | Claude Sonnet 4 | Initial technical specifications |

---

**Document Status**: Active
**Next Review**: 2026-04-01
**Owner**: Technical Architecture Team
**Stakeholders**: Development Team, QA Team, DevOps Team