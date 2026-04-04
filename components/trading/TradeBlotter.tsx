'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateTradeReportCsv, downloadCsv } from '@/lib/trading/compliance/report-generator';
import type { TradeRecord } from '@/lib/trading/compliance/report-generator';

// ---------------------------------------------------------------------------
// Types — mirrored from lib/db/queries/trades.ts (client-safe subset)
// ---------------------------------------------------------------------------

export interface BlotterTrade {
  id: string;
  instrument_id: string;
  negotiation_id: string | null;
  direction: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
  total_value: number;
  currency: string;
  buyer_persona: string | null;
  status: 'pending' | 'confirmed' | 'settled' | 'cancelled';
  executed_at: string;
  settled_at: string | null;
}

type SortField = 'executed_at' | 'instrument_id' | 'direction' | 'quantity' | 'price_per_unit' | 'total_value' | 'status';
type SortDir = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Error Boundary — per WP6 §3.6
// ---------------------------------------------------------------------------

interface ErrorBoundaryState { hasError: boolean; error?: Error }

class BlotterErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-[#FF4757]/30 bg-[#0A0A0B] p-4 font-mono text-xs">
          <div className="text-[#FF4757] font-bold mb-2">TRADE BLOTTER — ERROR</div>
          <div className="text-[#6B7280] mb-3">
            {this.state.error?.message ?? 'Component failed to render'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-3 py-1 bg-[#1A1A1B] border border-[#6B7280]/30 text-[#FF6B1A] hover:bg-[#2A2A2B] text-xs"
          >
            RETRY
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TradeBlotterProps {
  /** Trades injected from parent (e.g. just-completed trades) */
  localTrades?: BlotterTrade[];
  /** Filter to specific instrument */
  instrumentFilter?: string;
  /** Max rows per page */
  pageSize?: number;
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<string, string> = {
  pending:   'text-[#F59E0B] bg-[#F59E0B]/10',
  confirmed: 'text-[#00C896] bg-[#00C896]/10',
  settled:   'text-[#0EA5E9] bg-[#0EA5E9]/10',
  cancelled: 'text-[#FF4757] bg-[#FF4757]/10',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[status] ?? 'text-[#6B7280]'}`}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Sort arrow
// ---------------------------------------------------------------------------

function SortArrow({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <span className="text-[#6B7280]/30 ml-0.5">▼</span>;
  return <span className="text-[#FF6B1A] ml-0.5">{sortDir === 'asc' ? '▲' : '▼'}</span>;
}

// ---------------------------------------------------------------------------
// Inner component
// ---------------------------------------------------------------------------

function BlotterInner({ localTrades = [], instrumentFilter, pageSize = 20 }: TradeBlotterProps) {
  const [dbTrades, setDbTrades] = useState<BlotterTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>('executed_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [instrFilter, setInstrFilter] = useState<string>(instrumentFilter ?? 'all');

  // Fetch trades from API
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const params = new URLSearchParams();
      if (instrFilter !== 'all') params.set('instrument_id', instrFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/trades?${params.toString()}`);
      if (!res.ok) {
        // API may not exist yet — gracefully degrade
        setDbTrades([]);
        return;
      }
      const data = await res.json();
      setDbTrades(data.trades ?? []);
    } catch {
      // DB not available — show local trades only
      setDbTrades([]);
      setDbError('Database unavailable — showing local trades only');
    } finally {
      setLoading(false);
    }
  }, [instrFilter, statusFilter]);

  useEffect(() => { fetchTrades(); }, [fetchTrades]);

  // Sync instrument filter prop
  useEffect(() => {
    if (instrumentFilter) setInstrFilter(instrumentFilter);
  }, [instrumentFilter]);

  // Merge DB trades with local (dedup by id)
  const allTrades = useMemo(() => {
    const map = new Map<string, BlotterTrade>();
    for (const t of dbTrades) map.set(t.id, t);
    for (const t of localTrades) map.set(t.id, t); // Local overrides DB
    return Array.from(map.values());
  }, [dbTrades, localTrades]);

  // Sort
  const sorted = useMemo(() => {
    const copy = [...allTrades];
    copy.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [allTrades, sortField, sortDir]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const instruments = useMemo(() => {
    const set = new Set(allTrades.map(t => t.instrument_id));
    return Array.from(set).sort();
  }, [allTrades]);

  return (
    <div className="bg-[#0A0A0B] border border-[#2A2A2B] text-[#E5E7EB] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2A2A2B] bg-[#1A1A1B]">
        <div className="flex items-center gap-2">
          <span className="text-[#FF6B1A] font-bold">BLOTTER</span>
          <span className="text-[#6B7280]">{sorted.length} trades</span>
          {loading && <span className="text-[#F59E0B] animate-pulse">LOADING</span>}
        </div>
        <div className="flex items-center gap-2">
          {/* Instrument filter */}
          <select
            value={instrFilter}
            onChange={e => { setInstrFilter(e.target.value); setPage(0); }}
            className="bg-[#1A1A1B] border border-[#2A2A2B] text-[#E5E7EB] text-[10px] px-1 py-0.5"
          >
            <option value="all">ALL INSTR</option>
            {instruments.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
            className="bg-[#1A1A1B] border border-[#2A2A2B] text-[#E5E7EB] text-[10px] px-1 py-0.5"
          >
            <option value="all">ALL STATUS</option>
            <option value="pending">PENDING</option>
            <option value="confirmed">CONFIRMED</option>
            <option value="settled">SETTLED</option>
            <option value="cancelled">CANCELLED</option>
          </select>
          <button
            onClick={() => {
              const records: TradeRecord[] = sorted.map(t => ({
                ...t,
                ai_assisted: t.negotiation_id != null,
              }));
              const csv = generateTradeReportCsv(records);
              downloadCsv(csv, `wrei-trade-report-${new Date().toISOString().slice(0, 10)}.csv`);
            }}
            className="text-[#6B7280] hover:text-[#FF6B1A] transition-colors"
            title="Export trades as CSV"
          >
            CSV
          </button>
          <button
            onClick={fetchTrades}
            className="text-[#6B7280] hover:text-[#FF6B1A] transition-colors"
            title="Refresh blotter"
          >
            ↻
          </button>
        </div>
      </div>

      {/* DB error banner */}
      {dbError && (
        <div className="px-3 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-[10px]">
          {dbError}
        </div>
      )}

      {/* Column headers */}
      <div className="flex items-center text-[10px] text-[#6B7280] px-2 py-1 border-b border-[#2A2A2B]/50 uppercase tracking-wider">
        <button className="w-[130px] text-left flex items-center" onClick={() => toggleSort('executed_at')}>
          Time<SortArrow field="executed_at" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[60px] text-left flex items-center" onClick={() => toggleSort('instrument_id')}>
          Instr<SortArrow field="instrument_id" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[40px] text-left flex items-center" onClick={() => toggleSort('direction')}>
          Side<SortArrow field="direction" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[64px] text-right flex items-center justify-end" onClick={() => toggleSort('quantity')}>
          Qty<SortArrow field="quantity" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[72px] text-right flex items-center justify-end" onClick={() => toggleSort('price_per_unit')}>
          Price<SortArrow field="price_per_unit" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[80px] text-right flex items-center justify-end" onClick={() => toggleSort('total_value')}>
          Value<SortArrow field="total_value" sortField={sortField} sortDir={sortDir} />
        </button>
        <button className="w-[64px] text-center flex items-center justify-center" onClick={() => toggleSort('status')}>
          Status<SortArrow field="status" sortField={sortField} sortDir={sortDir} />
        </button>
        <span className="flex-1 text-right">ID</span>
      </div>

      {/* Rows */}
      {paged.length === 0 ? (
        <div className="px-3 py-6 text-center text-[#6B7280]">
          No trades recorded
        </div>
      ) : (
        paged.map(trade => {
          const sideColour = trade.direction === 'buy' ? 'text-[#00C896]' : 'text-[#FF4757]';
          const currSymbol = trade.currency === 'AUD' ? 'A$' : '$';
          const ts = new Date(trade.executed_at);
          const timeStr = `${ts.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit' })} ${ts.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`;

          return (
            <div
              key={trade.id}
              className="flex items-center px-2 h-[24px] hover:bg-white/5 border-b border-[#2A2A2B]/20"
            >
              <span className="w-[130px] text-[#6B7280]">{timeStr}</span>
              <span className="w-[60px] text-[#E5E7EB]">{trade.instrument_id}</span>
              <span className={`w-[40px] font-bold uppercase ${sideColour}`}>
                {trade.direction === 'buy' ? 'BUY' : 'SELL'}
              </span>
              <span className="w-[64px] text-right text-[#E5E7EB]">
                {trade.quantity.toLocaleString()}
              </span>
              <span className="w-[72px] text-right text-[#E5E7EB]">
                {currSymbol}{trade.price_per_unit.toFixed(2)}
              </span>
              <span className="w-[80px] text-right text-[#E5E7EB]">
                {currSymbol}{trade.total_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="w-[64px] text-center">
                <StatusBadge status={trade.status} />
              </span>
              <span className="flex-1 text-right text-[#6B7280] truncate pl-1" title={trade.id}>
                {trade.id.slice(0, 8)}
              </span>
            </div>
          );
        })
      )}

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[#2A2A2B] text-[10px] text-[#6B7280]">
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-0.5 bg-[#1A1A1B] border border-[#2A2A2B] disabled:opacity-30 hover:text-[#FF6B1A]"
          >
            ◀ PREV
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-0.5 bg-[#1A1A1B] border border-[#2A2A2B] disabled:opacity-30 hover:text-[#FF6B1A]"
          >
            NEXT ▶
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported component — wrapped in Error Boundary
// ---------------------------------------------------------------------------

export default function TradeBlotter(props: TradeBlotterProps) {
  return (
    <BlotterErrorBoundary>
      <BlotterInner {...props} />
    </BlotterErrorBoundary>
  );
}
