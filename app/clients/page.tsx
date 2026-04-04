'use client';

import { useState } from 'react';
import ClientList from '@/components/broker/ClientList';
import ClientDetail from '@/components/broker/ClientDetail';
import ClientComplianceOverview from '@/components/broker/ClientComplianceOverview';

export default function ClientsPage() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  return (
    <div className="p-4 space-y-4 max-w-[1600px] mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-2">
        <span className="bloomberg-data text-xs bg-slate-100 px-1.5 py-0.5 rounded font-medium">CLT</span>
        <h1 className="text-base font-semibold text-slate-800">Client Management</h1>
      </div>

      {selectedClientId ? (
        /* Detail view */
        <ClientDetail
          clientId={selectedClientId}
          onBack={() => setSelectedClientId(null)}
        />
      ) : (
        /* List + compliance overview */
        <div className="space-y-4">
          <ClientList
            onSelectClient={setSelectedClientId}
            selectedClientId={selectedClientId}
          />
          <ClientComplianceOverview
            onSelectClient={setSelectedClientId}
          />
        </div>
      )}
    </div>
  );
}
