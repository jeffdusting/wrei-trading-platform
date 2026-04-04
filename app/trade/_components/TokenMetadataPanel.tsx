import type { NegotiationState } from '@/lib/types';
import ProvenanceChain from '@/components/blockchain/ProvenanceChain';
import MerkleTreeView from '@/components/blockchain/MerkleTreeView';
import VesselProvenanceCard from '@/components/blockchain/VesselProvenanceCard';

interface TokenMetadataPanelProps {
  tradingState: NegotiationState;
  showBlockchainProvenance: boolean;
  setShowBlockchainProvenance: (b: boolean) => void;
}

export default function TokenMetadataPanel({
  tradingState,
  showBlockchainProvenance,
  setShowBlockchainProvenance,
}: TokenMetadataPanelProps) {
  if (!tradingState.tokenMetadata) return null;

  return (
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
  );
}
