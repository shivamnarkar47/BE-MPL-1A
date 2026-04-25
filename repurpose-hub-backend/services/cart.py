"""Cart service - pure cart operations."""
import re
from typing import List, Dict, Any, Tuple

def parse_price(price_str: str) -> float:
    """Parse price string to float. Handles 'Rs.' prefix and comma separators."""
    clean_price = re.sub(r"^Rs\.\s*", "", str(price_str)).replace(",", "")
    return float(clean_price) if clean_price and clean_price[0].isdigit() else 0.0


def calculate_cart_total(items: List[Dict[str, Any]], service_fee_rate: float = 1.2) -> float:
    """Calculate total cart value with service fee.
    
    Args:
        items: List of cart items with 'price' and 'quantity'
        service_fee_rate: Multiplier for service fee (1.2 = 20%)
    
    Returns:
        Total including service fee, rounded to 2 decimals
    """
    total = 0.0
    for item in items:
        price = parse_price(item.get("price", "0"))
        qty = int(item.get("quantity", 1))
        total += price * qty
    
    return round(total * service_fee_rate, 2)


def validate_cart_amount(items: List[Dict[str, Any]], expected_total: float) -> Tuple[bool, float]:
    """Validate cart total against expected amount.
    
    Args:
        items: Cart items
        expected_total: Expected total to validate against
    
    Returns:
        Tuple of (is_valid, calculated_total)
    """
    calculated_total = calculate_cart_total(items)
    
    # Allow 1% tolerance for rounding
    tolerance = calculated_total * 0.01
    is_valid = abs(calculated_total - expected_total) <= tolerance
    
    return is_valid, calculated_total