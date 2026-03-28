/**
 * WREI Trading Platform - Multi-Audience Router
 *
 * Step 1.2: Multi-Audience Interface System - Main Router Component
 * Orchestrates audience selection and navigation between tailored interfaces
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDemoMode } from '@/lib/demo-mode/demo-state-manager';
import AudienceSelector, { type AudienceType } from './AudienceSelector';
import ExecutiveDashboard from './ExecutiveDashboard';
import TechnicalInterface from './TechnicalInterface';
import CompliancePanel from './CompliancePanel';
import {
  ArrowLeftIcon,
  UserGroupIcon,
  CogIcon,
  ShieldCheckIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  id: AudienceType | 'home';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface MultiAudienceRouterProps {
  initialAudience?: AudienceType;
  showSelector?: boolean;
}

export const MultiAudienceRouter: React.FC<MultiAudienceRouterProps> = ({
  initialAudience,
  showSelector = true
}) => {
  const [currentAudience, setCurrentAudience] = useState<AudienceType | null>(initialAudience || null);
  const [showAudienceSelector, setShowAudienceSelector] = useState(showSelector && !initialAudience);
  const demoMode = useDemoMode();

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Audience Selection',
      icon: HomeIcon,
      description: 'Choose your stakeholder type'
    },
    {
      id: 'executive',
      label: 'Executive Dashboard',
      icon: UserGroupIcon,
      description: 'High-level KPIs and ROI metrics'
    },
    {
      id: 'technical',
      label: 'Technical Interface',
      icon: CogIcon,
      description: 'System architecture and integration'
    },
    {
      id: 'compliance',
      label: 'Compliance Panel',
      icon: ShieldCheckIcon,
      description: 'Regulatory adherence and audit trails'
    }
  ];

  // Track audience changes for analytics
  useEffect(() => {
    if (currentAudience) {
      demoMode.trackInteraction({
        type: 'navigation',
        data: {
          action: 'audience_interface_view',
          audience_type: currentAudience,
          timestamp: Date.now()
        }
      });
    }
  }, [currentAudience, demoMode]);

  const handleAudienceSelect = (audienceType: AudienceType) => {
    setCurrentAudience(audienceType);
    setShowAudienceSelector(false);
  };

  const handleReturnToSelector = () => {
    setCurrentAudience(null);
    setShowAudienceSelector(true);

    demoMode.trackInteraction({
      type: 'navigation',
      data: {
        action: 'return_to_audience_selector',
        timestamp: Date.now()
      }
    });
  };

  const getCurrentNavItem = () => {
    return navigationItems.find(item =>
      item.id === (currentAudience || 'home')
    );
  };

  const renderCurrentInterface = () => {
    if (showAudienceSelector) {
      return (
        <AudienceSelector
          onAudienceSelect={handleAudienceSelect}
          selectedAudience={currentAudience || undefined}
        />
      );
    }

    switch (currentAudience) {
      case 'executive':
        return <ExecutiveDashboard />;
      case 'technical':
        return <TechnicalInterface />;
      case 'compliance':
        return <CompliancePanel />;
      default:
        return (
          <AudienceSelector
            onAudienceSelect={handleAudienceSelect}
            selectedAudience={currentAudience || undefined}
          />
        );
    }
  };

  const currentNavItem = getCurrentNavItem();

  return (
    <div className="min-h-screen bg-gray-50" data-demo="multi-audience-router">
      {/* Top Navigation Bar */}
      {!showAudienceSelector && currentAudience && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReturnToSelector}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span className="bloomberg-small-text font-medium">Back to Selection</span>
                </button>

                <ChevronRightIcon className="w-4 h-4 text-gray-400" />

                <div className="flex items-center space-x-2">
                  {currentNavItem && (
                    <>
                      <currentNavItem.icon className="w-5 h-5 text-gray-600" />
                      <span className="bloomberg-small-text font-medium text-gray-900">
                        {currentNavItem.label}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Audience Switch Menu */}
              <div className="flex items-center space-x-4">
                <div className="bloomberg-small-text text-gray-600">
                  Switch to:
                </div>
                <div className="flex space-x-2">
                  {navigationItems
                    .filter(item => item.id !== 'home' && item.id !== currentAudience)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAudienceSelect(item.id as AudienceType)}
                        className="flex items-center space-x-1 px-3 py-2 bloomberg-small-text font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                        title={item.description}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{item.label.split(' ')[0]}</span>
                      </button>
                    ))}
                </div>

                {/* Tour Controls */}
                {demoMode.isActive && demoMode.currentTour && (
                  <div className="border-l border-gray-200 pl-4">
                    <div className="flex items-center space-x-2 bloomberg-small-text text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Tour Active</span>
                      <button
                        onClick={demoMode.endTour}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Exit Tour
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${!showAudienceSelector && currentAudience ? 'pt-8' : 'py-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderCurrentInterface()}
        </div>
      </div>


      {/* Demo Mode Status */}
      {demoMode.isActive && (
        <div className="fixed bottom-4 right-4 z-40" data-demo="demo-status">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2 bloomberg-small-text">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Demo Mode Active</span>
              {demoMode.currentTour && (
                <span>• {demoMode.currentTour.replace('-', ' ').toUpperCase()}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiAudienceRouter;