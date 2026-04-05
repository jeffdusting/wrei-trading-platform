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
      <h2 className="bloomberg-card-title text-[#1B2A4A] mb-4">Quick Start Guide</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center bloomberg-small-text">
              1
            </div>
            <h3 className="bloomberg-card-title text-[#1B2A4A]">Get Your API Key</h3>
          </div>
          <p className="bloomberg-small-text text-slate-600 pl-10">
            Request an API key through the institutional onboarding portal. Keys are prefixed with{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label">wrei_</code> and are 64 characters long.
          </p>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center bloomberg-small-text">
              2
            </div>
            <h3 className="bloomberg-card-title text-[#1B2A4A]">Make Your First Request</h3>
          </div>
          <p className="bloomberg-small-text text-slate-600 pl-10">
            Include your API key in the{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label">X-API-Key</code> header.
            All endpoints are under <code className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label">/api/v1/</code>.
          </p>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center bloomberg-small-text">
              3
            </div>
            <h3 className="bloomberg-card-title text-[#1B2A4A]">Integrate</h3>
          </div>
          <p className="bloomberg-small-text text-slate-600 pl-10">
            All responses use a consistent JSON envelope:{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label">{'{ data, meta? }'}</code> for success,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label">{'{ error: { code, message } }'}</code> for errors.
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
    { label: 'API Endpoints', value: String(endpointCount), description: 'Documented operations' },
    { label: 'Resource Groups', value: String(categoryCount), description: 'Functional categories' },
    { label: 'Actions', value: String(actionCount), description: 'Available operations' },
    { label: 'API Version', value: 'v1', description: 'REST API' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="api-overview">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 p-4 text-center"
        >
          <div className="bloomberg-large-metric text-[#0EA5E9]">{stat.value}</div>
          <div className="bloomberg-small-text bloomberg-card-title text-[#1B2A4A]">{stat.label}</div>
          <div className="bloomberg-section-label text-slate-400">{stat.description}</div>
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
          <span className="bloomberg-card-title text-[#1B2A4A]">Authentication &amp; Rate Limits</span>
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
            <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">API Key Authentication</h4>
            <p className="bloomberg-small-text text-slate-600 mb-3">
              All v1 endpoints require authentication via the{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">X-API-Key</code>{' '}
              header. Keys are 64-character hex strings prefixed with <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">wrei_</code>.
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg bloomberg-small-text bloomberg-data overflow-x-auto">
{`curl -H "X-API-Key: wrei_your_api_key_here" \\
     https://wrei-trading-platform.vercel.app/api/v1/market/prices?instrument=ESC`}
            </pre>
          </div>

          <div>
            <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Rate Limits</h4>
            <p className="bloomberg-small-text text-slate-600 mb-2">
              Per-key rate limits are enforced on all endpoints:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="bloomberg-section-label text-slate-400">Read (GET)</div>
                <div className="bloomberg-small-text bloomberg-card-title text-[#1B2A4A]">100 req/min</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="bloomberg-section-label text-slate-400">Write (POST/PUT/DELETE)</div>
                <div className="bloomberg-small-text bloomberg-card-title text-[#1B2A4A]">30 req/min</div>
              </div>
            </div>
            <p className="bloomberg-small-text text-slate-600 mt-2">
              When exceeded, a <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">429</code> status
              is returned. Retry after the window resets (60 seconds).
            </p>
          </div>

          <div>
            <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Response Format</h4>
            <p className="bloomberg-small-text text-slate-600 mb-2">
              All v1 API responses follow a consistent JSON envelope:
            </p>
            <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg bloomberg-small-text bloomberg-data overflow-x-auto">
{`// Success
{ "data": { ... }, "meta": { "page": 1, "limit": 50, "total": 120, "pages": 3 } }

// Error
{ "error": { "code": "validation_error", "message": "instrument is required" } }`}
            </pre>
          </div>

          <div>
            <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Role-Based Access</h4>
            <p className="bloomberg-small-text text-slate-600">
              Write endpoints (create trade, register webhook, approve correspondence) require{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">admin</code>,{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">broker</code>, or{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">trader</code>{' '}
              role. Read-only endpoints are available to all authenticated users.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// WEBHOOK EVENT REFERENCE
// =============================================================================

function WebhookEventReference() {
  const [showEvents, setShowEvents] = useState(false)

  const events = [
    { event: 'trade.created', description: 'Fired when a new trade is recorded via API or platform UI', payload: '{ id, instrument_id, direction, quantity, price_per_unit, status }' },
    { event: 'trade.settled', description: 'Fired when a trade settlement is confirmed (TESSA transfer complete)', payload: '{ tradeId, settlementId, method, settled_at }' },
    { event: 'negotiation.completed', description: 'Fired when an AI negotiation session concludes (accepted or rejected)', payload: '{ negotiationId, outcome }' },
    { event: 'correspondence.received', description: 'Fired when an inbound email is matched to a negotiation thread', payload: '{ threadId, counterpartyEmail, parsedOffer }' },
    { event: 'price.alert', description: 'Fired when an instrument price crosses a configured threshold', payload: '{ instrument, price, threshold, direction }' },
    { event: 'compliance.deadline', description: 'Fired when a client surrender deadline is approaching (30/14/7 days)', payload: '{ clientId, scheme, deadline, shortfall }' },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200" data-testid="webhook-events">
      <button
        onClick={() => setShowEvents(!showEvents)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="bloomberg-card-title text-[#1B2A4A]">Webhook Event Reference</span>
          <span className="bloomberg-section-label text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{events.length} events</span>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${showEvents ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showEvents && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-4">
          <p className="bloomberg-small-text text-slate-600 mb-3">
            Webhooks are delivered via POST with an HMAC-SHA256 signature in the{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-section-label bloomberg-data">X-WREI-Signature</code>{' '}
            header. Failed deliveries are retried 3 times with exponential backoff (1s, 2s, 4s).
          </p>
          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.event} className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <code className="bg-[#0EA5E9]/10 text-[#0EA5E9] px-2 py-0.5 rounded bloomberg-section-label">
                    {e.event}
                  </code>
                </div>
                <p className="bloomberg-small-text text-slate-600">{e.description}</p>
                <pre className="mt-1 bloomberg-section-label text-slate-500 bloomberg-data">{e.payload}</pre>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-slate-900 text-slate-100 p-3 rounded-lg">
            <p className="bloomberg-section-label text-slate-400 mb-2">Payload format:</p>
            <pre className="bloomberg-small-text bloomberg-data overflow-x-auto">
{`{
  "event": "trade.created",
  "data": { ... },
  "timestamp": "2026-04-05T10:00:00.000Z"
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
      <h3 className="bloomberg-card-title mb-3">Platform Infrastructure</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-3">
          <div className="bloomberg-small-text bloomberg-card-title text-sky-300">Settlement</div>
          <div className="bloomberg-section-label text-slate-300 mt-1">Zoniqx zConnect - T+0 atomic, non-custodial, cross-chain</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="bloomberg-small-text bloomberg-card-title text-sky-300">Token Standard</div>
          <div className="bloomberg-section-label text-slate-300 mt-1">Zoniqx zProtocol (DyCIST / ERC-7518) - CertiK audited</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="bloomberg-small-text bloomberg-card-title text-sky-300">Compliance</div>
          <div className="bloomberg-section-label text-slate-300 mt-1">Zoniqx zCompliance - AI-powered, 20+ jurisdictions</div>
        </div>
        <div className="bg-white/10 rounded-lg p-3">
          <div className="bloomberg-small-text bloomberg-card-title text-sky-300">Identity</div>
          <div className="bloomberg-section-label text-slate-300 mt-1">Zoniqx zIdentity - KYC/KYB with jurisdiction-based access</div>
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
    <div className="min-h-screen bg-slate-50" data-demo="developer-resources">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4" data-demo="api-explorer">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <div>
                <h1 className="bloomberg-page-heading text-slate-800">Developer Portal</h1>
                <p className="bloomberg-body-text text-slate-600 mt-1">
                  WREI Trading Platform REST API v1 — Market Data, Trading, Clients, Correspondence, Webhooks
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/openapi.yaml"
                target="_blank"
                rel="noopener noreferrer"
                className="bloomberg-section-label text-[#0EA5E9] hover:text-sky-600 bg-[#0EA5E9]/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                OpenAPI Spec
              </a>
              <div className="bloomberg-section-label">
                SYS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Overview stats */}
        <ApiOverview />

        {/* Quick start */}
        <QuickStartGuide />

        {/* Authentication guide */}
        <AuthenticationGuide />

        {/* Webhook event reference */}
        <WebhookEventReference />

        {/* Infrastructure overview */}
        <InfrastructureOverview />

        {/* API Explorer */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
            <h2 className="bloomberg-card-title text-[#1B2A4A]">API Explorer</h2>
            <p className="bloomberg-small-text text-slate-500">
              Browse all {allEndpoints.length} endpoints, view request/response schemas, and make live test requests
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
