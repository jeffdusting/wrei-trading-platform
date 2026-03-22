'use client';

import { useState, useEffect } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { ProfessionalDataGrid } from '@/components/professional/ProfessionalDataGrid';
import { createSimulationEnvironment } from '@/lib/simulation';

interface DeFiYieldFarmingScenarioProps {
  onComplete: (result: ScenarioResult) => void;
  onExit: () => void;
}

interface ScenarioResult {
  strategy: 'aggressive' | 'moderate' | 'conservative';
  expectedAPY: number;
  collateralRatio: number;
  automationEnabled: boolean;
  riskLevel: number;
}

export const DeFiYieldFarmingScenario: React.FC<DeFiYieldFarmingScenarioProps> = ({
  onComplete,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');
  const [currentPhase, setCurrentPhase] = useState<'api_discovery' | 'collateral_analysis' | 'yield_optimization' | 'automation_setup' | 'strategy_deployment'>('api_discovery');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [defiMetrics, setDeFiMetrics] = useState<any>(null);
  const [yieldStrategies, setYieldStrategies] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);

  useEffect(() => {
    const alexKimPersona = {
      id: 'defi-fund',
      name: 'Alex Kim',
      role: 'Crypto Portfolio Manager',
      organization: 'Digital Asset Management',
      aum: 'A$2B',
      experience: '8 years DeFi, tokenized asset specialist',
      techComfort: 'Very High' as const,
      investmentAuthority: 'A$500M allocation',
      keyDrivers: ['Yield optimization', 'Liquidity', 'Cross-chain opportunities'],
      preferences: {
        communicationStyle: 'professional' as const,
        riskTolerance: 'aggressive' as const,
        decisionMakingSpeed: 'fast' as const,
        dataDetailLevel: 'comprehensive' as const,
        complianceRequirements: ['DeFi protocol audits', 'Smart contract verification', 'Cross-chain security']
      }
    };

    const simEnv = createSimulationEnvironment({
      scenarioId: 'defi-yield-farming',
      persona: alexKimPersona
    });

    setSimulation(simEnv);

    simEnv.performanceTracker.recordMilestone(simEnv.sessionId, 'defi_scenario_started', 'critical', {
      persona: 'Alex Kim',
      organization: 'Digital Asset Management',
      focus: 'DeFi Yield Farming & Cross-Collateral'
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
      if (stepId.includes('yield') || stepId.includes('apy')) {
        setYieldStrategies(prev => ({ ...prev, [stepId]: data }));
      }
      if (stepId.includes('defi') || stepId.includes('collateral')) {
        setDeFiMetrics(prev => ({ ...prev, [stepId]: data }));
      }
    }

    updatePhaseBasedOnProgress();
  };

  const updatePhaseBasedOnProgress = () => {
    const totalSteps = completedSteps.length;

    if (totalSteps >= 12) {
      setCurrentPhase('strategy_deployment');
    } else if (totalSteps >= 9) {
      setCurrentPhase('automation_setup');
    } else if (totalSteps >= 6) {
      setCurrentPhase('yield_optimization');
    } else if (totalSteps >= 3) {
      setCurrentPhase('collateral_analysis');
    }
  };

  const containerStyles = {
    backgroundColor: tokens.colors.surface.primary,
    color: tokens.colors.text.primary,
    minHeight: '100vh',
    fontFamily: tokens.typography.families.financial // DeFi users prefer monospace
  };

  const headerStyles = {
    padding: tokens.spacing[6],
    borderBottom: `1px solid ${tokens.colors.surface.tertiary}`,
    backgroundColor: tokens.colors.surface.secondary
  };

  const contentStyles = {
    padding: tokens.spacing[6],
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
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
              DeFi Yield Farming & Cross-Collateral Strategy
            </h1>
            <div style={{
              fontSize: tokens.typography.sizes.md,
              color: tokens.colors.text.secondary
            }}>
              Alex Kim • Crypto Portfolio Manager • Digital Asset Management (A$2B AUM)
            </div>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[4], alignItems: 'center' }}>
            <DeFiPhaseIndicator currentPhase={currentPhase} tokens={tokens} />
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
              Exit Strategy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={contentStyles}>
        <div>
          <DeFiScenarioContent
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            onStepComplete={handleStepCompletion}
            tokens={tokens}
            defiMetrics={defiMetrics}
            yieldStrategies={yieldStrategies}
            simulation={simulation}
          />
        </div>

        {/* DeFi Analytics Sidebar */}
        <div style={sidebarStyles}>
          <DeFiAnalyticsSidebar
            currentPhase={currentPhase}
            completedSteps={completedSteps}
            tokens={tokens}
            defiMetrics={defiMetrics}
            yieldStrategies={yieldStrategies}
          />
        </div>
      </div>
    </div>
  );
};

const DeFiPhaseIndicator: React.FC<{ currentPhase: string; tokens: any }> = ({ currentPhase, tokens }) => {
  const phases = ['api_discovery', 'collateral_analysis', 'yield_optimization', 'automation_setup', 'strategy_deployment'];
  const currentIndex = phases.indexOf(currentPhase);

  const phaseLabels = {
    api_discovery: 'API',
    collateral_analysis: 'COLLATERAL',
    yield_optimization: 'YIELD',
    automation_setup: 'AUTOMATION',
    strategy_deployment: 'DEPLOY'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
      {phases.map((phase, index) => (
        <div
          key={phase}
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.sizes.xs,
            backgroundColor: index <= currentIndex ? tokens.colors.accent.primary : tokens.colors.surface.tertiary,
            color: index <= currentIndex ? tokens.colors.surface.primary : tokens.colors.text.secondary,
            fontWeight: tokens.typography.weights.medium,
            fontFamily: tokens.typography.families.financial
          }}
        >
          {phaseLabels[phase as keyof typeof phaseLabels]}
        </div>
      ))}
    </div>
  );
};

const DeFiScenarioContent: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  defiMetrics: any;
  yieldStrategies: any;
  simulation: any;
}> = ({ currentPhase, completedSteps, onStepComplete, tokens, defiMetrics, yieldStrategies, simulation }) => {
  switch (currentPhase) {
    case 'api_discovery':
      return <APIDiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
    case 'collateral_analysis':
      return <CollateralAnalysisPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
    case 'yield_optimization':
      return <YieldOptimizationPhase onStepComplete={onStepComplete} tokens={tokens} defiMetrics={defiMetrics} />;
    case 'automation_setup':
      return <AutomationSetupPhase onStepComplete={onStepComplete} tokens={tokens} yieldStrategies={yieldStrategies} />;
    case 'strategy_deployment':
      return <StrategyDeploymentPhase onStepComplete={onStepComplete} tokens={tokens} defiMetrics={defiMetrics} />;
    default:
      return <APIDiscoveryPhase onStepComplete={onStepComplete} tokens={tokens} simulation={simulation} />;
  }
};

const APIDiscoveryPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  simulation: any;
}> = ({ onStepComplete, tokens, simulation }) => {
  const [apiSteps, setAPISteps] = useState({
    wrelAPIAccess: false,
    crossChainIntegration: false,
    protocolAnalysis: false
  });

  const handleAPIAccess = async () => {
    if (!simulation) return;

    // Simulate API discovery and integration
    const apiData = await simulation.apiGateway.getBloombergData({
      symbol: 'WREI-CC-001',
      fields: ['yield', 'liquidity', 'collateral_ratio']
    });

    setAPISteps(prev => ({ ...prev, wrelAPIAccess: true }));
    onStepComplete('wrel_api_access', {
      apiEndpoints: [
        'GET /api/v2/tokens/pricing',
        'GET /api/v2/yield/strategies',
        'POST /api/v2/collateral/analysis',
        'WebSocket /ws/real-time-data'
      ],
      rateLimit: '1000 req/min',
      authentication: 'API Key + OAuth2',
      realTimeData: true
    });
  };

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        API Integration & Protocol Discovery
      </h2>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <DeFiActionCard
          title="WREL API Access & Documentation"
          description="Review API endpoints, rate limits, and real-time data streams"
          completed={apiSteps.wrelAPIAccess}
          onComplete={handleAPIAccess}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Cross-Chain Integration Analysis"
          description="Analyze Ethereum, Polygon, and Arbitrum integration capabilities"
          completed={apiSteps.crossChainIntegration}
          disabled={!apiSteps.wrelAPIAccess}
          onComplete={() => {
            setAPISteps(prev => ({ ...prev, crossChainIntegration: true }));
            onStepComplete('cross_chain_analysis', {
              supportedChains: ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'],
              bridgingCosts: {
                ethereum: '$45-120',
                polygon: '$0.01-0.50',
                arbitrum: '$2-15'
              },
              liquidityDepth: {
                ethereum: '$125M',
                polygon: '$15M',
                arbitrum: '$45M'
              }
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="DeFi Protocol Compatibility Assessment"
          description="Evaluate compatibility with Uniswap, Aave, Compound, Curve"
          completed={apiSteps.protocolAnalysis}
          disabled={!apiSteps.crossChainIntegration}
          onComplete={() => {
            setAPISteps(prev => ({ ...prev, protocolAnalysis: true }));
            onStepComplete('protocol_analysis', {
              compatibleProtocols: [
                { name: 'Uniswap V3', liquidity: '$85M', fees: '0.05-1.00%' },
                { name: 'Aave V3', borrowRate: '3.2%', collateralRatio: '75%' },
                { name: 'Compound V3', supplyAPY: '4.8%', borrowAPY: '6.1%' },
                { name: 'Curve', stablePoolAPY: '8.5%', fees: '0.04%' }
              ]
            });
          }}
          tokens={tokens}
          techLevel="high"
        />
      </div>

      <TechnicalInfoPanel
        title="Digital Asset Management DeFi Context"
        content={[
          'AUM: A$2B specialized in crypto and DeFi strategies',
          'Target allocation: A$500M for tokenized RWA (25%)',
          'Investment approach: API-first, automated strategies, yield optimization',
          'Risk tolerance: Aggressive with sophisticated risk management'
        ]}
        tokens={tokens}
      />
    </div>
  );
};

const CollateralAnalysisPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  simulation: any;
}> = ({ onStepComplete, tokens, simulation }) => {
  const [collateralSteps, setCollateralSteps] = useState({
    collateralRatios: false,
    liquidationRisk: false,
    crossCollateral: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Cross-Collateral Analysis & Risk Assessment
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacing[6],
        marginBottom: tokens.spacing[6]
      }}>
        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Collateral Efficiency
          </h3>
          <CollateralMetricsCard
            metrics={[
              { label: 'WREI Collateral Ratio', value: '75%', status: 'positive' },
              { label: 'ETH Cross-Collateral', value: '80%', status: 'positive' },
              { label: 'BTC Cross-Collateral', value: '70%', status: 'neutral' },
              { label: 'Stablecoin Buffer', value: '15%', status: 'positive' }
            ]}
            tokens={tokens}
          />
        </div>

        <div>
          <h3 style={{ fontSize: tokens.typography.sizes.lg, marginBottom: tokens.spacing[4], color: tokens.colors.text.primary }}>
            Liquidation Protection
          </h3>
          <CollateralMetricsCard
            metrics={[
              { label: 'Liquidation Threshold', value: '85%', status: 'neutral' },
              { label: 'Current Health Factor', value: '2.45', status: 'positive' },
              { label: 'Price Drop Protection', value: '42%', status: 'positive' },
              { label: 'Auto-Rebalance', value: 'Enabled', status: 'positive' }
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
        <DeFiActionCard
          title="Analyze Collateral Ratios & LTV"
          description="Calculate loan-to-value ratios across different collateral types"
          completed={collateralSteps.collateralRatios}
          onComplete={() => {
            setCollateralSteps(prev => ({ ...prev, collateralRatios: true }));
            onStepComplete('collateral_ratios', {
              wrelLTV: 0.75,
              ethLTV: 0.80,
              btcLTV: 0.70,
              optimalMix: {
                wrel: 0.40,
                eth: 0.35,
                btc: 0.15,
                stables: 0.10
              }
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Liquidation Risk Modeling"
          description="Model liquidation scenarios and set up protection mechanisms"
          completed={collateralSteps.liquidationRisk}
          disabled={!collateralSteps.collateralRatios}
          onComplete={() => {
            setCollateralSteps(prev => ({ ...prev, liquidationRisk: true }));
            onStepComplete('liquidation_modeling', {
              scenarios: [
                { name: '30% Market Drop', riskLevel: 'Medium', action: 'Rebalance' },
                { name: '50% Market Drop', riskLevel: 'High', action: 'Emergency Exit' },
                { name: 'Flash Crash', riskLevel: 'Critical', action: 'Circuit Breaker' }
              ],
              protectionMechanisms: ['Auto-rebalance', 'Stop-loss', 'Emergency liquidation']
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Cross-Collateral Strategy Optimization"
          description="Optimize collateral mix for maximum capital efficiency"
          completed={collateralSteps.crossCollateral}
          disabled={!collateralSteps.liquidationRisk}
          onComplete={() => {
            setCollateralSteps(prev => ({ ...prev, crossCollateral: true }));
            onStepComplete('cross_collateral_optimization', {
              strategy: 'Diversified Cross-Collateral',
              expectedEfficiency: 0.87,
              capitalUtilization: 0.92,
              riskScore: 6.5
            });
          }}
          tokens={tokens}
          techLevel="high"
        />
      </div>
    </div>
  );
};

const YieldOptimizationPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  defiMetrics: any;
}> = ({ onStepComplete, tokens, defiMetrics }) => {
  const [yieldSteps, setYieldSteps] = useState({
    protocolComparison: false,
    liquidityMining: false,
    yieldStrategy: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Yield Optimization & Strategy Selection
      </h2>

      <div style={{
        marginBottom: tokens.spacing[6]
      }}>
        <YieldStrategyGrid tokens={tokens} />
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <DeFiActionCard
          title="Multi-Protocol Yield Comparison"
          description="Compare APYs across Aave, Compound, Uniswap, and Curve"
          completed={yieldSteps.protocolComparison}
          onComplete={() => {
            setYieldSteps(prev => ({ ...prev, protocolComparison: true }));
            onStepComplete('protocol_comparison', {
              protocols: [
                { name: 'Aave V3', apy: 0.132, liquidity: '$85M', risk: 'Medium' },
                { name: 'Uniswap V3', apy: 0.187, liquidity: '$125M', risk: 'Medium-High' },
                { name: 'Curve', apy: 0.095, liquidity: '$45M', risk: 'Low' },
                { name: 'Compound V3', apy: 0.108, liquidity: '$65M', risk: 'Low-Medium' }
              ]
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Liquidity Mining Opportunities"
          description="Identify and evaluate liquidity mining rewards and token incentives"
          completed={yieldSteps.liquidityMining}
          disabled={!yieldSteps.protocolComparison}
          onComplete={() => {
            setYieldSteps(prev => ({ ...prev, liquidityMining: true }));
            onStepComplete('liquidity_mining', {
              opportunities: [
                { protocol: 'Uniswap V3 WREL/USDC', baseAPY: 0.087, rewardAPY: 0.125, totalAPY: 0.212 },
                { protocol: 'Curve WREL/3CRV', baseAPY: 0.065, rewardAPY: 0.085, totalAPY: 0.150 },
                { protocol: 'Balancer WREL/ETH/BTC', baseAPY: 0.095, rewardAPY: 0.105, totalAPY: 0.200 }
              ]
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Optimize Yield Farming Strategy"
          description="Design automated yield farming strategy with dynamic rebalancing"
          completed={yieldSteps.yieldStrategy}
          disabled={!yieldSteps.liquidityMining}
          onComplete={() => {
            setYieldSteps(prev => ({ ...prev, yieldStrategy: true }));
            onStepComplete('yield_strategy', {
              selectedStrategy: 'Multi-Protocol Rotation',
              expectedAPY: 0.195,
              rebalanceFrequency: 'Weekly',
              gasOptimization: 'Enabled',
              riskManagement: 'Dynamic hedging'
            });
          }}
          tokens={tokens}
          techLevel="high"
        />
      </div>
    </div>
  );
};

const AutomationSetupPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  yieldStrategies: any;
}> = ({ onStepComplete, tokens, yieldStrategies }) => {
  const [automationSteps, setAutomationSteps] = useState({
    smartContractSetup: false,
    rebalanceLogic: false,
    riskParameters: false
  });

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Automation & Smart Contract Configuration
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
          Smart Contract Configuration
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: tokens.spacing[6]
        }}>
          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Automation Parameters
            </h4>
            <div style={{
              backgroundColor: tokens.colors.surface.primary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              fontFamily: tokens.typography.families.financial,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div>Rebalance Threshold: ±5% deviation</div>
              <div>Gas Price Limit: 50 gwei</div>
              <div>Min Profit Threshold: $100</div>
              <div>Max Slippage: 1.5%</div>
              <div>Emergency Stop: Enabled</div>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: tokens.typography.sizes.md, marginBottom: tokens.spacing[3] }}>
              Risk Management
            </h4>
            <div style={{
              backgroundColor: tokens.colors.surface.primary,
              padding: tokens.spacing[4],
              borderRadius: tokens.borderRadius.md,
              fontFamily: tokens.typography.families.financial,
              fontSize: tokens.typography.sizes.sm
            }}>
              <div>Max Portfolio Exposure: 25%</div>
              <div>Position Size Limit: A$50M</div>
              <div>Daily Loss Limit: 2%</div>
              <div>Correlation Limit: 0.7</div>
              <div>Health Factor Min: 1.5</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <DeFiActionCard
          title="Deploy Smart Contract Strategy"
          description="Deploy and configure automated yield farming smart contracts"
          completed={automationSteps.smartContractSetup}
          onComplete={() => {
            setAutomationSteps(prev => ({ ...prev, smartContractSetup: true }));
            onStepComplete('smart_contract_setup', {
              contractAddress: '0x742d35Cc6638C0532925a3b8C17B1e9Ecz...',
              gasUsed: '1,250,000',
              deploymentCost: '$485',
              verification: 'Etherscan Verified'
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Configure Dynamic Rebalancing Logic"
          description="Set up automated rebalancing based on yield differentials"
          completed={automationSteps.rebalanceLogic}
          disabled={!automationSteps.smartContractSetup}
          onComplete={() => {
            setAutomationSteps(prev => ({ ...prev, rebalanceLogic: true }));
            onStepComplete('rebalance_logic', {
              triggers: ['Yield differential >2%', 'Weekly schedule', 'Volatility spike'],
              frequency: 'Dynamic (1-7 days)',
              gasOptimization: 'Flashloan bundling enabled'
            });
          }}
          tokens={tokens}
          techLevel="high"
        />

        <DeFiActionCard
          title="Set Risk Parameters & Circuit Breakers"
          description="Configure risk limits and emergency stop mechanisms"
          completed={automationSteps.riskParameters}
          disabled={!automationSteps.rebalanceLogic}
          onComplete={() => {
            setAutomationSteps(prev => ({ ...prev, riskParameters: true }));
            onStepComplete('risk_parameters', {
              circuitBreakers: ['Market volatility >40%', 'Protocol hack detected', 'Health factor <1.2'],
              emergencyActions: ['Pause strategy', 'Withdraw to safety', 'Notify operators'],
              monitoring: '24/7 automated + human oversight'
            });
          }}
          tokens={tokens}
          techLevel="high"
        />
      </div>
    </div>
  );
};

const StrategyDeploymentPhase: React.FC<{
  onStepComplete: (stepId: string, data?: any) => void;
  tokens: any;
  defiMetrics: any;
}> = ({ onStepComplete, tokens, defiMetrics }) => {
  const [strategyType, setStrategyType] = useState<'aggressive' | 'moderate' | 'conservative' | null>(null);

  return (
    <div>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[6],
        color: tokens.colors.text.primary
      }}>
        Strategy Deployment & Go-Live
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
          Select Deployment Strategy
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6]
        }}>
          {[
            {
              value: 'aggressive',
              label: 'AGGRESSIVE',
              color: tokens.colors.market.bearish,
              apy: '19.5%',
              risk: 'High',
              allocation: 'A$500M'
            },
            {
              value: 'moderate',
              label: 'MODERATE',
              color: tokens.colors.status.warning,
              apy: '14.2%',
              risk: 'Medium',
              allocation: 'A$300M'
            },
            {
              value: 'conservative',
              label: 'CONSERVATIVE',
              color: tokens.colors.market.bullish,
              apy: '9.8%',
              risk: 'Low',
              allocation: 'A$150M'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStrategyType(option.value as any)}
              style={{
                padding: tokens.spacing[4],
                borderRadius: tokens.borderRadius.md,
                border: `2px solid ${strategyType === option.value ? option.color : tokens.colors.surface.tertiary}`,
                backgroundColor: strategyType === option.value ? option.color + '20' : tokens.colors.surface.primary,
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
                color: tokens.colors.text.secondary,
                marginBottom: tokens.spacing[1]
              }}>
                Expected APY: {option.apy}
              </div>
              <div style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary,
                marginBottom: tokens.spacing[1]
              }}>
                Risk Level: {option.risk}
              </div>
              <div style={{
                fontSize: tokens.typography.sizes.sm,
                color: tokens.colors.text.secondary
              }}>
                Allocation: {option.allocation}
              </div>
            </button>
          ))}
        </div>

        {strategyType && (
          <button
            onClick={() => {
              onStepComplete('strategy_deployment', {
                strategy: strategyType,
                allocation: strategyType === 'aggressive' ? 500000000 : strategyType === 'moderate' ? 300000000 : 150000000,
                expectedAPY: strategyType === 'aggressive' ? 0.195 : strategyType === 'moderate' ? 0.142 : 0.098,
                automation: true,
                goLiveTimestamp: Date.now()
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
            Deploy Strategy to Mainnet
          </button>
        )}
      </div>

      {strategyType && (
        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.accent.primary + '20',
          border: `1px solid ${tokens.colors.accent.primary}`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.primary,
          fontFamily: tokens.typography.families.financial
        }}>
          ✓ DeFi yield farming strategy successfully deployed to mainnet with automated
          cross-collateral management, dynamic rebalancing, and comprehensive risk controls.
          Strategy is now live and earning yield across multiple protocols.
        </div>
      )}
    </div>
  );
};

// Utility Components
const DeFiActionCard: React.FC<{
  title: string;
  description: string;
  completed: boolean;
  disabled?: boolean;
  onComplete: () => void;
  tokens: any;
  techLevel: 'high';
}> = ({ title, description, completed, disabled = false, onComplete, tokens, techLevel }) => (
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
          color: tokens.colors.text.primary,
          fontFamily: tokens.typography.families.financial
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
          backgroundColor: completed ? tokens.colors.accent.primary : tokens.colors.status.warning,
          border: 'none',
          borderRadius: tokens.borderRadius.sm,
          color: tokens.colors.surface.primary,
          fontSize: tokens.typography.sizes.sm,
          cursor: (completed || disabled) ? 'not-allowed' : 'pointer',
          opacity: (completed || disabled) ? 0.7 : 1,
          fontFamily: tokens.typography.families.financial
        }}
      >
        {completed ? 'EXEC ✓' : 'EXEC'}
      </button>
    </div>
  </div>
);

const TechnicalInfoPanel: React.FC<{
  title: string;
  content: string[];
  tokens: any;
}> = ({ title, content, tokens }) => (
  <div style={{
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.accent.primary}`,
    borderLeft: `4px solid ${tokens.colors.accent.primary}`,
    borderRadius: tokens.borderRadius.md
  }}>
    <h4 style={{
      fontSize: tokens.typography.sizes.md,
      fontWeight: tokens.typography.weights.semibold,
      marginBottom: tokens.spacing[3],
      color: tokens.colors.text.primary,
      fontFamily: tokens.typography.families.financial
    }}>
      {title}
    </h4>
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      fontSize: tokens.typography.sizes.sm,
      color: tokens.colors.text.secondary,
      fontFamily: tokens.typography.families.financial
    }}>
      {content.map((item, index) => (
        <li key={index} style={{ marginBottom: tokens.spacing[1] }}>
          > {item}
        </li>
      ))}
    </ul>
  </div>
);

const CollateralMetricsCard: React.FC<{
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
        borderBottom: index < metrics.length - 1 ? `1px solid ${tokens.colors.surface.tertiary}` : 'none',
        fontFamily: tokens.typography.families.financial
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

const YieldStrategyGrid: React.FC<{ tokens: any }> = ({ tokens }) => {
  const yieldData = [
    {
      id: '1',
      protocol: 'Uniswap V3',
      apy: 0.187,
      liquidity: 125000000,
      fees: 0.003,
      risk: 'Medium-High',
      allocation: 0.35
    },
    {
      id: '2',
      protocol: 'Aave V3',
      apy: 0.132,
      liquidity: 85000000,
      fees: 0,
      risk: 'Medium',
      allocation: 0.25
    },
    {
      id: '3',
      protocol: 'Curve',
      apy: 0.095,
      liquidity: 45000000,
      fees: 0.0004,
      risk: 'Low',
      allocation: 0.20
    },
    {
      id: '4',
      protocol: 'Balancer',
      apy: 0.155,
      liquidity: 32000000,
      fees: 0.0025,
      risk: 'Medium',
      allocation: 0.20
    }
  ];

  const columns = [
    { key: 'protocol', header: 'Protocol', type: 'text' as const },
    { key: 'apy', header: 'APY', type: 'percentage' as const },
    { key: 'liquidity', header: 'Liquidity', type: 'currency' as const },
    { key: 'fees', header: 'Fees', type: 'percentage' as const },
    { key: 'risk', header: 'Risk', type: 'text' as const },
    { key: 'allocation', header: 'Target %', type: 'percentage' as const }
  ];

  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.lg,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary,
        fontFamily: tokens.typography.families.financial
      }}>
        Multi-Protocol Yield Analysis
      </h3>
      <ProfessionalDataGrid
        columns={columns}
        data={yieldData}
        title="DeFi Yield Farming Opportunities"
        monospaceNumbers={true}
        highlightPositive={true}
      />
    </div>
  );
};

const DeFiAnalyticsSidebar: React.FC<{
  currentPhase: string;
  completedSteps: string[];
  tokens: any;
  defiMetrics: any;
  yieldStrategies: any;
}> = ({ currentPhase, completedSteps, tokens, defiMetrics, yieldStrategies }) => {
  return (
    <div>
      <h3 style={{
        fontSize: tokens.typography.sizes.md,
        fontWeight: tokens.typography.weights.semibold,
        marginBottom: tokens.spacing[4],
        color: tokens.colors.text.primary,
        fontFamily: tokens.typography.families.financial
      }}>
        DeFi Strategy Metrics
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
          marginBottom: tokens.spacing[2],
          fontFamily: tokens.typography.families.financial
        }}>
          EXECUTION PROGRESS
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.lg,
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.accent.primary,
          fontFamily: tokens.typography.families.financial
        }}>
          {completedSteps.length} / 15
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
            width: `${(completedSteps.length / 15) * 100}%`,
            height: '100%',
            backgroundColor: tokens.colors.accent.primary,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

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
          marginBottom: tokens.spacing[2],
          fontFamily: tokens.typography.families.financial
        }}>
          YIELD TARGETS
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.xs,
          color: tokens.colors.text.secondary,
          fontFamily: tokens.typography.families.financial
        }}>
          <div>Target APY: 15-20%</div>
          <div>Risk Level: Medium-High</div>
          <div>Automation: Enabled</div>
          <div>Rebalance: Dynamic</div>
        </div>
      </div>

      <div style={{
        padding: tokens.spacing[3],
        backgroundColor: tokens.colors.surface.primary,
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.surface.tertiary}`
      }}>
        <div style={{
          fontSize: tokens.typography.sizes.sm,
          color: tokens.colors.text.secondary,
          marginBottom: tokens.spacing[2],
          fontFamily: tokens.typography.families.financial
        }}>
          CURRENT PHASE
        </div>
        <div style={{
          fontSize: tokens.typography.sizes.md,
          fontWeight: tokens.typography.weights.medium,
          color: tokens.colors.text.primary,
          textTransform: 'uppercase',
          fontFamily: tokens.typography.families.financial
        }}>
          {currentPhase.replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};