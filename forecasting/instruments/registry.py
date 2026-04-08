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
        # Demand-side participant features (Session F)
        "top5_retailer_obligation_total", "obligation_concentration_hhi",
        "days_to_next_surrender_deadline", "retailer_stress_signal_count",
        "demand_media_signal_score",
        # Supply-side participant features (Session F)
        "top10_acp_creation_share", "active_acp_count",
        "methods_ending_within_26w", "creation_pipeline_26w_total",
        "supply_vulnerability_score",
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
    known_supply_shocks=[
        {"event": "Landfill gas crediting period cliff (74 projects)", "date": "2026-06-30", "impact_pct": -0.15},
        {"event": "Safeguard Mechanism baseline decline 4.9% pa", "date": "2025-07-01", "impact_pct": 0.10},
    ],

    demand_driver="safeguard_compliance",
    compliance_deadlines=[
        {"date": "03-31", "label": "Safeguard annual surrender"},
    ],
    demand_data_source="CER",

    regime_count=3,
    regime_names=["post_compliance", "building", "compliance_window"],
    ou_parameters={
        # MLE-calibrated from CORE Markets daily data (2024-01 to 2026-03)
        # post_compliance: April-August (post-surrender sell-off → recovery)
        "post_compliance": {"theta": 0.035, "mu": 33.50, "sigma": 1.80},
        # building: September-December (demand building, limited supply)
        "building":        {"theta": 0.065, "mu": 37.00, "sigma": 2.20},
        # compliance_window: January-March (surrender deadline pressure)
        "compliance_window": {"theta": 0.110, "mu": 36.00, "sigma": 2.60},
    },

    price_scrapers=["cer", "core_markets"],
    volume_scrapers=["cer_registry", "anreu"],

    settlement_type="anreu",
    settlement_registry="ANREU",

    # CCM price ($79.20 for 2024-25, CPI+2% indexed) is the soft ceiling
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
        # ACCU-specific features (Session H)
        "safeguard_baseline_decline_rate",
        "total_accu_holdings",
        "safeguard_entity_holdings_pct",
        "ccm_stock_remaining",
        "days_to_march_31",
        "methodology_concentration_hhi",
        "landfill_gas_projects_ending_within_26w",
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
# GEO — Global Emissions Offset (CBL/Xpansiv benchmark)
# ---------------------------------------------------------------------------

GEO_CONFIG = InstrumentConfig(
    code="GEO",
    name="Global Emissions Offset",
    currency="USD",
    market_type="voluntary",

    has_penalty_ceiling=False,
    penalty_rate=None,
    penalty_rate_source=None,
    price_floor=0.10,

    supply_driver="project_issuance",
    supply_data_source="Verra+GoldStandard",
    known_supply_shocks=[],

    demand_driver="corporate_voluntary",
    compliance_deadlines=[],
    demand_data_source="CBL/Xpansiv",

    regime_count=3,
    regime_names=["risk_off", "balanced", "quality_rotation"],
    ou_parameters={
        # Calibrated from CBL GEO weekly data (2024-01 to 2026-03)
        "risk_off":          {"theta": 0.04, "mu": 0.80, "sigma": 0.15},
        "balanced":          {"theta": 0.07, "mu": 1.30, "sigma": 0.20},
        "quality_rotation":  {"theta": 0.12, "mu": 2.00, "sigma": 0.35},
    },

    price_scrapers=["cbl_xpansiv"],
    volume_scrapers=["cbl_xpansiv"],

    settlement_type="registry",
    settlement_registry="Verra",

    price_reference=None,
    price_reference_label="none",

    soft_upper_bound=10.0,

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus",
        "policy_signal_active", "broker_sentiment",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
        "vcu_retirement_rate_trend",
        "corporate_netzero_announcement_index",
        "quality_premium_spread",
    ],
)


# ---------------------------------------------------------------------------
# N-GEO — Nature-based Global Emissions Offset
# ---------------------------------------------------------------------------

NGEO_CONFIG = InstrumentConfig(
    code="N-GEO",
    name="Nature-based Global Emissions Offset",
    currency="USD",
    market_type="voluntary",

    has_penalty_ceiling=False,
    penalty_rate=None,
    penalty_rate_source=None,
    price_floor=0.30,

    supply_driver="project_issuance",
    supply_data_source="Verra+GoldStandard",
    known_supply_shocks=[],

    demand_driver="corporate_voluntary",
    compliance_deadlines=[],
    demand_data_source="CBL/Xpansiv",

    regime_count=3,
    regime_names=["risk_off", "balanced", "quality_rotation"],
    ou_parameters={
        # N-GEO: higher volatility, nature-based premium dynamics
        "risk_off":          {"theta": 0.03, "mu": 2.20, "sigma": 0.40},
        "balanced":          {"theta": 0.06, "mu": 3.60, "sigma": 0.55},
        "quality_rotation":  {"theta": 0.10, "mu": 5.50, "sigma": 0.80},
    },

    price_scrapers=["cbl_xpansiv"],
    volume_scrapers=["cbl_xpansiv"],

    settlement_type="registry",
    settlement_registry="Verra",

    price_reference=None,
    price_reference_label="none",

    soft_upper_bound=25.0,

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus",
        "policy_signal_active", "broker_sentiment",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
        "vcu_retirement_rate_trend",
        "corporate_netzero_announcement_index",
        "quality_premium_spread",
    ],
)


# ---------------------------------------------------------------------------
# C-GEO — Technology-based / CORSIA-eligible Global Emissions Offset
# ---------------------------------------------------------------------------

CGEO_CONFIG = InstrumentConfig(
    code="C-GEO",
    name="CORSIA-eligible Global Emissions Offset",
    currency="USD",
    market_type="voluntary",

    has_penalty_ceiling=False,
    penalty_rate=None,
    penalty_rate_source=None,
    price_floor=1.00,

    supply_driver="project_issuance",
    supply_data_source="Verra+GoldStandard+ICAO",
    known_supply_shocks=[],

    demand_driver="corporate_voluntary",
    compliance_deadlines=[
        {"date": "01-01", "label": "CORSIA compliance phase"},
    ],
    demand_data_source="CBL/Xpansiv",

    regime_count=3,
    regime_names=["risk_off", "balanced", "quality_rotation"],
    ou_parameters={
        # C-GEO: lower volatility, CORSIA demand-driven
        "risk_off":          {"theta": 0.05, "mu": 4.50, "sigma": 0.50},
        "balanced":          {"theta": 0.08, "mu": 6.50, "sigma": 0.70},
        "quality_rotation":  {"theta": 0.14, "mu": 9.50, "sigma": 1.00},
    },

    price_scrapers=["cbl_xpansiv"],
    volume_scrapers=["cbl_xpansiv"],

    settlement_type="registry",
    settlement_registry="Verra",

    price_reference=None,
    price_reference_label="none",

    soft_upper_bound=30.0,

    feature_columns=[
        "spot_price", "creation_velocity_4w", "creation_velocity_12w",
        "creation_velocity_trend", "cumulative_surplus",
        "policy_signal_active", "broker_sentiment",
        "regime_surplus_prob", "regime_balanced_prob", "regime_tightening_prob",
        "vcu_retirement_rate_trend",
        "corsia_phase_timeline",
        "quality_premium_spread",
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
    "GEO": GEO_CONFIG,
    "N-GEO": NGEO_CONFIG,
    "C-GEO": CGEO_CONFIG,
}


def get_instrument(code: str) -> InstrumentConfig:
    """
    Retrieve an instrument config by code.

    Raises KeyError if the instrument is not registered.
    """
    code_upper = code.upper().strip()
    if code_upper not in INSTRUMENT_REGISTRY:
        raise KeyError(
            f"Unknown instrument '{code}'. "
            f"Available: {list(INSTRUMENT_REGISTRY.keys())}"
        )
    return INSTRUMENT_REGISTRY[code_upper]
