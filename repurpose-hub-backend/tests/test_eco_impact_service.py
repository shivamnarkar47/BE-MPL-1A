"""Tests for eco_impact service."""
import pytest
from services.eco_impact import (
    calculate_item_impact,
    calculate_total_impact,
    get_impact_summary,
    IMPACT_FACTORS,
    WATER_SAVINGS_PER_KG,
    WASTE_REDUCTION_PER_KG,
)


class TestCalculateItemImpact:
    def test_tops_category(self):
        result = calculate_item_impact("tops", weight_kg=0.3)
        expected_carbon = 0.3 * IMPACT_FACTORS["tops"]
        assert result["carbon_saved_kg"] == round(expected_carbon, 2)
        assert result["water_saved_liters"] == 0.3 * WATER_SAVINGS_PER_KG
        assert result["waste_reduced_kg"] == 0.3 * WASTE_REDUCTION_PER_KG

    def test_outerwear_has_highest_impact(self):
        tops = calculate_item_impact("tops", weight_kg=0.3)
        outerwear = calculate_item_impact("outerwear", weight_kg=0.3)
        assert outerwear["carbon_saved_kg"] > tops["carbon_saved_kg"]

    def test_unknown_category_uses_default(self):
        result = calculate_item_impact("unknown_item", weight_kg=0.5)
        default_factor = IMPACT_FACTORS["other"]
        assert result["carbon_saved_kg"] == round(0.5 * default_factor, 2)

    def test_case_insensitive(self):
        result1 = calculate_item_impact("TOPS", weight_kg=0.3)
        result2 = calculate_item_impact("tops", weight_kg=0.3)
        assert result1 == result2

    def test_default_weight(self):
        result = calculate_item_impact("tops")
        expected_carbon = 0.3 * IMPACT_FACTORS["tops"]
        assert result["carbon_saved_kg"] == round(expected_carbon, 2)


class TestCalculateTotalImpact:
    def test_empty_items(self):
        result = calculate_total_impact([], [])
        assert result["total_carbon_saved_kg"] == 0.0
        assert result["total_water_saved_liters"] == 0.0
        assert result["items_count"] == 0

    def test_single_item(self):
        result = calculate_total_impact([{}], ["tops"])
        assert result["items_count"] == 1
        assert len(result["breakdown"]) == 1
        assert result["breakdown"][0]["category"] == "tops"

    def test_multiple_items_different_categories(self):
        result = calculate_total_impact([{}, {}, {}], ["tops", "bottoms", "dresses"])
        assert result["items_count"] == 3
        assert len(result["breakdown"]) == 3

    def test_more_items_than_categories_uses_other(self):
        result = calculate_total_impact([{}, {}, {}], ["tops"])
        assert result["items_count"] == 3
        assert result["breakdown"][1]["category"] == "other"
        assert result["breakdown"][2]["category"] == "other"

    def test_has_timestamp(self):
        result = calculate_total_impact([{}], ["tops"])
        assert "calculated_at" in result


class TestGetImpactSummary:
    def test_returns_expected_structure(self):
        result = get_impact_summary()
        assert "impact_per_item_avg" in result
        assert "metrics_version" in result

    def test_impact_per_item_avg_has_all_fields(self):
        result = get_impact_summary()
        avg = result["impact_per_item_avg"]
        assert "carbon_saved_kg" in avg
        assert "water_saved_liters" in avg
        assert "waste_reduced_kg" in avg