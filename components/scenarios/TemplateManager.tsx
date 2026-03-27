/**
 * WREI Trading Platform - Template Manager
 *
 * Step 1.3: Scenario Library & Templates - Template Management System
 * Create, edit, and manage reusable scenario templates for efficient demonstration setup
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon as DocumentDuplicateIcon,
  FolderIcon,
  TagIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  ESCScenarioTemplate,
  ScenarioType,
  ScenarioComplexity,
  ScenarioDuration,
  TemplateCustomization,
  AudienceConfiguration
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';

interface TemplateManagerProps {
  selectedAudience?: AudienceType;
  onTemplateSelect?: (templateId: string) => void;
  onBack?: () => void;
}

interface TemplateLibrary {
  id: string;
  name: string;
  description: string;
  template: ESCScenarioTemplate;
  created_date: Date;
  last_modified: Date;
  created_by: string;
  usage_count: number;
  tags: string[];
  is_public: boolean;
  version: string;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  selectedAudience,
  onTemplateSelect,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'edit' | 'history'>('browse');
  const [templates, setTemplates] = useState<TemplateLibrary[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<ScenarioType | 'all'>('all');
  const [filterComplexity, setFilterComplexity] = useState<ScenarioComplexity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const demoMode = useDemoMode();

  // Sample template library
  const sampleTemplates: TemplateLibrary[] = [
    {
      id: 'esc-basic-template',
      name: 'NSW ESC Basic Trading Template',
      description: 'Standard template for basic ESC trading demonstrations with price negotiation',
      template: {
        id: 'esc-basic-template',
        name: 'NSW ESC Basic Trading Template',
        description: 'Standard template for basic ESC trading demonstrations',
        type: 'esc-market-trading',
        complexity: 'basic',
        duration: 'quick',
        targetAudience: ['executive', 'technical', 'compliance'],
        marketContext: {
          spot_price: 47.80,
          volume_available: 5000,
          participant_count: 12,
          market_volatility: 'medium',
          time_of_day: 'midday',
          seasonal_factor: 1.0
        },
        tradingParameters: {
          volume_tonnes: 1000,
          max_price: 52.00,
          min_price: 44.00,
          urgency_level: 'medium',
          quality_requirements: {
            vintage_year: 2025,
            verification_standard: 'WREI',
            additionality_proof: true,
            co_benefits: true
          },
          settlement_preference: 'T+0',
          payment_terms: 'immediate'
        },
        expectedOutcomes: {
          price_range: [46.20, 49.40],
          success_probability: 0.95,
          time_to_completion: 8,
          key_metrics: {
            price_improvement: 0.185,
            execution_speed: 0.340,
            compliance_score: 0.98
          }
        },
        scenarioSteps: [],
        validationRules: []
      },
      created_date: new Date('2026-03-20'),
      last_modified: new Date('2026-03-24'),
      created_by: 'System Administrator',
      usage_count: 47,
      tags: ['esc', 'basic', 'trading', 'nsw'],
      is_public: true,
      version: '2.1'
    },
    {
      id: 'multi-participant-template',
      name: 'Multi-Participant Auction Template',
      description: 'Complex template for multi-party ESC auctions with competitive bidding',
      template: {
        id: 'multi-participant-template',
        name: 'Multi-Participant Auction Template',
        description: 'Complex template for multi-party ESC auctions',
        type: 'multi-participant-auction',
        complexity: 'advanced',
        duration: 'medium',
        targetAudience: ['executive', 'technical'],
        marketContext: {
          spot_price: 47.80,
          volume_available: 15000,
          participant_count: 25,
          market_volatility: 'high',
          time_of_day: 'morning',
          seasonal_factor: 1.15
        },
        tradingParameters: {
          volume_tonnes: 5000,
          max_price: 55.00,
          min_price: 42.00,
          urgency_level: 'high',
          quality_requirements: {
            vintage_year: 2024,
            verification_standard: 'multiple',
            additionality_proof: true,
            co_benefits: false
          },
          settlement_preference: 'T+1',
          payment_terms: 'net-30'
        },
        expectedOutcomes: {
          price_range: [44.80, 52.20],
          success_probability: 0.87,
          time_to_completion: 15,
          key_metrics: {
            price_improvement: 0.165,
            execution_speed: 0.420,
            compliance_score: 0.94
          }
        },
        scenarioSteps: [],
        validationRules: []
      },
      created_date: new Date('2026-03-18'),
      last_modified: new Date('2026-03-22'),
      created_by: 'Trading Team',
      usage_count: 23,
      tags: ['auction', 'multi-participant', 'advanced', 'esc'],
      is_public: true,
      version: '1.8'
    },
    {
      id: 'compliance-validation-template',
      name: 'CER Compliance Validation Template',
      description: 'Comprehensive template for demonstrating regulatory compliance workflows',
      template: {
        id: 'compliance-validation-template',
        name: 'CER Compliance Validation Template',
        description: 'Comprehensive template for regulatory compliance',
        type: 'compliance-workflow',
        complexity: 'intermediate',
        duration: 'medium',
        targetAudience: ['compliance', 'technical'],
        marketContext: {
          spot_price: 47.80,
          volume_available: 3000,
          participant_count: 8,
          market_volatility: 'low',
          time_of_day: 'afternoon',
          seasonal_factor: 1.0
        },
        tradingParameters: {
          volume_tonnes: 2000,
          max_price: 50.00,
          min_price: 45.00,
          urgency_level: 'low',
          quality_requirements: {
            vintage_year: 2025,
            verification_standard: 'WREI',
            additionality_proof: true,
            co_benefits: true
          },
          settlement_preference: 'T+0',
          payment_terms: 'immediate'
        },
        expectedOutcomes: {
          price_range: [46.50, 49.00],
          success_probability: 0.92,
          time_to_completion: 12,
          key_metrics: {
            price_improvement: 0.155,
            execution_speed: 0.280,
            compliance_score: 0.99
          }
        },
        scenarioSteps: [],
        validationRules: []
      },
      created_date: new Date('2026-03-15'),
      last_modified: new Date('2026-03-25'),
      created_by: 'Compliance Team',
      usage_count: 31,
      tags: ['compliance', 'cer', 'validation', 'regulatory'],
      is_public: true,
      version: '3.0'
    }
  ];

  useEffect(() => {
    setTemplates(sampleTemplates);
  }, []);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'all' || template.template.type === filterType;
    const matchesComplexity = filterComplexity === 'all' || template.template.complexity === filterComplexity;
    const matchesAudience = !selectedAudience ||
      template.template.targetAudience.includes(selectedAudience);

    return matchesSearch && matchesType && matchesComplexity && matchesAudience;
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'template_selection', template_id: templateId, audience: selectedAudience }
    });

    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
  };

  const duplicateTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newTemplate: TemplateLibrary = {
      ...template,
      id: `${templateId}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      created_date: new Date(),
      last_modified: new Date(),
      created_by: 'Current User',
      usage_count: 0,
      version: '1.0'
    };

    setTemplates(prev => [newTemplate, ...prev]);
  };

  const getComplexityColor = (complexity: ScenarioComplexity) => {
    switch (complexity) {
      case 'basic':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDurationLabel = (duration: ScenarioDuration) => {
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

  const scenarioTypeOptions: Array<{ value: ScenarioType | 'all'; label: string }> = [
    { value: 'all', label: 'All Types' },
    { value: 'esc-market-trading', label: 'ESC Market Trading' },
    { value: 'multi-participant-auction', label: 'Multi-Participant Auction' },
    { value: 'compliance-workflow', label: 'Compliance Workflow' },
    { value: 'portfolio-optimization', label: 'Portfolio Optimization' },
    { value: 'pricing-negotiation', label: 'Price Negotiation' },
    { value: 'risk-assessment', label: 'Risk Assessment' }
  ];

  const complexityOptions: Array<{ value: ScenarioComplexity | 'all'; label: string }> = [
    { value: 'all', label: 'All Levels' },
    { value: 'basic', label: 'Basic' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Manager</h1>
            <p className="text-gray-600 mt-1">
              Create, edit, and manage reusable scenario templates
            </p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <PlusIcon className="w-4 h-4" />
              Create Template
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6 max-w-fit">
          {[
            { id: 'browse', label: 'Browse Templates', icon: FolderIcon },
            { id: 'create', label: 'Create New', icon: PlusIcon },
            { id: 'edit', label: 'Edit Template', icon: PencilIcon },
            { id: 'history', label: 'Version History', icon: ClockIcon }
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

        {/* Search and Filters */}
        {activeTab === 'browse' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ScenarioType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {scenarioTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filterComplexity}
              onChange={(e) => setFilterComplexity(e.target.value as ScenarioComplexity | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {complexityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Template Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">v{template.version}</p>
                  </div>
                </div>
                {template.is_public && (
                  <div className="p-1 bg-green-50 rounded">
                    <ShareIcon className="w-4 h-4 text-green-600" />
                  </div>
                )}
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-2">{template.description}</p>

              {/* Template Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-900">
                    {template.template.type.replace('-', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Complexity:</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getComplexityColor(template.template.complexity)}`}>
                    {template.template.complexity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <div className="flex items-center gap-1 text-gray-900">
                    <ClockIcon className="w-4 h-4" />
                    {getDurationLabel(template.template.duration)}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Used:</span>
                  <span className="text-gray-900">{template.usage_count} times</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Target Audiences:</span>
                  <div className="flex gap-1">
                    {template.template.targetAudience.map((audience) => (
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

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Modified:</span>
                  <span className="text-gray-900">
                    {template.last_modified.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    <TagIcon className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template.id);
                  }}
                >
                  <EyeIcon className="w-4 h-4" />
                  Use Template
                </button>
                <button
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTemplate(template.id);
                  }}
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                  <PencilIcon className="w-4 h-4" />
                </button>
                {!template.is_public && (
                  <button className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600 mb-6">
                No templates match your search criteria. Try adjusting your filters or create a new template.
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create First Template
              </button>
            </div>
          )}
        </div>
      )}

      {/* Other Tab Content */}
      {activeTab !== 'browse' && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            {activeTab === 'create' && <PlusIcon className="w-16 h-16 mx-auto" />}
            {activeTab === 'edit' && <PencilIcon className="w-16 h-16 mx-auto" />}
            {activeTab === 'history' && <ClockIcon className="w-16 h-16 mx-auto" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'create' && 'Template Creator'}
            {activeTab === 'edit' && 'Template Editor'}
            {activeTab === 'history' && 'Version History'}
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'create' && 'Create new scenario templates with custom parameters and configurations.'}
            {activeTab === 'edit' && 'Edit existing templates and manage their configurations.'}
            {activeTab === 'history' && 'View version history and track changes to your templates.'}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {activeTab === 'create' && 'Start Creating'}
            {activeTab === 'edit' && 'Select Template'}
            {activeTab === 'history' && 'View History'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;