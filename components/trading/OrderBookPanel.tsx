'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { InstrumentType } from '@/lib/trading/instruments/types';
import {
  generateOrderBook,
  perturbOrderBook,
  type OrderBookSnapshot,
  type OrderBookLevel,
} from '@/lib/trading/orderbook/orderbook-simulator';

// ---------------------------------------------------------------------------
// Error Boundary — per WP6 §3.6, panel crashes don't break the trading UI
// ---------------------------------------------------------------------------

interface ErrorBoundaryState { hasError: boolean; error?: Error }

class OrderBookErrorBoundary extends React.Component<
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
          <div className="text-[#FF4757] font-bold mb-2">ORDER BOOK — ERROR</div>
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

interface OrderBookPanelProps {
  instrumentType: InstrumentType;
  spotPrice?: number;
  updateIntervalMs?: number;
}

// ---------------------------------------------------------------------------
// Depth bar component
// ---------------------------------------------------------------------------

function DepthBar({ ratio, side }: { ratio: number; side: 'bid' | 'ask' }) {
  const colour = side === 'bid' ? 'bg-[#00C896]/20' : 'bg-[#FF4757]/20';
  const width = `${Math.min(100, ratio * 100)}%`;
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className={`h-full ${colour} ${side === 'bid' ? 'ml-auto' : ''}`}
        style={{ width }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Level row
// ---------------------------------------------------------------------------

function LevelRow({
  level,
  side,
  maxTotal,
  currency,
}: {
  level: OrderBookLevel;
  side: 'bid' | 'ask';
  maxTotal: number;
  currency: string;
}) {
  const priceColour = side === 'bid' ? 'text-[#00C896]' : 'text-[#FF4757]';
  const ratio = maxTotal > 0 ? level.total / maxTotal : 0;
  const prefix = currency === 'AUD' ? 'A$' : '$';

  return (
    <div className="relative flex items-center text-xs font-mono h-[22px] px-2 hover:bg-white/5">
      <DepthBar ratio={ratio} side={side} />
      <span className={`relative z-10 w-[72px] text-right ${priceColour}`}>
        {prefix}{level.price.toFixed(2)}
      </span>
      <span className="relative z-10 w-[72px] text-right text-[#E5E7EB]">
        {level.quantity.toLocaleString()}
      </span>
      <span className="relative z-10 w-[72px] text-right text-[#6B7280]">
        {level.total.toLocaleString()}
      </span>
      <span className="relative z-10 w-[36px] text-right text-[#6B7280]">
        {level.orderCount}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main panel (inner, unwrapped)
// ---------------------------------------------------------------------------

function OrderBookInner({ instrumentType, spotPrice, updateIntervalMs = 5000 }: OrderBookPanelProps) {
  const [book, setBook] = useState<OrderBookSnapshot | null>(null);
  const bookRef = useRef<OrderBookSnapshot | null>(null);

  // Generate initial book when instrument changes
  useEffect(() => {
    const initial = generateOrderBook(instrumentType, spotPrice);
    bookRef.current = initial;
    setBook(initial);
  }, [instrumentType, spotPrice]);

  // Periodic perturbation
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookRef.current) {
        const updated = perturbOrderBook(bookRef.current);
        bookRef.current = updated;
        setBook(updated);
      }
    }, updateIntervalMs);
    return () => clearInterval(interval);
  }, [updateIntervalMs]);

  // Force refresh
  const handleRefresh = useCallback(() => {
    const fresh = generateOrderBook(instrumentType, spotPrice);
    bookRef.current = fresh;
    setBook(fresh);
  }, [instrumentType, spotPrice]);

  if (!book) return null;

  const maxBidTotal = book.bids[book.bids.length - 1]?.total ?? 1;
  const maxAskTotal = book.asks[book.asks.length - 1]?.total ?? 1;
  const currency = book.bids[0]?.price !== undefined ? (instrumentType.startsWith('WREI') ? 'USD' : 'AUD') : 'AUD';
  const prefix = currency === 'AUD' ? 'A$' : '$';

  return (
    <div className="bg-[#0A0A0B] border border-[#2A2A2B] text-[#E5E7EB] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2A2A2B] bg-[#1A1A1B]">
        <div className="flex items-center gap-2">
          <span className="text-[#FF6B1A] font-bold">DEPTH</span>
          <span className="text-[#6B7280]">{instrumentType}</span>
          <span className="text-[10px] text-[#6B7280] bg-[#2A2A2B] px-1.5 py-0.5 rounded">Simulated</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#6B7280]">
            Sprd: {prefix}{book.spread.toFixed(2)} ({book.spreadPct.toFixed(2)}%)
          </span>
          <button
            onClick={handleRefresh}
            className="text-[#6B7280] hover:text-[#FF6B1A] transition-colors"
            title="Refresh order book"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center text-[10px] text-[#6B7280] px-2 py-1 border-b border-[#2A2A2B]/50 uppercase tracking-wider">
        <span className="w-[72px] text-right">Price</span>
        <span className="w-[72px] text-right">Qty</span>
        <span className="w-[72px] text-right">Total</span>
        <span className="w-[36px] text-right">Ord</span>
      </div>

      {/* Asks (reversed so best ask is at bottom, nearest spread) */}
      <div className="border-b border-[#2A2A2B]/30">
        {[...book.asks].reverse().map((level, i) => (
          <LevelRow
            key={`ask-${i}`}
            level={level}
            side="ask"
            maxTotal={maxAskTotal}
            currency={currency}
          />
        ))}
      </div>

      {/* Spread / Mid indicator */}
      <div className="flex items-center justify-center gap-3 py-1 bg-[#1A1A1B] border-y border-[#FF6B1A]/20 text-[11px]">
        <span className="text-[#FF6B1A] font-bold">{prefix}{book.midPrice.toFixed(2)}</span>
        <span className="text-[#6B7280]">MID</span>
      </div>

      {/* Bids */}
      <div>
        {book.bids.map((level, i) => (
          <LevelRow
            key={`bid-${i}`}
            level={level}
            side="bid"
            maxTotal={maxBidTotal}
            currency={currency}
          />
        ))}
      </div>

      {/* Footer — last updated */}
      <div className="px-3 py-1 border-t border-[#2A2A2B] text-[10px] text-[#6B7280] flex justify-between">
        <span>
          {book.bids.length + book.asks.length} levels
        </span>
        <span>
          Updated {new Date(book.lastUpdated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exported component — wrapped in Error Boundary
// ---------------------------------------------------------------------------

export default function OrderBookPanel(props: OrderBookPanelProps) {
  return (
    <OrderBookErrorBoundary>
      <OrderBookInner {...props} />
    </OrderBookErrorBoundary>
  );
}
