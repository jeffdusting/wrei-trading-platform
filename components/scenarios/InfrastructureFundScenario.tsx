'use client';

import { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { ProfessionalDataGrid, samplePortfolioColumns } from '@/components/professional/ProfessionalDataGrid';
import { ScenarioEngine, createSimulationEnvironment } from '@/lib/simulation';

interface InfrastructureFundScenarioProps {
  onComplete: (result: ScenarioResult) => void;
  onExit: () => void;
}

interface ScenarioResult {
  decision: 'proceed' | 'defer' | 'reject';
  confidence: number;
  reportGenerated: boolean;
  timeToDecision: number;
  keyFindings: string[];
}

export const InfrastructureFundScenario: React.FC<InfrastructureFundScenarioProps> = ({
  onComplete,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');
  const [currentPhase, setCurrentPhase] = useState<'discovery' | 'analysis' | 'evaluation' | 'decision' | 'reporting'>('discovery');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [scenarioStartTime] = useState(Date.now());
  const [simulation, setSimulation] = useState<any>(null);

  // Initialize simulation environment
  useEffect(() => {
    const sarahChenPersona = {
      id: 'infrastructure-fund',
      name: 'Sarah Chen',
      role: 'Senior Portfolio Manager',
      organization: 'Australian Infrastructure Fund',
      aum: 'A$5B',
      experience: '15 years institutional investing',
      techComfort: 'High' as const,
      investmentAuthority: 'A$250M allocation',
      keyDrivers: ['Risk-adjusted returns', 'Regulatory compliance', 'Portfolio diversification'],
      preferences: {
        communicationStyle: 'professional' as const,
        riskTolerance: 'moderate' as const,
        decisionMakingSpeed: 'deliberate' as const,
        dataDetailLevel: 'comprehensive' as const,
        complianceRequirements: ['AFSL compliance', 'Wholesale client verification', 'Investment committee approval']
      }
    };

    const simEnv = createSimulationEnvironment({
      scenarioId: 'infrastructure-fund-discovery',
      persona: sarahChenPersona
    });

    setSimulation(simEnv);

    // Record scenario start milestone
    simEnv.performanceTracker.recordMilestone(simEnv.sessionId, 'scenario_started', 'critical', {
      persona: 'Sarah Chen',
      organization: 'Australian Infrastructure Fund',
      targetAllocation: 'A$250M'
    });

    return () => {
      if (simEnv) {
        simEnv.endSession('completed');
      }
    };
  }, []);

  const handleStepCompletion = async (stepId: string, data?: any) => {
    if (!simulation) return;

    setCompletedSteps(prev => [...prev, stepId]);

    // Record step completion in simulation
    await simulation.executeAction(stepId, data);

    // Update analysis data if provided
    if (data) {
      setAnalysisData((prev: any) => ({ ...prev, [stepId]: data }));
    }

    // Progress to next phase based on completed steps
    updatePhaseBasedOnProgress();
  };

  const updatePhaseBasedOnProgress = () => {
    const totalSteps = completedSteps.length;

    if (totalSteps >= 8) {
      setCurrentPhase('reporting');
    } else if (totalSteps >= 6) {
      setCurrentPhase('decision');
    } else if (totalSteps >= 4) {
      setCurrentPhase('evaluation');
    } else if (totalSteps >= 2) {
      setCurrentPhase('analysis');
    }
  };

  const generateInvestmentCommitteeReport = () => {
    const reportData = {
      assetClass: 'WREI Carbon Credits',
      recommendation: 'PROCEED',
      targetAllocation: 'A$25M (10% of alternative allocation)',
      keyMetrics: {
        expectedIRR: '8.7%',
        riskAdjustedReturn: '6.2%',
        volatility: '23%',
        sharpeRatio: '1.24',
        correlationToInfraREITs: '0.15'
      },
      riskFactors: [
        'Regulatory changes in carbon pricing',
        'Market liquidity in secondary trading',
        'Technology risk in verification systems'
      ],
      mitigationStrategies: [
        'Diversified vintage allocation (2024-2026)',
        'Geographic diversification across jurisdictions',
        'Partnership with verified project developers'
      ],
      complianceNotes: [
        'AFSL requirements satisfied',
        'Wholesale client classification confirmed',
        'Investment committee approval required'
      ]
    };

    return reportData;
  };

  const containerStyles = {
    backgroundColor: tokens.colors.surface.primary,
    color: tokens.colors.text.primary,
    minHeight: '100vh',
    fontFamily: tokens.typography.families.interface
  };

  const headerStyles = {
    padding: tokens.spacing[6],
    borderBottom: `1px solid ${tokens.colors.surface.tertiary}`,
    backgroundColor: tokens.colors.surface.secondary
  };

  const contentStyles = {
    padding: tokens.spacing[6],
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: tokens.spacing[6],
    height: 'calc(100vh - 120px)'
  };

  const sidebarStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    height: 'fit-content'
  };

  return (
    <div style={containerStyles}>
      {/* Scenario Header */}
      <div style={headerStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.sizes['2xl'],
              fontWeight: tokens.typography.weights.bold,
              margin: 0,
              marginBottom: tokens.spacing[2]
            }}>
              Infrastructure Fund Carbon Credit Evaluation
            </h1>
            <div style={{
              fontSize: tokens.typography.sizes.md,
              color: tokens.colors.text.secondary
            }}>
              Sarah Chen • Senior Portfolio Manager • Australian Infrastructure Fund (A$5B AUM)
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
            <PhaseIndicator currentPhase={currentPhase} tokens={tokens} />
            <button
              onClick={onExit}
              style={{
                padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
                backgroundColor: tokens.colors.surface.tertiary,
                border: `1px solid ${tokens.colors.surface.elevated}`,
                borderRadius: tokens.borderRadius.md,
                color: tokens.colors.text.primary,
                cursor: 'pointer'
              }}
            >
              Exit Scenario
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyles}>
        <div>
          <ScenarioContent
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            onStepComplete={handleStepCompletion}
            tokens={tokens}
            analysisData={analysisData}
            simulation={simulation}
          />
        </div>

        {/* Progress Sidebar */}
        <div style={sidebarStyles}>
          <ProgressSidebar
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            tokens={tokens}
            simulation={simulation}
          />
        </div>
      </div>
    </div>
  );
};

// Supporting Components
const PhaseIndicator: React.FC<{ currentPhase: string; tokens: any }> = ({ currentPhase, tokens }) => {
  const phases = ['discovery', 'analysis', 'evaluation', 'decision', 'reporting'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
      {phases.map((phase, index) => (
        <div
          key={phase}
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.sizes.xs,
            backgroundColor: index <= currentIndex ? tokens.colors.accent.primary : tokens.colors.surface.tertiary,
            color: index <= currentIndex ? tokens.colors.surface.primary : tokens.colors.text.secondary,
            fontWeight: tokens.typography.weights.medium
          }}
        >
          {phase.toUpperCase()}
        </div>
      ))}
    </div>
  );
};

const ScenarioContent: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  analysisData: any;
  simulation: any;
}> = ({ currentPhase, completedSteps, onStepComplete, tokens, analysisData, simulation }) => {
  switch (currentPhase) {
    case 'discovery':
      return <DiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} />;
    case 'analysis':
      return <AnalysisPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
    case 'evaluation':
      return <EvaluationPhase onStepComplete={onStepComplete} tokens={tokens} analysisData={analysisData} />;
    case 'decision':
      return <DecisionPhase onStepComplete={onStepComplete} tokens={tokens} analysisData={analysisData} />;
    case 'reporting':
      return <ReportingPhase onStepComplete={onStepComplete} tokens={tokens} analysisData={analysisData} />;
    default:
      return <DiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} />;
  }
};

const DiscoveryPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
}> = ({ onStepComplete, tokens }) => {
  const [reviewedValueProp, setReviewedValueProp] = useState(false);
  const [accessedProfessional, setAccessedProfessional] = useState(false);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Platform Discovery & Initial Assessment
      </h2>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <ActionCard
          title="Review Value Proposition"
          description="Understand WREI's institutional offering for infrastructure funds"
          completed={reviewedValueProp}
          onComplete={() => {
            setReviewedValueProp(true);
            onStepComplete('review_value_proposition', {
              keyInsights: [
                'Institutional minimum: A$10M',
                'Target IRR: 8% over 5 years',
                'Infrastructure correlation: Low (0.15)',
                'ESG compliance: Verified carbon credits'
              ]
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Access Professional Interface"
          description="Validate professional investor status and access institutional features"
          completed={accessedProfessional}
          disabled={!reviewedValueProp}
          onComplete={() => {
            setAccessedProfessional(true);
            onStepComplete('access_professional_interface', {
              investorClassification: 'Professional',
              aumVerified: 'A$5B',
              accessLevel: 'Institutional',
              features: ['Advanced analytics', 'Portfolio modeling', 'Committee reporting']
            });
          }}
          tokens={tokens}
        />
      </div>

      <InfoPanel
        title="Infrastructure Fund Context"
        content={[
          'Current AUM: A$5B focused on Australian infrastructure',
          'Target allocation: A$250M for alternative assets (5%)',
          'Investment mandate: Risk-adjusted returns with ESG compliance',
          'Decision authority: Investment committee approval required for >A$25M'
        ]}
        tokens={tokens}
      />
    </div>
  );
};

const AnalysisPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  simulation: any;
}> = ({ onStepComplete, tokens, simulation }) => {
  const [analysisSteps, setAnalysisSteps] = useState({
    yieldAnalysis: false,
    riskAssessment: false,
    portfolioModeling: false
  });

  const handleYieldAnalysis = async () => {
    if (!simulation) return;

    const yieldData = await simulation.apiGateway.getRiskAnalysis({
      id: 'infrastructure_portfolio',
      assets: [
        { symbol: 'WREI-CC-001', weight: 0.10 },
        { symbol: 'INFRA-REIT-AU', weight: 0.70 },
        { symbol: 'INFRA-DEBT-AU', weight: 0.20 }
      ]
    });

    setAnalysisSteps(prev => ({ ...prev, yieldAnalysis: true }));
    onStepComplete('yield_analysis', yieldData.data);
  };

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Comprehensive Financial Analysis
      </h2>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <ActionCard
          title="Yield Structure Analysis"
          description="Analyze IRR, NPV, and yield characteristics vs infrastructure benchmarks"
          completed={analysisSteps.yieldAnalysis}
          onComplete={handleYieldAnalysis}
          tokens={tokens}
        />

        <ActionCard
          title="Risk Assessment"
          description="Evaluate volatility, correlation, and portfolio impact"
          completed={analysisSteps.riskAssessment}
          disabled={!analysisSteps.yieldAnalysis}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, riskAssessment: true }));
            onStepComplete('risk_assessment', {
              volatility: '23%',
              sharpeRatio: 1.24,
              correlation: {
                infraREITs: 0.15,
                bonds: 0.08,
                equities: 0.22
              }
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Portfolio Integration Modeling"
          description="Model impact on overall portfolio risk-return profile"
          completed={analysisSteps.portfolioModeling}
          disabled={!analysisSteps.riskAssessment}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, portfolioModeling: true }));
            onStepComplete('portfolio_modeling', {
              optimalAllocation: '10%',
              impactOnPortfolio: {
                expectedReturn: '+0.3%',
                volatility: '+0.8%',
                sharpe: '+0.12'
              }
            });
          }}
          tokens={tokens}
        />
      </div>

      {/* Financial Metrics Display */}
      {analysisSteps.yieldAnalysis && (
        <FinancialMetricsGrid tokens={tokens} />
      )}
    </div>
  );
};

const EvaluationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  analysisData: any;
}> = ({ onStepComplete, tokens, analysisData }) => {
  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Investment Evaluation & Due Diligence
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4] }}>
            Key Investment Metrics
          </h3>
          <MetricsCard
            metrics={[
              { label: 'Expected IRR', value: '8.7%', status: 'positive' },
              { label: 'Risk-Adjusted Return', value: '6.2%', status: 'positive' },
              { label: 'Volatility', value: '23%', status: 'neutral' },
              { label: 'Sharpe Ratio', value: '1.24', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>

        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4] }}>
            Benchmark Comparison
          </h3>
          <MetricsCard
            metrics={[
              { label: 'vs Infrastructure REITs', value: '+1.5%', status: 'positive' },
              { label: 'vs Infrastructure Debt', value: '+3.2%', status: 'positive' },
              { label: 'vs Unlisted Infrastructure', value: '+0.8%', status: 'positive' },
              { label: 'ESG Premium', value: '+0.5%', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>
      </div>

      <ActionCard
        title="Complete Due Diligence"
        description="Finalize evaluation and prepare recommendation for investment committee"
        completed={false}
        onComplete={() => {
          onStepComplete('due_diligence_complete', {
            recommendation: 'PROCEED',
            confidence: 85,
            keyRisks: ['Regulatory', 'Liquidity', 'Technology'],
            mitigations: ['Diversification', 'Partnership', 'Monitoring']
          });
        }}
        tokens={tokens}
      />
    </div>
  );
};

const DecisionPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  analysisData: any;
}> = ({ onStepComplete, tokens, analysisData }) => {
  const [recommendation, setRecommendation] = useState<'proceed' | 'defer' | 'reject' | null>(null);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Investment Decision
      </h2>

      <div style={{
        backgroundColor: tokens.colors.surface.secondary,
        padding: tokens.spacing[6],
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.surface.tertiary}`,
        marginBottom: tokens.spacing[6]
      }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
          Recommendation Decision
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6]
        }}>
          {[
            { value: 'proceed', label: 'PROCEED', color: tokens.colors.market.bullish, description: 'Recommend A$25M allocation' },
            { value: 'defer', label: 'DEFER', color: tokens.colors.status.warning, description: 'Require additional analysis' },
            { value: 'reject', label: 'REJECT', color: tokens.colors.market.bearish, description: 'Do not recommend investment' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setRecommendation(option.value as any)}
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                border: `2px solid ${recommendation === option.value ? option.color : tokens.colors.surface.tertiary}`,
                backgroundColor: recommendation === option.value ? option.color + '20' : tokens.colors.surface.primary,
                color: tokens.colors.text.primary,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: tokens.typography.sizes.lg,
                fontWeight: tokens.typography.weights.bold,
                marginBottom: tokens.spacing[2]
              }}>
                {option.label}
              </div>
              <div style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary
              }}>
                {option.description}
              </div>
            </button>
          ))}
        </div>

        {recommendation && (
          <button
            onClick={() => {
              onStepComplete('investment_decision', {
                decision: recommendation,
                confidence: recommendation === 'proceed' ? 85 : recommendation === 'defer' ? 60 : 25,
                rationale: `Based on comprehensive analysis, ${recommendation} is recommended.`
              });
            }}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              backgroundColor: tokens.colors.accent.primary,
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              color: tokens.colors.surface.primary,
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              cursor: 'pointer'
            }}
          >
            Confirm Decision
          </button>
        )}
      </div>
    </div>
  );
};

const ReportingPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  analysisData: any;
}> = ({ onStepComplete, tokens, analysisData }) => {
  const [reportGenerated, setReportGenerated] = useState(false);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Investment Committee Reporting
      </h2>

      <div style={{
        backgroundColor: tokens.colors.surface.secondary,
        padding: tokens.spacing[6],
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.surface.tertiary}`,
        marginBottom: tokens.spacing[6]
      }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
          Committee Report Summary
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[6]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Recommendation
            </h4>
            <div style={{
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.market.bullish + '20',
              borderLeft: `4px solid ${tokens.colors.market.bullish}`,
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.bold
            }}>
              PROCEED - A$25M Allocation
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Key Metrics
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>Expected IRR: 8.7%</li>
              <li>Risk-Adjusted Return: 6.2%</li>
              <li>Portfolio Impact: +0.3% return</li>
              <li>ESG Compliance: Verified</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            setReportGenerated(true);
            onStepComplete('committee_report_generated', {
              reportType: 'Investment Committee Recommendation',
              recommendation: 'PROCEED',
              allocation: 'A$25M',
              approval: 'Required'
            });
          }}
          disabled={reportGenerated}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
            backgroundColor: reportGenerated ? tokens.colors.surface.tertiary : tokens.colors.accent.primary,
            border: 'none',
            borderRadius: tokens.borderRadius.md,
            color: reportGenerated ? tokens.colors.text.secondary : tokens.colors.surface.primary,
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            cursor: reportGenerated ? 'not-allowed' : 'pointer'
          }}
        >
          {reportGenerated ? 'Report Generated ✓' : 'Generate Committee Report'}
        </button>
      </div>

      {reportGenerated && (
        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.status.online + '20',
          border: `1px solid ${tokens.colors.status.online}`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.primary
        }}>
          ✓ Comprehensive 23-page investment committee report generated including executive summary,
          financial analysis, risk assessment, ESG compliance notes, and implementation timeline.
          Ready for committee review and approval process.
        </div>
      )}
    </div>
  );
};

// Utility Components
const ActionCard: React.FC<{
  title: string;
  description: string;
  completed: boolean;
  disabled?: boolean;
  onComplete: () => void;
  tokens: any;
}> = ({ title, description, completed, disabled = false, onComplete, tokens }) => (
  <div style={{
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.md,
    opacity: disabled ? 0.5 : 1
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[2],
          color: tokens.colors.text.primary
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary,
          margin: 0
        }}>
          {description}
        </p>
      </div>
      <button
        onClick={onComplete}
        disabled={completed || disabled}
        style={{
          padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
          backgroundColor: completed ? tokens.colors.market.bullish : tokens.colors.accent.primary,
          border: 'none',
          borderRadius: tokens.borderRadius.sm,
          color: tokens.colors.surface.primary,
          fontSize: tokens.typography.sizes.sm,
          cursor: (completed || disabled) ? 'not-allowed' : 'pointer',
          opacity: (completed || disabled) ? 0.7 : 1
        }}
      >
        {completed ? 'Complete ✓' : 'Execute'}
      </button>
    </div>
  </div>
);

const InfoPanel: React.FC<{
  title: string;
  content: string[];
  tokens: any;
}> = ({ title, content, tokens }) => (
  <div style={{
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.accent.info}`,
    borderLeft: `4px solid ${tokens.colors.accent.info}`,
    borderRadius: tokens.borderRadius.md
  }}>
    <h4 style={{
      fontSize: tokens.typography.sizes.md,
      fontWeight: tokens.typography.weights.semibold,
      marginBottom: tokens.spacing[3],
      color: tokens.colors.text.primary
    }}>
      {title}
    </h4>
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      fontSize: tokens.typography.sizes.sm,
      color: tokens.colors.text.secondary
    }}>
      {content.map((item, index) => (
        <li key={index} style={{ marginBottom: tokens.spacing[1] }}>
          • {item}
        </li>
      ))}
    </ul>
  </div>
);

const MetricsCard: React.FC<{
  metrics: Array<{ label: string; value: string; status: 'positive' | 'negative' | 'neutral' }>;
  tokens: any;
}> = ({ metrics, tokens }) => (
  <div style={{
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[4]
  }}>
    {metrics.map((metric, index) => (
      <div key={index} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: tokens.spacing[2],
        marginBottom: tokens.spacing[2],
        borderBottom: index < metrics.length - 1 ? `1px solid ${tokens.colors.surface.tertiary}` : 'none'
      }}>
        <span style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary
        }}>
          {metric.label}
        </span>
        <span style={{
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.semibold,
          color: metric.status === 'positive'
            ? tokens.colors.market.bullish
            : metric.status === 'negative'
              ? tokens.colors.market.bearish
              : tokens.colors.text.primary
        }}>
          {metric.value}
        </span>
      </div>
    ))}
  </div>
);

const FinancialMetricsGrid: React.FC<{ tokens: any }> = ({ tokens }) => {
  const portfolioData = [
    {
      id: '1',
      asset: 'WREI-CC-001',
      type: 'Carbon Credits',
      allocation: 0.10,
      expectedReturn: 0.087,
      volatility: 0.23,
      sharpeRatio: 1.24,
      correlation: 0.15
    },
    {
      id: '2',
      asset: 'INFRA-REIT-AU',
      type: 'Infrastructure REITs',
      allocation: 0.70,
      expectedReturn: 0.065,
      volatility: 0.18,
      sharpeRatio: 1.12,
      correlation: 1.00
    },
    {
      id: '3',
      asset: 'INFRA-DEBT-AU',
      type: 'Infrastructure Debt',
      allocation: 0.20,
      expectedReturn: 0.055,
      volatility: 0.12,
      sharpeRatio: 0.95,
      correlation: 0.35
    }
  ];

  const columns = [
    { key: 'asset', header: 'Asset', type: 'text' as const },
    { key: 'type', header: 'Type', type: 'text' as const },
    { key: 'allocation', header: 'Allocation', type: 'percentage' as const },
    { key: 'expectedReturn', header: 'Expected Return', type: 'percentage' as const },
    { key: 'volatility', header: 'Volatility', type: 'percentage' as const },
    { key: 'sharpeRatio', header: 'Sharpe Ratio', type: 'number' as const },
    { key: 'correlation', header: 'Correlation', type: 'number' as const }
  ];

  return (
    <div style={{ marginTop: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.lg,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        Portfolio Composition Analysis
      </h3>
      <ProfessionalDataGrid
        columns={columns}
        data={portfolioData}
        title="Infrastructure Fund Portfolio with WREI Integration"
        monospaceNumbers={true}
        highlightPositive={true}
      />
    </div>
  );
};

const ProgressSidebar: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  tokens: any;
  simulation: any;
}> = ({ currentPhase, completedSteps, tokens, simulation }) => {
  const progress = simulation ? simulation.getProgress() : null;
  const realTimeMetrics = simulation ? simulation.getRealTimeMetrics() : null;

  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.md,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        Progress Tracking
      </h3>

      <div style={{
        marginBottom: tokens.spacing[4],
        padding: tokens.spacing[3],
        backgroundColor: tokens.colors.surface.primary,
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.surface.tertiary}`
      }}>
        <div style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary,
          marginBottom: tokens.spacing[2]
        }}>
          Steps Completed
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.accent.primary
        }}>
          {completedSteps.length} / 8
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: tokens.colors.surface.tertiary,
          borderRadius: tokens.borderRadius.sm,
          marginTop: tokens.spacing[2],
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(completedSteps.length / 8) * 100}%`,
            height: '100%',
            backgroundColor: tokens.colors.accent.primary,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {realTimeMetrics && (
        <div style={{
          marginBottom: tokens.spacing[4],
          padding: tokens.spacing[3],
          backgroundColor: tokens.colors.surface.primary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`
        }}>
          <div style={{
            fontSize: tokens.typography.sizes.sm,
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing[2]
          }}>
            Performance Metrics
          </div>
          <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.secondary }}>
            <div>Engagement: {realTimeMetrics.performanceIndicators?.engagement || 0}%</div>
            <div>Efficiency: {realTimeMetrics.performanceIndicators?.efficiency || 0}%</div>
            <div>Time Elapsed: {Math.floor((realTimeMetrics.duration || 0) / 60000)}min</div>
          </div>
        </div>
      )}

      <div style={{
        padding: tokens.spacing[3],
        backgroundColor: tokens.colors.surface.primary,
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.surface.tertiary}`
      }}>
        <div style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary,
          marginBottom: tokens.spacing[2]
        }}>
          Current Phase
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.medium,
          color: tokens.colors.text.primary,
          textTransform: 'capitalize'
        }}>
          {currentPhase}
        </div>
      </div>
    </div>
  );
};