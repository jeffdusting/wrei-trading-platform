'use client'

import { useState, useCallback } from 'react'
import {
  allEndpoints,
  apiCategories,
  getEndpointsByCategory,
  generateCodeExamples,
  type ApiEndpoint,
  type ApiEndpointAction,
  type ApiCategory,
  type CodeExample,
} from '@/lib/api-documentation'

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Method badge with colour coding */
function MethodBadge({ method }: { method: string }) {
  const colours: Record<string, string> = {
    GET: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    POST: 'bg-sky-100 text-sky-800 border-sky-200',
    DELETE: 'bg-red-100 text-red-800 border-red-200',
  }

  return (
    <span
      className={`inline-block px-2 py-0.5 bloomberg-section-label rounded border ${colours[method] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
      data-testid={`method-badge-${method.toLowerCase()}`}
    >
      {method}
    </span>
  )
}

/** Category icon */
function CategoryIcon({ category }: { category: string }) {
  const icons: Record<string, string> = {
    exchange: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
    shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
    globe: 'M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418',
    cube: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
    gauge: 'M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z',
  }

  const catInfo = apiCategories.find((c) => c.id === category)
  const path = icons[catInfo?.icon || 'chart'] || icons.chart

  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

/** JSON syntax highlighting (pre-formatted) */
function JsonDisplay({ data, maxHeight }: { data: unknown; maxHeight?: string }) {
  const jsonString = JSON.stringify(data, null, 2)

  return (
    <div className={`relative ${maxHeight ? `max-h-[${maxHeight}] overflow-y-auto` : ''}`}>
      <pre
        className="bg-slate-900 text-slate-100 p-4 rounded-lg bloomberg-data bloomberg-small-text overflow-x-auto whitespace-pre"
        data-testid="json-display"
      >
        {jsonString}
      </pre>
    </div>
  )
}

/** Code example tabs */
function CodeExamples({ examples }: { examples: CodeExample[] }) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div>
      <div className="flex border-b border-slate-200">
        {examples.map((ex, i) => (
          <button
            key={ex.language}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 bloomberg-small-text border-b-2 transition-colors ${
              activeTab === i
                ? 'border-[#0EA5E9] text-[#0EA5E9]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            data-testid={`code-tab-${ex.language}`}
          >
            {ex.label}
          </button>
        ))}
      </div>
      <pre
        className="bg-slate-900 text-slate-100 p-4 rounded-b-lg bloomberg-data bloomberg-small-text overflow-x-auto whitespace-pre"
        data-testid="code-display"
      >
        {examples[activeTab]?.code || ''}
      </pre>
    </div>
  )
}

/** Parameter table */
function ParameterTable({ parameters }: { parameters: ApiEndpointAction['parameters'] }) {
  if (parameters.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full bloomberg-small-text" data-testid="parameter-table">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 bloomberg-card-title text-slate-700">Parameter</th>
            <th className="text-left py-2 px-3 bloomberg-card-title text-slate-700">Type</th>
            <th className="text-left py-2 px-3 bloomberg-card-title text-slate-700">Required</th>
            <th className="text-left py-2 px-3 bloomberg-card-title text-slate-700">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="border-b border-slate-100">
              <td className="py-2 px-3">
                <code className="bg-slate-100 px-1.5 py-0.5 rounded bloomberg-data bloomberg-section-label text-[#1B2A4A]">
                  {param.name}
                </code>
              </td>
              <td className="py-2 px-3 text-slate-600">{param.type}</td>
              <td className="py-2 px-3">
                {param.required ? (
                  <span className="text-red-600 font-medium">Required</span>
                ) : (
                  <span className="text-slate-400">Optional</span>
                )}
              </td>
              <td className="py-2 px-3 text-slate-600">
                {param.description}
                {param.enum && (
                  <div className="mt-1">
                    <span className="bloomberg-section-label text-slate-400">Values: </span>
                    {param.enum.map((v) => (
                      <code key={v} className="bg-slate-100 px-1 py-0.5 rounded bloomberg-section-label mr-1">
                        {v}
                      </code>
                    ))}
                  </div>
                )}
                {param.default !== undefined && (
                  <div className="mt-1 bloomberg-section-label text-slate-400">
                    Default: <code className="bg-slate-100 px-1 py-0.5 rounded">{String(param.default)}</code>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// =============================================================================
// REQUEST BUILDER
// =============================================================================

interface RequestBuilderProps {
  endpoint: ApiEndpoint
  action: ApiEndpointAction
}

function RequestBuilder({ endpoint, action }: RequestBuilderProps) {
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(action.exampleRequest, null, 2)
  )
  const [apiKey, setApiKey] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const handleSendRequest = useCallback(async () => {
    setLoading(true)
    setResponse(null)
    setStatusCode(null)
    setResponseTime(null)

    const startTime = performance.now()

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (apiKey) {
        headers['X-WREI-API-Key'] = apiKey
      }

      let url = endpoint.path
      let fetchOptions: RequestInit = { headers }

      if (endpoint.method === 'GET') {
        // Build query params from the action
        const params = new URLSearchParams()
        params.set('action', action.name)
        // Add any additional parameters from the request body if set
        try {
          const bodyObj = JSON.parse(requestBody)
          Object.entries(bodyObj).forEach(([key, value]) => {
            if (key !== 'action' && value !== undefined && value !== null) {
              params.set(key, String(value))
            }
          })
        } catch {
          // Empty body is fine for GET
        }
        url = `${endpoint.path}?${params.toString()}`
        fetchOptions.method = 'GET'
      } else if (endpoint.method === 'DELETE') {
        const params = new URLSearchParams()
        params.set('action', action.name)
        url = `${endpoint.path}?${params.toString()}`
        fetchOptions.method = 'DELETE'
      } else {
        fetchOptions.method = 'POST'
        fetchOptions.body = requestBody
      }

      const res = await fetch(url, fetchOptions)
      const elapsed = Math.round(performance.now() - startTime)
      const data = await res.json()

      setStatusCode(res.status)
      setResponseTime(elapsed)
      setResponse(JSON.stringify(data, null, 2))
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime)
      setResponseTime(elapsed)
      setStatusCode(0)
      setResponse(JSON.stringify({ error: err instanceof Error ? err.message : 'Request failed' }, null, 2))
    } finally {
      setLoading(false)
    }
  }, [endpoint, action, requestBody, apiKey])

  const resetToExample = useCallback(() => {
    setRequestBody(JSON.stringify(action.exampleRequest, null, 2))
  }, [action])

  return (
    <div className="space-y-4" data-testid="request-builder">
      {/* API Key input */}
      {endpoint.authentication.required && (
        <div>
          <label className="block bloomberg-small-text text-slate-700 mb-1">
            API Key ({endpoint.authentication.header})
          </label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key (optional in dev mode)"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bloomberg-small-text focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent"
            data-testid="api-key-input"
          />
          <p className="mt-1 bloomberg-section-label text-slate-400">{endpoint.authentication.devMode}</p>
        </div>
      )}

      {/* Request body editor (for POST) */}
      {endpoint.method === 'POST' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block bloomberg-small-text text-slate-700">Request Body</label>
            <button
              onClick={resetToExample}
              className="bloomberg-section-label text-[#0EA5E9] hover:text-sky-600 transition-colors"
              data-testid="reset-body-button"
            >
              Reset to Example
            </button>
          </div>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            rows={Math.min(15, requestBody.split('\n').length + 2)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bloomberg-data bloomberg-small-text focus:outline-none focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent bg-slate-50"
            data-testid="request-body-editor"
            spellCheck={false}
          />
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSendRequest}
        disabled={loading}
        className={`w-full py-2.5 px-4 rounded-lg font-medium bloomberg-small-text transition-colors ${
          loading
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
            : 'bg-[#0EA5E9] text-white hover:bg-sky-600 active:bg-sky-700'
        }`}
        data-testid="send-request-button"
      >
        {loading ? 'Sending...' : 'Try It'}
      </button>

      {/* Response */}
      {response && (
        <div data-testid="response-panel">
          <div className="flex items-center justify-between mb-2">
            <span className="bloomberg-small-text text-slate-700">Response</span>
            <div className="flex items-center space-x-3">
              {statusCode !== null && (
                <span
                  className={`bloomberg-data bloomberg-section-label px-2 py-0.5 rounded ${
                    statusCode >= 200 && statusCode < 300
                      ? 'bg-emerald-100 text-emerald-700'
                      : statusCode >= 400
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                  data-testid="response-status"
                >
                  {statusCode}
                </span>
              )}
              {responseTime !== null && (
                <span className="bloomberg-section-label text-slate-400" data-testid="response-time">
                  {responseTime}ms
                </span>
              )}
            </div>
          </div>
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg bloomberg-data bloomberg-small-text overflow-x-auto max-h-96 overflow-y-auto whitespace-pre">
            {response}
          </pre>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// ENDPOINT DETAIL PANEL
// =============================================================================

interface EndpointDetailProps {
  endpoint: ApiEndpoint
}

function EndpointDetail({ endpoint }: EndpointDetailProps) {
  const [selectedAction, setSelectedAction] = useState(0)
  const [activeSection, setActiveSection] = useState<'docs' | 'try' | 'code'>('docs')

  const action = endpoint.actions[selectedAction]
  const codeExamples = action ? generateCodeExamples(endpoint, action) : []

  return (
    <div data-testid="endpoint-detail">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <MethodBadge method={endpoint.method} />
          <code className="bloomberg-card-title bloomberg-data text-[#1B2A4A] bloomberg-card-title">{endpoint.path}</code>
        </div>
        <h2 className="bloomberg-metric-value text-[#1B2A4A]">{endpoint.title}</h2>
        <p className="text-slate-600 mt-1">{endpoint.description}</p>
      </div>

      {/* Authentication & Rate Limit info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Authentication</h3>
          <p className="bloomberg-small-text text-slate-600">
            {endpoint.authentication.required ? (
              <>
                Required via <code className="bg-white px-1 py-0.5 rounded bloomberg-section-label border border-slate-200">{endpoint.authentication.header}</code> header
              </>
            ) : (
              'Not required'
            )}
          </p>
          <p className="bloomberg-section-label text-slate-400 mt-1">{endpoint.authentication.devMode}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Rate Limit</h3>
          <p className="bloomberg-small-text text-slate-600">{endpoint.rateLimit.windowDescription}</p>
          <p className="bloomberg-section-label text-slate-400 mt-1">
            {endpoint.rateLimit.maxRequests} requests per {endpoint.rateLimit.windowMs / 1000}s window
          </p>
        </div>
      </div>

      {/* Action selector (if multiple actions) */}
      {endpoint.actions.length > 1 && (
        <div className="mb-6">
          <h3 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {endpoint.actions.map((act, i) => (
              <button
                key={act.name}
                onClick={() => { setSelectedAction(i); setActiveSection('docs') }}
                className={`px-3 py-1.5 bloomberg-small-text rounded-lg border transition-colors ${
                  selectedAction === i
                    ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                }`}
                data-testid={`action-button-${act.name}`}
              >
                {act.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Section tabs */}
      {action && (
        <>
          <div className="flex border-b border-slate-200 mb-4">
            {(['docs', 'try', 'code'] as const).map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 bloomberg-small-text border-b-2 transition-colors ${
                  activeSection === section
                    ? 'border-[#0EA5E9] text-[#0EA5E9]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
                data-testid={`section-tab-${section}`}
              >
                {section === 'docs' ? 'Documentation' : section === 'try' ? 'Try It' : 'Code Examples'}
              </button>
            ))}
          </div>

          {/* Documentation section */}
          {activeSection === 'docs' && (
            <div className="space-y-6" data-testid="docs-section">
              <div>
                <h3 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-1">{action.name}</h3>
                <p className="bloomberg-small-text text-slate-600">{action.description}</p>
              </div>

              {/* Parameters */}
              {action.parameters.length > 0 && (
                <div>
                  <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Parameters</h4>
                  <ParameterTable parameters={action.parameters} />
                </div>
              )}

              {/* Example request */}
              {Object.keys(action.exampleRequest).length > 0 && (
                <div>
                  <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Example Request</h4>
                  <JsonDisplay data={action.exampleRequest} />
                </div>
              )}

              {/* Example response */}
              <div>
                <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Example Response</h4>
                <JsonDisplay data={action.exampleResponse} />
              </div>

              {/* Error codes */}
              {endpoint.errorCodes.length > 0 && (
                <div>
                  <h4 className="bloomberg-small-text bloomberg-card-title text-slate-700 mb-2">Error Codes</h4>
                  <div className="space-y-2">
                    {endpoint.errorCodes.map((err) => (
                      <div key={err.code} className="flex items-start space-x-3 bloomberg-small-text">
                        <span className={`bloomberg-data px-2 py-0.5 rounded bloomberg-section-label ${
                          err.code >= 500 ? 'bg-red-100 text-red-700'
                          : err.code >= 400 ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                        }`}>
                          {err.code}
                        </span>
                        <div>
                          <span className="font-medium text-slate-700">{err.name}</span>
                          <span className="text-slate-500 ml-2">{err.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {endpoint.notes && endpoint.notes.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="bloomberg-small-text bloomberg-card-title text-amber-800 mb-2">Notes</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {endpoint.notes.map((note, i) => (
                      <li key={i} className="bloomberg-small-text text-amber-700">{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Try It section */}
          {activeSection === 'try' && (
            <RequestBuilder endpoint={endpoint} action={action} />
          )}

          {/* Code Examples section */}
          {activeSection === 'code' && (
            <div data-testid="code-section">
              <CodeExamples examples={codeExamples} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

// =============================================================================
// MAIN API EXPLORER COMPONENT
// =============================================================================

export default function APIExplorer() {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(allEndpoints[0]?.id || '')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const groupedEndpoints = getEndpointsByCategory()
  const selectedEndpoint = allEndpoints.find((ep) => ep.id === selectedEndpointId)

  return (
    <div className="flex h-full min-h-[600px]" data-testid="api-explorer">
      {/* Left sidebar: endpoint list */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 overflow-hidden border-r border-slate-200 bg-white flex-shrink-0`}
      >
        <div className="w-80 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="bloomberg-card-title text-[#1B2A4A]">API Endpoints</h3>
            <span className="bloomberg-section-label text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              v2.2.0
            </span>
          </div>

          {/* Grouped endpoint list */}
          <nav className="space-y-4" data-testid="endpoint-list">
            {apiCategories.map((cat) => {
              const endpoints = groupedEndpoints[cat.id]
              if (!endpoints || endpoints.length === 0) return null

              return (
                <div key={cat.id}>
                  <div className="flex items-center space-x-2 bloomberg-section-label bloomberg-card-title text-slate-400 uppercase tracking-wider mb-2 px-2">
                    <CategoryIcon category={cat.id} />
                    <span>{cat.label}</span>
                  </div>
                  <div className="space-y-1">
                    {endpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setSelectedEndpointId(ep.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg bloomberg-small-text transition-colors ${
                          selectedEndpointId === ep.id
                            ? 'bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                        data-testid={`endpoint-nav-${ep.id}`}
                      >
                        <div className="flex items-center space-x-2">
                          <MethodBadge method={ep.method} />
                          <span className="bloomberg-data bloomberg-section-label truncate">{ep.path}</span>
                        </div>
                        <div className="bloomberg-section-label text-slate-400 mt-0.5 ml-1 truncate">
                          {ep.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex-shrink-0 w-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors border-r border-slate-200"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        data-testid="sidebar-toggle"
      >
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Centre + Right panel: endpoint detail */}
      <div className="flex-1 overflow-y-auto p-6 bg-white">
        {selectedEndpoint ? (
          <EndpointDetail endpoint={selectedEndpoint} />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">
            Select an endpoint to view documentation
          </div>
        )}
      </div>
    </div>
  )
}
