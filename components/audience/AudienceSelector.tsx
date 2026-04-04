/**
 * WREI Trading Platform - Audience Selection Interface
 *
 * Step 1.2: Multi-Audience Interface System - Entry Point
 * Provides stakeholder type selection and routing to tailored interfaces
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState } from 'react';
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager';
// import { getNorthmoreGordonValueProp } from '@/lib/demo-mode/esc-market-context'; // Removed for Phase 4
import { ChevronRightIcon, UserGroupIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export type AudienceType = 'executive' | 'technical' | 'compliance';

interface AudienceOption {
  type: AudienceType;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  valueProp: {
    headline: string;
    benefits: string[];
    duration: string;
  };
  demoTour: string;
  color: string;
}

interface AudienceSelectorProps {
  onAudienceSelect: (audienceType: AudienceType) => void;
  selectedAudience?: AudienceType;
  className?: string;
}

export const AudienceSelector: React.FC<AudienceSelectorProps> = ({
  onAudienceSelect,
  selectedAudience,
  className = '',
}) => {
  const [hoveredOption, setHoveredOption] = useState<AudienceType | null>(null);
  const demoMode = useDemoMode();

  const audienceOptions: AudienceOption[] = [
    {
      type: 'executive',
      title: 'Executive Leadership',
      subtitle: 'C-Suite, Fund Managers, Decision Makers',
      description: 'High-level demonstration of NSW ESC trading ROI, market opportunity, and competitive positioning. Focus on business impact and strategic value.',
      icon: UserGroupIcon,
      valueProp: {
        headline: 'Maximize ESC Trading ROI with AI-Powered Intelligence',
        benefits: [
          '15-25% improved execution pricing',
          '40% reduction in compliance overhead',
          'Institutional-grade settlement infrastructure',
          'Real-time market intelligence and analytics'
        ],
        duration: '14 minutes'
      },
      demoTour: 'nsw-esc-executive',
      color: 'bg-blue-500'
    },
    {
      type: 'technical',
      title: 'Technical Leadership',
      subtitle: 'CTOs, System Architects, Integration Teams',
      description: 'Technical deep dive into NSW ESC trading system architecture, API integration capabilities, and real-time data processing infrastructure.',
      icon: CogIcon,
      valueProp: {
        headline: 'Advanced Technology Infrastructure for ESC Trading',
        benefits: [
          'API-first architecture with real-time feeds',
          'Sub-50ms response times with 99.9% uptime',
          'Zoniqx blockchain settlement integration',
          'Comprehensive monitoring and observability'
        ],
        duration: '16 minutes'
      },
      demoTour: 'nsw-esc-technical',
      color: 'bg-green-500'
    },
    {
      type: 'compliance',
      title: 'Compliance & Risk',
      subtitle: 'Compliance Officers, Legal Teams, Risk Managers',
      description: 'Comprehensive demonstration of Clean Energy Regulator compliance capabilities, automated audit trails, and risk management systems.',
      icon: ShieldCheckIcon,
      valueProp: {
        headline: 'Automated CER Compliance with Comprehensive Audit Trails',
        benefits: [
          'Real-time Clean Energy Regulator compliance validation',
          'Automated audit trail generation and evidence collection',
          'Integrated AML/CTF screening and monitoring',
          'Comprehensive regulatory reporting capabilities'
        ],
        duration: '18 minutes'
      },
      demoTour: 'nsw-esc-compliance',
      color: 'bg-amber-500'
    }
  ];

  const handleAudienceSelect = (audienceType: AudienceType) => {
    // Load ESC market context for the selected audience
    demoMode.loadESCMarketContext();
    demoMode.configureNorthmoreGordonBranding();

    // Track audience selection
    demoMode.trackInteraction({
      type: 'click',
      data: {
        action: 'audience_selection',
        audience_type: audienceType,
        timestamp: Date.now()
      }
    });

    onAudienceSelect(audienceType);
  };

  const startTour = (audienceType: AudienceType, tourId: string) => {
    demoMode.startTour(tourId as any);
    handleAudienceSelect(audienceType);
  };

  return (
    <div className={`max-w-7xl mx-auto ${className}`} data-demo="audience-selector">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl  text-gray-900 mb-4">
          NSW ESC Trading Platform Demonstration
        </h1>
        <p className="bloomberg-metric-value text-gray-600 mb-2">
          Select your stakeholder type for a tailored demonstration experience
        </p>
        <div className="flex items-center justify-center space-x-2 bloomberg-small-text text-gray-500">
          <span>Powered by</span>
          <span className=" text-blue-600">Northmore Gordon</span>
          <span>•</span>
          <span>AFSL 246896</span>
          <span>•</span>
          <span>12% NSW ESC Market Share</span>
        </div>
      </div>

      {/* Audience Options Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {audienceOptions.map((option) => (
          <div
            key={option.type}
            className={`
              relative bg-white rounded-xl border-2 cursor-pointer transition-all duration-300
              ${selectedAudience === option.type
                ? `border-blue-500 shadow-lg scale-[1.02]`
                : hoveredOption === option.type
                  ? 'border-gray-300 shadow-md scale-[1.01]'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onMouseEnter={() => setHoveredOption(option.type)}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={() => handleAudienceSelect(option.type)}
            data-demo={`audience-option-${option.type}`}
          >
            {/* Selection Indicator */}
            {selectedAudience === option.type && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}

            <div className="p-6">
              {/* Icon and Title */}
              <div className="flex items-start space-x-4 mb-4">
                <div className={`p-3 rounded-lg ${option.color} text-white`}>
                  <option.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="bloomberg-metric-value text-gray-900 mb-1">
                    {option.title}
                  </h3>
                  <p className="bloomberg-small-text text-gray-600">
                    {option.subtitle}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {option.description}
              </p>

              {/* Value Proposition */}
              <div className="mb-6">
                <h4 className=" text-gray-900 mb-2">
                  {option.valueProp.headline}
                </h4>
                <ul className="space-y-1">
                  {option.valueProp.benefits.map((benefit, index) => (
                    <li key={index} className="bloomberg-small-text text-gray-600 flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">•</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startTour(option.type, option.demoTour);
                  }}
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-lg text-white font-medium
                    transition-colors duration-200 ${option.color} hover:opacity-90
                  `}
                >
                  <span>Start Guided Tour ({option.valueProp.duration})</span>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAudienceSelect(option.type);
                  }}
                  className="flex items-center justify-between px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors duration-200"
                >
                  <span>Explore Interface</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="bloomberg-large-metric text-gray-900 mb-4">
          About This Demonstration
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className=" text-gray-900 mb-2">NSW ESC Market Context</h3>
            <ul className="text-gray-700 space-y-1 bloomberg-small-text">
              <li>• A$200M+ annual trading volume</li>
              <li>• 850+ active market participants</li>
              <li>• Market pricing from broker publications (A$23.00 spot)</li>
              <li>• Clean Energy Regulator compliance framework</li>
            </ul>
          </div>
          <div>
            <h3 className=" text-gray-900 mb-2">Platform Capabilities</h3>
            <ul className="text-gray-700 space-y-1 bloomberg-small-text">
              <li>• AI-powered negotiation with Claude integration</li>
              <li>• T+0 atomic settlement via Zoniqx zProtocol</li>
              <li>• Institutional-grade compliance automation</li>
              <li>• Real-time market intelligence and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceSelector;