import type { InvestorClassification } from '@/lib/types';
import type { ReportData } from '@/lib/export-utilities';
import ExportModal from '@/components/export/ExportModal';

interface TradeModeSelectorProps {
  interfaceMode: 'standard' | 'professional' | 'bulk';
  setInterfaceMode: (m: 'standard' | 'professional' | 'bulk') => void;
  showExportOptions: boolean;
  setShowExportOptions: (b: boolean) => void;
  reportData: ReportData;
  selectedPersonaName: string | undefined;
  investorClassification: InvestorClassification;
}

export default function TradeModeSelector({
  interfaceMode,
  setInterfaceMode,
  showExportOptions,
  setShowExportOptions,
  reportData,
  selectedPersonaName,
  investorClassification,
}: TradeModeSelectorProps) {
  return (
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
            <button
              onClick={() => setInterfaceMode('bulk')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                interfaceMode === 'bulk'
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
Bulk Procurement
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
          reportData={reportData}
          recipientName="Professional Investor"
          recipientOrganization={selectedPersonaName || 'Investment Organisation'}
          recipientClassification={investorClassification}
        />
      </div>
    </div>
  );
}
