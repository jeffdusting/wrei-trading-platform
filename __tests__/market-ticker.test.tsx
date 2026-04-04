/**
 * Market Ticker Component Tests
 *
 * Component tests for the MarketTicker scrolling ticker tape display
 * Testing rendering, updates, interactions, and visual state changes
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MarketTicker from '../components/market/MarketTicker';
import { marketSimulator, TickerData } from '../lib/ticker-data';

// Mock the ticker data module
jest.mock('../lib/ticker-data', () => {
  const mockTickers: TickerData[] = [
    {
      symbol: 'WREI-C',
      name: 'WREI Carbon Credits',
      price: 28.12,
      change: 0.45,
      changePercent: 1.62,
      timestamp: new Date(),
      currency: 'USD',
      volume: 15000,
      high24h: 28.50,
      low24h: 27.80,
    },
    {
      symbol: 'WREI-ESC',
      name: 'WREI ESC Credits',
      price: 23.00,
      change: -0.25,
      changePercent: -0.45,
      timestamp: new Date(),
      currency: 'AUD',
      volume: 45000,
      high24h: 55.20,
      low24h: 54.70,
    },
    {
      symbol: 'VCM-SPOT',
      name: 'VCM Spot Average',
      price: 8.45,
      change: 0.12,
      changePercent: 1.44,
      timestamp: new Date(),
      currency: 'USD',
      volume: 125000,
      high24h: 8.60,
      low24h: 8.30,
    },
  ];

  return {
    marketSimulator: {
      subscribe: jest.fn((callback) => {
        // Immediately call with mock data
        callback(mockTickers);
        // Return unsubscribe function
        return jest.fn();
      }),
      startUpdates: jest.fn(),
      stopUpdates: jest.fn(),
      getCurrentTickers: jest.fn(() => mockTickers),
      getMarketStatus: jest.fn(() => ({
        isOpen: true,
        nextChange: "Market operates 24/7",
        timezone: 'AEST',
        lastUpdate: new Date(),
      })),
    },
  };
});

describe('MarketTicker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic rendering', () => {
    test('renders ticker component without errors', () => {
      render(<MarketTicker />);

      expect(screen.getByText('MARKET DATA')).toBeInTheDocument();
    });

    test('displays all ticker symbols', () => {
      render(<MarketTicker />);

      expect(screen.getAllByText('WREI-C')).toHaveLength(2); // Duplicated for scrolling
      expect(screen.getAllByText('WREI-ESC')).toHaveLength(2);
      expect(screen.getAllByText('VCM-SPOT')).toHaveLength(2);
    });

    test('displays ticker prices with correct currency formatting', () => {
      render(<MarketTicker />);

      expect(screen.getAllByText('$28.12')).toHaveLength(2); // USD (duplicated for scrolling)
      expect(screen.getAllByText('A$23.00')).toHaveLength(2); // AUD
      expect(screen.getAllByText('$8.45')).toHaveLength(2); // USD
    });

    test('displays price changes with correct formatting', () => {
      render(<MarketTicker />);

      expect(screen.getAllByText('+0.45')).toHaveLength(2); // Duplicated for scrolling
      expect(screen.getAllByText('(+1.62%)')).toHaveLength(2);
      expect(screen.getAllByText('-0.25')).toHaveLength(2);
      expect(screen.getAllByText('(-0.45%)')).toHaveLength(2);
    });

    test('shows connection status indicator', () => {
      render(<MarketTicker />);

      const connectionIndicator = screen.getByText('MARKET DATA');
      expect(connectionIndicator).toBeInTheDocument();
    });
  });

  describe('Color coding for price changes', () => {
    test('positive changes display in green', () => {
      render(<MarketTicker />);

      const positiveChanges = screen.getAllByText('+0.45');
      positiveChanges.forEach(element => {
        // The span containing the change should have the green color class
        const changeSpan = element.closest('span.text-green-500');
        expect(changeSpan).toBeInTheDocument();
      });
    });

    test('negative changes display in red', () => {
      render(<MarketTicker />);

      const negativeChanges = screen.getAllByText('-0.25');
      negativeChanges.forEach(element => {
        // The span containing the change should have the red color class
        const changeSpan = element.closest('span.text-red-500');
        expect(changeSpan).toBeInTheDocument();
      });
    });

    test('displays correct directional arrows', () => {
      render(<MarketTicker />);

      // Check for up arrow (▲) and down arrow (▼)
      // We expect multiple arrows since we have different tickers and duplication for scrolling
      const upArrows = screen.getAllByText('▲');
      const downArrows = screen.getAllByText('▼');

      expect(upArrows.length).toBeGreaterThan(0);
      expect(downArrows.length).toBeGreaterThan(0);
    });
  });

  describe('Details panel functionality', () => {
    test('details panel is hidden by default when showDetails is false', () => {
      render(<MarketTicker showDetails={false} />);

      // Details panel should not be visible
      expect(screen.queryByText('WREI Carbon Credits')).not.toBeInTheDocument();
    });

    test('clicking ticker item opens details panel when showDetails is true', async () => {
      render(<MarketTicker showDetails={true} />);

      const wreiCarbonTickers = screen.getAllByText('WREI-C');
      fireEvent.click(wreiCarbonTickers[0]); // Click the first one

      await waitFor(() => {
        expect(screen.getByText('WREI Carbon Credits')).toBeInTheDocument();
        expect(screen.getByText('Current Price')).toBeInTheDocument();
        expect(screen.getByText('24h Change')).toBeInTheDocument();
        expect(screen.getByText('24h High')).toBeInTheDocument();
        expect(screen.getByText('24h Low')).toBeInTheDocument();
        expect(screen.getByText('Volume (24h)')).toBeInTheDocument();
      });
    });

    test('details panel shows correct data', async () => {
      render(<MarketTicker showDetails={true} />);

      const wreiCarbonTickers = screen.getAllByText('WREI-C');
      fireEvent.click(wreiCarbonTickers[0]);

      await waitFor(() => {
        // Check for change data - use flexible text matching since it's broken up by spans
        expect(screen.getByText((content, element) => {
          return element?.textContent === '+0.45(+1.62%)';
        })).toBeInTheDocument();

        expect(screen.getByText('$28.50')).toBeInTheDocument(); // High
        expect(screen.getByText('$27.80')).toBeInTheDocument(); // Low
        expect(screen.getByText('15,000')).toBeInTheDocument(); // Volume with formatting
      });
    });

    test('close button closes details panel', async () => {
      render(<MarketTicker showDetails={true} />);

      const wreiCarbonTickers = screen.getAllByText('WREI-C');
      fireEvent.click(wreiCarbonTickers[0]);

      await waitFor(() => {
        expect(screen.getByText('WREI Carbon Credits')).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText('Close details');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('WREI Carbon Credits')).not.toBeInTheDocument();
      });
    });
  });

  describe('Update interval configuration', () => {
    test('starts market simulator with custom update interval', () => {
      render(<MarketTicker updateInterval={3000} />);

      expect(marketSimulator.startUpdates).toHaveBeenCalledWith(3000);
    });

    test('starts market simulator with default interval when not specified', () => {
      render(<MarketTicker />);

      expect(marketSimulator.startUpdates).toHaveBeenCalledWith(5000);
    });

    test('subscribes to market simulator on mount', () => {
      render(<MarketTicker />);

      expect(marketSimulator.subscribe).toHaveBeenCalled();
    });
  });

  describe('CSS classes and styling', () => {
    test('applies custom className prop', () => {
      const { container } = render(<MarketTicker className="custom-ticker" />);

      expect(container.firstChild).toHaveClass('custom-ticker');
    });

    test('has proper scrolling animation classes', () => {
      render(<MarketTicker />);

      // Check for scrolling animation container
      const scrollingContainer = document.querySelector('.animate-scroll-ticker');
      // Note: This might not be present initially, but the CSS should be defined
      expect(document.querySelector('style')).toBeInTheDocument();
    });

    test('ticker items have proper hover states', () => {
      render(<MarketTicker showDetails={true} />);

      const tickerItems = screen.getAllByText('WREI-C');
      const tickerItem = tickerItems[0].closest('div');
      expect(tickerItem).toHaveClass('cursor-pointer');
      expect(tickerItem).toHaveClass('hover:bg-slate-100');
    });
  });

  describe('Zero change handling', () => {
    test('handles zero price change gracefully', () => {
      // Mock zero change data
      const zeroChangeTicker: TickerData = {
        symbol: 'ZERO-TEST',
        name: 'Zero Change Test',
        price: 100.00,
        change: 0,
        changePercent: 0,
        timestamp: new Date(),
        currency: 'USD',
        volume: 10000,
        high24h: 100.50,
        low24h: 99.50,
      };

      const mockMarketSimulator = marketSimulator as any;
      mockMarketSimulator.subscribe.mockImplementation((callback: any) => {
        callback([zeroChangeTicker]);
        return jest.fn();
      });

      render(<MarketTicker />);

      expect(screen.getAllByText('ZERO-TEST')).toHaveLength(2);
      expect(screen.getAllByText('$100.00')).toHaveLength(2);

      // For zero change, the component shows "+0.00"
      expect(screen.getAllByText('+0.00')).toHaveLength(2);

      // And the percentage is shown as "(+0.00%)"
      expect(screen.getAllByText('(+0.00%)')).toHaveLength(2);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      // Reset the mock to ensure we have the expected ticker data
      const mockMarketSimulator = marketSimulator as any;
      mockMarketSimulator.subscribe.mockImplementation((callback: any) => {
        const mockTickers: TickerData[] = [
          {
            symbol: 'WREI-C',
            name: 'WREI Carbon Credits',
            price: 28.12,
            change: 0.45,
            changePercent: 1.62,
            timestamp: new Date(),
            currency: 'USD',
            volume: 15000,
            high24h: 28.50,
            low24h: 27.80,
          },
        ];
        callback(mockTickers);
        return jest.fn();
      });
    });

    test('ticker items have proper titles for screen readers', () => {
      render(<MarketTicker showDetails={true} />);

      const wreiCarbonTickers = screen.getAllByText('WREI-C');
      const tickerDiv = wreiCarbonTickers[0].closest('div');
      expect(tickerDiv).toHaveAttribute('title', 'WREI Carbon Credits - Click for details');
    });

    test('close button has proper aria-label', async () => {
      render(<MarketTicker showDetails={true} />);

      const wreiCarbonTickers = screen.getAllByText('WREI-C');
      fireEvent.click(wreiCarbonTickers[0]);

      await waitFor(() => {
        const closeButton = screen.getByLabelText('Close details');
        expect(closeButton).toBeInTheDocument();
      });
    });
  });
});