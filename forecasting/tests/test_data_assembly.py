"""Tests for the data assembly module."""

import sys
from pathlib import Path

project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from forecasting.data_assembly import (
    PENALTY_RATES,
    assemble_dataset,
    get_genuine_observation_count,
)


def test_assemble_dataset_returns_rows():
    """assemble_dataset() returns a non-empty list of dicts with required columns."""
    rows = assemble_dataset()
    assert len(rows) > 0

    required_columns = [
        "week_ending",
        "spot_price",
        "creation_volume_total",
        "cumulative_surplus",
        "penalty_rate",
        "days_to_surrender",
        "price_to_penalty_ratio",
        "policy_events",
        "data_quality",
    ]
    for col in required_columns:
        assert col in rows[0], f"Missing column: {col}"


def test_penalty_rates_loaded_from_json():
    """Penalty rates are loaded from reference_data/penalty_rates.json."""
    assert isinstance(PENALTY_RATES, dict)
    assert len(PENALTY_RATES) >= 7
    for year in range(2019, 2026):
        assert year in PENALTY_RATES, f"Missing penalty rate for {year}"
        assert PENALTY_RATES[year] > 0


def test_penalty_rate_2026_not_29_48():
    """The 2026 penalty rate should NOT be $29.48 (known incorrect value)."""
    if 2026 in PENALTY_RATES:
        assert PENALTY_RATES[2026] != 29.48, (
            "2026 penalty rate is still $29.48 — this is incorrect; "
            "should be CPI-adjusted from 2025 ($36.20)"
        )


def test_price_to_penalty_ratio_computed_correctly():
    """price_to_penalty_ratio = spot_price / penalty_rate for each row."""
    rows = assemble_dataset()
    for row in rows[:20]:
        expected = round(row["spot_price"] / row["penalty_rate"], 4)
        assert abs(row["price_to_penalty_ratio"] - expected) < 0.001, (
            f"price_to_penalty_ratio mismatch at {row['week_ending']}: "
            f"got {row['price_to_penalty_ratio']}, expected {expected}"
        )


def test_data_quality_column_present():
    """All rows have a data_quality column starting with 'synthetic'."""
    rows = assemble_dataset()
    for row in rows:
        assert "data_quality" in row
        assert row["data_quality"].startswith("synthetic"), (
            f"Expected synthetic data quality, got {row['data_quality']}"
        )


def test_genuine_observation_count_zero():
    """Currently all data is synthetic, so genuine count should be 0."""
    count = get_genuine_observation_count()
    assert count == 0


def test_penalty_rates_monotonically_increasing():
    """ESC penalty rates should increase year-over-year (CPI adjustment)."""
    years = sorted(PENALTY_RATES.keys())
    for i in range(1, len(years)):
        assert PENALTY_RATES[years[i]] >= PENALTY_RATES[years[i - 1]], (
            f"Penalty rate decreased from {years[i-1]} (${PENALTY_RATES[years[i-1]]}) "
            f"to {years[i]} (${PENALTY_RATES[years[i]]})"
        )
