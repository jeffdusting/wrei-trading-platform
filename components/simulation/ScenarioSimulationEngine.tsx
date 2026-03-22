'use client';

import { FC } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import { InfrastructureFundScenario } from '@/components/scenarios/InfrastructureFundScenario';
import { ESGImpactScenario } from '@/components/scenarios/ESGImpactScenario';
import { DeFiYieldFarmingScenario } from '@/components/scenarios/DeFiYieldFarmingScenario';
import { FamilyOfficeScenario } from '@/components/scenarios/FamilyOfficeScenario';
import { SovereignWealthFundScenario } from '@/components/scenarios/SovereignWealthFundScenario';

interface ScenarioSimulationEngineProps {
  scenario: {
    id: string;
    title: string;
    description: string;
    persona: {
      id: string;
      name: string;
      role: string;
      organization: string;
    };
    complexity: string;
    estimatedTime: number;
  };
  onExit: () => void;
}

export const ScenarioSimulationEngine: FC<ScenarioSimulationEngineProps> = ({
  scenario,
  onExit
}) => {
  const tokens = useDesignTokens('institutional');

  const handleScenarioComplete = (result: any) => {
    console.log('Scenario completed:', result);
    // In production, this would save results and navigate appropriately
    onExit();
  };

  // Route to appropriate scenario component based on scenario ID
  switch (scenario.id) {
    case 'scenario-01':
    case 'infrastructure-fund-discovery':
      return (
        <InfrastructureFundScenario
          onComplete={handleScenarioComplete}
          onExit={onExit}
        />
      );

    case 'scenario-02':
    case 'esg-impact-analysis':
      return (
        <ESGImpactScenario
          onComplete={handleScenarioComplete}
          onExit={onExit}
        />
      );

    case 'scenario-03':
    case 'defi-yield-farming':
      return (
        <DeFiYieldFarmingScenario
          onComplete={handleScenarioComplete}
          onExit={onExit}
        />
      );

    case 'scenario-04':
    case 'family-office-conservative':
      return (
        <FamilyOfficeScenario
          onComplete={handleScenarioComplete}
          onExit={onExit}
        />
      );

    case 'scenario-05':
    case 'sovereign-wealth-fund-macro':
      return (
        <SovereignWealthFundScenario
          onComplete={handleScenarioComplete}
          onExit={onExit}
        />
      );

    default:
      return <PlaceholderScenario scenario={scenario} onExit={onExit} tokens={tokens} />;
  }
};

// Placeholder component for scenarios not yet implemented
const PlaceholderScenario: FC<{
  scenario: any;
  onExit: () => void;
  tokens: any;
}> = ({ scenario, onExit, tokens }) => (
  <div style={{
    padding: tokens.spacing[6],
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.surface.tertiary}`
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing[6],
      paddingBottom: tokens.spacing[4],
      borderBottom: `1px solid ${tokens.colors.surface.tertiary}`
    }}>
      <div>
        <h1 style={{
          fontSize: tokens.typography.sizes['2xl'],
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.text.primary,
          margin: 0,
          marginBottom: tokens.spacing[2]
        }}>
          {scenario.title}
        </h1>
        <div style={{
          fontSize: tokens.typography.sizes.md,
          color: tokens.colors.text.secondary
        }}>
          {scenario.persona?.name} • {scenario.persona?.role} • {scenario.persona?.organization}
        </div>
      </div>
      <button
        onClick={onExit}
        style={{
          padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
          backgroundColor: tokens.colors.surface.tertiary,
          border: `1px solid ${tokens.colors.surface.elevated}`,
          borderRadius: tokens.borderRadius.md,
          color: tokens.colors.text.primary,
          cursor: 'pointer',
          fontSize: tokens.typography.sizes.sm,
          fontWeight: tokens.typography.weights.medium
        }}
      >
        Exit Scenario
      </button>
    </div>

    <div style={{
      backgroundColor: tokens.colors.surface.secondary,
      padding: tokens.spacing[6],
      borderRadius: tokens.borderRadius.md,
      border: `1px solid ${tokens.colors.surface.tertiary}`,
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: tokens.typography.sizes.xl,
        fontWeight: tokens.typography.weights.semibold,
        color: tokens.colors.text.primary,
        marginBottom: tokens.spacing[4]
      }}>
        {scenario.title}
      </h2>
      <p style={{
        fontSize: tokens.typography.sizes.md,
        color: tokens.colors.text.secondary,
        marginBottom: tokens.spacing[6],
        maxWidth: '600px',
        margin: `0 auto ${tokens.spacing[6]} auto`
      }}>
        {scenario.description}
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacing[4],
        marginBottom: tokens.spacing[6]
      }}>
        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.surface.primary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`
        }}>
          <h3 style={{
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.secondary,
            margin: `0 0 ${tokens.spacing[2]} 0`
          }}>
            COMPLEXITY
          </h3>
          <div style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.bold,
            color: tokens.colors.accent.primary
          }}>
            {scenario.complexity}
          </div>
        </div>

        <div style={{
          padding: tokens.spacing[4],
          backgroundColor: tokens.colors.surface.primary,
          borderRadius: tokens.borderRadius.md,
          border: `1px solid ${tokens.colors.surface.tertiary}`
        }}>
          <h3 style={{
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.secondary,
            margin: `0 0 ${tokens.spacing[2]} 0`
          }}>
            ESTIMATED TIME
          </h3>
          <div style={{
            fontSize: tokens.typography.sizes.lg,
            fontWeight: tokens.typography.weights.bold,
            color: tokens.colors.accent.info
          }}>
            {scenario.estimatedTime} min
          </div>
        </div>
      </div>

      <div style={{
        padding: tokens.spacing[4],
        backgroundColor: tokens.colors.status.warning + '20',
        borderRadius: tokens.borderRadius.md,
        border: `1px solid ${tokens.colors.status.warning}`,
        color: tokens.colors.text.primary,
        fontSize: tokens.typography.sizes.sm
      }}>
        🚧 <strong>Coming Soon:</strong> This scenario will be implemented in the next development phase.
        The Infrastructure Fund Discovery scenario is now fully operational and can be accessed
        from the scenario selection interface.
      </div>
    </div>
  </div>
);