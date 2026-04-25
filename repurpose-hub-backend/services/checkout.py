"""Checkout service - order processing and fulfillment."""
from typing import Dict, Any, Optional
from datetime import datetime


async def create_order_record(
    order_data: Dict[str, Any],
    orders_collection: Any,
    idempotency_collection: Any,
) -> Dict[str, Any]:
    """Create or retrieve order with idempotency support.
    
    Args:
        order_data: Order details including user_id, items, total, etc.
        orders_collection: MongoDB orders collection
        idempotency_collection: MongoDB idempotency collection
    
    Returns:
        Created or existing order document
    """
    idempotency_key = order_data.get("idempotency_key")
    
    # Check idempotency
    if idempotency_key:
        existing = await idempotency_collection.find_one({"key": idempotency_key})
        if existing:
            return existing.get("result")
    
    # Create order
    order_doc = {
        **order_data,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }
    
    result = await orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    
    # Record idempotency
    if idempotency_key:
        await idempotency_collection.insert_one({
            "key": idempotency_key,
            "result": order_doc,
            "created_at": datetime.utcnow(),
        })
    
    return order_doc


async def update_order_status(
    order_id: str,
    new_status: str,
    orders_collection: Any,
) -> Optional[Dict[str, Any]]:
    """Update order status."""
    from bson import ObjectId
    
    result = await orders_collection.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow().isoformat()}}
    )
    
    if result.modified_count > 0:
        return await orders_collection.find_one({"_id": ObjectId(order_id)})
    return None


async def complete_checkout(
    checkout_data: Dict[str, Any],
    orders_collection: Any,
) -> Dict[str, Any]:
    """Complete checkout flow - finalize order."""
    order_record = {
        "user_id": checkout_data.get("user_id"),
        "items": checkout_data.get("items", []),
        "total": checkout_data.get("total", 0),
        "payment_status": "completed",
        "status": "confirmed",
        "completed_at": datetime.utcnow().isoformat(),
    }
    
    return await create_order_record(order_record, orders_collection, None)