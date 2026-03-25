/**
 * Market Status Component - Market open/closed status indicator
 *
 * Shows current market status with timestamp and timezone information
 * Provides visual indicator of market connectivity and last update time
 */

'use client';

import React, { useState, useEffect } from 'react';
import { marketSimulator, MarketStatus as MarketStatusType } from '../../lib/ticker-data';

interface MarketStatusProps {
  showDetails?: boolean;
  className?: string;
}

const MarketStatus: React.FC<MarketStatusProps> = ({
  showDetails = true,
  className = '',
}) => {
  const [marketStatus, setMarketStatus] = useState<MarketStatusType>({
    isOpen: false,
    nextChange: 'Loading...',
    timezone: 'AEST',
    lastUpdate: new Date(),
  });
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    setConnectionStatus('connecting');

    // Get initial status
    setMarketStatus(marketSimulator.getMarketStatus());

    const unsubscribe = marketSimulator.subscribe(() => {
      setMarketStatus(marketSimulator.getMarketStatus());
      setConnectionStatus('connected');
    });

    // Update status every 30 seconds
    const statusInterval = setInterval(() => {
      setMarketStatus(marketSimulator.getMarketStatus());
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(statusInterval);
      setConnectionStatus('disconnected');
    };
  }, []);

  const statusConfig = {
    open: {
      badge: 'bg-green-100 text-green-800 border-green-200',
      dot: 'bg-green-500',
      text: 'Market Open',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
    },
    closed: {
      badge: 'bg-orange-100 text-orange-800 border-orange-200',
      dot: 'bg-orange-500',
      text: 'After Hours',
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  const config = marketStatus.isOpen ? statusConfig.open : statusConfig.closed;

  const connectionConfig = {
    connecting: {
      dot: 'bg-yellow-400 animate-pulse',
      text: 'Connecting...',
    },
    connected: {
      dot: 'bg-green-500',
      text: 'Live Data',
    },
    disconnected: {
      dot: 'bg-red-500',
      text: 'Disconnected',
    },
  };

  const connConfig = connectionConfig[connectionStatus];

  const formatLastUpdate = (date: Date): string => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      });
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Market Status Badge */}
      <div className={`
        flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium
        ${config.badge}
      `}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
        <span>{config.text}</span>
        {config.icon}
      </div>

      {/* Connection Status (if showing details) */}
      {showDetails && (
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className={`w-1.5 h-1.5 rounded-full ${connConfig.dot}`} />
          <span>{connConfig.text}</span>
        </div>
      )}

      {/* Last Update Time (if showing details) */}
      {showDetails && connectionStatus === 'connected' && (
        <div className="text-xs text-slate-400">
          Updated {formatLastUpdate(marketStatus.lastUpdate)}
        </div>
      )}

      {/* Next Change Info (if available and showing details) */}
      {showDetails && marketStatus.nextChange && marketStatus.nextChange !== "Market operates 24/7" && (
        <div className="text-xs text-slate-500">
          {marketStatus.nextChange}
        </div>
      )}

      {/* Timezone */}
      {showDetails && (
        <div className="text-xs text-slate-400 font-mono">
          {marketStatus.timezone}
        </div>
      )}
    </div>
  );
};

export default MarketStatus;