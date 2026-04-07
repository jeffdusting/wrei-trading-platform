"""
Instrument Registry
====================

Maps instrument codes to InstrumentConfig instances. The registry is the
single source of truth for all instrument-specific parameters used across
the forecasting system.
"""

from __future__ import annotations

from typing import Dict

from forecasting.instruments.config import InstrumentConfig


# ---------------------------------------------------------------------------
# ESC — NSW Energy Savings Certificates
# ---------------------------------------------------------------------------

ESC_CONFIG = InstrumentConfig(
    code="ESC",
    name="NSW Energy Savings Certificate",
    currency="AUD",
    market_type="compliance",

    has_penalty_ceiling=True,
    penalty_rate=35.86,
    penalty_rate_source="IPART CPI-adjusted",
    price_floor=5.0,

    supply_driver="activity_creation",
    supply_data_source="IPART",
    known_supply_shocks=[
        {"event": "Commercial lighting (CLESF) method end", "date": "2026-03-31", "impact_pct": -0.25},
        {"event": "SONA method end", "date": "2025-11-30", "impact_pct": -0.06},
        {"event": "F8/F9 gas boiler end", "date": "2026-06-30", "impact_pct": -0.04},
    ],

    demand_driver="surrender_obligation",
    compliance_deadlines=[
        {"date": "06-30", "label": "ESS annual surrender deadline"},
    ],
    demand_data_source="IPART",

    regime_count=3,
    regime_names=["surplus", "balanced", "tightening"],
    ou_parameters={
        "surplus":    {"theta": 0.03, "mu": 18.0, "sigma": 0.8},
        "balanced":   {"theta": 0.08, "mu": 23.5, "sigma": 1.0},
        "tightening": {"theta": 0.15, "mu": 27.0, "sigma": 1.4},
    },

    price_scrapers=["ecovantage", "northmore_gordon"],
    volume_scrapers=["ipart", "tessa"],

    settlement_type="registry",
    settlement_registry="TESSA",

    price_reference=35.86,
    price_reference_label="penalty_rate",

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus", "surplus_runway_years",
        "days_to_surrender", "penalty_rate", "price_to_penalty_ratio",
        "activity_cl_pct", "activity_heer_pct", "activity_iheab_pct",
        "activity_piamv_pct", "policy_signal_active", "policy_supply_impact_pct",
        "policy_demand_impact_pct", "broker_sentiment", "supply_concern_level",
        "creation_trend_accelerating", "creation_trend_decelerating",
        "estimated_shadow_supply", "regime_surplus_prob", "regime_balanced_prob",
        "regime_tightening_prob",
    ],
)


# ---------------------------------------------------------------------------
# VEEC — Victorian Energy Efficiency Certificates
# ---------------------------------------------------------------------------

VEEC_CONFIG = InstrumentConfig(
    code="VEEC",
    name="Victorian Energy Efficiency Certificate",
    currency="AUD",
    market_type="compliance",

    has_penalty_ceiling=True,
    penalty_rate=100.00,
    penalty_rate_source="ESC Victoria / Victorian Energy Efficiency Target Regulations",
    price_floor=10.0,

    supply_driver="activity_creation",
    supply_data_source="ESC Victoria",
    known_supply_shocks=[],

    demand_driver="surrender_obligation",
    compliance_deadlines=[
        {"date": "04-30", "label": "VEU annual compliance deadline"},
    ],
    demand_data_source="ESC Victoria",

    regime_count=3,
    regime_names=["surplus", "balanced", "tightening"],
    ou_parameters={
        "surplus":    {"theta": 0.02, "mu": 50.0, "sigma": 3.0},
        "balanced":   {"theta": 0.06, "mu": 70.0, "sigma": 4.0},
        "tightening": {"theta": 0.12, "mu": 85.0, "sigma": 5.5},
    },

    price_scrapers=["ecovantage", "northmore_gordon"],
    volume_scrapers=["esc_victoria"],

    settlement_type="registry",
    settlement_registry="TESSA",

    price_reference=100.00,
    price_reference_label="penalty_rate",

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus", "surplus_runway_years",
        "days_to_surrender", "penalty_rate", "price_to_penalty_ratio",
        "policy_signal_active", "policy_supply_impact_pct",
        "policy_demand_impact_pct", "broker_sentiment", "supply_concern_level",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
    ],
)


# ---------------------------------------------------------------------------
# ACCU — Australian Carbon Credit Units
# ---------------------------------------------------------------------------

ACCU_CONFIG = InstrumentConfig(
    code="ACCU",
    name="Australian Carbon Credit Unit",
    currency="AUD",
    market_type="compliance",

    has_penalty_ceiling=False,
    penalty_rate=None,
    penalty_rate_source=None,
    price_floor=10.0,

    supply_driver="project_issuance",
    supply_data_source="CER+ANREU",
    known_supply_shocks=[],

    demand_driver="safeguard_compliance",
    compliance_deadlines=[
        {"date": "03-31", "label": "Safeguard annual surrender"},
    ],
    demand_data_source="CER",

    regime_count=3,
    regime_names=["surplus", "balanced", "tightening"],
    ou_parameters={
        "surplus":    {"theta": 0.02, "mu": 28.0, "sigma": 2.0},
        "balanced":   {"theta": 0.05, "mu": 35.0, "sigma": 2.5},
        "tightening": {"theta": 0.10, "mu": 45.0, "sigma": 3.5},
    },

    price_scrapers=["cer", "core_markets"],
    volume_scrapers=["cer_registry", "anreu"],

    settlement_type="anreu",
    settlement_registry="ANREU",

    # CCM price ($79.20) is the soft reference for ACCUs (analogous to penalty rate)
    price_reference=79.20,
    price_reference_label="CCM_price",

    # Historical 99th percentile as soft upper bound
    soft_upper_bound=80.0,

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus", "surplus_runway_years",
        "days_to_surrender", "price_to_penalty_ratio",
        "policy_signal_active", "policy_supply_impact_pct",
        "policy_demand_impact_pct", "broker_sentiment", "supply_concern_level",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
    ],
)


# ---------------------------------------------------------------------------
# LGC — Large-scale Generation Certificates (skeleton)
# ---------------------------------------------------------------------------

LGC_CONFIG = InstrumentConfig(
    code="LGC",
    name="Large-scale Generation Certificate",
    currency="AUD",
    market_type="compliance",

    has_penalty_ceiling=False,
    penalty_rate=None,
    penalty_rate_source=None,
    price_floor=0.0,

    supply_driver="generation",
    supply_data_source="CER",
    known_supply_shocks=[],

    demand_driver="rpt_target",
    compliance_deadlines=[
        {"date": "02-14", "label": "RET annual surrender"},
    ],
    demand_data_source="CER",

    regime_count=3,
    regime_names=["surplus", "balanced", "tightening"],
    ou_parameters={
        "surplus":    {"theta": 0.02, "mu": 2.0, "sigma": 0.3},
        "balanced":   {"theta": 0.05, "mu": 4.0, "sigma": 0.5},
        "tightening": {"theta": 0.10, "mu": 8.0, "sigma": 1.0},
    },

    price_scrapers=["ecovantage"],
    volume_scrapers=["cer_registry"],

    settlement_type="registry",
    settlement_registry="TESSA",

    price_reference=65.0,
    price_reference_label="shortfall_charge",

    soft_upper_bound=65.0,

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus",
        "policy_signal_active", "policy_supply_impact_pct",
        "policy_demand_impact_pct", "broker_sentiment",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
    ],
)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------

INSTRUMENT_REGISTRY: Dict[str, InstrumentConfig] = {
    "ESC": ESC_CONFIG,
    "VEEC": VEEC_CONFIG,
    "ACCU": ACCU_CONFIG,
    "LGC": LGC_CONFIG,
}


def get_instrument(code: str) -> InstrumentConfig:
    """
    Retrieve an instrument config by code.

    Raises KeyError if the instrument is not registered.
    """
    code_upper = code.upper()
    if code_upper not in INSTRUMENT_REGISTRY:
        raise KeyError(
            f"Unknown instrument '{code}'. "
            f"Available: {list(INSTRUMENT_REGISTRY.keys())}"
        )
    return INSTRUMENT_REGISTRY[code_upper]
