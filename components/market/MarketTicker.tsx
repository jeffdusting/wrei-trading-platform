/**
 * Market Ticker Component - Scrolling real-time market data display
 *
 * Displays horizontally scrolling ticker tape with carbon credit and ESC prices
 * Updates in real-time with simulated market data from ticker-data.ts
 */

'use client';

import React, { useState, useEffect } from 'react';
import { marketSimulator, TickerData } from '../../lib/ticker-data';

interface MarketTickerProps {
  updateInterval?: number;
  showDetails?: boolean;
  className?: string;
}

interface TickerItemProps {
  ticker: TickerData;
  onClick?: (ticker: TickerData) => void;
}

const TickerItem: React.FC<TickerItemProps> = ({ ticker, onClick }) => {
  const changeColor = ticker.change >= 0 ? 'text-green-500' : 'text-red-500';
  const changeIcon = ticker.change >= 0 ? '▲' : '▼';

  const formattedPrice = ticker.currency === 'USD'
    ? `$${ticker.price.toFixed(2)}`
    : `A$${ticker.price.toFixed(2)}`;

  const formattedChange = ticker.change >= 0
    ? `+${ticker.change.toFixed(2)}`
    : `${ticker.change.toFixed(2)}`;

  const formattedPercent = ticker.changePercent >= 0
    ? `+${ticker.changePercent.toFixed(2)}%`
    : `${ticker.changePercent.toFixed(2)}%`;

  return (
    <div
      className={`
        flex items-center space-x-2 px-4 py-1 cursor-pointer hover:bg-slate-100
        transition-colors duration-200 border-r border-slate-200 whitespace-nowrap
        ${onClick ? 'hover:bg-slate-50' : ''}
      `}
      onClick={() => onClick?.(ticker)}
      title={`${ticker.name} - Click for details`}
    >
      {/* Symbol */}
      <span className="font-semibold text-slate-800 text-sm">
        {ticker.symbol}
      </span>

      {/* Price */}
      <span className="font-mono text-sm text-slate-700">
        {formattedPrice}
      </span>

      {/* Change with icon */}
      <span className={`font-mono text-sm ${changeColor} flex items-center space-x-1`}>
        <span className="text-xs">{changeIcon}</span>
        <span>{formattedChange}</span>
        <span>({formattedPercent})</span>
      </span>
    </div>
  );
};

const MarketTicker: React.FC<MarketTickerProps> = ({
  updateInterval = 5000,
  showDetails = false,
  className = '',
}) => {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<TickerData | null>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  useEffect(() => {
    setConnectionStatus('connecting');

    const unsubscribe = marketSimulator.subscribe((newTickers) => {
      setTickers(newTickers);
      setConnectionStatus('connected');
    });

    // Start the market simulator
    marketSimulator.startUpdates(updateInterval);

    return () => {
      unsubscribe();
      setConnectionStatus('disconnected');
    };
  }, [updateInterval]);

  const handleTickerClick = (ticker: TickerData) => {
    if (showDetails) {
      setSelectedTicker(ticker);
      setIsScrolling(false);
    }
  };

  const closeDetails = () => {
    setSelectedTicker(null);
    setIsScrolling(true);
  };

  const connectionDot = {
    connecting: 'bg-yellow-400 animate-pulse',
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
  }[connectionStatus];

  return (
    <div className={`bg-white border-b border-slate-200 ${className}`}>
      {/* Main ticker bar */}
      <div className="relative overflow-hidden">
        {/* Connection status */}
        <div className="absolute top-0 left-0 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-3 py-1">
          <div className={`w-2 h-2 rounded-full ${connectionDot}`} />
          <span className="text-xs text-slate-500 font-medium">
            LIVE MARKET DATA
          </span>
        </div>

        {/* Scrolling ticker content */}
        <div className={`flex ${isScrolling ? 'animate-scroll-ticker' : ''}`}>
          {/* First set of tickers */}
          <div className="flex">
            {tickers.map((ticker) => (
              <TickerItem
                key={ticker.symbol}
                ticker={ticker}
                onClick={showDetails ? handleTickerClick : undefined}
              />
            ))}
          </div>

          {/* Duplicate set for seamless scrolling */}
          {isScrolling && (
            <div className="flex">
              {tickers.map((ticker) => (
                <TickerItem
                  key={`duplicate-${ticker.symbol}`}
                  ticker={ticker}
                  onClick={showDetails ? handleTickerClick : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details panel */}
      {showDetails && selectedTicker && (
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-800">
                  {selectedTicker.name}
                </h3>
                <span className="text-sm text-slate-500 font-mono">
                  {selectedTicker.symbol}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500 block">Current Price</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedTicker.currency === 'USD'
                      ? `$${selectedTicker.price.toFixed(2)}`
                      : `A$${selectedTicker.price.toFixed(2)}`
                    }
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">24h Change</span>
                  <span className={`font-mono font-semibold ${
                    selectedTicker.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {selectedTicker.change >= 0 ? '+' : ''}{selectedTicker.change.toFixed(2)}
                    ({selectedTicker.changePercent >= 0 ? '+' : ''}{selectedTicker.changePercent.toFixed(2)}%)
                  </span>
                </div>

                {selectedTicker.high24h && (
                  <div>
                    <span className="text-slate-500 block">24h High</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedTicker.currency === 'USD'
                        ? `$${selectedTicker.high24h.toFixed(2)}`
                        : `A$${selectedTicker.high24h.toFixed(2)}`
                      }
                    </span>
                  </div>
                )}

                {selectedTicker.low24h && (
                  <div>
                    <span className="text-slate-500 block">24h Low</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedTicker.currency === 'USD'
                        ? `$${selectedTicker.low24h.toFixed(2)}`
                        : `A$${selectedTicker.low24h.toFixed(2)}`
                      }
                    </span>
                  </div>
                )}

                {selectedTicker.volume && (
                  <div>
                    <span className="text-slate-500 block">Volume (24h)</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {selectedTicker.volume.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Last updated: {selectedTicker.timestamp.toLocaleTimeString()}
              </div>
            </div>

            <button
              onClick={closeDetails}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Custom CSS for scrolling animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-ticker {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-ticker {
            animation: scroll-ticker 60s linear infinite;
          }
          .animate-scroll-ticker:hover {
            animation-play-state: paused;
          }
        `
      }} />
    </div>
  );
};

export default MarketTicker;