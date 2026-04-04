import type { NegotiationState, PersonaType, ArgumentClassification, EmotionalState, CreditType, WREITokenType, InvestorClassification } from '@/lib/types';
import type { NegotiationStrategyExplanation } from '@/lib/negotiation-strategy';
import type { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import type { NegotiationScorecard } from '@/lib/negotiation-scoring';
import type { NegotiationPreConfig } from '@/lib/onboarding-pipeline';
import type { BlotterTrade } from '@/components/trading/TradeBlotter';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';
import type { RefObject } from 'react';

export interface APIResponse {
  agentMessage: string;
  state: NegotiationState;
  classification: ArgumentClassification;
  emotionalState: EmotionalState;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  tokenMetadata?: any;
  strategyExplanation?: NegotiationStrategyExplanation;
  error?: string;
}

export const phaseColors: Record<string, string> = {
  opening: 'bg-blue-100 text-blue-800',
  elicitation: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-green-100 text-green-800',
  closure: 'bg-purple-100 text-purple-800',
  escalation: 'bg-red-100 text-red-800'
};

export const classificationColors: Record<string, string> = {
  price_challenge: 'bg-red-100 text-red-700',
  fairness_appeal: 'bg-blue-100 text-blue-700',
  time_pressure: 'bg-amber-100 text-amber-700',
  information_request: 'bg-green-100 text-green-700',
  relationship_signal: 'bg-purple-100 text-purple-700',
  authority_constraint: 'bg-indigo-100 text-indigo-700',
  emotional_expression: 'bg-pink-100 text-pink-700',
  general: 'bg-gray-100 text-gray-700'
};

export const emotionalColors: Record<string, string> = {
  frustrated: 'bg-red-100 text-red-700',
  enthusiastic: 'bg-green-100 text-green-700',
  sceptical: 'bg-yellow-100 text-yellow-700',
  satisfied: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
  pressured: 'bg-orange-100 text-orange-700'
};

export interface TradeState {
  // Core negotiation
  selectedPersona: PersonaType | 'freeplay';
  setSelectedPersona: (p: PersonaType | 'freeplay') => void;
  selectedCreditType: CreditType;
  setSelectedCreditType: (c: CreditType) => void;
  selectedWREITokenType: WREITokenType;
  setSelectedWREITokenType: (t: WREITokenType) => void;
  tradingState: NegotiationState | null;
  setTradingState: (s: NegotiationState | null | ((prev: NegotiationState | null) => NegotiationState | null)) => void;
  inputMessage: string;
  setInputMessage: (s: string) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  error: string | null;
  setError: (s: string | null) => void;
  tradingStarted: boolean;
  setTradingStarted: (b: boolean) => void;
  currentClassification: ArgumentClassification;
  setCurrentClassification: (c: ArgumentClassification) => void;
  currentEmotion: EmotionalState;
  setCurrentEmotion: (e: EmotionalState) => void;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  setThreatLevel: (t: 'none' | 'low' | 'medium' | 'high') => void;
  isInitializing: boolean;
  setIsInitializing: (b: boolean) => void;
  lastFailedMessage: string | null;
  setLastFailedMessage: (s: string | null) => void;
  activeAnalyticsTab: 'standard' | 'institutional' | 'history';
  setActiveAnalyticsTab: (t: 'standard' | 'institutional' | 'history') => void;

  // History & replay
  tradingSessions: NegotiationSession[];
  setTradingSessions: (s: NegotiationSession[]) => void;
  selectedSession: NegotiationSession | null;
  setSelectedSession: (s: NegotiationSession | null) => void;
  showReplayViewer: boolean;
  setShowReplayViewer: (b: boolean) => void;
  showComparisonDashboard: boolean;
  setShowComparisonDashboard: (b: boolean) => void;
  sessionComparison: SessionComparison | null;
  setSessionComparison: (s: SessionComparison | null) => void;
  tradingStartTime: string | null;
  setTradingStartTime: (s: string | null) => void;

  // Professional interface
  interfaceMode: 'standard' | 'professional' | 'bulk';
  setInterfaceMode: (m: 'standard' | 'professional' | 'bulk') => void;
  investorClassification: InvestorClassification;
  setInvestorClassification: (c: InvestorClassification) => void;
  investmentSize: number;
  setInvestmentSize: (n: number) => void;
  timeHorizon: number;
  setTimeHorizon: (n: number) => void;
  showExportOptions: boolean;
  setShowExportOptions: (b: boolean) => void;

  // Strategy
  currentStrategyExplanation: NegotiationStrategyExplanation | null;
  setCurrentStrategyExplanation: (s: NegotiationStrategyExplanation | null) => void;
  showStrategyPanel: boolean;
  setShowStrategyPanel: (b: boolean) => void;

  // Scorecard
  tradingScorecard: NegotiationScorecard | null;
  setTradingScorecard: (s: NegotiationScorecard | null) => void;
  showScorecard: boolean;
  setShowScorecard: (b: boolean) => void;

  // Coaching & blockchain
  showCoachingPanel: boolean;
  setShowCoachingPanel: (b: boolean) => void;
  showBlockchainProvenance: boolean;
  setShowBlockchainProvenance: (b: boolean) => void;

  // Instruments
  selectedInstrument: InstrumentType;
  setSelectedInstrument: (t: InstrumentType) => void;
  instrumentPricing: ResolvedPricing | null;
  setInstrumentPricing: (p: ResolvedPricing | null) => void;

  // Blotter
  blotterTrades: BlotterTrade[];
  setBlotterTrades: (t: BlotterTrade[] | ((prev: BlotterTrade[]) => BlotterTrade[])) => void;

  // Provenance cert
  showProvenanceCert: boolean;
  setShowProvenanceCert: (b: boolean) => void;
  lastAgreedTrade: BlotterTrade | null;
  setLastAgreedTrade: (t: BlotterTrade | null) => void;

  // Pre-config
  isPreConfigured: boolean;
  setIsPreConfigured: (b: boolean) => void;
  preConfigData: NegotiationPreConfig | null;
  setPreConfigData: (d: NegotiationPreConfig | null) => void;
  preConfigMessage: string;
  setPreConfigMessage: (s: string) => void;
  preConfigApplied: boolean;
  setPreConfigApplied: (b: boolean) => void;

  // Refs
  messagesEndRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<HTMLTextAreaElement>;

  // Derived
  selectedPersonaData: ReturnType<typeof import('@/lib/personas').getPersonaById> | null;
}
