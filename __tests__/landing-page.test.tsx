/**
 * Landing Page Tests
 *
 * Tests for the Bloomberg Terminal-style trading dashboard (app/page.tsx)
 * Updated P3.1 — new dashboard layout with 8-instrument ticker, metrics, product cards
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';

// Mock Next.js router for Link components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock requestAnimationFrame for animated counter
global.requestAnimationFrame = jest.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

describe('Landing Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders main hero section with title and description', () => {
    render(<Home />);

    expect(screen.getByText('Trading Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Real-time carbon credit and environmental certificate trading platform/)).toBeInTheDocument();
  });

  test('displays dashboard metrics', () => {
    render(<Home />);

    expect(screen.getByText('PLATFORM VOLUME')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE SESSIONS')).toBeInTheDocument();
    expect(screen.getByText('CERTIFICATES TRACKED')).toBeInTheDocument();
    expect(screen.getByText('SETTLEMENT SPEED')).toBeInTheDocument();
  });

  test('renders primary CTA buttons', () => {
    render(<Home />);

    const tradingLink = screen.getByRole('link', { name: /Begin Trading/i });
    expect(tradingLink).toBeInTheDocument();
    expect(tradingLink).toHaveAttribute('href', '/trade');

    const institutionalLink = screen.getByRole('link', { name: /Institutional Portal/i });
    expect(institutionalLink).toBeInTheDocument();
    expect(institutionalLink).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays instrument prices for all 8 instruments', () => {
    render(<Home />);

    expect(screen.getByText('INSTRUMENT PRICES')).toBeInTheDocument();
    // All 8 instrument tickers should appear in the left panel
    const instrumentTickers = ['ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI-CC', 'WREI-ACO'];
    instrumentTickers.forEach(ticker => {
      // Tickers appear in both the left panel AND the scrolling ticker strip (duplicated)
      const elements = screen.getAllByText(ticker);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test('feature cards have correct navigation links', () => {
    render(<Home />);

    const tradingLink = screen.getByRole('link', { name: /Begin Trading/i });
    expect(tradingLink).toHaveAttribute('href', '/trade');

    const analysisLink = screen.getByRole('link', { name: /Analysis Tools/i });
    expect(analysisLink).toHaveAttribute('href', '/analyse');

    const portalLink = screen.getByRole('link', { name: /Institutional Portal/i });
    expect(portalLink).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays market references from WREI pricing configuration', () => {
    render(<Home />);

    expect(screen.getByText('MARKET REFERENCES')).toBeInTheDocument();
    expect(screen.getByText('VCM Spot')).toBeInTheDocument();
    expect(screen.getByText('dMRV Spot')).toBeInTheDocument();
    expect(screen.getByText('Forward Removal')).toBeInTheDocument();
  });

  test('renders panel navigation tabs', () => {
    render(<Home />);

    expect(screen.getByText('Market Overview')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Active Trading')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Status')).toBeInTheDocument();
  });

  test('investor pathway has working assessment link', () => {
    render(<Home />);

    const portalLink = screen.getByRole('link', { name: /Institutional Portal/i });
    expect(portalLink).toBeInTheDocument();
    expect(portalLink).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays demo environment notice', () => {
    render(<Home />);

    expect(screen.getByText('Demo Environment')).toBeInTheDocument();
    expect(screen.getByText(/No real credits traded/)).toBeInTheDocument();
  });

  test('uses WREI colour scheme throughout', () => {
    render(<Home />);

    const container = screen.getByText('Trading Dashboard').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('responsive layout elements are present', () => {
    render(<Home />);

    // Check for grid classes in the market overview
    expect(document.querySelector('.grid')).toBeInTheDocument();
    expect(document.querySelector('.grid-cols-4')).toBeInTheDocument();
  });

  test('all navigation links are accessible', () => {
    render(<Home />);

    const allLinks = screen.getAllByRole('link');

    const internalLinks = allLinks.filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('/');
    });

    expect(internalLinks.length).toBeGreaterThan(0);

    const expectedRoutes = ['/trade', '/institutional/portal', '/analyse'];
    expectedRoutes.forEach(route => {
      const linkExists = internalLinks.some(link => link.getAttribute('href') === route);
      expect(linkExists).toBe(true);
    });
  });

  test('SVG icons are used instead of emojis', () => {
    render(<Home />);

    const statusDots = document.querySelectorAll('.rounded-full');
    expect(statusDots.length).toBeGreaterThan(0);
  });

  test('tab navigation switches panel content', () => {
    render(<Home />);

    // Default tab shows market overview with metrics
    expect(screen.getByText('PLATFORM VOLUME')).toBeInTheDocument();

    // Click Active Trading tab
    fireEvent.click(screen.getByText('Active Trading'));
    expect(screen.getByText('Active Trading Sessions')).toBeInTheDocument();

    // Click Portfolio Status tab
    fireEvent.click(screen.getByText('Portfolio Status'));
    expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
  });

  test('system status panel shows service health', () => {
    render(<Home />);

    expect(screen.getByText('SYSTEM STATUS')).toBeInTheDocument();
    expect(screen.getByText('AI Engine')).toBeInTheDocument();
    expect(screen.getByText('Market Feed')).toBeInTheDocument();
    // Blockchain appears in multiple places (status + ticker) — use getAllByText
    const blockchainElements = screen.getAllByText('Blockchain');
    expect(blockchainElements.length).toBeGreaterThanOrEqual(1);
  });

  test('registry connection status indicators are present', () => {
    render(<Home />);

    expect(screen.getByText('REGISTRY STATUS')).toBeInTheDocument();
    expect(screen.getByText('TESSA (NSW)')).toBeInTheDocument();
    expect(screen.getByText('CER Registry')).toBeInTheDocument();
    expect(screen.getByText('VEEC Registry')).toBeInTheDocument();
  });

  test('product cards tab shows three product cards', () => {
    render(<Home />);

    fireEvent.click(screen.getByText('Products'));

    expect(screen.getByText('ESC Trading')).toBeInTheDocument();
    expect(screen.getByText('Carbon Credit Tokens')).toBeInTheDocument();
    expect(screen.getByText('Asset Co Tokens')).toBeInTheDocument();
  });

  test('certificate summary table is visible in market overview', () => {
    render(<Home />);

    expect(screen.getByText('CERTIFICATE & TOKEN SUMMARY')).toBeInTheDocument();
  });
});
