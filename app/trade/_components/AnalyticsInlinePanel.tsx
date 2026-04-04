import type { NegotiationState, ArgumentClassification } from '@/lib/types';
import { NEGOTIATION_CONFIG } from '@/lib/negotiation-config';
import { classificationColors, emotionalColors } from '../_lib/trade-types';

interface AnalyticsInlinePanelProps {
  tradingState: NegotiationState;
}

export default function AnalyticsInlinePanel({ tradingState }: AnalyticsInlinePanelProps) {
  if (!tradingState.negotiationComplete) return null;

  return (
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
  );
}
