# Forecasting Model Regression Report
## Date: 2026-04-08T22:45:35.726009
## Model Version: 2.0.0

### Warning: SYNTHETIC DATA NOTICE
All training, validation, and backtesting data in this report is interpolated from monthly/annual sources. No genuine weekly market observations were available. Metrics reflect model structure quality relative to baseline — NOT predictive accuracy against real market data. Genuine validation will be possible once live scrapers have accumulated 12+ weeks of weekly observations.

### 1. Baseline vs Improved Model Comparison

| Metric | Baseline (v1.0) | Improved (v2.0) | Change |
|--------|-----------------|-----------------|--------|
| MAPE (4w, synthetic) | 5.85% | 5.85% | +0.00% |
| Directional Accuracy | 52.4% | 52.4% | +0.00% |
| Cumulative Decision Value | A$1,054,500 | A$1,054,500 | +0 |
| Sharpe Ratio | 2.17 | 2.17 | +0.00 |
| Max Drawdown | A$1,632,000 | A$1,632,000 | +0 |

### 2. Penalty Rate Correction Impact
Forecasts compared using corrected IPART rates vs flat $29.48 at 5 sample dates.
Corrected penalty rates range from $28.56 (2019) to $35.86 (2026). The OU reflecting boundary
is directly affected by the penalty ceiling, particularly in tightening regimes.

### 3. Feature Independence Analysis
- FEATURES_FULL: 37 features (includes kalman_forecast_4w, kalman_forecast_12w)
- FEATURES_INDEPENDENT: 35 features (excludes Kalman — avoids circular dependency)
- Signal features: 11 (added in P2-D)

### 4. Regime Detection Improvement
The responsive HMM (self-transition ~0.85) detects regime changes faster than the
conservative HMM (self-transition ~0.92). Reduced detection lag: ~1-2 weeks vs ~2-4 weeks.

### 5. Volume Forecast Accuracy
| Metric | Value |
|--------|-------|
| Week 1 creation forecast | 106,998 |
| Week 1 surrender forecast | 103,877 |
| Week 1 net flow | 3,121 |
| Activity types modelled | 5 |
| CL phase-out modelled | Yes (31 Dec 2026) |

### 6. Forward Curve Quality
| Point | Price | 80% CI | 95% CI |
|-------|-------|--------|--------|
| Week 1 | A$23.97 | [22.73, 25.20] | [22.08, 25.85] |
| Week 4 | A$23.86 | [21.66, 26.07] | [20.49, 27.23] |
| Week 12 | A$23.69 | [20.73, 26.65] | [19.16, 28.22] |
| Week 26 | A$23.56 | [20.38, 26.74] | [18.70, 28.42] |

### 7. Signal Pipeline Integration
- Signal schema: 9 fields validated
- Ingestion pipeline: SQLite initialisation verified
- Content hashing: case/whitespace normalisation confirmed
- 5 synthetic documents: ingested successfully
- Signal features in XGBoost: 11 features integrated

### 8. End-to-End Pipeline
- Pipeline completion: PASS (csv-only mode)
- Forecast output: all required fields present
- CI bands: respect penalty ceiling cap
- Anomaly detector: operational
- Module imports: all clean

### 9. Regression Verdict
**PASS**: Improved model does not degrade directional accuracy or decision value on synthetic data.

**Warnings:**
- MAPE change: +0.00% (warn if > +0.5pp)
- All metrics are on synthetic data — genuine validation pending live scraper data
