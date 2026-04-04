'use client';

import { useEffect } from 'react';
import { getInitialWREIState, NEGOTIATION_CONFIG } from '@/lib/negotiation-config';
import {
  parseNegotiationUrlParams,
  calculateInstitutionalConstraints,
} from '@/lib/onboarding-pipeline';
import type { TradeState } from '../_lib/trade-types';
import { mapUrlPersonaToBuyerPersona } from '../_lib/trade-utils';

export function usePreConfig(state: TradeState): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const preConfigParams = parseNegotiationUrlParams(searchParams);

    if (preConfigParams.isPreConfigured && !state.preConfigApplied) {
      state.setIsPreConfigured(true);

      const mappedPersona = preConfigParams.persona
        ? mapUrlPersonaToBuyerPersona(preConfigParams.persona)
        : 'freeplay';

      state.setSelectedPersona(mappedPersona);

      if (preConfigParams.classification) {
        state.setInvestorClassification(preConfigParams.classification);
      }

      state.setInterfaceMode('professional');

      if (preConfigParams.entityName && preConfigParams.persona) {
        const welcomeMsg = `Welcome ${preConfigParams.entityName}! Your institutional profile has been pre-configured for ${preConfigParams.persona.replace(/_/g, ' ')} negotiations.`;
        state.setPreConfigMessage(welcomeMsg);
      }

      const initialState = getInitialWREIState(mappedPersona, state.selectedWREITokenType, state.selectedCreditType);

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

        console.log('Applied institutional constraints:', adjustedConstraints);
      }

      state.setTradingState(initialState);
      state.setPreConfigApplied(true);

      window.history.replaceState({}, '', '/trade');
    }
  }, [state.preConfigApplied, state.selectedWREITokenType, state.selectedCreditType]);
}
