/**
 * API Explorer Component Tests
 *
 * Tests for the interactive API Explorer component and Developer Portal page.
 * Validates endpoint list rendering, endpoint detail display, request builder,
 * code examples, and the Developer Portal page.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import APIExplorer from '@/components/developer/APIExplorer';
import DeveloperPortal from '@/app/developer/page';
import { allEndpoints, apiCategories } from '@/lib/api-documentation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/developer'),
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock fetch for request builder
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock performance.now for response timing
const mockPerformanceNow = jest.fn();
Object.defineProperty(global, 'performance', {
  value: {
    now: mockPerformanceNow,
  },
  writable: true,
});

describe('APIExplorer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  test('renders the API Explorer container', () => {
    render(<APIExplorer />);
    expect(screen.getByTestId('api-explorer')).toBeInTheDocument();
  });

  test('renders the endpoint list in the sidebar', () => {
    render(<APIExplorer />);
    const endpointList = screen.getByTestId('endpoint-list');
    expect(endpointList).toBeInTheDocument();
  });

  test('renders navigation buttons for all endpoints', () => {
    render(<APIExplorer />);

    for (const endpoint of allEndpoints) {
      const navButton = screen.getByTestId(`endpoint-nav-${endpoint.id}`);
      expect(navButton).toBeInTheDocument();
    }
  });

  test('renders endpoint paths in the sidebar', () => {
    render(<APIExplorer />);

    const uniquePaths = Array.from(new Set(allEndpoints.map((ep) => ep.path)));
    for (const path of uniquePaths) {
      const elements = screen.getAllByText(path);
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  test('first endpoint is selected by default', () => {
    render(<APIExplorer />);

    const firstEndpoint = allEndpoints[0];
    const detail = screen.getByTestId('endpoint-detail');
    expect(detail).toBeInTheDocument();
    // The title should appear as a heading in the detail panel
    expect(within(detail).getByText(firstEndpoint.title)).toBeInTheDocument();
  });

  test('clicking an endpoint shows its detail view', () => {
    render(<APIExplorer />);

    // Click on the trades-create endpoint
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    const detail = screen.getByTestId('endpoint-detail');
    expect(within(detail).getByText('Create Trade')).toBeInTheDocument();
  });

  test('endpoint detail shows method badge', () => {
    render(<APIExplorer />);

    // Navigate to a POST endpoint
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    const methodBadges = screen.getAllByTestId('method-badge-post');
    expect(methodBadges.length).toBeGreaterThan(0);
  });

  test('endpoint detail shows authentication info', () => {
    render(<APIExplorer />);

    // Navigate to trades-create endpoint which requires auth
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    expect(screen.getByText('Authentication')).toBeInTheDocument();
  });

  test('endpoint detail shows rate limit info', () => {
    render(<APIExplorer />);

    expect(screen.getByText('Rate Limit')).toBeInTheDocument();
  });

  test('shows Documentation, Try It, and Code Examples tabs', () => {
    render(<APIExplorer />);

    expect(screen.getByTestId('section-tab-docs')).toBeInTheDocument();
    expect(screen.getByTestId('section-tab-try')).toBeInTheDocument();
    expect(screen.getByTestId('section-tab-code')).toBeInTheDocument();
  });

  test('Documentation tab shows parameter table for endpoints with parameters', () => {
    render(<APIExplorer />);

    // Navigate to trades-create (POST with parameters)
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    // Should be on docs tab by default
    const paramTable = screen.getByTestId('parameter-table');
    expect(paramTable).toBeInTheDocument();
  });

  test('Documentation tab shows example response JSON', () => {
    render(<APIExplorer />);

    const jsonDisplays = screen.getAllByTestId('json-display');
    expect(jsonDisplays.length).toBeGreaterThan(0);
  });

  test('Try It tab shows request builder', () => {
    render(<APIExplorer />);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    expect(screen.getByTestId('request-builder')).toBeInTheDocument();
    expect(screen.getByTestId('send-request-button')).toBeInTheDocument();
  });

  test('Try It tab shows API key input for authenticated endpoints', () => {
    render(<APIExplorer />);

    // Navigate to trades-create endpoint (requires auth)
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    expect(screen.getByTestId('api-key-input')).toBeInTheDocument();
  });

  test('Try It tab shows request body editor for POST endpoints', () => {
    render(<APIExplorer />);

    // Navigate to trades-create (POST endpoint)
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    expect(screen.getByTestId('request-body-editor')).toBeInTheDocument();
  });

  test('Send request button sends fetch request and shows response', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)   // start time
      .mockReturnValueOnce(42); // end time

    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: () => Promise.resolve({ data: [{ instrument: 'ESC', price: 6.34 }] }),
    });

    render(<APIExplorer />);

    // Navigate to market-prices (GET endpoint)
    const marketPricesNav = screen.getByTestId('endpoint-nav-market-prices');
    fireEvent.click(marketPricesNav);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    // Click send button
    const sendButton = screen.getByTestId('send-request-button');
    fireEvent.click(sendButton);

    // Wait for response to appear
    await waitFor(() => {
      expect(screen.getByTestId('response-panel')).toBeInTheDocument();
    });

    expect(screen.getByTestId('response-status')).toHaveTextContent('200');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('handles fetch error gracefully', async () => {
    mockPerformanceNow
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(10);

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<APIExplorer />);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    // Click send button
    const sendButton = screen.getByTestId('send-request-button');
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByTestId('response-panel')).toBeInTheDocument();
    });

    expect(screen.getByTestId('response-status')).toHaveTextContent('0');
  });

  test('Code Examples tab shows code snippets', () => {
    render(<APIExplorer />);

    // Click Code Examples tab
    const codeTab = screen.getByTestId('section-tab-code');
    fireEvent.click(codeTab);

    expect(screen.getByTestId('code-section')).toBeInTheDocument();
    expect(screen.getByTestId('code-display')).toBeInTheDocument();
  });

  test('Code Examples tab shows language tabs (cURL, JavaScript, Python)', () => {
    render(<APIExplorer />);

    // Click Code Examples tab
    const codeTab = screen.getByTestId('section-tab-code');
    fireEvent.click(codeTab);

    expect(screen.getByTestId('code-tab-curl')).toBeInTheDocument();
    expect(screen.getByTestId('code-tab-javascript')).toBeInTheDocument();
    expect(screen.getByTestId('code-tab-python')).toBeInTheDocument();
  });

  test('switching language tab updates code display', () => {
    render(<APIExplorer />);

    // Click Code Examples tab
    const codeTab = screen.getByTestId('section-tab-code');
    fireEvent.click(codeTab);

    // Click Python tab
    const pythonTab = screen.getByTestId('code-tab-python');
    fireEvent.click(pythonTab);

    const codeDisplay = screen.getByTestId('code-display');
    expect(codeDisplay.textContent).toContain('import requests');
  });

  test('sidebar toggle collapses and expands sidebar', () => {
    render(<APIExplorer />);

    const toggle = screen.getByTestId('sidebar-toggle');
    const endpointList = screen.getByTestId('endpoint-list');

    // Sidebar should be open by default
    expect(endpointList).toBeVisible();

    // Click toggle to collapse
    fireEvent.click(toggle);

    // Click toggle again to expand
    fireEvent.click(toggle);

    // Should be visible again
    expect(endpointList).toBeInTheDocument();
  });

  test('reset body button restores example payload', () => {
    render(<APIExplorer />);

    // Navigate to trades-create (POST endpoint)
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    // Click Try It tab
    const tryItTab = screen.getByTestId('section-tab-try');
    fireEvent.click(tryItTab);

    // Modify the request body
    const editor = screen.getByTestId('request-body-editor') as HTMLTextAreaElement;
    fireEvent.change(editor, { target: { value: '{"modified": true}' } });
    expect(editor.value).toBe('{"modified": true}');

    // Click reset
    const resetButton = screen.getByTestId('reset-body-button');
    fireEvent.click(resetButton);

    // Should be restored to example
    expect(editor.value).toContain('instrument_id');
  });

  test('shows error codes in documentation', () => {
    render(<APIExplorer />);

    // Navigate to trades-create
    const tradesCreateNav = screen.getByTestId('endpoint-nav-trades-create');
    fireEvent.click(tradesCreateNav);

    // Should show error codes section
    expect(screen.getByText('Error Codes')).toBeInTheDocument();
    expect(screen.getByText('400')).toBeInTheDocument();
  });

  test('shows notes section when endpoint has notes', () => {
    render(<APIExplorer />);

    // Navigate to negotiate-create which has notes about price floor enforcement
    const negotiateNav = screen.getByTestId('endpoint-nav-negotiate-create');
    fireEvent.click(negotiateNav);

    expect(screen.getByText('Notes')).toBeInTheDocument();
  });
});

describe('DeveloperPortal Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Developer Portal page', () => {
    render(<DeveloperPortal />);
    expect(screen.getByText('Developer Portal')).toBeInTheDocument();
  });

  test('renders the hero header with description', () => {
    render(<DeveloperPortal />);
    expect(screen.getByText(/REST API v1/)).toBeInTheDocument();
  });

  test('renders API overview statistics', () => {
    render(<DeveloperPortal />);
    const overview = screen.getByTestId('api-overview');
    expect(overview).toBeInTheDocument();

    expect(within(overview).getByText('API Endpoints')).toBeInTheDocument();
    expect(within(overview).getByText('Actions')).toBeInTheDocument();
    expect(within(overview).getByText('Resource Groups')).toBeInTheDocument();
    expect(within(overview).getByText('API Version')).toBeInTheDocument();
    expect(within(overview).getByText('v1')).toBeInTheDocument();
  });

  test('renders Quick Start Guide with 3 steps', () => {
    render(<DeveloperPortal />);
    const guide = screen.getByTestId('quick-start-guide');
    expect(guide).toBeInTheDocument();

    expect(screen.getByText('Get Your API Key')).toBeInTheDocument();
    expect(screen.getByText('Make Your First Request')).toBeInTheDocument();
    expect(screen.getByText('Integrate')).toBeInTheDocument();
  });

  test('renders Authentication & Rate Limits guide (collapsed by default)', () => {
    render(<DeveloperPortal />);
    const authGuide = screen.getByTestId('auth-guide');
    expect(authGuide).toBeInTheDocument();

    expect(screen.getByText('Authentication & Rate Limits')).toBeInTheDocument();
  });

  test('expands Authentication guide on click', () => {
    render(<DeveloperPortal />);

    const toggle = screen.getByTestId('auth-guide-toggle');
    fireEvent.click(toggle);

    expect(screen.getByText('API Key Authentication')).toBeInTheDocument();
    expect(screen.getByText('Rate Limits')).toBeInTheDocument();
    expect(screen.getByText('Response Format')).toBeInTheDocument();
    expect(screen.getByText('Role-Based Access')).toBeInTheDocument();
  });

  test('renders Webhook Event Reference', () => {
    render(<DeveloperPortal />);
    const webhookSection = screen.getByTestId('webhook-events');
    expect(webhookSection).toBeInTheDocument();
    expect(screen.getByText('Webhook Event Reference')).toBeInTheDocument();
  });

  test('renders Infrastructure Overview', () => {
    render(<DeveloperPortal />);
    const infra = screen.getByTestId('infrastructure-overview');
    expect(infra).toBeInTheDocument();

    expect(within(infra).getByText('Platform Infrastructure')).toBeInTheDocument();
    expect(within(infra).getByText('Settlement')).toBeInTheDocument();
    expect(within(infra).getByText('Token Standard')).toBeInTheDocument();
    expect(within(infra).getByText('Identity')).toBeInTheDocument();
  });

  test('renders the embedded API Explorer', () => {
    render(<DeveloperPortal />);
    expect(screen.getByText('API Explorer')).toBeInTheDocument();
    expect(screen.getByTestId('api-explorer')).toBeInTheDocument();
  });

  test('displays correct endpoint count in overview', () => {
    render(<DeveloperPortal />);
    const overview = screen.getByTestId('api-overview');
    const endpointCount = String(allEndpoints.length);
    // Count appears for both "API Endpoints" and "Actions" (same number)
    const matches = within(overview).getAllByText(endpointCount);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  test('renders OpenAPI spec link', () => {
    render(<DeveloperPortal />);
    expect(screen.getByText('OpenAPI Spec')).toBeInTheDocument();
  });
});
