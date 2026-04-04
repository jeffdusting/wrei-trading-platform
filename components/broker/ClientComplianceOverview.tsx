'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ClientComplianceRow {
  clientId: string;
  clientName: string;
  scheme: string;
  complianceYear: string;
  targetQuantity: number;
  surrenderedQuantity: number;
  shortfall: number;
  penaltyExposure: number;
  surrenderDeadline: string | null;
  status: string;
}

interface Props {
  onSelectClient?: (clientId: string) => void;
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface EBState { hasError: boolean; error?: Error }

class ComplianceErrorBoundary extends React.Component<
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
          Compliance overview unavailable: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtCurrency = (v: number) =>
  `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
};

const daysUntil = (d: string | null): number | null => {
  if (!d) return null;
  const diff = new Date(d).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

type TrafficLight = 'green' | 'amber' | 'red';

function getTrafficLight(row: ClientComplianceRow): TrafficLight {
  if (row.status === 'compliant') return 'green';
  if (row.status === 'shortfall' || row.status === 'penalty_paid') return 'red';

  const days = daysUntil(row.surrenderDeadline);
  const surrenderPct = row.targetQuantity > 0
    ? row.surrenderedQuantity / row.targetQuantity
    : 1;

  if (days != null && days <= 30 && row.shortfall > 0) return 'red';
  if (days != null && days <= 90 && surrenderPct < 0.8) return 'amber';
  if (row.shortfall <= 0) return 'green';
  return 'amber';
}

const TRAFFIC_STYLES: Record<TrafficLight, string> = {
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function ComplianceOverviewInner({ onSelectClient }: Props) {
  const [rows, setRows] = useState<ClientComplianceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'penaltyExposure' | 'shortfall' | 'clientName'>('penaltyExposure');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all clients, then fetch compliance for each
      const clientsRes = await fetch('/api/clients');
      if (!clientsRes.ok) throw new Error(`HTTP ${clientsRes.status}`);
      const { clients } = await clientsRes.json();

      if (!clients || clients.length === 0) {
        setRows([]);
        return;
      }

      // Fetch compliance for all clients in parallel
      const complianceResults = await Promise.all(
        clients.map(async (c: { id: string; name: string }) => {
          try {
            const res = await fetch(`/api/clients/${c.id}/compliance`);
            if (!res.ok) return [];
            const data = await res.json();
            return (data.records ?? []).map((r: {
              scheme: string;
              compliance_year: string;
              target_quantity: number;
              surrendered_quantity: number;
              shortfall: number;
              penalty_exposure: number | null;
              surrender_deadline: string | null;
              status: string;
            }) => ({
              clientId: c.id,
              clientName: c.name,
              scheme: r.scheme,
              complianceYear: r.compliance_year,
              targetQuantity: r.target_quantity,
              surrenderedQuantity: r.surrendered_quantity,
              shortfall: Math.max(0, r.shortfall),
              penaltyExposure: Number(r.penalty_exposure ?? 0),
              surrenderDeadline: r.surrender_deadline,
              status: r.status,
            }));
          } catch {
            return [];
          }
        })
      );

      setRows(complianceResults.flat());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'clientName' ? 'asc' : 'desc');
    }
  };

  const sorted = [...rows].sort((a, b) => {
    const mul = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'clientName') return mul * a.clientName.localeCompare(b.clientName);
    return mul * (a[sortField] - b[sortField]);
  });

  return (
    <div className="bg-white rounded border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
        <span className="bloomberg-data text-xs bg-slate-100 px-1 rounded">CMP</span>
        <h2 className="text-sm font-semibold text-slate-800">Client Compliance Overview</h2>
        <span className="text-xs text-slate-500">({rows.length} obligations)</span>
      </div>

      {loading && (
        <div className="p-6 text-center text-sm text-slate-500">Loading compliance data...</div>
      )}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-2 w-4" />
                <th
                  className="px-4 py-2 font-medium text-slate-600 cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('clientName')}
                >
                  Client {sortField === 'clientName' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 font-medium text-slate-600">Scheme</th>
                <th className="px-4 py-2 font-medium text-slate-600">Year</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">Target</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-right">Surrendered</th>
                <th
                  className="px-4 py-2 font-medium text-slate-600 text-right cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('shortfall')}
                >
                  Shortfall {sortField === 'shortfall' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th
                  className="px-4 py-2 font-medium text-slate-600 text-right cursor-pointer hover:text-slate-800"
                  onClick={() => toggleSort('penaltyExposure')}
                >
                  Penalty Exp. {sortField === 'penaltyExposure' && (sortDir === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-4 py-2 font-medium text-slate-600">Deadline</th>
                <th className="px-4 py-2 font-medium text-slate-600 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-6 text-center text-slate-500">
                    No compliance obligations recorded
                  </td>
                </tr>
              )}
              {sorted.map((row, i) => {
                const light = getTrafficLight(row);
                const days = daysUntil(row.surrenderDeadline);
                return (
                  <tr
                    key={`${row.clientId}-${row.scheme}-${row.complianceYear}-${i}`}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectClient?.(row.clientId)}
                  >
                    <td className="px-4 py-2">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${TRAFFIC_STYLES[light]}`} />
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-800">{row.clientName}</td>
                    <td className="px-4 py-2 text-slate-700">{row.scheme}</td>
                    <td className="px-4 py-2 font-mono text-slate-600">{row.complianceYear}</td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">
                      {row.targetQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-slate-700">
                      {row.surrenderedQuantity.toLocaleString()}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono font-semibold ${
                      row.shortfall > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {row.shortfall > 0 ? row.shortfall.toLocaleString() : '0'}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${
                      row.penaltyExposure > 0 ? 'text-red-600 font-semibold' : 'text-slate-600'
                    }`}>
                      {fmtCurrency(row.penaltyExposure)}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {fmtDate(row.surrenderDeadline)}
                      {days != null && days > 0 && days <= 90 && (
                        <span className={`ml-1 text-[10px] ${days <= 30 ? 'text-red-500' : 'text-amber-500'}`}>
                          ({days}d)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        row.status === 'compliant' ? 'bg-green-100 text-green-800' :
                        row.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                        row.status === 'shortfall' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {row.status.replace('_', ' ').toUpperCase()}
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
  );
}

export default function ClientComplianceOverview(props: Props) {
  return (
    <ComplianceErrorBoundary>
      <ComplianceOverviewInner {...props} />
    </ComplianceErrorBoundary>
  );
}
