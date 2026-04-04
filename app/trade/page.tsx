'use client';

import { useState, useEffect, useRef } from 'react';
import { NegotiationState, PersonaType, ArgumentClassification, EmotionalState, CreditType, WREITokenType, InvestorClassification } from '@/lib/types';
import { PERSONA_DEFINITIONS, getPersonaById } from '@/lib/personas';
import { getInitialState, getInitialWREIState, NEGOTIATION_CONFIG, WREI_TOKEN_CONFIG } from '@/lib/negotiation-config';
import InstitutionalDashboard from '@/components/InstitutionalDashboard';
import ProfessionalInterface from '@/components/ProfessionalInterface';
import { calculateProfessionalMetrics, generateScenarioAnalysis } from '@/lib/professional-analytics';
import { exportReport } from '@/lib/export-utilities';
import type { ReportData, ExportOptions } from '@/lib/export-utilities';
import ExportModal from '@/components/export/ExportModal';
import { NegotiationStrategyExplanation } from '@/lib/negotiation-strategy';
import NegotiationStrategyPanel from '@/components/NegotiationStrategyPanel';
import {
  addNegotiationSession,
  getAllNegotiationSessions,
  getNegotiationSession,
  compareNegotiationSessions,
  type NegotiationSession,
  type SessionComparison
} from '@/lib/negotiation-history';
import ReplayViewer from '@/components/negotiation/ReplayViewer';
import ComparisonDashboard from '@/components/negotiation/ComparisonDashboard';
import Scorecard from '@/components/negotiation/Scorecard';
import { calculateNegotiationScore, type NegotiationScorecard } from '@/lib/negotiation-scoring';
import CoachingPanel from '@/components/negotiation/CoachingPanel';
import ProvenanceChain from '@/components/blockchain/ProvenanceChain';
import MerkleTreeView from '@/components/blockchain/MerkleTreeView';
import VesselProvenanceCard from '@/components/blockchain/VesselProvenanceCard';
import {
  parseNegotiationUrlParams,
  calculateInstitutionalConstraints,
  generatePersonalisedWelcome,
  type NegotiationPreConfig
} from '@/lib/onboarding-pipeline';
import InstrumentSwitcher from '@/components/trading/InstrumentSwitcher';
import OrderBookPanel from '@/components/trading/OrderBookPanel';
import TradeBlotter, { type BlotterTrade } from '@/components/trading/TradeBlotter';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';

interface APIResponse {
  agentMessage: string;
  state: NegotiationState;
  classification: ArgumentClassification;
  emotionalState: EmotionalState;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
  tokenMetadata?: any; // Token metadata from API response
  strategyExplanation?: NegotiationStrategyExplanation; // AI strategy explanation
  error?: string;
}

const phaseColors = {
  opening: 'bg-blue-100 text-blue-800',
  elicitation: 'bg-amber-100 text-amber-800',
  negotiation: 'bg-green-100 text-green-800',
  closure: 'bg-purple-100 text-purple-800',
  escalation: 'bg-red-100 text-red-800'
};

const classificationColors = {
  price_challenge: 'bg-red-100 text-red-700',
  fairness_appeal: 'bg-blue-100 text-blue-700',
  time_pressure: 'bg-amber-100 text-amber-700',
  information_request: 'bg-green-100 text-green-700',
  relationship_signal: 'bg-purple-100 text-purple-700',
  authority_constraint: 'bg-indigo-100 text-indigo-700',
  emotional_expression: 'bg-pink-100 text-pink-700',
  general: 'bg-gray-100 text-gray-700'
};

const emotionalColors = {
  frustrated: 'bg-red-100 text-red-700',
  enthusiastic: 'bg-green-100 text-green-700',
  sceptical: 'bg-yellow-100 text-yellow-700',
  satisfied: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-700',
  pressured: 'bg-orange-100 text-orange-700'
};

export default function TradePage() {
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
  const [interfaceMode, setInterfaceMode] = useState<'standard' | 'professional'>('standard');
  const [investorClassification, setInvestorClassification] = useState<InvestorClassification>('wholesale');
  const [investmentSize, setInvestmentSize] = useState(25_000_000); // A$25M default
  const [timeHorizon, setTimeHorizon] = useState(5); // 5 year default
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

  const handleInstrumentChange = (type: InstrumentType, pricing: ResolvedPricing) => {
    if (tradingStarted) return;
    setSelectedInstrument(type);
    setInstrumentPricing(pricing);
  };

  // B4: Onboarding-to-Trading Pipeline - Pre-configuration State
  const [isPreConfigured, setIsPreConfigured] = useState(false);
  const [preConfigData, setPreConfigData] = useState<NegotiationPreConfig | null>(null);
  const [preConfigMessage, setPreConfigMessage] = useState<string>('');
  const [preConfigApplied, setPreConfigApplied] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to determine if current persona is institutional
  const isInstitutionalPersona = (persona: PersonaType | 'freeplay'): boolean => {
    const institutionalPersonas: PersonaType[] = [
      'infrastructure_fund',
      'esg_impact_investor',
      'defi_yield_farmer',
      'family_office',
      'sovereign_wealth',
      'pension_fund'
    ];
    return institutionalPersonas.includes(persona as PersonaType);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [tradingState?.messages]);

  // A1: Load existing trading sessions on mount
  useEffect(() => {
    refreshSessionsList();
  }, []);

  // B4: Pre-configuration from institutional onboarding
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const preConfigParams = parseNegotiationUrlParams(searchParams);

    if (preConfigParams.isPreConfigured && !preConfigApplied) {
      setIsPreConfigured(true);

      // Map URL parameters to persona
      const mappedPersona = preConfigParams.persona
        ? mapUrlPersonaToBuyerPersona(preConfigParams.persona)
        : 'freeplay';

      // Set persona and other configurations
      setSelectedPersona(mappedPersona);

      if (preConfigParams.classification) {
        setInvestorClassification(preConfigParams.classification);
      }

      // Set interface to professional mode for institutional users
      setInterfaceMode('professional');

      // Generate personalised welcome message
      if (preConfigParams.entityName && preConfigParams.persona) {
        const welcomeMsg = `Welcome ${preConfigParams.entityName}! Your institutional profile has been pre-configured for ${preConfigParams.persona.replace(/_/g, ' ')} negotiations.`;
        setPreConfigMessage(welcomeMsg);
      }

      // Initialize trading state with pre-configuration
      const initialState = getInitialWREIState(mappedPersona, selectedWREITokenType, selectedCreditType);

      // Apply institutional constraint adjustments if we have classification
      if (preConfigParams.classification && initialState) {
        const baseConstraints = {
          priceFloor: NEGOTIATION_CONFIG.PRICE_FLOOR,
          maxConcessionPerRound: NEGOTIATION_CONFIG.MAX_CONCESSION_PER_ROUND,
          maxTotalConcession: NEGOTIATION_CONFIG.MAX_TOTAL_CONCESSION,
          minRoundsBeforeConcession: NEGOTIATION_CONFIG.MIN_ROUNDS_BEFORE_PRICE_CONCESSION
        };

        const adjustedConstraints = calculateInstitutionalConstraints(
          preConfigParams.classification,
          baseConstraints
        );

        // Store adjusted constraints for use during trading
        // Note: The actual constraint application happens in the API route
        // This is just for UI display and reference
        console.log('Applied institutional constraints:', adjustedConstraints);
      }

      setTradingState(initialState);
      setPreConfigApplied(true);

      // Clean up URL parameters after applying pre-configuration
      window.history.replaceState({}, '', '/trade');
    }
  }, [preConfigApplied, selectedWREITokenType, selectedCreditType]);

  // Helper function to map URL persona parameters to buyer personas
  const mapUrlPersonaToBuyerPersona = (urlPersona: string): PersonaType | 'freeplay' => {
    const personaMapping: Record<string, PersonaType> = {
      'corporate_compliance_officer': 'compliance_officer',
      'esg_fund_portfolio_manager': 'esg_impact_investor',
      'carbon_trading_desk_analyst': 'trading_desk',
      'sustainability_director_midcap': 'family_office',
      'government_procurement_officer': 'government_procurement'
    };

    return personaMapping[urlPersona] || 'freeplay';
  };

  const handlePersonaChange = (persona: PersonaType | 'freeplay') => {
    if (!tradingStarted) {
      setSelectedPersona(persona);
      // Use WREI token system for new trading
      setTradingState(getInitialWREIState(persona, selectedWREITokenType, selectedCreditType));
    }
  };

  const handleCreditTypeChange = (creditType: CreditType) => {
    if (!tradingStarted) {
      setSelectedCreditType(creditType);
      // Update legacy credit type but keep WREI token as primary
      setTradingState(getInitialWREIState(selectedPersona, selectedWREITokenType, creditType));
    }
  };

  const handleWREITokenTypeChange = (tokenType: WREITokenType) => {
    if (!tradingStarted) {
      setSelectedWREITokenType(tokenType);
      setTradingState(getInitialWREIState(selectedPersona, tokenType, selectedCreditType));
    }
  };

  const handleStartTrading = async () => {
    if (!tradingState) {
      setTradingState(getInitialWREIState(selectedPersona, selectedWREITokenType, selectedCreditType));
    }

    setIsLoading(true);
    setIsInitializing(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          state: tradingState || getInitialWREIState(selectedPersona, selectedWREITokenType, selectedCreditType),
          isOpening: true,
          instrumentType: selectedInstrument,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setTradingState(data.state);
        setTradingStarted(true);
        setTradingStartTime(new Date().toISOString());
        setCurrentClassification(data.classification);
        setCurrentEmotion(data.emotionalState);
        setThreatLevel(data.threatLevel);

        // Update strategy explanation for institutional investors
        if (data.strategyExplanation) {
          setCurrentStrategyExplanation(data.strategyExplanation);
          setShowStrategyPanel(true); // Auto-show for institutional investors
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Connection timeout. Please check your network and try again.');
      } else {
        setError('Failed to connect to the WREI platform. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async (retryMessage?: string) => {
    const messageToSend = retryMessage || inputMessage.trim();
    if (!messageToSend || !tradingState || isLoading) return;

    if (!retryMessage) {
      setInputMessage('');
    }
    setIsLoading(true);
    setError(null);
    setLastFailedMessage(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          state: tradingState,
          isOpening: false,
          instrumentType: selectedInstrument,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        setError(data.error);
        setLastFailedMessage(messageToSend);
      } else {
        setTradingState(data.state);
        setCurrentClassification(data.classification);
        setCurrentEmotion(data.emotionalState);
        setThreatLevel(data.threatLevel);

        // Save to history if trading just completed
        if (data.state.negotiationComplete && tradingStartTime) {
          saveCompletedTrading(data.state);

          // P1.7: Record agreed trade to DB + blotter
          if (data.state.outcome === 'agreed') {
            const tradeRecord: BlotterTrade = {
              id: `TRD-${Date.now().toString(36).toUpperCase()}`,
              instrument_id: selectedInstrument,
              negotiation_id: null,
              direction: 'sell',
              quantity: data.state.buyerProfile?.volumeInterest ?? 1000,
              price_per_unit: data.state.currentOfferPrice,
              total_value: data.state.currentOfferPrice * (data.state.buyerProfile?.volumeInterest ?? 1000),
              currency: selectedInstrument.startsWith('WREI') ? 'USD' : 'AUD',
              buyer_persona: selectedPersona,
              status: 'confirmed',
              executed_at: new Date().toISOString(),
              settled_at: null,
            };
            setBlotterTrades(prev => [tradeRecord, ...prev]);

            // Persist to DB (fire-and-forget)
            fetch('/api/trades', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instrument_id: tradeRecord.instrument_id,
                direction: tradeRecord.direction,
                quantity: tradeRecord.quantity,
                price_per_unit: tradeRecord.price_per_unit,
                currency: tradeRecord.currency,
                buyer_persona: tradeRecord.buyer_persona,
                metadata: { source: 'negotiation', instrument: selectedInstrument },
              }),
            }).catch(() => { /* DB unavailable — local blotter still shows trade */ });
          }

          // Calculate and display trading scorecard
          if (selectedPersona !== 'freeplay') {
            // Estimate duration (roughly 2 minutes per round)
            const durationMinutes = data.state.round * 2;
            const scorecard = calculateNegotiationScore(data.state, selectedPersona as PersonaType, durationMinutes);
            setTradingScorecard(scorecard);
            setShowScorecard(true);
          }
        }

        // Update strategy explanation for institutional investors
        if (data.strategyExplanation) {
          setCurrentStrategyExplanation(data.strategyExplanation);
        }
      }
    } catch (err) {
      setLastFailedMessage(messageToSend);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Message timeout. Please check your network connection.');
      } else {
        setError('Failed to send message. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!tradingStarted) {
        handleStartTrading();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleEndTrading = async () => {
    if (!tradingState || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to end this trade for now.',
          state: tradingState,
          isOpening: false,
          instrumentType: selectedInstrument,
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        const finalState = {
          ...data.state,
          negotiationComplete: true,
          outcome: 'deferred' as const
        };
        setTradingState(finalState);
        saveCompletedTrading(finalState);
      }
    } catch (err) {
      setError('Failed to end trade properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHuman = async () => {
    if (!tradingState || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to speak with a human representative.',
          state: tradingState,
          isOpening: false,
          instrumentType: selectedInstrument,
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        const finalState = {
          ...data.state,
          negotiationComplete: true,
          outcome: 'escalated' as const
        };
        setTradingState(finalState);
        saveCompletedTrading(finalState);
      }
    } catch (err) {
      setError('Failed to request human representative.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetTrading = () => {
    // Reset all state to start fresh
    setTradingStarted(false);
    setTradingState(null);
    setInputMessage('');
    setError(null);
    setCurrentClassification('general');
    setCurrentEmotion('neutral');
    setThreatLevel('none');
    setIsInitializing(false);
    setLastFailedMessage(null);

    // Reset scorecard state
    setTradingScorecard(null);
    setShowScorecard(false);
    setTradingStartTime(null);
    // Note: selectedPersona and selectedCreditType can be changed again after reset
  };

  // A1: Trading History Management
  const saveCompletedTrading = (finalState: NegotiationState) => {
    if (!tradingStartTime) return;

    const sessionId = addNegotiationSession({
      persona: selectedPersona,
      startTime: tradingStartTime,
      endTime: new Date().toISOString(),
      messages: finalState.messages,
      finalState,
      outcome: finalState.outcome
    });

    // Update the local sessions list
    const updatedSessions = getAllNegotiationSessions();
    setTradingSessions(updatedSessions);

    return sessionId;
  };

  const refreshSessionsList = () => {
    const sessions = getAllNegotiationSessions();
    setTradingSessions(sessions);
  };

  const handleSessionComparison = (sessionIds: string[]) => {
    if (sessionIds.length === 2) {
      const comparison = compareNegotiationSessions(sessionIds[0], sessionIds[1]);
      setSessionComparison(comparison);
    }
  };

  const handleViewReplay = (session: NegotiationSession) => {
    setSelectedSession(session);
    setShowReplayViewer(true);
  };

  const closeReplayViewer = () => {
    setShowReplayViewer(false);
    setSelectedSession(null);
  };

  const closeComparisonDashboard = () => {
    setShowComparisonDashboard(false);
    setSessionComparison(null);
  };

  // Phase 6.2: Professional Interface Handlers
  const handleInvestmentDecision = async (decision: any) => {
    console.log('Investment decision:', decision);

    // In production, this would integrate with backend systems
    if (decision.decision === 'proceed') {
      alert(`Investment proceeding: ${decision.tokenType} - A$${(decision.investmentSize / 1_000_000).toFixed(1)}M`);
    } else if (decision.decision === 'review') {
      alert('Investment review scheduled - institutional team will contact within 24 hours');
    }
  };

  const generateReportData = (): ReportData => {
    const tokenType = selectedWREITokenType;
    const expectedReturn = tokenType === 'carbon_credits' ? 0.08 :
                          tokenType === 'asset_co' ? 0.283 : 0.185;
    const volatility = tokenType === 'carbon_credits' ? 0.25 :
                      tokenType === 'asset_co' ? 0.12 : 0.15;

    // Map persona to risk tolerance for new function signature
    const getRiskTolerance = (persona: PersonaType | 'freeplay'): 'conservative' | 'moderate' | 'aggressive' => {
      const riskMap: Record<string, 'conservative' | 'moderate' | 'aggressive'> = {
        infrastructure_fund: 'moderate',
        family_office: 'conservative',
        esg_impact_investor: 'moderate',
        pension_fund: 'conservative',
        sovereign_wealth: 'aggressive',
        insurance_company: 'conservative'
      };
      return riskMap[persona] || 'moderate';
    };

    const professionalMetrics = calculateProfessionalMetrics(
      investmentSize, // portfolioValue
      selectedPersona as PersonaType, // persona
      timeHorizon, // timeHorizon
      getRiskTolerance(selectedPersona) // riskTolerance
    );

    const scenarioAnalysis = generateScenarioAnalysis(
      tokenType,
      investmentSize,
      timeHorizon,
      expectedReturn,
      volatility,
      investorClassification
    );

    return {
      investmentSummary: {
        tokenType,
        investmentAmount: investmentSize,
        timeHorizon,
        expectedReturn,
        riskLevel: investorClassification
      },
      professionalMetrics,
      scenarioAnalysis,
      chartData: {
        performanceChart: [],
        riskReturnScatter: [],
        allocationPie: [],
        drawdownChart: [],
        rollingReturns: [],
        correlationHeatmap: []
      },
      complianceData: {
        regulatoryStatus: 'Australian AFSL 534187',
        disclosures: [
          'Investment values may fall as well as rise',
          'Past performance is not indicative of future results',
          'Carbon credit values subject to regulatory changes'
        ],
        riskWarnings: [
          'Technology and counterparty risks apply',
          'Liquidity may be limited in secondary markets',
          'Regulatory environment may change'
        ],
        taxImplications: [
          'Income treatment for revenue share mechanism',
          'CGT treatment for NAV-accruing mechanism',
          'Franking credits may be available'
        ]
      },
      marketData: {
        benchmarkComparisons: professionalMetrics.benchmarkOutperformance,
        competitivePositioning: [
          'Native digital carbon credits with T+0 settlement',
          'Asset-backed yield from real infrastructure',
          'Cross-collateral capability up to 90% LTV'
        ],
        marketTrends: [
          'A$155B carbon market projected by 2030',
          'A$19B tokenized RWA market growth',
          'Increasing institutional adoption'
        ]
      },
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      reportVersion: '6.2.0'
    };
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv' | 'json') => {
    try {
      const reportData = generateReportData();
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
          organization: selectedPersonaData?.name || 'Investment Organization',
          classification: investorClassification
        }
      };

      const result = await exportReport(reportData, options);

      if (result.success && result.downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = `WREI_Analysis_${format.toUpperCase()}_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'html' : format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setShowExportOptions(false);
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedPersonaData = selectedPersona !== 'freeplay' ? getPersonaById(selectedPersona) : null;

  const getPriceRangePercent = () => {
    if (!tradingState) return 50;

    const tokenType = tradingState.wreiTokenType || 'carbon_credits';

    if (tokenType === 'asset_co') {
      // For Asset Co tokens, show yield range (20% to 30%)
      const minYield = 20;
      const maxYield = 30;
      const range = maxYield - minYield;
      const position = tradingState.currentOfferPrice - minYield;
      return Math.max(0, Math.min(100, (position / range) * 100));
    } else if (tokenType === 'dual_portfolio') {
      // For dual portfolio, show balanced position
      return 50;
    } else {
      // Use WREI document pricing for carbon credits
      const basePrice = WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_PRICE;
      const anchorPrice = WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE;
      const range = anchorPrice - basePrice;
      const position = tradingState.currentOfferPrice - basePrice;
      return Math.max(0, Math.min(100, (position / range) * 100));
    }
  };

  const getConcessionPercent = () => {
    if (!tradingState) return 0;
    const tokenType = tradingState.wreiTokenType || 'carbon_credits';

    if (tokenType === 'asset_co') {
      // For Asset Co, calculate based on yield concession from anchor yield
      const anchorYield = WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 100;
      return Math.round((tradingState.totalConcessionGiven / anchorYield) * 100);
    } else if (tokenType === 'dual_portfolio') {
      // For dual portfolio, show blended concession
      return Math.round((tradingState.totalConcessionGiven / tradingState.anchorPrice) * 100);
    } else {
      // For carbon credits, use WREI anchor price
      return Math.round((tradingState.totalConcessionGiven / WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE) * 100);
    }
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* B4: Pre-configuration Banner */}
      {isPreConfigured && preConfigMessage && !tradingStarted && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-4 mb-4 text-white">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="bloomberg-card-title">Institutional Profile Configured</h3>
                <p className="text-green-100 bloomberg-small-text">{preConfigMessage}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phase 6.2: Professional Pathway Selector */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="bloomberg-large-metric mb-2">
WREI Investment Platform • Phase 6.2 Professional Interface
              </h2>
              <p className="text-blue-100">
                Choose your investment pathway: Standard negotiation or professional institutional interface
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setInterfaceMode('standard')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  interfaceMode === 'standard'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
Standard Negotiation
              </button>
              <button
                onClick={() => setInterfaceMode('professional')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  interfaceMode === 'professional'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
Professional Interface
              </button>
              {interfaceMode === 'professional' && (
                <button
                  onClick={() => setShowExportOptions(!showExportOptions)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all flex items-center space-x-2"
                >
                  <span>📄</span>
                  <span>Export</span>
                </button>
              )}
            </div>
          </div>

          {/* B5: Enhanced Export Modal */}
          <ExportModal
            isOpen={showExportOptions && interfaceMode === 'professional'}
            onClose={() => setShowExportOptions(false)}
            reportData={generateReportData()}
            recipientName="Professional Investor"
            recipientOrganization={selectedPersonaData?.name || 'Investment Organisation'}
            recipientClassification={investorClassification}
          />
        </div>
      </div>

      {/* Professional Interface */}
      {interfaceMode === 'professional' ? (
        <ProfessionalInterface
          investorProfile={{
            type: selectedPersona as PersonaType,
            classification: investorClassification,
            aum: (() => {
              const aumMap: Record<string, number> = {
                infrastructure_fund: 5_000_000_000,
                esg_impact: 1_000_000_000,
                defi_farmer: 2_000_000_000,
                family_office: 2_500_000_000,
                sovereign_wealth: 230_000_000_000,
                pension_fund: 300_000_000_000
              };
              return aumMap[selectedPersona] || 5_000_000_000;
            })(),
            riskTolerance: (() => {
              const riskMap: Record<string, 'conservative' | 'moderate' | 'aggressive'> = {
                infrastructure_fund: 'moderate',
                esg_impact: 'moderate',
                defi_farmer: 'aggressive',
                family_office: 'conservative',
                sovereign_wealth: 'conservative',
                pension_fund: 'conservative'
              };
              return riskMap[selectedPersona] || 'moderate';
            })(),
            yieldRequirement: (() => {
              const yieldMap: Record<string, number> = {
                infrastructure_fund: 0.12,
                esg_impact: 0.10,
                defi_farmer: 0.15,
                family_office: 0.08,
                sovereign_wealth: 0.08,
                pension_fund: 0.09
              };
              return yieldMap[selectedPersona] || 0.10;
            })(),
            liquidityNeeds: 'quarterly'
          }}
          portfolioAllocation={{
            carbonCredits: selectedWREITokenType === 'carbon_credits' ? 1.0 : 0.3,
            assetCoTokens: selectedWREITokenType === 'asset_co' ? 1.0 : 0.4,
            dualPortfolio: selectedWREITokenType === 'dual_portfolio' ? 1.0 : 0.3
          }}
          investmentSize={investmentSize}
          timeHorizon={timeHorizon}
          onInvestmentDecision={handleInvestmentDecision}
        />
      ) : (
        <>
          {/* Main Layout */}
          <div className="max-w-7xl mx-auto p-4">
            <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]">

          {/* Left Panel */}
          <div className="lg:w-1/3 space-y-6 order-2 lg:order-1">

            {/* P1.3: Instrument Switcher */}
            <InstrumentSwitcher
              selectedInstrument={selectedInstrument}
              onInstrumentChange={handleInstrumentChange}
            />

            {/* P1.6: Order Book */}
            <OrderBookPanel
              instrumentType={selectedInstrument}
              spotPrice={instrumentPricing?.currentSpot}
            />

            {/* WREI Token Type Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Select WREI Investment Product</h3>

              <div className="space-y-4">
                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    value="carbon_credits"
                    checked={selectedWREITokenType === 'carbon_credits'}
                    onChange={(e) => handleWREITokenTypeChange(e.target.value as WREITokenType)}
                    disabled={tradingStarted}
                    className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
                  />
                  <div className="flex-1">
                    <div className=" text-[#1E293B] border-l-4 border-green-500 pl-3">WREI Carbon Credit Tokens</div>
                    <div className="bloomberg-body-text font-medium text-green-600 mt-1">A${WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE}/tonne</div>
                    <div className="bloomberg-small-text text-[#64748B] mt-1">
                      Native digital carbon credits • Triple-standard verification • 3.12M-13.1M supply projection
                    </div>
                    <div className="bloomberg-section-label text-[#64748B] mt-2">
                      <span className="font-medium">Base Case:</span> A${Math.round(WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_CASE.TOTAL_REVENUE / 1_000_000)}M revenue •
                      <span className="font-medium"> Expansion:</span> A${Math.round(WREI_TOKEN_CONFIG.CARBON_CREDITS.EXPANSION_CASE.TOTAL_REVENUE / 1_000_000)}M revenue
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    value="asset_co"
                    checked={selectedWREITokenType === 'asset_co'}
                    onChange={(e) => handleWREITokenTypeChange(e.target.value as WREITokenType)}
                    disabled={tradingStarted}
                    className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
                  />
                  <div className="flex-1">
                    <div className=" text-[#1E293B] border-l-4 border-blue-500 pl-3">WREI Asset Co Tokens</div>
                    <div className="bloomberg-body-text font-medium text-blue-600 mt-1">{(WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.EQUITY_YIELD * 100).toFixed(1)}% Infrastructure Yield</div>
                    <div className="bloomberg-small-text text-[#64748B] mt-1">
                      Fractional vessel fleet ownership • Predictable lease income • A${Math.round(WREI_TOKEN_CONFIG.ASSET_CO.TOKEN_EQUITY / 1_000_000)}M equity cap
                    </div>
                    <div className="bloomberg-section-label text-[#64748B] mt-2">
                      <span className="font-medium">Fleet:</span> {WREI_TOKEN_CONFIG.ASSET_CO.FLEET.VESSEL_COUNT} vessels + {WREI_TOKEN_CONFIG.ASSET_CO.FLEET.DEEP_POWER_UNITS} Deep Power •
                      <span className="font-medium"> Cash Flow:</span> A${Math.round(WREI_TOKEN_CONFIG.ASSET_CO.STEADY_STATE.NET_CASH_FLOW / 1_000_000)}M annually
                    </div>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-[#0EA5E9] hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    value="dual_portfolio"
                    checked={selectedWREITokenType === 'dual_portfolio'}
                    onChange={(e) => handleWREITokenTypeChange(e.target.value as WREITokenType)}
                    disabled={tradingStarted}
                    className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2 mt-1"
                  />
                  <div className="flex-1">
                    <div className=" text-[#1E293B] border-l-4 border-purple-500 pl-3">WREI Dual Token Portfolio</div>
                    <div className="bloomberg-body-text font-medium text-purple-600 mt-1">Diversified Strategy</div>
                    <div className="bloomberg-small-text text-[#64748B] mt-1">
                      Carbon Credits + Asset Co • Risk diversification • Cross-collateralization opportunities
                    </div>
                    <div className="bloomberg-section-label text-[#64748B] mt-2">
                      <span className="font-medium">Yield Stability:</span> Infrastructure income + carbon upside •
                      <span className="font-medium"> DeFi Ready:</span> Use Asset Co as collateral
                    </div>
                  </div>
                </label>
              </div>

              {tradingStarted && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg bloomberg-small-text text-gray-600">
                  Investment product locked
                </div>
              )}
            </div>

            {/* Persona Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-demo="persona-selector">
              <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Select Buyer Persona</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="freeplay"
                    checked={selectedPersona === 'freeplay'}
                    onChange={(e) => handlePersonaChange(e.target.value as 'freeplay')}
                    disabled={tradingStarted}
                    className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1E293B]">Free Play</div>
                    <div className="bloomberg-small-text text-[#64748B]">Negotiate naturally</div>
                  </div>
                </label>

                {PERSONA_DEFINITIONS.map((persona) => (
                  <label key={persona.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value={persona.id}
                      checked={selectedPersona === persona.id}
                      onChange={(e) => handlePersonaChange(e.target.value as PersonaType)}
                      disabled={tradingStarted}
                      className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#1E293B]">{persona.name}</div>
                      <div className="bloomberg-small-text text-[#64748B]">{persona.title}</div>
                      <div className="bloomberg-section-label text-[#64748B]">{persona.organisation}</div>
                    </div>
                  </label>
                ))}
              </div>

              {tradingStarted && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="bloomberg-small-text text-gray-600">Persona locked</span>
                    <button
                      onClick={handleResetTrading}
                      disabled={isLoading}
                      className="bloomberg-section-label text-[#0EA5E9] hover:text-[#0284C7] font-medium disabled:opacity-50"
                    >
                      Start New
                    </button>
                  </div>
                </div>
              )}

              {/* Persona Briefing */}
              {selectedPersonaData && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className=" text-amber-800 mb-2">YOUR ROLE</div>
                  <p className="bloomberg-small-text text-amber-700 mb-3">{selectedPersonaData.briefing}</p>
                  <div className="grid grid-cols-3 gap-2 bloomberg-section-label">
                    <div>
                      <div className="font-medium text-amber-800">Budget</div>
                      <div className="text-amber-700">{selectedPersonaData.budgetRange}</div>
                    </div>
                    <div>
                      <div className="font-medium text-amber-800">Volume</div>
                      <div className="text-amber-700">{selectedPersonaData.volumeTarget}</div>
                    </div>
                    <div>
                      <div className="font-medium text-amber-800">Patience</div>
                      <div className="text-amber-700">{selectedPersonaData.patience}/10</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dashboard */}
            {tradingState && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6" data-demo="pricing-analysis">
                <h3 className="bloomberg-card-title text-[#1E293B] mb-4">Negotiation Dashboard</h3>

                {/* Round & Phase */}
                <div className="flex items-center justify-between mb-4">
                  <span className="bloomberg-small-text font-medium text-[#1E293B]">
                    Round {tradingState.round}
                  </span>
                  <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${phaseColors[tradingState.phase]}`}>
                    {tradingState.phase.charAt(0).toUpperCase() + tradingState.phase.slice(1)}
                  </span>
                </div>

                {/* Price Tracker */}
                <div className="mb-4">
                  <div className="flex justify-between bloomberg-small-text mb-2">
                    <span className="text-[#64748B]">Agent&apos;s offer:</span>
                    <span className="font-medium text-[#1E293B]">
                      {(() => {
                        const tokenType = tradingState.wreiTokenType || 'carbon_credits';
                        if (tokenType === 'asset_co') {
                          return `${tradingState.currentOfferPrice.toFixed(1)}% yield`;
                        } else if (tokenType === 'dual_portfolio') {
                          return 'Portfolio terms';
                        } else if (tradingState.creditType === 'esc') {
                          return `AUD $${tradingState.currentOfferPrice}/ESC`;
                        } else {
                          return `A$${tradingState.currentOfferPrice}/tonne`;
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between bloomberg-small-text mb-3">
                    <span className="text-[#64748B]">Your anchor:</span>
                    <span className="font-medium text-[#1E293B]">
                      {tradingState.buyerProfile.priceAnchor ? (
                        (() => {
                          const tokenType = tradingState.wreiTokenType || 'carbon_credits';
                          if (tokenType === 'asset_co') {
                            return `${tradingState.buyerProfile.priceAnchor}% yield`;
                          } else {
                            return `A$${tradingState.buyerProfile.priceAnchor}/${tradingState.creditType === 'esc' ? 'ESC' : 't'}`;
                          }
                        })()
                      ) : '—'}
                    </span>
                  </div>

                  {/* Price Range Visual */}
                  <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="absolute h-2 bg-[#0EA5E9] rounded-full transition-all duration-500"
                      style={{ width: `${getPriceRangePercent()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between bloomberg-section-label text-[#64748B]">
                    <span>
                      {(() => {
                        const tokenType = tradingState.wreiTokenType || 'carbon_credits';
                        if (tokenType === 'asset_co') {
                          return '20% yield';
                        } else if (tokenType === 'dual_portfolio') {
                          return 'Conservative';
                        } else {
                          return `A$${WREI_TOKEN_CONFIG.CARBON_CREDITS.BASE_PRICE}`;
                        }
                      })()}
                    </span>
                    <span>
                      {(() => {
                        const tokenType = tradingState.wreiTokenType || 'carbon_credits';
                        if (tokenType === 'asset_co') {
                          return '30% yield';
                        } else if (tokenType === 'dual_portfolio') {
                          return 'Aggressive';
                        } else {
                          return `A$${WREI_TOKEN_CONFIG.CARBON_CREDITS.ANCHOR_PRICE}`;
                        }
                      })()}
                    </span>
                  </div>
                </div>

                {/* Concession Tracker */}
                <div className="mb-4">
                  <div className="bloomberg-small-text text-[#64748B] mb-1">
                    Agent has adjusted {getConcessionPercent()}% from opening {
                      tradingState.wreiTokenType === 'asset_co' ? 'yield' : 'price'
                    }
                  </div>
                </div>

                {/* Market Intelligence Context (Phase 5.1) */}
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-slate-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <h4 className="bloomberg-small-text  text-[#1E293B]">Market Intelligence</h4>
                  </div>
                  <div className="bloomberg-section-label text-[#64748B] space-y-2">
                    {tradingState.wreiTokenType === 'carbon_credits' && (
                      <div>
                        <div className="font-medium text-[#1E293B] mb-1">Carbon Market Context:</div>
                        <div>• A$155B projected market by 2030 (26% CAGR)</div>
                        <div>• WREI 8-12% yield vs. USYC 4.5% (+23% premium)</div>
                        <div>• Triple-standard verification vs. Kinexys trading-only</div>
                      </div>
                    )}
                    {tradingState.wreiTokenType === 'asset_co' && (
                      <div>
                        <div className="font-medium text-[#1E293B] mb-1">Infrastructure Market Context:</div>
                        <div>• 28.3% yield vs. Infrastructure REITs 8-12%</div>
                        <div>• Maritime infrastructure: underrepresented asset class</div>
                        <div>• Tokenized liquidity vs. traditional 7-10 year lock-ups</div>
                      </div>
                    )}
                    {tradingState.wreiTokenType === 'dual_portfolio' && (
                      <div>
                        <div className="font-medium text-[#1E293B] mb-1">Dual Market Strategy:</div>
                        <div>• A$19B RWA + A$155B carbon market exposure</div>
                        <div>• 15% correlation benefit vs. single-asset exposure</div>
                        <div>• Cross-collateral capability: 90% LTV</div>
                      </div>
                    )}
                    <div className="pt-1 border-t border-blue-200">
                      <span className="text-blue-600 bloomberg-section-label">💡 Market data updated real-time</span>
                    </div>
                  </div>
                </div>

                {/* Classification & Emotion */}
                {tradingState.messages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between bloomberg-small-text">
                      <span className="text-[#64748B]">Your approach:</span>
                      <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${classificationColors[currentClassification]}`}>
                        {currentClassification.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between bloomberg-small-text">
                      <span className="text-[#64748B]">Your tone:</span>
                      <span className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${emotionalColors[currentEmotion]}`}>
                        {currentEmotion}
                      </span>
                    </div>

                    {/* Warmth & Dominance */}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="flex justify-between bloomberg-section-label mb-1">
                          <span className="text-[#64748B]">Warmth</span>
                          <span className="text-[#1E293B]">{tradingState.buyerProfile.detectedWarmth}/10</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-green-500 rounded transition-all duration-500"
                            style={{ width: `${tradingState.buyerProfile.detectedWarmth * 10}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between bloomberg-section-label mb-1">
                          <span className="text-[#64748B]">Dominance</span>
                          <span className="text-[#1E293B]">{tradingState.buyerProfile.detectedDominance}/10</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-blue-500 rounded transition-all duration-500"
                            style={{ width: `${tradingState.buyerProfile.detectedDominance * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Threat Indicator */}
                {threatLevel !== 'none' && (
                  <div className={`mt-4 p-2 rounded-lg flex items-center space-x-2 ${
                    threatLevel === 'high' ? 'bg-red-50 text-red-700' :
                    threatLevel === 'medium' ? 'bg-amber-50 text-amber-700' :
                    'bg-yellow-50 text-yellow-700'
                  }`}>
                    <span className="bloomberg-small-text">⚠</span>
                    <span className="bloomberg-section-label font-medium">
                      Unusual negotiation pattern detected
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Token Metadata Panel */}
            {tradingState?.tokenMetadata && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="bloomberg-card-title text-[#1E293B] mb-4 flex items-center">
                  <span className="bg-[#0EA5E9] w-2 h-2 rounded-full mr-2"></span>
                  Token Metadata & Transparency
                </h3>

                {/* Provenance Section */}
                {tradingState.tokenMetadata.immutableProvenance && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="bloomberg-small-text font-medium text-[#1E293B] mb-2">🔗 Immutable Provenance</h4>
                    <div className="bloomberg-section-label text-[#64748B] space-y-1">
                      <div className="flex justify-between">
                        <span>Provenance ID:</span>
                        <span className="bloomberg-data text-[#0EA5E9]">
                          {tradingState.tokenMetadata.provenanceId?.slice(0, 12)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Chain Steps:</span>
                        <span className="text-[#10B981] font-medium">
                          {tradingState.tokenMetadata.immutableProvenance.provenanceChain?.length || 0} verified
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Integrity:</span>
                        <span className="text-[#10B981] font-medium">✓ Verified</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => setShowBlockchainProvenance(!showBlockchainProvenance)}
                        className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg bloomberg-small-text font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <span>🔍</span>
                        <span>{showBlockchainProvenance ? 'Hide' : 'View'} Blockchain Verification</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Operational Data Section */}
                {tradingState.tokenMetadata.operationalData && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="bloomberg-small-text font-medium text-[#1E293B] mb-2">⚙️ Real-time Operations</h4>
                    <div className="bloomberg-section-label text-[#64748B] space-y-1">
                      <div className="flex justify-between">
                        <span>Vessel ID:</span>
                        <span className="bloomberg-data text-[#0EA5E9]">
                          {tradingState.tokenMetadata.operationalData.vesselId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="text-[#10B981] font-medium">
                          {tradingState.tokenMetadata.operationalData.efficiency.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carbon Generated:</span>
                        <span className="text-[#0EA5E9] font-medium">
                          {tradingState.tokenMetadata.operationalData.carbonGeneration.toFixed(1)} tonnes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="text-[#64748B]">
                          {new Date(tradingState.tokenMetadata.operationalData.lastTelemetryUpdate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Blockchain Provenance Visualiser */}
                {showBlockchainProvenance && (
                  <div className="mb-6 space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                      <h4 className="bloomberg-small-text  text-slate-800 mb-3 flex items-center space-x-2">
                        <span>🔗</span>
                        <span>Blockchain Provenance Chain</span>
                      </h4>
                      <ProvenanceChain
                        creditId={`WREI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`}
                        className="mb-4"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="bloomberg-small-text  text-slate-800 mb-3 flex items-center space-x-2">
                          <span>🔍</span>
                          <span>Merkle Tree Verification</span>
                        </h4>
                        <MerkleTreeView
                          creditId={`WREI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`}
                        />
                      </div>

                      <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="bloomberg-small-text  text-slate-800 mb-3 flex items-center space-x-2">
                          <span>🚤</span>
                          <span>Vessel Provenance Data</span>
                        </h4>
                        <VesselProvenanceCard
                          creditId={`WREI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`}
                          compact={true}
                          onViewProvenanceChain={() => {
                            // Scroll to provenance chain section
                            document.querySelector('.provenance-chain')?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start'
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Environmental Impact Section */}
                {tradingState.tokenMetadata.environmentalImpact && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="bloomberg-small-text font-medium text-[#1E293B] mb-2">Environmental Impact</h4>
                    <div className="bloomberg-section-label text-[#64748B] space-y-1">
                      <div className="flex justify-between">
                        <span>Total CO₂ Reduced:</span>
                        <span className="text-[#10B981] font-medium">
                          {tradingState.tokenMetadata.environmentalImpact.totalCO2Reduced.toFixed(1)} tonnes
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Modal Shift Benefit:</span>
                        <span className="text-[#0EA5E9] font-medium">
                          {tradingState.tokenMetadata.environmentalImpact.modalShiftBenefit.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sustainability Score:</span>
                        <span className="text-[#10B981] font-medium">
                          {tradingState.tokenMetadata.environmentalImpact.sustainabilityScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification:</span>
                        <span className={tradingState.tokenMetadata.environmentalImpact.verified ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                          {tradingState.tokenMetadata.environmentalImpact.verified ? '✓ Verified' : '⚠ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lease Payment Data (Asset Co only) */}
                {tradingState.wreiTokenType === 'asset_co' && tradingState.tokenMetadata.leasePaymentData && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="bloomberg-small-text font-medium text-[#1E293B] mb-2">💰 Asset Co Token & Lease Data</h4>
                    <div className="bloomberg-section-label text-[#64748B] space-y-1">
                      <div className="flex justify-between">
                        <span>Token Price:</span>
                        <span className="text-[#0EA5E9] font-medium">
                          {(tradingState.tokenMetadata.leasePaymentData as any).tokenPrice ?
                            `A$${(tradingState.tokenMetadata.leasePaymentData as any).tokenPrice.toLocaleString()}` :
                            'A$1,000/token'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Annual Income:</span>
                        <span className="text-[#0EA5E9] font-medium">
                          A${tradingState.tokenMetadata.leasePaymentData.expectedAnnualIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yield Performance:</span>
                        <span className="text-[#10B981] font-medium">
                          {(tradingState.tokenMetadata.leasePaymentData.yieldPerformance * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Income Consistency:</span>
                        <span className="text-[#10B981] font-medium">
                          {(tradingState.tokenMetadata.leasePaymentData.incomeConsistency * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dividend Mechanism:</span>
                        <span className="text-[#64748B]">
                          {(tradingState.tokenMetadata.leasePaymentData as any).dividendMechanism?.replace('_', ' ') || 'Quarterly'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Smart Contract:</span>
                        <span className="bloomberg-data text-[#0EA5E9] bloomberg-section-label">
                          {(tradingState.tokenMetadata.leasePaymentData as any).smartContractAddress?.slice(0, 10) || '0x1234567890'}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Verified:</span>
                        <span className="text-[#64748B]">
                          {new Date(tradingState.tokenMetadata.leasePaymentData.lastPaymentVerified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quality Metrics */}
                {tradingState.tokenMetadata.qualityMetrics && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="bloomberg-small-text font-medium text-[#1E293B] mb-2">Data Quality Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 bloomberg-section-label">
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Completeness:</span>
                        <span className="text-[#10B981] font-medium">
                          {(tradingState.tokenMetadata.qualityMetrics.completeness * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Accuracy:</span>
                        <span className="text-[#10B981] font-medium">
                          {(tradingState.tokenMetadata.qualityMetrics.accuracy * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Freshness:</span>
                        <span className="text-[#0EA5E9] font-medium">
                          {(tradingState.tokenMetadata.qualityMetrics.dataFreshness * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#64748B]">Integrity:</span>
                        <span className="text-[#10B981] font-medium">
                          {(tradingState.tokenMetadata.qualityMetrics.integrityScore * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Overall Score Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between bloomberg-section-label mb-1">
                        <span className="text-[#64748B]">Overall Quality Score</span>
                        <span className="text-[#1E293B] font-medium">
                          {(((tradingState.tokenMetadata.qualityMetrics.completeness +
                             tradingState.tokenMetadata.qualityMetrics.accuracy +
                             tradingState.tokenMetadata.qualityMetrics.dataFreshness +
                             tradingState.tokenMetadata.qualityMetrics.integrityScore) / 4) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-gradient-to-r from-[#0EA5E9] to-[#10B981] rounded-full transition-all duration-500"
                          style={{
                            width: `${((tradingState.tokenMetadata.qualityMetrics.completeness +
                                       tradingState.tokenMetadata.qualityMetrics.accuracy +
                                       tradingState.tokenMetadata.qualityMetrics.dataFreshness +
                                       tradingState.tokenMetadata.qualityMetrics.integrityScore) / 4) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:w-2/3 flex flex-col order-1 lg:order-2" data-demo="trading-interface">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[60vh] lg:min-h-0" role="main" aria-label="Carbon credit trading chat" data-demo="trading-chat">

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4" role="log" aria-live="polite" aria-label="Trading messages">
                {!tradingStarted ? (
                  <div className="text-center py-12">
                    {isInitializing ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9] mx-auto mb-4"></div>
                        <h3 className="bloomberg-metric-value text-[#1E293B] mb-2">
                          Connecting to WREI Platform...
                        </h3>
                        <p className="text-[#64748B]">
                          Initialising AI negotiation agent
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="bloomberg-metric-value text-[#1E293B] mb-4">
                          Ready to Begin Negotiation
                        </h3>
                        <p className="text-[#64748B] mb-6">
                          Click &quot;Start Negotiation&quot; to begin your WREI carbon credit negotiation session.
                        </p>
                        <button
                          onClick={handleStartTrading}
                          disabled={isLoading}
                          className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Starting...' : 'Start Trading'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {tradingState?.messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'buyer'
                            ? 'bg-[#E2E8F0] text-[#1E293B]'
                            : 'bg-[#0EA5E9] text-white'
                        }`}>
                          <div className="bloomberg-small-text md:bloomberg-body-text whitespace-pre-wrap prose prose-sm max-w-none"
                               dangerouslySetInnerHTML={{
                                 __html: message.content
                                   .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                   .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                   .replace(/^- (.+)$/gm, '• $1')
                                   .replace(/^\* (.+)$/gm, '• $1')
                                   .replace(/\n/g, '<br>')
                               }}
                          />
                          <div className={`bloomberg-section-label mt-2 ${
                            message.role === 'buyer' ? 'text-[#64748B]' : 'text-blue-100'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[#0EA5E9] text-white rounded-lg p-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 bloomberg-small-text">
                  <div className="flex items-center justify-between">
                    <span>{error}</span>
                    <div className="flex space-x-2 ml-3">
                      {lastFailedMessage && (
                        <button
                          onClick={() => handleSendMessage(lastFailedMessage)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                        >
                          Retry
                        </button>
                      )}
                      <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Completion States */}
              {tradingState?.negotiationComplete && (
                <div className="mx-6 mb-4">
                  {tradingState.outcome === 'agreed' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="">Negotiation Complete — Terms Agreed</div>
                          <div className="bloomberg-small-text mt-1">
                            Final price: ${tradingState.currentOfferPrice}/t
                          </div>
                        </div>
                        <button
                          onClick={handleResetTrading}
                          className="bg-green-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-green-800 transition-colors"
                        >
                          Start New Negotiation
                        </button>
                      </div>
                    </div>
                  )}
                  {tradingState.outcome === 'deferred' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="">Negotiation Paused — Follow-up Scheduled</div>
                          <div className="bloomberg-small-text mt-1">
                            Thank you for your interest. We&apos;ll follow up with additional options.
                          </div>
                        </div>
                        <button
                          onClick={handleResetTrading}
                          className="bg-amber-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-amber-800 transition-colors"
                        >
                          Start New Negotiation
                        </button>
                      </div>
                    </div>
                  )}
                  {tradingState.outcome === 'escalated' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="">Connecting with Water Roads Team</div>
                          <div className="bloomberg-small-text mt-1">
                            Contact: trading@waterroads.com.au | +61 3 8456 7890
                          </div>
                        </div>
                        <button
                          onClick={handleResetTrading}
                          className="bg-blue-700 text-white px-3 py-1 rounded bloomberg-small-text font-medium hover:bg-blue-800 transition-colors"
                        >
                          Start New Negotiation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* A4: Trading Scorecard */}
              {showScorecard && tradingScorecard && selectedPersona !== 'freeplay' && (
                <div className="mx-6 mb-4">
                  <Scorecard
                    scorecard={tradingScorecard}
                    persona={selectedPersona as PersonaType}
                    onClose={() => setShowScorecard(false)}
                  />
                </div>
              )}

              {/* Analytics Panel */}
              {tradingState?.negotiationComplete && (
                <div className="mx-6 mb-4 bg-slate-50 rounded-lg border border-slate-200 p-6">
                  <h3 className="bloomberg-card-title text-[#1E293B] mb-6">Negotiation Analytics</h3>

                  {/* Summary Card */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="bloomberg-section-label font-medium text-[#64748B] mb-1">OUTCOME</div>
                      <div className={`inline-flex px-2 py-1 rounded-full bloomberg-section-label font-medium ${
                        tradingState.outcome === 'agreed' ? 'bg-green-100 text-green-800' :
                        tradingState.outcome === 'deferred' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tradingState.outcome ? tradingState.outcome.charAt(0).toUpperCase() + tradingState.outcome.slice(1) : 'In Progress'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="bloomberg-section-label font-medium text-[#64748B] mb-1">ROUNDS</div>
                      <div className="bloomberg-metric-value text-[#1E293B]">{tradingState.round}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="bloomberg-section-label font-medium text-[#64748B] mb-1">FINAL TERMS</div>
                      <div className="bloomberg-metric-value text-[#1E293B]">
                        {(() => {
                          const tokenType = tradingState.wreiTokenType || 'carbon_credits';
                          if (tokenType === 'asset_co') {
                            return `${tradingState.currentOfferPrice.toFixed(1)}%`;
                          } else if (tokenType === 'dual_portfolio') {
                            return 'Portfolio';
                          } else {
                            return `A$${tradingState.currentOfferPrice}/t`;
                          }
                        })()}
                      </div>
                      {tradingState.outcome === 'agreed' && (
                        <div className="bloomberg-section-label text-[#64748B] mt-1">
                          {Math.round(((tradingState.anchorPrice - tradingState.currentOfferPrice) / tradingState.anchorPrice) * 100)}%
                          {tradingState.wreiTokenType === 'asset_co' ? ' yield reduction' : ' discount'}
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="bloomberg-section-label font-medium text-[#64748B] mb-1">DURATION</div>
                      <div className="bloomberg-metric-value text-[#1E293B]">{tradingState.round * 2}min</div>
                      <div className="bloomberg-section-label text-[#64748B] mt-1">est.</div>
                    </div>
                  </div>

                  {/* Argument Distribution Chart */}
                  <div className="mb-6">
                    <h4 className="bloomberg-small-text  text-[#1E293B] mb-3">Argument Distribution</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      {(() => {
                        const argCounts = tradingState.argumentHistory.reduce((acc, arg) => {
                          acc[arg] = (acc[arg] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const maxCount = Math.max(...Object.values(argCounts));

                        return (
                          <div className="space-y-2">
                            {Object.entries(argCounts).map(([arg, count]) => (
                              <div key={arg} className="flex items-center">
                                <div className="w-24 bloomberg-section-label text-[#64748B] mr-3">
                                  {arg.replace('_', ' ')}
                                </div>
                                <div className="flex-1 relative">
                                  <div
                                    className={`h-4 rounded transition-all duration-500 ${classificationColors[arg as ArgumentClassification]}`}
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="w-8 bloomberg-section-label text-[#64748B] text-right ml-2">{count}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Price Movement Timeline */}
                  <div className="mb-6">
                    <h4 className="bloomberg-small-text  text-[#1E293B] mb-3">Price Movement</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      {(() => {
                        const pricePoints = tradingState.messages
                          .filter(msg => msg.role === 'agent')
                          .map((msg, index) => ({
                            round: index + 1,
                            price: tradingState.anchorPrice - (tradingState.totalConcessionGiven * (index + 1) / tradingState.messages.filter(m => m.role === 'agent').length)
                          }));

                        if (pricePoints.length === 0) return null;

                        const minPrice = NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
                        const maxPrice = NEGOTIATION_CONFIG.ANCHOR_PRICE;
                        const priceRange = maxPrice - minPrice;

                        return (
                          <div className="relative h-32">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 bloomberg-section-label text-[#64748B]">${maxPrice}</div>
                            <div className="absolute left-0 bottom-0 bloomberg-section-label text-[#64748B]">${minPrice}</div>

                            {/* Anchor price line */}
                            <div
                              className="absolute left-12 right-4 border-t border-dashed border-[#0EA5E9] opacity-50"
                              style={{ top: '0px' }}
                            ></div>
                            <div className="absolute right-4 -top-4 bloomberg-section-label text-[#0EA5E9]">Anchor (${NEGOTIATION_CONFIG.ANCHOR_PRICE})</div>

                            {/* Price line */}
                            <svg className="absolute left-12 top-0 w-full h-full" style={{ width: 'calc(100% - 3rem)' }}>
                              {pricePoints.map((point, index) => {
                                const x = (index / Math.max(pricePoints.length - 1, 1)) * 100;
                                const y = ((maxPrice - point.price) / priceRange) * 100;
                                const nextPoint = pricePoints[index + 1];

                                return (
                                  <g key={index}>
                                    <circle
                                      cx={`${x}%`}
                                      cy={`${y}%`}
                                      r="3"
                                      fill="#0EA5E9"
                                    />
                                    {nextPoint && (
                                      <line
                                        x1={`${x}%`}
                                        y1={`${y}%`}
                                        x2={`${((index + 1) / Math.max(pricePoints.length - 1, 1)) * 100}%`}
                                        y2={`${((maxPrice - nextPoint.price) / priceRange) * 100}%`}
                                        stroke="#0EA5E9"
                                        strokeWidth="2"
                                      />
                                    )}
                                  </g>
                                );
                              })}
                            </svg>

                            {/* X-axis labels */}
                            <div className="absolute bottom-0 left-12 right-4 flex justify-between bloomberg-section-label text-[#64748B]">
                              {pricePoints.map((_, index) => (
                                <span key={index}>R{index + 1}</span>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Emotional State Timeline */}
                  <div className="mb-6">
                    <h4 className="bloomberg-small-text  text-[#1E293B] mb-3">Emotional Journey</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex space-x-1">
                        {tradingState.messages
                          .filter(msg => msg.role === 'buyer')
                          .map((msg, index) => (
                            <div key={index} className="flex-1 min-w-0">
                              <div
                                className={`h-6 rounded ${emotionalColors[msg.emotionalState || 'neutral']}`}
                                title={`Round ${index + 1}: ${msg.emotionalState || 'neutral'}`}
                              ></div>
                              <div className="bloomberg-section-label text-center text-[#64748B] mt-1">{index + 1}</div>
                            </div>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 bloomberg-section-label">
                        {Object.entries(emotionalColors).map(([emotion, colorClass]) => (
                          <div key={emotion} className="flex items-center">
                            <div className={`w-3 h-3 rounded mr-1 ${colorClass}`}></div>
                            <span className="text-[#64748B]">{emotion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post-Trading Feedback (Free Play mode only) */}
                  {tradingState.buyerProfile.persona === 'freeplay' && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="bloomberg-small-text  text-[#1E293B] mb-3">Feedback</h4>
                      <div className="mb-3">
                        <label className="block bloomberg-section-label font-medium text-[#64748B] mb-1">
                          Who were you playing as?
                        </label>
                        <select className="w-full p-2 border border-slate-300 rounded bloomberg-small-text">
                          <option>Corporate Compliance Officer</option>
                          <option>ESG Fund Portfolio Manager</option>
                          <option>Carbon Trading Desk Analyst</option>
                          <option>Sustainability Director</option>
                          <option>Government Procurement Officer</option>
                          <option>None of these / custom buyer</option>
                        </select>
                      </div>
                      <div className="bloomberg-section-label text-[#64748B]">
                        The agent classified you as: <span className="font-medium">
                          {(() => {
                            if (tradingState.argumentHistory.length === 0) return 'General approach';
                            const argCounts = tradingState.argumentHistory.reduce((acc, arg) => {
                              acc[arg] = (acc[arg] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>);
                            const mostFrequent = Object.entries(argCounts).sort((a, b) => b[1] - a[1])[0];
                            return mostFrequent[0].replace('_', ' ') + ` (${mostFrequent[1]} times)`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Institutional Dashboard (Phase 6.1) - Appears for institutional personas */}
              {tradingState && isInstitutionalPersona(selectedPersona) && (
                <div className="mx-6 mb-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 shadow-lg p-6">
                  {/* Dashboard Header with Tab Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="bloomberg-metric-value text-gray-800">
Institutional Investment Dashboard
                      </h3>
                      <p className="bloomberg-small-text text-gray-600 mt-1">
                        Professional analytics for {selectedPersona.replace('_', ' ')} • WREI Tokenization Platform
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setActiveAnalyticsTab('standard')}
                        className={`px-4 py-2 rounded-lg bloomberg-small-text font-medium transition-all ${
                          activeAnalyticsTab === 'standard'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
Standard Analytics
                      </button>
                      <button
                        onClick={() => setActiveAnalyticsTab('institutional')}
                        className={`px-4 py-2 rounded-lg bloomberg-small-text font-medium transition-all ${
                          activeAnalyticsTab === 'institutional'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
Institutional View
                      </button>
                      <button
                        onClick={() => setActiveAnalyticsTab('history')}
                        className={`px-4 py-2 rounded-lg bloomberg-small-text font-medium transition-all ${
                          activeAnalyticsTab === 'history'
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        📚 History & Replay
                        {tradingSessions.length > 0 && (
                          <span className="ml-2 bg-red-500 text-white bloomberg-section-label px-2 py-1 rounded-full">
                            {tradingSessions.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  {activeAnalyticsTab === 'institutional' ? (
                    <div className="bg-gray-50 rounded-xl p-4 min-h-[600px]">
                      <InstitutionalDashboard
                        investorProfile={{
                          type: selectedPersona as any,
                          aum: (() => {
                            // Map personas to AUM (from Phase 3.1)
                            const aumMap: Record<string, number> = {
                              infrastructure_fund: 5_000_000_000,
                              esg_impact: 1_000_000_000,
                              defi_farmer: 2_000_000_000,
                              family_office: 2_500_000_000,
                              sovereign_wealth: 230_000_000_000,
                              pension_fund: 300_000_000_000
                            };
                            return aumMap[selectedPersona] || 5_000_000_000;
                          })(),
                          riskTolerance: (() => {
                            // Map personas to risk tolerance
                            const riskMap: Record<string, 'conservative' | 'moderate' | 'aggressive'> = {
                              infrastructure_fund: 'moderate',
                              esg_impact: 'moderate',
                              defi_farmer: 'aggressive',
                              family_office: 'conservative',
                              sovereign_wealth: 'conservative',
                              pension_fund: 'conservative'
                            };
                            return riskMap[selectedPersona] || 'moderate';
                          })(),
                          yieldRequirement: (() => {
                            // Map personas to yield requirements
                            const yieldMap: Record<string, number> = {
                              infrastructure_fund: 0.12,
                              esg_impact: 0.10,
                              defi_farmer: 0.15,
                              family_office: 0.08,
                              sovereign_wealth: 0.08,
                              pension_fund: 0.09
                            };
                            return yieldMap[selectedPersona] || 0.10;
                          })()
                        }}
                        portfolioSize={(() => {
                          // Calculate portfolio size based on trading context
                          const basePrice = tradingState.wreiTokenType === 'asset_co'
                            ? 1_000 // Asset Co tokens
                            : 150; // Carbon credits A$150/tonne
                          return Math.max(10_000_000, 100000 * basePrice); // Default 100k units
                        })()}
                        timeHorizon={7} // 7-year investment horizon
                        onConfigurationChange={(config) => {
                          // Handle configuration changes if needed
                          console.log('Dashboard configuration changed:', config);
                        }}
                      />
                    </div>
                  ) : activeAnalyticsTab === 'history' ? (
                    <div className="bg-white rounded-xl p-4 min-h-[600px]">
                      {tradingSessions.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                          <div className="text-6xl mb-4">📚</div>
                          <p className="bloomberg-card-title font-medium mb-2">No Negotiation History Yet</p>
                          <p className="bloomberg-small-text text-gray-500">
                            Complete your first negotiation to see replay and comparison features
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="bloomberg-card-title text-gray-800">
                              Recent Negotiation Sessions ({tradingSessions.length})
                            </h3>
                            {tradingSessions.length >= 2 && (
                              <button
                                onClick={() => setShowComparisonDashboard(true)}
                                className="px-4 py-2 bg-[#0EA5E9] text-white rounded-lg hover:bg-blue-600 transition-colors bloomberg-small-text font-medium"
                              >
                                🔄 Compare Sessions
                              </button>
                            )}
                          </div>

                          <div className="grid gap-4">
                            {tradingSessions.slice(0, 10).map((session) => (
                              <div
                                key={session.id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                      <span className="bloomberg-data bloomberg-small-text bg-slate-100 px-2 py-1 rounded">
                                        {session.persona === 'compliance_officer' ? 'CMP' :
                                         session.persona === 'esg_fund_manager' ? 'ESG' :
                                         session.persona === 'trading_desk' ? 'TRD' :
                                         session.persona === 'sustainability_director' ? 'SUS' :
                                         session.persona === 'government_procurement' ? 'GOV' :
                                         session.persona === 'infrastructure_fund' ? 'INF' :
                                         session.persona === 'esg_impact_investor' ? 'ESG' :
                                         session.persona === 'defi_yield_farmer' ? 'DEF' :
                                         session.persona === 'family_office' ? 'FAM' :
                                         session.persona === 'sovereign_wealth' ? 'SOV' :
                                         session.persona === 'pension_fund' ? 'PEN' : 'GEN'}
                                      </span>
                                      <div>
                                        <div className="font-medium text-gray-800 capitalize">
                                          {session.persona.replace('_', ' ')}
                                        </div>
                                        <div className="bloomberg-section-label text-gray-500">
                                          {new Date(session.startTime).toLocaleDateString('en-AU', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-4 bloomberg-small-text">
                                    <div className="text-center">
                                      <div className="text-gray-600">Final Price</div>
                                      <div className=" text-[#10B981]">
                                        A${session.metrics.finalPrice.toLocaleString()}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-gray-600">Rounds</div>
                                      <div className=" text-gray-800">
                                        {session.metrics.totalRounds}
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-gray-600">Duration</div>
                                      <div className=" text-gray-800">
                                        {session.metrics.duration.toFixed(1)}m
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-gray-600">Outcome</div>
                                      <div className={`px-2 py-1 rounded-full bloomberg-section-label font-medium ${
                                        session.metrics.outcomeSuccess
                                          ? 'bg-green-100 text-green-800'
                                          : session.outcome === 'deferred'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                      }`}>
                                        {session.outcome?.toUpperCase()}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 bloomberg-section-label text-gray-600">
                                    <span>Concessions: {session.metrics.totalConcessionPercentage.toFixed(1)}%</span>
                                    <span>Arguments: {Object.values(session.metrics.argumentTypes).reduce((a, b) => a + b, 0)}</span>
                                    <span>Messages: {session.messages.length}</span>
                                  </div>

                                  <button
                                    onClick={() => handleViewReplay(session)}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors bloomberg-small-text font-medium"
                                  >
                                    🎬 View Replay
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {tradingSessions.length > 10 && (
                            <div className="text-center">
                              <p className="bloomberg-small-text text-gray-500">
                                Showing latest 10 sessions. Total: {tradingSessions.length} sessions.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-center py-8 text-gray-600">
                        <p className="bloomberg-card-title font-medium mb-2">Standard Analytics View</p>
                        <p className="bloomberg-small-text">
                          Switch to Institutional View above for professional investment analytics
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Professional Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center bloomberg-small-text text-gray-500">
                    <div>
                      Phase 6.1: Professional UI/UX Enhancement •
                      Integrated with Phases 1-5 Foundation •
                      Real-time Market Intelligence
                    </div>
                    <div>
                      Australian AFSL Compliant • Professional Investors Only
                    </div>
                  </div>
                </div>
              )}

              {/* Input Area */}
              {tradingStarted && !tradingState?.negotiationComplete && (
                <div className="border-t border-slate-200 p-4">
                  <div className="flex space-x-3">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isLoading ? "Analysing..." : "Type your trading message..."}
                      disabled={isLoading}
                      rows={2}
                      aria-label="Type your trading message"
                      aria-describedby="input-help"
                      className="flex-1 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      aria-label={isLoading ? "Sending message" : "Send message"}
                      className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" aria-hidden="true"></div>
                          Sending...
                        </>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex space-x-4">
                      <button
                        onClick={handleEndTrading}
                        disabled={isLoading}
                        className="text-[#64748B] hover:text-[#1E293B] bloomberg-small-text font-medium disabled:opacity-50"
                      >
                        End Negotiation
                      </button>
                      <button
                        onClick={handleRequestHuman}
                        disabled={isLoading}
                        className="text-[#F59E0B] hover:text-[#D97706] bloomberg-small-text font-medium disabled:opacity-50"
                      >
                        Request Human Representative
                      </button>
                      <button
                        onClick={handleResetTrading}
                        disabled={isLoading}
                        className="text-[#0EA5E9] hover:text-[#0284C7] bloomberg-small-text font-medium disabled:opacity-50"
                      >
                        Start New Negotiation
                      </button>
                    </div>
                    <div className="bloomberg-section-label text-[#64748B]">
                      {inputMessage.length} characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* P1.7: Trade Blotter */}
        <div className="mt-4">
          <TradeBlotter
            localTrades={blotterTrades}
            instrumentFilter={selectedInstrument}
          />
        </div>

        {/* Bottom Status Bar */}
        {tradingState && (
          <div className="mt-4 flex justify-between items-center bloomberg-small-text text-[#64748B]">
            <div>
              Round {tradingState.round} | Phase: {tradingState.phase}
            </div>
            <div>
              WREI Trading Platform | Water Roads Pty Ltd
            </div>
          </div>
        )}

        {/* AI Strategy Panel - Milestone 1.1 Enhancement */}
        {isInstitutionalPersona(selectedPersona) && tradingStarted && (
          <div className={`fixed ${showStrategyPanel ? 'right-4 top-20 w-96' : 'bottom-4 right-4'} z-50 transition-all duration-300`}>
            <NegotiationStrategyPanel
              explanation={currentStrategyExplanation}
              isVisible={showStrategyPanel}
              onToggle={() => setShowStrategyPanel(!showStrategyPanel)}
            />
          </div>
        )}

        {/* A2: Real-Time Coaching Panel */}
        {tradingStarted && tradingState && (
          <CoachingPanel
            negotiationState={tradingState}
            isVisible={showCoachingPanel}
            onToggleVisibility={() => setShowCoachingPanel(!showCoachingPanel)}
            className={showStrategyPanel && isInstitutionalPersona(selectedPersona) ? 'right-[420px]' : ''}
          />
        )}

        {/* A1: Replay Viewer Modal */}
        {showReplayViewer && selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-11/12 h-5/6 max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
              <ReplayViewer
                session={selectedSession}
                onClose={closeReplayViewer}
              />
            </div>
          </div>
        )}

        {/* A1: Comparison Dashboard Modal */}
        {showComparisonDashboard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="w-11/12 h-5/6 max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
              <ComparisonDashboard
                sessions={tradingSessions}
                comparison={sessionComparison}
                onSelectSessions={handleSessionComparison}
                onClose={closeComparisonDashboard}
              />
            </div>
          </div>
        )}
          </div>
        </>
      )}
    </div>
  );
}