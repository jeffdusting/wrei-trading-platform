# WREI Trading Platform API Reference

This document provides a comprehensive reference for every API route exposed by the WREI Trading Platform. All endpoints are Next.js 14 App Router server-side API routes deployed on Vercel.

## 1. Authentication

1.1. **Current state.** The platform is in demonstration mode. API key validation is implemented but operates in permissive mode -- requests without a key are accepted as `anonymous`.

1.2. **Header format.** Authenticated requests supply the header `X-WREI-API-Key`.

1.3. **Future requirement.** Production deployment under an Australian Financial Services Licence (AFSL) will mandate OAuth 2.0 bearer tokens, client certificate authentication for institutional endpoints, and full audit logging of all authenticated sessions.

1.4. **Rate limiting.** Most endpoints enforce a per-key rate limit of 100 requests per minute. The `/api/performance` endpoint enforces 50 GET and 20 POST requests per minute.

---

## 2. POST /api/negotiate

2.1. **Purpose.** Conducts AI-powered carbon credit price negotiation between the WREI agent and a human buyer, enforcing institutional-grade defence layers.

2.2. **AI involvement.** Calls the Anthropic Claude API using model `claude-opus-4-6` with a dynamically constructed system prompt. Committee mode increases `max_tokens` from 1,024 to 2,048.

2.3. **Request body schema.**

```typescript
{
  message: string;              // Buyer's negotiation message (empty string for opening)
  state: NegotiationState;      // Full negotiation state object (round, phase, prices, history)
  isOpening: boolean;           // true for the first message in a session
  committee?: CommitteeConfig;  // Optional committee-mode configuration
  instrumentType?: string;      // e.g. "ESC", "ACCU", "LGC", "WREI_CC"
}
```

2.4. **Response body schema.**

```typescript
{
  agentMessage: string;                          // WREI agent's negotiation response
  state: NegotiationState;                       // Updated negotiation state
  classification: ArgumentClassification;        // e.g. "price_objection", "quality_question", "general"
  emotionalState: EmotionalState;                // e.g. "neutral", "frustrated", "engaged"
  threatLevel: "none" | "low" | "medium" | "high";
  tokenMetadata: object | null;                  // Token metadata when applicable
  strategyExplanation?: NegotiationStrategyExplanation; // Present for institutional personas
  committeeResponse?: CommitteeResponse;         // Present when committee mode is active
  committeeConfig?: CommitteeConfig;             // Updated committee config (committee mode only)
}
```

2.5. **Defence layers enforced on every request.**

The following constraints are enforced in application code, not delegated to the LLM:

- 2.5.1. Price floor of $120/t -- no offer may fall below this value.
- 2.5.2. Maximum 5% concession per round.
- 2.5.3. Maximum 20% total concession from the anchor price.
- 2.5.4. Input sanitisation strips injection attempts before the message reaches Claude.
- 2.5.5. Output validation removes internal reasoning before delivery to the client.

2.6. **Error response.**

```json
{
  "agentMessage": "The WREI platform is momentarily unavailable. Please try again.",
  "state": null,
  "classification": "general",
  "emotionalState": "neutral",
  "threatLevel": "none",
  "error": "Service temporarily unavailable"
}
```

Status code: `500`.

2.7. **Example request.**

```json
{
  "message": "We can offer $130 per tonne for 500 credits.",
  "state": { "round": 2, "phase": "negotiation", "anchorPrice": 150, "priceFloor": 120 },
  "isOpening": false,
  "instrumentType": "WREI_CC"
}
```

---

## 3. POST /api/trade

3.1. **Purpose.** Thin re-export of `/api/negotiate` -- both endpoints serve identical negotiation logic.

3.2. **Implementation.** The route file contains a single line: `export { POST } from '@/app/api/negotiate/route';`.

3.3. **Request/response schemas.** Identical to Section 2 above.

---

## 4. GET /api/trades

4.1. **Purpose.** Lists trades from the Vercel Postgres database with optional filtering.

4.2. **AI involvement.** None.

4.3. **Query parameters.**

The following query parameters are supported:

- `instrument_id` (string, optional) -- filter by instrument identifier.
- `status` (string, optional) -- filter by trade status.
- `limit` (integer, optional, default `50`) -- maximum number of results.
- `offset` (integer, optional, default `0`) -- pagination offset.

4.4. **Response body schema.**

```json
{
  "trades": [ { "id": "...", "instrument_id": "...", "quantity": 500, "price_per_unit": 142.50, "total_value": 71250, "direction": "sell", "currency": "AUD", "status": "completed" } ]
}
```

4.5. **Error response.** When the database is unavailable, returns `200` with `{ "trades": [], "error": "Database unavailable" }`.

## 5. POST /api/trades

5.1. **Purpose.** Records a new trade and initiates asynchronous settlement via the settlement orchestrator.

5.2. **AI involvement.** None.

5.3. **Request body schema.**

```typescript
{
  instrument_id: string;
  negotiation_id: string;
  direction?: string;          // Default: "sell"
  quantity: number;
  price_per_unit: number;
  currency?: string;           // Default: "AUD"
  buyer_persona?: string;
  instrument_type?: string;    // e.g. "ESC" -- used for settlement routing
  metadata?: object;           // Default: {}
}
```

5.4. **Response body schema (201).**

```json
{
  "trade": {
    "id": "trade_abc123",
    "instrument_id": "ESC-2026-Q1",
    "direction": "sell",
    "quantity": 500,
    "price_per_unit": 142.50,
    "total_value": 71250,
    "currency": "AUD",
    "buyer_persona": "esg_fund_manager"
  },
  "settlementId": "stl_xyz789"
}
```

5.5. **Settlement behaviour.** Settlement is initiated asynchronously after trade creation. A settlement failure does not block trade confirmation -- the `settlementId` field will be absent if settlement initiation fails.

5.6. **Error response.** `500` with `{ "error": "Failed to record trade" }`.

---

## 6. GET /api/prices

6.1. **Purpose.** Serves live, cached, or simulated instrument prices and feed health data.

6.2. **AI involvement.** None.

6.3. **Query parameters.**

The following query parameter combinations are supported:

- No parameters -- returns all instrument prices and feed health status.
- `type` (InstrumentType) -- returns a single instrument's current price.
- `history` (InstrumentType) + `days` (integer, default `30`) -- returns price history for charting.

6.4. **Valid instrument types.** `ESC`, `VEEC`, `PRC`, `ACCU`, `LGC`, `STC`, `WREI_CC`, `WREI_ACO`.

6.5. **Response body schema (all prices).**

```json
{
  "prices": { "ESC": { "bid": 47.60, "ask": 48.00, "last": 47.80, "change": 0.42 } },
  "health": { "status": "connected", "lastUpdate": "2026-04-05T10:00:00Z" }
}
```

6.6. **Response body schema (history).**

```json
{
  "history": [
    { "date": "2026-03-06", "open": 46.50, "high": 48.10, "low": 46.20, "close": 47.80 }
  ]
}
```

6.7. **Error response.** `500` with `{ "error": "<message>" }`.

---

## 7. GET /api/market-commentary

7.1. **Purpose.** Generates AI-authored market commentary covering VCM conditions, Australian ESC markets, and WREI platform positioning.

7.2. **AI involvement.** Calls the Anthropic Claude API using model `claude-sonnet-4-20250514` with `max_tokens: 500`. Falls back to pre-written commentary when the API key is missing or the call fails.

7.3. **Request.** No parameters required (GET with no query string).

7.4. **Response body schema.**

```json
{
  "commentary": "Voluntary carbon markets continue to demonstrate bifurcation...",
  "generatedAt": "2026-04-05T10:30:00.000Z",
  "topics": ["VCM Conditions", "ESC Market", "WREI Outlook"],
  "source": "ai"
}
```

7.5. **Source field values.**

The `source` field indicates the origin of the commentary:

- `"ai"` -- generated by Claude API in real time.
- `"fallback"` -- pre-written static commentary returned when AI generation is unavailable.

7.6. **Error handling.** Errors are caught silently and the fallback commentary is returned. The endpoint never returns an error status code to the client.

---

## 8. GET /api/market-data

8.1. **Purpose.** External API gateway for carbon market feeds, RWA market data, sentiment analysis, competitive intelligence, and historical data.

8.2. **AI involvement.** None (data is sourced from internal feed managers and intelligence systems).

8.3. **Authentication.** Requires `X-WREI-API-Key` header. Returns `401` on failure.

8.4. **Query parameters.**

The `action` parameter (required) selects the data source:

- `carbon_pricing` -- current carbon credit pricing data.
- `carbon_analytics` -- carbon market trend analytics.
- `rwa_market` -- real-world asset tokenisation market data.
- `rwa_analytics` -- RWA market analytics.
- `market_sentiment` -- sentiment analysis with sector breakdown.
- `competitive_analysis` -- competitive intelligence across global tokenisation market.
- `carbon_projections` -- carbon price projections for 2024--2030.
- `historical` -- historical data (requires additional parameters `feedType`, `timeRange`, optional `maxPoints`).
- `feed_status` -- health status of all data feeds.
- `live_data` -- delegated to the live market data handler.

8.5. **Historical data parameters.**

The `historical` action requires the following additional query parameters:

- `feedType` -- one of `carbon_pricing`, `rwa_market`, `regulatory_alerts`, `market_sentiment`.
- `timeRange` -- one of `1h`, `4h`, `12h`, `24h`, `3d`, `7d`, `30d`, `90d`, `1y`.
- `maxPoints` (optional, default `100`, max `1000`) -- data point limit.

8.6. **Response wrapper.**

All responses are wrapped in a standard envelope:

```json
{
  "success": true,
  "data": { },
  "metadata": {
    "source": "WREI_CARBON_FEED",
    "requestId": "mkt_1712304000_a1b2c3",
    "timestamp": "2026-04-05T10:00:00Z",
    "processingTime": 42
  }
}
```

8.7. **Error responses.**

The following error codes are returned:

- `400` -- invalid `action` parameter.
- `401` -- authentication failure.
- `429` -- rate limit exceeded (100 requests/minute).
- `500` -- internal server error.

---

## 9. POST /api/analytics

9.1. **Purpose.** Exposes the WREI financial calculation engine as a service API, supporting IRR, NPV, carbon metrics, portfolio optimisation, Monte Carlo simulation, and investment calculations.

9.2. **AI involvement.** None (pure deterministic calculations).

9.3. **Authentication.** Requires `X-WREI-API-Key` header.

9.4. **Request body -- action routing.**

The `action` field (required) selects the calculation:

- `irr` -- Internal Rate of Return calculation.
- `npv` -- Net Present Value calculation.
- `carbon_metrics` -- carbon credit investment metrics.
- `asset_co_metrics` -- Asset Co infrastructure investment metrics.
- `dual_portfolio` -- dual portfolio allocation metrics.
- `risk_profile` -- risk assessment by token type.
- `scenario_analysis` -- multi-scenario investment analysis.
- `portfolio_optimization` -- optimal portfolio allocation.
- `monte_carlo` -- Monte Carlo simulation (100--10,000 runs).
- `professional_metrics` -- persona-specific professional analytics.
- `calculate` -- general investment calculator.

9.5. **Example request (IRR).**

```json
{
  "action": "irr",
  "cashFlows": [
    { "year": 0, "amount": -100000 },
    { "year": 1, "amount": 25000 },
    { "year": 2, "amount": 30000 },
    { "year": 3, "amount": 35000 },
    { "year": 4, "amount": 40000 }
  ]
}
```

9.6. **Example response (IRR).**

```json
{
  "success": true,
  "data": {
    "irr": 0.1247,
    "irrPercentage": "12.47",
    "cashFlowsCount": 5,
    "totalInvestment": -100000,
    "totalReturns": 130000,
    "annualizationPeriod": 4
  },
  "metadata": {
    "source": "WREI_IRR_CALCULATOR",
    "requestId": "ana_1712304000_d4e5f6"
  }
}
```

9.7. **Example request (Monte Carlo).**

```json
{
  "action": "monte_carlo",
  "investmentAmount": 500000,
  "tokenType": "carbon_credits",
  "simulations": 1000,
  "timeHorizon": 10
}
```

9.8. **Error responses.**

The following error codes are returned:

- `400` -- invalid `action` or missing required fields.
- `401` -- authentication failure.
- `429` -- rate limit exceeded.
- `500` -- internal calculation error.

---

## 10. POST /api/analytics/predict

10.1. **Purpose.** Generates AI-enhanced predictive analytics including market forecasts, risk predictions, performance optimisations, and competitive intelligence.

10.2. **AI involvement.** Uses the `IntelligentAnalyticsEngine` for analysis generation. Claude API integration (model `claude-3-sonnet-20240229`) is implemented but disabled in the demo build; the engine falls back to its internal intelligence layer.

10.3. **Request body schema.**

```typescript
{
  action: string;          // See 10.4 for valid actions
  sessionId: string;       // Client session identifier
  audienceType: "executive" | "technical" | "compliance";
  forceRefresh?: boolean;  // Bypass 5-minute cache (default: false)
}
```

10.4. **Valid actions.**

The following actions are supported:

- `generate_full_analysis` -- comprehensive predictive analytics suite.
- `generate_market_forecast` -- market forecast only.
- `generate_risk_predictions` -- risk predictions only.
- `generate_performance_optimisation` -- performance optimisation recommendations.
- `generate_competitive_intelligence` -- competitive landscape analysis.
- `engine_health` -- analytics engine health check.
- `performance_metrics` -- engine performance metrics.

10.5. **Response body schema.**

```json
{
  "success": true,
  "data": { },
  "metadata": {
    "sessionId": "sess_abc123",
    "audienceType": "executive",
    "action": "generate_full_analysis",
    "processingTime": 1250,
    "timestamp": "2026-04-05T10:30:00Z",
    "source": "WREI_INTELLIGENT_ANALYTICS_ENGINE"
  }
}
```

10.6. **Error responses.**

The following error codes are returned:

- `400` -- missing required fields or invalid `action`/`audienceType`.
- `500` -- prediction engine error.

## 11. GET /api/analytics/predict

11.1. **Purpose.** Health check endpoint for the Intelligent Analytics Engine.

11.2. **AI involvement.** None (returns cached engine state).

11.3. **Response body schema.**

```json
{
  "success": true,
  "data": {
    "health": { },
    "performance": { },
    "engine_state": "active"
  },
  "metadata": {
    "endpoint": "/api/analytics/predict",
    "timestamp": "2026-04-05T10:30:00Z",
    "source": "WREI_INTELLIGENT_ANALYTICS_ENGINE"
  }
}
```

---

## 12. GET /api/compliance

12.1. **Purpose.** Retrieves compliance status, regulatory alerts, framework information, and digital assets framework assessment.

12.2. **AI involvement.** None.

12.3. **Authentication.** Requires `X-WREI-API-Key` header.

12.4. **Query parameters.**

The `action` parameter (required) selects the compliance data:

- `status` -- overall compliance status and score.
- `alerts` -- active compliance alerts sorted by priority.
- `regulatory_framework` -- Australian regulatory framework details (ASIC, APRA, AUSTRAC, RBA).
- `digital_assets_framework` -- Digital Assets Framework compliance assessment.

12.5. **Example response (status).**

```json
{
  "success": true,
  "data": {
    "complianceStatus": { },
    "timestamp": "2026-04-05T10:00:00Z",
    "jurisdiction": "australia",
    "framework": "AUSTRAC_ASIC_APRA",
    "complianceScore": 85,
    "lastAssessment": "2026-04-05T10:00:00Z",
    "nextReview": "2026-07-04T10:00:00Z"
  }
}
```

## 13. POST /api/compliance

13.1. **Purpose.** Performs compliance assessments including investor classification, AFSL checks, AML/CTF verification, environmental compliance, tokenisation standards, full reporting, and tax treatment optimisation.

13.2. **AI involvement.** None (rule-based compliance engine).

13.3. **Authentication.** Requires `X-WREI-API-Key` header.

13.4. **Valid actions.**

The `action` field in the request body selects the assessment:

- `investor_classification` -- assess investor classification under Australian law. Required: `entityType`.
- `afsl_check` -- AFSL compliance check. Required: `offeringStructure`.
- `aml_check` -- AML/CTF compliance check. Required: `customerType`.
- `environmental` -- environmental compliance assessment. Required: `creditType`, `verificationStandard`.
- `tokenization_standards` -- tokenisation standards verification. Required: `tokenStandard`, `metadataStandard`.
- `full_report` -- comprehensive compliance report generation.
- `tax_treatment` -- optimal tax treatment recommendation. Required: `tokenType`, `yieldMechanism`, `investorProfile`.

13.5. **Example request (investor classification).**

```json
{
  "action": "investor_classification",
  "entityType": "corporate",
  "netAssets": 10000000,
  "grossIncome": 2500000,
  "aum": 50000000
}
```

13.6. **Example response (investor classification).**

```json
{
  "success": true,
  "data": {
    "investorClassification": { "classification": "wholesale", "eligible": true },
    "inputParameters": { "entityType": "corporate", "netAssets": 10000000 },
    "assessmentTimestamp": "2026-04-05T10:00:00Z",
    "validityPeriod": "12 months",
    "reviewRequired": false
  }
}
```

13.7. **Error responses.**

The following error codes are returned:

- `400` -- invalid `action` or missing required fields.
- `401` -- authentication failure.
- `429` -- rate limit exceeded.
- `500` -- compliance engine error.

---

## 14. GET /api/performance

14.1. **Purpose.** Retrieves real-time performance metrics, system health data, benchmarks, and load test results for institutional-grade monitoring.

14.2. **AI involvement.** None.

14.3. **Authentication.** Requires `X-WREI-API-Key` header.

14.4. **Query parameters.**

The `action` parameter (optional, default `snapshot`) selects the data:

- `snapshot` -- current performance snapshot (response times, throughput, memory).
- `benchmarks` -- performance benchmarks with targets and current values.
- `health` -- system health report with component status and alerts.
- `load_test` -- historical load test results.

14.5. **Example response (health).**

```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "components": {
      "apiGateway": "healthy",
      "analyticsEngine": "healthy",
      "complianceModule": "warning",
      "marketDataFeeds": "healthy"
    },
    "alerts": [],
    "recommendations": ["System performance is within acceptable ranges"]
  }
}
```

## 15. POST /api/performance

15.1. **Purpose.** Triggers performance benchmarks and stress tests.

15.2. **AI involvement.** None.

15.3. **Authentication.** Requires `X-WREI-API-Key` header.

15.4. **Valid actions.**

The `action` field in the request body selects the operation:

- `run_benchmark` -- execute a benchmark run. Optional: `benchmarkType` (`full`, `api`, `calculation`), `iterations` (default `100`).
- `stress_test` -- execute a stress test. Optional: `concurrency` (default `10`), `duration` (max `60000` ms).
- `clear_metrics` -- reset all collected performance metrics.

15.5. **Example request.**

```json
{
  "action": "run_benchmark",
  "benchmarkType": "api",
  "iterations": 50
}
```

15.6. **Error responses.** `401`, `429`, or `500` as per standard error handling.

---

## 16. GET /api/metadata

16.1. **Purpose.** Provides access to token metadata for analytics, reporting, and token lifecycle tracking.

16.2. **AI involvement.** None.

16.3. **Query parameters.**

The `action` parameter (optional, default `query`) selects the operation:

- `query` -- query tokens with optional filters: `tokenType`, `vesselId`, `minQualityScore`, `verificationStatus`, `fromDate`, `toDate`.
- `statistics` -- aggregate metadata statistics.
- `retrieve` -- retrieve a single token's metadata. Required: `tokenId`.
- `tokens` -- list all token identifiers.

16.4. **Example request.** `GET /api/metadata?action=retrieve&tokenId=WREI-CC-00042`

16.5. **Response body schema.**

```json
{
  "success": true,
  "data": {
    "tokenId": "WREI-CC-00042",
    "tokenType": "WREI_CC",
    "qualityScore": 92.5,
    "verificationStatus": true,
    "createdAt": "2026-03-01T00:00:00Z"
  }
}
```

16.6. **Error responses.**

The following error codes are returned:

- `400` -- invalid action or missing `tokenId` for retrieve.
- `404` -- token metadata not found.
- `500` -- internal server error.

## 17. DELETE /api/metadata

17.1. **Purpose.** Clears all stored token metadata (for testing and demo purposes).

17.2. **Query parameters.** `action=clear` (required).

17.3. **Response body schema.**

```json
{
  "success": true,
  "message": "All metadata cleared"
}
```

17.4. **Error response.** `400` with `{ "success": false, "error": "Invalid action. Supported actions: clear" }`.

---

## 18. POST /api/scenarios/generate

18.1. **Purpose.** Generates AI-powered trading scenarios with realistic market conditions, participant behaviour models, and regulatory considerations.

18.2. **AI involvement.** Calls the Anthropic Claude API using model `claude-3-sonnet-20240229` with `max_tokens: 2000`. Falls back to a pre-built scenario when the API call fails.

18.3. **Request body schema.**

```typescript
{
  operation: string;      // Required. e.g. "generate_scenario"
  audience: "executive" | "technical" | "compliance";  // Required
  config?: {
    marketCondition?: string;  // e.g. "stable", "bull", "bear", "volatile", "crisis"
    complexity?: string;       // e.g. "moderate", "high"
    duration?: string;         // e.g. "30 minutes"
  };
  marketData?: {
    currentPrice?: string;     // e.g. "47.80"
    volume?: string;           // e.g. "1,250,000"
    volatility?: string;       // e.g. "18%"
  };
}
```

18.4. **Response body schema.**

```json
{
  "success": true,
  "data": {
    "scenario": {
      "id": "scenario-1712304000",
      "name": "NSW ESC Standard Trading Scenario",
      "description": "A typical trading day in the NSW ESS market",
      "marketCondition": "stable",
      "duration": 30,
      "complexity": "moderate"
    },
    "participants": [
      { "type": "Energy Retailer", "riskAppetite": "moderate", "tradingVolume": "10,000 tonnes" }
    ],
    "marketConditions": {
      "startPrice": 47.80,
      "endPrice": 48.20,
      "volatility": 0.15,
      "volume": 125000,
      "trend": "stable"
    }
  },
  "metadata": {
    "operation": "generate_scenario",
    "audience": "executive",
    "timestamp": "2026-04-05T10:30:00Z",
    "model": "claude-3-sonnet-20240229"
  }
}
```

18.5. **Fallback behaviour.** When the Claude API is unavailable, the endpoint returns `"fallback": true` in the metadata and a pre-built scenario in the data payload. The response status remains `200`.

18.6. **Payload size limit.** Request bodies exceeding 25 KB are rejected with status `413`.

18.7. **Error responses.**

The following error codes are returned:

- `400` -- missing required fields (`operation`, `audience`) or invalid audience type.
- `413` -- request payload too large.
- `500` -- internal server error.

---

## 19. AI Model Summary

The following table summarises which endpoints invoke the Claude API:

| Endpoint | Model | Purpose |
|---|---|---|
| `POST /api/negotiate` | `claude-opus-4-6` | Multi-turn price negotiation |
| `POST /api/trade` | `claude-opus-4-6` | Re-export of negotiate |
| `GET /api/market-commentary` | `claude-sonnet-4-20250514` | Market commentary generation |
| `POST /api/analytics/predict` | Engine-internal (Claude disabled in demo) | Predictive analytics |
| `POST /api/scenarios/generate` | `claude-3-sonnet-20240229` | Trading scenario generation |

All other endpoints (`/api/trades`, `/api/prices`, `/api/market-data`, `/api/analytics`, `/api/compliance`, `/api/performance`, `/api/metadata`) perform deterministic calculations or data retrieval without AI involvement.

---

## 20. Standard Error Envelope

20.1. **API-helper-wrapped endpoints** (`/api/market-data`, `/api/analytics`, `/api/compliance`, `/api/performance`) return errors in the following format:

```json
{
  "success": false,
  "error": "Description of the error",
  "metadata": {
    "timestamp": "2026-04-05T10:00:00Z",
    "processingTime": 12
  }
}
```

20.2. **Other endpoints** (`/api/negotiate`, `/api/trades`, `/api/prices`, `/api/metadata`, `/api/scenarios/generate`) return errors as plain JSON objects with an `error` field and the appropriate HTTP status code.

---

*Document generated: 5 April 2026. Covers all API routes in `app/api/`.*
