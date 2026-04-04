/**
 * Message history builder for the WREI negotiation API.
 * Transforms negotiation state messages into the Claude API
 * message format with proper role mapping.
 */

import { NegotiationState } from '@/lib/types';
import { getPersonaById } from '@/lib/personas';

export function buildMessageHistory(
  state: NegotiationState,
  message: string,
  isOpening: boolean
): Array<{ role: 'user' | 'assistant'; content: string }> {
  if (isOpening) {
    let openingPrompt = `Generate a concise opening offer for this negotiation. Keep it under 150 words. You are representing Water Roads' institutional-grade tokenized investment platform. Specify the exact token type you're offering: ${
      state.wreiTokenType === 'carbon_credits' ? 'WREI Carbon Credit Tokens (A$150/tonne)' :
      state.wreiTokenType === 'asset_co' ? 'WREI Asset Co Tokens (28.3% infrastructure yield)' :
      state.wreiTokenType === 'dual_portfolio' ? 'WREI dual token portfolio (Carbon Credits + Asset Co)' :
      state.creditType === 'carbon' ? 'carbon credits' :
      state.creditType === 'esc' ? 'Energy Savings Certificates (ESCs)' : 'both carbon credits and ESCs'
    }. Reference the institutional context (A$19B tokenized RWA market), mention key differentiators (native digital tokens, not bridged), state the anchor price, and ask about their investment objectives. Match their sophistication level.`;

    // Add persona-specific opening if not freeplay
    if (state.buyerProfile.persona !== 'freeplay') {
      const persona = getPersonaById(state.buyerProfile.persona);
      if (persona) {
        openingPrompt += ` The buyer is ${persona.name}, ${persona.title} at ${persona.organisation}. Adapt your opening accordingly.`;
      }
    }

    return [{ role: 'user', content: openingPrompt }];
  }

  // Build message history from state.messages, alternating roles
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  state.messages.forEach(msg => {
    if (msg.role === 'agent') {
      history.push({ role: 'assistant', content: msg.content });
    } else if (msg.role === 'buyer') {
      history.push({ role: 'user', content: msg.content });
    }
  });

  // Add the current buyer message (skip for opening)
  if (message.trim() && !isOpening) {
    history.push({ role: 'user', content: message });
  }

  return history;
}
