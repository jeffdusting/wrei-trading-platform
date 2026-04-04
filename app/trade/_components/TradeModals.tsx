import type { NegotiationState, PersonaType } from '@/lib/types';
import type { NegotiationStrategyExplanation } from '@/lib/negotiation-strategy';
import type { NegotiationSession, SessionComparison } from '@/lib/negotiation-history';
import type { BlotterTrade } from '@/components/trading/TradeBlotter';
import NegotiationStrategyPanel from '@/components/NegotiationStrategyPanel';
import CoachingPanel from '@/components/negotiation/CoachingPanel';
import ReplayViewer from '@/components/negotiation/ReplayViewer';
import ComparisonDashboard from '@/components/negotiation/ComparisonDashboard';
import ProvenanceCertificate from '@/components/trading/ProvenanceCertificate';
import { isInstitutionalPersona, buildProvenanceTradeData, buildProvenanceData } from '../_lib/trade-utils';

interface TradeModalsProps {
  tradingStarted: boolean;
  tradingState: NegotiationState | null;
  selectedPersona: PersonaType | 'freeplay';
  selectedInstrument: string;
  // Strategy panel
  showStrategyPanel: boolean;
  setShowStrategyPanel: (b: boolean) => void;
  currentStrategyExplanation: NegotiationStrategyExplanation | null;
  // Coaching panel
  showCoachingPanel: boolean;
  setShowCoachingPanel: (b: boolean) => void;
  // Replay viewer
  showReplayViewer: boolean;
  selectedSession: NegotiationSession | null;
  closeReplayViewer: () => void;
  // Comparison dashboard
  showComparisonDashboard: boolean;
  tradingSessions: NegotiationSession[];
  sessionComparison: SessionComparison | null;
  handleSessionComparison: (sessionIds: string[]) => void;
  closeComparisonDashboard: () => void;
  // Provenance certificate
  showProvenanceCert: boolean;
  setShowProvenanceCert: (b: boolean) => void;
  lastAgreedTrade: BlotterTrade | null;
}

export default function TradeModals(props: TradeModalsProps) {
  const isInst = isInstitutionalPersona(props.selectedPersona) || props.selectedInstrument === 'WREI_CC' || props.selectedInstrument === 'WREI_ACO';

  return (
    <>
      {/* AI Strategy Panel */}
      {isInst && props.tradingStarted && (
        <div className={`fixed ${props.showStrategyPanel ? 'right-4 top-20 w-96' : 'bottom-4 right-4'} z-50 transition-all duration-300`}>
          <NegotiationStrategyPanel
            explanation={props.currentStrategyExplanation}
            isVisible={props.showStrategyPanel}
            onToggle={() => props.setShowStrategyPanel(!props.showStrategyPanel)}
          />
        </div>
      )}

      {/* A2: Real-Time Coaching Panel */}
      {props.tradingStarted && props.tradingState && (
        <CoachingPanel
          negotiationState={props.tradingState}
          isVisible={props.showCoachingPanel}
          onToggleVisibility={() => props.setShowCoachingPanel(!props.showCoachingPanel)}
          className={props.showStrategyPanel && isInst ? 'right-[420px]' : ''}
        />
      )}

      {/* A1: Replay Viewer Modal */}
      {props.showReplayViewer && props.selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 h-5/6 max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
            <ReplayViewer session={props.selectedSession} onClose={props.closeReplayViewer} />
          </div>
        </div>
      )}

      {/* A1: Comparison Dashboard Modal */}
      {props.showComparisonDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 h-5/6 max-w-7xl bg-white rounded-lg shadow-xl overflow-hidden">
            <ComparisonDashboard
              sessions={props.tradingSessions}
              comparison={props.sessionComparison}
              onSelectSessions={props.handleSessionComparison}
              onClose={props.closeComparisonDashboard}
            />
          </div>
        </div>
      )}

      {/* P3.3: Provenance Certificate Modal */}
      {props.showProvenanceCert && props.lastAgreedTrade && props.tradingState && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-11/12 max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-auto">
            <ProvenanceCertificate
              trade={buildProvenanceTradeData(props.lastAgreedTrade, props.selectedInstrument, props.selectedPersona)}
              provenance={buildProvenanceData(props.selectedInstrument, props.lastAgreedTrade.quantity)}
              onClose={() => props.setShowProvenanceCert(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
