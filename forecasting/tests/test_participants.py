"""
Tests for participant intelligence modules (Session F).
"""

import pytest
from datetime import date


class TestSchemeParticipantRegistry:
    """Tests for demand-side participant registry."""

    def test_loads_participants(self):
        from forecasting.participants.demand_intelligence import SchemeParticipantRegistry
        reg = SchemeParticipantRegistry()
        assert len(reg.participants) > 0

    def test_top5_by_market_share(self):
        from forecasting.participants.demand_intelligence import SchemeParticipantRegistry
        reg = SchemeParticipantRegistry()
        top5 = reg.get_top_participants(5)
        assert len(top5) == 5
        # Top 3 should be the "Big 3"
        top3_names = {p.name for p in top5[:3]}
        assert "Origin Energy" in top3_names
        assert "AGL Energy" in top3_names
        assert "EnergyAustralia" in top3_names

    def test_market_share_sums_reasonable(self):
        from forecasting.participants.demand_intelligence import SchemeParticipantRegistry
        reg = SchemeParticipantRegistry()
        total = reg.total_tracked_market_share()
        # Should track at least 80% of the market
        assert total > 0.80
        # Should not exceed 100%
        assert total <= 1.0


class TestRetailerObligationEstimator:
    """Tests for obligation estimation."""

    def test_estimates_all_obligations(self):
        from forecasting.participants.demand_intelligence import RetailerObligationEstimator
        estimator = RetailerObligationEstimator()
        obligations = estimator.estimate_all_obligations(2025)
        assert len(obligations) > 0
        for o in obligations:
            assert o.estimated_esc_obligation > 0
            assert o.confidence > 0

    def test_aggregate_demand_by_quarter(self):
        from forecasting.participants.demand_intelligence import RetailerObligationEstimator
        estimator = RetailerObligationEstimator()
        quarterly = estimator.aggregate_demand_by_quarter(2025)
        assert "Q1" in quarterly
        assert "Q4" in quarterly
        # Q4 should be largest (deadline-driven)
        assert quarterly["Q4"] > quarterly["Q1"]

    def test_obligation_concentration_hhi(self):
        from forecasting.participants.demand_intelligence import RetailerObligationEstimator
        estimator = RetailerObligationEstimator()
        hhi = estimator.obligation_concentration_hhi(2025)
        # HHI should indicate moderate concentration (Big 3 ~74%)
        assert hhi > 1000  # Moderate concentration
        assert hhi < 10000  # Not a monopoly

    def test_xgboost_features_structure(self):
        from forecasting.participants.demand_intelligence import RetailerObligationEstimator
        estimator = RetailerObligationEstimator()
        features = estimator.get_xgboost_features(2025)
        assert "top5_retailer_obligation_total" in features
        assert "obligation_concentration_hhi" in features
        assert "days_to_next_surrender_deadline" in features
        assert "retailer_stress_signal_count" in features
        assert "demand_media_signal_score" in features
        assert features["top5_retailer_obligation_total"] > 0


class TestACPRegistry:
    """Tests for supply-side ACP registry."""

    def test_loads_acps(self):
        from forecasting.participants.supply_intelligence import ACPRegistry
        reg = ACPRegistry()
        assert len(reg.acps) > 0

    def test_active_acps(self):
        from forecasting.participants.supply_intelligence import ACPRegistry
        reg = ACPRegistry()
        active = reg.get_active_acps()
        assert len(active) > 0

    def test_total_creation_reasonable(self):
        from forecasting.participants.supply_intelligence import ACPRegistry
        reg = ACPRegistry()
        total = reg.total_estimated_creation()
        # Total should be in millions
        assert total > 1_000_000
        assert total < 20_000_000

    def test_identifies_ending_method_acps(self):
        from forecasting.participants.supply_intelligence import ACPRegistry
        reg = ACPRegistry()
        ending = reg.acps_with_only_ending_methods()
        # At least one ACP should have only ending methods (Bright Spark Energy)
        assert len(ending) >= 1


class TestCreationPipelineEstimator:
    """Tests for creation pipeline estimation."""

    def test_forward_schedule_26_weeks(self):
        from forecasting.participants.supply_intelligence import CreationPipelineEstimator
        pipeline = CreationPipelineEstimator()
        schedule = pipeline.forward_creation_schedule(26)
        assert len(schedule) == 26
        for week in schedule:
            assert "total_creation" in week
            assert week["total_creation"] >= 0

    def test_total_26w_positive(self):
        from forecasting.participants.supply_intelligence import CreationPipelineEstimator
        pipeline = CreationPipelineEstimator()
        total = pipeline.total_26w_creation_estimate()
        assert total > 0


class TestACPConcentrationAnalyser:
    """Tests for concentration analysis."""

    def test_top5_share_reasonable(self):
        from forecasting.participants.supply_intelligence import ACPConcentrationAnalyser
        analyser = ACPConcentrationAnalyser()
        share = analyser.top_n_creation_share(5)
        assert share > 0.4  # Top 5 should be substantial
        assert share <= 1.0

    def test_supply_vulnerability_score(self):
        from forecasting.participants.supply_intelligence import ACPConcentrationAnalyser
        analyser = ACPConcentrationAnalyser()
        score = analyser.supply_vulnerability_score()
        assert score in ("high", "medium", "low")

    def test_xgboost_features_structure(self):
        from forecasting.participants.supply_intelligence import ACPConcentrationAnalyser
        analyser = ACPConcentrationAnalyser()
        features = analyser.get_xgboost_features()
        assert "top10_acp_creation_share" in features
        assert "active_acp_count" in features
        assert "methods_ending_within_26w" in features
        assert "creation_pipeline_26w_total" in features
        assert "supply_vulnerability_score" in features
        assert features["active_acp_count"] > 0


class TestPipelineIntegration:
    """Test that the pipeline runs with participant modules."""

    def test_participant_modules_import(self):
        from forecasting.participants.demand_intelligence import (
            SchemeParticipantRegistry,
            RetailerObligationEstimator,
            RetailerMediaMonitor,
        )
        from forecasting.participants.supply_intelligence import (
            ACPRegistry,
            CreationPipelineEstimator,
            ACPConcentrationAnalyser,
        )
        # All should instantiate without error
        SchemeParticipantRegistry()
        RetailerObligationEstimator()
        RetailerMediaMonitor()
        ACPRegistry()
        CreationPipelineEstimator()
        ACPConcentrationAnalyser()
