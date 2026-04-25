"""Eco impact service - environmental impact calculations."""
from typing import Dict, Any
from datetime import datetime, timezone

# Impact factors (kg CO2 saved per category per kg of textile)
IMPACT_FACTORS = {
    "tops": 2.5,
    "bottoms": 3.2,
    "dresses": 4.1,
    "outerwear": 5.0,
    "accessories": 0.8,
    "footwear": 3.5,
    "other": 2.0,
}

# Water savings per kg of textile (liters)
WATER_SAVINGS_PER_KG = 10000

# Waste reduction per kg (kg)
WASTE_REDUCTION_PER_KG = 0.8


def calculate_item_impact(category: str, weight_kg: float = 0.3) -> Dict[str, float]:
    """Calculate environmental impact for a single item."""
    factor = IMPACT_FACTORS.get(category.lower(), IMPACT_FACTORS["other"])
    
    return {
        "carbon_saved_kg": round(weight_kg * factor, 2),
        "water_saved_liters": round(weight_kg * WATER_SAVINGS_PER_KG, 2),
        "waste_reduced_kg": round(weight_kg * WASTE_REDUCTION_PER_KG, 2),
    }


def calculate_total_impact(items: list, categories: list) -> Dict[str, Any]:
    """Calculate total environmental impact for a list of items."""
    total_carbon = 0.0
    total_water = 0.0
    total_waste = 0.0
    breakdown = []
    
    for i, item in enumerate(items):
        category = categories[i] if i < len(categories) else "other"
        item_impact = calculate_item_impact(category)
        
        total_carbon += item_impact["carbon_saved_kg"]
        total_water += item_impact["water_saved_liters"]
        total_waste += item_impact["waste_reduced_kg"]
        
        breakdown.append({
            "item_index": i,
            "category": category,
            **item_impact
        })
    
    return {
        "total_carbon_saved_kg": round(total_carbon, 2),
        "total_water_saved_liters": round(total_water, 2),
        "total_waste_reduced_kg": round(total_waste, 2),
        "items_count": len(items),
        "breakdown": breakdown,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
    }


def get_impact_summary() -> Dict[str, Any]:
    """Get summary impact metrics for dashboard."""
    return {
        "impact_per_item_avg": {
            "carbon_saved_kg": 1.2,
            "water_saved_liters": 3000,
            "waste_reduced_kg": 0.24,
        },
        "metrics_version": "1.0",
    }