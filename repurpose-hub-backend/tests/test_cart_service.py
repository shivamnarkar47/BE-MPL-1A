"""Tests for cart service."""
import pytest
from services.cart import parse_price, calculate_cart_total, validate_cart_amount


class TestParsePrice:
    def test_parses_simple_price(self):
        assert parse_price("100") == 100.0

    def test_parses_price_with_rs_prefix(self):
        assert parse_price("Rs. 500") == 500.0

    def test_parses_price_with_comma_separators(self):
        assert parse_price("1,000") == 1000.0

    def test_parses_price_with_rs_and_comma(self):
        assert parse_price("Rs. 1,500") == 1500.0

    def test_parses_zero(self):
        assert parse_price("0") == 0.0

    def test_parses_empty_string(self):
        assert parse_price("") == 0.0

    def test_parses_non_numeric(self):
        assert parse_price("abc") == 0.0


class TestCalculateCartTotal:
    def test_empty_cart(self):
        assert calculate_cart_total([]) == 0.0

    def test_single_item(self):
        items = [{"price": "100", "quantity": 1}]
        assert calculate_cart_total(items) == 120.0  # 100 * 1.2

    def test_multiple_items(self):
        items = [
            {"price": "100", "quantity": 2},
            {"price": "50", "quantity": 1},
        ]
        # (100*2 + 50*1) * 1.2 = 250 * 1.2 = 300
        assert calculate_cart_total(items) == 300.0

    def test_custom_service_fee(self):
        items = [{"price": "100", "quantity": 1}]
        # 10% fee
        assert calculate_cart_total(items, service_fee_rate=1.1) == 110.0

    def test_missing_quantity_defaults_to_one(self):
        items = [{"price": "100"}]
        assert calculate_cart_total(items) == 120.0

    def test_handles_rs_prefix_and_comma(self):
        items = [{"price": "Rs. 1,000", "quantity": 1}]
        assert calculate_cart_total(items) == 1200.0


class TestValidateCartAmount:
    def test_valid_amount_within_tolerance(self):
        items = [{"price": "100", "quantity": 1}]
        calculated = calculate_cart_total(items)  # 120.0
        is_valid, total = validate_cart_amount(items, calculated)
        assert is_valid is True
        assert total == 120.0

    def test_invalid_amount_outside_tolerance(self):
        items = [{"price": "100", "quantity": 1}]
        is_valid, total = validate_cart_amount(items, 200.0)  # way off
        assert is_valid is False

    def test_amount_within_one_percent_tolerance(self):
        items = [{"price": "100", "quantity": 1}]
        calculated = calculate_cart_total(items)
        # 1% tolerance = 1.2
        is_valid, total = validate_cart_amount(items, calculated + 1.0)
        assert is_valid is True

    def test_amount_outside_one_percent_tolerance(self):
        items = [{"price": "100", "quantity": 1}]
        calculated = calculate_cart_total(items)
        # 2% tolerance = 2.4, 5.0 is outside
        is_valid, total = validate_cart_amount(items, calculated + 5.0)
        assert is_valid is False