# WREI Trading Platform REST API v1 -- Quick Start Guide

> Developer onboarding guide for the Northmore Gordon development team.
> Base URL: `https://wrei-trading-platform.vercel.app`

---

## 1. Authentication

Every request to the WREI API must include an API key in the `X-API-Key` header. Keys are 64-character hex strings prefixed with `wrei_`.

```
X-API-Key: wrei_your_key_here
```

Contact the platform administrator to obtain a key for your environment. Keys are scoped per team and can be revoked at any time.

**Example header on every request:**

```bash
curl -H "X-API-Key: wrei_abc123...def456" \
  https://wrei-trading-platform.vercel.app/api/v1/market/instruments
```

If the key is missing or invalid, the API returns:

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Missing or invalid API key."
  }
}
```

---

## 2. Quick Start -- Your First API Call

Verify your key works by fetching the list of tradeable instruments:

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/market/instruments \
  | python3 -m json.tool
```

A successful response looks like:

```json
{
  "data": [
    { "id": "ESC", "name": "Energy Savings Certificate", "currency": "AUD" },
    { "id": "VEEC", "name": "Victorian Energy Efficiency Certificate", "currency": "AUD" },
    { "id": "PRC", "name": "Peak Reduction Certificate", "currency": "AUD" },
    { "id": "ACCU", "name": "Australian Carbon Credit Unit", "currency": "AUD" },
    { "id": "LGC", "name": "Large-scale Generation Certificate", "currency": "AUD" },
    { "id": "STC", "name": "Small-scale Technology Certificate", "currency": "AUD" },
    { "id": "WREI_CC", "name": "WREI Carbon Credit", "currency": "AUD" },
    { "id": "WREI_ACO", "name": "WREI Australian Carbon Offset", "currency": "AUD" }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 8,
    "pages": 1
  }
}
```

If you see the `data` array, your key is working and you are ready to integrate.

---

## 3. Market Data

### 3.1 Current Prices

Fetch the latest prices for all instruments, or filter by a single instrument.

```bash
# All instruments
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/market/prices

# Single instrument
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/market/prices?instrument=ESC"
```

### 3.2 Price History

Retrieve historical prices for a given instrument over a specified number of days.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/market/prices/history?instrument=ESC&days=30"
```

### 3.3 Order Book

View the simulated order book for an instrument. This shows current bid/ask depth.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/market/orderbook?instrument=ESC"
```

### 3.4 Instruments

List all tradeable instruments and their metadata (shown in the Quick Start above).

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/market/instruments
```

---

## 4. Client Management

### 4.1 List Clients

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/clients
```

### 4.2 Create a Client

Supported `entity_type` values: `acp`, `obligated_entity`, `government`, `corporate`, `institutional`.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Northmore Gordon Pty Ltd",
    "entity_type": "corporate",
    "contact_email": "trading@northmoregordon.com",
    "abn": "12345678901",
    "ess_participant_id": "ESS-NG-001",
    "annual_esc_target": 50000
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/clients
```

### 4.3 Get Client Detail

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/clients/client_abc123
```

### 4.4 Update a Client

```bash
curl -s -X PUT \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "annual_esc_target": 75000
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/clients/client_abc123
```

### 4.5 Client Holdings

Returns the client's current instrument holdings with a portfolio summary.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/clients/client_abc123/holdings
```

### 4.6 Client Compliance Status

Check a client's surrender obligations and compliance position for a given year.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/clients/client_abc123/compliance?year=2026"
```

### 4.7 All-Clients Compliance Summary

Aggregate compliance view across every client on the platform.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/clients/compliance/summary
```

---

## 5. Trading

### 5.1 List Trades

Paginated list with optional status filter. Supported statuses include `pending`, `confirmed`, `settled`, and `cancelled`.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/trades?page=1&limit=20&status=pending"
```

### 5.2 Create a Trade

Place a new trade order. Direction is `buy` or `sell`.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "instrument_id": "ESC",
    "direction": "buy",
    "quantity": 10000,
    "price_per_unit": 38.50,
    "currency": "AUD"
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/trades
```

### 5.3 Trade Detail

Retrieve a single trade including its settlement information.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/trades/trade_xyz789
```

### 5.4 Initiate AI Negotiation

Start a new AI-mediated negotiation session. The `persona_type` determines the buyer persona the AI negotiation agent adopts. Options: `corporate_compliance`, `esg_fund`, `carbon_trading_desk`, `sustainability_director`, `government_procurement`.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "instrument": "ESC",
    "persona_type": "corporate_compliance",
    "quantity": 5000
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/trades/negotiate
```

### 5.5 Get Negotiation Status

Retrieve the current status, transcript, and pricing details of an ongoing or completed negotiation.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/trades/negotiate/neg_abc123
```

### 5.6 Send Negotiation Message

Continue an active negotiation by sending a message.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "We can agree to $140/t if you include dMRV verification reports."
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/trades/negotiate/neg_abc123
```

---

## 6. Correspondence

### 6.1 List Correspondence

Filter by `type` (e.g. `rfq`, `confirmation`, `report`) and `status` (e.g. `drafted`, `sent`, `received`).

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/correspondence?type=rfq&status=drafted"
```

### 6.2 Process Inbound Email

Submit an inbound email for AI parsing. The platform extracts intent, counterparty, and any pricing signals.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "RE: ESC Pricing Enquiry Q3",
    "counterpartyEmail": "procurement@example.com.au",
    "body": "Hi, we are interested in purchasing 20,000 ESCs for Q3 surrender. Can you provide indicative pricing?"
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/inbound
```

### 6.3 Procurement Recommendations

Retrieve AI-generated procurement recommendations based on current market conditions and client targets.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/procurement
```

### 6.4 Generate RFQ Drafts

Trigger the generation of Request for Quote drafts based on procurement recommendations.

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/procurement/generate-rfqs
```

### 6.5 Reports

List and generate client reports.

```bash
# List reports for a client
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/correspondence/reports?clientId=client_abc123"

# Generate a new report
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client_abc123",
    "period": "2026-Q1"
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/reports
```

### 6.6 Settlement Status

View the current status of all pending settlements.

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/settlement
```

### 6.7 Negotiation Threads

Browse and manage correspondence threads tied to active negotiations.

```bash
# List all threads
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/threads

# Get thread detail
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/threads/thread_001

# Broker action on a thread (approve, edit, or reject)
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve"
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/correspondence/threads/thread_001
```

---

## 7. Webhooks

Webhooks allow your systems to receive real-time notifications when events occur on the platform.

### 7.1 Available Events

| Event                        | Description                                  |
|------------------------------|----------------------------------------------|
| `trade.created`              | A new trade has been placed                  |
| `trade.settled`              | A trade has reached final settlement         |
| `negotiation.completed`      | An AI negotiation session has concluded      |
| `correspondence.received`    | Inbound correspondence has been processed    |
| `price.alert`               | A price threshold has been triggered         |
| `compliance.deadline`        | A compliance deadline is approaching         |

### 7.2 Register a Webhook

```bash
curl -s -X POST \
  -H "X-API-Key: wrei_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-service.northmoregordon.com/webhooks/wrei",
    "events": ["trade.created", "trade.settled", "compliance.deadline"]
  }' \
  https://wrei-trading-platform.vercel.app/api/v1/webhooks
```

### 7.3 List Registered Webhooks

```bash
curl -s \
  -H "X-API-Key: wrei_your_key_here" \
  https://wrei-trading-platform.vercel.app/api/v1/webhooks
```

### 7.4 Deregister a Webhook

```bash
curl -s -X DELETE \
  -H "X-API-Key: wrei_your_key_here" \
  "https://wrei-trading-platform.vercel.app/api/v1/webhooks?id=whk_abc123"
```

### 7.5 Verifying Webhook Signatures

Every webhook delivery includes an `X-WREI-Signature` header containing an HMAC-SHA256 signature of the request body. Verify this against your webhook secret to ensure the payload is authentic.

**Example payload delivered to your endpoint:**

```json
{
  "event": "trade.created",
  "data": {
    "trade_id": "trade_xyz789",
    "instrument_id": "ESC",
    "direction": "buy",
    "quantity": 10000,
    "price_per_unit": 38.50,
    "currency": "AUD"
  },
  "timestamp": "2026-04-05T09:30:00.000Z"
}
```

**Delivery behaviour:** Failed deliveries are retried up to 3 times with exponential backoff.

---

## 8. Error Handling

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Field 'quantity' must be a positive integer."
  }
}
```

### Error Codes Reference

| HTTP Status | Code                | When it occurs                                          |
|-------------|---------------------|---------------------------------------------------------|
| 401         | `unauthorized`      | Missing or invalid API key                              |
| 403         | `forbidden`         | Key does not have permission for this resource          |
| 404         | `not_found`         | The requested resource does not exist                   |
| 422         | `validation_error`  | Request body or query parameters failed validation      |
| 429         | `rate_limited`      | Too many requests -- wait for the window to reset       |
| 500         | `internal_error`    | Unexpected server error -- contact platform support     |

### Recommended Practices

- Always check the HTTP status code before parsing the response body.
- On a `429` response, back off for 60 seconds before retrying.
- Log the full error object (code + message) for debugging.
- On `500` errors, retry once with exponential backoff. If the error persists, escalate to the platform team.

---

## 9. Rate Limits

| Operation Type           | Limit          | Window   |
|--------------------------|----------------|----------|
| Read (GET)               | 100 req/min    | 60s      |
| Write (POST/PUT/DELETE)  | 30 req/min     | 60s      |

When you exceed a limit, the API returns HTTP 429:

```json
{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

The window resets 60 seconds after the first request in the current window. Design your integration to stay well within these limits. If you anticipate higher throughput requirements, contact the platform team to discuss elevated rate tiers.

---

## Appendix: Instrument Codes

| Code       | Description                              |
|------------|------------------------------------------|
| `ESC`      | Energy Savings Certificate (NSW)         |
| `VEEC`     | Victorian Energy Efficiency Certificate  |
| `PRC`      | Peak Reduction Certificate (NSW)         |
| `ACCU`     | Australian Carbon Credit Unit            |
| `LGC`      | Large-scale Generation Certificate       |
| `STC`      | Small-scale Technology Certificate       |
| `WREI_CC`  | WREI Carbon Credit                       |
| `WREI_ACO` | WREI Australian Carbon Offset            |

---

*WREI Trading Platform v1 -- Northmore Gordon Internal Use*
