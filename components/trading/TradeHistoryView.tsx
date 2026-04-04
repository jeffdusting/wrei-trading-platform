/**
 * Trade History View Component
 *
 * Session-based trade tracking with Bloomberg Terminal styling
 * Displays trade progression and historical performance
 * Phase 3: Enhanced Trading Features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { NegotiationState } from '@/lib/types';
import { useDesignTokens } from '@/design-system/tokens/professional-tokens';
import {
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface TradeHistoryViewProps {
  negotiationState: NegotiationState;
  className?: string;
}

interface TradeHistoryEntry {
  id: string;
  timestamp: Date;
  round: number;
  phase: string;
  priceOffered: number;
  priceAccepted?: number;
  volume: number;
  persona: string;
  status: 'active' | 'completed' | 'failed';
  duration: number; // in seconds
  notes?: string;
}

interface TradeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  entries: TradeHistoryEntry[];
  finalPrice?: number;
  totalVolume: number;
  status: 'active' | 'completed' | 'failed';
}

export const TradeHistoryView: React.FC<TradeHistoryViewProps> = ({
  negotiationState,
  className = ''
}) => {
  const tokens = useDesignTokens('institutional');
  const [sessions, setSessions] = useState<TradeSession[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'active' | 'failed'>('all');

  // Initialize with mock historical data and current session
  useEffect(() => {
    const mockSessions: TradeSession[] = [
      {
        id: 'current',
        startTime: new Date(Date.now() - (negotiationState.round * 45000)),
        entries: generateCurrentSessionEntries(negotiationState),
        totalVolume: negotiationState.buyerProfile.volumeInterest || 1000,
        status: negotiationState.phase === 'closure' ? 'completed' :
                negotiationState.phase === 'escalation' ? 'failed' : 'active'
      },
      ...generateMockHistoricalSessions()
    ];

    setSessions(mockSessions);
  }, [negotiationState]);

  const generateCurrentSessionEntries = (state: NegotiationState): TradeHistoryEntry[] => {
    const entries: TradeHistoryEntry[] = [];
    const baseTime = Date.now() - (state.round * 45000);

    for (let i = 1; i <= state.round; i++) {
      entries.push({
        id: `current-${i}`,
        timestamp: new Date(baseTime + (i * 45000)),
        round: i,
        phase: i === 1 ? 'opening' : i < state.round ? 'trading' : state.phase,
        priceOffered: state.anchorPrice - (i * 2), // Simulate price progression
        volume: state.buyerProfile.volumeInterest || 1000,
        persona: state.buyerProfile.persona || 'ESG Fund Manager',
        status: i === state.round ? (state.phase === 'closure' ? 'completed' : 'active') : 'completed',
        duration: 45,
        notes: i === 1 ? 'Initial offer submitted' : `Round ${i} negotiation`
      });
    }

    return entries;
  };

  const generateMockHistoricalSessions = (): TradeSession[] => {
    return [
      {
        id: 'session-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        entries: [
          {
            id: 'hist-1-1',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            round: 1,
            phase: 'opening',
            priceOffered: 148,
            priceAccepted: 142,
            volume: 1500,
            persona: 'Corporate Compliance Officer',
            status: 'completed',
            duration: 180,
            notes: 'Successful negotiation - price concession accepted'
          }
        ],
        finalPrice: 142,
        totalVolume: 1500,
        status: 'completed'
      },
      {
        id: 'session-2',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        entries: [
          {
            id: 'hist-2-1',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            round: 1,
            phase: 'escalation',
            priceOffered: 150,
            volume: 800,
            persona: 'Carbon Trading Desk Analyst',
            status: 'failed',
            duration: 300,
            notes: 'Failed - price below floor threshold'
          }
        ],
        totalVolume: 800,
        status: 'failed'
      }
    ];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircleIcon className="w-4 h-4 text-red-600" />;
      default: return <ClockIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filterStatus !== 'all' && session.status !== filterStatus) return false;

    const now = new Date();
    const sessionTime = session.startTime;

    switch (selectedTimeframe) {
      case 'today':
        return sessionTime.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionTime >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return sessionTime >= monthAgo;
      default:
        return true;
    }
  });

  return (
    <div className={`bg-white border border-slate-200 rounded-lg ${className}`}>
      {/* Header */}
      <div
        className="px-6 py-4 border-b border-slate-200"
        style={{ backgroundColor: tokens.colors.surface.secondary }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-5 h-5 text-slate-600" />
            <h3 className="bloomberg-card-title text-slate-800">Trade History</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Timeframe Filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="bloomberg-small-text bg-white border border-slate-300 rounded px-3 py-1"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bloomberg-small-text bg-white border border-slate-300 rounded px-3 py-1"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="p-6">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <FunnelIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <div className="bloomberg-body-text text-slate-600">No trades found for selected filters</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <div key={session.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                {/* Session Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="bloomberg-body-text font-medium text-slate-800">
                        {session.id === 'current' ? 'Current Session' : `Session ${session.id.split('-')[1]}`}
                      </div>
                      <div className="bloomberg-small-text text-slate-500">
                        {session.startTime.toLocaleString()}
                        {session.endTime && ` - ${session.endTime.toLocaleString()}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full bloomberg-small-text font-medium ${getStatusColor(session.status)}`}>
                      {session.status.toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Session Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="bloomberg-small-text text-slate-500 mb-1">Volume</div>
                    <div className="bloomberg-data text-slate-800">{session.totalVolume.toLocaleString()} tCO₂e</div>
                  </div>
                  <div>
                    <div className="bloomberg-small-text text-slate-500 mb-1">Rounds</div>
                    <div className="bloomberg-data text-slate-800">{session.entries.length}</div>
                  </div>
                  <div>
                    <div className="bloomberg-small-text text-slate-500 mb-1">Final Price</div>
                    <div className="bloomberg-data text-slate-800">
                      {session.finalPrice ? `$${session.finalPrice.toFixed(2)}` : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="bloomberg-small-text text-slate-500 mb-1">Duration</div>
                    <div className="bloomberg-data text-slate-800">
                      {session.endTime
                        ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)}m`
                        : 'Ongoing'
                      }
                    </div>
                  </div>
                </div>

                {/* Trade Entries */}
                <div className="space-y-2">
                  {session.entries.slice(-3).map((entry, index) => (
                    <div key={entry.id} className="flex items-center gap-4 py-2 px-3 bg-slate-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="bloomberg-small-text text-blue-600 font-medium">{entry.round}</span>
                        </div>
                        <UserIcon className="w-4 h-4 text-slate-500" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="bloomberg-small-text text-slate-800">{entry.persona}</span>
                          <ArrowRightIcon className="w-3 h-3 text-slate-400" />
                          <span className="bloomberg-data text-slate-800">${entry.priceOffered.toFixed(2)}</span>
                          {entry.priceAccepted && (
                            <>
                              <ArrowRightIcon className="w-3 h-3 text-green-500" />
                              <span className="bloomberg-data text-green-600">${entry.priceAccepted.toFixed(2)}</span>
                            </>
                          )}
                        </div>
                        {entry.notes && (
                          <div className="bloomberg-small-text text-slate-500 mt-1">{entry.notes}</div>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="bloomberg-small-text text-slate-500">
                          {entry.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  {session.entries.length > 3 && (
                    <div className="bloomberg-small-text text-slate-500 text-center py-2">
                      ... {session.entries.length - 3} more entries
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistoryView;