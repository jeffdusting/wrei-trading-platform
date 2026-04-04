'use client';

import type { PersonaType } from '@/lib/types';
import ProfessionalInterface from '@/components/ProfessionalInterface';
import BulkNegotiationDashboard from '@/components/trading/BulkNegotiationDashboard';
import InstrumentSwitcher from '@/components/trading/InstrumentSwitcher';
import OrderBookPanel from '@/components/trading/OrderBookPanel';
import TokenDetailPanel from '@/components/trading/TokenDetailPanel';
import TradeBlotter from '@/components/trading/TradeBlotter';

import { useTradeState } from './_hooks/useTradeState';
import { useTradeAPI } from './_hooks/useTradeAPI';
import { useTradeActions } from './_hooks/useTradeActions';
import { useTradeHistory } from './_hooks/useTradeHistory';
import { usePreConfig } from './_hooks/usePreConfig';
import { generateReportData, isInstitutionalPersona, buildInvestorProfile, buildPortfolioAllocation } from './_lib/trade-utils';

import PreConfigBanner from './_components/PreConfigBanner';
import TradeModeSelector from './_components/TradeModeSelector';
import TokenTypeSelector from './_components/TokenTypeSelector';
import PersonaSelector from './_components/PersonaSelector';
import NegotiationDashboard from './_components/NegotiationDashboard';
import TokenMetadataPanel from './_components/TokenMetadataPanel';
import ChatInterface from './_components/ChatInterface';
import AnalyticsInlinePanel from './_components/AnalyticsInlinePanel';
import InstitutionalTabs from './_components/InstitutionalTabs';
import TradingStatusBar from './_components/TradingStatusBar';
import TradeModals from './_components/TradeModals';

export default function TradePage() {
  const state = useTradeState();
  const history = useTradeHistory(state);
  const api = useTradeAPI(state, history.saveCompletedTrading);
  const actions = useTradeActions(state, history.saveCompletedTrading);
  usePreConfig(state);

  return (
    <div className="bg-[#F8FAFC]">
      <PreConfigBanner isPreConfigured={state.isPreConfigured} preConfigMessage={state.preConfigMessage} tradingStarted={state.tradingStarted} />

      <TradeModeSelector
        interfaceMode={state.interfaceMode} setInterfaceMode={state.setInterfaceMode}
        showExportOptions={state.showExportOptions} setShowExportOptions={state.setShowExportOptions}
        reportData={generateReportData(state.selectedWREITokenType, state.investmentSize, state.timeHorizon, state.investorClassification, state.selectedPersona, state.selectedPersonaData?.name)}
        selectedPersonaName={state.selectedPersonaData?.name} investorClassification={state.investorClassification}
      />

      {state.interfaceMode === 'bulk' ? (
        <div className="max-w-7xl mx-auto p-4"><BulkNegotiationDashboard /></div>
      ) : state.interfaceMode === 'professional' ? (
        <ProfessionalInterface
          investorProfile={buildInvestorProfile(state.selectedPersona, state.investorClassification)}
          portfolioAllocation={buildPortfolioAllocation(state.selectedWREITokenType)}
          investmentSize={state.investmentSize} timeHorizon={state.timeHorizon}
          onInvestmentDecision={actions.handleInvestmentDecision}
        />
      ) : (
        <>
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]">
          {/* Left Panel */}
          <div className="lg:w-1/3 space-y-6 order-2 lg:order-1">
            <InstrumentSwitcher selectedInstrument={state.selectedInstrument} onInstrumentChange={api.handleInstrumentChange} />
            <OrderBookPanel instrumentType={state.selectedInstrument} spotPrice={state.instrumentPricing?.currentSpot} />
            {(state.selectedInstrument === 'WREI_CC' || state.selectedInstrument === 'WREI_ACO') && (
              <TokenDetailPanel tokenType={state.selectedInstrument} />
            )}
            <TokenTypeSelector selectedWREITokenType={state.selectedWREITokenType} onTokenTypeChange={api.handleWREITokenTypeChange} tradingStarted={state.tradingStarted} />
            <PersonaSelector
              selectedPersona={state.selectedPersona} onPersonaChange={api.handlePersonaChange}
              tradingStarted={state.tradingStarted} isLoading={state.isLoading}
              onReset={actions.handleResetTrading} selectedPersonaData={state.selectedPersonaData ?? null}
            />
            {state.tradingState && (
              <NegotiationDashboard tradingState={state.tradingState} currentClassification={state.currentClassification} currentEmotion={state.currentEmotion} threatLevel={state.threatLevel} />
            )}
            {state.tradingState && (
              <TokenMetadataPanel tradingState={state.tradingState} showBlockchainProvenance={state.showBlockchainProvenance} setShowBlockchainProvenance={state.setShowBlockchainProvenance} />
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:w-2/3 flex flex-col order-1 lg:order-2" data-demo="trading-interface">
            <ChatInterface
              tradingState={state.tradingState} tradingStarted={state.tradingStarted}
              isLoading={state.isLoading} isInitializing={state.isInitializing}
              error={state.error} setError={state.setError}
              lastFailedMessage={state.lastFailedMessage}
              inputMessage={state.inputMessage} setInputMessage={state.setInputMessage}
              selectedPersona={state.selectedPersona}
              showScorecard={state.showScorecard} setShowScorecard={state.setShowScorecard}
              tradingScorecard={state.tradingScorecard}
              setShowProvenanceCert={state.setShowProvenanceCert}
              messagesEndRef={state.messagesEndRef} inputRef={state.inputRef}
              onStartTrading={api.handleStartTrading} onSendMessage={api.handleSendMessage} onKeyPress={api.handleKeyPress}
              onEndTrading={actions.handleEndTrading} onRequestHuman={actions.handleRequestHuman} onResetTrading={actions.handleResetTrading}
            />
            {state.tradingState && <AnalyticsInlinePanel tradingState={state.tradingState} />}
            {state.tradingState && (
              <InstitutionalTabs
                tradingState={state.tradingState} selectedPersona={state.selectedPersona} selectedInstrument={state.selectedInstrument}
                activeAnalyticsTab={state.activeAnalyticsTab} setActiveAnalyticsTab={state.setActiveAnalyticsTab}
                tradingSessions={state.tradingSessions} setShowComparisonDashboard={state.setShowComparisonDashboard}
                onViewReplay={history.handleViewReplay}
                isVisible={isInstitutionalPersona(state.selectedPersona) || state.selectedInstrument === 'WREI_CC' || state.selectedInstrument === 'WREI_ACO'}
              />
            )}
          </div>
        </div>

        <div className="mt-4"><TradeBlotter localTrades={state.blotterTrades} instrumentFilter={state.selectedInstrument} /></div>
        <TradingStatusBar tradingState={state.tradingState} />

        <TradeModals
          tradingStarted={state.tradingStarted} tradingState={state.tradingState}
          selectedPersona={state.selectedPersona} selectedInstrument={state.selectedInstrument}
          showStrategyPanel={state.showStrategyPanel} setShowStrategyPanel={state.setShowStrategyPanel}
          currentStrategyExplanation={state.currentStrategyExplanation}
          showCoachingPanel={state.showCoachingPanel} setShowCoachingPanel={state.setShowCoachingPanel}
          showReplayViewer={state.showReplayViewer} selectedSession={state.selectedSession}
          closeReplayViewer={history.closeReplayViewer}
          showComparisonDashboard={state.showComparisonDashboard} tradingSessions={state.tradingSessions}
          sessionComparison={state.sessionComparison} handleSessionComparison={history.handleSessionComparison}
          closeComparisonDashboard={history.closeComparisonDashboard}
          showProvenanceCert={state.showProvenanceCert} setShowProvenanceCert={state.setShowProvenanceCert}
          lastAgreedTrade={state.lastAgreedTrade}
        />
          </div>
        </>
      )}
    </div>
  );
}
