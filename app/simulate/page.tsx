'use client';

import { useState } from 'react';
import { BloombergLayout } from '@/components/professional/BloombergLayout';
import { AccessibilityWrapper } from '@/components/professional/AccessibilityWrapper';
import { ScenarioSelector } from '@/components/simulation/ScenarioSelector';
import { ScenarioSimulationEngine } from '@/components/simulation/ScenarioSimulationEngine';

interface Scenario {
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
}

export default function SimulatePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setSimulationActive(true);
  };

  const handleScenarioExit = () => {
    setSelectedScenario(null);
    setSimulationActive(false);
  };

  const handleScenarioComplete = (result: any) => {
    console.log('Scenario completed:', result);
    // Return to scenario selector after completion
    setSelectedScenario(null);
    setSimulationActive(false);
  };

  if (simulationActive && selectedScenario) {
    return (
      <AccessibilityWrapper compliance="WCAG2.1-AA">
        <BloombergLayout
          investorType={selectedScenario.persona.id as any}
          mode="analysis"
        >
          <ScenarioSimulationEngine
            scenario={selectedScenario}
            onComplete={handleScenarioComplete}
            onExit={handleScenarioExit}
          />
        </BloombergLayout>
      </AccessibilityWrapper>
    );
  }

  return (
    <AccessibilityWrapper compliance="WCAG2.1-AA">
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0B',
        padding: '2rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <main id="main-content" tabIndex={-1}>
          <ScenarioSelector onSelectScenario={handleScenarioSelect} />
        </main>
      </div>
    </AccessibilityWrapper>
  );
}