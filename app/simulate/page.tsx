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
            onExit={handleScenarioExit}
          />
        </BloombergLayout>
      </AccessibilityWrapper>
    );
  }

  return (
    <AccessibilityWrapper compliance="WCAG2.1-AA">
      <div className="min-h-screen bg-slate-50">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="bloomberg-page-heading text-slate-800">Trading Simulation</h1>
                <p className="bloomberg-body-text text-slate-600 mt-1">
                  Interactive trading scenarios and simulation engine
                </p>
              </div>
              <div className="bloomberg-section-label">
                SIM
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <main id="main-content" tabIndex={-1}>
            <ScenarioSelector onSelectScenario={handleScenarioSelect} />
          </main>
        </div>
      </div>
    </AccessibilityWrapper>
  );
}