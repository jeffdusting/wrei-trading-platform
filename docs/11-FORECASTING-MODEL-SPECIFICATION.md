# WREI Trading Platform -- ESC Forecasting Model Specification

**Document Version:** 1.0
**Date:** 2026-04-06
**Classification:** Internal -- Technical Reference
**Model Version:** 1.0.0
**Instrument Coverage:** ESC (primary), VEEC (planned)

---

## 1. Purpose

This document specifies the ESC (Energy Savings Certificate) price forecasting system used by the WREI Trading Platform. The system produces weekly price forecasts at horizons of 1 to 26 weeks with calibrated confidence intervals, subject to the penalty rate ceiling constraint. Forecasts drive procurement timing recommendations, client intelligence reports, and trade decision analysis.

---

## 2. System Architecture

```
                ┌──────────────────────┐
                │    Data Scrapers     │
                │ Ecovantage, NMG,     │
                │ IPART, TESSA         │
                └──────────┬───────────┘
                           │
                ┌──────────▼───────────┐
                │   Data Assembly      │
                │ (2019-2025 weekly)   │
                └──────────┬───────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
   │  Bayesian   │  │  Bounded   │  │    ML       │
   │  State-     │  │  Ornstein- │  │  Counter-   │
   │  Space      │  │  Uhlenbeck │  │  factual    │
   │  (Kalman)   │  │  (Monte    │  │  (XGBoost)  │
   │             │  │   Carlo)   │  │             │
   └──────┬──────┘  └─────┬──────┘  └──────┬──────┘
          │               │                │
          └───────────────┼────────────────┘
                          │
                ┌─────────▼─────────┐
                │  Ensemble Combiner │
                │  (MAPE-optimised   │
                │   weighted avg)    │
                └─────────┬─────────┘
                          │
                ┌─────────▼─────────┐
                │  Penalty Ceiling  │
                │  Cap (A$29.48)    │
                └─────────┬─────────┘
                          │
               ┌──────────▼──────────┐
               │  Chart Display      │
               │  (26 weekly points, │
               │   CI bands, volume) │
               └─────────────────────┘
```

---

## 3. The Penalty Rate Constraint

**The single most important structural feature of the ESC market is the penalty rate ceiling.**

The IPART penalty rate for ESS non-compliance is A$29.48 per certificate (2026). This creates an absolute price ceiling:

- No rational obligated entity pays more than A$29.48 for an ESC -- they pay the penalty instead
- As the spot price approaches the penalty rate, buying demand drops sharply
- The price distribution is asymmetric: unlimited downside, hard-capped upside
- All forecast models must respect this boundary

**Implementation:**
- The Bounded OU model uses a reflecting boundary: `paths[over, t] = 2 * penalty_rate - paths[over, t]`
- All CI bands (80%, 95%) are capped at A$29.48 in demo data and chart display
- The runtime `cap()` function enforces `PENALTY_CEILINGS[instrument]` on all forecast outputs
- Penalty rate is instrument-specific: ESC A$29.48, VEEC A$120.00

---

## 4. Model 1: Bayesian State-Space (Kalman Filter)

**File:** `forecasting/models/state_space.py`

### Hidden State Vector (4 dimensions)

| State | Description | Scale |
|-------|-------------|-------|
| `true_surplus` | Estimated total supply (registered + shadow) | Millions (SURPLUS_SCALE = 1e6) |
| `creation_momentum` | Smoothed creation rate with 3-month lag | Hundred-thousands/week (CREATION_SCALE = 1e5) |
| `demand_pressure` | (days_to_deadline x uncovered_demand) / 365 | Normalised |
| `regime_indicator` | Continuous regime signal [0, 1] | 0=surplus, 0.5=balanced, 1=tightening |

### Observation Vector (3 dimensions)

| Observation | Source |
|-------------|--------|
| `spot_price` | Ecovantage/NMG scraper |
| `creation_volume` | IPART ESS creation data |
| `price_to_penalty_ratio` | spot_price / penalty_rate |

### State Transition Matrix (F)

```
F = [ 0.998   0.01  -0.002   0.0  ]    surplus: slow decay, slight creation inflow, demand drain
    [ 0.0     0.95   0.0     0.0  ]    creation: mean-reversion
    [ 0.0     0.0    0.97    0.02 ]    demand: persistent, regime-influenced
    [ 0.0     0.0    0.0     0.99 ]    regime: sticky (slow transitions)
```

### Observation Matrix (H)

```
H = [ -2.0   0.0    3.0    4.0 ]    price: negative surplus, positive demand + regime
    [  0.0   1.0    0.0    0.0 ]    creation: direct observation of momentum
    [  0.0   0.0    0.2    0.5 ]    price-to-penalty: demand + regime driven
```

### Noise Covariances

| Matrix | Values | Purpose |
|--------|--------|---------|
| Q (process) | diag([0.01, 0.005, 0.02, 0.005]) | State uncertainty |
| R (measurement) | diag([2.0, 0.1, 0.01]) | Observation noise |
| P (initial) | diag([1.0, 0.5, 0.5, 0.2]) | Initial state uncertainty |

### Regime Classification (HMM)

**Transition Matrix:**
```
         → surplus  balanced  tightening
surplus    0.92     0.07      0.01
balanced   0.05     0.90      0.05
tightening 0.01     0.07      0.92
```

**Thresholds:**
- `regime_indicator < 0.33` → surplus
- `regime_indicator > 0.67` → tightening
- Otherwise → balanced

### Shadow Market Estimate
- Registered fraction: 0.92 (92% of true surplus visible in TESSA)
- Shadow supply: `true_surplus * (1 - 0.92) = 8% hidden`
- Confidence: `+/- 1.96 * std(surplus) * 0.08`

---

## 5. Model 2: Bounded Ornstein-Uhlenbeck (Monte Carlo)

**File:** `forecasting/models/ou_bounded.py`

### Dynamics

```
dP(t) = theta * (mu_regime - P(t)) dt + sigma * dW(t)
subject to P(t) <= penalty_rate (reflecting boundary)
```

### Regime Parameters

| Regime | theta (mean-reversion speed) | mu (long-run mean) | sigma (volatility) |
|--------|------|------|-------|
| surplus | 0.03 /week | A$18.00 | A$0.80 /sqrt-week |
| balanced | 0.08 /week | A$23.50 | A$1.00 /sqrt-week |
| tightening | 0.15 /week | A$27.00 | A$1.40 /sqrt-week |

**Interpretation:**
- **Surplus:** Slow reversion to a low mean (A$18). The market is oversupplied; prices drift lower.
- **Balanced:** Moderate reversion to current fair value (A$23.50). Normal market conditions.
- **Tightening:** Fast reversion to near-ceiling (A$27). Supply constraints push prices up, but the penalty rate caps the upside.

### Reflecting Boundary

When a simulated path exceeds the penalty rate:
```python
paths[over, t] = 2 * penalty_rate - paths[over, t]
```
This reflects the price back below the ceiling, modelling the economic reality that demand drops when price approaches the penalty.

### Monte Carlo Simulation
- Default: 5,000 paths per forecast
- Time step: 1 week
- CI extraction: 80% from 10th/90th percentiles, 95% from 2.5th/97.5th percentiles

### Parameter Estimation
- Maximum Likelihood Estimation (MLE) via L-BFGS-B optimiser
- Bounds: theta in [1e-4, 2.0], mu in [1.0, 50.0], sigma in [1e-4, 10.0]
- Applied to discretised OU log-likelihood

### Mu Adjustment from State-Space
The Kalman filter's surplus estimate adjusts the OU long-run mean:
```python
surplus_millions = state.true_surplus / 1e6
mu_adjustment = -0.5 * max(0, surplus_millions - 7.0)
adjusted_mu = max(params.mu + mu_adjustment, 10.0)
```
Higher surplus pushes the target price down.

---

## 6. Model 3: ML Counterfactual (XGBoost)

**File:** `forecasting/models/counterfactual_model.py`

### Feature Set (36 features)

| Category | Features |
|----------|----------|
| Price | `spot_price` |
| Supply velocity | `creation_velocity_4w`, `creation_velocity_12w`, `creation_velocity_trend` |
| Supply stock | `cumulative_surplus`, `surplus_runway_years`, `estimated_shadow_supply` |
| Demand | `days_to_surrender`, `penalty_rate`, `price_to_penalty_ratio` |
| Activity mix | `activity_cl_pct`, `activity_heer_pct`, `activity_iheab_pct`, `activity_piamv_pct` |
| Policy | `policy_signal_active`, `policy_supply_impact_pct`, `policy_demand_impact_pct` |
| Sentiment | `broker_sentiment`, `supply_concern_level` |
| Trend indicators | `creation_trend_accelerating`, `creation_trend_decelerating` |
| Regime (from Kalman) | `regime_surplus_prob`, `regime_balanced_prob`, `regime_tightening_prob` |
| Kalman forecasts | `kalman_forecast_4w`, `kalman_forecast_12w` |

### Targets

| Target | Type | Description |
|--------|------|-------------|
| `price_t_plus_4w` | Regression | Price 4 weeks ahead |
| `optimal_action` | Classification | buy / hold / sell |
| `optimal_value_per_cert` | Regression | Dollar value of following the model's recommendation |

### XGBoost Configuration

| Parameter | Value |
|-----------|-------|
| n_estimators | 200 |
| max_depth | 5 |
| learning_rate | 0.05 |
| subsample | 0.8 |
| colsample_bytree | 0.8 |
| min_child_weight | 3 |
| reg_alpha | 0.1 |
| reg_lambda | 1.0 |

### Cross-Validation
TimeSeriesSplit with `n_splits = min(5, max(2, len(y_train) // 20))`

---

## 7. Ensemble Combination

**File:** `forecasting/models/ensemble_forecast.py`

### Method
Weighted average of Bayesian (OU) and ML (XGBoost) forecasts, with weights optimised by grid search to minimise MAPE on walk-forward validation windows.

### Formula
```
ensemble_price = w_bayesian * bayesian_forecast + (1 - w_bayesian) * ml_forecast
```

### Weight Optimisation
- Grid search: w_bayesian in [0, 1] with step 1/21
- Objective: minimise MAPE on validation set
- Walk-forward windows: 52 weeks, retraining every 12 weeks

### CI Adjustment
When the two models disagree, the confidence interval widens:
```
ci_expansion = 1 + 0.1 * min(|bayesian - ml| / max_price, 1.0)
```

### Output

| Field | Type | Description |
|-------|------|-------------|
| `price_forecast_4w` | float | Ensemble 4-week price |
| `price_forecast_12w` | float | Ensemble 12-week price |
| `confidence_interval_80` | (float, float) | 80% CI bounds |
| `confidence_interval_95` | (float, float) | 95% CI bounds |
| `recommended_action` | string | BUY / HOLD / SELL |
| `action_confidence` | float | 0-1 confidence |
| `estimated_value_per_cert` | float | Expected benefit of following recommendation |
| `bayesian_weight` | float | Weight assigned to Bayesian model |
| `ml_weight` | float | Weight assigned to ML model |

---

## 8. Training Data

**File:** `forecasting/data_assembly.py`

### Time Range
2019-2025 (7 years), distributed to weekly frequency via seasonal adjustment.

### Sources
- IPART annual reports (2019-2021): creation totals, surrender targets, penalty rates
- AFMA/CORE market data (2019-2021): spot prices (annual/quarterly)
- Ecovantage/NMG published data (2022-2025): weekly spot prices, creation volumes

### Key Historical Parameters

| Year | Creation (M) | Demand (M) | Surplus (M) | Penalty Rate |
|------|-------------|-----------|------------|-------------|
| 2019 | 4.8 | 4.6 | 4.3 | $28.52 |
| 2020 | 5.2 | 4.9 | 4.6 | $29.12 |
| 2021 | 5.8 | 5.2 | 5.2 | $29.56 |
| 2022 | 6.5 | 5.5 | 6.2 | $31.66 |
| 2023 | 7.2 | 5.8 | 7.6 | $33.76 |
| 2024 | 6.8 | 6.1 | 8.3 | $35.05 |
| 2025 | 6.4 | 6.4 | 8.3 | $36.20 |

### Activity Mix Trend
Commercial lighting has declined from 55% (2019) to 25% (2025) of ESC creation. HEER and IHEAB have grown to compensate. The commercial lighting phase-out (completing 2026-12-31) removes ~22% of annual creation volume -- a key structural driver of tightening supply.

### Seasonal Patterns
- Creation peaks Q2-Q3 (weeks 14-39): residential HVAC upgrade season
- Procurement peaks Q4 (weeks 40-52): compliance deadline preparation
- Surrender deadlines: June 30 and December 31

---

## 9. Data Ingestion Pipeline

### Live Scrapers

| Scraper | Source | Data | Frequency |
|---------|--------|------|-----------|
| `ecovantage_scraper.py` | Ecovantage website | Spot prices (6 instruments), creation volumes, activity breakdown | Daily |
| `northmore_scraper.py` | Northmore Gordon website | Spot prices (6 instruments), inventory levels | Daily |
| `ipart_scraper.py` | IPART website | ESS news, rule changes, consultations, compliance notices | Daily |
| `tessa_scraper.py` | TESSA registry | Certificate transfer data | Daily |

### AI Signal Extraction
**File:** `forecasting/signals/ai_signal_extractor.py`

Calls Claude API to extract structured market signals from unstructured text:
- IPART policy documents (consultation papers, rule changes)
- Broker market commentary (Ecovantage, NMG weekly updates)
- Legislative records (NSW parliamentary, DCCEEW publications)

Output: JSON signals with `policy_signal_active`, `supply_impact_pct`, `demand_impact_pct` fields consumed by the XGBoost model.

### Daily Pipeline (`forecasting/generate_forecast.py`)
```
1. Load full Kalman filter state (run_full_filter on historical data)
2. Get latest state estimate
3. Check for fresh data in market_data_daily table
4. Incorporate new observations (update_and_forecast)
5. Store results to forecasts table (or CSV fallback)
```

Triggered by: `GET /api/cron/intelligence` (Vercel cron, daily)

---

## 10. Anomaly Detection

**File:** `forecasting/monitoring/anomaly_detector.py`

| Anomaly | Trigger | Severity |
|---------|---------|----------|
| Creation velocity slowdown | 4-week avg drops >20% below 12-week avg | High |
| Surplus runway tightening | Years-to-exhaustion < 2.0 | High |
| Price-to-penalty ratio | Ratio > 0.85 (approaching ceiling) | Medium |
| Forward curve inversion | Backwardation signal detected | Medium |

When triggered, alerts are stored in the `alert_events` table and displayed in the Alerts tab on `/intelligence`.

---

## 11. Backtesting and Validation

**File:** `forecasting/backtesting/backtest_engine.py`

### Method
Walk-forward validation on 2019-2025 data. At each step: train on all data up to week T, forecast week T+h, compare to actual.

### Metrics

| Metric | Definition | Baseline |
|--------|-----------|----------|
| MAPE | Mean Absolute Percentage Error | ~3.6% at 4-week horizon |
| Directional accuracy | % correct up/down predictions | ~62% (baseline random: 33%) |
| Decision value | Cumulative P&L from buy/hold/sell signals | A$142,680 on 256 historical trades |

### Benchmarks

| Model | 4w MAPE |
|-------|---------|
| Naive (random walk) | ~2.0% |
| SMA-4 | ~2.8% |
| Bayesian (OU) | ~3.8% |
| ML (XGBoost) | ~3.7% |
| Ensemble | ~3.6% |

Note: The naive model has lower MAPE because ESC prices are relatively stable (low volatility market). The ensemble's value is in directional accuracy (62% vs ~50% for naive) and decision value (the dollar improvement from acting on forecasts).

### Signal Thresholds
- BUY/SELL: forecast move > A$0.50 from current spot
- HOLD: forecast move within A$0.25 of current spot
- Trading notional: 50,000 certificates per signal

### Regime-Specific Performance
- **Stable periods** (price moved < $1.00 in 12 weeks): Lower MAPE, lower decision value
- **Transition periods** (price moved > $2.00 in 12 weeks): Higher MAPE, higher decision value
- **Policy event windows** (within 8 weeks of known change): AI signal extraction adds value

---

## 12. Shadow Market Calibration

**File:** `forecasting/calibration/shadow_market.py`

Uses NMG's actual inventory data to estimate hidden market supply:
- TESSA registry shows only registered certificates
- Brokers hold unregistered and committed certificates off-registry
- Shadow multiplier: `total_inventory / visible_inventory` (NMG baseline: ~1.6x)
- NMG market share: ~8.65% of total ESC market
- Whole-market shadow estimate: `NMG_shadow / NMG_market_share`

This calibrates the state-space model's `true_surplus` observation, improving the Kalman filter's supply estimate.

---

## 13. Chart Display

### Price + Volume + Forecast Chart (Recharts ComposedChart)

**Component:** `components/charts/PriceVolumeChart.tsx`

**Data flow:**
```
chart-demo-data.ts → /api/v1/market/chart-data → useCombinedChartData hook → PriceVolumeChart
```

### Visual Elements

| Element | Series | Colour | Style |
|---------|--------|--------|-------|
| Historical price | `price` | #0EA5E9 (sky blue) | Solid, 2px |
| Forecast price | `forecast` | #2563EB (blue) | Dashed 6-3, 2px |
| 80% CI band | `forecastLow80`/`forecastHigh80` | #93C5FD | Filled area, 40% opacity |
| 95% CI band | `forecastLow95`/`forecastHigh95` | #DBEAFE | Filled area, 40% opacity |
| Creation volume | `creationVolume` | #10B981 (green) | Bars, 35% opacity |
| Surrender volume | `surrenderVolume` | #F59E0B (amber) | Bars, 35% opacity |
| Historical forecast 1 | `histForecast1` | #F59E0B (amber) | Dashed 4-2, 1.5px, 80% opacity |
| Historical forecast 2 | `histForecast2` | #F59E0B (amber) | Dashed 4-2, 1.5px, 60% opacity |
| Historical forecast 3 | `histForecast3` | #F59E0B (amber) | Dashed 4-2, 1.5px, 40% opacity |
| NOW reference | — | #64748B | Dashed vertical line |

### Weekly Interpolation
The 4 anchor forecast horizons (1w, 4w, 12w, 26w) are linearly interpolated to 26 weekly data points. Regime probabilities and volume projections are also interpolated between anchors.

### Penalty Ceiling Enforcement
All upper CI values and forecast prices are capped at `PENALTY_CEILINGS[instrument]` before display. The `cap()` function runs at data generation time.

### Volume Forecast
Projected from public annual creation/surrender rates (IPART/CER), adjusted by interpolated regime probability:
```
creation_adj  = 1 - (tightening_prob * 0.15) + (surplus_prob * 0.10)
surrender_adj = 1 + (tightening_prob * 0.10) - (surplus_prob * 0.05)
```

---

## 14. Current Forecast (Demo Data)

### ESC Forecast Anchors (as of April 2026)

| Horizon | Point Forecast | 80% CI | 95% CI | Regime |
|---------|---------------|--------|--------|--------|
| 1 week | A$23.85 | A$23.10 - A$24.60 | A$22.50 - A$25.20 | Balanced (55%) |
| 4 weeks | A$24.30 | A$22.80 - A$25.80 | A$21.90 - A$26.70 | Balanced (55%) |
| 12 weeks | A$25.50 | A$22.00 - A$28.50 | A$20.50 - A$29.48 | Balanced/Tightening |
| 26 weeks | A$26.80 | A$21.00 - A$29.00 | A$18.50 - A$29.48 | Tightening (45%) |

Note: 95% CI upper is capped at the penalty rate A$29.48 for 12w and 26w horizons. The asymmetry reflects the hard ceiling -- the distribution cannot exceed the penalty rate but can extend further below.

### VEEC Forecast Anchors

| Horizon | Point Forecast | 80% CI | 95% CI |
|---------|---------------|--------|--------|
| 1 week | A$84.20 | A$82.50 - A$85.90 | A$81.00 - A$87.40 |
| 4 weeks | A$85.00 | A$80.50 - A$89.50 | A$78.00 - A$92.00 |
| 12 weeks | A$87.50 | A$76.00 - A$99.00 | A$72.00 - A$103.00 |
| 26 weeks | A$91.00 | A$72.00 - A$110.00 | A$66.00 - A$116.00 |

VEEC penalty rate (A$120.00) is well above the forecast range, so the ceiling does not constrain the VEEC forecast.

---

## 15. Known Limitations

1. **Demo data dependency:** The Python models run offline. The TypeScript chart system generates simulated data from public parameters when the DB is unavailable. In production, the daily cron pipeline populates the forecasts table.

2. **ESC-only forecasting:** The Bayesian and ML models are trained exclusively on ESC data. VEEC forecasting is on the roadmap but uses hardcoded demo forecasts for now.

3. **Historical penalty rate inconsistency:** The `data_assembly.py` historical penalty rates (e.g., 2025: A$36.20) were CPI-adjusted estimates that may not match the IPART gazetted values. This affects the `price_to_penalty_ratio` feature in the training data.

4. **No intraday forecasting:** The model operates at weekly frequency. Intraday price movements are outside scope.

5. **Regime detection lag:** The HMM regime transition matrix has high self-transition probabilities (0.90-0.92), meaning regime changes are detected with a 2-4 week lag.

---

## 16. File Reference

| File | Purpose |
|------|---------|
| `forecasting/models/ou_bounded.py` | Bounded OU model with reflecting boundary |
| `forecasting/models/state_space.py` | Bayesian Kalman filter with HMM regime |
| `forecasting/models/counterfactual_model.py` | XGBoost walk-forward model |
| `forecasting/models/ensemble_forecast.py` | Weighted ensemble combiner |
| `forecasting/generate_forecast.py` | Daily forecast pipeline runner |
| `forecasting/data_assembly.py` | Historical dataset assembly |
| `forecasting/backtesting/backtest_engine.py` | Walk-forward validation |
| `forecasting/monitoring/anomaly_detector.py` | Market anomaly detection |
| `forecasting/monitoring/monitor.py` | Continuous market monitoring |
| `forecasting/signals/ai_signal_extractor.py` | NLP signal extraction (Claude) |
| `forecasting/calibration/shadow_market.py` | Shadow supply calibration |
| `forecasting/scrapers/*.py` | Data ingestion scrapers |
| `lib/data-feeds/adapters/chart-demo-data.ts` | Chart data generator with penalty cap |
| `components/charts/PriceVolumeChart.tsx` | Recharts composed chart |
| `components/intelligence/ForecastPanel.tsx` | Forecast detail panel |
| `app/api/v1/intelligence/forecast/route.ts` | Forecast API endpoint |
| `app/api/v1/market/chart-data/route.ts` | Combined chart data API |
