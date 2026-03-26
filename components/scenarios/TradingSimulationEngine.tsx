/**
 * WREI Trading Platform - Trading Simulation Engine
 *
 * Step 1.3: Scenario Library & Templates - Multi-Participant Trading Simulations
 * Advanced trading simulation engine for NSW ESC multi-participant scenarios
 *
 * Date: March 25, 2026
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  UserGroupIcon,
  BoltIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

import {
  TradingSimulation,
  MarketParticipant,
  Order,
  SimulationMetrics
} from './types';
import { AudienceType } from '../audience';
import { useDemoMode } from '../../lib/demo-mode/demo-state-manager';

interface TradingSimulationEngineProps {
  simulationConfig?: any;
  selectedAudience?: AudienceType;
  onComplete?: (results: SimulationMetrics) => void;
  onBack?: () => void;
}

interface LiveTrade {
  id: string;
  buyer: string;
  seller: string;
  volume: number;
  price: number;
  status: 'negotiating' | 'agreed' | 'settled';
  timestamp: Date;
  negotiationRound: number;
}

interface MarketUpdate {
  timestamp: Date;
  event_type: 'price_update' | 'volume_change' | 'new_participant' | 'trade_completed';
  details: string;
  impact: 'positive' | 'negative' | 'neutral';
}

const TradingSimulationEngine: React.FC<TradingSimulationEngineProps> = ({
  simulationConfig,
  selectedAudience,
  onComplete,
  onBack
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Simulation time in seconds
  const [participants, setParticipants] = useState<MarketParticipant[]>([]);
  const [activeTrades, setActiveTrades] = useState<LiveTrade[]>([]);
  const [marketUpdates, setMarketUpdates] = useState<MarketUpdate[]>([]);
  const [currentPrice, setCurrentPrice] = useState(47.80);
  const [totalVolume, setTotalVolume] = useState(0);
  const [priceHistory, setPriceHistory] = useState<Array<{ time: number; price: number }>>([]);

  const simulationInterval = useRef<NodeJS.Timeout | null>(null);
  const demoMode = useDemoMode();

  // Initialize market participants
  const initializeParticipants = (): MarketParticipant[] => [
    {
      id: 'northmore-gordon-buyer',
      type: 'buyer',
      name: 'Northmore Gordon Pty Ltd',
      profile: {
        risk_tolerance: 'medium',
        experience_level: 'expert',
        preferred_price_range: [44.00, 52.00],
        volume_capacity: 5000,
        response_speed: 'fast',
        negotiation_style: 'balanced'
      },
      strategy: {
        approach: 'balanced',
        concession_rate: 0.02,
        max_rounds: 8,
        break_points: [46.00, 48.50, 51.00]
      },
      current_position: {
        volume_held: 0,
        cash_available: 250000,
        open_orders: []
      }
    },
    {
      id: 'greentech-seller',
      type: 'seller',
      name: 'GreenTech Solutions',
      profile: {
        risk_tolerance: 'low',
        experience_level: 'experienced',
        preferred_price_range: [46.00, 50.00],
        volume_capacity: 2000,
        response_speed: 'medium',
        negotiation_style: 'conservative'
      },
      strategy: {
        approach: 'price-focused',
        concession_rate: 0.015,
        max_rounds: 6,
        break_points: [47.00, 48.50]
      },
      current_position: {
        volume_held: 1800,
        cash_available: 0,
        open_orders: []
      }
    },
    {
      id: 'esc-trading-seller',
      type: 'seller',
      name: 'ESC Trading Corp',
      profile: {
        risk_tolerance: 'high',
        experience_level: 'expert',
        preferred_price_range: [45.00, 49.00],
        volume_capacity: 3000,
        response_speed: 'fast',
        negotiation_style: 'aggressive'
      },
      strategy: {
        approach: 'volume-focused',
        concession_rate: 0.025,
        max_rounds: 5,
        break_points: [46.50, 48.00]
      },
      current_position: {
        volume_held: 2500,
        cash_available: 0,
        open_orders: []
      }
    },
    {
      id: 'carbon-solutions-buyer',
      type: 'buyer',
      name: 'Carbon Solutions Ltd',
      profile: {
        risk_tolerance: 'high',
        experience_level: 'experienced',
        preferred_price_range: [43.00, 48.00],
        volume_capacity: 1500,
        response_speed: 'fast',
        negotiation_style: 'aggressive'
      },
      strategy: {
        approach: 'price-focused',
        concession_rate: 0.03,
        max_rounds: 4,
        break_points: [45.00, 47.00]
      },
      current_position: {
        volume_held: 0,
        cash_available: 75000,
        open_orders: []
      }
    },
    {
      id: 'renewable-energy-seller',
      type: 'seller',
      name: 'Renewable Energy Partners',
      profile: {
        risk_tolerance: 'medium',
        experience_level: 'experienced',
        preferred_price_range: [46.50, 51.00],
        volume_capacity: 1800,
        response_speed: 'medium',
        negotiation_style: 'balanced'
      },
      strategy: {
        approach: 'balanced',
        concession_rate: 0.02,
        max_rounds: 6,
        break_points: [47.50, 49.00]
      },
      current_position: {
        volume_held: 1600,
        cash_available: 0,
        open_orders: []
      }
    },
    {
      id: 'institutional-buyer',
      type: 'buyer',
      name: 'Institutional Carbon Fund',
      profile: {
        risk_tolerance: 'low',
        experience_level: 'expert',
        preferred_price_range: [45.00, 50.00],
        volume_capacity: 4000,
        response_speed: 'slow',
        negotiation_style: 'conservative'
      },
      strategy: {
        approach: 'volume-focused',
        concession_rate: 0.015,
        max_rounds: 10,
        break_points: [46.00, 47.50, 49.00]
      },
      current_position: {
        volume_held: 500,
        cash_available: 200000,
        open_orders: []
      }
    }
  ];

  useEffect(() => {
    setParticipants(initializeParticipants());
    setPriceHistory([{ time: 0, price: 47.80 }]);
  }, []);

  const startSimulation = () => {
    setIsRunning(true);
    setCurrentTime(0);
    setActiveTrades([]);
    setMarketUpdates([]);
    setCurrentPrice(47.80);
    setTotalVolume(0);

    demoMode.trackInteraction({
      type: 'click',
      data: { action: 'trading_simulation_start', audience: selectedAudience }
    });

    // Start simulation loop
    simulationInterval.current = setInterval(() => {
      updateSimulation();
    }, 1000); // Update every second (simulation time)
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    const finalMetrics = calculateFinalMetrics();
    demoMode.trackInteraction({
      type: 'simulation_complete',
      data: { final_metrics: finalMetrics, audience: selectedAudience }
    });

    if (onComplete) {
      onComplete(finalMetrics);
    }
  };

  const pauseSimulation = () => {
    setIsRunning(false);
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }
  };

  const updateSimulation = () => {
    setCurrentTime(prev => {
      const newTime = prev + 1;

      // Generate market events based on simulation time
      if (newTime % 10 === 0) {
        generateMarketEvent(newTime);
      }

      // Progress existing trades
      setActiveTrades(prevTrades =>
        prevTrades.map(trade => progressTrade(trade, newTime))
      );

      // Generate new trades periodically
      if (newTime % 15 === 0 && Math.random() > 0.4) {
        generateNewTrade(newTime);
      }

      // Update price based on market activity
      updateMarketPrice(newTime);

      // Stop simulation after 5 minutes
      if (newTime >= 300) {
        setTimeout(stopSimulation, 0);
      }

      return newTime;
    });
  };

  const generateMarketEvent = (time: number) => {
    const events = [
      {
        event_type: 'price_update' as const,
        details: 'AEMO pricing data updated - spot rate adjustment',
        impact: 'neutral' as const
      },
      {
        event_type: 'volume_change' as const,
        details: 'New ESC certificates registered with CER',
        impact: 'positive' as const
      },
      {
        event_type: 'new_participant' as const,
        details: 'Additional market participant joined trading session',
        impact: 'positive' as const
      }
    ];

    const event = events[Math.floor(Math.random() * events.length)];
    const marketUpdate: MarketUpdate = {
      timestamp: new Date(),
      ...event
    };

    setMarketUpdates(prev => [marketUpdate, ...prev.slice(0, 9)]); // Keep last 10 updates
  };

  const generateNewTrade = (time: number) => {
    const buyers = participants.filter(p => p.type === 'buyer' && p.current_position.cash_available > 0);
    const sellers = participants.filter(p => p.type === 'seller' && p.current_position.volume_held > 0);

    if (buyers.length === 0 || sellers.length === 0) return;

    const buyer = buyers[Math.floor(Math.random() * buyers.length)];
    const seller = sellers[Math.floor(Math.random() * sellers.length)];

    const maxVolume = Math.min(
      buyer.current_position.cash_available / currentPrice,
      seller.current_position.volume_held,
      1000 // Max trade size
    );

    if (maxVolume < 50) return; // Minimum trade size

    const volume = Math.floor(Math.random() * (maxVolume - 50)) + 50;
    const initialPrice = currentPrice + (Math.random() - 0.5) * 2; // ±$1 variation

    const newTrade: LiveTrade = {
      id: `trade-${time}-${Math.random().toString(36).substr(2, 9)}`,
      buyer: buyer.name,
      seller: seller.name,
      volume,
      price: initialPrice,
      status: 'negotiating',
      timestamp: new Date(),
      negotiationRound: 1
    };

    setActiveTrades(prev => [...prev, newTrade]);
  };

  const progressTrade = (trade: LiveTrade, time: number): LiveTrade => {
    if (trade.status !== 'negotiating') return trade;

    // AI negotiation simulation
    if (trade.negotiationRound < 5 && Math.random() > 0.3) {
      // Continue negotiation - adjust price
      const priceAdjustment = (Math.random() - 0.5) * 0.5; // ±$0.25
      return {
        ...trade,
        price: Math.max(trade.price + priceAdjustment, 40), // Price floor
        negotiationRound: trade.negotiationRound + 1
      };
    } else {
      // Reach agreement or timeout
      const agreed = Math.random() > 0.2; // 80% success rate
      if (agreed) {
        // Update participant positions
        updateParticipantPositions(trade);
        setTotalVolume(prev => prev + trade.volume);

        return {
          ...trade,
          status: 'agreed'
        };
      } else {
        // Trade failed - remove it
        setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
        return trade;
      }
    }
  };

  const updateParticipantPositions = (trade: LiveTrade) => {
    setParticipants(prev =>
      prev.map(participant => {
        if (participant.name === trade.buyer) {
          return {
            ...participant,
            current_position: {
              ...participant.current_position,
              volume_held: participant.current_position.volume_held + trade.volume,
              cash_available: participant.current_position.cash_available - (trade.volume * trade.price)
            }
          };
        } else if (participant.name === trade.seller) {
          return {
            ...participant,
            current_position: {
              ...participant.current_position,
              volume_held: participant.current_position.volume_held - trade.volume,
              cash_available: participant.current_position.cash_available + (trade.volume * trade.price)
            }
          };
        }
        return participant;
      })
    );
  };

  const updateMarketPrice = (time: number) => {
    // Price volatility based on trading activity
    const completedTrades = activeTrades.filter(t => t.status === 'agreed');
    if (completedTrades.length > 0) {
      const avgTradePrice = completedTrades.reduce((sum, trade) => sum + trade.price, 0) / completedTrades.length;
      const priceMovement = (avgTradePrice - currentPrice) * 0.1; // 10% influence
      const newPrice = currentPrice + priceMovement + (Math.random() - 0.5) * 0.1; // Small random movement

      setCurrentPrice(Math.max(newPrice, 40)); // Price floor
      setPriceHistory(prev => [...prev, { time, price: newPrice }].slice(-50)); // Keep last 50 points
    }
  };

  const calculateFinalMetrics = (): SimulationMetrics => {
    const completedTrades = activeTrades.filter(t => t.status === 'agreed' || t.status === 'settled');
    const avgExecutionTime = completedTrades.length > 0 ?
      completedTrades.reduce((sum, trade) => sum + trade.negotiationRound * 10, 0) / completedTrades.length : 0;

    return {
      performance: {
        execution_time: currentTime,
        price_improvement: (currentPrice - 47.80) / 47.80,
        volume_efficiency: Math.min(totalVolume / 5000, 1), // Target: 5000 tonnes
        success_rate: completedTrades.length / (completedTrades.length + 1) // Include failed trades
      },
      market_impact: {
        price_movement: currentPrice - 47.80,
        volume_traded: totalVolume,
        participant_satisfaction: 0.85, // Simulated
        market_efficiency: Math.min(completedTrades.length / 10, 1) // More trades = higher efficiency
      },
      risk_metrics: {
        counterparty_risk: 1.5,
        settlement_risk: 0.8,
        price_volatility: Math.sqrt(
          priceHistory.reduce((sum, point, index, arr) => {
            if (index === 0) return 0;
            const diff = point.price - arr[index - 1].price;
            return sum + diff * diff;
          }, 0) / Math.max(priceHistory.length - 1, 1)
        ),
        liquidity_risk: 2.0
      },
      compliance_metrics: {
        validation_time: 15,
        compliance_score: 96,
        audit_readiness: 94,
        regulatory_risk: 1.8
      }
    };
  };

  const getParticipantColor = (type: string) => {
    return type === 'buyer' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50';
  };

  const getTradeStatusColor = (status: string) => {
    switch (status) {
      case 'negotiating':
        return 'text-yellow-600 bg-yellow-50';
      case 'agreed':
        return 'text-green-600 bg-green-50';
      case 'settled':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Participant Trading Simulation</h1>
            <p className="text-gray-600 mt-1">
              Live NSW ESC trading simulation with AI-powered negotiation
            </p>
          </div>
          <div className="flex gap-2">
            {!isRunning && (
              <button
                onClick={startSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlayIcon className="w-5 h-5" />
                Start Simulation
              </button>
            )}
            {isRunning && (
              <button
                onClick={pauseSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <PauseIcon className="w-5 h-5" />
                Pause
              </button>
            )}
            {(isRunning || currentTime > 0) && (
              <button
                onClick={stopSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon className="w-5 h-5" />
                Stop
              </button>
            )}
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Back
              </button>
            )}
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">A${currentPrice.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Current Price</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {currentPrice > 47.80 ? (
                <TrendingUpIcon className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${currentPrice > 47.80 ? 'text-green-600' : 'text-red-600'}`}>
                {((currentPrice - 47.80) / 47.80 * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{totalVolume.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Volume Traded</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{activeTrades.length}</div>
            <div className="text-sm text-gray-600">Active Trades</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{participants.length}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-600">Simulation Time</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Participants */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Market Participants</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getParticipantColor(participant.type)}`}>
                      {participant.type}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{participant.name}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Volume:</span> {participant.current_position.volume_held}t
                  </div>
                  <div>
                    <span className="font-medium">Cash:</span> A${participant.current_position.cash_available.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Risk:</span> {participant.profile.risk_tolerance}
                  </div>
                  <div>
                    <span className="font-medium">Style:</span> {participant.profile.negotiation_style}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Trades */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BoltIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Active Trades</h3>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activeTrades.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <BoltIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No active trades</p>
                <p className="text-sm">Start simulation to see live trading</p>
              </div>
            ) : (
              activeTrades.map((trade) => (
                <div key={trade.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {trade.volume}t @ A${trade.price.toFixed(2)}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTradeStatusColor(trade.status)}`}>
                      {trade.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><span className="font-medium">Buyer:</span> {trade.buyer}</div>
                    <div><span className="font-medium">Seller:</span> {trade.seller}</div>
                    <div><span className="font-medium">Round:</span> {trade.negotiationRound}/5</div>
                  </div>
                  {trade.status === 'negotiating' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${(trade.negotiationRound / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Price Movement</h3>
          </div>
          <div className="h-48 flex items-end justify-between space-x-1">
            {priceHistory.slice(-20).map((point, index) => {
              const height = ((point.price - 45) / (52 - 45)) * 100; // Normalize to 0-100%
              return (
                <div
                  key={index}
                  className="bg-blue-500 min-w-0 flex-1 rounded-t-sm"
                  style={{ height: `${Math.max(height, 5)}%` }}
                  title={`Time: ${point.time}s, Price: A$${point.price.toFixed(2)}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>A$45</span>
            <span>Current: A${currentPrice.toFixed(2)}</span>
            <span>A$52</span>
          </div>
        </div>

        {/* Market Updates */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Market Updates</h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {marketUpdates.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No market updates yet</p>
              </div>
            ) : (
              marketUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-2 p-2 border border-gray-100 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    update.impact === 'positive' ? 'bg-green-500' :
                    update.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{update.details}</p>
                    <p className="text-xs text-gray-500">
                      {update.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSimulationEngine;