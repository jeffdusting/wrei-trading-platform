/**
 * WREI Trading Platform - Real-Time Metrics Widget
 *
 * Stage 2 Component 3: Intelligent Analytics Dashboard (Foundation)
 * Real-time metrics display component
 *
 * Date: March 26, 2026
 */

'use client';

import React from 'react';

interface RealTimeMetricsWidgetProps {
  sessionId: string;
  scenarioId: string;
  selectedAudience: 'executive' | 'technical' | 'compliance';
  isScenarioActive: boolean;
  onMetricsUpdate?: (metrics: any) => void;
}

export const RealTimeMetricsWidget: React.FC<RealTimeMetricsWidgetProps> = ({
  sessionId,
  scenarioId,
  selectedAudience,
  isScenarioActive,
  onMetricsUpdate
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="bloomberg-card-title text-gray-900 mb-4">
        Real-Time Metrics ({selectedAudience})
      </h3>
      <div className="space-y-2 bloomberg-small-text text-gray-600">
        <div>Session: {sessionId}</div>
        <div>Scenario: {scenarioId}</div>
        <div>Status: {isScenarioActive ? 'Active' : 'Inactive'}</div>
        <div className="mt-4 text-gray-500">
          Component 3 real-time metrics implementation in progress...
        </div>
      </div>
    </div>
  );
};
