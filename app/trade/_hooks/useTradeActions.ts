'use client';

import type { NegotiationState } from '@/lib/types';
import { exportReport } from '@/lib/export-utilities';
import type { ExportOptions } from '@/lib/export-utilities';
import type { TradeState } from '../_lib/trade-types';
import { APIResponse } from '../_lib/trade-types';
import { generateReportData } from '../_lib/trade-utils';

export interface TradeActions {
  handleEndTrading: () => Promise<void>;
  handleRequestHuman: () => Promise<void>;
  handleResetTrading: () => void;
  handleInvestmentDecision: (decision: any) => Promise<void>;
  handleExportReport: (format: 'pdf' | 'excel' | 'csv' | 'json') => Promise<void>;
}

export function useTradeActions(
  state: TradeState,
  saveCompletedTrading: (finalState: NegotiationState) => void
): TradeActions {
  const handleEndTrading = async () => {
    if (!state.tradingState || state.isLoading) return;

    state.setIsLoading(true);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to end this trade for now.',
          state: state.tradingState,
          isOpening: false,
          instrumentType: state.selectedInstrument,
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        const finalState = {
          ...data.state,
          negotiationComplete: true,
          outcome: 'deferred' as const
        };
        state.setTradingState(finalState);
        saveCompletedTrading(finalState);
      }
    } catch (err) {
      state.setError('Failed to end trade properly.');
    } finally {
      state.setIsLoading(false);
    }
  };

  const handleRequestHuman = async () => {
    if (!state.tradingState || state.isLoading) return;

    state.setIsLoading(true);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to speak with a human representative.',
          state: state.tradingState,
          isOpening: false,
          instrumentType: state.selectedInstrument,
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        const finalState = {
          ...data.state,
          negotiationComplete: true,
          outcome: 'escalated' as const
        };
        state.setTradingState(finalState);
        saveCompletedTrading(finalState);
      }
    } catch (err) {
      state.setError('Failed to request human representative.');
    } finally {
      state.setIsLoading(false);
    }
  };

  const handleResetTrading = () => {
    state.setTradingStarted(false);
    state.setTradingState(null);
    state.setInputMessage('');
    state.setError(null);
    state.setCurrentClassification('general');
    state.setCurrentEmotion('neutral');
    state.setThreatLevel('none');
    state.setIsInitializing(false);
    state.setLastFailedMessage(null);
    state.setTradingScorecard(null);
    state.setShowScorecard(false);
    state.setTradingStartTime(null);
  };

  const handleInvestmentDecision = async (decision: any) => {
    console.log('Investment decision:', decision);
    if (decision.decision === 'proceed') {
      alert(`Investment proceeding: ${decision.tokenType} - A$${(decision.investmentSize / 1_000_000).toFixed(1)}M`);
    } else if (decision.decision === 'review') {
      alert('Investment review scheduled - institutional team will contact within 24 hours');
    }
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    try {
      const reportData = generateReportData(
        state.selectedWREITokenType,
        state.investmentSize,
        state.timeHorizon,
        state.investorClassification,
        state.selectedPersona,
        state.selectedPersonaData?.name
      );
      const options: ExportOptions = {
        format,
        template: 'detailed_analysis',
        includeCharts: true,
        includeRiskMetrics: true,
        includeScenarios: true,
        includeCompliance: true,
        branding: {
          companyName: 'Water Roads Pty Ltd',
          reportTitle: 'WREI Professional Investment Analysis',
          confidential: true
        },
        recipient: {
          name: 'Professional Investor',
          organization: state.selectedPersonaData?.name || 'Investment Organization',
          classification: state.investorClassification
        }
      };

      const result = await exportReport(reportData, options);

      if (result.success && result.downloadUrl) {
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `WREI_Analysis_${format.toUpperCase()}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'html' : format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        state.setShowExportOptions(false);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    handleEndTrading,
    handleRequestHuman,
    handleResetTrading,
    handleInvestmentDecision,
    handleExportReport,
  };
}
