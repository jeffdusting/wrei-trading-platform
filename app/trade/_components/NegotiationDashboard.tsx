import type { NegotiationState, ArgumentClassification, EmotionalState } from '@/lib/types';
import { WREI_TOKEN_CONFIG } from '@/lib/negotiation-config';
import { phaseColors, classificationColors, emotionalColors } from '../_lib/trade-types';
import { getPriceRangePercent, getConcessionPercent } from '../_lib/trade-utils';

interface NegotiationDashboardProps {
  tradingState: NegotiationState;
  currentClassification: ArgumentClassification;
  currentEmotion: EmotionalState;
  threatLevel: 'none' | 'low' | 'medium' | 'high';
}

export default function NegotiationDashboard({
  tradingState,
  currentClassification,
  currentEmotion,
  threatLevel,
}: NegotiationDashboardProps) {
  return (
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
            style={{ width: `${getPriceRangePercent(tradingState)}%` }}
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
          Agent has adjusted {getConcessionPercent(tradingState)}% from opening {
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
  );
}
