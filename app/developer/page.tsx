'use client'

import { useState } from 'react'
import APIExplorer from '@/components/developer/APIExplorer'
import { allEndpoints, getTotalActionCount } from '@/lib/api-documentation'

// =============================================================================
// QUICK START GUIDE
// =============================================================================

function QuickStartGuide() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="quick-start-guide">
      <h2 className="text-lg font-bold text-[#1B2A4A] mb-4">Quick Start Guide</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Get Your API Key</h3>
          </div>
          <p className="text-sm text-slate-600 pl-10">
            Request an API key through the institutional onboarding portal. In development mode,
            authentication is bypassed automatically.
          </p>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Make Your First Request</h3>
          </div>
          <p className="text-sm text-slate-600 pl-10">
            Include your API key in the <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">X-WREI-API-Key</code> header.
            Use the API Explorer below to test endpoints interactively.
          </p>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <h3 className="font-semibold text-[#1B2A4A]">Integrate</h3>
          </div>
          <p className="text-sm text-slate-600 pl-10">
            Use the code examples provided for each endpoint. All responses follow a consistent JSON
            envelope with <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">success</code>,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">data</code>, and{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">metadata</code> fields.
          </p>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// API OVERVIEW STATS
// =============================================================================

function ApiOverview() {
  const endpointCount = allEndpoints.length
  const actionCount = getTotalActionCount()
  const categoryCount = new Set(allEndpoints.map((ep) => ep.category)).size

  const stats = [
    { label: 'API Endpoints', value: String(endpointCount), description: 'Documented endpoints' },
    { label: 'Actions', value: String(actionCount), description: 'Available operations' },
    { label: 'Categories', value: String(categoryCount), description: 'Functional groups' },
    { label: 'API Version', value: 'v2.2.0', description: 'Current release' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="api-overview">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-4 text-center"
        >
          <div className="text-2xl font-bold text-[#0EA5E9]">{stat.value}</div>
          <div className="text-sm font-medium text-[#1B2A4A]">{stat.label}</div>
          <div className="text-xs text-slate-400">{stat.description}</div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// AUTHENTICATION GUIDE
// =============================================================================

function AuthenticationGuide() {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-slate-200" data-testid="auth-guide">
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="w-full flex items-center justify-between p-4 text-left"
        data-testid="auth-guide-toggle"
      >
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span className="font-semibold text-[#1B2A4A]">Authentication Guide</span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${showGuide ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showGuide && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">API Key Authentication</h4>
            <p className="text-sm text-slate-600 mb-3">
              Most WREI API endpoints require authentication via the{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">X-WREI-API-Key</code>{' '}
              header. API keys are provisioned during institutional onboarding.
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
{`# Include your API key in every request
curl -H "X-WREI-API-Key: your_api_key_here" \\
     https://wrei-trading-platform.vercel.app/api/market-data?action=carbon_pricing`}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Development Mode</h4>
            <p className="text-sm text-slate-600">
              When the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">WREI_API_KEY</code>{' '}
              environment variable is not set (development/testing), authentication is automatically bypassed.
              This allows you to explore the API without credentials during local development.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Rate Limiting</h4>
            <p className="text-sm text-slate-600">
              All endpoints enforce per-key rate limits. When exceeded, a{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">429</code>{' '}
              status is returned. Rate limits reset after the specified time window (typically 60 seconds).
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Response Format</h4>
            <p className="text-sm text-slate-600 mb-2">
              All API responses follow a consistent JSON envelope:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-sm font-mono overflow-x-auto">
{`{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2026-03-24T10:00:00.000Z",
    "source": "WREI_TRADING_PLATFORM",
    "apiVersion": "2.2.0",
    "requestId": "wrei_1711270800000_abc123def"
  }
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// INFRASTRUCTURE OVERVIEW
// =============================================================================

function InfrastructureOverview() {
  return (
    <div className="bg-gradient-to-r from-[#1B2A4A] to-slate-800 rounded-xl p-6 text-white" data-testid="infrastructure-overview">
      <h3 className="text-lg font-bold mb-3">Platform Infrastructure</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-semibold text-sky-300">Settlement</div>
          <div className="text-xs text-slate-300 mt-1">Zoniqx zConnect - T+0 atomic, non-custodial, cross-chain</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-semibold text-sky-300">Token Standard</div>
          <div className="text-xs text-slate-300 mt-1">Zoniqx zProtocol (DyCIST / ERC-7518) - CertiK audited</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-semibold text-sky-300">Compliance</div>
          <div className="text-xs text-slate-300 mt-1">Zoniqx zCompliance - AI-powered, 20+ jurisdictions</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-sm font-semibold text-sky-300">Identity</div>
          <div className="text-xs text-slate-300 mt-1">Zoniqx zIdentity - KYC/KYB with jurisdiction-based access</div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// DEVELOPER PORTAL PAGE
// =============================================================================

export default function DeveloperPortal() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#1B2A4A] via-slate-800 to-[#1B2A4A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3 mb-2">
            <svg className="w-8 h-8 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            <h1 className="text-3xl font-bold">Developer Portal</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-2xl">
            Explore, test, and integrate with the WREI Carbon Credit Trading Platform APIs.
            Interactive documentation with live request testing and code examples.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Overview stats */}
        <ApiOverview />

        {/* Quick start */}
        <QuickStartGuide />

        {/* Authentication guide */}
        <AuthenticationGuide />

        {/* Infrastructure overview */}
        <InfrastructureOverview />

        {/* API Explorer */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-bold text-[#1B2A4A]">API Explorer</h2>
            <p className="text-sm text-slate-500">
              Browse endpoints, view documentation, and make live test requests
            </p>
          </div>
          <div className="min-h-[700px]">
            <APIExplorer />
          </div>
        </div>
      </div>
    </div>
  )
}
