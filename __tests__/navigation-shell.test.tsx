/**
 * Navigation Shell Component Tests
 *
 * Tests for the unified navigation system across all pages
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import NavigationShell from '@/components/navigation/NavigationShell';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('NavigationShell Component', () => {
  const mockChildren = <div data-testid="mock-children">Test Content</div>;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders all navigation links correctly', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    // Check all navigation links are present
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /negotiate/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /institutional/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /scenarios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /performance/i })).toBeInTheDocument();
  });

  test('displays Water Roads branding correctly', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    // Check branding elements
    expect(screen.getByText('Water Roads')).toBeInTheDocument();
    expect(screen.getByText('WREI Carbon Platform')).toBeInTheDocument();
  });

  test('highlights active route correctly', () => {
    mockUsePathname.mockReturnValue('/negotiate');
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    const negotiateLink = screen.getByRole('link', { name: /negotiate/i });
    expect(negotiateLink).toHaveClass('bg-[#0EA5E9]', 'text-white');
  });

  test('home route active state works correctly', () => {
    mockUsePathname.mockReturnValue('/');
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveClass('bg-[#0EA5E9]', 'text-white');
  });

  test('nested routes highlight parent correctly', () => {
    mockUsePathname.mockReturnValue('/institutional/portal');
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    const institutionalLink = screen.getByRole('link', { name: /institutional/i });
    expect(institutionalLink).toHaveClass('bg-[#0EA5E9]', 'text-white');
  });

  test('mobile menu toggle works correctly', async () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    // Mobile menu should be hidden initially
    expect(screen.queryByText('AI Carbon Credit Trading')).not.toBeInTheDocument();

    // Find and click mobile menu button
    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(menuButton);

    // Mobile menu should now be visible with descriptions
    await waitFor(() => {
      expect(screen.getByText('AI Carbon Credit Trading')).toBeInTheDocument();
      expect(screen.getByText('Institutional Onboarding')).toBeInTheDocument();
    });

    // Click menu button again to close
    fireEvent.click(menuButton);

    // Mobile menu should be hidden again
    await waitFor(() => {
      expect(screen.queryByText('AI Carbon Credit Trading')).not.toBeInTheDocument();
    });
  });

  test('mobile menu closes when link is clicked', async () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    // Open mobile menu
    const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
    fireEvent.click(menuButton);

    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getByText('AI Carbon Credit Trading')).toBeInTheDocument();
    });

    // Click a navigation link in mobile menu
    const mobileNegotiateLink = screen.getAllByRole('link', { name: /negotiate/i })[1]; // Second one is mobile
    fireEvent.click(mobileNegotiateLink);

    // Mobile menu should close
    await waitFor(() => {
      expect(screen.queryByText('AI Carbon Credit Trading')).not.toBeInTheDocument();
    });
  });

  test('children content is rendered correctly', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    expect(screen.getByTestId('mock-children')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('footer content is present', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    expect(screen.getByText(/© 2026 Water Roads/)).toBeInTheDocument();
    expect(screen.getByText(/WREI Platform powered by Claude AI/)).toBeInTheDocument();
    expect(screen.getByText(/Institutional-grade carbon credit tokenisation/)).toBeInTheDocument();
  });

  test('navigation links have correct hrefs', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /negotiate/i })).toHaveAttribute('href', '/negotiate');
    expect(screen.getByRole('link', { name: /institutional/i })).toHaveAttribute('href', '/institutional/portal');
    expect(screen.getByRole('link', { name: /scenarios/i })).toHaveAttribute('href', '/scenario');
    expect(screen.getByRole('link', { name: /performance/i })).toHaveAttribute('href', '/performance');
  });

  test('all routes are accessible via navigation', () => {
    render(<NavigationShell>{mockChildren}</NavigationShell>);

    const expectedRoutes = ['/', '/negotiate', '/institutional/portal', '/scenario', '/performance'];
    const links = screen.getAllByRole('link');

    expectedRoutes.forEach(route => {
      const link = links.find(link => link.getAttribute('href') === route);
      expect(link).toBeInTheDocument();
    });
  });
});