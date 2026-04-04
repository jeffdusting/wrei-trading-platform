/**
 * Feed Health Indicator — Bloomberg Terminal status bar widget
 *
 * Displays the current data feed status:
 *  - Green dot + "Live"                 when scraper data < 24h old
 *  - Amber dot + "Cached [timestamp]"   when using stale data
 *  - Grey dot  + "Simulated"            when using simulation engine
 *
 * Wrapped in Error Boundary so feed display failure does not affect trading.
 */

'use client';

import React, { useState, useEffect, Component, ReactNode } from 'react';

interface FeedHealthData {
  overall: 'live' | 'cached' | 'simulated';
  lastRefresh: string | null;
}

// ---------------------------------------------------------------------------
// Error Boundary
// ---------------------------------------------------------------------------

interface ErrorBoundaryState {
  hasError: boolean;
}

class FeedHealthErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center gap-2">
          <div className="w-[6px] h-[6px] rounded-full bg-gray-400" />
          <span className="bloomberg-small-text text-slate-400">FEED N/A</span>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Indicator component
// ---------------------------------------------------------------------------

const STATUS_CONFIG = {
  live: {
    dotClass: 'bg-green-500',
    label: 'LIVE',
    textClass: 'text-green-600',
  },
  cached: {
    dotClass: 'bg-amber-400',
    label: 'CACHED',
    textClass: 'text-amber-600',
  },
  simulated: {
    dotClass: 'bg-gray-400',
    label: 'SIMULATED',
    textClass: 'text-gray-500',
  },
} as const;

function FeedHealthIndicatorInner() {
  const [health, setHealth] = useState<FeedHealthData>({
    overall: 'simulated',
    lastRefresh: null,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchHealth() {
      try {
        const res = await fetch('/api/prices');
        if (res.ok && mounted) {
          const data = await res.json();
          if (data.health) {
            setHealth({
              overall: data.health.overall,
              lastRefresh: data.health.lastRefresh,
            });
          }
        }
      } catch {
        // Silently fail — indicator stays on last known state
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 60_000); // Refresh every 60s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const config = STATUS_CONFIG[health.overall];

  const timeLabel = health.overall === 'cached' && health.lastRefresh
    ? ` ${new Date(health.lastRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <div className="flex items-center gap-2" title={`Market data: ${health.overall}`}>
      <span className="bloomberg-small-text text-slate-400">MARKET DATA</span>
      <div className={`w-[6px] h-[6px] rounded-full ${config.dotClass}`} />
      <span className={`bloomberg-small-text ${config.textClass}`}>
        {config.label}{timeLabel}
      </span>
    </div>
  );
}

export default function FeedHealthIndicator() {
  return (
    <FeedHealthErrorBoundary>
      <FeedHealthIndicatorInner />
    </FeedHealthErrorBoundary>
  );
}
