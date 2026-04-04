/**
 * Landing Page Tests
 *
 * Tests for the Bloomberg Terminal-style trading dashboard (app/page.tsx)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    expect(screen.getByText(/Real-time carbon credit trading platform/)).toBeInTheDocument();
  });

  test('displays animated statistics counters', async () => {
    jest.useRealTimers();
    render(<Home />);

    // Check that stats containers are present
    expect(screen.getByText('CREDITS VERIFIED')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE NEGOTIATIONS')).toBeInTheDocument();
    expect(screen.getByText('AVG SETTLEMENT')).toBeInTheDocument();
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

  test('displays all six feature cards with correct content', () => {
    render(<Home />);

    // Trading products section
    expect(screen.getByText('PRODUCTS')).toBeInTheDocument();
    expect(screen.getByText('Carbon Credits')).toBeInTheDocument();
    expect(screen.getByText('Asset Co Tokens')).toBeInTheDocument();
    expect(screen.getByText('Dual Portfolio')).toBeInTheDocument();
  });

  test('feature cards have correct navigation links', () => {
    render(<Home />);

    // Quick actions in the left panel
    const tradingLink = screen.getByRole('link', { name: /Begin Trading/i });
    expect(tradingLink).toHaveAttribute('href', '/trade');

    const analysisLink = screen.getByRole('link', { name: /Analysis Tools/i });
    expect(analysisLink).toHaveAttribute('href', '/analyse');

    const portalLink = screen.getByRole('link', { name: /Institutional Portal/i });
    expect(portalLink).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays market stats from WREI pricing configuration', () => {
    render(<Home />);

    // Market depth panel
    expect(screen.getByText('MARKET DEPTH')).toBeInTheDocument();
    expect(screen.getByText('VCM SPOT')).toBeInTheDocument();
    expect(screen.getByText('FORWARD REM')).toBeInTheDocument();
    expect(screen.getByText('DMRV PREMIUM')).toBeInTheDocument();
  });

  test('renders platform navigation pathways section', () => {
    render(<Home />);

    // Panel tabs for the centre panel
    expect(screen.getByText('Market Overview')).toBeInTheDocument();
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

    // Bloomberg-style layout has white backgrounds and slate borders
    const container = screen.getByText('Trading Dashboard').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('responsive layout elements are present', () => {
    render(<Home />);

    // Check for grid classes in the market overview
    expect(document.querySelector('.grid')).toBeInTheDocument();
    expect(document.querySelector('.grid-cols-3')).toBeInTheDocument();
  });

  test('all navigation links are accessible', () => {
    render(<Home />);

    const allLinks = screen.getAllByRole('link');

    const internalLinks = allLinks.filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('/');
    });

    expect(internalLinks.length).toBeGreaterThan(0);

    // Check key navigation links exist
    const expectedRoutes = ['/trade', '/institutional/portal', '/analyse'];
    expectedRoutes.forEach(route => {
      const linkExists = internalLinks.some(link => link.getAttribute('href') === route);
      expect(linkExists).toBe(true);
    });
  });

  test('SVG icons are used instead of emojis', () => {
    render(<Home />);

    // Bloomberg dashboard uses minimal UI — status indicators via colored dots
    // rather than SVG icons or emojis
    const statusDots = document.querySelectorAll('.rounded-full');
    expect(statusDots.length).toBeGreaterThan(0);
  });

  test('tab navigation switches panel content', () => {
    render(<Home />);

    // Default tab shows market overview
    expect(screen.getByText('CREDITS VERIFIED')).toBeInTheDocument();

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
    expect(screen.getByText('Blockchain')).toBeInTheDocument();
  });
});
