from typing import List
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from models import (
    Cart,
    Checkout,
    Donation,
    Login,
    ProductResponse,
    User,
    CreateOrderRequest,
    VerifyPaymentRequest,
    OrderResponse,
    VerifyPaymentResponse,
    CompleteCheckoutRequest,
    Wishlist,
    WishlistItem,
    EcoImpact,
    StylePreferences,
    ProductCreate,
)
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
import datetime
import razorpay
import os
import hmac
import hashlib
from passlib.context import CryptContext

app = FastAPI()

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RZmsXRdoSG9Eu4")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "L2ogP0mVvA0wSAGdweRJlupr")

# Initialize Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
razorpay_client.set_app_details({"title": "FastAPI App", "version": "1.0"})

# CORS configuration
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_client = AsyncIOMotorClient("mongodb://localhost:27017")
db = mongo_client["repurpose-hub"]
user_collection = db.users
product_collection = db.products
tutorials_collection = db.tutorials
donations_collection = db.donations
cart_collection = db.cart
checkout_collection = db.checkout
orders_collection = db.orders  # New collection for Razorpay orders
wishlist_collection = db.wishlist  # New collection for wishlists
eco_impact_collection = db.eco_impact  # New collection for eco-impact metrics
style_preferences_collection = db.style_preferences  # New collection for style preferences


# Helper functions
def donation_helper(donation: dict) -> dict:
    donation["_id"] = str(donation["_id"])
    return donation


def cart_helper(cart: dict) -> dict:
    cart["_id"] = str(cart["_id"])
    return cart


def wishlist_helper(wishlist: dict) -> dict:
    wishlist["_id"] = str(wishlist["_id"])
    return wishlist


def checkout_helper(checkout: dict) -> dict:
    checkout["_id"] = str(checkout["_id"])
    return checkout


def product_helper(product) -> dict:
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "price": product["price"],
        "quantity": product["quantity"],
        "companyname": product["companyName"],
        "imageurl": product["image_url"],
    }


def tutorial_helper(tutorial: dict) -> dict:
    tutorial["_id"] = str(tutorial["_id"])
    return tutorial


def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "role": user.get("role", "user"),
    }


def order_helper(order) -> dict:
    order["_id"] = str(order["_id"])
    return order


def eco_impact_helper(impact) -> dict:
    impact["_id"] = str(impact["_id"])
    return impact


# Password hashing configuration
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# User Management Endpoints
@app.post("/createUser/")
async def create_user(user: User):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    result = await user_collection.insert_one(user_data)
    created_user = await user_collection.find_one({"_id": result.inserted_id})

    if created_user:
        return user_helper(created_user)

    raise HTTPException(status_code=400, detail="Failed to create user")


@app.get("/users/{user_id}")
async def get_user(user_id: str):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if user:
        return user_helper(user)

    raise HTTPException(status_code=404, detail="User not found")


@app.post("/login/")
async def login(login: Login):
    user = await user_collection.find_one({"email": login.email})
    if not user or not verify_password(login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return user_helper(user)


# Product Endpoints
@app.get("/allProducts/", response_model=List[ProductResponse])
async def get_all_products():
    products = await product_collection.find().to_list(100)
    return [product_helper(product) for product in products]


@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await product_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        return product_helper(product)

    raise HTTPException(status_code=404, detail="Product not found")


# Tutorial Endpoints
@app.get("/allTutorials/")
async def get_all_tutorials():
    try:
        tutorials_cursor = tutorials_collection.find({})
        tutorials_list = await tutorials_cursor.to_list(length=None)
        return [tutorial_helper(tutorial) for tutorial in tutorials_list]
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Error fetching tutorials: {str(e)}"
        )


# Donation Endpoints
@app.post("/donations", status_code=201)
async def create_donation(donation: Donation):
    existing_donation = await donations_collection.find_one({"id": donation.id})
    if existing_donation:
        raise HTTPException(
            status_code=400, detail="Donation with this ID already exists."
        )

    new_donation = donation.dict()
    if not new_donation.get("created_at"):
        new_donation["created_at"] = datetime.datetime.utcnow()

    await donations_collection.insert_one(new_donation)
    return donation


@app.get("/donations", response_model=List[Donation])
async def get_all_donations():
    donations_cursor = donations_collection.find({})
    donations_list = await donations_cursor.to_list(length=None)
    return [donation_helper(donation) for donation in donations_list]


# Cart Endpoints
@app.post("/cart/add")
async def add_to_cart(cart: Cart):
    try:
        existing_cart = await cart_collection.find_one({"user_id": cart.user_id})

        if existing_cart:
            for new_item in cart.items:
                product_found = False
                for existing_item in existing_cart["items"]:
                    if existing_item["id"] == new_item.id:
                        await cart_collection.update_one(
                            {"user_id": cart.user_id, "items.id": new_item.id},
                            {"$inc": {"items.$.quantity": new_item.quantity}},
                        )
                        product_found = True
                        break

                if not product_found:
                    await cart_collection.update_one(
                        {"user_id": cart.user_id}, {"$push": {"items": new_item.dict()}}
                    )
        else:
            new_cart = cart.dict()
            await cart_collection.insert_one(new_cart)

        return {"message": "Items added to cart successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.get("/cart/{user_id}")
async def get_cart(user_id: str):
    try:
        user_cursor = cart_collection.find({"user_id": user_id})
        cart_list = await user_cursor.to_list(length=None)

        # Return empty cart array instead of 404 when no items found
        if not cart_list:
            return []

        return [cart_helper(cart) for cart in cart_list]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching cart: {str(e)}")


@app.delete("/cart/remove-item")
async def remove_from_cart(request: dict):
    try:
        user_id = request.get("user_id")
        item_id = request.get("item_id")

        if not user_id or not item_id:
            raise HTTPException(
                status_code=400, detail="user_id and item_id are required"
            )

        result = await cart_collection.update_one(
            {"user_id": user_id}, {"$pull": {"items": {"id": item_id}}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Cart not found")

        return {"message": "Item removed from cart successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing item: {str(e)}")


@app.patch("/cart/update-quantity")
async def update_cart_quantity(request: dict):
    try:
        user_id = request.get("user_id")
        item_id = request.get("item_id")
        quantity = request.get("quantity")

        if user_id is None or item_id is None or quantity is None:
            raise HTTPException(status_code=400, detail="user_id, item_id, and quantity are required")

        if quantity <= 0:
            # Remove item if quantity is 0 or less
            result = await cart_collection.update_one(
                {"user_id": user_id},
                {"$pull": {"items": {"id": item_id}}}
            )
        else:
            # Update to absolute quantity
            result = await cart_collection.update_one(
                {"user_id": user_id, "items.id": item_id},
                {"$set": {"items.$.quantity": quantity}}
            )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Cart or item not found")

        return {"message": "Quantity updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating quantity: {str(e)}")


# Wishlist Endpoints
@app.get("/wishlist/{user_id}")
async def get_wishlist(user_id: str):
    try:
        wishlist_cursor = wishlist_collection.find({"user_id": user_id})
        wishlist_list = await wishlist_cursor.to_list(length=None)

        if not wishlist_list:
            return []

        return [wishlist_helper(wishlist) for wishlist in wishlist_list]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching wishlist: {str(e)}"
        )


@app.post("/wishlist/add")
async def add_to_wishlist(wishlist: Wishlist):
    try:
        existing_wishlist = await wishlist_collection.find_one(
            {"user_id": wishlist.user_id}
        )

        if existing_wishlist:
            # Add new items to existing wishlist
            for new_item in wishlist.items:
                item_found = False
                for existing_item in existing_wishlist["items"]:
                    if existing_item["id"] == new_item.id:
                        item_found = True
                        break

                if not item_found:
                    await wishlist_collection.update_one(
                        {"user_id": wishlist.user_id},
                        {"$push": {"items": new_item.dict()}},
                    )
        else:
            # Create new wishlist
            new_wishlist = wishlist.dict()
            await wishlist_collection.insert_one(new_wishlist)

        return {"message": "Items added to wishlist successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error adding to wishlist: {str(e)}"
        )


@app.delete("/wishlist/remove-item")
async def remove_from_wishlist(request: dict):
    try:
        user_id = request.get("user_id")
        item_id = request.get("item_id")

        if not user_id or not item_id:
            raise HTTPException(
                status_code=400, detail="user_id and item_id are required"
            )

        result = await wishlist_collection.update_one(
            {"user_id": user_id}, {"$pull": {"items": {"id": item_id}}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Wishlist not found")

        return {"message": "Item removed from wishlist successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing item: {str(e)}")


@app.delete("/wishlist/clear/{user_id}")
async def clear_wishlist(user_id: str):
    try:
        result = await wishlist_collection.delete_one({"user_id": user_id})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Wishlist not found")

        return {"message": "Wishlist cleared successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error clearing wishlist: {str(e)}"
        )


# Razorpay Payment Endpoints
@app.post("/payment/create-order", response_model=OrderResponse)
async def create_razorpay_order(order_request: CreateOrderRequest):
    """
    Create a Razorpay order for payment processing
    """
    try:
        # Convert amount to paise (Razorpay expects amount in paise for INR)
        amount_in_paise = int(order_request.amount * 100)

        # Create Razorpay order
        order_data = {
            "amount": amount_in_paise,
            "currency": order_request.currency,
            "receipt": f"receipt_{order_request.user_id}_",
            "notes": {
                "user_id": order_request.user_id,
            },
            "payment_capture": 1,  # Auto capture payment
        }

        # Create order with Razorpay
        order = razorpay_client.order.create(data=order_data)

        # Store order details in database
        order_record = {
            "razorpay_order_id": order["id"],
            "user_id": order_request.user_id,
            "amount": order_request.amount,
            "amount_in_paise": amount_in_paise,
            "currency": order_request.currency,
            "status": order["status"],
            "receipt": order_data["receipt"],
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
        }

        await orders_collection.insert_one(order_record)

        return OrderResponse(orderId=order["id"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")


@app.post("/payment/verify-payment", response_model=VerifyPaymentResponse)
async def verify_razorpay_payment(verification_request: VerifyPaymentRequest):
    """
    Verify Razorpay payment signature
    """
    try:
        # Verify payment signature using Razorpay utility
        params_dict = {
            "razorpay_order_id": verification_request.orderId,
            "razorpay_payment_id": verification_request.razorpayPaymentId,
            "razorpay_signature": verification_request.razorpaySignature,
        }

        # This will raise SignatureVerificationError if signature is invalid
        razorpay_client.utility.verify_payment_signature(params_dict)

        # Update order status in database
        await orders_collection.update_one(
            {"razorpay_order_id": verification_request.orderId},
            {
                "$set": {
                    "status": "paid",
                    "razorpay_payment_id": verification_request.razorpayPaymentId,
                    "payment_verified_at": datetime.datetime.utcnow(),
                    "updated_at": datetime.datetime.utcnow(),
                }
            },
        )

        return VerifyPaymentResponse(
            success=True, message="Payment verified successfully"
        )

    except razorpay.errors.SignatureVerificationError:
        return VerifyPaymentResponse(success=False, message="Invalid payment signature")
    except Exception as e:
        return VerifyPaymentResponse(
            success=False, message=f"Payment verification failed: {str(e)}"
        )


@app.get("/payment/order-status/{razorpay_order_id}")
async def get_order_status(razorpay_order_id: str):
    """
    Get the status of a specific order
    """
    try:
        order = await orders_collection.find_one(
            {"razorpay_order_id": razorpay_order_id}
        )
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # You can also fetch latest status from Razorpay API if needed
        # razorpay_order = razorpay_client.order.fetch(razorpay_order_id)

        return {
            "razorpay_order_id": order["razorpay_order_id"],
            "status": order["status"],
            "amount": order["amount"],
            "user_id": order["user_id"],
            "created_at": order["created_at"],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get order status: {str(e)}"
        )


# Checkout Endpoints
@app.post("/cart/checkout")
async def checkout(checkout_info: Checkout):
    """
    Initiate checkout process (creates cart record but doesn't complete it until payment verification)
    """
    try:
        # Find the cart for the user
        user_cart = await cart_collection.find_one({"user_id": checkout_info.user_id})

        if not user_cart:
            raise HTTPException(status_code=404, detail="Cart not found for the user")

        # Save cart items for checkout
        order_items = user_cart.get("items", [])
        total_price = checkout_info.total_payment

        # Create checkout record with pending status
        checkout_doc = {
            "user_id": checkout_info.user_id,
            "items": order_items,
            "total_price": total_price,
            "status": "pending_payment",
            "payment_method": "razorpay",
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
        }

        checkout_result = await checkout_collection.insert_one(checkout_doc)
        checkout_id = str(checkout_result.inserted_id)

        return {
            "message": "Checkout initiated successfully",
            "checkout_id": checkout_id,
            "total_price": total_price,
            "status": "pending_payment",
            "next_step": "Proceed to payment",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.post("/cart/complete-checkout")
async def complete_checkout(complete_request: CompleteCheckoutRequest):
    """
    Complete the checkout process after successful payment verification
    """
    try:
        if not ObjectId.is_valid(complete_request.order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")

        # Find the checkout order
        checkout_order = await checkout_collection.find_one(
            {"_id": ObjectId(complete_request.order_id)}
        )

        if not checkout_order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Verify payment was successful
        payment_verified = await orders_collection.find_one(
            {
                "razorpay_order_id": complete_request.razorpay_order_id,
                "razorpay_payment_id": complete_request.razorpay_payment_id,
                "status": "paid",
            }
        )

        if not payment_verified:
            raise HTTPException(
                status_code=400, detail="Payment not verified or incomplete"
            )

        # Update checkout status to completed
        await checkout_collection.update_one(
            {"_id": ObjectId(complete_request.order_id)},
            {
                "$set": {
                    "status": "completed",
                    "razorpay_order_id": complete_request.razorpay_order_id,
                    "razorpay_payment_id": complete_request.razorpay_payment_id,
                    "updated_at": datetime.datetime.utcnow(),
                }
            },
        )

        # Clear the user's cart after successful payment
        user_id = checkout_order["user_id"]
        await cart_collection.delete_one({"user_id": user_id})

        # Update Eco-Impact
        # Simple calculation for demonstration: 
        # CO2: 0.5kg per item, Water: 10L per item, Waste: 0.2kg per item, Trees: 0.01 per item
        num_items = sum(item.get("quantity", 1) for item in checkout_order.get("items", []))
        co2_saved = num_items * 0.5
        water_saved = num_items * 10.0
        waste_diverted = num_items * 0.2
        trees_saved = num_items * 0.01

        await eco_impact_collection.update_one(
            {"user_id": user_id},
            {
                "$inc": {
                    "co2_saved": co2_saved,
                    "water_saved": water_saved,
                    "waste_diverted": waste_diverted,
                    "trees_saved": trees_saved
                },
                "$set": {"last_updated": datetime.datetime.utcnow()},
                "$addToSet": {"badges": "Eco Shopper"}
            },
            upsert=True
        )

        return {
            "message": "Checkout completed successfully",
            "order_id": complete_request.order_id,
            "status": "completed",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


# Order History Endpoints
@app.get("/orders/{user_id}")
async def get_orders(user_id: str):
    """
    Get order history for a user
    """
    checkout_cursor = checkout_collection.find({"user_id": user_id})
    checkout_list = await checkout_cursor.to_list(length=None)
    if not checkout_list:
        raise HTTPException(status_code=404, detail="Orders not found")

    return [checkout_helper(checkout) for checkout in checkout_list]


@app.get("/payment/orders/{user_id}")
async def get_payment_orders(user_id: str):
    """
    Get payment orders for a user
    """
    orders_cursor = orders_collection.find({"user_id": user_id})
    orders_list = await orders_cursor.to_list(length=None)
    if not orders_list:
        raise HTTPException(status_code=404, detail="Payment orders not found")

    return [order_helper(order) for order in orders_list]


# Eco-Impact Endpoints
@app.get("/eco-impact/{user_id}", response_model=EcoImpact)
async def get_eco_impact(user_id: str):
    """
    Get eco-impact metrics for a user
    """
    impact = await eco_impact_collection.find_one({"user_id": user_id})
    if not impact:
        # Initialize impact if not found
        new_impact = {
            "user_id": user_id,
            "co2_saved": 0.0,
            "water_saved": 0.0,
            "waste_diverted": 0.0,
            "trees_saved": 0.0,
            "badges": [],
            "last_updated": datetime.datetime.utcnow(),
        }
        result = await eco_impact_collection.insert_one(new_impact)
        impact = await eco_impact_collection.find_one({"_id": result.inserted_id})

    return eco_impact_helper(impact)


@app.get("/community-impact")
async def get_community_impact():
    """
    Get aggregate community impact data
    """
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_co2": {"$sum": "$co2_saved"},
                "total_water": {"$sum": "$water_saved"},
                "total_waste": {"$sum": "$waste_diverted"},
                "total_trees": {"$sum": "$trees_saved"},
                "total_users": {"$sum": 1},
            }
        }
    ]
    cursor = eco_impact_collection.aggregate(pipeline)
    result = await cursor.to_list(length=1)

    if not result:
        return {
            "total_co2": 0.0,
            "total_water": 0.0,
            "total_waste": 0.0,
            "total_trees": 0.0,
            "total_users": 0,
        }

    return result[0]


# Style Quiz Endpoints
@app.post("/style-quiz")
async def save_style_preferences(prefs: StylePreferences):
    """
    Save user style preferences from the quiz
    """
    try:
        await style_preferences_collection.update_one(
            {"user_id": prefs.user_id},
            {"$set": prefs.dict()},
            upsert=True
        )
        return {"message": "Style preferences saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving preferences: {str(e)}")


@app.get("/style-quiz/{user_id}")
async def get_style_preferences(user_id: str):
    """
    Get user style preferences
    """
    prefs = await style_preferences_collection.find_one({"user_id": user_id})
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    
    prefs["_id"] = str(prefs["_id"])
    return prefs


# Admin Endpoints
@app.post("/admin/products")
async def admin_create_product(product: ProductCreate):
    """
    Create a new product (Admin only)
    """
    try:
        product_data = product.dict()
        result = await product_collection.insert_one(product_data)
        return {"message": "Product created successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating product: {str(e)}")


@app.put("/admin/products/{product_id}")
async def admin_update_product(product_id: str, product: ProductCreate):
    """
    Update an existing product (Admin only)
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    try:
        result = await product_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": product.dict()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating product: {str(e)}")


@app.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str):
    """
    Delete a product (Admin only)
    """
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")
    
    try:
        result = await product_collection.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting product: {str(e)}")


@app.get("/admin/analytics")
async def get_admin_analytics():
    """
    Get platform analytics (Admin only)
    """
    try:
        total_products = await product_collection.count_documents({})
        total_users = await user_collection.count_documents({})
        total_orders = await checkout_collection.count_documents({"status": "completed"})
        
        # Calculate total revenue
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_price"}}}
        ]
        revenue_result = await checkout_collection.aggregate(pipeline).to_list(length=1)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0
        
        return {
            "total_products": total_products,
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": total_revenue
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")


# Health check endpoint
@app.get("/")
async def root():
    return {"message": "RepurposeHub API is running", "razorpay_integration": "active"}


@app.get("/health")
async def health_check():
    try:
        # Test MongoDB connection
        await db.command("ping")

        # Test Razorpay connection (list orders with limit 1)
        razorpay_client.order.all({"count": 1})

        return {
            "status": "healthy",
            "database": "connected",
            "razorpay": "connected",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")
