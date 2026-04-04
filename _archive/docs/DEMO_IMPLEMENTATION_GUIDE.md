# WREI Trading Platform - Demo Implementation Guide

**Version**: 1.0.0
**Date**: March 25, 2026
**Author**: Claude Sonnet 4 (Implementation Planning)
**Scope**: Step-by-step implementation instructions for two-stage demo system
**Context**: Development guide with context window sizing and progress tracking

---

## Table of Contents

1. [Implementation Overview](#implementation-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Stage 1 Implementation Steps](#stage-1-implementation-steps)
4. [Stage 2 Implementation Steps](#stage-2-implementation-steps)
5. [Context Window Management](#context-window-management)
6. [Progress Tracking Methodology](#progress-tracking-methodology)
7. [Quality Gates & Validation](#quality-gates--validation)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Deployment Instructions](#deployment-instructions)

---

## Implementation Overview

### Prerequisites

#### Technical Requirements
- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **Git**: Version 2.x or higher
- **Vercel CLI**: Latest version for deployment
- **IDE**: VS Code with TypeScript and React extensions recommended

#### Environment Setup
- **Anthropic API Key**: Required for AI integration
- **Vercel Account**: For deployment and hosting
- **GitHub Account**: For version control and CI/CD

#### Knowledge Requirements
- **React/Next.js**: Proficient understanding required
- **TypeScript**: Strong typing knowledge essential
- **Carbon Credit Markets**: Basic understanding of NSW ESC market
- **AI Integration**: Experience with API integration patterns

### Implementation Strategy

#### Context Window Sizing
Each implementation step is designed to fit within optimal context windows:
- **Small Tasks (2-4 hours)**: 8,000-12,000 tokens
- **Medium Tasks (4-8 hours)**: 12,000-20,000 tokens
- **Large Tasks (8+ hours)**: Split into multiple context windows

#### Progress Tracking Approach
- **Granular Task Breakdown**: Each step includes specific deliverables
- **Validation Checkpoints**: Clear success criteria for each step
- **Context Handoff Points**: Natural breakpoints for context switching
- **Rollback Procedures**: Clear rollback instructions for each step

---

## Development Environment Setup

### Step 1: Project Initialization

#### Clone and Setup Base Repository
```bash
# Clone the repository
git clone <repository-url>
cd wrei-trading-platform

# Install dependencies
npm install

# Verify installation
npm run build
npm run test
```

#### Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Configure required environment variables
echo "ANTHROPIC_API_KEY=your_api_key_here" >> .env.local
echo "NODE_ENV=development" >> .env.local
echo "DEMO_MODE=true" >> .env.local
```

#### Development Tools Setup
```bash
# Install development dependencies
npm install --save-dev @types/jest @testing-library/react @testing-library/jest-dom

# Setup Git hooks (if not already configured)
npx husky install

# Configure VS Code workspace settings
mkdir -p .vscode
cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
EOF
```

### Step 2: Baseline Validation

#### Run Existing Tests
```bash
# Ensure all existing tests pass
npm run test

# Check TypeScript compilation
npm run type-check

# Verify build process
npm run build
```

#### Baseline Performance Metrics
```bash
# Run performance baseline
npm run dev
# Access http://localhost:3000 and measure:
# - Initial page load time
# - Negotiation interface load time
# - API response times
```

**Expected Results:**
- All existing tests pass (623/623)
- TypeScript compilation successful
- Development server starts within 10 seconds
- Page load times under 2 seconds

---

## Stage 1 Implementation Steps

### Step 1: Demo Configuration Engine (8-10 hours)

#### Context Window: ~12,000 tokens

#### Task 1.1: Core Configuration Types (2-3 hours)
**Objective**: Define TypeScript interfaces for demo configuration system

**Files to Create/Modify:**
- `/lib/demo-configuration-types.ts`
- `/lib/types.ts` (extend existing)

**Implementation Steps:**

1. **Create Demo Configuration Types**
```typescript
// /lib/demo-configuration-types.ts
export interface DemoConfiguration {
  sessionId: string;
  audienceType: AudienceType;
  scenarioTemplate: ScenarioTemplate;
  parameters: DemoParameters;
  outcomes: TargetOutcome[];
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoParameters {
  marketConditions: MarketConditions;
  tradingVolume: TradingVolumeConfig;
  priceRanges: PriceRangeConfig;
  participantProfiles: ParticipantProfile[];
  regulatoryConstraints: RegulatoryConstraint[];
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  audienceType: AudienceType;
  category: ScenarioCategory;
  defaultParameters: DemoParameters;
  estimatedDuration: number;
  complexity: ComplexityLevel;
}

export enum AudienceType {
  EXECUTIVE = 'executive',
  TECHNICAL = 'technical',
  COMPLIANCE = 'compliance'
}

export enum ScenarioCategory {
  SPOT_TRADING = 'spot_trading',
  FORWARD_CONTRACTS = 'forward_contracts',
  PORTFOLIO_OPTIMIZATION = 'portfolio_optimization',
  COMPLIANCE_WORKFLOW = 'compliance_workflow'
}

export enum ComplexityLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}
```

2. **Extend Existing Types**
```typescript
// Add to /lib/types.ts
import { DemoConfiguration, DemoParameters, ScenarioTemplate } from './demo-configuration-types';

// Add to existing interfaces or create new sections
export interface ExtendedNegotiationSession {
  // ... existing properties
  demoConfiguration?: DemoConfiguration;
  isDemo: boolean;
  audienceMetrics?: AudienceMetrics;
}
```

3. **Create Validation Utilities**
```typescript
// Add to /lib/demo-configuration-types.ts
export class DemoConfigurationValidator {
  static validateConfiguration(config: DemoConfiguration): ValidationResult {
    const errors: string[] = [];

    if (!config.sessionId) {
      errors.push('Session ID is required');
    }

    if (!config.audienceType || !Object.values(AudienceType).includes(config.audienceType)) {
      errors.push('Valid audience type is required');
    }

    // Additional validation logic...

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

**Validation Checklist:**
- [ ] All TypeScript interfaces compile without errors
- [ ] Validation utilities handle edge cases
- [ ] Integration with existing types is seamless
- [ ] Code follows project naming conventions

**Context Handoff Point**: Configuration types established, ready for scenario engine implementation

#### Task 1.2: Scenario Template Engine (3-4 hours)
**Objective**: Create scenario template management system

**Files to Create/Modify:**
- `/lib/scenario-templates.ts`
- `/lib/demo-configuration-engine.ts`

**Implementation Steps:**

1. **Create Scenario Template Library**
```typescript
// /lib/scenario-templates.ts
import { ScenarioTemplate, AudienceType, ScenarioCategory, ComplexityLevel } from './demo-configuration-types';

export const SCENARIO_TEMPLATES: Record<string, ScenarioTemplate> = {
  NSW_ESC_SPOT_EXECUTIVE: {
    id: 'nsw_esc_spot_executive',
    name: 'NSW ESC Spot Trading - Executive Overview',
    description: 'High-level demonstration of NSW Energy Savings Certificate spot trading with ROI focus',
    audienceType: AudienceType.EXECUTIVE,
    category: ScenarioCategory.SPOT_TRADING,
    defaultParameters: {
      marketConditions: {
        volatility: 'moderate',
        liquidity: 'high',
        priceLevel: 'current_market'
      },
      tradingVolume: {
        size: 'large',
        frequency: 'daily'
      },
      priceRanges: {
        min: 18.50, // AUD per ESC
        max: 22.30,
        target: 20.40
      },
      participantProfiles: [
        {
          type: 'large_energy_user',
          behaviour: 'cost_focused',
          riskProfile: 'conservative'
        },
        {
          type: 'certificate_provider',
          behaviour: 'margin_focused',
          riskProfile: 'moderate'
        }
      ],
      regulatoryConstraints: [
        {
          type: 'compliance_deadline',
          value: 'quarterly',
          impact: 'price_pressure'
        }
      ]
    },
    estimatedDuration: 15, // minutes
    complexity: ComplexityLevel.BASIC
  },

  NSW_ESC_SPOT_TECHNICAL: {
    id: 'nsw_esc_spot_technical',
    name: 'NSW ESC Spot Trading - Technical Deep Dive',
    description: 'Detailed technical demonstration of trading system architecture and API integration',
    audienceType: AudienceType.TECHNICAL,
    category: ScenarioCategory.SPOT_TRADING,
    defaultParameters: {
      // Technical-focused parameters with more detail
      marketConditions: {
        volatility: 'high',
        liquidity: 'variable',
        priceLevel: 'real_time',
        dataFeeds: ['AEMO', 'ESC_Registry', 'Market_Operator']
      },
      tradingVolume: {
        size: 'variable',
        frequency: 'continuous',
        batchSizes: [100, 500, 1000, 5000]
      },
      priceRanges: {
        min: 17.80,
        max: 24.50,
        target: 'dynamic',
        spreads: {
          bid_ask: 0.05,
          market_impact: 0.02
        }
      },
      // More detailed participant and system parameters...
    },
    estimatedDuration: 45, // minutes
    complexity: ComplexityLevel.ADVANCED
  },

  NSW_ESC_COMPLIANCE: {
    id: 'nsw_esc_compliance',
    name: 'NSW ESC Compliance Workflow',
    description: 'Comprehensive compliance and audit trail demonstration',
    audienceType: AudienceType.COMPLIANCE,
    category: ScenarioCategory.COMPLIANCE_WORKFLOW,
    // ... compliance-focused configuration
    estimatedDuration: 30,
    complexity: ComplexityLevel.INTERMEDIATE
  }

  // Additional templates for forward contracts, portfolio optimization, etc.
};

export class ScenarioTemplateManager {
  static getTemplatesByAudience(audienceType: AudienceType): ScenarioTemplate[] {
    return Object.values(SCENARIO_TEMPLATES).filter(
      template => template.audienceType === audienceType
    );
  }

  static getTemplatesByCategory(category: ScenarioCategory): ScenarioTemplate[] {
    return Object.values(SCENARIO_TEMPLATES).filter(
      template => template.category === category
    );
  }

  static getTemplate(id: string): ScenarioTemplate | undefined {
    return SCENARIO_TEMPLATES[id];
  }

  static customizeTemplate(
    templateId: string,
    customizations: Partial<ScenarioTemplate>
  ): ScenarioTemplate | null {
    const baseTemplate = this.getTemplate(templateId);
    if (!baseTemplate) return null;

    return {
      ...baseTemplate,
      ...customizations,
      id: `${baseTemplate.id}_custom_${Date.now()}`,
      defaultParameters: {
        ...baseTemplate.defaultParameters,
        ...customizations.defaultParameters
      }
    };
  }
}
```

2. **Create Configuration Engine Core**
```typescript
// /lib/demo-configuration-engine.ts
import { DemoConfiguration, DemoParameters, TargetOutcome } from './demo-configuration-types';
import { ScenarioTemplateManager } from './scenario-templates';

export class DemoConfigurationEngine {
  private currentConfiguration: DemoConfiguration | null = null;

  createConfiguration(
    audienceType: AudienceType,
    scenarioId: string,
    customParameters?: Partial<DemoParameters>
  ): DemoConfiguration {
    const template = ScenarioTemplateManager.getTemplate(scenarioId);
    if (!template) {
      throw new Error(`Scenario template ${scenarioId} not found`);
    }

    const configuration: DemoConfiguration = {
      sessionId: this.generateSessionId(),
      audienceType,
      scenarioTemplate: template,
      parameters: {
        ...template.defaultParameters,
        ...customParameters
      },
      outcomes: this.generateTargetOutcomes(template),
      duration: template.estimatedDuration,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.currentConfiguration = configuration;
    return configuration;
  }

  updateConfiguration(updates: Partial<DemoConfiguration>): DemoConfiguration {
    if (!this.currentConfiguration) {
      throw new Error('No configuration to update');
    }

    this.currentConfiguration = {
      ...this.currentConfiguration,
      ...updates,
      updatedAt: new Date()
    };

    return this.currentConfiguration;
  }

  private generateSessionId(): string {
    return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTargetOutcomes(template: ScenarioTemplate): TargetOutcome[] {
    // Generate realistic target outcomes based on scenario type
    const outcomes: TargetOutcome[] = [];

    switch (template.category) {
      case ScenarioCategory.SPOT_TRADING:
        outcomes.push({
          type: 'price_discovery',
          target: 'successful_negotiation',
          metrics: ['final_price', 'negotiation_rounds', 'time_to_agreement']
        });
        break;

      case ScenarioCategory.PORTFOLIO_OPTIMIZATION:
        outcomes.push({
          type: 'portfolio_performance',
          target: 'optimized_allocation',
          metrics: ['risk_adjusted_return', 'diversification_score', 'compliance_rating']
        });
        break;

      // Additional outcome generation logic...
    }

    return outcomes;
  }
}
```

**Validation Checklist:**
- [ ] All scenario templates are valid and complete
- [ ] Configuration engine creates valid configurations
- [ ] Template customization works correctly
- [ ] Audience-specific templates are properly filtered

**Context Handoff Point**: Scenario templates and configuration engine ready, proceed to UI components

#### Task 1.3: Configuration UI Components (3-4 hours)
**Objective**: Create user interface for demo configuration

**Files to Create/Modify:**
- `/components/demo/DemoConfigurationPanel.tsx`
- `/components/demo/ScenarioSelector.tsx`
- `/components/demo/AudienceSelector.tsx`

**Implementation Steps:**

1. **Create Demo Configuration Panel**
```tsx
// /components/demo/DemoConfigurationPanel.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { DemoConfiguration, AudienceType, ScenarioCategory } from '@/lib/demo-configuration-types';
import { DemoConfigurationEngine } from '@/lib/demo-configuration-engine';
import { ScenarioTemplateManager } from '@/lib/scenario-templates';
import { AudienceSelector } from './AudienceSelector';
import { ScenarioSelector } from './ScenarioSelector';

interface DemoConfigurationPanelProps {
  onConfigurationChange: (config: DemoConfiguration) => void;
  initialConfiguration?: DemoConfiguration;
}

export const DemoConfigurationPanel: React.FC<DemoConfigurationPanelProps> = ({
  onConfigurationChange,
  initialConfiguration
}) => {
  const [audienceType, setAudienceType] = useState<AudienceType>(
    initialConfiguration?.audienceType || AudienceType.EXECUTIVE
  );
  const [selectedScenario, setSelectedScenario] = useState<string>(
    initialConfiguration?.scenarioTemplate.id || ''
  );
  const [customParameters, setCustomParameters] = useState<any>({});
  const [configuration, setConfiguration] = useState<DemoConfiguration | null>(
    initialConfiguration || null
  );

  const configEngine = new DemoConfigurationEngine();

  useEffect(() => {
    if (selectedScenario && audienceType) {
      const newConfig = configEngine.createConfiguration(
        audienceType,
        selectedScenario,
        customParameters
      );
      setConfiguration(newConfig);
      onConfigurationChange(newConfig);
    }
  }, [audienceType, selectedScenario, customParameters]);

  const handleAudienceChange = (newAudienceType: AudienceType) => {
    setAudienceType(newAudienceType);
    // Reset scenario selection when audience changes
    setSelectedScenario('');
  };

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Demo Configuration
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure your demonstration scenario and audience preferences
        </p>
      </div>

      <AudienceSelector
        selectedAudience={audienceType}
        onAudienceChange={handleAudienceChange}
      />

      {audienceType && (
        <ScenarioSelector
          audienceType={audienceType}
          selectedScenario={selectedScenario}
          onScenarioChange={handleScenarioChange}
        />
      )}

      {configuration && (
        <div className="bg-gray-50 rounded-md p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Configuration Summary
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Audience:</span>
              <span className="ml-2 font-medium">{configuration.audienceType}</span>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <span className="ml-2 font-medium">{configuration.duration} min</span>
            </div>
            <div>
              <span className="text-gray-500">Scenario:</span>
              <span className="ml-2 font-medium">{configuration.scenarioTemplate.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Complexity:</span>
              <span className="ml-2 font-medium">{configuration.scenarioTemplate.complexity}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          onClick={() => {
            setAudienceType(AudienceType.EXECUTIVE);
            setSelectedScenario('');
            setCustomParameters({});
          }}
        >
          Reset
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          disabled={!configuration}
        >
          Start Demo
        </button>
      </div>
    </div>
  );
};
```

2. **Create Audience Selector Component**
```tsx
// /components/demo/AudienceSelector.tsx
'use client'

import React from 'react';
import { AudienceType } from '@/lib/demo-configuration-types';

interface AudienceSelectorProps {
  selectedAudience: AudienceType;
  onAudienceChange: (audience: AudienceType) => void;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  selectedAudience,
  onAudienceChange
}) => {
  const audienceOptions = [
    {
      type: AudienceType.EXECUTIVE,
      title: 'Executive Audience',
      description: 'High-level overview focused on ROI, market opportunity, and strategic positioning',
      icon: '👔',
      duration: '15-30 min',
      focus: 'Business outcomes, competitive advantage, revenue potential'
    },
    {
      type: AudienceType.TECHNICAL,
      title: 'Technical Audience',
      description: 'In-depth technical demonstration of system architecture and integration capabilities',
      icon: '⚙️',
      duration: '45-90 min',
      focus: 'System architecture, API integration, scalability, performance'
    },
    {
      type: AudienceType.COMPLIANCE,
      title: 'Compliance Audience',
      description: 'Regulatory compliance, audit trails, and risk management demonstration',
      icon: '📋',
      duration: '30-60 min',
      focus: 'Regulatory adherence, audit trails, compliance reporting'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Select Audience Type</h3>
      <div className="grid grid-cols-1 gap-4">
        {audienceOptions.map((option) => (
          <div
            key={option.type}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
              selectedAudience === option.type
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onAudienceChange(option.type)}
          >
            <div className="flex items-start space-x-4">
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-medium text-gray-900">
                    {option.title}
                  </h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {option.duration}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {option.description}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">Focus areas: </span>
                  <span className="text-xs text-gray-700">{option.focus}</span>
                </div>
              </div>
            </div>
            {selectedAudience === option.type && (
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

3. **Create Scenario Selector Component**
```tsx
// /components/demo/ScenarioSelector.tsx
'use client'

import React from 'react';
import { AudienceType, ScenarioTemplate } from '@/lib/demo-configuration-types';
import { ScenarioTemplateManager } from '@/lib/scenario-templates';

interface ScenarioSelectorProps {
  audienceType: AudienceType;
  selectedScenario: string;
  onScenarioChange: (scenarioId: string) => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  audienceType,
  selectedScenario,
  onScenarioChange
}) => {
  const availableScenarios = ScenarioTemplateManager.getTemplatesByAudience(audienceType);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      spot_trading: 'bg-green-100 text-green-800',
      forward_contracts: 'bg-blue-100 text-blue-800',
      portfolio_optimization: 'bg-purple-100 text-purple-800',
      compliance_workflow: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getComplexityIcon = (complexity: string) => {
    const icons: Record<string, string> = {
      basic: '⭐',
      intermediate: '⭐⭐',
      advanced: '⭐⭐⭐'
    };
    return icons[complexity] || '⭐';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Select Scenario Template
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {availableScenarios.map((scenario) => (
          <div
            key={scenario.id}
            className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
              selectedScenario === scenario.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onScenarioChange(scenario.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-base font-medium text-gray-900">
                {scenario.name}
              </h4>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(scenario.category)}`}>
                  {scenario.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500" title={`${scenario.complexity} complexity`}>
                  {getComplexityIcon(scenario.complexity)}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {scenario.description}
            </p>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Estimated duration: {scenario.estimatedDuration} minutes</span>
              <span>Complexity: {scenario.complexity}</span>
            </div>
            {selectedScenario === scenario.id && (
              <div className="absolute top-2 right-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {availableScenarios.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No scenarios available for {audienceType} audience.</p>
          <p className="text-sm mt-1">Please select a different audience type.</p>
        </div>
      )}
    </div>
  );
};
```

**Validation Checklist:**
- [ ] All UI components render without errors
- [ ] Audience selection updates available scenarios
- [ ] Scenario selection creates valid configuration
- [ ] Configuration summary displays correctly
- [ ] UI is responsive and follows design guidelines

**Context Handoff Point**: Demo Configuration Engine complete, ready for Enhanced Negotiation Analytics

### Step 2: Enhanced Negotiation Analytics (6-8 hours)

#### Context Window: ~15,000 tokens

#### Task 2.1: Real-time Analytics Engine (3-4 hours)
**Objective**: Create sophisticated real-time analytics for negotiation monitoring

**Files to Create/Modify:**
- `/lib/demo-analytics-engine.ts`
- `/lib/analytics-types.ts`
- `/components/demo/AnalyticsDashboard.tsx`

**Implementation Steps:**

1. **Create Analytics Types and Interfaces**
```typescript
// /lib/analytics-types.ts
export interface RealTimeAnalytics {
  sessionId: string;
  timestamp: number;
  negotiationMetrics: NegotiationMetrics;
  performanceMetrics: PerformanceMetrics;
  marketMetrics: MarketMetrics;
  audienceMetrics: AudienceMetrics;
}

export interface NegotiationMetrics {
  currentRound: number;
  totalRounds: number;
  currentPrice: number;
  priceMovement: PriceMovement;
  negotiationProgress: number; // 0-100%
  timeElapsed: number;
  estimatedTimeRemaining: number;
  participantEngagement: ParticipantEngagement;
}

export interface PerformanceMetrics {
  responseTime: number;
  apiLatency: number;
  calculationSpeed: number;
  throughput: number;
  errorRate: number;
  systemHealth: SystemHealth;
}

export interface MarketMetrics {
  marketPosition: number; // -100 to 100 (seller to buyer advantage)
  competitiveAnalysis: CompetitiveAnalysis;
  marketEfficiency: number; // 0-100%
  liquidityIndex: number;
  volatilityMeasure: number;
  benchmarkComparison: BenchmarkComparison;
}

export interface AudienceMetrics {
  engagementLevel: number; // 0-100%
  comprehensionScore: number;
  attentionSpan: number;
  interactionFrequency: number;
  questionTypes: QuestionType[];
  satisfactionIndicators: SatisfactionIndicator[];
}

export interface PriceMovement {
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  velocity: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: number;
}

export interface CompetitiveAnalysis {
  positionVsMarket: number; // -100 to 100
  advantageAreas: string[];
  improvementAreas: string[];
  marketShare: number;
  competitorComparison: CompetitorMetric[];
}

export interface BenchmarkComparison {
  industryAverage: number;
  topQuartile: number;
  bottomQuartile: number;
  currentPosition: number;
  ranking: number;
  improvementOpportunity: number;
}
```

2. **Create Demo Analytics Engine**
```typescript
// /lib/demo-analytics-engine.ts
import { RealTimeAnalytics, NegotiationMetrics, PerformanceMetrics, MarketMetrics, AudienceMetrics } from './analytics-types';
import { DemoConfiguration } from './demo-configuration-types';
import { NegotiationRound } from './types';

export class DemoAnalyticsEngine {
  private sessionId: string;
  private configuration: DemoConfiguration;
  private startTime: number;
  private analytics: RealTimeAnalytics;
  private updateCallbacks: ((analytics: RealTimeAnalytics) => void)[] = [];

  constructor(sessionId: string, configuration: DemoConfiguration) {
    this.sessionId = sessionId;
    this.configuration = configuration;
    this.startTime = Date.now();
    this.analytics = this.initializeAnalytics();
  }

  private initializeAnalytics(): RealTimeAnalytics {
    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      negotiationMetrics: {
        currentRound: 0,
        totalRounds: 0,
        currentPrice: this.configuration.parameters.priceRanges.target,
        priceMovement: {
          direction: 'stable',
          magnitude: 0,
          velocity: 0,
          trend: 'neutral',
          momentum: 0
        },
        negotiationProgress: 0,
        timeElapsed: 0,
        estimatedTimeRemaining: this.configuration.duration * 60 * 1000,
        participantEngagement: {
          buyer: { level: 50, indicators: [] },
          seller: { level: 50, indicators: [] }
        }
      },
      performanceMetrics: {
        responseTime: 0,
        apiLatency: 0,
        calculationSpeed: 0,
        throughput: 0,
        errorRate: 0,
        systemHealth: {
          status: 'healthy',
          cpuUsage: 0,
          memoryUsage: 0,
          networkLatency: 0
        }
      },
      marketMetrics: {
        marketPosition: 0,
        competitiveAnalysis: {
          positionVsMarket: 75, // WREI premium positioning
          advantageAreas: ['AI negotiation', 'Real-time pricing', 'Compliance automation'],
          improvementAreas: ['Market penetration', 'Brand awareness'],
          marketShare: 5.2,
          competitorComparison: [
            { name: 'Traditional Brokers', score: 60 },
            { name: 'Digital Platforms', score: 70 },
            { name: 'WREI Platform', score: 85 }
          ]
        },
        marketEfficiency: 78,
        liquidityIndex: 82,
        volatilityMeasure: 15.3,
        benchmarkComparison: {
          industryAverage: 65,
          topQuartile: 80,
          bottomQuartile: 45,
          currentPosition: 85,
          ranking: 3,
          improvementOpportunity: 15
        }
      },
      audienceMetrics: {
        engagementLevel: 100, // Start high for demo
        comprehensionScore: 90,
        attentionSpan: 100,
        interactionFrequency: 0,
        questionTypes: [],
        satisfactionIndicators: [
          { type: 'interest', value: 90 },
          { type: 'understanding', value: 85 },
          { type: 'relevance', value: 95 }
        ]
      }
    };
  }

  updateFromNegotiationRound(round: NegotiationRound): void {
    const currentTime = Date.now();
    const timeElapsed = currentTime - this.startTime;

    // Update negotiation metrics
    this.analytics.negotiationMetrics = {
      ...this.analytics.negotiationMetrics,
      currentRound: round.round,
      totalRounds: round.round,
      currentPrice: round.buyerOffer || round.sellerOffer || this.analytics.negotiationMetrics.currentPrice,
      timeElapsed,
      negotiationProgress: this.calculateNegotiationProgress(round),
      estimatedTimeRemaining: this.estimateTimeRemaining(round, timeElapsed),
      priceMovement: this.calculatePriceMovement(round)
    };

    // Update performance metrics
    this.analytics.performanceMetrics = {
      ...this.analytics.performanceMetrics,
      responseTime: round.responseTime || 0,
      apiLatency: round.apiLatency || 0
    };

    // Update audience engagement based on scenario progress
    this.updateAudienceMetrics(round, timeElapsed);

    this.analytics.timestamp = currentTime;
    this.notifyCallbacks();
  }

  private calculateNegotiationProgress(round: NegotiationRound): number {
    const maxRounds = 10; // Typical negotiation length
    const roundProgress = (round.round / maxRounds) * 100;

    // Factor in price convergence
    const targetPrice = this.configuration.parameters.priceRanges.target;
    const currentPrice = round.buyerOffer || round.sellerOffer || targetPrice;
    const priceRange = this.configuration.parameters.priceRanges.max - this.configuration.parameters.priceRanges.min;
    const priceConvergence = 100 - (Math.abs(currentPrice - targetPrice) / priceRange) * 100;

    return Math.min(100, (roundProgress * 0.6) + (priceConvergence * 0.4));
  }

  private calculatePriceMovement(round: NegotiationRound): PriceMovement {
    const previousPrice = this.analytics.negotiationMetrics.currentPrice;
    const currentPrice = round.buyerOffer || round.sellerOffer || previousPrice;
    const priceDiff = currentPrice - previousPrice;

    return {
      direction: priceDiff > 0 ? 'up' : priceDiff < 0 ? 'down' : 'stable',
      magnitude: Math.abs(priceDiff),
      velocity: Math.abs(priceDiff) / (round.responseTime || 1),
      trend: this.determinePriceTrend(priceDiff),
      momentum: this.calculateMomentum(priceDiff)
    };
  }

  private determinePriceTrend(priceDiff: number): 'bullish' | 'bearish' | 'neutral' {
    if (Math.abs(priceDiff) < 0.1) return 'neutral';
    return priceDiff > 0 ? 'bullish' : 'bearish';
  }

  private calculateMomentum(priceDiff: number): number {
    // Simple momentum calculation - in real implementation, this would use historical data
    return Math.min(100, Math.abs(priceDiff) * 10);
  }

  private estimateTimeRemaining(round: NegotiationRound, timeElapsed: number): number {
    const averageRoundTime = timeElapsed / round.round;
    const estimatedRemainingRounds = Math.max(0, 8 - round.round); // Estimate 8 rounds total
    return estimatedRemainingRounds * averageRoundTime;
  }

  private updateAudienceMetrics(round: NegotiationRound, timeElapsed: number): void {
    const durationMinutes = timeElapsed / (1000 * 60);
    const targetDuration = this.configuration.duration;

    // Simulate audience engagement based on time and interaction
    let engagementLevel = 100;

    // Decrease engagement over time (attention span)
    if (durationMinutes > targetDuration * 0.7) {
      engagementLevel -= (durationMinutes - targetDuration * 0.7) * 5;
    }

    // Increase engagement with successful negotiations
    if (round.agreement) {
      engagementLevel += 10;
    }

    // Factor in audience type
    switch (this.configuration.audienceType) {
      case 'executive':
        // Executives want quick, high-level results
        if (durationMinutes > 20) engagementLevel -= 2;
        break;
      case 'technical':
        // Technical audiences can handle longer sessions
        if (durationMinutes > 60) engagementLevel -= 1;
        break;
      case 'compliance':
        // Compliance audiences focus on process
        if (!round.complianceNotes) engagementLevel -= 3;
        break;
    }

    this.analytics.audienceMetrics = {
      ...this.analytics.audienceMetrics,
      engagementLevel: Math.max(0, Math.min(100, engagementLevel)),
      attentionSpan: Math.max(0, 100 - (durationMinutes / targetDuration) * 100),
      interactionFrequency: round.round / durationMinutes || 0
    };
  }

  subscribeToUpdates(callback: (analytics: RealTimeAnalytics) => void): void {
    this.updateCallbacks.push(callback);
  }

  unsubscribeFromUpdates(callback: (analytics: RealTimeAnalytics) => void): void {
    this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
  }

  private notifyCallbacks(): void {
    this.updateCallbacks.forEach(callback => callback(this.analytics));
  }

  getCurrentAnalytics(): RealTimeAnalytics {
    return { ...this.analytics };
  }

  generateAnalyticsReport(): AnalyticsReport {
    return {
      sessionSummary: {
        sessionId: this.sessionId,
        duration: this.analytics.negotiationMetrics.timeElapsed,
        totalRounds: this.analytics.negotiationMetrics.totalRounds,
        finalPrice: this.analytics.negotiationMetrics.currentPrice,
        success: this.analytics.negotiationMetrics.negotiationProgress > 80
      },
      performanceSummary: {
        averageResponseTime: this.analytics.performanceMetrics.responseTime,
        systemReliability: 100 - this.analytics.performanceMetrics.errorRate,
        efficiency: this.analytics.marketMetrics.marketEfficiency
      },
      audienceSummary: {
        overallEngagement: this.analytics.audienceMetrics.engagementLevel,
        comprehension: this.analytics.audienceMetrics.comprehensionScore,
        satisfaction: this.calculateOverallSatisfaction()
      },
      recommendations: this.generateRecommendations()
    };
  }

  private calculateOverallSatisfaction(): number {
    const indicators = this.analytics.audienceMetrics.satisfactionIndicators;
    const average = indicators.reduce((sum, indicator) => sum + indicator.value, 0) / indicators.length;
    return Math.round(average);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.analytics;

    if (analytics.audienceMetrics.engagementLevel < 70) {
      recommendations.push('Consider shortening demo duration or adding more interactive elements');
    }

    if (analytics.performanceMetrics.responseTime > 3000) {
      recommendations.push('Optimize API response times for better user experience');
    }

    if (analytics.negotiationMetrics.negotiationProgress < 60) {
      recommendations.push('Adjust negotiation parameters to improve success rates');
    }

    if (analytics.marketMetrics.competitiveAnalysis.positionVsMarket < 70) {
      recommendations.push('Highlight unique value propositions more prominently');
    }

    return recommendations;
  }
}

// Additional interfaces
export interface AnalyticsReport {
  sessionSummary: SessionSummary;
  performanceSummary: PerformanceSummary;
  audienceSummary: AudienceSummary;
  recommendations: string[];
}

export interface SessionSummary {
  sessionId: string;
  duration: number;
  totalRounds: number;
  finalPrice: number;
  success: boolean;
}

export interface PerformanceSummary {
  averageResponseTime: number;
  systemReliability: number;
  efficiency: number;
}

export interface AudienceSummary {
  overallEngagement: number;
  comprehension: number;
  satisfaction: number;
}
```

**Validation Checklist:**
- [ ] Analytics engine initializes correctly with demo configuration
- [ ] Real-time metrics update properly from negotiation rounds
- [ ] Performance metrics track system health accurately
- [ ] Audience engagement metrics reflect demo progress
- [ ] Analytics reports generate with comprehensive insights

**Context Handoff Point**: Real-time analytics engine complete, ready for dashboard implementation

#### Task 2.2: Analytics Dashboard Component (3-4 hours)
**Objective**: Create comprehensive analytics dashboard for real-time demo monitoring

**Files to Create/Modify:**
- `/components/demo/AnalyticsDashboard.tsx`
- `/components/demo/analytics/MetricCard.tsx`
- `/components/demo/analytics/ProgressChart.tsx`
- `/components/demo/analytics/PerformanceGauge.tsx`

**Implementation Steps:**

1. **Create Analytics Dashboard Component**
```tsx
// /components/demo/AnalyticsDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { RealTimeAnalytics } from '@/lib/analytics-types';
import { DemoAnalyticsEngine } from '@/lib/demo-analytics-engine';
import { MetricCard } from './analytics/MetricCard';
import { ProgressChart } from './analytics/ProgressChart';
import { PerformanceGauge } from './analytics/PerformanceGauge';
import { AudienceType } from '@/lib/demo-configuration-types';

interface AnalyticsDashboardProps {
  analyticsEngine: DemoAnalyticsEngine;
  audienceType: AudienceType;
  isVisible: boolean;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analyticsEngine,
  audienceType,
  isVisible
}) => {
  const [analytics, setAnalytics] = useState<RealTimeAnalytics>(
    analyticsEngine.getCurrentAnalytics()
  );
  const [selectedTab, setSelectedTab] = useState<'overview' | 'performance' | 'market' | 'audience'>('overview');

  useEffect(() => {
    const updateAnalytics = (newAnalytics: RealTimeAnalytics) => {
      setAnalytics(newAnalytics);
    };

    analyticsEngine.subscribeToUpdates(updateAnalytics);

    return () => {
      analyticsEngine.unsubscribeFromUpdates(updateAnalytics);
    };
  }, [analyticsEngine]);

  if (!isVisible) return null;

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Negotiation Progress"
        value={`${Math.round(analytics.negotiationMetrics.negotiationProgress)}%`}
        change={analytics.negotiationMetrics.priceMovement.direction}
        trend="up"
        color="blue"
      />
      <MetricCard
        title="Current Price"
        value={`$${analytics.negotiationMetrics.currentPrice.toFixed(2)}`}
        change={`${analytics.negotiationMetrics.priceMovement.magnitude > 0 ? '+' : ''}${analytics.negotiationMetrics.priceMovement.magnitude.toFixed(2)}`}
        trend={analytics.negotiationMetrics.priceMovement.direction === 'up' ? 'up' : analytics.negotiationMetrics.priceMovement.direction === 'down' ? 'down' : 'neutral'}
        color="green"
      />
      <MetricCard
        title="Time Elapsed"
        value={`${Math.floor(analytics.negotiationMetrics.timeElapsed / 60000)}:${Math.floor((analytics.negotiationMetrics.timeElapsed % 60000) / 1000).toString().padStart(2, '0')}`}
        change={`${Math.floor(analytics.negotiationMetrics.estimatedTimeRemaining / 60000)} min left`}
        trend="neutral"
        color="orange"
      />
      <MetricCard
        title="Engagement Level"
        value={`${Math.round(analytics.audienceMetrics.engagementLevel)}%`}
        change={analytics.audienceMetrics.engagementLevel > 80 ? 'Excellent' : analytics.audienceMetrics.engagementLevel > 60 ? 'Good' : 'Needs attention'}
        trend={analytics.audienceMetrics.engagementLevel > 70 ? 'up' : 'down'}
        color="purple"
      />
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceGauge
          title="System Health"
          value={analytics.performanceMetrics.systemHealth.status === 'healthy' ? 100 : 50}
          maxValue={100}
          color="green"
          unit="%"
        />
        <PerformanceGauge
          title="Response Time"
          value={analytics.performanceMetrics.responseTime}
          maxValue={5000}
          color="blue"
          unit="ms"
        />
        <PerformanceGauge
          title="API Latency"
          value={analytics.performanceMetrics.apiLatency}
          maxValue={3000}
          color="orange"
          unit="ms"
        />
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Error Rate:</span>
            <span className="ml-2 font-medium">{analytics.performanceMetrics.errorRate.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Throughput:</span>
            <span className="ml-2 font-medium">{analytics.performanceMetrics.throughput.toFixed(0)} req/min</span>
          </div>
          <div>
            <span className="text-gray-500">CPU Usage:</span>
            <span className="ml-2 font-medium">{analytics.performanceMetrics.systemHealth.cpuUsage.toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-gray-500">Memory Usage:</span>
            <span className="ml-2 font-medium">{analytics.performanceMetrics.systemHealth.memoryUsage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarketTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Market Position</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">vs Industry Average</span>
              <span className="font-medium text-green-600">+{analytics.marketMetrics.competitiveAnalysis.positionVsMarket}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Efficiency</span>
              <span className="font-medium">{analytics.marketMetrics.marketEfficiency}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Liquidity Index</span>
              <span className="font-medium">{analytics.marketMetrics.liquidityIndex}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Market Share</span>
              <span className="font-medium">{analytics.marketMetrics.competitiveAnalysis.marketShare}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Competitive Analysis</h3>
          <div className="space-y-3">
            {analytics.marketMetrics.competitiveAnalysis.competitorComparison.map((competitor, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-600">{competitor.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        competitor.name.includes('WREI') ? 'bg-blue-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${competitor.score}%` }}
                    />
                  </div>
                  <span className="font-medium text-sm">{competitor.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Key Advantages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-600 mb-2">Strength Areas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {analytics.marketMetrics.competitiveAnalysis.advantageAreas.map((advantage, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-orange-600 mb-2">Improvement Areas</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              {analytics.marketMetrics.competitiveAnalysis.improvementAreas.map((area, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudienceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PerformanceGauge
          title="Engagement Level"
          value={analytics.audienceMetrics.engagementLevel}
          maxValue={100}
          color="purple"
          unit="%"
        />
        <PerformanceGauge
          title="Comprehension"
          value={analytics.audienceMetrics.comprehensionScore}
          maxValue={100}
          color="blue"
          unit="%"
        />
        <PerformanceGauge
          title="Attention Span"
          value={analytics.audienceMetrics.attentionSpan}
          maxValue={100}
          color="green"
          unit="%"
        />
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Satisfaction Indicators</h3>
        <div className="space-y-4">
          {analytics.audienceMetrics.satisfactionIndicators.map((indicator, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-600 capitalize">{indicator.type}</span>
              <div className="flex items-center space-x-3">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${indicator.value}%` }}
                  />
                </div>
                <span className="font-medium text-sm w-12">{indicator.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audience Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Interaction Patterns</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Questions Asked:</span>
                <span className="font-medium">{analytics.audienceMetrics.questionTypes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Interaction Frequency:</span>
                <span className="font-medium">{analytics.audienceMetrics.interactionFrequency.toFixed(1)}/min</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Audience Type: {audienceType}</h4>
            <div className="text-sm text-gray-600">
              {audienceType === 'executive' && (
                <p>Focus on high-level outcomes, ROI, and strategic positioning. Keep technical details minimal.</p>
              )}
              {audienceType === 'technical' && (
                <p>Provide detailed system architecture, integration capabilities, and performance metrics.</p>
              )}
              {audienceType === 'compliance' && (
                <p>Emphasize regulatory adherence, audit trails, and compliance reporting capabilities.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'market', label: 'Market', icon: '📈' },
    { id: 'audience', label: 'Audience', icon: '👥' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Demo Analytics Dashboard
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date(analytics.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setSelectedTab(tab.id as any)}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'performance' && renderPerformanceTab()}
        {selectedTab === 'market' && renderMarketTab()}
        {selectedTab === 'audience' && renderAudienceTab()}
      </div>
    </div>
  );
};
```

2. **Create Supporting Analytics Components**
```tsx
// /components/demo/analytics/MetricCard.tsx
'use client'

import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  trend,
  color
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200'
  };

  const trendIcons = {
    up: '↗️',
    down: '↘️',
    neutral: '➡️'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`bg-white rounded-lg p-4 border-2 ${colorClasses[color]} shadow-sm`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <span className="text-lg">{trendIcons[trend]}</span>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm mt-1 ${trendColors[trend]}`}>{change}</p>
        )}
      </div>
    </div>
  );
};
```

```tsx
// /components/demo/analytics/PerformanceGauge.tsx
'use client'

import React from 'react';

interface PerformanceGaugeProps {
  title: string;
  value: number;
  maxValue: number;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  unit: string;
}

export const PerformanceGauge: React.FC<PerformanceGaugeProps> = ({
  title,
  value,
  maxValue,
  color,
  unit
}) => {
  const percentage = Math.min(100, (value / maxValue) * 100);

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  };

  const backgroundColors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-600 mb-3">{title}</h3>
      <div className="relative mb-3">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${backgroundColors[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className={`text-lg font-bold ${colorClasses[color]}`}>
          {value.toLocaleString()}{unit}
        </span>
        <span className="text-sm text-gray-500">
          of {maxValue.toLocaleString()}{unit}
        </span>
      </div>
    </div>
  );
};
```

**Validation Checklist:**
- [ ] Analytics dashboard renders without errors
- [ ] All tabs display correct data and metrics
- [ ] Real-time updates work properly with analytics engine
- [ ] Performance gauges and metric cards display accurately
- [ ] Dashboard is responsive and follows design guidelines
- [ ] Audience-specific insights display correctly

**Context Handoff Point**: Enhanced Negotiation Analytics complete, ready for Multi-Audience Interface System

### [Continue with remaining implementation steps...]

---

**NOTE**: This implementation guide continues with the remaining steps for Stage 1 and Stage 2. Each step follows the same pattern with:
- Clear objectives and context window sizing
- Detailed implementation steps with code examples
- Validation checklists
- Context handoff points for seamless development flow

The complete guide would include all 14 development steps as outlined in the master development plan, with specific attention to:
- Context window management for optimal development sessions
- Progress tracking methodology
- Quality gates and validation criteria
- Troubleshooting procedures for common issues
- Deployment instructions for both development and production environments

---

## Cross-References

- **Master Development Plan**: See [DEMO_DEVELOPMENT_MASTER_PLAN.md](DEMO_DEVELOPMENT_MASTER_PLAN.md)
- **Architecture Details**: See [DEMO_ARCHITECTURE_SPECIFICATION.md](DEMO_ARCHITECTURE_SPECIFICATION.md)
- **Testing Strategy**: See [DEMO_TESTING_STRATEGY.md](DEMO_TESTING_STRATEGY.md)
- **Progress Tracking**: See [DEMO_PROGRESS_TRACKING.md](DEMO_PROGRESS_TRACKING.md)
- **Technical Specifications**: See [DEMO_TECHNICAL_SPECIFICATIONS.md](DEMO_TECHNICAL_SPECIFICATIONS.md)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-03-25 | Claude Sonnet 4 | Initial comprehensive implementation guide |

---

**Document Status**: Active
**Next Review**: 2026-04-01
**Owner**: Development Team Lead
**Stakeholders**: Development Team, QA Team, DevOps Team