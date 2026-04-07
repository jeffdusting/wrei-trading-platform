"""
Instrument Configuration Schema
=================================

Defines the InstrumentConfig dataclass that parameterises all model
components for a given environmental certificate instrument.

See §4.1 of the WREI Comprehensive Advancement Plan.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class InstrumentConfig:
    """Configuration for a single tradeable instrument."""

    # --- Required fields (no defaults) ---

    code: str                           # ESC, VEEC, ACCU, LGC, STC, WREI-CC
    name: str
    currency: str                       # AUD, USD
    market_type: str                    # compliance, voluntary, hybrid

    # Price boundary structure
    has_penalty_ceiling: bool           # True for ESC/VEEC, False for ACCU/LGC
    penalty_rate: Optional[float]       # Current ceiling (ESC: 35.86, VEEC: 100.00)
    penalty_rate_source: Optional[str]  # "IPART CPI-adjusted" / "ESC Victoria" / None
    price_floor: float                  # Minimum plausible price

    # Supply dynamics
    supply_driver: str                  # "activity_creation" / "project_issuance" / "generation"
    supply_data_source: str             # "IPART" / "CER" / "CER+ANREU" / "simulation"

    # Demand dynamics
    demand_driver: str                  # "surrender_obligation" / "safeguard_compliance" / "rpt_target"
    demand_data_source: str             # "IPART" / "CER" / "ESC Victoria"

    # --- Fields with defaults ---

    known_supply_shocks: List[Dict[str, Any]] = field(default_factory=list)
    compliance_deadlines: List[Dict[str, str]] = field(default_factory=list)

    # Regime structure
    regime_count: int = 3
    regime_names: List[str] = field(default_factory=lambda: ["surplus", "balanced", "tightening"])
    ou_parameters: Dict[str, Dict[str, float]] = field(default_factory=dict)

    # Data sources
    price_scrapers: List[str] = field(default_factory=list)
    volume_scrapers: List[str] = field(default_factory=list)

    # Settlement
    settlement_type: str = "registry"   # "registry" / "anreu" / "blockchain"
    settlement_registry: str = "TESSA"  # "TESSA" / "ANREU" / "Verra" / "zConnect"

    # Observation mapping for state-space model
    price_reference: Optional[float] = None
    price_reference_label: str = "penalty_rate"

    # Feature columns for XGBoost (instrument-specific)
    feature_columns: List[str] = field(default_factory=list)

    # Soft upper bound for instruments without a penalty ceiling
    soft_upper_bound: Optional[float] = None
