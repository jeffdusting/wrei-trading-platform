/**
 * Vessel Provenance Card Component
 *
 * Card component showing vessel origin data, telemetry summary,
 * and links to the complete provenance chain for WREI carbon credits.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement C2: Blockchain Provenance Visualiser
 */

'use client';

import React, { useState } from 'react';

// Vessel telemetry data structure
export interface VesselTelemetryData {
  vesselId: string;
  vesselName: string;
  vesselType: 'hydrofoil' | 'ferry' | 'catamaran';
  route: {
    origin: string;
    destination: string;
    distance: number; // km
    duration: number; // minutes
  };
  performance: {
    energyUsed: number; // kWh
    passengersCarried: number;
    averageSpeed: number; // km/h
    efficiency: number; // kWh/passenger-km
  };
  emissions: {
    co2eSaved: number; // tonnes
    baseline: string; // comparison methodology
    factors: {
      modalShift: number; // % from cars to ferry
      vesselEfficiency: number; // vs diesel baseline
      gridCarbon: number; // kgCO2e/kWh
    };
  };
  verification: {
    sensors: string[];
    dataQuality: number; // % accuracy
    auditTrail: string;
    timestamp: string;
  };
  location: {
    latitude: number;
    longitude: number;
    region: string;
    timezone: string;
  };
}

export interface VesselProvenanceCardProps {
  creditId: string;
  vesselData?: VesselTelemetryData;
  className?: string;
  onViewProvenanceChain?: () => void;
  compact?: boolean;
}

// Sample vessel data for demonstration
const SAMPLE_VESSEL_DATA: VesselTelemetryData = {
  vesselId: 'WREI-HF-001',
  vesselName: 'Sydney Harbour Express',
  vesselType: 'hydrofoil',
  route: {
    origin: 'Circular Quay',
    destination: 'Manly Wharf',
    distance: 28.5,
    duration: 18,
  },
  performance: {
    energyUsed: 145.2,
    passengersCarried: 120,
    averageSpeed: 95.0,
    efficiency: 0.043, // kWh/passenger-km
  },
  emissions: {
    co2eSaved: 2.847,
    baseline: 'Private vehicle transport (171 gCO2/km)',
    factors: {
      modalShift: 40, // 40% modal shift from cars
      vesselEfficiency: 73, // 73% efficiency vs diesel
      gridCarbon: 0.81, // NSW grid carbon intensity
    },
  },
  verification: {
    sensors: ['GPS', 'Power Meter', 'Passenger Counter', 'Weather Station'],
    dataQuality: 98.7,
    auditTrail: 'SHA256-verified IoT stream',
    timestamp: '2024-03-20T08:30:00Z',
  },
  location: {
    latitude: -33.8688,
    longitude: 151.2093,
    region: 'Sydney Harbour, NSW',
    timezone: 'Australia/Sydney',
  },
};

const VesselProvenanceCard: React.FC<VesselProvenanceCardProps> = ({
  creditId,
  vesselData = SAMPLE_VESSEL_DATA,
  className = '',
  onViewProvenanceChain,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(!compact);

  const getVesselIcon = (type: VesselTelemetryData['vesselType']) => {
    switch (type) {
      case 'hydrofoil': return '🚤';
      case 'ferry': return '⛴️';
      case 'catamaran': return '🛥️';
      default: return '🚢';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 95) return 'text-green-600 bg-green-50';
    if (quality >= 85) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className={`vessel-provenance-card bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <span className="bloomberg-large-metric">{getVesselIcon(vesselData.vesselType)}</span>
            <div>
              <h3 className="bloomberg-card-title text-slate-800">
                {vesselData.vesselName}
              </h3>
              <p className="bloomberg-small-text text-slate-500">
                ID: {vesselData.vesselId} • Credit: {creditId}
              </p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${getQualityColor(vesselData.verification.dataQuality)}`}>
            {vesselData.verification.dataQuality}% verified
          </div>
        </div>

        {/* Route info */}
        <div className="flex items-center bloomberg-small-text text-slate-600">
          <span className="font-medium">{vesselData.route.origin}</span>
          <span className="mx-2">→</span>
          <span className="font-medium">{vesselData.route.destination}</span>
          <span className="ml-2 text-slate-400">
            ({vesselData.route.distance} km, {formatDuration(vesselData.route.duration)})
          </span>
        </div>
      </div>

      {/* Key metrics */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="bloomberg-large-metric text-blue-600">
              {vesselData.performance.energyUsed.toFixed(1)}
            </div>
            <div className="bloomberg-section-label text-slate-500">kWh Used</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-green-600">
              {vesselData.performance.passengersCarried}
            </div>
            <div className="bloomberg-section-label text-slate-500">Passengers</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-purple-600">
              {vesselData.route.distance}km
            </div>
            <div className="bloomberg-section-label text-slate-500">Distance</div>
          </div>
          <div className="text-center">
            <div className="bloomberg-large-metric text-orange-600">
              {vesselData.emissions.co2eSaved.toFixed(3)}t
            </div>
            <div className="bloomberg-section-label text-slate-500">CO₂e Saved</div>
          </div>
        </div>

        {/* Efficiency highlight */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="bloomberg-small-text font-medium text-green-800">
                Energy Efficiency: {(vesselData.performance.efficiency * 1000).toFixed(1)} Wh/passenger-km
              </div>
              <div className="bloomberg-section-label text-green-600">
                {vesselData.emissions.factors.vesselEfficiency}% more efficient than diesel baseline
              </div>
            </div>
            <div className="text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Toggle details */}
        {compact && (
          <div className="text-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bloomberg-small-text text-blue-600 hover:text-blue-800 font-medium"
            >
              {showDetails ? 'Hide Details ▲' : 'Show Details ▼'}
            </button>
          </div>
        )}

        {/* Detailed information */}
        {showDetails && (
          <div className="space-y-4">
            {/* Emissions breakdown */}
            <div>
              <h4 className="bloomberg-small-text  text-slate-700 mb-2">Emissions Calculation</h4>
              <div className="bg-slate-50 rounded-lg p-3 bloomberg-small-text space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Baseline:</span>
                  <span className="font-medium">{vesselData.emissions.baseline}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Modal Shift Factor:</span>
                  <span className="font-medium">{vesselData.emissions.factors.modalShift}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Grid Carbon Intensity:</span>
                  <span className="font-medium">{vesselData.emissions.factors.gridCarbon} kgCO₂e/kWh</span>
                </div>
              </div>
            </div>

            {/* Sensors & verification */}
            <div>
              <h4 className="bloomberg-small-text  text-slate-700 mb-2">Sensor Verification</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {vesselData.verification.sensors.map((sensor, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 bloomberg-section-label rounded-full"
                    >
                      {sensor}
                    </span>
                  ))}
                </div>
                <div className="bloomberg-section-label text-slate-500">
                  {vesselData.verification.auditTrail} •
                  Recorded: {new Date(vesselData.verification.timestamp).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Location info */}
            <div>
              <h4 className="bloomberg-small-text  text-slate-700 mb-2">Location & Context</h4>
              <div className="bg-slate-50 rounded-lg p-3 bloomberg-small-text space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600">Region:</span>
                  <span className="font-medium">{vesselData.location.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Coordinates:</span>
                  <span className="bloomberg-data bloomberg-section-label">
                    {vesselData.location.latitude.toFixed(4)}, {vesselData.location.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Timezone:</span>
                  <span className="font-medium">{vesselData.location.timezone}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex space-x-2">
            {onViewProvenanceChain && (
              <button
                onClick={onViewProvenanceChain}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-blue-700 transition-colors"
              >
                🔗 View Full Provenance Chain
              </button>
            )}
            <button
              onClick={() => {
                // Simulate opening external verification
                window.open(
                  `https://explorer.zoniqx.com/credit/${creditId}`,
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg bloomberg-small-text font-medium hover:bg-slate-200 transition-colors"
            >
              🔍 Blockchain Explorer
            </button>
          </div>
        </div>
      </div>

      {/* Verification badge */}
      <div className="px-4 pb-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white bloomberg-section-label">✓</span>
            </div>
            <div className="bloomberg-small-text">
              <div className="font-medium text-slate-800">
                Verified by WREI dMRV Engine
              </div>
              <div className="bloomberg-section-label text-slate-500">
                Digital measurement, reporting & verification • Zoniqx zProtocol compliant
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselProvenanceCard;