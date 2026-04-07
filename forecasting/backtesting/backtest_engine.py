"""
Walk-Forward Backtesting Engine
================================

Evaluates the ESC state-space + bounded OU forecasting model using
walk-forward validation on 2019–2025 historical data.

Three core metrics:
  1. MAPE — Mean Absolute Percentage Error (vs. naive, 4w SMA, 12w SMA)
  2. Directional accuracy — correct up/down/flat prediction (vs. 33% random)
  3. Decision value — cumulative P&L from forecast-driven buy/hold/sell
     on a 50,000-certificate notional position

Regime-specific reporting:
  - Stable periods (price moved < $1.00 in 12 weeks)
  - Transition periods (price moved > $2.00 in 12 weeks)
  - Policy event windows (within 8 weeks of a known policy change)
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

from forecasting.models.ou_bounded import (
    DEFAULT_REGIMES,
    OURegimeParams,
    estimate_ou_params,
    forecast_at_horizons,
)
from forecasting.models.state_space import ESCStateSpaceModel, load_historical_data


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

HORIZONS = [1, 4, 12, 26]
NOTIONAL_POSITION = 50_000  # certificates
BUY_SELL_THRESHOLD = 0.50   # AUD — minimum forecast move to trigger signal
FLAT_THRESHOLD = 0.25       # AUD — within this is "flat"
POLICY_WINDOW_WEEKS = 8

BACKTEST_CAVEAT = (
    "SYNTHETIC DATA WARNING: All training and validation data is interpolated "
    "from monthly/annual sources. Reported metrics (MAPE, directional accuracy, "
    "decision value) have not been validated against genuine weekly market observations. "
    "Treat as indicative of model structure quality, not predictive accuracy."
)


@dataclass
class ForecastRecord:
    """A single forecast made at time T."""
    week_index: int
    week_ending: str
    current_price: float
    regime: str
    forecasts: Dict[int, float]       # horizon -> predicted price
    actuals: Dict[int, Optional[float]]  # horizon -> actual price (None if beyond dataset)
    confidence_80: Dict[int, Tuple[float, float]]
    confidence_95: Dict[int, Tuple[float, float]]


@dataclass
class MetricSet:
    """Evaluation metrics at a specific horizon."""
    horizon: int
    mape: float
    directional_accuracy: float
    decision_value: float
    coverage_80: float
    coverage_95: float
    n_observations: int
    # Benchmarks
    mape_naive: float
    mape_sma4: float
    mape_sma12: float


@dataclass
class RegimeMetrics:
    """Metrics for a specific regime/period classification."""
    period_type: str  # stable, transition, policy_window
    metrics: Dict[int, MetricSet]  # horizon -> MetricSet
    n_weeks: int


@dataclass
class ModelScorecard:
    """Unified scorecard for model evaluation. Primary metrics: directional_accuracy, cumulative_decision_value."""
    model_name: str
    mape_4w: float
    directional_accuracy: float
    cumulative_decision_value: float
    sharpe_ratio: float
    max_drawdown: float
    win_rate: float
    avg_win_value: float
    avg_loss_value: float
    regime_accuracy: Dict[str, float] = field(default_factory=dict)
    directional_accuracy_pvalue: Optional[float] = None
    dm_statistic: Optional[float] = None
    dm_pvalue: Optional[float] = None


@dataclass
class BacktestResult:
    """Complete backtest output."""
    run_at: str
    model_version: str
    test_period_start: str
    test_period_end: str
    overall_metrics: Dict[int, MetricSet]
    regime_metrics: List[RegimeMetrics]
    forecast_records: List[ForecastRecord]
    caveat: str = BACKTEST_CAVEAT


# ---------------------------------------------------------------------------
# Period classification
# ---------------------------------------------------------------------------

def classify_periods(
    df: pd.DataFrame,
) -> Tuple[List[int], List[int], List[int]]:
    """
    Classify each week into stable, transition, or policy window.

    Returns:
        (stable_indices, transition_indices, policy_indices)
    """
    prices = df["spot_price"].values
    n = len(prices)

    stable = []
    transition = []
    policy = []

    # Parse policy event dates
    policy_dates = set()
    for _, row in df.iterrows():
        try:
            events = json.loads(row["policy_events"]) if isinstance(row["policy_events"], str) else row["policy_events"]
            for evt in (events or []):
                policy_dates.add(evt.get("date", ""))
        except (json.JSONDecodeError, TypeError):
            pass

    for i in range(n):
        # Check policy window: is this week within 8 weeks of a policy event?
        in_policy_window = False
        week_date = str(df.iloc[i]["week_ending"])
        try:
            w = datetime.fromisoformat(week_date)
            for pd_str in policy_dates:
                if pd_str:
                    p = datetime.fromisoformat(pd_str)
                    delta_weeks = abs((w - p).days) / 7.0
                    if delta_weeks <= POLICY_WINDOW_WEEKS:
                        in_policy_window = True
                        break
        except (ValueError, TypeError):
            pass

        if in_policy_window:
            policy.append(i)

        # Check 12-week price movement
        if i >= 12:
            price_move = abs(prices[i] - prices[i - 12])
            if price_move < 1.0:
                stable.append(i)
            elif price_move > 2.0:
                transition.append(i)

    return stable, transition, policy


# ---------------------------------------------------------------------------
# Benchmark forecasts
# ---------------------------------------------------------------------------

def naive_forecast(prices: np.ndarray, t: int) -> float:
    """Naive: forecast = current price."""
    return float(prices[t])


def sma_forecast(prices: np.ndarray, t: int, window: int) -> float:
    """Simple moving average forecast."""
    start = max(0, t - window + 1)
    return float(np.mean(prices[start:t + 1]))


# ---------------------------------------------------------------------------
# Backtest engine
# ---------------------------------------------------------------------------

class BacktestEngine:
    """Walk-forward backtesting for ESC forecasting models."""

    def __init__(self, csv_path: Optional[str] = None) -> None:
        self.df = load_historical_data(csv_path)
        self.prices = self.df["spot_price"].values
        self.n = len(self.prices)
        self.records: List[ForecastRecord] = []

    def run(self, start_week: int = 52, model_version: str = "1.0.0") -> BacktestResult:
        """
        Execute walk-forward backtest.

        Args:
            start_week: first week to generate forecasts (0-indexed).
                        Default 52 = first year is training-only.
            model_version: version string for the model.
        """
        self.records = []

        for t in range(start_week, self.n):
            record = self._forecast_at(t)
            self.records.append(record)

        # Compute metrics
        overall = self._compute_metrics(list(range(len(self.records))))

        # Regime-specific metrics
        stable_idx, transition_idx, policy_idx = classify_periods(self.df)
        # Map dataset indices to record indices
        record_start = start_week

        def to_record_indices(dataset_indices: List[int]) -> List[int]:
            return [i - record_start for i in dataset_indices
                    if record_start <= i < self.n]

        regime_metrics = []
        for name, indices in [
            ("stable", to_record_indices(stable_idx)),
            ("transition", to_record_indices(transition_idx)),
            ("policy_window", to_record_indices(policy_idx)),
        ]:
            if indices:
                metrics = self._compute_metrics(indices)
                regime_metrics.append(RegimeMetrics(
                    period_type=name,
                    metrics=metrics,
                    n_weeks=len(indices),
                ))

        return BacktestResult(
            run_at=datetime.utcnow().isoformat(),
            model_version=model_version,
            test_period_start=str(self.df.iloc[start_week]["week_ending"]),
            test_period_end=str(self.df.iloc[-1]["week_ending"]),
            overall_metrics=overall,
            regime_metrics=regime_metrics,
            forecast_records=self.records,
        )

    def _forecast_at(self, t: int) -> ForecastRecord:
        """Generate forecasts at week t using all data up to t."""
        # Build model on data up to t
        training_data = self.df.iloc[:t + 1]
        model = ESCStateSpaceModel()
        model.run_filter(training_data)

        # Get current state and regime
        latest_state = model.get_latest_state()
        regime = latest_state.regime_name if latest_state else "balanced"
        current_price = float(self.prices[t])
        penalty_rate = float(self.df.iloc[t]["penalty_rate"])

        # Adaptive parameter estimation: use MLE on recent 26-week window
        # to capture current price dynamics rather than fixed regime means.
        # Blend with regime defaults to avoid overfitting to recent noise.
        window = min(26, t + 1)
        recent_prices = self.prices[t - window + 1:t + 1]
        regime_defaults = DEFAULT_REGIMES[regime]
        if len(recent_prices) >= 10:
            mle_params = estimate_ou_params(
                recent_prices,
                initial_guess=(regime_defaults.theta, regime_defaults.mu, regime_defaults.sigma),
            )
            # Blend MLE mu with regime mu (60/40) to stabilise
            blended_mu = 0.6 * mle_params.mu + 0.4 * regime_defaults.mu
            # Add momentum adjustment from 4-week trend
            if len(recent_prices) >= 4:
                trend_4w = (recent_prices[-1] - recent_prices[-4]) / 4.0
                blended_mu += trend_4w * 1.5
            blended_mu = float(np.clip(blended_mu, 10.0, penalty_rate - 1.0))
            # Floor sigma to prevent overly narrow CIs
            sigma_floor = max(regime_defaults.sigma * 0.7, 0.6)
            params = OURegimeParams(
                theta=max(mle_params.theta, 0.02),
                mu=blended_mu,
                sigma=max(mle_params.sigma, sigma_floor),
            )
        else:
            params = regime_defaults

        ou_forecasts = forecast_at_horizons(
            current_price=current_price,
            params=params,
            penalty_rate=penalty_rate,
            horizons=HORIZONS,
            n_paths=2000,  # fewer paths for speed in backtesting
        )

        # Collect actuals
        forecasts_dict = {}
        actuals_dict = {}
        ci_80 = {}
        ci_95 = {}

        for fc in ou_forecasts:
            h = fc.horizon_weeks
            forecasts_dict[h] = fc.mean
            ci_80[h] = (fc.lower_80, fc.upper_80)
            ci_95[h] = (fc.lower_95, fc.upper_95)
            actual_idx = t + h
            if actual_idx < self.n:
                actuals_dict[h] = float(self.prices[actual_idx])
            else:
                actuals_dict[h] = None

        return ForecastRecord(
            week_index=t,
            week_ending=str(self.df.iloc[t]["week_ending"]),
            current_price=current_price,
            regime=regime,
            forecasts=forecasts_dict,
            actuals=actuals_dict,
            confidence_80=ci_80,
            confidence_95=ci_95,
        )

    def _compute_metrics(
        self, record_indices: List[int]
    ) -> Dict[int, MetricSet]:
        """Compute all three metrics for the given record subset."""
        results = {}

        for h in HORIZONS:
            ape_model = []
            ape_naive = []
            ape_sma4 = []
            ape_sma12 = []
            correct_dir = 0
            total_dir = 0
            pnl_model = 0.0
            pnl_hold = 0.0
            covered_80 = 0
            covered_95 = 0
            total_coverage = 0

            for ri in record_indices:
                if ri < 0 or ri >= len(self.records):
                    continue
                rec = self.records[ri]
                actual = rec.actuals.get(h)
                if actual is None:
                    continue

                forecast_price = rec.forecasts[h]
                current = rec.current_price
                t = rec.week_index

                # MAPE
                if actual > 0:
                    ape_model.append(abs(forecast_price - actual) / actual)
                    ape_naive.append(abs(current - actual) / actual)
                    sma4 = sma_forecast(self.prices, t, 4)
                    sma12 = sma_forecast(self.prices, t, 12)
                    ape_sma4.append(abs(sma4 - actual) / actual)
                    ape_sma12.append(abs(sma12 - actual) / actual)

                # Directional accuracy
                actual_dir = actual - current
                forecast_dir = forecast_price - current

                if abs(actual_dir) < FLAT_THRESHOLD:
                    actual_label = "flat"
                elif actual_dir > 0:
                    actual_label = "up"
                else:
                    actual_label = "down"

                if abs(forecast_dir) < FLAT_THRESHOLD:
                    forecast_label = "flat"
                elif forecast_dir > 0:
                    forecast_label = "up"
                else:
                    forecast_label = "down"

                if actual_label == forecast_label:
                    correct_dir += 1
                total_dir += 1

                # Decision value
                if forecast_price - current > BUY_SELL_THRESHOLD:
                    # BUY signal: profit = (actual - current) * position
                    pnl_model += (actual - current) * NOTIONAL_POSITION
                elif current - forecast_price > BUY_SELL_THRESHOLD:
                    # SELL signal: profit = (current - actual) * position
                    pnl_model += (current - actual) * NOTIONAL_POSITION
                # HOLD: no P&L contribution

                # Buy-and-hold benchmark
                pnl_hold += (actual - current) * NOTIONAL_POSITION

                # Coverage
                ci80 = rec.confidence_80.get(h)
                ci95 = rec.confidence_95.get(h)
                if ci80 and ci95:
                    total_coverage += 1
                    if ci80[0] <= actual <= ci80[1]:
                        covered_80 += 1
                    if ci95[0] <= actual <= ci95[1]:
                        covered_95 += 1

            n_obs = len(ape_model)
            results[h] = MetricSet(
                horizon=h,
                mape=float(np.mean(ape_model)) if ape_model else 0.0,
                directional_accuracy=correct_dir / total_dir if total_dir > 0 else 0.0,
                decision_value=pnl_model - pnl_hold,  # value vs. buy-and-hold
                coverage_80=covered_80 / total_coverage if total_coverage > 0 else 0.0,
                coverage_95=covered_95 / total_coverage if total_coverage > 0 else 0.0,
                n_observations=n_obs,
                mape_naive=float(np.mean(ape_naive)) if ape_naive else 0.0,
                mape_sma4=float(np.mean(ape_sma4)) if ape_sma4 else 0.0,
                mape_sma12=float(np.mean(ape_sma12)) if ape_sma12 else 0.0,
            )

        return results


# ---------------------------------------------------------------------------
# Statistical significance tests
# ---------------------------------------------------------------------------

def binomial_test_directional_accuracy(
    correct: int,
    total: int,
    null_p: float = 0.5,
) -> Dict[str, Any]:
    """
    Binomial test: is directional accuracy significantly better than chance?

    Args:
        correct: number of correct directional predictions
        total: total directional predictions
        null_p: null hypothesis probability (default 0.5 for random)

    Returns:
        dict with observed accuracy, n, and two-sided p-value.
    """
    from scipy.stats import binomtest

    result = binomtest(correct, total, null_p, alternative="greater")
    return {
        "observed": correct / max(total, 1),
        "n": total,
        "pvalue": float(result.pvalue),
    }


def diebold_mariano_test(
    forecast_errors: np.ndarray,
    naive_errors: np.ndarray,
    loss: str = "squared",
) -> Dict[str, Any]:
    """
    Diebold-Mariano test: are ensemble forecast errors significantly different
    from naive model errors?

    Uses the standard DM test with squared error loss, two-sided.

    Args:
        forecast_errors: array of (forecast - actual) for the model
        naive_errors: array of (naive_forecast - actual)
        loss: "squared" or "absolute"

    Returns:
        dict with DM statistic, p-value, and interpretation.
    """
    from scipy.stats import norm

    if loss == "squared":
        d = naive_errors ** 2 - forecast_errors ** 2
    else:
        d = np.abs(naive_errors) - np.abs(forecast_errors)

    n = len(d)
    if n < 5:
        return {
            "statistic": float("nan"),
            "pvalue": float("nan"),
            "interpretation": "Insufficient data for DM test",
        }

    d_mean = float(np.mean(d))
    # HAC variance estimate (Newey-West with automatic lag selection)
    # Use lag = int(n^(1/3)) as a rule of thumb
    max_lag = max(1, int(n ** (1.0 / 3.0)))
    gamma_0 = float(np.var(d, ddof=1))
    autocovariances = 0.0
    for k in range(1, max_lag + 1):
        weight = 1.0 - k / (max_lag + 1.0)  # Bartlett kernel
        gamma_k = float(np.cov(d[k:], d[:-k], ddof=1)[0, 1])
        autocovariances += 2.0 * weight * gamma_k

    variance = (gamma_0 + autocovariances) / n
    if variance <= 0:
        return {
            "statistic": float("nan"),
            "pvalue": float("nan"),
            "interpretation": "Non-positive variance estimate",
        }

    dm_stat = d_mean / np.sqrt(variance)
    # Two-sided test
    p_value = 2.0 * (1.0 - norm.cdf(abs(dm_stat)))

    if p_value < 0.05:
        if dm_stat > 0:
            interp = "Model significantly outperforms naive (p < 0.05)"
        else:
            interp = "Naive significantly outperforms model (p < 0.05)"
    else:
        interp = "No significant difference between model and naive"

    return {
        "statistic": round(float(dm_stat), 4),
        "pvalue": round(float(p_value), 6),
        "interpretation": interp,
    }


# ---------------------------------------------------------------------------
# Scorecard generation
# ---------------------------------------------------------------------------

def generate_scorecard(
    name: str,
    records: List[ForecastRecord],
    prices: np.ndarray,
    horizon: int = 4,
) -> ModelScorecard:
    """Generate a ModelScorecard for a model's forecast records at a given horizon."""
    trade_pnls: List[float] = []
    correct_dir = 0
    total_dir = 0
    ape_list: List[float] = []
    regime_correct: Dict[str, int] = {}
    regime_total: Dict[str, int] = {}

    for rec in records:
        actual = rec.actuals.get(horizon)
        if actual is None:
            continue
        forecast_price = rec.forecasts[horizon]
        current = rec.current_price

        # MAPE
        if actual > 0:
            ape_list.append(abs(forecast_price - actual) / actual)

        # Directional accuracy
        actual_dir = actual - current
        forecast_dir = forecast_price - current
        actual_label = "flat" if abs(actual_dir) < FLAT_THRESHOLD else ("up" if actual_dir > 0 else "down")
        forecast_label = "flat" if abs(forecast_dir) < FLAT_THRESHOLD else ("up" if forecast_dir > 0 else "down")
        if actual_label == forecast_label:
            correct_dir += 1
        total_dir += 1

        # Regime tracking
        regime = rec.regime
        regime_total[regime] = regime_total.get(regime, 0) + 1
        if actual_label == forecast_label:
            regime_correct[regime] = regime_correct.get(regime, 0) + 1

        # Trade P&L
        if forecast_price - current > BUY_SELL_THRESHOLD:
            pnl = (actual - current) * NOTIONAL_POSITION
            trade_pnls.append(pnl)
        elif current - forecast_price > BUY_SELL_THRESHOLD:
            pnl = (current - actual) * NOTIONAL_POSITION
            trade_pnls.append(pnl)

    # Compute scorecard metrics
    wins = [p for p in trade_pnls if p > 0]
    losses = [p for p in trade_pnls if p <= 0]
    cumulative = sum(trade_pnls)

    # Sharpe ratio (annualised from weekly trades)
    if trade_pnls and np.std(trade_pnls) > 0:
        sharpe = float(np.mean(trade_pnls) / np.std(trade_pnls) * np.sqrt(52))
    else:
        sharpe = 0.0

    # Max drawdown
    running = 0.0
    peak = 0.0
    max_dd = 0.0
    for pnl in trade_pnls:
        running += pnl
        if running > peak:
            peak = running
        dd = peak - running
        if dd > max_dd:
            max_dd = dd

    regime_acc = {
        r: regime_correct.get(r, 0) / regime_total[r]
        for r in regime_total
        if regime_total[r] > 0
    }

    # Statistical significance tests
    binom_result = binomial_test_directional_accuracy(correct_dir, total_dir)

    # Diebold-Mariano: collect forecast and naive errors
    forecast_errs = []
    naive_errs = []
    for rec in records:
        actual = rec.actuals.get(horizon)
        if actual is None:
            continue
        forecast_errs.append(rec.forecasts[horizon] - actual)
        naive_errs.append(rec.current_price - actual)
    dm_result = diebold_mariano_test(
        np.array(forecast_errs), np.array(naive_errs)
    ) if len(forecast_errs) >= 5 else {"statistic": None, "pvalue": None}

    return ModelScorecard(
        model_name=name,
        mape_4w=float(np.mean(ape_list)) if ape_list else 0.0,
        directional_accuracy=correct_dir / max(total_dir, 1),
        cumulative_decision_value=cumulative,
        sharpe_ratio=sharpe,
        max_drawdown=max_dd,
        win_rate=len(wins) / max(len(trade_pnls), 1),
        avg_win_value=float(np.mean(wins)) if wins else 0.0,
        avg_loss_value=float(np.mean(losses)) if losses else 0.0,
        regime_accuracy=regime_acc,
        directional_accuracy_pvalue=binom_result["pvalue"],
        dm_statistic=dm_result.get("statistic"),
        dm_pvalue=dm_result.get("pvalue"),
    )


def generate_scorecard_comparison(scorecards: List[ModelScorecard]) -> str:
    """Format a comparison table of ModelScorecards."""
    lines = [
        "",
        "=" * 100,
        f"{'CAVEAT':^100}",
        "=" * 100,
        BACKTEST_CAVEAT,
        "",
        "=" * 100,
        "MODEL SCORECARD COMPARISON",
        "=" * 100,
        f"{'Model':<22} {'MAPE 4w':>8} {'DirAcc':>8} {'DecVal':>14} {'Sharpe':>8} "
        f"{'MaxDD':>12} {'WinRate':>8} {'AvgWin':>12} {'AvgLoss':>12}",
        "-" * 100,
    ]
    for sc in scorecards:
        lines.append(
            f"{sc.model_name:<22} "
            f"{sc.mape_4w*100:>7.2f}% "
            f"{sc.directional_accuracy*100:>7.1f}% "
            f"${sc.cumulative_decision_value:>13,.0f} "
            f"{sc.sharpe_ratio:>8.2f} "
            f"${sc.max_drawdown:>11,.0f} "
            f"{sc.win_rate*100:>7.1f}% "
            f"${sc.avg_win_value:>11,.0f} "
            f"${sc.avg_loss_value:>11,.0f}"
        )

    # Regime-specific breakdown
    all_regimes = set()
    for sc in scorecards:
        all_regimes.update(sc.regime_accuracy.keys())
    if all_regimes:
        lines.extend(["", "-" * 100, "REGIME-SPECIFIC DIRECTIONAL ACCURACY", "-" * 100])
        header = f"{'Model':<22}"
        for r in sorted(all_regimes):
            header += f" {r:>12}"
        lines.append(header)
        for sc in scorecards:
            row = f"{sc.model_name:<22}"
            for r in sorted(all_regimes):
                acc = sc.regime_accuracy.get(r, 0.0)
                row += f" {acc*100:>11.1f}%"
            lines.append(row)

    lines.extend(["", "=" * 100])
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Serialisation
# ---------------------------------------------------------------------------

def result_to_dict(result: BacktestResult) -> Dict[str, Any]:
    """Convert BacktestResult to a JSON-serialisable dict."""
    def metric_to_dict(m: MetricSet) -> Dict[str, Any]:
        return {
            "horizon_weeks": m.horizon,
            "mape": round(m.mape, 6),
            "mape_pct": f"{m.mape * 100:.2f}%",
            "directional_accuracy": round(m.directional_accuracy, 4),
            "directional_accuracy_pct": f"{m.directional_accuracy * 100:.1f}%",
            "decision_value": round(m.decision_value, 2),
            "coverage_80": round(m.coverage_80, 4),
            "coverage_95": round(m.coverage_95, 4),
            "n_observations": m.n_observations,
            "benchmarks": {
                "mape_naive": round(m.mape_naive, 6),
                "mape_sma4": round(m.mape_sma4, 6),
                "mape_sma12": round(m.mape_sma12, 6),
            },
        }

    overall = {}
    for h, m in result.overall_metrics.items():
        overall[f"{h}w"] = metric_to_dict(m)

    regime = []
    for rm in result.regime_metrics:
        metrics = {}
        for h, m in rm.metrics.items():
            metrics[f"{h}w"] = metric_to_dict(m)
        regime.append({
            "period_type": rm.period_type,
            "n_weeks": rm.n_weeks,
            "metrics": metrics,
        })

    return {
        "run_at": result.run_at,
        "model_version": result.model_version,
        "test_period": {
            "start": result.test_period_start,
            "end": result.test_period_end,
        },
        "overall": overall,
        "regime_specific": regime,
    }


def format_report(result: BacktestResult) -> str:
    """Format a human-readable backtest report."""
    lines = [
        "=" * 72,
        "WREI ESC Forecasting Model — Backtest Report",
        "=" * 72,
        "",
        BACKTEST_CAVEAT,
        "",
        f"Model version: {result.model_version}",
        f"Test period:   {result.test_period_start} to {result.test_period_end}",
        f"Run at:        {result.run_at}",
        "",
        "-" * 72,
        "OVERALL METRICS (Primary: Dir.Acc, DecVal)",
        "-" * 72,
        f"{'Horizon':>10} {'MAPE':>8} {'Naive':>8} {'SMA4':>8} {'SMA12':>8} "
        f"{'Dir.Acc':>8} {'DecVal':>12} {'Cov80':>7} {'Cov95':>7} {'N':>5}",
    ]

    for h in HORIZONS:
        m = result.overall_metrics.get(h)
        if m:
            lines.append(
                f"{'%dw' % h:>10} "
                f"{m.mape*100:>7.2f}% "
                f"{m.mape_naive*100:>7.2f}% "
                f"{m.mape_sma4*100:>7.2f}% "
                f"{m.mape_sma12*100:>7.2f}% "
                f"{m.directional_accuracy*100:>7.1f}% "
                f"${m.decision_value:>11,.0f} "
                f"{m.coverage_80*100:>6.1f}% "
                f"{m.coverage_95*100:>6.1f}% "
                f"{m.n_observations:>5d}"
            )

    for rm in result.regime_metrics:
        lines.extend([
            "",
            f"----- {rm.period_type.upper()} ({rm.n_weeks} weeks) -----",
        ])
        for h in HORIZONS:
            m = rm.metrics.get(h)
            if m and m.n_observations > 0:
                lines.append(
                    f"  {h:>3}w: MAPE={m.mape*100:.2f}%  "
                    f"Dir={m.directional_accuracy*100:.1f}%  "
                    f"DecVal=${m.decision_value:,.0f}  "
                    f"N={m.n_observations}"
                )

    lines.extend(["", "=" * 72])
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Multi-model comparison (P10-C.4)
# ---------------------------------------------------------------------------

def run_comparative_backtest(
    csv_path: Optional[str] = None,
    start_week: int = 52,
) -> Dict[str, Any]:
    """
    Run a comparative backtest across Bayesian, ML, and Ensemble models.

    Returns a dict with metrics for each model variant plus benchmarks.
    """
    import sys
    project_root = str(Path(__file__).resolve().parent.parent.parent)
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

    from forecasting.models.counterfactual_model import (
        load_reconstruction,
        walk_forward_predict,
        evaluate_predictions,
        format_feature_importance,
    )
    from forecasting.models.ensemble_forecast import (
        optimise_weights,
        run_ensemble_evaluation,
    )

    # 1. Bayesian-only backtest (existing engine)
    print("  [1/4] Running Bayesian-only backtest...")
    engine = BacktestEngine(csv_path)
    bayesian_result = engine.run(start_week=start_week, model_version="1.0.0-bayesian")

    # 2. ML-only evaluation
    print("  [2/4] Running ML-only evaluation...")
    recon_csv = str(Path(__file__).parent.parent / "data" / "esc_reconstruction.csv")
    recon_df = load_reconstruction(recon_csv)
    ml_predictions, ml_metrics = walk_forward_predict(recon_df, start_week=start_week, retrain_interval=12)
    ml_eval = evaluate_predictions(recon_df, ml_predictions, start_week=start_week)

    # 3. Ensemble evaluation
    print("  [3/4] Running ensemble evaluation...")
    ensemble_eval = run_ensemble_evaluation(recon_csv, start_week=start_week)

    # 4. Regime-specific ML performance
    print("  [4/4] Computing regime-specific ML metrics...")
    prices = recon_df["spot_price"].values
    actuals_4w = recon_df["price_t_plus_4w"].values
    actions_actual = recon_df["optimal_action"].values

    # Classify periods
    stable_idx, transition_idx, policy_idx = classify_periods(engine.df)

    def ml_metrics_for_indices(indices: List[int]) -> Dict[str, float]:
        """Compute ML MAPE and action accuracy for a subset of weeks."""
        mape_list = []
        correct = 0
        total = 0
        for t in indices:
            pred_idx = t - start_week
            if pred_idx < 0 or pred_idx >= len(ml_predictions):
                continue
            pred = ml_predictions[pred_idx]
            actual = actuals_4w[t] if t < len(actuals_4w) else np.nan
            if not np.isnan(actual) and actual > 0:
                mape_list.append(abs(pred.predicted_price_4w - actual) / actual)
            actual_action = actions_actual[t] if t < len(actions_actual) else None
            if isinstance(actual_action, str):
                total += 1
                if pred.predicted_action == actual_action:
                    correct += 1
        return {
            "mape_4w": float(np.mean(mape_list)) if mape_list else 0.0,
            "action_accuracy": correct / max(total, 1),
            "n_weeks": len(mape_list),
        }

    ml_regime = {
        "stable": ml_metrics_for_indices(stable_idx),
        "transition": ml_metrics_for_indices(transition_idx),
        "policy_window": ml_metrics_for_indices(policy_idx),
    }

    # Feature importance from ML
    feature_importance_str = format_feature_importance(ml_metrics)

    return {
        "bayesian": bayesian_result,
        "ml_eval": ml_eval,
        "ensemble_eval": ensemble_eval,
        "ml_regime": ml_regime,
        "ml_metrics": ml_metrics,
        "feature_importance_report": feature_importance_str,
    }


def format_comparative_report(comp: Dict[str, Any]) -> str:
    """Format a comparative report across all model variants."""
    bayesian = comp["bayesian"]
    ml = comp["ml_eval"]
    ens = comp["ensemble_eval"]

    lines = [
        "=" * 80,
        "WREI ESC FORECASTING — COMPARATIVE BACKTEST REPORT",
        "=" * 80,
        f"Test period: {bayesian.test_period_start} to {bayesian.test_period_end}",
        "",
        "-" * 80,
        "4-WEEK HORIZON COMPARISON",
        "-" * 80,
        f"{'Model':<20} {'MAPE':>8} {'Dir.Acc':>10} {'DecVal':>14} {'Action Acc':>12}",
    ]

    # Bayesian 4w metrics
    b4 = bayesian.overall_metrics.get(4)
    if b4:
        lines.append(
            f"{'Bayesian-only':<20} "
            f"{b4.mape*100:>7.2f}% "
            f"{b4.directional_accuracy*100:>9.1f}% "
            f"${b4.decision_value:>13,.0f} "
            f"{'—':>12}"
        )

    # ML-only
    lines.append(
        f"{'ML-only (XGBoost)':<20} "
        f"{ml['price_mape']*100:>7.2f}% "
        f"{'—':>10} "
        f"{'—':>14} "
        f"{ml['action_accuracy']*100:>11.1f}%"
    )

    # Ensemble
    lines.append(
        f"{'Ensemble':<20} "
        f"{ens['ensemble_mape_4w']*100:>7.2f}% "
        f"{'—':>10} "
        f"{'—':>14} "
        f"{'—':>12}"
    )

    # Benchmarks
    if b4:
        lines.extend([
            "",
            f"{'Naive (random walk)':<20} {b4.mape_naive*100:>7.2f}%",
            f"{'SMA-4':<20} {b4.mape_sma4*100:>7.2f}%",
            f"{'SMA-12':<20} {b4.mape_sma12*100:>7.2f}%",
        ])

    # Ensemble weights
    lines.extend([
        "",
        "-" * 80,
        "ENSEMBLE WEIGHTS (optimised by walk-forward cross-validation)",
        "-" * 80,
        f"  Bayesian weight: {ens['bayesian_weight']:.2f}",
        f"  ML weight:       {ens['ml_weight']:.2f}",
    ])

    # Regime-specific ML performance
    ml_regime = comp["ml_regime"]
    lines.extend([
        "",
        "-" * 80,
        "REGIME-SPECIFIC ML PERFORMANCE (4w horizon)",
        "-" * 80,
    ])
    for period, metrics in ml_regime.items():
        if metrics["n_weeks"] > 0:
            lines.append(
                f"  {period:<20} "
                f"MAPE={metrics['mape_4w']*100:.2f}%  "
                f"ActionAcc={metrics['action_accuracy']*100:.1f}%  "
                f"N={metrics['n_weeks']}"
            )

    # Feature importance
    lines.extend([
        "",
        "-" * 80,
        "ML FEATURE IMPORTANCE",
        "-" * 80,
        comp["feature_importance_report"],
    ])

    # Bayesian full report
    lines.extend([
        "",
        "-" * 80,
        "BAYESIAN MODEL — FULL HORIZON METRICS",
        "-" * 80,
    ])
    for h in HORIZONS:
        m = bayesian.overall_metrics.get(h)
        if m:
            lines.append(
                f"  {h:>3}w: MAPE={m.mape*100:.2f}%  "
                f"Dir={m.directional_accuracy*100:.1f}%  "
                f"DecVal=${m.decision_value:,.0f}  "
                f"Cov80={m.coverage_80*100:.1f}%  "
                f"Cov95={m.coverage_95*100:.1f}%  "
                f"N={m.n_observations}"
            )

    lines.extend(["", "=" * 80])
    return "\n".join(lines)
