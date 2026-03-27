# WREI Trading Platform -- API Reference and Integration Guide

**Document Version:** 2.0
**Date:** 2026-03-27

---

## 1. Authentication

All API endpoints require authentication via the `X-WREI-API-Key` header.

```
X-WREI-API-Key: your_api_key_here
```

**Development Mode:** When the `WREI_API_KEY` environment variable is not set, authentication is automatically bypassed. This allows development and testing without API key configuration.

**Rate Limiting:** 100 requests per minute per API key (50 for the performance endpoint). Exceeding the limit returns HTTP 429.

---

## 2. Response Envelope

All API responses follow a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "source": "WREI_ANALYTICS_ENGINE",
    "timestamp": "2026-03-25T10:30:00.000Z",
    "requestId": "ana_1711353000000_a1b2c3",
    "processingTimeMs": 45,
    "apiVersion": "2.2.0"
  }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Description of what went wrong",
  "code": 400
}
```

---

## 3. API Endpoints

### 3.1 Negotiation API

**Endpoint:** `POST /api/negotiate`

The core trading engine. Accepts buyer messages, processes them through defence layers, calls Claude API, enforces constraints, and returns the AI agent's response.

**Request Body:**
```json
{
  "message": "I'm interested in purchasing carbon credits for our offset programme.",
  "state": {
    "round": 1,
    "phase": "opening",
    "creditType": "carbon",
    "anchorPrice": 28.12,
    "currentOfferPrice": 28.12,
    "priceFloor": 22.80,
    "maxConcessionPerRound": 0.05,
    "maxTotalConcession": 0.20,
    "messages": [],
    "buyerProfile": { ... }
  },
  "isOpening": true,
  "committee": {
    "enabled": false
  }
}
```

**Response:**
```json
{
  "agentMessage": "Welcome to the WREI carbon credit trading platform...",
  "state": { /* updated NegotiationState */ },
  "classification": "information_request",
  "emotionalState": "neutral",
  "threatLevel": "none",
  "tokenMetadata": { /* optional token provenance data */ },
  "strategyExplanation": {
    "decision": "Opening with institutional credibility positioning",
    "rationale": "First contact - establishing trust and WREI differentiation",
    "marketContext": "VCM spot at $8.45 supports premium positioning",
    "riskAssessment": "Low risk opening phase",
    "alternativeOptions": ["Aggressive pricing lead", "Market data heavy approach"],
    "expectedOutcome": "Buyer engagement with quality-focused dialogue",
    "confidenceLevel": "high"
  }
}
```

**Committee Mode:**
When `committee.enabled` is `true`, the response includes perspectives from up to 4 committee members (CIO, Risk Manager, Compliance Officer, ESG Lead), each with independent stances and reasoning.

---

### 3.2 Analytics API

**Endpoint:** `POST /api/analytics`

Financial calculation engine exposing institutional-grade analytics.

**Actions:**

| Action | Description |
|--------|-------------|
| `irr` | Internal Rate of Return calculation |
| `npv` | Net Present Value calculation |
| `carbon_metrics` | Carbon credit financial metrics |
| `asset_co_metrics` | Asset Co token metrics |
| `dual_portfolio_metrics` | Combined portfolio metrics |
| `risk_profile` | Risk assessment profile |
| `scenario_analysis` | Multi-scenario analysis (base/bull/bear/stress) |
| `monte_carlo` | Monte Carlo simulation |
| `portfolio_optimization` | Portfolio allocation optimisation |
| `investment_calculator` | Full investment calculation |
| `persona_metrics` | Persona-specific financial metrics |

**Example -- IRR Calculation:**
```json
// Request
{
  "action": "irr",
  "cashFlows": [-1000000, 150000, 160000, 170000, 180000, 190000],
  "tokenType": "carbon_credits"
}

// Response
{
  "success": true,
  "data": {
    "irr": 0.0812,
    "annualisedReturn": "8.12%"
  }
}
```

**Example -- Monte Carlo:**
```json
// Request
{
  "action": "monte_carlo",
  "investmentAmount": 5000000,
  "tokenType": "dual_portfolio",
  "timeHorizon": 10,
  "iterations": 1000
}

// Response
{
  "success": true,
  "data": {
    "mean": 0.1234,
    "median": 0.1189,
    "percentile5": 0.0456,
    "percentile95": 0.2012,
    "standardDeviation": 0.0523,
    "probabilityOfLoss": 0.08
  }
}
```

---

### 3.3 Compliance API

**Endpoint:** `GET /api/compliance?action=<action>`

Regulatory compliance reporting and assessment.

**GET Actions:**

| Action | Description |
|--------|-------------|
| `status` | Overall compliance status assessment |
| `alerts` | Current compliance alerts and warnings |
| `regulatory_framework` | Australian regulatory framework summary |
| `digital_assets_framework` | Digital Assets Framework Bill 2025 compliance |

**Endpoint:** `POST /api/compliance`

**POST Actions:**

| Action | Description |
|--------|-------------|
| `investor_classification` | Validate investor classification |
| `afsl_check` | AFSL compliance assessment |
| `aml_validation` | AML/CTF requirements validation |
| `compliance_report` | Generate compliance report |
| `detailed_report` | Generate detailed institutional report |
| `tax_treatment` | Optimal tax treatment analysis |
| `environmental` | Environmental compliance assessment |
| `tokenization_standards` | Token standard verification |

**Example -- Compliance Status:**
```
GET /api/compliance?action=status
X-WREI-API-Key: your_key

// Response
{
  "success": true,
  "data": {
    "overall": "compliant",
    "lastAssessment": "2026-03-25T00:00:00Z",
    "jurisdiction": "Australia",
    "complianceScore": 92,
    "criticalIssues": [],
    "recommendations": ["Schedule quarterly AFSL audit"]
  }
}
```

---

### 3.4 Market Data API

**Endpoint:** `GET /api/market-data?action=<action>`

Real-time market data feeds and intelligence.

**Actions:**

| Action | Description |
|--------|-------------|
| `carbon_pricing` | Current carbon credit pricing data |
| `carbon_analytics` | Carbon market analytics and trends |
| `rwa_market` | RWA (Real World Asset) market data |
| `rwa_analytics` | RWA market analytics |
| `market_sentiment` | Market sentiment indicators |
| `competitive_analysis` | Competitive landscape analysis |
| `carbon_projections` | Carbon market projections |
| `historical` | Historical pricing data (requires `feedType` and `timeRange` params) |
| `feed_status` | Data feed connection status |

**Example -- Carbon Pricing:**
```
GET /api/market-data?action=carbon_pricing
X-WREI-API-Key: your_key

// Response
{
  "success": true,
  "data": {
    "spot": {
      "vcm_spot_reference": 8.45,
      "forward_removal_reference": 185,
      "dmrv_premium_benchmark": 1.78
    },
    "indices": {
      "base_carbon_price": 15.20,
      "wrei_premium_multiplier": 1.85,
      "anchor_price": 28.12
    },
    "volatility": {
      "daily_change_percent": -0.23
    }
  }
}
```

---

### 3.5 Token Metadata API

**Endpoint:** `GET /api/metadata?action=<action>`

Token metadata queries and lifecycle tracking.

**Actions:**

| Action | Parameters | Description |
|--------|-----------|-------------|
| `query` | `tokenType`, `vesselId`, `minQualityScore`, `verificationStatus`, `fromDate`, `toDate` | Query tokens with filters |
| `statistics` | -- | Aggregate metadata statistics |
| `retrieve` | `tokenId` (required) | Retrieve specific token metadata |
| `tokens` | -- | List all token IDs |

**Example -- Query Tokens:**
```
GET /api/metadata?action=query&tokenType=carbon_credits&minQualityScore=0.8
X-WREI-API-Key: your_key
```

---

### 3.6 Performance API

**Endpoint:** `GET /api/performance?action=<action>`

Real-time performance monitoring.

**GET Actions:**

| Action | Description |
|--------|-------------|
| `snapshot` | Current performance snapshot (default) |
| `benchmarks` | Performance benchmark data |
| `health` | System health report |

**Endpoint:** `POST /api/performance`

**POST Actions:**

| Action | Description |
|--------|-------------|
| `run_tests` | Execute performance tests |

**Example -- Performance Snapshot:**
```
GET /api/performance?action=snapshot
X-WREI-API-Key: your_key

// Response
{
  "success": true,
  "data": {
    "timestamp": "2026-03-25T10:30:00.000Z",
    "systemLoad": {
      "apiCalls": 45,
      "activeCalculations": 3,
      "memoryUsage": 128,
      "responseTimeP95": 342
    },
    "businessMetrics": {
      "negotiationsSessions": 12,
      "analyticsCalculations": 156,
      "complianceChecks": 34,
      "marketDataRequests": 89
    },
    "performanceThresholds": {
      "apiResponseTime": { "target": 500, "current": 234, "status": "healthy" },
      "calculationTime": { "target": 100, "current": 45, "status": "healthy" },
      "throughput": { "target": 100, "current": 120, "status": "healthy" }
    }
  }
}
```

---

## 4. Stage 2 AI-Enhanced API Endpoints

### 4.1 Intelligent Analytics API

**Endpoint:** `POST /api/analytics/predict`

AI-powered predictive analytics engine with machine learning insights.

**Request Body:**
```json
{
  "action": "market_forecast",
  "parameters": {
    "timeframe": "30d",
    "dataPoints": ["price", "volume", "sentiment"],
    "confidenceThreshold": 0.85
  },
  "marketContext": {
    "currentPrice": 47.80,
    "volatility": 0.23,
    "marketConditions": "bullish"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "forecast": {
      "predictedPrice": 52.15,
      "confidence": 0.87,
      "timeframe": "30d",
      "riskFactors": ["regulatory_changes", "market_volatility"],
      "supportingMetrics": {
        "momentum": 0.74,
        "sentiment": "positive",
        "technicalIndicators": ["bullish_crossover", "volume_spike"]
      }
    },
    "aiInsights": "Market conditions suggest continued upward momentum with strong institutional demand..."
  }
}
```

---

### 4.2 Dynamic Scenario Generation API

**Endpoint:** `POST /api/scenarios/generate`

AI-powered scenario generation for market simulations and stress testing.

**Request Body:**
```json
{
  "scenarioType": "market_stress_test",
  "parameters": {
    "stressLevel": "severe",
    "duration": "90d",
    "affectedMarkets": ["carbon", "energy", "commodities"]
  },
  "constraints": {
    "minPrice": 25.00,
    "maxVolatility": 0.50,
    "regulatoryFramework": "australian"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scenario": {
      "id": "scenario_1711353000000_a1b2c3",
      "name": "Severe Market Stress Test - Q2 2026",
      "description": "Simulating extreme market conditions with regulatory uncertainty...",
      "parameters": {
        "priceShock": -35,
        "volatilitySpike": 0.45,
        "durationDays": 90,
        "recoveryTimeline": "12-18 months"
      },
      "expectedOutcomes": {
        "priceImpact": "Significant downward pressure on carbon credit pricing",
        "liquidityImpact": "Reduced market liquidity with wider bid-ask spreads",
        "complianceImpact": "Heightened regulatory scrutiny and reporting requirements"
      }
    },
    "aiRecommendations": [
      "Increase cash reserves by 20-25%",
      "Diversify into more stable asset classes",
      "Review risk management protocols"
    ]
  }
}
```

---

### 4.3 Adaptive Presentation API

**Endpoint:** `POST /api/presentation/adapt`

AI-driven content adaptation for audience-specific presentations.

**Request Body:**
```json
{
  "audience": "executive",
  "content": {
    "type": "market_analysis",
    "data": {
      "metrics": ["roi", "risk_assessment", "market_position"],
      "timeframe": "quarterly",
      "detailLevel": "high_level"
    }
  },
  "presentationContext": {
    "format": "board_presentation",
    "duration": 15,
    "interactivityLevel": "medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "adaptedContent": {
      "title": "Q2 2026 Carbon Trading Performance - Executive Summary",
      "sections": [
        {
          "title": "Key Performance Indicators",
          "content": "Portfolio generated 18.3% ROI with controlled risk exposure...",
          "visualizations": ["executive_dashboard", "roi_trend_chart"],
          "talkingPoints": [
            "Strong outperformance vs benchmark",
            "Risk metrics within acceptable parameters"
          ]
        }
      ],
      "recommendations": [
        "Continue current strategy with minor portfolio rebalancing",
        "Consider increasing allocation to verified credits by 10%"
      ]
    },
    "aiOptimizations": {
      "contentAdjustments": "Simplified technical jargon for executive audience",
      "visualDesign": "Emphasised high-level metrics with clear ROI focus",
      "narrativeFlow": "Structured for 15-minute executive attention span"
    }
  }
}
```

---

## 5. Error Codes

| Code | Name | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid action, missing required parameters, or validation failure |
| 401 | Unauthorized | Missing or invalid API key |
| 404 | Not Found | Resource not found (e.g., token metadata) |
| 429 | Rate Limited | Exceeded rate limit (100 req/min) |
| 500 | Internal Error | Server-side processing error |

---

## 5. SDK Integration Patterns

### JavaScript/TypeScript

```typescript
const WREI_API_BASE = 'https://wrei-trading-platform.vercel.app/api';
const API_KEY = 'your_api_key';

// Analytics calculation
const response = await fetch(`${WREI_API_BASE}/analytics`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-WREI-API-Key': API_KEY,
  },
  body: JSON.stringify({
    action: 'irr',
    cashFlows: [-1000000, 150000, 160000, 170000, 180000, 190000],
    tokenType: 'carbon_credits',
  }),
});

const result = await response.json();
console.log(`IRR: ${(result.data.irr * 100).toFixed(2)}%`);
```

### Python

```python
import requests

WREI_API_BASE = 'https://wrei-trading-platform.vercel.app/api'
headers = {
    'Content-Type': 'application/json',
    'X-WREI-API-Key': 'your_api_key'
}

# Market data query
response = requests.get(
    f'{WREI_API_BASE}/market-data',
    params={'action': 'carbon_pricing'},
    headers=headers
)

data = response.json()
print(f"VCM Spot: ${data['data']['spot']['vcm_spot_reference']}")
```

### cURL

```bash
# Compliance check
curl -s \
  -H "X-WREI-API-Key: your_api_key" \
  "https://wrei-trading-platform.vercel.app/api/compliance?action=status" \
  | python -m json.tool
```
