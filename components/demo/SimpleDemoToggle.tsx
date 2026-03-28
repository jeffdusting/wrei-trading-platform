/**
 * Simple Demo Toggle - Phase 1
 * Basic on/off toggle with data set selection
 * No tours, no presentations, no guided experiences
 */

'use client';

import { useState } from 'react';
import { useSimpleDemoStore, type SimpleDemoDataSet } from '../../lib/demo-mode/simple-demo-state';

export default function SimpleDemoToggle() {
  const { isActive, selectedDataSet, activateDemo, deactivateDemo } = useSimpleDemoStore();
  const [showDataSetSelector, setShowDataSetSelector] = useState(false);

  const handleToggleDemo = () => {
    if (isActive) {
      deactivateDemo();
      setShowDataSetSelector(false);
    } else {
      setShowDataSetSelector(true);
    }
  };

  const handleDataSetSelection = (dataSet: SimpleDemoDataSet) => {
    activateDemo(dataSet);
    setShowDataSetSelector(false);
  };

  const getDataSetDisplayName = (dataSet: SimpleDemoDataSet) => {
    switch (dataSet) {
      case 'institutional':
        return 'Institutional ESG Fund';
      case 'retail':
        return 'Sustainability Director';
      case 'compliance':
        return 'Government Procurement';
      default:
        return dataSet;
    }
  };

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <button
        onClick={handleToggleDemo}
        className={`
          px-4 py-2 rounded-md text-sm font-medium transition-colors
          ${isActive
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }
        `}
      >
        {isActive ? 'Exit Demo' : 'Demo Mode'}
        {isActive && selectedDataSet && (
          <span className="ml-2 text-xs opacity-90">
            ({getDataSetDisplayName(selectedDataSet)})
          </span>
        )}
      </button>

      {/* Data Set Selector */}
      {showDataSetSelector && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Choose Demo Scenario
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => handleDataSetSelection('institutional')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Institutional ESG Fund</div>
                <div className="text-xs text-gray-600 mt-1">
                  A$100M portfolio manager seeking premium credits
                </div>
              </button>

              <button
                onClick={() => handleDataSetSelection('retail')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Sustainability Director</div>
                <div className="text-xs text-gray-600 mt-1">
                  Mid-cap company&apos;s first offset programme
                </div>
              </button>

              <button
                onClick={() => handleDataSetSelection('compliance')}
                className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Government Procurement</div>
                <div className="text-xs text-gray-600 mt-1">
                  Fixed budget, compliance-focused purchasing
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowDataSetSelector(false)}
              className="w-full mt-3 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}