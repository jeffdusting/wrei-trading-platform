'use client'

/**
 * Correspondence Management Page
 *
 * Six tabs: Procurement | Drafts | Negotiations | Settlement | Reports | History
 * Protected route — requires broker or admin role.
 * In demo mode, renders with simulated data.
 */

import { useState } from 'react'
import ProcurementDashboard from '@/components/correspondence/ProcurementDashboard'
import DraftReview from '@/components/correspondence/DraftReview'
import CorrespondenceHistory from '@/components/correspondence/CorrespondenceHistory'
import SettlementInstructions from '@/components/correspondence/SettlementInstructions'
import ClientReporting from '@/components/correspondence/ClientReporting'

type CorrespondenceTab = 'procurement' | 'drafts' | 'negotiations' | 'settlement' | 'reports' | 'history'

export default function CorrespondencePage() {
  const [activeTab, setActiveTab] = useState<CorrespondenceTab>('procurement')
  const [pendingDraftCount, setPendingDraftCount] = useState(3)

  const tabs: { id: CorrespondenceTab; label: string; badge?: number }[] = [
    { id: 'procurement', label: 'Procurement' },
    { id: 'drafts', label: 'Drafts', badge: pendingDraftCount },
    { id: 'negotiations', label: 'Negotiations' },
    { id: 'settlement', label: 'Settlement' },
    { id: 'reports', label: 'Reports' },
    { id: 'history', label: 'History' },
  ]

  const handleGenerateRFQs = () => {
    // Increment pending count when new RFQs are generated (demo)
    setPendingDraftCount(prev => prev + 3)
  }

  return (
    <div className="min-h-screen bg-slate-50" data-demo="correspondence">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bloomberg-page-heading text-slate-800">Correspondence</h1>
              <p className="bloomberg-body-text text-slate-600 mt-1">
                Procurement, Negotiations, Settlement Facilitation, and Client Reporting
              </p>
            </div>
            <div className="bloomberg-section-label">COR</div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-t transition-colors ${
                  activeTab === tab.id
                    ? 'bg-slate-100 text-slate-800 border border-b-0 border-slate-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'procurement' && (
          <ProcurementDashboard
            onGenerateRFQs={handleGenerateRFQs}
            pendingDraftCount={pendingDraftCount}
          />
        )}

        {activeTab === 'drafts' && (
          <DraftReview />
        )}

        {activeTab === 'negotiations' && (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
            <p className="text-xs text-slate-500">
              Email negotiations are managed from the Drafts tab. Select a sent RFQ to view its negotiation thread.
            </p>
          </div>
        )}

        {activeTab === 'settlement' && (
          <SettlementInstructions />
        )}

        {activeTab === 'reports' && (
          <ClientReporting />
        )}

        {activeTab === 'history' && (
          <CorrespondenceHistory />
        )}
      </div>
    </div>
  )
}
