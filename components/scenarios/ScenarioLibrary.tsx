/**
 * WREI Trading Platform - Scenario Library
 *
 * Step 1.3: Scenario Library & Templates - Main Library Component
 * Central hub for managing and executing NSW ESC trading scenarios
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  PlayIcon,
  PlusIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CogIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

import {
  ScenarioType,
  ScenarioSummary,
  ScenarioConfiguration,
  AudienceConfiguration
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';

interface ScenarioLibraryProps {
  selectedAudience?: AudienceType;
  onScenarioSelect?: (scenarioId: string) => void;
  onBack?: () => void;
}

const ScenarioLibrary: React.FC<ScenarioLibraryProps> = ({
  selectedAudience,
  onScenarioSelect,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'templates' | 'running' | 'history'>('library');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [filterType, setFilterType] = useState<ScenarioType | 'all'>('all');

  const demoMode = useDemoMode();

  // NSW ESC Scenario Templates
  const scenarioTemplates: ScenarioSummary[] = [
    {
      id: 'esc-basic-trading',
      name: 'NSW ESC Basic Trading Scenario',
      type: 'esc-market-trading',
      status: 'ready',
      duration: 'quick',
      target_audiences: ['executive', 'technical', 'compliance'],
      last_run: null,
      success_rate: 0.95,
      created_date: new Date('2026-03-25')
    },
    {
      id: 'multi-participant-auction',
      name: 'Multi-Participant ESC Auction',
      type: 'multi-participant-auction',
      status: 'ready',
      duration: 'medium',
      target_audiences: ['executive', 'technical'],
      last_run: new Date('2026-03-24'),
      success_rate: 0.87,
      created_date: new Date('2026-03-20')
    },
    {
      id: 'cer-compliance-workflow',
      name: 'CER Compliance Validation',
      type: 'compliance-workflow',
      status: 'ready',
      duration: 'medium',
      target_audiences: ['compliance', 'technical'],
      last_run: new Date('2026-03-23'),
      success_rate: 0.92,
      created_date: new Date('2026-03-18')
    },
    {
      id: 'portfolio-optimization-demo',
      name: 'ESC Portfolio Optimization',
      type: 'portfolio-optimization',
      status: 'ready',
      duration: 'extended',
      target_audiences: ['executive'],
      last_run: new Date('2026-03-22'),
      success_rate: 0.89,
      created_date: new Date('2026-03-15')
    },
    {
      id: 'price-negotiation-ai',
      name: 'AI-Powered Price Negotiation',
      type: 'pricing-negotiation',
      status: 'ready',
      duration: 'quick',
      target_audiences: ['executive', 'technical'],
      last_run: new Date('2026-03-25'),
      success_rate: 0.94,
      created_date: new Date('2026-03-10')
    },
    {
      id: 'risk-assessment-comprehensive',
      name: 'Comprehensive Risk Assessment',
      type: 'risk-assessment',
      status: 'ready',
      duration: 'medium',
      target_audiences: ['compliance', 'executive'],
      last_run: new Date('2026-03-21'),
      success_rate: 0.91,
      created_date: new Date('2026-03-12')
    }
  ];

  // Filter scenarios based on selected audience and filter type
  const filteredScenarios = scenarioTemplates.filter(scenario => {
    const audienceMatch = !selectedAudience || scenario.target_audiences.includes(selectedAudience);
    const typeMatch = filterType === 'all' || scenario.type === filterType;
    return audienceMatch && typeMatch;
  });

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'scenario_selection', scenario_id: scenarioId, audience: selectedAudience }
    });

    if (onScenarioSelect) {
      onScenarioSelect(scenarioId);
    }
  };

  const getScenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case 'esc-market-trading':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'multi-participant-auction':
        return <UsersIcon className="w-5 h-5" />;
      case 'compliance-workflow':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'portfolio-optimization':
        return <FolderIcon className="w-5 h-5" />;
      case 'pricing-negotiation':
        return <PlayIcon className="w-5 h-5" />;
      case 'risk-assessment':
        return <ExclamationTriangleIcon className="w-5 h-5" />;
      case 'regulatory-validation':
        return <CheckCircleIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'quick':
        return '5-10 min';
      case 'medium':
        return '15-20 min';
      case 'extended':
        return '25-30 min';
      default:
        return '10-15 min';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scenarioTypeOptions: Array<{ value: ScenarioType | 'all'; label: string }> = [
    { value: 'all', label: 'All Scenarios' },
    { value: 'esc-market-trading', label: 'ESC Market Trading' },
    { value: 'multi-participant-auction', label: 'Multi-Participant Auctions' },
    { value: 'compliance-workflow', label: 'Compliance Workflows' },
    { value: 'portfolio-optimization', label: 'Portfolio Optimization' },
    { value: 'pricing-negotiation', label: 'Price Negotiation' },
    { value: 'risk-assessment', label: 'Risk Assessment' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              NSW ESC Scenario Library
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive trading scenarios for NSW Energy Savings Certificate market
            </p>
          </div>
        </div>

        {/* Context Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">A$47.80</div>
              <div className="text-sm text-gray-600">Current ESC Spot Price</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{filteredScenarios.length}</div>
              <div className="text-sm text-gray-600">Available Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {selectedAudience ? selectedAudience.charAt(0).toUpperCase() + selectedAudience.slice(1) : 'All'}
              </div>
              <div className="text-sm text-gray-600">Target Audience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">12%</div>
              <div className="text-sm text-gray-600">Northmore Gordon Market Share</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-fit">
          {[
            { id: 'library', label: 'Scenario Library', icon: FolderIcon },
            { id: 'templates', label: 'Templates', icon: DocumentTextIcon },
            { id: 'running', label: 'Running', icon: PlayIcon },
            { id: 'history', label: 'History', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      {activeTab === 'library' && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as ScenarioType | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {scenarioTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'cards'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700 border-blue-300'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              } border`}
            >
              List
            </button>
          </div>

          <div className="ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Create Scenario
            </button>
          </div>
        </div>
      )}

      {/* Scenario Content */}
      {activeTab === 'library' && (
        <div className={viewMode === 'cards' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredScenarios.map((scenario) => (
            <div
              key={scenario.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedScenario === scenario.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleScenarioSelect(scenario.id)}
            >
              {/* Scenario Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    {getScenarioIcon(scenario.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(scenario.status)}`}>
                      {scenario.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scenario Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <div className="flex items-center gap-1 text-gray-900">
                    <ClockIcon className="w-4 h-4" />
                    {getDurationLabel(scenario.duration)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className={`font-medium ${getSuccessRateColor(scenario.success_rate)}`}>
                    {(scenario.success_rate * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Target Audiences:</span>
                  <div className="flex gap-1">
                    {scenario.target_audiences.map((audience) => (
                      <span
                        key={audience}
                        className={`px-2 py-1 text-xs rounded-full ${
                          audience === selectedAudience
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {audience.charAt(0).toUpperCase() + audience.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>

                {scenario.last_run && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Run:</span>
                    <span className="text-gray-900">
                      {scenario.last_run.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScenarioSelect(scenario.id);
                  }}
                >
                  <PlayIcon className="w-4 h-4" />
                  Run Scenario
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <CogIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Other Tab Content */}
      {activeTab !== 'library' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <DocumentTextIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'templates' && 'Scenario Templates'}
            {activeTab === 'running' && 'Running Scenarios'}
            {activeTab === 'history' && 'Scenario History'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'templates' && 'Create and manage reusable scenario templates for efficient demonstration setup.'}
            {activeTab === 'running' && 'Monitor currently executing scenarios and view real-time progress.'}
            {activeTab === 'history' && 'Review completed scenarios, analyze performance metrics, and export reports.'}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {activeTab === 'templates' && 'Create Template'}
            {activeTab === 'running' && 'Start Scenario'}
            {activeTab === 'history' && 'View History'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScenarioLibrary;