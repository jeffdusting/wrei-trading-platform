'use client';

import { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { ProfessionalDataGrid } from '@/components/professional/ProfessionalDataGrid';
import { createSimulationEnvironment } from '@/lib/simulation';

interface ESGImpactScenarioProps {
  onComplete: (result: ScenarioResult) => void;
  onExit: () => void;
}

interface ScenarioResult {
  decision: 'proceed' | 'defer' | 'reject';
  impactScore: number;
  esgRating: string;
  premiumJustified: boolean;
  sustainabilityMetrics: any;
}

export const ESGImpactScenario: React.FC<ESGImpactScenarioProps> = ({
  onComplete,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');
  const [currentPhase, setCurrentPhase] = useState<'discovery' | 'esg_analysis' | 'impact_measurement' | 'premium_evaluation' | 'reporting'>('discovery');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [esgData, setESGData] = useState<any>(null);
  const [impactMetrics, setImpactMetrics] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    const jamesRodriguezPersona = {
      id: 'esg-fund',
      name: 'James Rodriguez',
      role: 'Chief Investment Officer',
      organization: 'Sustainable Capital Partners',
      aum: 'A$1B',
      experience: '12 years impact investing',
      techComfort: 'Medium-High' as const,
      investmentAuthority: 'A$100M allocation',
      keyDrivers: ['Impact measurement', 'ESG ratings', 'Premium justification'],
      preferences: {
        communicationStyle: 'professional' as const,
        riskTolerance: 'moderate' as const,
        decisionMakingSpeed: 'standard' as const,
        dataDetailLevel: 'detailed' as const,
        complianceRequirements: ['ESG compliance', 'Impact reporting', 'Sustainable investment criteria']
      }
    };

    const simEnv = createSimulationEnvironment({
      scenarioId: 'esg-impact-analysis',
      persona: jamesRodriguezPersona
    });

    setSimulation(simEnv);

    simEnv.performanceTracker.recordMilestone(simEnv.sessionId, 'esg_scenario_started', 'critical', {
      persona: 'James Rodriguez',
      organization: 'Sustainable Capital Partners',
      focus: 'ESG Impact Analysis'
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
      if (stepId.includes('esg')) {
        setESGData((prev: any) => ({ ...prev, [stepId]: data }));
      }
      if (stepId.includes('impact')) {
        setImpactMetrics((prev: any) => ({ ...prev, [stepId]: data }));
      }
    }

    updatePhaseBasedOnProgress();
  };

  const updatePhaseBasedOnProgress = () => {
    const totalSteps = completedSteps.length;

    if (totalSteps >= 10) {
      setCurrentPhase('reporting');
    } else if (totalSteps >= 8) {
      setCurrentPhase('premium_evaluation');
    } else if (totalSteps >= 5) {
      setCurrentPhase('impact_measurement');
    } else if (totalSteps >= 2) {
      setCurrentPhase('esg_analysis');
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
    gridTemplateColumns: '1fr 300px',
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
              ESG Impact Investment Analysis
            </h1>
            <div style={{
              fontSize: tokens.typography.sizes.md,
              color: tokens.colors.text.secondary
            }}>
              James Rodriguez • Chief Investment Officer • Sustainable Capital Partners (A$1B AUM)
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
            <ESGPhaseIndicator currentPhase={currentPhase} tokens={tokens} />
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
          <ESGScenarioContent
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            onStepComplete={handleStepCompletion}
            tokens={tokens}
            esgData={esgData}
            impactMetrics={impactMetrics}
            simulation={simulation}
          />
        </div>

        {/* Progress Sidebar */}
        <div style={sidebarStyles}>
          <ESGProgressSidebar
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            tokens={tokens}
            esgData={esgData}
            impactMetrics={impactMetrics}
          />
        </div>
      </div>
    </div>
  );
};

const ESGPhaseIndicator: React.FC<{ currentPhase: string; tokens: any }> = ({ currentPhase, tokens }) => {
  const phases = ['discovery', 'esg_analysis', 'impact_measurement', 'premium_evaluation', 'reporting'];
  const currentIndex = phases.indexOf(currentPhase);

  const phaseLabels = {
    discovery: 'DISCOVERY',
    esg_analysis: 'ESG ANALYSIS',
    impact_measurement: 'IMPACT',
    premium_evaluation: 'PREMIUM',
    reporting: 'REPORTING'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
      {phases.map((phase, index) => (
        <div
          key={phase}
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.sizes.xs,
            backgroundColor: index <= currentIndex ? tokens.colors.market.bullish : tokens.colors.surface.tertiary,
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

const ESGScenarioContent: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  esgData: any;
  impactMetrics: any;
  simulation: any;
}> = ({ currentPhase, completedSteps, onStepComplete, tokens, esgData, impactMetrics, simulation }) => {
  switch (currentPhase) {
    case 'discovery':
      return <ESGDiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} />;
    case 'esg_analysis':
      return <ESGAnalysisPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
    case 'impact_measurement':
      return <ImpactMeasurementPhase onStepComplete={onStepComplete} tokens={tokens} esgData={esgData} />;
    case 'premium_evaluation':
      return <PremiumEvaluationPhase onStepComplete={onStepComplete} tokens={tokens} impactMetrics={impactMetrics} />;
    case 'reporting':
      return <ESGReportingPhase onStepComplete={onStepComplete} tokens={tokens} esgData={esgData} impactMetrics={impactMetrics} />;
    default:
      return <ESGDiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} />;
  }
};

const ESGDiscoveryPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
}> = ({ onStepComplete, tokens }) => {
  const [esgCredentialsReviewed, setESGCredentialsReviewed] = useState(false);
  const [impactFrameworkAccessed, setImpactFrameworkAccessed] = useState(false);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        ESG Discovery & Impact Framework
      </h2>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <ActionCard
          title="Review ESG Credentials & Certifications"
          description="Evaluate WREI's ESG compliance, certifications, and third-party ratings"
          completed={esgCredentialsReviewed}
          onComplete={() => {
            setESGCredentialsReviewed(true);
            onStepComplete('review_esg_credentials', {
              certifications: ['TCFD', 'GRI', 'SASB', 'SBTN'],
              ratings: {
                msci: 'AA',
                sustainalytics: 15.2,
                cdp: 'A-'
              },
              frameworks: ['Science-Based Targets', 'Nature-Based Solutions']
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Access Impact Measurement Framework"
          description="Explore WREI's impact measurement methodology and outcome tracking"
          completed={impactFrameworkAccessed}
          disabled={!esgCredentialsReviewed}
          onComplete={() => {
            setImpactFrameworkAccessed(true);
            onStepComplete('access_impact_framework', {
              methodology: 'Theory of Change',
              outcomes: ['Carbon removal', 'Biodiversity', 'Community benefits'],
              metrics: ['tCO2e removed', 'Hectares protected', 'Jobs created'],
              reporting: 'Quarterly impact reports'
            });
          }}
          tokens={tokens}
        />
      </div>

      <ESGInfoPanel
        title="Sustainable Capital Partners Context"
        content={[
          'AUM: A$1B focused on sustainable impact investments',
          'Target allocation: A$100M for environmental assets (10%)',
          'Investment mandate: Measurable positive impact with competitive returns',
          'Impact focus: Climate, biodiversity, and social outcomes'
        ]}
        tokens={tokens}
      />
    </div>
  );
};

const ESGAnalysisPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  simulation: any;
}> = ({ onStepComplete, tokens, simulation }) => {
  const [analysisSteps, setAnalysisSteps] = useState({
    esgRatings: false,
    sustainabilityMetrics: false,
    thirdPartyValidation: false
  });

  const handleESGRatingAnalysis = async () => {
    if (!simulation) return;

    const esgRating = await simulation.apiGateway.getESGRatings('WREI-CC-001');
    setAnalysisSteps(prev => ({ ...prev, esgRatings: true }));
    onStepComplete('esg_rating_analysis', esgRating.data);
  };

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Comprehensive ESG Analysis
      </h2>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <ActionCard
          title="ESG Rating Analysis"
          description="Analyze MSCI, Sustainalytics, and CDP ratings with peer comparison"
          completed={analysisSteps.esgRatings}
          onComplete={handleESGRatingAnalysis}
          tokens={tokens}
        />

        <ActionCard
          title="Sustainability Metrics Deep Dive"
          description="Review carbon intensity, water usage, biodiversity impact metrics"
          completed={analysisSteps.sustainabilityMetrics}
          disabled={!analysisSteps.esgRatings}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, sustainabilityMetrics: true }));
            onStepComplete('sustainability_metrics', {
              carbonIntensity: '0.12 tCO2e/MWh',
              waterUsage: '2.3L/tCO2e',
              biodiversityImpact: '+15% species diversity',
              socialImpact: '847 jobs created'
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Third-Party Validation Review"
          description="Examine independent verification reports and audit findings"
          completed={analysisSteps.thirdPartyValidation}
          disabled={!analysisSteps.sustainabilityMetrics}
          onComplete={() => {
            setAnalysisSteps(prev => ({ ...prev, thirdPartyValidation: true }));
            onStepComplete('third_party_validation', {
              verifier: 'Verra VCS',
              auditor: 'KPMG Climate Change & Sustainability',
              lastAudit: '2024-Q3',
              findings: 'No material issues identified'
            });
          }}
          tokens={tokens}
        />
      </div>

      {analysisSteps.esgRatings && (
        <ESGRatingsGrid tokens={tokens} />
      )}
    </div>
  );
};

const ImpactMeasurementPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  esgData: any;
}> = ({ onStepComplete, tokens, esgData }) => {
  const [impactSteps, setImpactSteps] = useState({
    outcomeMapping: false,
    impactCalculation: false,
    additionality: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Impact Measurement & Verification
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Primary Impact Outcomes
          </h3>
          <ImpactMetricsCard
            metrics={[
              { label: 'Carbon Removal', value: '125,000 tCO2e', status: 'positive' },
              { label: 'Biodiversity Impact', value: '+18.5%', status: 'positive' },
              { label: 'Community Benefits', value: '1,247 jobs', status: 'positive' },
              { label: 'Water Conservation', value: '2.1M liters', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>

        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Impact Verification
          </h3>
          <ImpactMetricsCard
            metrics={[
              { label: 'Additionality Score', value: '92%', status: 'positive' },
              { label: 'Permanence Rating', value: 'High', status: 'positive' },
              { label: 'Leakage Risk', value: 'Low', status: 'positive' },
              { label: 'Co-benefits Score', value: '8.7/10', status: 'positive' }
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
        <ActionCard
          title="Map Theory of Change Outcomes"
          description="Validate alignment between investment and intended impact outcomes"
          completed={impactSteps.outcomeMapping}
          onComplete={() => {
            setImpactSteps(prev => ({ ...prev, outcomeMapping: true }));
            onStepComplete('outcome_mapping', {
              inputsValidated: true,
              activitiesVerified: true,
              outputsTracked: true,
              outcomesProjected: true,
              impactPathway: 'Clear and measurable'
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Calculate Impact Per Dollar Invested"
          description="Determine cost-effectiveness and impact efficiency metrics"
          completed={impactSteps.impactCalculation}
          disabled={!impactSteps.outcomeMapping}
          onComplete={() => {
            setImpactSteps(prev => ({ ...prev, impactCalculation: true }));
            onStepComplete('impact_calculation', {
              costPerTonneCO2: 'A$185',
              impactPerDollar: '2.8 tCO2e',
              biodiversityROI: '4.2x',
              socialROI: '3.1x'
            });
          }}
          tokens={tokens}
        />

        <ActionCard
          title="Validate Additionality & Permanence"
          description="Confirm impact wouldn't occur without investment and assess permanence"
          completed={impactSteps.additionality}
          disabled={!impactSteps.impactCalculation}
          onComplete={() => {
            setImpactSteps(prev => ({ ...prev, additionality: true }));
            onStepComplete('additionality_validation', {
              additionalityConfirmed: true,
              baselineEstablished: true,
              permanenceScore: 95,
              reversalRisk: 'Minimal'
            });
          }}
          tokens={tokens}
        />
      </div>
    </div>
  );
};

const PremiumEvaluationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  impactMetrics: any;
}> = ({ onStepComplete, tokens, impactMetrics }) => {
  const [premiumJustified, setPremiumJustified] = useState<boolean | null>(null);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        ESG Premium Evaluation
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Premium Analysis
          </h3>
          <div style={{
            backgroundColor: tokens.colors.surface.secondary,
            padding: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
            border: `1px solid ${tokens.colors.surface.tertiary}`
          }}>
            <div style={{
              display: 'grid',
              gap: tokens.spacing[3]
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Standard Carbon Credits:</span>
                <span>A$85/tonne</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>WREI Premium Credits:</span>
                <span style={{ color: tokens.colors.accent.primary }}>A$155/tonne</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: tokens.spacing[2],
                borderTop: `1px solid ${tokens.colors.surface.tertiary}`,
                fontWeight: tokens.typography.weights.semibold
              }}>
                <span>Premium:</span>
                <span style={{ color: tokens.colors.market.bullish }}>82% (+A$70/tonne)</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Premium Justification
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            fontSize: tokens.typography.sizes.sm
          }}>
            <li style={{ marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center' }}>
              <span style={{ color: tokens.colors.market.bullish, marginRight: tokens.spacing[2] }}>✓</span>
              Higher additionality score (92% vs 65% average)
            </li>
            <li style={{ marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center' }}>
              <span style={{ color: tokens.colors.market.bullish, marginRight: tokens.spacing[2] }}>✓</span>
              Triple verification (Verra + Gold Standard + CAR)
            </li>
            <li style={{ marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center' }}>
              <span style={{ color: tokens.colors.market.bullish, marginRight: tokens.spacing[2] }}>✓</span>
              Biodiversity co-benefits (+18.5% species diversity)
            </li>
            <li style={{ marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center' }}>
              <span style={{ color: tokens.colors.market.bullish, marginRight: tokens.spacing[2] }}>✓</span>
              Community impact (1,247 jobs created)
            </li>
            <li style={{ marginBottom: tokens.spacing[2], display: 'flex', alignItems: 'center' }}>
              <span style={{ color: tokens.colors.market.bullish, marginRight: tokens.spacing[2] }}>✓</span>
              Real-time monitoring & blockchain verification
            </li>
          </ul>
        </div>
      </div>

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
          Premium Justification Decision
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6]
        }}>
          {[
            { value: true, label: 'JUSTIFIED', color: tokens.colors.market.bullish, description: '82% premium is justified by superior impact outcomes' },
            { value: false, label: 'NOT JUSTIFIED', color: tokens.colors.market.bearish, description: '82% premium exceeds value of additional benefits' }
          ].map((option) => (
            <button
              key={String(option.value)}
              onClick={() => setPremiumJustified(option.value)}
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                border: `2px solid ${premiumJustified === option.value ? option.color : tokens.colors.surface.tertiary}`,
                backgroundColor: premiumJustified === option.value ? option.color + '20' : tokens.colors.surface.primary,
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

        {premiumJustified !== null && (
          <button
            onClick={() => {
              onStepComplete('premium_evaluation', {
                justified: premiumJustified,
                premium: 82,
                rationale: premiumJustified
                  ? 'Premium justified by superior additionality, verification, and co-benefits'
                  : 'Premium exceeds additional value provided by enhanced features'
              });
            }}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              backgroundColor: tokens.colors.market.bullish,
              border: 'none',
              borderRadius: tokens.borderRadius.md,
              color: tokens.colors.surface.primary,
              fontSize: tokens.typography.sizes.md,
              fontWeight: tokens.typography.weights.semibold,
              cursor: 'pointer'
            }}
          >
            Confirm Premium Assessment
          </button>
        )}
      </div>
    </div>
  );
};

const ESGReportingPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  esgData: any;
  impactMetrics: any;
}> = ({ onStepComplete, tokens, esgData, impactMetrics }) => {
  const [reportGenerated, setReportGenerated] = useState(false);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Impact Investment Reporting
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
        Sustainable Investment Committee Report
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6],
          marginBottom: tokens.spacing[6]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Investment Recommendation
            </h4>
            <div style={{
              padding: tokens.spacing[3],
              backgroundColor: tokens.colors.market.bullish + '20',
              borderLeft: `4px solid ${tokens.colors.market.bullish}`,
              fontSize: tokens.typography.sizes.lg,
              fontWeight: tokens.typography.weights.bold
            }}>
              PROCEED - A$50M Allocation
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              ESG & Impact Scores
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li>ESG Rating: AA (MSCI)</li>
              <li>Impact Score: 8.7/10</li>
              <li>Additionality: 92%</li>
              <li>Premium Justified: Yes</li>
            </ul>
          </div>
        </div>

        <button
          onClick={() => {
            setReportGenerated(true);
            onStepComplete('impact_report_generated', {
              reportType: 'Sustainable Investment Committee Report',
              recommendation: 'PROCEED',
              allocation: 'A$50M',
              esgRating: 'AA',
              impactScore: 8.7,
              premiumJustified: true
            });
          }}
          disabled={reportGenerated}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
            backgroundColor: reportGenerated ? tokens.colors.surface.tertiary : tokens.colors.market.bullish,
            border: 'none',
            borderRadius: tokens.borderRadius.md,
            color: reportGenerated ? tokens.colors.text.secondary : tokens.colors.surface.primary,
            fontSize: tokens.typography.sizes.md,
            fontWeight: tokens.typography.weights.semibold,
            cursor: reportGenerated ? 'not-allowed' : 'pointer'
          }}
        >
          {reportGenerated ? 'Impact Report Generated ✓' : 'Generate Impact Investment Report'}
        </button>
      </div>

      {reportGenerated && (
        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.market.bullish + '20',
          border: `1px solid ${tokens.colors.market.bullish}`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.primary
        }}>
          ✓ Comprehensive 31-page impact investment report generated including ESG analysis,
          impact measurement validation, premium justification, and sustainability outcomes tracking.
          Aligned with SFDR Article 9 and EU Taxonomy requirements.
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

const ESGInfoPanel: React.FC<{
  title: string;
  content: string[];
  tokens: any;
}> = ({ title, content, tokens }) => (
  <div style={{
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.market.bullish}`,
    borderLeft: `4px solid ${tokens.colors.market.bullish}`,
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

const ImpactMetricsCard: React.FC<{
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

const ESGRatingsGrid: React.FC<{ tokens: any }> = ({ tokens }) => {
  const esgData = [
    {
      id: '1',
      provider: 'MSCI ESG',
      rating: 'AA',
      score: 85,
      environmental: 87,
      social: 82,
      governance: 89,
      trend: 'Improving'
    },
    {
      id: '2',
      provider: 'Sustainalytics',
      rating: 'Low Risk',
      score: 15.2,
      environmental: 12.8,
      social: 16.5,
      governance: 11.2,
      trend: 'Stable'
    },
    {
      id: '3',
      provider: 'CDP Climate',
      rating: 'A-',
      score: 91,
      environmental: 91,
      social: null,
      governance: null,
      trend: 'Improving'
    }
  ];

  const columns = [
    { key: 'provider', header: 'ESG Provider', type: 'text' as const },
    { key: 'rating', header: 'Rating', type: 'text' as const },
    { key: 'score', header: 'Score', type: 'number' as const },
    { key: 'environmental', header: 'Environmental', type: 'number' as const },
    { key: 'social', header: 'Social', type: 'number' as const },
    { key: 'governance', header: 'Governance', type: 'number' as const },
    { key: 'trend', header: 'Trend', type: 'text' as const }
  ];

  return (
    <div style={{ marginTop: tokens.spacing[6] }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.lg,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        ESG Ratings Comparison
      </h3>
      <ProfessionalDataGrid
        columns={columns}
        data={esgData}
        title="Third-Party ESG Ratings Analysis"
        monospaceNumbers={true}
        highlightPositive={true}
      />
    </div>
  );
};

const ESGProgressSidebar: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  tokens: any;
  esgData: any;
  impactMetrics: any;
}> = ({ currentPhase, completedSteps, tokens, esgData, impactMetrics }) => {
  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.md,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary
      }}>
        ESG Analysis Progress
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
          Analysis Steps
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.market.bullish
        }}>
          {completedSteps.length} / 12
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
            width: `${(completedSteps.length / 12) * 100}%`,
            height: '100%',
            backgroundColor: tokens.colors.market.bullish,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {esgData && (
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
            ESG Summary
          </div>
          <div style={{ fontSize: tokens.typography.sizes.xs, color: tokens.colors.text.secondary }}>
            <div>MSCI Rating: AA</div>
            <div>Sustainalytics: 15.2 (Low Risk)</div>
            <div>CDP Climate: A-</div>
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
          {currentPhase.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};