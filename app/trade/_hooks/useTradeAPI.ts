'use client';

import { useEffect } from 'react';
import type { PersonaType, CreditType, WREITokenType, NegotiationState } from '@/lib/types';
import { getInitialWREIState } from '@/lib/negotiation-config';
import { calculateNegotiationScore } from '@/lib/negotiation-scoring';
import type { BlotterTrade } from '@/components/trading/TradeBlotter';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import type { ResolvedPricing } from '@/lib/trading/instruments/pricing-engine';
import type { TradeState } from '../_lib/trade-types';
import { APIResponse } from '../_lib/trade-types';

export interface TradeAPI {
  handleInstrumentChange: (type: InstrumentType, pricing: ResolvedPricing) => void;
  handlePersonaChange: (persona: PersonaType | 'freeplay') => void;
  handleCreditTypeChange: (creditType: CreditType) => void;
  handleWREITokenTypeChange: (tokenType: WREITokenType) => void;
  handleStartTrading: () => Promise<void>;
  handleSendMessage: (retryMessage?: string) => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
}

export function useTradeAPI(
  state: TradeState,
  saveCompletedTrading: (finalState: NegotiationState) => void
): TradeAPI {
  // Scroll to bottom on message change
  useEffect(() => {
    state.messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.tradingState?.messages]);

  const handleInstrumentChange = (type: InstrumentType, pricing: ResolvedPricing) => {
    if (state.tradingStarted) return;
    state.setSelectedInstrument(type);
    state.setInstrumentPricing(pricing);
  };

  const handlePersonaChange = (persona: PersonaType | 'freeplay') => {
    if (!state.tradingStarted) {
      state.setSelectedPersona(persona);
      state.setTradingState(getInitialWREIState(persona, state.selectedWREITokenType, state.selectedCreditType));
    }
  };

  const handleCreditTypeChange = (creditType: CreditType) => {
    if (!state.tradingStarted) {
      state.setSelectedCreditType(creditType);
      state.setTradingState(getInitialWREIState(state.selectedPersona, state.selectedWREITokenType, creditType));
    }
  };

  const handleWREITokenTypeChange = (tokenType: WREITokenType) => {
    if (!state.tradingStarted) {
      state.setSelectedWREITokenType(tokenType);
      state.setTradingState(getInitialWREIState(state.selectedPersona, tokenType, state.selectedCreditType));
    }
  };

  const handleStartTrading = async () => {
    if (!state.tradingState) {
      state.setTradingState(getInitialWREIState(state.selectedPersona, state.selectedWREITokenType, state.selectedCreditType));
    }

    state.setIsLoading(true);
    state.setIsInitializing(true);
    state.setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: '',
          state: state.tradingState || getInitialWREIState(state.selectedPersona, state.selectedWREITokenType, state.selectedCreditType),
          isOpening: true,
          instrumentType: state.selectedInstrument,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        state.setError(data.error);
      } else {
        state.setTradingState(data.state);
        state.setTradingStarted(true);
        state.setTradingStartTime(new Date().toISOString());
        state.setCurrentClassification(data.classification);
        state.setCurrentEmotion(data.emotionalState);
        state.setThreatLevel(data.threatLevel);

        if (data.strategyExplanation) {
          state.setCurrentStrategyExplanation(data.strategyExplanation);
          state.setShowStrategyPanel(true);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        state.setError('Connection timeout. Please check your network and try again.');
      } else {
        state.setError('Failed to connect to the WREI platform. Please try again.');
      }
    } finally {
      state.setIsLoading(false);
      state.setIsInitializing(false);
    }
  };

  const handleSendMessage = async (retryMessage?: string) => {
    const messageToSend = retryMessage || state.inputMessage.trim();
    if (!messageToSend || !state.tradingState || state.isLoading) return;

    if (!retryMessage) {
      state.setInputMessage('');
    }
    state.setIsLoading(true);
    state.setError(null);
    state.setLastFailedMessage(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          state: state.tradingState,
          isOpening: false,
          instrumentType: state.selectedInstrument,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: APIResponse = await response.json();

      if (data.error) {
        state.setError(data.error);
        state.setLastFailedMessage(messageToSend);
      } else {
        state.setTradingState(data.state);
        state.setCurrentClassification(data.classification);
        state.setCurrentEmotion(data.emotionalState);
        state.setThreatLevel(data.threatLevel);

        // Save to history if trading just completed
        if (data.state.negotiationComplete && state.tradingStartTime) {
          saveCompletedTrading(data.state);

          // P1.7: Record agreed trade to DB + blotter
          if (data.state.outcome === 'agreed') {
            const tradeRecord: BlotterTrade = {
              id: `TRD-${Date.now().toString(36).toUpperCase()}`,
              instrument_id: state.selectedInstrument,
              negotiation_id: null,
              direction: 'sell',
              quantity: data.state.buyerProfile?.volumeInterest ?? 1000,
              price_per_unit: data.state.currentOfferPrice,
              total_value: data.state.currentOfferPrice * (data.state.buyerProfile?.volumeInterest ?? 1000),
              currency: state.selectedInstrument.startsWith('WREI') ? 'USD' : 'AUD',
              buyer_persona: state.selectedPersona,
              status: 'confirmed',
              executed_at: new Date().toISOString(),
              settled_at: null,
            };
            state.setBlotterTrades(prev => [tradeRecord, ...prev]);
            state.setLastAgreedTrade(tradeRecord);

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
                metadata: { source: 'negotiation', instrument: state.selectedInstrument },
              }),
            }).catch(() => { /* DB unavailable — local blotter still shows trade */ });
          }

          // Calculate and display trading scorecard
          if (state.selectedPersona !== 'freeplay') {
            const durationMinutes = data.state.round * 2;
            const scorecard = calculateNegotiationScore(data.state, state.selectedPersona as PersonaType, durationMinutes);
            state.setTradingScorecard(scorecard);
            state.setShowScorecard(true);
          }
        }

        if (data.strategyExplanation) {
          state.setCurrentStrategyExplanation(data.strategyExplanation);
        }
      }
    } catch (err) {
      state.setLastFailedMessage(messageToSend);
      if (err instanceof Error && err.name === 'AbortError') {
        state.setError('Message timeout. Please check your network connection.');
      } else {
        state.setError('Failed to send message. Please check your connection and try again.');
      }
    } finally {
      state.setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!state.tradingStarted) {
        handleStartTrading();
      } else {
        handleSendMessage();
      }
    }
  };

  return {
    handleInstrumentChange,
    handlePersonaChange,
    handleCreditTypeChange,
    handleWREITokenTypeChange,
    handleStartTrading,
    handleSendMessage,
    handleKeyPress,
  };
}
