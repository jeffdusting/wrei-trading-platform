/**
 * Ticker Data Tests
 *
 * Unit tests for the market ticker data provider and simulation engine
 * Testing real-time market data simulation, price updates, and market status
 */

import { marketSimulator, MarketSimulator, TickerData } from '../lib/ticker-data';
import { PRICING_INDEX } from '../lib/negotiation-config';

// Mock React for the hooks
jest.mock('react', () => ({
  useState: jest.fn((initial) => [initial, jest.fn()]),
  useEffect: jest.fn((effect) => effect()),
}));

describe('TickerData', () => {
  let simulator: MarketSimulator;

  beforeEach(() => {
    simulator = new MarketSimulator();
    jest.clearAllMocks();
  });

  afterEach(() => {
    simulator.stopUpdates();
  });

  describe('MarketSimulator initialisation', () => {
    test('initializes with correct number of tickers', () => {
      const tickers = simulator.getCurrentTickers();

      expect(tickers).toHaveLength(13);

      const symbols = tickers.map(t => t.symbol);
      // Original 7 tickers
      expect(symbols).toContain('WREI-C');
      expect(symbols).toContain('WREI-ESC');
      expect(symbols).toContain('VCM-SPOT');
      expect(symbols).toContain('DMRV-SPOT');
      expect(symbols).toContain('ESC-NSW');
      expect(symbols).toContain('ESC-FWD');
      expect(symbols).toContain('RWA-IDX');
      // 6 new instrument tickers from feed-manager
      expect(symbols).toContain('VEEC');
      expect(symbols).toContain('ACCU');
      expect(symbols).toContain('LGC');
      expect(symbols).toContain('STC');
      expect(symbols).toContain('PRC');
      expect(symbols).toContain('WREI-ACO');
    });

    test('initializes with pricing index values', () => {
      const tickers = simulator.getCurrentTickers();

      const vcmTicker = tickers.find(t => t.symbol === 'VCM-SPOT');
      const dmrvTicker = tickers.find(t => t.symbol === 'DMRV-SPOT');
      const escTicker = tickers.find(t => t.symbol === 'ESC-NSW');

      expect(vcmTicker?.price).toBe(PRICING_INDEX.VCM_SPOT_REFERENCE);
      expect(dmrvTicker?.price).toBe(PRICING_INDEX.DMRV_SPOT_REFERENCE);
      expect(escTicker?.price).toBe(PRICING_INDEX.ESC_SPOT_REFERENCE);
    });

    test('initializes WREI premium pricing correctly', () => {
      const tickers = simulator.getCurrentTickers();

      const wreiCarbonTicker = tickers.find(t => t.symbol === 'WREI-C');
      const wreiEscTicker = tickers.find(t => t.symbol === 'WREI-ESC');

      expect(wreiCarbonTicker?.price).toBe(28.12); // 1.85x dMRV premium
      expect(wreiEscTicker?.price).toBe(23.00); // ESC spot price
    });

    test('initializes with zero changes', () => {
      const tickers = simulator.getCurrentTickers();

      tickers.forEach(ticker => {
        expect(ticker.change).toBe(0);
        expect(ticker.changePercent).toBe(0);
        expect(ticker.timestamp).toBeDefined();
      });
    });

    test('initializes with proper currencies', () => {
      const tickers = simulator.getCurrentTickers();

      const usdTickers = tickers.filter(t => t.currency === 'USD');
      const audTickers = tickers.filter(t => t.currency === 'AUD');

      expect(usdTickers.map(t => t.symbol)).toEqual(
        expect.arrayContaining(['WREI-C', 'VCM-SPOT', 'DMRV-SPOT', 'RWA-IDX'])
      );
      expect(audTickers.map(t => t.symbol)).toEqual(
        expect.arrayContaining(['WREI-ESC', 'ESC-NSW', 'ESC-FWD', 'VEEC', 'ACCU', 'LGC', 'STC', 'PRC', 'WREI-ACO'])
      );
    });

    test('initializes with volume data', () => {
      const tickers = simulator.getCurrentTickers();

      tickers.forEach(ticker => {
        expect(ticker.volume).toBeDefined();
        expect(ticker.volume).toBeGreaterThan(0);
        expect(ticker.high24h).toBeDefined();
        expect(ticker.low24h).toBeDefined();
        expect(ticker.high24h).toBeGreaterThanOrEqual(ticker.price);
        expect(ticker.low24h).toBeLessThanOrEqual(ticker.price);
      });
    });
  });

  describe('Market status functionality', () => {
    test('returns market status with correct structure', () => {
      const status = simulator.getMarketStatus();

      expect(status).toHaveProperty('isOpen');
      expect(status).toHaveProperty('nextChange');
      expect(status).toHaveProperty('timezone');
      expect(status).toHaveProperty('lastUpdate');

      expect(typeof status.isOpen).toBe('boolean');
      expect(typeof status.nextChange).toBe('string');
      expect(status.timezone).toBe('AEST');
      expect(status.lastUpdate).toBeInstanceOf(Date);
    });

    test('carbon markets are always open', () => {
      const status = simulator.getMarketStatus();

      expect(status.isOpen).toBe(true);
      expect(status.nextChange).toBe("Market operates 24/7");
    });
  });

  describe('Ticker retrieval', () => {
    test('getTicker returns specific ticker by symbol', () => {
      const wreiCarbon = simulator.getTicker('WREI-C');
      const nonExistent = simulator.getTicker('INVALID');

      expect(wreiCarbon).toBeDefined();
      expect(wreiCarbon?.symbol).toBe('WREI-C');
      expect(wreiCarbon?.name).toBe('WREI Carbon Credits');
      expect(nonExistent).toBeUndefined();
    });

    test('getCurrentTickers returns array of all tickers', () => {
      const tickers = simulator.getCurrentTickers();

      expect(Array.isArray(tickers)).toBe(true);
      expect(tickers).toHaveLength(13);

      tickers.forEach(ticker => {
        expect(ticker).toHaveProperty('symbol');
        expect(ticker).toHaveProperty('price');
        expect(ticker).toHaveProperty('change');
        expect(ticker).toHaveProperty('changePercent');
        expect(ticker).toHaveProperty('timestamp');
        expect(ticker).toHaveProperty('currency');
      });
    });
  });

  describe('Price update simulation', () => {
    test('subscription system works correctly', (done) => {
      let callbackCount = 0;

      const unsubscribe = simulator.subscribe((tickers) => {
        callbackCount++;

        if (callbackCount === 1) {
          // First call should be immediate with current data
          expect(tickers).toHaveLength(13);
          expect(tickers[0].change).toBe(0); // Initially zero
        } else if (callbackCount === 2) {
          // Second call should be after first update
          simulator.stopUpdates();
          unsubscribe();
          done();
        }
      });

      // Start updates with short interval for testing
      simulator.startUpdates(100);
    });

    test('price updates stay within reasonable bounds', (done) => {
      const initialTickers = simulator.getCurrentTickers();

      simulator.subscribe((updatedTickers) => {
        updatedTickers.forEach(ticker => {
          const initial = initialTickers.find(t => t.symbol === ticker.symbol);
          if (initial && ticker.change !== 0) {
            // Price should not change more than 10% in a single update (very conservative test)
            const maxChange = Math.abs(ticker.changePercent);
            expect(maxChange).toBeLessThan(10);

            // Price should never go negative
            expect(ticker.price).toBeGreaterThan(0);
          }
        });

        simulator.stopUpdates();
        done();
      });

      simulator.startUpdates(100);
    });

    test('timestamps update correctly', (done) => {
      const initialTime = new Date();

      simulator.subscribe((tickers) => {
        tickers.forEach(ticker => {
          expect(ticker.timestamp).toBeInstanceOf(Date);
          expect(ticker.timestamp.getTime()).toBeGreaterThanOrEqual(initialTime.getTime());
        });

        simulator.stopUpdates();
        done();
      });

      simulator.startUpdates(100);
    });

    test('volume updates correctly', (done) => {
      simulator.subscribe((tickers) => {
        tickers.forEach(ticker => {
          expect(ticker.volume).toBeDefined();
          expect(ticker.volume).toBeGreaterThan(0);
          expect(Number.isInteger(ticker.volume)).toBe(true);
        });

        simulator.stopUpdates();
        done();
      });

      simulator.startUpdates(100);
    });

    test('24h high/low tracking works', (done) => {
      simulator.subscribe((tickers) => {
        tickers.forEach(ticker => {
          expect(ticker.high24h).toBeDefined();
          expect(ticker.low24h).toBeDefined();
          expect(ticker.high24h).toBeGreaterThanOrEqual(ticker.price);
          expect(ticker.low24h).toBeLessThanOrEqual(ticker.price);
          expect(ticker.high24h!).toBeGreaterThanOrEqual(ticker.low24h!);
        });

        simulator.stopUpdates();
        done();
      });

      simulator.startUpdates(100);
    });
  });

  describe('Subscription management', () => {
    test('multiple subscribers receive updates', (done) => {
      let subscriber1Called = false;
      let subscriber2Called = false;

      const unsubscribe1 = simulator.subscribe(() => {
        subscriber1Called = true;
        checkComplete();
      });

      const unsubscribe2 = simulator.subscribe(() => {
        subscriber2Called = true;
        checkComplete();
      });

      function checkComplete() {
        if (subscriber1Called && subscriber2Called) {
          if (typeof unsubscribe1 === 'function') unsubscribe1();
          if (typeof unsubscribe2 === 'function') unsubscribe2();
          done();
        }
      }

      // Both subscribers should be called immediately with current data
      // No need to start updates for this test
    });

    test('unsubscribed callbacks do not receive updates', (done) => {
      let callCount = 0;

      const unsubscribe = simulator.subscribe(() => {
        callCount++;
      });

      // Unsubscribe immediately
      unsubscribe();

      // Start updates and check after a delay
      simulator.startUpdates(100);
      setTimeout(() => {
        simulator.stopUpdates();
        expect(callCount).toBe(1); // Only the initial immediate call
        done();
      }, 250);
    });
  });

  describe('Singleton instance', () => {
    test('marketSimulator is properly exported', () => {
      expect(marketSimulator).toBeInstanceOf(MarketSimulator);
      expect(marketSimulator.getCurrentTickers).toBeDefined();
      expect(marketSimulator.subscribe).toBeDefined();
      expect(marketSimulator.startUpdates).toBeDefined();
      expect(marketSimulator.stopUpdates).toBeDefined();
    });

    test('singleton maintains state across calls', () => {
      const tickers1 = marketSimulator.getCurrentTickers();
      const tickers2 = marketSimulator.getCurrentTickers();

      expect(tickers1).toEqual(tickers2);
    });
  });
});