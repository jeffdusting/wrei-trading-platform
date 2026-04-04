'use client';

import { useEffect } from 'react';
import type { NegotiationState } from '@/lib/types';
import {
  addNegotiationSession,
  getAllNegotiationSessions,
  compareNegotiationSessions,
  type NegotiationSession,
} from '@/lib/negotiation-history';
import type { TradeState } from '../_lib/trade-types';

export interface TradeHistory {
  saveCompletedTrading: (finalState: NegotiationState) => void;
  refreshSessionsList: () => void;
  handleSessionComparison: (sessionIds: string[]) => void;
  handleViewReplay: (session: NegotiationSession) => void;
  closeReplayViewer: () => void;
  closeComparisonDashboard: () => void;
}

export function useTradeHistory(state: TradeState): TradeHistory {
  const refreshSessionsList = () => {
    const sessions = getAllNegotiationSessions();
    state.setTradingSessions(sessions);
  };

  // A1: Load existing trading sessions on mount
  useEffect(() => {
    refreshSessionsList();
  }, []);

  const saveCompletedTrading = (finalState: NegotiationState) => {
    if (!state.tradingStartTime) return;

    addNegotiationSession({
      persona: state.selectedPersona,
      startTime: state.tradingStartTime,
      endTime: new Date().toISOString(),
      messages: finalState.messages,
      finalState,
      outcome: finalState.outcome
    });

    const updatedSessions = getAllNegotiationSessions();
    state.setTradingSessions(updatedSessions);
  };

  const handleSessionComparison = (sessionIds: string[]) => {
    if (sessionIds.length === 2) {
      const comparison = compareNegotiationSessions(sessionIds[0], sessionIds[1]);
      state.setSessionComparison(comparison);
    }
  };

  const handleViewReplay = (session: NegotiationSession) => {
    state.setSelectedSession(session);
    state.setShowReplayViewer(true);
  };

  const closeReplayViewer = () => {
    state.setShowReplayViewer(false);
    state.setSelectedSession(null);
  };

  const closeComparisonDashboard = () => {
    state.setShowComparisonDashboard(false);
    state.setSessionComparison(null);
  };

  return {
    saveCompletedTrading,
    refreshSessionsList,
    handleSessionComparison,
    handleViewReplay,
    closeReplayViewer,
    closeComparisonDashboard,
  };
}
