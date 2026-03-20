'use client';

import { useState, useEffect, useRef } from 'react';
import { NegotiationState, PersonaType, ArgumentClassification, EmotionalState } from '@/lib/types';
import { PERSONA_DEFINITIONS, getPersonaById } from '@/lib/personas';
import { getInitialState, NEGOTIATION_CONFIG } from '@/lib/negotiation-config';

interface APIResponse {
  agentMessage: string;
  state: NegotiationState;
  classification: ArgumentClassification;
  emotionalState: EmotionalState;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
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

export default function NegotiatePage() {
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | 'freeplay'>('freeplay');
  const [negotiationState, setNegotiationState] = useState<NegotiationState | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [negotiationStarted, setNegotiationStarted] = useState(false);
  const [currentClassification, setCurrentClassification] = useState<ArgumentClassification>('general');
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalState>('neutral');
  const [threatLevel, setThreatLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [isInitializing, setIsInitializing] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [negotiationState?.messages]);

  const handlePersonaChange = (persona: PersonaType | 'freeplay') => {
    if (!negotiationStarted) {
      setSelectedPersona(persona);
      setNegotiationState(getInitialState(persona));
    }
  };

  const handleStartNegotiation = async () => {
    if (!negotiationState) {
      setNegotiationState(getInitialState(selectedPersona));
    }

    setIsLoading(true);
    setIsInitializing(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          state: negotiationState || getInitialState(selectedPersona),
          isOpening: true
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
        setNegotiationState(data.state);
        setNegotiationStarted(true);
        setCurrentClassification(data.classification);
        setCurrentEmotion(data.emotionalState);
        setThreatLevel(data.threatLevel);
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
    if (!messageToSend || !negotiationState || isLoading) return;

    if (!retryMessage) {
      setInputMessage('');
    }
    setIsLoading(true);
    setError(null);
    setLastFailedMessage(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          state: negotiationState,
          isOpening: false
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
        setNegotiationState(data.state);
        setCurrentClassification(data.classification);
        setCurrentEmotion(data.emotionalState);
        setThreatLevel(data.threatLevel);
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
      if (!negotiationStarted) {
        handleStartNegotiation();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleEndNegotiation = async () => {
    if (!negotiationState || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to end this negotiation for now.',
          state: negotiationState,
          isOpening: false
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        setNegotiationState({
          ...data.state,
          negotiationComplete: true,
          outcome: 'deferred'
        });
      }
    } catch (err) {
      setError('Failed to end negotiation properly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHuman = async () => {
    if (!negotiationState || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I would like to speak with a human representative.',
          state: negotiationState,
          isOpening: false
        })
      });

      const data: APIResponse = await response.json();
      if (data.state) {
        setNegotiationState({
          ...data.state,
          negotiationComplete: true,
          outcome: 'escalated'
        });
      }
    } catch (err) {
      setError('Failed to request human representative.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPersonaData = selectedPersona !== 'freeplay' ? getPersonaById(selectedPersona) : null;

  const getPriceRangePercent = () => {
    if (!negotiationState) return 50;
    const range = NEGOTIATION_CONFIG.ANCHOR_PRICE - NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    const position = negotiationState.currentOfferPrice - NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
    return Math.max(0, Math.min(100, (position / range) * 100));
  };

  const getConcessionPercent = () => {
    if (!negotiationState) return 0;
    return Math.round((negotiationState.totalConcessionGiven / NEGOTIATION_CONFIG.ANCHOR_PRICE) * 100);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#1B2A4A] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-white text-lg font-bold">Water Roads</div>
            <div className="text-[#0EA5E9] text-lg font-bold">WREI</div>
            <div className="text-white/70 text-sm ml-4">Carbon Credit Trading Platform</div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]">

          {/* Left Panel */}
          <div className="lg:w-1/3 space-y-6 order-2 lg:order-1">

            {/* Persona Selector */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Select Buyer Persona</h3>

              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="freeplay"
                    checked={selectedPersona === 'freeplay'}
                    onChange={(e) => handlePersonaChange(e.target.value as 'freeplay')}
                    disabled={negotiationStarted}
                    className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[#1E293B]">Free Play</div>
                    <div className="text-sm text-[#64748B]">Negotiate naturally</div>
                  </div>
                </label>

                {PERSONA_DEFINITIONS.map((persona) => (
                  <label key={persona.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      value={persona.id}
                      checked={selectedPersona === persona.id}
                      onChange={(e) => handlePersonaChange(e.target.value as PersonaType)}
                      disabled={negotiationStarted}
                      className="text-[#0EA5E9] focus:ring-[#0EA5E9] focus:ring-offset-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[#1E293B]">{persona.name}</div>
                      <div className="text-sm text-[#64748B]">{persona.title}</div>
                      <div className="text-xs text-[#64748B]">{persona.organisation}</div>
                    </div>
                  </label>
                ))}
              </div>

              {negotiationStarted && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
                  Persona locked
                </div>
              )}

              {/* Persona Briefing */}
              {selectedPersonaData && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-semibold text-amber-800 mb-2">YOUR ROLE</div>
                  <p className="text-sm text-amber-700 mb-3">{selectedPersonaData.briefing}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
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
            {negotiationState && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-[#1E293B] mb-4">Negotiation Dashboard</h3>

                {/* Round & Phase */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-[#1E293B]">
                    Round {negotiationState.round}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${phaseColors[negotiationState.phase]}`}>
                    {negotiationState.phase.charAt(0).toUpperCase() + negotiationState.phase.slice(1)}
                  </span>
                </div>

                {/* Price Tracker */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#64748B]">Agent&apos;s offer:</span>
                    <span className="font-medium text-[#1E293B]">
                      ${negotiationState.currentOfferPrice}/t
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-[#64748B]">Your anchor:</span>
                    <span className="font-medium text-[#1E293B]">
                      {negotiationState.buyerProfile.priceAnchor ?
                        `$${negotiationState.buyerProfile.priceAnchor}/t` : '—'
                      }
                    </span>
                  </div>

                  {/* Price Range Visual */}
                  <div className="relative h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="absolute h-2 bg-[#0EA5E9] rounded-full transition-all duration-500"
                      style={{ width: `${getPriceRangePercent()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-[#64748B]">
                    <span>${NEGOTIATION_CONFIG.BASE_CARBON_PRICE}</span>
                    <span>${NEGOTIATION_CONFIG.ANCHOR_PRICE}</span>
                  </div>
                </div>

                {/* Concession Tracker */}
                <div className="mb-4">
                  <div className="text-sm text-[#64748B] mb-1">
                    Agent has adjusted {getConcessionPercent()}% from opening price
                  </div>
                </div>

                {/* Classification & Emotion */}
                {negotiationState.messages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Your approach:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${classificationColors[currentClassification]}`}>
                        {currentClassification.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Your tone:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${emotionalColors[currentEmotion]}`}>
                        {currentEmotion}
                      </span>
                    </div>

                    {/* Warmth & Dominance */}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#64748B]">Warmth</span>
                          <span className="text-[#1E293B]">{negotiationState.buyerProfile.detectedWarmth}/10</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-green-500 rounded transition-all duration-500"
                            style={{ width: `${negotiationState.buyerProfile.detectedWarmth * 10}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#64748B]">Dominance</span>
                          <span className="text-[#1E293B]">{negotiationState.buyerProfile.detectedDominance}/10</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-blue-500 rounded transition-all duration-500"
                            style={{ width: `${negotiationState.buyerProfile.detectedDominance * 10}%` }}
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
                    <span className="text-sm">⚠</span>
                    <span className="text-xs font-medium">
                      Unusual negotiation pattern detected
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:w-2/3 flex flex-col order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[60vh] lg:min-h-0" role="main" aria-label="Carbon credit negotiation chat">

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4" role="log" aria-live="polite" aria-label="Negotiation messages">
                {!negotiationStarted ? (
                  <div className="text-center py-12">
                    {isInitializing ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0EA5E9] mx-auto mb-4"></div>
                        <h3 className="text-xl font-semibold text-[#1E293B] mb-2">
                          Connecting to WREI Platform...
                        </h3>
                        <p className="text-[#64748B]">
                          Initialising AI negotiation agent
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold text-[#1E293B] mb-4">
                          Ready to Begin Negotiation
                        </h3>
                        <p className="text-[#64748B] mb-6">
                          Click &quot;Start Negotiation&quot; to begin your WREI carbon credit negotiation session.
                        </p>
                        <button
                          onClick={handleStartNegotiation}
                          disabled={isLoading}
                          className="bg-[#0EA5E9] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#0284C7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isLoading ? 'Starting...' : 'Start Negotiation'}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {negotiationState?.messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'buyer' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'buyer'
                            ? 'bg-[#E2E8F0] text-[#1E293B]'
                            : 'bg-[#0EA5E9] text-white'
                        }`}>
                          <div className="text-sm md:text-base">{message.content}</div>
                          <div className={`text-xs mt-2 ${
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
                <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
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
              {negotiationState?.negotiationComplete && (
                <div className="mx-6 mb-4">
                  {negotiationState.outcome === 'agreed' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                      <div className="font-semibold">Negotiation Complete — Terms Agreed</div>
                      <div className="text-sm mt-1">
                        Final price: ${negotiationState.currentOfferPrice}/t
                      </div>
                    </div>
                  )}
                  {negotiationState.outcome === 'deferred' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                      <div className="font-semibold">Negotiation Paused — Follow-up Scheduled</div>
                      <div className="text-sm mt-1">
                        Thank you for your interest. We&apos;ll follow up with additional options.
                      </div>
                    </div>
                  )}
                  {negotiationState.outcome === 'escalated' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                      <div className="font-semibold">Connecting with Water Roads Team</div>
                      <div className="text-sm mt-1">
                        Contact: trading@waterroads.com.au | +61 3 8456 7890
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Analytics Panel */}
              {negotiationState?.negotiationComplete && (
                <div className="mx-6 mb-4 bg-slate-50 rounded-lg border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-[#1E293B] mb-6">Negotiation Analytics</h3>

                  {/* Summary Card */}
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-medium text-[#64748B] mb-1">OUTCOME</div>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        negotiationState.outcome === 'agreed' ? 'bg-green-100 text-green-800' :
                        negotiationState.outcome === 'deferred' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {negotiationState.outcome ? negotiationState.outcome.charAt(0).toUpperCase() + negotiationState.outcome.slice(1) : 'In Progress'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-medium text-[#64748B] mb-1">ROUNDS</div>
                      <div className="text-xl font-bold text-[#1E293B]">{negotiationState.round}</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-medium text-[#64748B] mb-1">FINAL PRICE</div>
                      <div className="text-xl font-bold text-[#1E293B]">${negotiationState.currentOfferPrice}/t</div>
                      {negotiationState.outcome === 'agreed' && (
                        <div className="text-xs text-[#64748B] mt-1">
                          {Math.round(((negotiationState.anchorPrice - negotiationState.currentOfferPrice) / negotiationState.anchorPrice) * 100)}% discount
                        </div>
                      )}
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="text-xs font-medium text-[#64748B] mb-1">DURATION</div>
                      <div className="text-xl font-bold text-[#1E293B]">{negotiationState.round * 2}min</div>
                      <div className="text-xs text-[#64748B] mt-1">est.</div>
                    </div>
                  </div>

                  {/* Argument Distribution Chart */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-[#1E293B] mb-3">Argument Distribution</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      {(() => {
                        const argCounts = negotiationState.argumentHistory.reduce((acc, arg) => {
                          acc[arg] = (acc[arg] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);
                        const maxCount = Math.max(...Object.values(argCounts));

                        return (
                          <div className="space-y-2">
                            {Object.entries(argCounts).map(([arg, count]) => (
                              <div key={arg} className="flex items-center">
                                <div className="w-24 text-xs text-[#64748B] mr-3">
                                  {arg.replace('_', ' ')}
                                </div>
                                <div className="flex-1 relative">
                                  <div
                                    className={`h-4 rounded transition-all duration-500 ${classificationColors[arg as ArgumentClassification]}`}
                                    style={{ width: `${(count / maxCount) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="w-8 text-xs text-[#64748B] text-right ml-2">{count}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Price Movement Timeline */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-[#1E293B] mb-3">Price Movement</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      {(() => {
                        const pricePoints = negotiationState.messages
                          .filter(msg => msg.role === 'agent')
                          .map((msg, index) => ({
                            round: index + 1,
                            price: negotiationState.anchorPrice - (negotiationState.totalConcessionGiven * (index + 1) / negotiationState.messages.filter(m => m.role === 'agent').length)
                          }));

                        if (pricePoints.length === 0) return null;

                        const minPrice = NEGOTIATION_CONFIG.BASE_CARBON_PRICE;
                        const maxPrice = NEGOTIATION_CONFIG.ANCHOR_PRICE;
                        const priceRange = maxPrice - minPrice;

                        return (
                          <div className="relative h-32">
                            {/* Y-axis labels */}
                            <div className="absolute left-0 top-0 text-xs text-[#64748B]">${maxPrice}</div>
                            <div className="absolute left-0 bottom-0 text-xs text-[#64748B]">${minPrice}</div>

                            {/* Anchor price line */}
                            <div
                              className="absolute left-12 right-4 border-t border-dashed border-[#0EA5E9] opacity-50"
                              style={{ top: '0px' }}
                            ></div>
                            <div className="absolute right-4 -top-4 text-xs text-[#0EA5E9]">Anchor (${NEGOTIATION_CONFIG.ANCHOR_PRICE})</div>

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
                            <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-[#64748B]">
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
                    <h4 className="text-sm font-semibold text-[#1E293B] mb-3">Emotional Journey</h4>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex space-x-1">
                        {negotiationState.messages
                          .filter(msg => msg.role === 'buyer')
                          .map((msg, index) => (
                            <div key={index} className="flex-1 min-w-0">
                              <div
                                className={`h-6 rounded ${emotionalColors[msg.emotionalState || 'neutral']}`}
                                title={`Round ${index + 1}: ${msg.emotionalState || 'neutral'}`}
                              ></div>
                              <div className="text-xs text-center text-[#64748B] mt-1">{index + 1}</div>
                            </div>
                          ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 text-xs">
                        {Object.entries(emotionalColors).map(([emotion, colorClass]) => (
                          <div key={emotion} className="flex items-center">
                            <div className={`w-3 h-3 rounded mr-1 ${colorClass}`}></div>
                            <span className="text-[#64748B]">{emotion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post-Negotiation Feedback (Free Play mode only) */}
                  {negotiationState.buyerProfile.persona === 'freeplay' && (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="text-sm font-semibold text-[#1E293B] mb-3">Feedback</h4>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-[#64748B] mb-1">
                          Who were you playing as?
                        </label>
                        <select className="w-full p-2 border border-slate-300 rounded text-sm">
                          <option>Corporate Compliance Officer</option>
                          <option>ESG Fund Portfolio Manager</option>
                          <option>Carbon Trading Desk Analyst</option>
                          <option>Sustainability Director</option>
                          <option>Government Procurement Officer</option>
                          <option>None of these / custom buyer</option>
                        </select>
                      </div>
                      <div className="text-xs text-[#64748B]">
                        The agent classified you as: <span className="font-medium">
                          {(() => {
                            if (negotiationState.argumentHistory.length === 0) return 'General approach';
                            const argCounts = negotiationState.argumentHistory.reduce((acc, arg) => {
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

              {/* Input Area */}
              {negotiationStarted && !negotiationState?.negotiationComplete && (
                <div className="border-t border-slate-200 p-4">
                  <div className="flex space-x-3">
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isLoading ? "Analysing..." : "Type your negotiation message..."}
                      disabled={isLoading}
                      rows={2}
                      aria-label="Type your negotiation message"
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
                        onClick={handleEndNegotiation}
                        disabled={isLoading}
                        className="text-[#64748B] hover:text-[#1E293B] text-sm font-medium disabled:opacity-50"
                      >
                        End Negotiation
                      </button>
                      <button
                        onClick={handleRequestHuman}
                        disabled={isLoading}
                        className="text-[#F59E0B] hover:text-[#D97706] text-sm font-medium disabled:opacity-50"
                      >
                        Request Human Representative
                      </button>
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {inputMessage.length} characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        {negotiationState && (
          <div className="mt-4 flex justify-between items-center text-sm text-[#64748B]">
            <div>
              Round {negotiationState.round} | Phase: {negotiationState.phase}
            </div>
            <div>
              WREI Trading Platform | Water Roads Pty Ltd
            </div>
          </div>
        )}
      </div>
    </div>
  );
}