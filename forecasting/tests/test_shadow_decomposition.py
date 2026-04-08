"""
Tests for shadow supply decomposition (Session F).
"""

import pytest


class TestShadowSupplyDecomposer:
    """Tests for the five-pool shadow supply model."""

    def test_returns_valid_structure(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        assert "total_shadow_supply" in result
        assert "shadow_multiplier" in result
        assert "pool_breakdown" in result
        assert "comparison_to_simple_multiplier" in result

    def test_five_pools_present(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        pools = result["pool_breakdown"]
        expected = {"acp_pipeline", "acp_inventory", "broker_inventory",
                    "forward_committed", "participant_surplus"}
        assert set(pools.keys()) == expected

    def test_multiplier_greater_than_one(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        assert result["shadow_multiplier"] > 1.0

    def test_total_is_sum_of_pools(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        pool_sum = sum(p["volume"] for p in result["pool_breakdown"].values())
        assert result["total_shadow_supply"] == pool_sum

    def test_each_pool_has_required_fields(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        for pool_name, pool_data in result["pool_breakdown"].items():
            assert "volume" in pool_data, f"{pool_name} missing volume"
            assert "confidence" in pool_data, f"{pool_name} missing confidence"
            assert "data_source" in pool_data, f"{pool_name} missing data_source"
            assert pool_data["volume"] >= 0
            assert 0 <= pool_data["confidence"] <= 1.0

    def test_acp_pipeline_volume_positive(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        pool = sd.estimate_acp_pipeline()
        assert pool.volume > 0

    def test_acp_inventory_volume_positive(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        pool = sd.estimate_acp_inventory()
        assert pool.volume > 0

    def test_broker_inventory_has_direction(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        pool = sd.estimate_broker_inventory()
        assert pool.direction in ("building", "drawing_down", "stable")

    def test_forward_committed_has_delivery_schedule(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        pool = sd.estimate_forward_committed()
        assert pool.delivery_schedule is not None
        assert len(pool.delivery_schedule) > 0

    def test_participant_surplus_volume_positive(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        pool = sd.estimate_participant_surplus()
        assert pool.volume > 0

    def test_comparison_to_simple_multiplier(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        result = sd.total_shadow_estimate()
        comp = result["comparison_to_simple_multiplier"]
        assert comp["simple_multiplier"] == 1.6
        assert comp["decomposed_multiplier"] > 0
        assert "interpretation" in comp


class TestFallbackSimpleMultiplier:
    """Tests for fallback to simple multiplier."""

    def test_simple_estimate_returns_valid(self):
        from forecasting.calibration.shadow_decomposition import simple_shadow_estimate
        result = simple_shadow_estimate(4_500_000)
        assert result["shadow_multiplier"] == 1.6
        assert result["total_shadow_supply"] == int(4_500_000 * 1.6)


class TestPoolShiftDetection:
    """Tests for anomaly detection on shadow supply shifts."""

    def test_no_anomalies_when_no_previous(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        anomalies = sd.detect_pool_shifts()
        assert anomalies == []

    def test_detects_large_shift(self):
        from forecasting.calibration.shadow_decomposition import ShadowSupplyDecomposer
        sd = ShadowSupplyDecomposer()
        # Get current estimates
        result = sd.total_shadow_estimate()
        current = {name: data["volume"] for name, data in result["pool_breakdown"].items()}

        # Simulate a large shift: halve the broker inventory
        prev = dict(current)
        prev["broker_inventory"] = current["broker_inventory"] * 2

        anomalies = sd.detect_pool_shifts(prev_estimates=prev)
        # Should detect the broker inventory shift
        pool_anomalies = [a for a in anomalies if a["pool"] == "broker_inventory"]
        assert len(pool_anomalies) >= 1
