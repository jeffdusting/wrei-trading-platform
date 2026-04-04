import type { NegotiationState, PersonaType } from '@/lib/types';
import type { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import InstitutionalDashboard from '@/components/InstitutionalDashboard';

interface InstitutionalTabsProps {
  tradingState: NegotiationState;
  selectedPersona: PersonaType | 'freeplay';
  selectedInstrument: string;
  activeAnalyticsTab: 'standard' | 'institutional' | 'history';
  setActiveAnalyticsTab: (t: 'standard' | 'institutional' | 'history') => void;
  tradingSessions: NegotiationSession[];
  setShowComparisonDashboard: (b: boolean) => void;
  onViewReplay: (session: NegotiationSession) => void;
  isVisible: boolean;
}

export default function InstitutionalTabs({
  tradingState,
  selectedPersona,
  selectedInstrument,
  activeAnalyticsTab,
  setActiveAnalyticsTab,
  tradingSessions,
  setShowComparisonDashboard,
  onViewReplay,
  isVisible,
}: InstitutionalTabsProps) {
  if (!isVisible) return null;

  return (
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
              })()
            }}
            portfolioSize={(() => {
              const basePrice = tradingState.wreiTokenType === 'asset_co'
                ? 1_000
                : 150;
              return Math.max(10_000_000, 100000 * basePrice);
            })()}
            timeHorizon={7}
            onConfigurationChange={(config) => {
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
                        onClick={() => onViewReplay(session)}
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
  );
}
