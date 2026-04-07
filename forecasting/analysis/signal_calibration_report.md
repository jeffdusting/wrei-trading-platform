# Signal Extraction Calibration Report

## Date: 2026-04-08
## Validation documents: 25 (17 with actuals, 8 future events)

## Direction Accuracy

- **Accuracy: 70.6%** (12/17)
- Threshold for reliability: 60%
- **Verdict: RELIABLE**

| ID | Event | Expected | Actual | 4w Change | Match |
|-----|-------|----------|--------|-----------|-------|
| VAL-001 | ESS Rule 2009 Amendment No. 8 — Administ | neutral | neutral | +0.23 | YES |
| VAL-002 | COVID-19 ESS flexibility measures | surplus | surplus | -1.16 | YES |
| VAL-003 | Commercial lighting baseline change Phas | tightening | tightening | +0.46 | YES |
| VAL-004 | ESS Rule 2009 Amendment No. 10 — HEER ex | tightening | tightening | +0.46 | YES |
| VAL-005 | Commercial lighting phase-down accelerat | tightening | tightening | +0.73 | YES |
| VAL-006 | IPART statutory review of ESS commenced | neutral | tightening | +0.55 | YES |
| VAL-007 | IPART surplus management consultation pa | surplus | tightening | +0.92 | **NO** |
| VAL-008 | Safeguard Mechanism reforms commenced | tightening | surplus | -0.69 | **NO** |
| VAL-009 | Revised ESC targets — Schedule 5 update | tightening | surplus | -0.96 | **NO** |
| VAL-010 | NABERS integration pilot | neutral | surplus | -0.46 | YES |
| VAL-011 | PEAK demand reduction scheme expansion | tightening | surplus | -0.35 | **NO** |
| VAL-019 | Ecovantage market update — ESC supply ti | tightening | tightening | +0.73 | YES |
| VAL-020 | Ecovantage market update — surplus overh | surplus | surplus | -0.69 | YES |
| VAL-021 | Ecovantage market update — price softeni | surplus | surplus | -0.46 | YES |
| VAL-023 | COVID-19 second wave restrictions — NSW | surplus | neutral | +0.23 | **NO** |
| VAL-024 | ESS target increase — 2023 compliance ye | tightening | tightening | +0.69 | YES |
| VAL-025 | ESS target increase — 2022 compliance ye | tightening | tightening | +0.73 | YES |

## Magnitude Calibration

- Observations: 12
- Median predicted/actual ratio: 0.2447
- Mean predicted/actual ratio: 0.1391
- Predicted-actual correlation: -0.1692
- **Overall scaling factor: 0.2447**

### Interpretation

The signal extractor **overpredicts** market impact by approximately 4.1x. A scaling factor of 0.24 is applied to reduce predicted supply/demand impacts to match observed outcomes.

## Calibration Factors Applied

- `supply_scaling_factor`: 0.2447
- `demand_scaling_factor`: 0.2447
- `direction_reliable`: True

These factors are saved to `forecasting/calibration/signal_calibration.json` and automatically loaded by `ai_signal_extractor.py` when available.

## Limitations

- Validation uses synthetic reconstruction data (interpolated from monthly/annual sources)
- Only 1 genuine weekly observation available (ESC $24.50, 2026-04-03)
- 7 future events (post-April 2025) have no actual outcome data yet
- Signal extraction validation uses domain-expert expected signals, not live API outputs
- Calibration should be re-run as genuine weekly data accumulates

## Data Quality Note

SYNTHETIC DATA WARNING: Price changes used for calibration are derived from interpolated reconstruction data. Calibration factors should be treated as preliminary estimates to be refined with genuine market observations.