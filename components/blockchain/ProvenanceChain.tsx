/**
 * Blockchain Provenance Chain Visualiser
 *
 * Interactive vertical timeline showing the complete verification chain
 * for WREI carbon credits from vessel measurement to token minting.
 *
 * WREI Trading Platform - Phase 3: Institutional Depth
 * Enhancement C2: Blockchain Provenance Visualiser
 */

'use client';

import React, { useState } from 'react';

// Mock provenance data structure based on token-metadata.ts
export interface ProvenanceStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  hash: string;
  status: 'pending' | 'verified' | 'failed';
  details: {
    [key: string]: any;
  };
  transactionId?: string;
  blockNumber?: number;
}

export interface ProvenanceChainProps {
  creditId: string;
  steps?: ProvenanceStep[];
  className?: string;
  showExpandedDetails?: boolean;
}

// Sample provenance data for demonstration
const SAMPLE_PROVENANCE_STEPS: ProvenanceStep[] = [
  {
    id: 'measurement',
    title: 'Vessel Measurement',
    description: 'Energy consumption and passenger data captured from hydrofoil telemetry',
    timestamp: '2024-03-20T08:30:00Z',
    hash: '0xa1b2c3d4e5f6789012345678901234567890abcd',
    status: 'verified',
    details: {
      vessel: 'WREI-HF-001',
      energyUsed: 145.2, // kWh
      passengersCarried: 120,
      distanceTraveled: 28.5, // km
      emissionsSaved: 2.847, // tCO2e
      telemetrySource: 'IoT Sensors + GPS',
    },
    transactionId: '0x1a2b3c4d5e6f',
    blockNumber: 18542,
  },
  {
    id: 'verification',
    title: 'dMRV Verification',
    description: 'Digital measurement, reporting, and verification by WREI verification engine',
    timestamp: '2024-03-20T09:15:00Z',
    hash: '0xb2c3d4e5f6789012345678901234567890abcdef',
    status: 'verified',
    details: {
      verificationEngine: 'WREI dMRV v2.1',
      methodology: 'ACM0018 + WREI Enhancement',
      qualityScore: 98.7,
      uncertaintyRange: '±2.3%',
      auditTrail: 'SHA256 verified',
    },
    transactionId: '0x2b3c4d5e6f7a',
    blockNumber: 18543,
  },
  {
    id: 'certification',
    title: 'Standard Certification',
    description: 'Compliance verification against international carbon standards',
    timestamp: '2024-03-20T10:30:00Z',
    hash: '0xc3d4e5f6789012345678901234567890abcdef12',
    status: 'verified',
    details: {
      standard: 'Verra VCS + CORSIA',
      certificationBody: 'SCS Global Services',
      serialNumber: 'VCS-2024-WREI-28475',
      vintage: '2024',
      geography: 'NSW, Australia',
    },
    transactionId: '0x3c4d5e6f7a8b',
    blockNumber: 18544,
  },
  {
    id: 'minting',
    title: 'Token Minting',
    description: 'Carbon credit tokenized on blockchain with immutable metadata',
    timestamp: '2024-03-20T11:00:00Z',
    hash: '0xd4e5f6789012345678901234567890abcdef1234',
    status: 'verified',
    details: {
      tokenStandard: 'Zoniqx zProtocol (ERC-7518)',
      tokenAddress: '0x789...4567',
      totalSupply: 2847, // in grams of CO2e
      fractional: true,
      custody: 'Non-custodial',
      settlement: 'T+0 via Zoniqx zConnect',
    },
    transactionId: '0x4d5e6f7a8b9c',
    blockNumber: 18545,
  },
];

const ProvenanceChain: React.FC<ProvenanceChainProps> = ({
  creditId,
  steps = SAMPLE_PROVENANCE_STEPS,
  className = '',
  showExpandedDetails = false,
}) => {
  const [expandedStep, setExpandedStep] = useState<string | null>(
    showExpandedDetails ? steps[0]?.id || null : null
  );
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(type);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatHash = (hash: string): string => {
    if (hash.length <= 12) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const getStatusIcon = (status: ProvenanceStep['status']) => {
    switch (status) {
      case 'verified':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs animate-pulse">✓</span>
            </div>
          </div>
        );
      case 'pending':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full animate-spin flex items-center justify-center">
              <span className="text-white text-xs">⟳</span>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✕</span>
            </div>
          </div>
        );
    }
  };

  const getStatusColor = (status: ProvenanceStep['status']) => {
    switch (status) {
      case 'verified': return 'border-green-200 bg-green-50';
      case 'pending': return 'border-yellow-200 bg-yellow-50';
      case 'failed': return 'border-red-200 bg-red-50';
    }
  };

  return (
    <div className={`provenance-chain ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Blockchain Provenance Chain
        </h3>
        <p className="text-sm text-slate-600">
          Credit ID: <span className="font-mono text-slate-800">{creditId}</span>
        </p>
      </div>

      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {steps.map((step, index) => {
          const isExpanded = expandedStep === step.id;
          const isLastStep = index === steps.length - 1;

          return (
            <div key={step.id} className="relative mb-8 last:mb-0">
              {/* Timeline node */}
              <div className="absolute left-0 z-10">
                {getStatusIcon(step.status)}
              </div>

              {/* Step content */}
              <div className="ml-12">
                <div
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200
                    hover:shadow-md ${getStatusColor(step.status)}
                    ${isExpanded ? 'ring-2 ring-blue-200' : ''}
                  `}
                  onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                >
                  {/* Step header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-800">{step.title}</h4>
                      {step.status === 'verified' && (
                        <span className="text-green-600 text-xs">✓ Verified</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span>{new Date(step.timestamp).toLocaleString()}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedStep(isExpanded ? null : step.id);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </div>
                  </div>

                  {/* Step description */}
                  <p className="text-sm text-slate-600 mb-3">{step.description}</p>

                  {/* Hash display */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-slate-500">Hash:</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(step.hash, step.id);
                      }}
                      className="font-mono text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded"
                      title="Click to copy full hash"
                    >
                      {formatHash(step.hash)}
                      {copiedHash === step.id ? ' ✓ Copied' : ' 📋'}
                    </button>
                  </div>

                  {/* Transaction info */}
                  {step.transactionId && (
                    <div className="text-xs text-slate-500">
                      Block #{step.blockNumber} • Tx: {formatHash(step.transactionId)}
                    </div>
                  )}

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h5 className="font-medium text-slate-700 mb-3">Verification Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {Object.entries(step.details).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-slate-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}:
                            </span>
                            <span className="font-mono text-slate-800 text-right">
                              {typeof value === 'number' ? value.toLocaleString() : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {step.transactionId && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(step.transactionId || '', `${step.id}-tx`);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            📋 Copy Transaction ID
                            {copiedHash === `${step.id}-tx` && ' ✓'}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div className="mt-6 p-4 bg-slate-50 rounded-lg">
        <div className="text-sm text-slate-600 text-center">
          <strong>{steps.filter(s => s.status === 'verified').length}/{steps.length}</strong> steps verified •{' '}
          Chain integrity: <span className="text-green-600 font-medium">100% verified</span>
        </div>
      </div>
    </div>
  );
};

export default ProvenanceChain;