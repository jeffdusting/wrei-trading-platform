"""Shared test fixtures for the forecasting module."""

import json
import os
import sys
import tempfile
from pathlib import Path

import pytest

# Ensure project root is on path
project_root = str(Path(__file__).resolve().parent.parent.parent)
if project_root not in sys.path:
    sys.path.insert(0, project_root)


@pytest.fixture
def minimal_dataset():
    """A minimal 10-row assembled dataset for fast testing."""
    from forecasting.data_assembly import assemble_dataset
    rows = assemble_dataset()
    return rows[:10]


@pytest.fixture
def mock_penalty_rates_json(tmp_path):
    """A temporary penalty_rates.json for isolated testing."""
    data = {
        "esc": {
            "source": "test",
            "note": "test rates",
            "base_penalty_rate_2009": 24.50,
            "rates": {
                "2019": 28.56,
                "2020": 29.02,
                "2021": 29.09,
                "2022": 29.95,
                "2023": 32.04,
                "2024": 33.84,
                "2025": 34.84,
                "2026": 35.86,
            },
            "verification_status": "test",
        },
        "veec": {
            "source": "test",
            "note": "test rates",
            "rates": {"2024": 90.00, "2025": 90.00, "2026": 100.00},
            "verification_status": "test",
        },
    }
    path = tmp_path / "penalty_rates.json"
    path.write_text(json.dumps(data))
    return str(path)


@pytest.fixture
def mock_scraped_document():
    """A mock IPART news item for signal extractor testing."""
    return {
        "title": "ESS Rule Amendment No. 12 — Test",
        "url": "https://example.com/test",
        "date": "2025-03-01",
        "summary": "Test amendment increasing residential activity scope.",
        "source": "ipart",
        "full_text": (
            "IPART has published an amendment to the Energy Savings Scheme Rule "
            "that expands the scope of residential activities effective 1 July 2025. "
            "This is expected to increase certificate creation by approximately 5%."
        ),
    }
