'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ClientInfo {
  id: string;
  name: string;
  entity_type: string;
  contact_name: string | null;
  contact_email: string | null;
  abn: string | null;
  annual_esc_target: number | null;
  annual_veec_target: number | null;
  ess_participant_id: string | null;
  safeguard_facility_id: string | null;
  is_active: boolean;
}

interface Holding {
  id: string;
  instrument_type: string;
  quantity: number;
  average_cost: number | null;
  total_cost: number | null;
  vintage: string | null;
  status: string;
}

interface SurrenderRecord {
  id: string;
  compliance_year: string;
  scheme: string;
  target_quantity: number;
  surrendered_quantity: number;
  shortfall: number;
  penalty_rate: number | null;
  penalty_exposure: number | null;
  surrender_deadline: string | null;
  status: string;
}

interface Props {
  clientId: string;
  onBack?: () => void;
}

interface EBState { hasError: boolean; error?: Error }
class DetailErrorBoundary extends React.Component<{ children: React.ReactNode }, EBState> {
  state: EBState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return <div className="p-4 border border-red-200 bg-red-50 rounded text-sm text-red-700">Client detail unavailable: {this.state.error?.message}</div>;
    return this.props.children;
  }
}

const fmtCurrency = (v: number | null) =>
  v != null ? `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const daysUntil = (d: string | null): number | null =>
  d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000) : null;
const complianceColour = (s: string) =>
  s === 'compliant' ? 'bg-green-100 text-green-800' :
  s === 'in_progress' ? 'bg-amber-100 text-amber-800' :
  s === 'shortfall' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600';

function ClientDetailInner({ clientId, onBack }: Props) {
  const [client, setClient] = useState<ClientInfo | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [compliance, setCompliance] = useState<SurrenderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClient(data.client);
      setHoldings(data.holdings ?? []);
      setCompliance(data.compliance ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  if (loading) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading client detail...</div>;
  }
  if (error || !client) {
    return <div className="p-4 text-sm text-red-600 bg-red-50 rounded">{error ?? 'Client not found'}</div>;
  }

  // Group holdings by instrument type
  const holdingGroups: Record<string, { items: Holding[]; totalQty: number; totalCost: number }> = {};
  for (const h of holdings) {
    if (!holdingGroups[h.instrument_type]) {
      holdingGroups[h.instrument_type] = { items: [], totalQty: 0, totalCost: 0 };
    }
    holdingGroups[h.instrument_type].items.push(h);
    holdingGroups[h.instrument_type].totalQty += h.quantity;
    holdingGroups[h.instrument_type].totalCost += Number(h.total_cost ?? 0);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded border border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800">
                &larr; Back
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-800">{client.name}</h2>
                <span className={`inline-block w-2 h-2 rounded-full ${client.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {client.entity_type.replace('_', ' ').toUpperCase()}
                {client.abn && <> &middot; ABN {client.abn}</>}
                {client.contact_name && <> &middot; {client.contact_name}</>}
                {client.contact_email && <> &middot; {client.contact_email}</>}
              </div>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-right">
            {client.ess_participant_id && <div>ESS ID: {client.ess_participant_id}</div>}
            {client.safeguard_facility_id && <div>Safeguard: {client.safeguard_facility_id}</div>}
          </div>
        </div>
      </div>

      {/* Holdings Panel */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <span className="bloomberg-data text-xs bg-slate-100 px-1 rounded">HLD</span>
          <h3 className="text-xs font-semibold text-slate-700">Certificate Holdings</h3>
          <span className="text-xs text-slate-500">({holdings.length} positions)</span>
        </div>

        {holdings.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 text-center">No holdings recorded</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-4 py-2 font-medium text-slate-600">Instrument</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Vintage</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Quantity</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Avg Cost</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Total Cost</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(holdingGroups).map(([type, group]) => (
                  <React.Fragment key={type}>
                    {group.items.map(h => (
                      <tr key={h.id} className="border-b border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-800">{h.instrument_type}</td>
                        <td className="px-4 py-2 text-slate-600 font-mono">{h.vintage ?? '—'}</td>
                        <td className="px-4 py-2 text-right font-mono text-slate-700">
                          {h.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-slate-700">
                          {fmtCurrency(h.average_cost)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono text-slate-700">
                          {fmtCurrency(h.total_cost)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            h.status === 'held' ? 'bg-green-100 text-green-700' :
                            h.status === 'pending_transfer' ? 'bg-amber-100 text-amber-700' :
                            h.status === 'surrendered' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {h.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Subtotal row */}
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td className="px-4 py-1.5 font-semibold text-slate-700" colSpan={2}>
                        {type} Subtotal
                      </td>
                      <td className="px-4 py-1.5 text-right font-mono font-semibold text-slate-800">
                        {group.totalQty.toLocaleString()}
                      </td>
                      <td className="px-4 py-1.5" />
                      <td className="px-4 py-1.5 text-right font-mono font-semibold text-slate-800">
                        {fmtCurrency(group.totalCost)}
                      </td>
                      <td />
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compliance Panel */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
          <span className="bloomberg-data text-xs bg-slate-100 px-1 rounded">CMP</span>
          <h3 className="text-xs font-semibold text-slate-700">Surrender Tracking</h3>
        </div>

        {compliance.length === 0 ? (
          <div className="p-4 text-xs text-slate-500 text-center">No surrender obligations recorded</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-4 py-2 font-medium text-slate-600">Year</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Scheme</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Target</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Surrendered</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Shortfall</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-right">Penalty Exp.</th>
                  <th className="px-4 py-2 font-medium text-slate-600">Deadline</th>
                  <th className="px-4 py-2 font-medium text-slate-600 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {compliance.map(r => {
                  const days = daysUntil(r.surrender_deadline);
                  return (
                    <tr key={r.id} className="border-b border-slate-100">
                      <td className="px-4 py-2 font-mono text-slate-700">{r.compliance_year}</td>
                      <td className="px-4 py-2 font-medium text-slate-800">{r.scheme}</td>
                      <td className="px-4 py-2 text-right font-mono text-slate-700">
                        {r.target_quantity.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-700">
                        {r.surrendered_quantity.toLocaleString()}
                      </td>
                      <td className={`px-4 py-2 text-right font-mono font-semibold ${
                        r.shortfall > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {r.shortfall > 0 ? r.shortfall.toLocaleString() : '0'}
                      </td>
                      <td className={`px-4 py-2 text-right font-mono ${
                        Number(r.penalty_exposure ?? 0) > 0 ? 'text-red-600 font-semibold' : 'text-slate-600'
                      }`}>
                        {fmtCurrency(r.penalty_exposure)}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {fmtDate(r.surrender_deadline)}
                        {days != null && days > 0 && days <= 90 && (
                          <span className={`ml-1 text-[10px] ${days <= 30 ? 'text-red-500' : 'text-amber-500'}`}>
                            ({days}d)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${complianceColour(r.status)}`}>
                          {r.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ClientDetail(props: Props) {
  return (
    <DetailErrorBoundary>
      <ClientDetailInner {...props} />
    </DetailErrorBoundary>
  );
}
