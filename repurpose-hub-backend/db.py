"""Shared database configuration and client."""
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# MongoDB connection
mongo_client = AsyncIOMotorClient(
    os.getenv("MONGODB_URI", "mongodb://localhost:27017")
)
db_name = os.getenv("MONGODB_DB", "repurpose-hub")
db: AsyncIOMotorDatabase = mongo_client[db_name]

# Collections
user_collection = db.users
product_collection = db.products
tutorials_collection = db.tutorials
donations_collection = db.donations
cart_collection = db.cart
checkout_collection = db.checkout
orders_collection = db.orders
wishlist_collection = db.wishlist
eco_impact_collection = db.eco_impact
style_preferences_collection = db.style_preferences
idempotency_collection = db.idempotency