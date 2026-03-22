'use client';

import { FC, useState, useMemo } from 'react';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  persona: InvestorPersona;
  complexity: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  duration: string;
  outcome: 'Purchase Decision' | 'Information Gathering' | 'Compliance Validation' | 'Portfolio Optimization';
  tags: string[];
  estimatedTime: number; // minutes
  successMetrics: {
    completionRate: number;
    averageTime: number;
    userSatisfaction: number;
  };
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
}

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: Scenario) => void;
  className?: string;
}

export const ScenarioSelector: FC<ScenarioSelectorProps> = ({
  onSelectScenario,
  className = ''
}) => {
  const tokens = useDesignTokens('institutional');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);

  const scenarios = useMemo(() => generateScenarios(), []);

  const filteredScenarios = useMemo(() => {
    return scenarios.filter(scenario => {
      const matchesComplexity = selectedComplexity === 'all' || scenario.complexity === selectedComplexity;
      const matchesOutcome = selectedOutcome === 'all' || scenario.outcome === selectedOutcome;
      const matchesPersona = selectedPersona === 'all' || scenario.persona.id === selectedPersona;
      const matchesSearch = searchTerm === '' ||
        scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesComplexity && matchesOutcome && matchesPersona && matchesSearch;
    });
  }, [scenarios, selectedComplexity, selectedOutcome, selectedPersona, searchTerm]);

  const containerStyles = {
    backgroundColor: tokens.colors.surface.primary,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    padding: tokens.spacing[6],
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const headerStyles = {
    marginBottom: tokens.spacing[6],
    textAlign: 'center' as const
  };

  const filtersStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.secondary,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.surface.tertiary}`
  };

  const scenarioGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: tokens.spacing[4],
    marginBottom: tokens.spacing[6]
  };

  const scenarioCardStyles = {
    backgroundColor: tokens.colors.surface.secondary,
    border: `1px solid ${tokens.colors.surface.tertiary}`,
    borderRadius: tokens.borderRadius.md,
    padding: tokens.spacing[4],
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    position: 'relative' as const
  };

  return (
    <div className={`scenario-selector ${className}`} style={containerStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <h1 style={{
          fontSize: tokens.typography.sizes['2xl'],
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.text.primary,
          marginBottom: tokens.spacing[2]
        }}>
          WREI Institutional Scenario Simulation
        </h1>
        <p style={{
          fontSize: tokens.typography.sizes.lg,
          color: tokens.colors.text.secondary,
          margin: 0
        }}>
          Experience realistic institutional investor workflows with 16 comprehensive scenarios
        </p>
      </div>

      {/* Filters */}
      <div style={filtersStyles}>
        <div>
          <label style={{
            fontSize: tokens.typography.sizes.sm,
            fontWeight: tokens.typography.weights.semibold,
            color: tokens.colors.text.secondary,
            display: 'block',
            marginBottom: tokens.spacing[1]
          }}>
            SEARCH
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search scenarios..."
            style={{
              width: '100%',
              padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
              backgroundColor: tokens.colors.surface.primary,
              border: `1px solid ${tokens.colors.surface.tertiary}`,
              borderRadius: tokens.borderRadius.sm,
              color: tokens.colors.text.primary,
              fontSize: tokens.typography.sizes.sm
            }}
          />
        </div>

        <FilterSelect
          label="Complexity"
          value={selectedComplexity}
          onChange={setSelectedComplexity}
          options={[
            { value: 'all', label: 'All Levels' },
            { value: 'Basic', label: 'Basic' },
            { value: 'Intermediate', label: 'Intermediate' },
            { value: 'Advanced', label: 'Advanced' },
            { value: 'Expert', label: 'Expert' }
          ]}
          tokens={tokens}
        />

        <FilterSelect
          label="Outcome Type"
          value={selectedOutcome}
          onChange={setSelectedOutcome}
          options={[
            { value: 'all', label: 'All Outcomes' },
            { value: 'Purchase Decision', label: 'Purchase Decision' },
            { value: 'Information Gathering', label: 'Information Gathering' },
            { value: 'Compliance Validation', label: 'Compliance Validation' },
            { value: 'Portfolio Optimization', label: 'Portfolio Optimization' }
          ]}
          tokens={tokens}
        />

        <FilterSelect
          label="Investor Persona"
          value={selectedPersona}
          onChange={setSelectedPersona}
          options={[
            { value: 'all', label: 'All Personas' },
            { value: 'infrastructure-fund', label: 'Infrastructure Fund' },
            { value: 'esg-fund', label: 'ESG Fund' },
            { value: 'defi-fund', label: 'DeFi Fund' },
            { value: 'family-office', label: 'Family Office' },
            { value: 'sovereign-wealth', label: 'Sovereign Wealth' },
            { value: 'pension-fund', label: 'Pension Fund' }
          ]}
          tokens={tokens}
        />
      </div>

      {/* Results Count */}
      <div style={{
        marginBottom: tokens.spacing[4],
        fontSize: tokens.typography.sizes.sm,
        color: tokens.colors.text.secondary
      }}>
        Showing {filteredScenarios.length} of {scenarios.length} scenarios
      </div>

      {/* Scenario Grid */}
      <div style={scenarioGridStyles}>
        {filteredScenarios.map(scenario => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={() => onSelectScenario(scenario)}
            onPreview={() => setPreviewScenario(scenario)}
            isSelected={previewScenario?.id === scenario.id}
            tokens={tokens}
          />
        ))}
      </div>

      {/* Preview Panel */}
      {previewScenario && (
        <ScenarioPreview
          scenario={previewScenario}
          onClose={() => setPreviewScenario(null)}
          onStart={() => onSelectScenario(previewScenario)}
          tokens={tokens}
        />
      )}
    </div>
  );
};

const FilterSelect: FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  tokens: any;
}> = ({ label, value, onChange, options, tokens }) => (
  <div>
    <label style={{
      fontSize: tokens.typography.sizes.sm,
      fontWeight: tokens.typography.weights.semibold,
      color: tokens.colors.text.secondary,
      display: 'block',
      marginBottom: tokens.spacing[1]
    }}>
      {label.toUpperCase()}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
        backgroundColor: tokens.colors.surface.primary,
        border: `1px solid ${tokens.colors.surface.tertiary}`,
        borderRadius: tokens.borderRadius.sm,
        color: tokens.colors.text.primary,
        fontSize: tokens.typography.sizes.sm
      }}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ScenarioCard: FC<{
  scenario: Scenario;
  onSelect: () => void;
  onPreview: () => void;
  isSelected: boolean;
  tokens: any;
}> = ({ scenario, onSelect, onPreview, isSelected, tokens }) => (
  <div
    style={{
      backgroundColor: isSelected ? tokens.colors.surface.tertiary : tokens.colors.surface.secondary,
      border: `1px solid ${isSelected ? tokens.colors.accent.primary : tokens.colors.surface.tertiary}`,
      borderRadius: tokens.borderRadius.md,
      padding: tokens.spacing[4],
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out'
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = tokens.colors.surface.elevated;
        e.currentTarget.style.borderColor = tokens.colors.accent.info;
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = tokens.colors.surface.secondary;
        e.currentTarget.style.borderColor = tokens.colors.surface.tertiary;
      }
    }}
    onClick={onPreview}
  >
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: tokens.spacing[3]
    }}>
      <h3 style={{
        fontSize: tokens.typography.sizes.lg,
        fontWeight: tokens.typography.weights.semibold,
        color: tokens.colors.text.primary,
        margin: 0
      }}>
        {scenario.title}
      </h3>
      <div style={{
        padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
        backgroundColor: getComplexityColor(scenario.complexity, tokens),
        borderRadius: tokens.borderRadius.sm,
        fontSize: tokens.typography.sizes.xs,
        fontWeight: tokens.typography.weights.medium,
        color: tokens.colors.surface.primary
      }}>
        {scenario.complexity}
      </div>
    </div>

    <p style={{
      fontSize: tokens.typography.sizes.sm,
      color: tokens.colors.text.secondary,
      marginBottom: tokens.spacing[3],
      lineHeight: tokens.typography.lineHeights.normal
    }}>
      {scenario.description}
    </p>

    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: tokens.typography.sizes.xs,
      color: tokens.colors.text.tertiary
    }}>
      <span>{scenario.persona.role}</span>
      <span>{scenario.estimatedTime}min</span>
    </div>

    <div style={{
      display: 'flex',
      gap: tokens.spacing[1],
      marginTop: tokens.spacing[2],
      flexWrap: 'wrap'
    }}>
      {scenario.tags.slice(0, 3).map(tag => (
        <span
          key={tag}
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            backgroundColor: tokens.colors.surface.primary,
            borderRadius: tokens.borderRadius.sm,
            fontSize: tokens.typography.sizes.xs,
            color: tokens.colors.text.secondary
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const ScenarioPreview: FC<{
  scenario: Scenario;
  onClose: () => void;
  onStart: () => void;
  tokens: any;
}> = ({ scenario, onClose, onStart, tokens }) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: tokens.colors.surface.secondary,
      borderRadius: tokens.borderRadius.lg,
      padding: tokens.spacing[6],
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      border: `1px solid ${tokens.colors.surface.tertiary}`
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: tokens.spacing[4]
      }}>
        <h2 style={{
          fontSize: tokens.typography.sizes.xl,
          fontWeight: tokens.typography.weights.bold,
          color: tokens.colors.text.primary,
          margin: 0
        }}>
          {scenario.title}
        </h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: tokens.colors.text.secondary,
            cursor: 'pointer',
            fontSize: tokens.typography.sizes.lg
          }}
        >
          ✕
        </button>
      </div>

      {/* Scenario details would go here */}
      <div style={{ marginBottom: tokens.spacing[6] }}>
        <p style={{
          fontSize: tokens.typography.sizes.md,
          color: tokens.colors.text.secondary,
          lineHeight: tokens.typography.lineHeights.normal
        }}>
          {scenario.description}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: tokens.spacing[4],
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            backgroundColor: tokens.colors.surface.tertiary,
            border: 'none',
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.text.primary,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={onStart}
          style={{
            padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
            backgroundColor: tokens.colors.accent.primary,
            border: 'none',
            borderRadius: tokens.borderRadius.md,
            color: tokens.colors.surface.primary,
            cursor: 'pointer',
            fontWeight: tokens.typography.weights.semibold
          }}
        >
          Start Scenario
        </button>
      </div>
    </div>
  </div>
);

function getComplexityColor(complexity: string, tokens: any): string {
  switch (complexity) {
    case 'Basic': return tokens.colors.status.online;
    case 'Intermediate': return tokens.colors.accent.info;
    case 'Advanced': return tokens.colors.status.warning;
    case 'Expert': return tokens.colors.market.bearish;
    default: return tokens.colors.accent.neutral;
  }
}

function generateScenarios(): Scenario[] {
  // Sample scenarios based on the USER_SCENARIOS.md document
  return [
    {
      id: 'scenario-01',
      title: 'Infrastructure Fund Discovery',
      description: 'Complete institutional evaluation of WREI carbon credits including portfolio analysis, risk assessment, benchmark comparison, and investment committee reporting for A$5B infrastructure fund.',
      persona: {
        id: 'infrastructure-fund',
        name: 'Sarah Chen',
        role: 'Senior Portfolio Manager',
        organization: 'Australian Infrastructure Fund',
        aum: 'A$5B',
        experience: '15 years institutional investing',
        techComfort: 'High',
        investmentAuthority: 'A$250M allocation',
        keyDrivers: ['Risk-adjusted returns', 'Regulatory compliance', 'Portfolio diversification']
      },
      complexity: 'Advanced',
      duration: '45-60 minutes',
      outcome: 'Purchase Decision',
      tags: ['Infrastructure', 'Portfolio Analysis', 'Risk Assessment', 'Committee Reporting', 'Professional Interface'],
      estimatedTime: 55,
      successMetrics: {
        completionRate: 0.92,
        averageTime: 48,
        userSatisfaction: 8.8
      }
    },
    {
      id: 'scenario-02',
      title: 'ESG Impact Investment Analysis',
      description: 'Comprehensive ESG analysis including impact measurement, sustainability metrics, premium justification, and third-party validation for sustainable capital allocation.',
      persona: {
        id: 'esg-fund',
        name: 'James Rodriguez',
        role: 'Chief Investment Officer',
        organization: 'Sustainable Capital Partners',
        aum: 'A$1B',
        experience: '12 years impact investing',
        techComfort: 'Medium-High',
        investmentAuthority: 'A$100M allocation',
        keyDrivers: ['Impact measurement', 'ESG ratings', 'Premium justification']
      },
      complexity: 'Advanced',
      duration: '60-75 minutes',
      outcome: 'Purchase Decision',
      tags: ['ESG', 'Impact Investing', 'Sustainability', 'Premium Analysis', 'Third-Party Validation'],
      estimatedTime: 65,
      successMetrics: {
        completionRate: 0.94,
        averageTime: 62,
        userSatisfaction: 9.1
      }
    },
    {
      id: 'scenario-03',
      title: 'DeFi Yield Farming Integration',
      description: 'Advanced DeFi strategy including cross-collateral analysis, yield optimization, automated smart contracts, and multi-protocol liquidity mining for sophisticated crypto asset management.',
      persona: {
        id: 'defi-fund',
        name: 'Alex Kim',
        role: 'Crypto Portfolio Manager',
        organization: 'Digital Asset Management',
        aum: 'A$2B',
        experience: '8 years DeFi specialist',
        techComfort: 'Very High',
        investmentAuthority: 'A$500M allocation',
        keyDrivers: ['Yield optimization', 'Liquidity', 'Cross-chain opportunities']
      },
      complexity: 'Expert',
      duration: '75-90 minutes',
      outcome: 'Portfolio Optimization',
      tags: ['DeFi', 'Yield Farming', 'Smart Contracts', 'Cross-Collateral', 'API Integration', 'Automation'],
      estimatedTime: 80,
      successMetrics: {
        completionRate: 0.88,
        averageTime: 75,
        userSatisfaction: 9.3
      }
    },
    {
      id: 'scenario-04',
      title: 'Family Office Conservative Analysis',
      description: 'Conservative institutional analysis for high-net-worth family office including risk management, tax optimization, multi-generational wealth planning, and family governance protocols.',
      persona: {
        id: 'family-office',
        name: 'Margaret Thompson',
        role: 'CFA, Principal',
        organization: 'Thompson Family Office',
        aum: 'A$500M',
        experience: '20 years private wealth management',
        techComfort: 'Medium',
        investmentAuthority: 'A$50M allocation',
        keyDrivers: ['Capital preservation', 'Tax efficiency', 'Multi-generational planning']
      },
      complexity: 'Intermediate',
      duration: '45-55 minutes',
      outcome: 'Portfolio Optimization',
      tags: ['Family Office', 'Conservative Analysis', 'Tax Optimization', 'Wealth Planning', 'Risk Management'],
      estimatedTime: 50,
      successMetrics: {
        completionRate: 0.96,
        averageTime: 45,
        userSatisfaction: 9.0
      }
    },
    {
      id: 'scenario-05',
      title: 'Sovereign Wealth Fund Macro Analysis',
      description: 'Comprehensive macroeconomic and geopolitical analysis for sovereign wealth fund including national climate strategy alignment, regional risk assessment, and multi-currency portfolio optimization.',
      persona: {
        id: 'sovereign-wealth',
        name: 'Dr. Li Wei Chen',
        role: 'Chief Investment Officer',
        organization: 'Singapore Sovereign Wealth Fund',
        aum: 'S$500B',
        experience: '25 years sovereign investing',
        techComfort: 'High',
        investmentAuthority: 'S$12.5B allocation',
        keyDrivers: ['National strategy alignment', 'Geopolitical stability', 'Long-term returns']
      },
      complexity: 'Expert',
      duration: '75-90 minutes',
      outcome: 'Portfolio Optimization',
      tags: ['Sovereign Wealth', 'Macro Analysis', 'Geopolitical Risk', 'National Strategy', 'Multi-Currency'],
      estimatedTime: 85,
      successMetrics: {
        completionRate: 0.85,
        averageTime: 78,
        userSatisfaction: 9.2
      }
    },
    // Add more scenarios...
  ];
}