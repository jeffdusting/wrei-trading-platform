/**
 * Landing Page Tests
 *
 * Tests for the redesigned home page with comprehensive feature showcase
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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
  });

  test('renders main hero section with title and description', () => {
    render(<Home />);

    expect(screen.getByText('WREI Carbon Credit')).toBeInTheDocument();
    expect(screen.getByText('Trading Platform')).toBeInTheDocument();
    expect(screen.getByText(/Experience institutional-grade carbon credit trading/)).toBeInTheDocument();
  });

  test('displays animated statistics counters', async () => {
    render(<Home />);

    // Check that stats containers are present
    expect(screen.getByText('Credits Verified')).toBeInTheDocument();
    expect(screen.getByText('Avg Settlement')).toBeInTheDocument();
    expect(screen.getByText('Jurisdictions')).toBeInTheDocument();

    // Wait for animation to potentially complete
    await waitFor(() => {
      const creditsElement = screen.getByText('Credits Verified');
      expect(creditsElement).toBeInTheDocument();
    });
  });

  test('renders primary CTA buttons', () => {
    render(<Home />);

    const negotiateButton = screen.getByRole('link', { name: /Begin Negotiation →/i });

    expect(negotiateButton).toBeInTheDocument();
    expect(negotiateButton).toHaveAttribute('href', '/negotiate');

    // Check institutional portal button exists (first occurrence in hero)
    const institutionalButtons = screen.getAllByRole('link', { name: /Institutional Portal/i });
    expect(institutionalButtons.length).toBeGreaterThan(0);
    expect(institutionalButtons[0]).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays all six feature cards with correct content', () => {
    render(<Home />);

    // Check all feature cards are present - using getAllByText since some titles appear multiple times
    expect(screen.getAllByText('AI Negotiation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Institutional Portal').length).toBeGreaterThan(0);
    expect(screen.getByText('Market Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Market Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Regulatory Compliance')).toBeInTheDocument();
    expect(screen.getByText('System Performance')).toBeInTheDocument();

    // Check descriptions
    expect(screen.getByText(/Advanced AI agent handles complex negotiations/)).toBeInTheDocument();
    expect(screen.getByText(/Full onboarding pipeline with AFSL compliance/)).toBeInTheDocument();
  });

  test('feature cards have correct navigation links', () => {
    render(<Home />);

    // Check clickable feature cards have correct hrefs
    const negotiationLink = screen.getByRole('link', { name: /AI Negotiation.*Start Trading →/s });
    expect(negotiationLink).toHaveAttribute('href', '/negotiate');

    const institutionalLink = screen.getByRole('link', { name: /Institutional Portal.*Enter Portal →/s });
    expect(institutionalLink).toHaveAttribute('href', '/institutional/portal');

    const scenarioLink = screen.getByRole('link', { name: /Market Scenarios.*Run Scenarios →/s });
    expect(scenarioLink).toHaveAttribute('href', '/scenario');

    const performanceLink = screen.getByRole('link', { name: /System Performance.*View Metrics →/s });
    expect(performanceLink).toHaveAttribute('href', '/performance');
  });

  test('displays market stats from WREI pricing configuration', () => {
    render(<Home />);

    // Check market stats section
    expect(screen.getByText('Live Market Data')).toBeInTheDocument();
    expect(screen.getByText('VCM Spot Reference')).toBeInTheDocument();
    expect(screen.getByText('Forward Removal')).toBeInTheDocument();
    expect(screen.getByText('dMRV Premium')).toBeInTheDocument();
    expect(screen.getByText('Settlement')).toBeInTheDocument();

    // Check specific values are displayed (values come from config)
    expect(screen.getByText('T+0')).toBeInTheDocument();
    expect(screen.getByText('EM SOVCM 2025')).toBeInTheDocument();
    expect(screen.getByText('Sylvera SOCC 2025')).toBeInTheDocument();
  });

  test('renders platform navigation pathways section', () => {
    render(<Home />);

    expect(screen.getByText('Choose Your Pathway')).toBeInTheDocument();

    // Check all three pathways
    expect(screen.getByText('Investor Pathway')).toBeInTheDocument();
    expect(screen.getByText('Developer Pathway')).toBeInTheDocument();
    expect(screen.getByText('Compliance Pathway')).toBeInTheDocument();

    // Check pathway descriptions
    expect(screen.getByText(/For institutions and accredited investors/)).toBeInTheDocument();
    expect(screen.getByText(/For technical teams building on WREI infrastructure/)).toBeInTheDocument();
    expect(screen.getByText(/For compliance officers and legal teams/)).toBeInTheDocument();
  });

  test('investor pathway has working assessment link', () => {
    render(<Home />);

    const assessmentButton = screen.getByRole('link', { name: /Start Assessment/i });
    expect(assessmentButton).toBeInTheDocument();
    expect(assessmentButton).toHaveAttribute('href', '/institutional/portal');
  });

  test('displays demo environment notice', () => {
    render(<Home />);

    expect(screen.getByText('Demonstration Environment')).toBeInTheDocument();
    expect(screen.getByText(/This is a demonstration of the WREI platform/)).toBeInTheDocument();
    expect(screen.getByText(/No real carbon credits are traded/)).toBeInTheDocument();
  });

  test('uses WREI colour scheme throughout', () => {
    render(<Home />);

    // Check that main brand color classes are applied
    const container = screen.getByText('WREI Carbon Credit').closest('div');
    expect(container).toBeInTheDocument();

    // Check for presence of WREI brand colors in the DOM structure
    expect(document.querySelector('.text-\\[\\#0EA5E9\\]')).toBeInTheDocument();
    expect(document.querySelector('.bg-\\[\\#1B2A4A\\]')).toBeInTheDocument();
  });

  test('responsive layout elements are present', () => {
    render(<Home />);

    // Check for responsive grid classes
    expect(document.querySelector('.grid')).toBeInTheDocument();
    expect(document.querySelector('.md\\:grid-cols-3')).toBeInTheDocument();
    expect(document.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument();

    // Check for responsive text classes
    expect(document.querySelector('.md\\:text-7xl')).toBeInTheDocument();
    expect(document.querySelector('.sm\\:py-32')).toBeInTheDocument();
  });

  test('all navigation links are accessible', () => {
    render(<Home />);

    const allLinks = screen.getAllByRole('link');

    // Filter out external or hash links and check internal navigation links
    const internalLinks = allLinks.filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('/');
    });

    expect(internalLinks.length).toBeGreaterThan(0);

    // Check some key navigation links exist
    const expectedRoutes = ['/negotiate', '/institutional/portal', '/scenario', '/performance'];
    expectedRoutes.forEach(route => {
      const linkExists = internalLinks.some(link => link.getAttribute('href') === route);
      expect(linkExists).toBe(true);
    });
  });

  test('SVG icons are used instead of emojis', () => {
    render(<Home />);

    // Check that SVG elements are present (replacing old emoji approach)
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(5); // Should have multiple SVG icons

    // Ensure no emoji elements are present
    expect(screen.queryByText('🛡️')).not.toBeInTheDocument();
    expect(screen.queryByText('💬')).not.toBeInTheDocument();
    expect(screen.queryByText('🏢')).not.toBeInTheDocument();
  });
});