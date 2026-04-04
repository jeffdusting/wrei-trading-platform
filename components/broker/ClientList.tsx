'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClientSummary {
  id: string;
  name: string;
  entity_type: string;
  contact_name: string | null;
  contact_email: string | null;
  abn: string | null;
  annual_esc_target: number | null;
  annual_veec_target: number | null;
  is_active: boolean;
}

interface Props {
  onSelectClient?: (clientId: string) => void;
  selectedClientId?: string | null;
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface EBState { hasError: boolean; error?: Error }

class ClientListErrorBoundary extends React.Component<
  { children: React.ReactNode }, EBState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 rounded text-sm text-red-700">
          Client list unavailable: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Entity type labels
// ---------------------------------------------------------------------------

const ENTITY_LABELS: Record<string, string> = {
  acp: 'ACP',
  obligated_entity: 'Obligated Entity',
  government: 'Government',
  corporate: 'Corporate',
  institutional: 'Institutional',
};

const ENTITY_COLOURS: Record<string, string> = {
  acp: 'bg-blue-100 text-blue-800',
  obligated_entity: 'bg-amber-100 text-amber-800',
  government: 'bg-purple-100 text-purple-800',
  corporate: 'bg-green-100 text-green-800',
  institutional: 'bg-slate-100 text-slate-800',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ClientListInner({ onSelectClient, selectedClientId }: Props) {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClients(data.clients ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filtered = filterType === 'all'
    ? clients
    : clients.filter(c => c.entity_type === filterType);

  return (
    <div className="bg-white rounded border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bloomberg-data text-xs bg-slate-100 px-1 rounded">CLT</span>
          <h2 className="text-sm font-semibold text-slate-800">Client Portfolio</h2>
          <span className="text-xs text-slate-500">({filtered.length})</span>
        </div>

        {/* Filter */}
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700"
        >
          <option value="all">All Types</option>
          <option value="acp">ACP</option>
          <option value="obligated_entity">Obligated Entity</option>
          <option value="government">Government</option>
          <option value="corporate">Corporate</option>
          <option value="institutional">Institutional</option>
        </select>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="p-6 text-center text-sm text-slate-500">Loading clients...</div>
      )}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-2 font-medium text-slate-600">Client</th>
                <th className="px-4 py-2 font-medium text-slate-600">Type</th>
                <th className="px-4 py-2 font-medium text-slate-600">Contact</th>
                <th className="px-4 py-2 font-medium text-slate-600">ABN</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">ESC Target</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">VEEC Target</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No clients found
                  </td>
                </tr>
              )}
              {filtered.map(client => (
                <tr
                  key={client.id}
                  onClick={() => onSelectClient?.(client.id)}
                  className={`
                    border-b border-slate-100 cursor-pointer transition-colors
                    ${selectedClientId === client.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-800">{client.name}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ENTITY_COLOURS[client.entity_type] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ENTITY_LABELS[client.entity_type] ?? client.entity_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{client.contact_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-slate-600 font-mono">{client.abn ?? '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {client.annual_esc_target?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">
                    {client.annual_veec_target?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${client.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function ClientList(props: Props) {
  return (
    <ClientListErrorBoundary>
      <ClientListInner {...props} />
    </ClientListErrorBoundary>
  );
}
