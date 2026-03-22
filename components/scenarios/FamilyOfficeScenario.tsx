'use client';

import { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { ProfessionalDataGrid } from '@/components/professional/ProfessionalDataGrid';
import { createSimulationEnvironment } from '@/lib/simulation';

interface FamilyOfficeScenarioProps {
  onComplete: (result: ScenarioResult) => void;
  onExit: () => void;
}

interface ScenarioResult {
  recommendation: 'proceed' | 'defer' | 'modify';
  allocation: number;
  riskProfile: 'conservative' | 'moderate-conservative';
  taxOptimization: any;
  generationalPlan: any;
}

export const FamilyOfficeScenario: React.FC<FamilyOfficeScenarioProps> = ({
  onComplete,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');
  const [currentPhase, setCurrentPhase] = useState<'orientation' | 'conservative_analysis' | 'tax_optimization' | 'family_governance' | 'recommendation'>('orientation');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [conservativeMetrics, setConservativeMetrics] = useState<any>(null);
  const [taxAnalysis, setTaxAnalysis] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    const margaretThompsonPersona = {
      id: 'family-office',
      name: 'Margaret Thompson, CFA',
      role: 'Principal',
      organization: 'Thompson Family Office',
      aum: 'A$2.5B',
      experience: '20 years private wealth management',
      techComfort: 'Medium' as const,
      investmentAuthority: 'A$50M allocation',
      keyDrivers: ['Capital preservation', 'Tax efficiency', 'Generational wealth transfer'],
      preferences: {
        communicationStyle: 'formal' as const,
        riskTolerance: 'conservative' as const,
        decisionMakingSpeed: 'deliberate' as const,
        dataDetailLevel: 'detailed' as const,
        complianceRequirements: ['Family office governance', 'Tax optimization', 'Multi-generational planning']
      }
    };

    const simEnv = createSimulationEnvironment({
      scenarioId: 'family-office-conservative',
      persona: margaretThompsonPersona
    });

    setSimulation(simEnv);

    simEnv.performanceTracker.recordMilestone(simEnv.sessionId, 'family_office_scenario_started', 'critical', {
      persona: 'Margaret Thompson, CFA',
      organization: 'Thompson Family Office',
      focus: 'Conservative Analysis & Tax Optimization'
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
    await simulation.executeAction(stepId, data);

    if (data) {
      if (stepId.includes('tax')) {
        setTaxAnalysis((prev: any) => ({ ...prev, [stepId]: data }));
      }
      if (stepId.includes('conservative') || stepId.includes('risk')) {
        setConservativeMetrics((prev: any) => ({ ...prev, [stepId]: data }));
      }
    }

    updatePhaseBasedOnProgress();
  };

  const updatePhaseBasedOnProgress = () => {
    const totalSteps = completedSteps.length;

    if (totalSteps >= 10) {
      setCurrentPhase('recommendation');
    } else if (totalSteps >= 8) {
      setCurrentPhase('family_governance');
    } else if (totalSteps >= 5) {
      setCurrentPhase('tax_optimization');
    } else if (totalSteps >= 2) {
      setCurrentPhase('conservative_analysis');
    }
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
    gridTemplateColumns: '1fr 320px',
    gap: tokens.spacing[6]
  };

  const sidebarStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[4],
    height: 'fit-content'
  };

  return (
    <div style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontSize: tokens.typography.sizes['2xl'],
              fontWeight: tokens.typography.weights.bold,
              margin: 0,
              marginBottom: tokens.spacing[2]
            }}>
              Family Office Conservative Investment Analysis
            </h1>
            <div style={{
              fontSize: tokens.typography.sizes.md,
              color: tokens.colors.text.secondary
            }}>
              Margaret Thompson, CFA • Principal • Thompson Family Office (A$2.5B Multi-Generational Wealth)
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
            <FamilyOfficePhaseIndicator currentPhase={currentPhase} tokens={tokens} />
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
              Exit Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyles}>
        <div>
          <FamilyOfficeScenarioContent
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            onStepComplete={handleStepCompletion}
            tokens={tokens}
            conservativeMetrics={conservativeMetrics}
            taxAnalysis={taxAnalysis}
            simulation={simulation}
          />
        </div>

        {/* Family Office Sidebar */}
        <div style={sidebarStyles}>
          <FamilyOfficeSidebar
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            tokens={tokens}
            conservativeMetrics={conservativeMetrics}
            taxAnalysis={taxAnalysis}
          />
        </div>
      </div>
    </div>
  );
};

const FamilyOfficePhaseIndicator: React.FC<{ currentPhase: string; tokens: any }> = ({ currentPhase, tokens }) => {
  const phases = ['orientation', 'conservative_analysis', 'tax_optimization', 'family_governance', 'recommendation'];
  const currentIndex = phases.indexOf(currentPhase);

  const phaseLabels = {
    orientation: 'ORIENTATION',
    conservative_analysis: 'ANALYSIS',
    tax_optimization: 'TAX PLANNING',
    family_governance: 'GOVERNANCE',
    recommendation: 'RECOMMENDATION'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
      {phases.map((phase, index) => (
        <div
          key={phase}
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.sizes.xs,
            backgroundColor: index <= currentIndex ? tokens.colors.status.online : tokens.colors.surface.tertiary,
            color: index <= currentIndex ? tokens.colors.surface.primary : tokens.colors.text.secondary,
            fontWeight: tokens.typography.weights.medium
          }}
        >
          {phaseLabels[phase as keyof typeof phaseLabels]}
        </div>
      ))}
    </div>
  );
};

const FamilyOfficeScenarioContent: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  conservativeMetrics: any;
  taxAnalysis: any;
  simulation: any;
}> = ({ currentPhase, completedSteps, onStepComplete, tokens, conservativeMetrics, taxAnalysis, simulation }) => {
  switch (currentPhase) {
    case 'orientation':
      return <OrientationPhase onStepComplete={onStepComplete} tokens={tokens} />;
    case 'conservative_analysis':
      return <ConservativeAnalysisPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
    case 'tax_optimization':
      return <TaxOptimizationPhase onStepComplete={onStepComplete} tokens={tokens} conservativeMetrics={conservativeMetrics} />;
    case 'family_governance':
      return <FamilyGovernancePhase onStepComplete={onStepComplete} tokens={tokens} taxAnalysis={taxAnalysis} />;
    case 'recommendation':
      return <RecommendationPhase onStepComplete={onStepComplete} tokens={tokens} conservativeMetrics={conservativeMetrics} taxAnalysis={taxAnalysis} />;
    default:
      return <OrientationPhase onStepComplete={onStepComplete} tokens={tokens} />;
  }
};

const OrientationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
}> = ({ onStepComplete, tokens }) => {
  const [orientationSteps, setOrientationSteps] = useState({
    welcomeGuide: false,
    familyOfficeNeeds: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Welcome & Platform Orientation
      </h2>

      <div style={{
        backgroundColor: tokens.colors.market.bullish + '15',
        border: `1px solid ${tokens.colors.market.bullish}`,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
          Welcome to WREI&apos;s Family Office Investment Platform
        </h3>

        <p style={{
          fontSize: tokens.typography.sizes.md,
          color: tokens.colors.text.secondary,
          lineHeight: tokens.typography.lineHeights.relaxed,
          marginBottom: tokens.spacing[4]
        }}>
          This guided analysis has been specifically designed for family offices seeking conservative,
          tax-efficient investments in tokenized real-world assets. We understand the unique requirements
          of multi-generational wealth management and have tailored this experience accordingly.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[4]
        }}>
          <div style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.surface.primary,
            borderRadius: tokens.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
              Guided Experience
            </div>
            <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold }}>
              Step-by-Step
            </div>
          </div>
          <div style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.surface.primary,
            borderRadius: tokens.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
              Documentation
            </div>
            <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold }}>
              Comprehensive
            </div>
          </div>
          <div style={{
            padding: tokens.spacing[3],
            backgroundColor: tokens.colors.surface.primary,
            borderRadius: tokens.borderRadius.md,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.text.secondary }}>
              Support
            </div>
            <div style={{ fontSize: tokens.typography.sizes.lg, fontWeight: tokens.typography.weights.bold }}>
              Expert Available
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <GuidedActionCard
          title="Review Platform Overview & Investment Guide"
          description="Comprehensive introduction to WREI's family office services and investment methodology"
          completed={orientationSteps.welcomeGuide}
          onComplete={() => {
            setOrientationSteps(prev => ({ ...prev, welcomeGuide: true }));
            onStepComplete('platform_overview', {
              documentsReviewed: ['Family Office Investment Guide', 'Tax Planning Framework', 'Risk Management Procedures'],
              expertConsultation: 'Available upon request',
              timeSpent: '15 minutes'
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Family Office Needs Assessment"
          description="Tailored questionnaire to understand your family's investment objectives and constraints"
          completed={orientationSteps.familyOfficeNeeds}
          disabled={!orientationSteps.welcomeGuide}
          onComplete={() => {
            setOrientationSteps(prev => ({ ...prev, familyOfficeNeeds: true }));
            onStepComplete('needs_assessment', {
              wealthPreservation: 'Primary objective',
              generationalPlanning: 'Multi-generational (3+ generations)',
              taxSensitivity: 'High',
              liquidityNeeds: 'Low-medium (5-year horizon)',
              riskTolerance: 'Conservative'
            });
          }}
          tokens={tokens}
        />
      </div>

      <FamilyOfficeInfoPanel
        title="Thompson Family Office Investment Context"
        content={[
          'Total Assets Under Management: A$2.5B across three generations',
          'Investment Objective: Capital preservation with modest real growth',
          'Risk Profile: Conservative with focus on downside protection',
          'Time Horizon: Long-term (10+ years) with flexibility for family needs',
          'Tax Considerations: High marginal rates, seeking tax-efficient structures',
          'Governance: Family investment committee with quarterly reviews'
        ]}
        tokens={tokens}
      />
    </div>
  );
};

const ConservativeAnalysisPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  simulation: any;
}> = ({ onStepComplete, tokens, simulation }) => {
  const [analysisSteps, setAnalysisSteps] = useState({
    riskAssessment: false,
    conservativeMetrics: false,
    capitalPreservation: false
  });

  const handleRiskAssessment = async () => {
    if (!simulation) return;

    // Simulate conservative risk analysis
    const riskData = await simulation.apiGateway.getRiskAnalysis({
      id: 'conservative_portfolio',
      assets: [
        { symbol: 'WREI-CC-001', weight: 0.05 },
        { symbol: 'AUS-GOVT-BONDS', weight: 0.40 },
        { symbol: 'DEFENSIVE-EQUITIES', weight: 0.35 },
        { symbol: 'ALTERNATIVES', weight: 0.20 }
      ]
    });

    setAnalysisSteps(prev => ({ ...prev, riskAssessment: true }));
    onStepComplete('conservative_risk_assessment', riskData.data);
  };

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Conservative Investment Analysis
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Risk Metrics (Conservative)
          </h3>
          <ConservativeMetricsCard
            metrics={[
              { label: 'Maximum Drawdown', value: '8.5%', status: 'positive' },
              { label: 'Volatility (Annual)', value: '12.3%', status: 'positive' },
              { label: 'Downside Protection', value: '92%', status: 'positive' },
              { label: 'Capital at Risk (95% VaR)', value: '3.2%', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>

        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Return Expectations
          </h3>
          <ConservativeMetricsCard
            metrics={[
              { label: 'Expected Return (Annual)', value: '6.8%', status: 'positive' },
              { label: 'Income Yield', value: '4.2%', status: 'positive' },
              { label: 'Real Return (After Inflation)', value: '3.5%', status: 'positive' },
              { label: '10-Year Wealth Preservation', value: '98.5%', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <GuidedActionCard
          title="Comprehensive Risk Assessment"
          description="Detailed analysis of downside protection and capital preservation characteristics"
          completed={analysisSteps.riskAssessment}
          onComplete={handleRiskAssessment}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Conservative Performance Metrics"
          description="Review risk-adjusted returns, Sharpe ratios, and conservative benchmarks"
          completed={analysisSteps.conservativeMetrics}
          disabled={!analysisSteps.riskAssessment}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, conservativeMetrics: true }));
            onStepComplete('conservative_metrics', {
              sharpeRatio: 0.85,
              sortinoRatio: 1.12,
              informationRatio: 0.65,
              trackingError: 0.045,
              betaToMarket: 0.72
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Capital Preservation Analysis"
          description="Stress testing and scenario analysis for wealth preservation objectives"
          completed={analysisSteps.capitalPreservation}
          disabled={!analysisSteps.conservativeMetrics}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, capitalPreservation: true }));
            onStepComplete('capital_preservation', {
              stressScenarios: [
                { name: '2008 Financial Crisis', impact: '-12.5%', recovery: '18 months' },
                { name: 'COVID-19 Pandemic', impact: '-8.2%', recovery: '12 months' },
                { name: 'Interest Rate Shock', impact: '-6.8%', recovery: '9 months' }
              ],
              preservationProbability: 0.945
            });
          }}
          tokens={tokens}
        />
      </div>
    </div>
  );
};

const TaxOptimizationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  conservativeMetrics: any;
}> = ({ onStepComplete, tokens, conservativeMetrics }) => {
  const [taxSteps, setTaxSteps] = useState({
    taxStructure: false,
    capitalGains: false,
    estatePlanning: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Tax Optimization & Estate Planning
      </h2>

      <div style={{
        backgroundColor: tokens.colors.status.warning + '15',
        border: `1px solid ${tokens.colors.status.warning}`,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
          Tax Planning Considerations
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: tokens.spacing[4]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[2] }}>
              Current Tax Position
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: tokens.typography.sizes.sm,
              color: tokens.colors.text.secondary
            }}>
              <li>• Marginal Tax Rate: 47% (incl. Medicare Levy)</li>
              <li>• Capital Gains: 23.5% (with discount)</li>
              <li>• Family Trust Structure: Available</li>
              <li>• Charitable Foundation: Active</li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[2] }}>
              Optimization Opportunities
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: tokens.typography.sizes.sm,
              color: tokens.colors.text.secondary
            }}>
              <li>• Income vs Capital Gains Optimization</li>
              <li>• Trust Distribution Planning</li>
              <li>• Generation-Skipping Strategies</li>
              <li>• Charitable Giving Integration</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <GuidedActionCard
          title="Tax-Efficient Investment Structure"
          description="Review optimal holding structures for WREI investments within family office framework"
          completed={taxSteps.taxStructure}
          onComplete={() => {
            setTaxSteps(prev => ({ ...prev, taxStructure: true }));
            onStepComplete('tax_structure', {
              recommendedStructure: 'Family Trust with Corporate Trustee',
              taxBenefits: [
                'Income splitting opportunities',
                'Capital gains discount availability',
                'Asset protection benefits',
                'Succession planning flexibility'
              ],
              estimatedSavings: 'A$125,000 annually'
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Capital Gains Tax Planning"
          description="Optimize timing and realization of capital gains within family tax strategy"
          completed={taxSteps.capitalGains}
          disabled={!taxSteps.taxStructure}
          onComplete={() => {
            setTaxSteps(prev => ({ ...prev, capitalGains: true }));
            onStepComplete('capital_gains_planning', {
              strategy: 'Staged realization with loss harvesting',
              discount: 'Full 50% CGT discount available',
              timing: 'Coordinate with family income cycles',
              optimization: 'A$85,000 potential annual savings'
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Multi-Generational Estate Planning"
          description="Integrate WREI holdings into long-term wealth transfer and succession planning"
          completed={taxSteps.estatePlanning}
          disabled={!taxSteps.capitalGains}
          onComplete={() => {
            setTaxSteps(prev => ({ ...prev, estatePlanning: true }));
            onStepComplete('estate_planning', {
              generationSkipping: 'Testamentary trust structure recommended',
              wealthTransfer: 'Staged transfer over 10-year period',
              taxMinimization: 'A$2.1M estimated lifetime savings',
              familyGovernance: 'Investment committee succession planning'
            });
          }}
          tokens={tokens}
        />
      </div>

      {taxSteps.taxStructure && (
        <TaxOptimizationGrid tokens={tokens} />
      )}
    </div>
  );
};

const FamilyGovernancePhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  taxAnalysis: any;
}> = ({ onStepComplete, tokens, taxAnalysis }) => {
  const [governanceSteps, setGovernanceSteps] = useState({
    decisionFramework: false,
    familyAlignment: false,
    ongoingManagement: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Family Governance & Decision Framework
      </h2>

      <div style={{
        backgroundColor: tokens.colors.accent.info + '15',
        border: `1px solid ${tokens.colors.accent.info}`,
        borderRadius: tokens.borderRadius.lg,
        padding: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
          Thompson Family Investment Committee Framework
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Decision Authority
            </h4>
            <div style={{
              backgroundColor: tokens.colors.surface.primary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div><strong>Principal:</strong> Margaret Thompson, CFA</div>
              <div><strong>Authority:</strong> Up to A$50M per decision</div>
              <div><strong>Committee:</strong> Quarterly review required</div>
              <div><strong>Family Approval:</strong> &gt;A$25M investments</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Investment Criteria
            </h4>
            <div style={{
              backgroundColor: tokens.colors.surface.primary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div><strong>Risk Profile:</strong> Conservative to moderate-conservative</div>
              <div><strong>Liquidity:</strong> Minimum 25% within 12 months</div>
              <div><strong>ESG Alignment:</strong> Values-based investing preferred</div>
              <div><strong>Time Horizon:</strong> 10+ years typical</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <GuidedActionCard
          title="Investment Committee Decision Framework"
          description="Establish formal process for WREI investment evaluation and ongoing oversight"
          completed={governanceSteps.decisionFramework}
          onComplete={() => {
            setGovernanceSteps(prev => ({ ...prev, decisionFramework: true }));
            onStepComplete('decision_framework', {
              process: 'Quarterly committee review with monthly monitoring',
              approvalThresholds: {
                principal: 'Up to A$25M',
                committee: 'A$25M - A$50M',
                family: 'Above A$50M'
              },
              documentation: 'Full investment memorandum required',
              reporting: 'Monthly performance and risk reporting'
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Family Alignment Assessment"
          description="Ensure WREI investment aligns with family values and multi-generational objectives"
          completed={governanceSteps.familyAlignment}
          disabled={!governanceSteps.decisionFramework}
          onComplete={() => {
            setGovernanceSteps(prev => ({ ...prev, familyAlignment: true }));
            onStepComplete('family_alignment', {
              valuesAlignment: 'Strong alignment with environmental stewardship',
              generationalSupport: 'All three generations supportive',
              educationalComponent: 'Next generation education program included',
              philanthropicTies: 'Potential foundation co-investment opportunity'
            });
          }}
          tokens={tokens}
        />

        <GuidedActionCard
          title="Ongoing Management & Review Process"
          description="Establish monitoring procedures and review cycles for WREI investment"
          completed={governanceSteps.ongoingManagement}
          disabled={!governanceSteps.familyAlignment}
          onComplete={() => {
            setGovernanceSteps(prev => ({ ...prev, ongoingManagement: true }));
            onStepComplete('ongoing_management', {
              monitoring: 'Monthly performance dashboard',
              reviews: 'Quarterly committee meetings',
              reporting: 'Semi-annual family office report',
              rebalancing: 'Annual portfolio rebalancing review',
              exit: 'Three-year minimum hold, staged exit thereafter'
            });
          }}
          tokens={tokens}
        />
      </div>
    </div>
  );
};

const RecommendationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  conservativeMetrics: any;
  taxAnalysis: any;
}> = ({ onStepComplete, tokens, conservativeMetrics, taxAnalysis }) => {
  const [recommendation, setRecommendation] = useState<'proceed' | 'modify' | 'defer' | null>(null);
  const [allocationSize, setAllocationSize] = useState<number>(25000000); // Default A$25M

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Investment Committee Recommendation
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
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[4],
          color: tokens.colors.text.primary
        }}>
        Investment Summary & Recommendation
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[6]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Conservative Analysis Summary
            </h4>
            <div style={{
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.status.online + '15',
              borderLeft: `4px solid ${tokens.colors.status.online}`,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div>✓ Risk Profile: Appropriate for conservative mandate</div>
              <div>✓ Expected Return: 6.8% (vs 4.2% current portfolio)</div>
              <div>✓ Maximum Drawdown: 8.5% (within acceptable range)</div>
              <div>✓ Capital Preservation: 98.5% probability over 10 years</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Tax & Governance Summary
            </h4>
            <div style={{
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.status.online + '15',
              borderLeft: `4px solid ${tokens.colors.status.online}`,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div>✓ Tax Structure: Optimized for family office</div>
              <div>✓ Estimated Annual Tax Savings: A$125,000</div>
              <div>✓ Family Alignment: Strong across three generations</div>
              <div>✓ Governance: Fits existing committee framework</div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
            Recommended Allocation Size
          </h4>
          <div style={{ display: 'flex', gap: tokens.spacing[4], flexWrap: 'wrap' }}>
            {[15000000, 25000000, 35000000].map((amount) => (
              <button
                key={amount}
                onClick={() => setAllocationSize(amount)}
                style={{
                  padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                  borderRadius: tokens.borderRadius.md,
                  border: `2px solid ${allocationSize === amount ? tokens.colors.accent.primary : tokens.colors.surface.tertiary}`,
                  backgroundColor: allocationSize === amount ? tokens.colors.accent.primary + '20' : tokens.colors.surface.primary,
                  color: tokens.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: tokens.typography.sizes.sm
                }}
              >
                A${(amount / 1000000).toFixed(0)}M ({((amount / 2500000000) * 100).toFixed(1)}% of portfolio)
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: tokens.spacing[6] }}>
          <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
            Committee Recommendation
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: tokens.spacing[4]
          }}>
            {[
              { value: 'proceed', label: 'PROCEED', color: tokens.colors.status.online, description: 'Recommend immediate investment' },
              { value: 'modify', label: 'PROCEED WITH MODIFICATIONS', color: tokens.colors.status.warning, description: 'Recommend with adjusted parameters' },
              { value: 'defer', label: 'DEFER', color: tokens.colors.market.bearish, description: 'Require additional analysis' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setRecommendation(option.value as any)}
                style={{
                  padding: tokens.spacing[4],
                  borderRadius: tokens.borderRadius.md,
                  border: `2px solid ${recommendation === option.value ? option.color : tokens.colors.surface.tertiary}`,
                  backgroundColor: recommendation === option.value ? option.color + '15' : tokens.colors.surface.primary,
                  color: tokens.colors.text.primary,
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  fontSize: tokens.typography.sizes.md,
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
        </div>

        {recommendation && (
          <button
            onClick={() => {
              onStepComplete('final_recommendation', {
                recommendation,
                allocationSize,
                riskProfile: 'Conservative',
                expectedReturn: 0.068,
                taxOptimized: true,
                familyApproved: true,
                implementationTimeline: '90 days'
              });
            }}
            style={{
              padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
              backgroundColor: tokens.colors.status.online,
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              color: tokens.colors.surface.primary,
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              cursor: 'pointer'
            }}
          >
            Finalize Committee Recommendation
          </button>
        )}
      </div>

      {recommendation && (
        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.status.online + '15',
          border: `1px solid ${tokens.colors.status.online}`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.primary
        }}>
          ✓ Investment committee recommendation completed. Comprehensive family office
          analysis with conservative risk profile, tax optimization, and multi-generational
          governance framework. Ready for quarterly committee review and family approval process.
        </div>
      )}
    </div>
  );
};

// Utility Components
const GuidedActionCard: React.FC<{
  title: string;
  description: string;
  completed: boolean;
  disabled?: boolean;
  onComplete: () => void;
  tokens: any;
}> = ({ title, description, completed, disabled = false, onComplete, tokens }) => (
  <div style={{
    padding: tokens.spacing[5],
    backgroundColor: tokens.colors.surface.secondary,
    border: `2px solid ${completed ? tokens.colors.status.online : tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.lg,
    opacity: disabled ? 0.5 : 1
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1, marginRight: tokens.spacing[4] }}>
        <h3 style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.semibold,
          marginBottom: tokens.spacing[3],
          color: tokens.colors.text.primary
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: tokens.typography.sizes.md,
          color: tokens.colors.text.secondary,
          margin: 0,
          lineHeight: tokens.typography.lineHeights.normal
        }}>
          {description}
        </p>
      </div>
      <button
        onClick={onComplete}
        disabled={completed || disabled}
        style={{
          padding: `${tokens.spacing[3]} ${tokens.spacing[5]}`,
          backgroundColor: completed ? tokens.colors.status.online : tokens.colors.accent.primary,
          border: 'none',
          borderRadius: tokens.borderRadius.md,
          color: tokens.colors.surface.primary,
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.semibold,
          cursor: (completed || disabled) ? 'not-allowed' : 'pointer',
          opacity: (completed || disabled) ? 0.8 : 1,
          minWidth: '120px'
        }}
      >
        {completed ? 'Completed ✓' : 'Begin Analysis'}
      </button>
    </div>
  </div>
);

const FamilyOfficeInfoPanel: React.FC<{
  title: string;
  content: string[];
  tokens: any;
}> = ({ title, content, tokens }) => (
  <div style={{
    padding: tokens.spacing[5],
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.accent.info}`,
    borderLeft: `6px solid ${tokens.colors.accent.info}`,
    borderRadius: tokens.borderRadius.lg
  }}>
    <h4 style={{
      fontSize: tokens.typography.sizes.lg,
      fontWeight: tokens.typography.weights.semibold,
      marginBottom: tokens.spacing[4],
      color: tokens.colors.text.primary
    }}>
      {title}
    </h4>
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      fontSize: tokens.typography.sizes.md,
      color: tokens.colors.text.secondary,
      lineHeight: tokens.typography.lineHeights.relaxed
    }}>
      {content.map((item, index) => (
        <li key={index} style={{ marginBottom: tokens.spacing[2] }}>
          • {item}
        </li>
      ))}
    </ul>
  </div>
);

const ConservativeMetricsCard: React.FC<{
  metrics: Array<{ label: string; value: string; status: 'positive' | 'negative' | 'neutral' }>;
  tokens: any;
}> = ({ metrics, tokens }) => (
  <div style={{
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[5]
  }}>
    {metrics.map((metric, index) => (
      <div key={index} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: tokens.spacing[3],
        marginBottom: tokens.spacing[3],
        borderBottom: index < metrics.length - 1 ? `1px solid ${tokens.colors.surface.tertiary}` : 'none'
      }}>
        <span style={{
          fontSize: tokens.typography.sizes.md,
          color: tokens.colors.text.secondary,
          fontWeight: tokens.typography.weights.medium
        }}>
          {metric.label}
        </span>
        <span style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.bold,
          color: metric.status === 'positive'
            ? tokens.colors.status.online
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

const TaxOptimizationGrid: React.FC<{ tokens: any }> = ({ tokens }) => {
  const taxData = [
    {
      id: '1',
      strategy: 'Family Trust Structure',
      currentTax: 0.47,
      optimizedTax: 0.235,
      annualSavings: 125000,
      implementation: 'Immediate'
    },
    {
      id: '2',
      strategy: 'Capital Gains Timing',
      currentTax: 0.235,
      optimizedTax: 0.175,
      annualSavings: 85000,
      implementation: 'Staged'
    },
    {
      id: '3',
      strategy: 'Generation Skipping',
      currentTax: 0.47,
      optimizedTax: 0.19,
      annualSavings: 210000,
      implementation: '10-year plan'
    }
  ];

  const columns = [
    { key: 'strategy', header: 'Tax Strategy', type: 'text' as const },
    { key: 'currentTax', header: 'Current Tax Rate', type: 'percentage' as const },
    { key: 'optimizedTax', header: 'Optimized Rate', type: 'percentage' as const },
    { key: 'annualSavings', header: 'Annual Savings', type: 'currency' as const },
    { key: 'implementation', header: 'Timeline', type: 'text' as const }
  ];

  return (
    <div style={{ marginTop: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.lg,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        Tax Optimization Strategies
      </h3>
      <ProfessionalDataGrid
        columns={columns}
        data={taxData}
        title="Family Office Tax Planning Analysis"
        monospaceNumbers={true}
        highlightPositive={true}
      />
    </div>
  );
};

const FamilyOfficeSidebar: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  tokens: any;
  conservativeMetrics: any;
  taxAnalysis: any;
}> = ({ currentPhase, completedSteps, tokens, conservativeMetrics, taxAnalysis }) => {
  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.md,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        Analysis Progress
      </h3>

      <div style={{
        marginBottom: tokens.spacing[4],
        padding: tokens.spacing[4],
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
          fontSize: tokens.typography.sizes.xl,
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.status.online
        }}>
          {completedSteps.length} / 11
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
            width: `${(completedSteps.length / 11) * 100}%`,
            height: '100%',
            backgroundColor: tokens.colors.status.online,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {conservativeMetrics && (
        <div style={{
          marginBottom: tokens.spacing[4],
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.surface.primary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`
        }}>
          <div style={{
            fontSize: tokens.typography.sizes.sm,
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing[2]
          }}>
            Conservative Metrics
          </div>
          <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.secondary }}>
            <div>Expected Return: 6.8%</div>
            <div>Max Drawdown: 8.5%</div>
            <div>Preservation: 98.5%</div>
          </div>
        </div>
      )}

      {taxAnalysis && (
        <div style={{
          marginBottom: tokens.spacing[4],
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.surface.primary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`
        }}>
          <div style={{
            fontSize: tokens.typography.sizes.sm,
            color: tokens.colors.text.secondary,
            marginBottom: tokens.spacing[2]
          }}>
            Tax Optimization
          </div>
          <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.secondary }}>
            <div>Annual Savings: A$125K</div>
            <div>Structure: Family Trust</div>
            <div>CGT Discount: Available</div>
          </div>
        </div>
      )}

      <div style={{
        padding: tokens.spacing[4],
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
          {currentPhase.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};