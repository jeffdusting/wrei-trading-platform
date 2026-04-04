'use client';

import { useState, useRef } from 'react';
import type { NegotiationState, PersonaType, ArgumentClassification, EmotionalState, CreditType, WREITokenType, InvestorClassification } from '@/lib/types';
import { getPersonaById } from '@/lib/personas';
import type { NegotiationStrategyExplanation } from '@/lib/negotiation-strategy';
import type { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import type { NegotiationScorecard } from '@/lib/negotiation-scoring';
import type { NegotiationPreConfig } from '@/lib/onboarding-pipeline';
import type { BlotterTrade } from '@/components/trading/TradeBlotter';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';
import type { TradeState } from '../_lib/trade-types';

export function useTradeState(): TradeState {
  // Core negotiation state
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | 'freeplay'>('freeplay');
  const [selectedCreditType, setSelectedCreditType] = useState<CreditType>('carbon');
  const [selectedWREITokenType, setSelectedWREITokenType] = useState<WREITokenType>('carbon_credits');
  const [tradingState, setTradingState] = useState<NegotiationState | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradingStarted, setTradingStarted] = useState(false);
  const [currentClassification, setCurrentClassification] = useState<ArgumentClassification>('general');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState>('neutral');
  const [threatLevel, setThreatLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'standard' | 'institutional' | 'history'>('standard');

  // A1: Trading Replay & Comparison State
  const [tradingSessions, setTradingSessions] = useState<NegotiationSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<NegotiationSession | null>(null);
  const [showReplayViewer, setShowReplayViewer] = useState(false);
  const [showComparisonDashboard, setShowComparisonDashboard] = useState(false);
  const [sessionComparison, setSessionComparison] = useState<SessionComparison | null>(null);
  const [tradingStartTime, setTradingStartTime] = useState<string | null>(null);

  // Phase 6.2: Professional Interface Mode
  const [interfaceMode, setInterfaceMode] = useState<'standard' | 'professional' | 'bulk'>('standard');
  const [investorClassification, setInvestorClassification] = useState<InvestorClassification>('wholesale');
  const [investmentSize, setInvestmentSize] = useState(25_000_000);
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Phase 1 Milestone 1.1: AI Strategy Enhancement
  const [currentStrategyExplanation, setCurrentStrategyExplanation] = useState<NegotiationStrategyExplanation | null>(null);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);

  // A4: Outcome Scoring & Benchmarking
  const [tradingScorecard, setTradingScorecard] = useState<NegotiationScorecard | null>(null);
  const [showScorecard, setShowScorecard] = useState(false);

  // A2: Real-Time Coaching Panel
  const [showCoachingPanel, setShowCoachingPanel] = useState(false);
  const [showBlockchainProvenance, setShowBlockchainProvenance] = useState(false);

  // P1.3: Instrument Switcher
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentType>('WREI_CC');
  const [instrumentPricing, setInstrumentPricing] = useState<ResolvedPricing | null>(null);

  // P1.7: Trade blotter local state
  const [blotterTrades, setBlotterTrades] = useState<BlotterTrade[]>([]);

  // P3.3: Provenance certificate modal
  const [showProvenanceCert, setShowProvenanceCert] = useState(false);
  const [lastAgreedTrade, setLastAgreedTrade] = useState<BlotterTrade | null>(null);

  // B4: Onboarding-to-Trading Pipeline - Pre-configuration State
  const [isPreConfigured, setIsPreConfigured] = useState(false);
  const [preConfigData, setPreConfigData] = useState<NegotiationPreConfig | null>(null);
  const [preConfigMessage, setPreConfigMessage] = useState<string>('');
  const [preConfigApplied, setPreConfigApplied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Derived state
  const selectedPersonaData = selectedPersona !== 'freeplay' ? getPersonaById(selectedPersona) : null;

  return {
    selectedPersona, setSelectedPersona,
    selectedCreditType, setSelectedCreditType,
    selectedWREITokenType, setSelectedWREITokenType,
    tradingState, setTradingState,
    inputMessage, setInputMessage,
    isLoading, setIsLoading,
    error, setError,
    tradingStarted, setTradingStarted,
    currentClassification, setCurrentClassification,
    currentEmotion, setCurrentEmotion,
    threatLevel, setThreatLevel,
    isInitializing, setIsInitializing,
    lastFailedMessage, setLastFailedMessage,
    activeAnalyticsTab, setActiveAnalyticsTab,
    tradingSessions, setTradingSessions,
    selectedSession, setSelectedSession,
    showReplayViewer, setShowReplayViewer,
    showComparisonDashboard, setShowComparisonDashboard,
    sessionComparison, setSessionComparison,
    tradingStartTime, setTradingStartTime,
    interfaceMode, setInterfaceMode,
    investorClassification, setInvestorClassification,
    investmentSize, setInvestmentSize,
    timeHorizon, setTimeHorizon,
    showExportOptions, setShowExportOptions,
    currentStrategyExplanation, setCurrentStrategyExplanation,
    showStrategyPanel, setShowStrategyPanel,
    tradingScorecard, setTradingScorecard,
    showScorecard, setShowScorecard,
    showCoachingPanel, setShowCoachingPanel,
    showBlockchainProvenance, setShowBlockchainProvenance,
    selectedInstrument, setSelectedInstrument,
    instrumentPricing, setInstrumentPricing,
    blotterTrades, setBlotterTrades,
    showProvenanceCert, setShowProvenanceCert,
    lastAgreedTrade, setLastAgreedTrade,
    isPreConfigured, setIsPreConfigured,
    preConfigData, setPreConfigData,
    preConfigMessage, setPreConfigMessage,
    preConfigApplied, setPreConfigApplied,
    messagesEndRef, inputRef,
    selectedPersonaData,
  };
}
