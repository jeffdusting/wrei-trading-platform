# ACCU Model Validation Report

## Date: 2026-04-08
## Status: INSUFFICIENT DATA

## Data Availability

| Source | Observations | Status |
|--------|-------------|--------|
| Ecovantage (weekly update) | 1 | ACCU $36.30 on 2026-04-03 |
| CER quarterly reports | 0 | Reports scraped but no ACCU price in HTML |
| ANREU registry | 0 | Not yet integrated |

**Total genuine ACCU observations: 1**
**Threshold for model training: 20**

## What Is Needed

To train and validate an ACCU-specific model, the following data is required:

1. **Weekly ACCU spot prices** — minimum 20 observations, ideally 52+ (one year)
   - Source: CER secondary market data, CORE Markets, or broker feeds
   - Current blocker: CER quarterly reports are HTML summaries without machine-readable ACCU price tables

2. **ACCU issuance volumes** — weekly or monthly from CER/ANREU registry
   - Source: CER Clean Energy Regulator ANREU data
   - Needed for: creation velocity features, supply/demand modelling

3. **Safeguard Mechanism compliance data** — demand-side driver
   - Source: CER Safeguard facility data
   - Needed for: demand pressure features, regime classification

## Recommended Data Collection Approach

1. **Headless browser scraping** of CER quarterly reports for ACCU price tables
2. **ANREU API integration** for issuance and surrender volumes
3. **Broker data feeds** (e.g., CORE Markets, Jarden) for daily ACCU spot prices
4. **Wayback Machine** for historical CER report pages

## Preliminary ACCU Configuration

The ACCU instrument config has been registered with the following parameters
(to be recalibrated when sufficient data is available):

- **Regime parameters:**
  - Surplus: theta=0.02, mu=28.0, sigma=2.0
  - Balanced: theta=0.05, mu=35.0, sigma=2.5
  - Tightening: theta=0.10, mu=45.0, sigma=3.5
- **Price reference:** CCM price $79.20 (Carbon Credit Mechanism)
- **No penalty ceiling** — soft upper bound at $80.00 (historical 99th percentile)
- **Settlement:** ANREU registry

## Current Genuine Observation

The single observation (ACCU $36.30, 2026-04-03) from Ecovantage is consistent
with the balanced regime mu ($35.00), providing weak validation of the initial
parameter estimates.

## Next Steps

- Accumulate weekly ACCU price observations via Ecovantage scraper
- Implement CER headless scraping for historical ACCU prices
- Once 20+ observations available, run full ACCU model training and backtesting
