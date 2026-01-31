from typing import List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
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
import razorpay
import os
import hmac
import hashlib
from passlib.context import CryptContext
from fpdf import FPDF
from fastapi.responses import Response
import io
import re
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

app = FastAPI()

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7

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
orders_collection = db.orders
wishlist_collection = db.wishlist
eco_impact_collection = db.eco_impact
style_preferences_collection = db.style_preferences
idempotency_collection = db.idempotency  # For payment idempotency


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
        "stock": product.get("stock", product.get("quantity", 0)),
        "companyname": product.get("companyName", product.get("companyname", "")),
        "imageurl": product.get("image_url", product.get("imageurl", "")),
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


# JWT Token Functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Payment Idempotency Functions
IDEMPOTENCY_TTL_MINUTES = 30


async def check_idempotency(key: str) -> tuple[bool, dict | None]:
    """Check if idempotency key exists. Returns (exists, existing_result)"""
    existing = await idempotency_collection.find_one({"key": key})
    if existing and existing.get("expires_at", datetime.now()) > datetime.now():
        return True, existing.get("result")
    return False, None


async def store_idempotency_result(key: str, result: dict):
    """Store idempotency result with expiry"""
    await idempotency_collection.update_one(
        {"key": key},
        {
            "$set": {
                "result": result,
                "expires_at": datetime.now()
                + timedelta(minutes=IDEMPOTENCY_TTL_MINUTES),
                "created_at": datetime.now(),
            }
        },
        upsert=True,
    )


# Amount Validation
async def validate_cart_amount(
    user_id: str, expected_total: float
) -> tuple[bool, float]:
    """
    Validate cart amount against requested total.
    Returns (is_valid, calculated_total)
    Allow 1% tolerance for rounding differences
    """
    user_cart = await cart_collection.find_one({"user_id": user_id})
    if not user_cart or not user_cart.get("items"):
        return True, 0.0

    calculated_total = 0.0
    for item in user_cart["items"]:
        price_str = str(item.get("price", "0"))
        clean_price = re.sub(r"^Rs\.\s*", "", price_str).replace(",", "")
        price_val = (
            float(clean_price) if clean_price and clean_price[0].isdigit() else 0.0
        )
        qty = int(item.get("quantity", 1))
        calculated_total += price_val * qty

    # Add service fee (20%)
    calculated_total = calculated_total * 1.2

    # Allow 1% tolerance for rounding
    tolerance = calculated_total * 0.01
    is_valid = abs(calculated_total - expected_total) <= tolerance

    return is_valid, round(calculated_total, 2)


async def get_payment_status(razorpay_payment_id: str) -> dict:
    """Get actual payment status from Razorpay"""
    try:
        payment = razorpay_client.payment.fetch(razorpay_payment_id)
        return {
            "status": payment.get("status"),
            "amount": payment.get("amount") / 100,
            "currency": payment.get("currency"),
            "method": payment.get("method"),
            "created_at": payment.get("created_at"),
            "email": payment.get("email"),
            "contact": payment.get("contact"),
        }
    except Exception as e:
        return {"error": str(e)}


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    return user_helper(user)


async def get_current_user_optional(
    token: Optional[str] = Depends(
        OAuth2PasswordBearer(tokenUrl="token", auto_error=False)
    ),
):
    if token is None:
        return None
    try:
        return await get_current_user(token)
    except HTTPException:
        return None


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

    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_helper(user),
    }


@app.post("/token", response_model=dict)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(user["_id"])})
    refresh_token = create_refresh_token(data={"sub": str(user["_id"])})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@app.post("/refresh-token", response_model=dict)
async def refresh_access_token(request: dict):
    refresh_token = request.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token required")

    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
        new_access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


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
        new_donation["created_at"] = datetime.now()

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
                    # Explicitly create a clean CartItem-compatible dict
                    # This ensures only the requested quantity is stored, NOT the product's stock level
                    clean_item = {
                        "id": str(new_item.id),
                        "name": str(new_item.name),
                        "price": str(new_item.price),
                        "quantity": int(new_item.quantity),
                        "companyname": str(new_item.companyname),
                        "imageurl": str(new_item.imageurl),
                    }
                    await cart_collection.update_one(
                        {"user_id": cart.user_id}, {"$push": {"items": clean_item}}
                    )
        else:
            # Create new cart with cleaned items
            cleaned_items = []
            for item in cart.items:
                cleaned_items.append(
                    {
                        "id": str(item.id),
                        "name": str(item.name),
                        "price": str(item.price),
                        "quantity": int(item.quantity),
                        "companyname": str(item.companyname),
                        "imageurl": str(item.imageurl),
                    }
                )
            new_cart = {"user_id": cart.user_id, "items": cleaned_items}
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
            raise HTTPException(
                status_code=400, detail="user_id, item_id, and quantity are required"
            )

        if quantity <= 0:
            # Remove item if quantity is 0 or less
            result = await cart_collection.update_one(
                {"user_id": user_id}, {"$pull": {"items": {"id": item_id}}}
            )
        else:
            # Update to absolute quantity
            result = await cart_collection.update_one(
                {"user_id": user_id, "items.id": item_id},
                {"$set": {"items.$.quantity": quantity}},
            )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Cart or item not found")

        return {"message": "Quantity updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating quantity: {str(e)}"
        )


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
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
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
                    "payment_verified_at": datetime.now(),
                    "updated_at": datetime.now(),
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


@app.get("/payment/status/{razorpay_payment_id}")
async def get_payment_status_from_razorpay(razorpay_payment_id: str):
    """
    Get actual payment status from Razorpay API for reconciliation.
    """
    try:
        payment_status = await get_payment_status(razorpay_payment_id)
        if "error" in payment_status:
            raise HTTPException(status_code=400, detail=payment_status["error"])
        return payment_status
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get payment status: {str(e)}"
        )


# Checkout Endpoints
@app.post("/cart/checkout")
async def checkout(checkout_info: Checkout):
    """
    Initiate checkout process with idempotency and amount validation.
    """
    try:
        # Check idempotency
        if checkout_info.idempotency_key:
            exists, existing = await check_idempotency(checkout_info.idempotency_key)
            if exists and existing:
                return existing

        # Validate cart amount
        is_valid, calculated_total = await validate_cart_amount(
            checkout_info.user_id, checkout_info.total_payment
        )
        if not is_valid:
            error_msg = f"Amount mismatch. Expected: Rs.{calculated_total}, Received: Rs.{checkout_info.total_payment}"
            result = {
                "error": "validation_error",
                "message": error_msg,
                "calculated_total": calculated_total,
            }
            if checkout_info.idempotency_key:
                await store_idempotency_result(checkout_info.idempotency_key, result)
            raise HTTPException(status_code=400, detail=error_msg)

        # Find the cart for the user
        user_cart = await cart_collection.find_one({"user_id": checkout_info.user_id})

        if not user_cart:
            raise HTTPException(status_code=404, detail="Cart not found for the user")

        # Save cart items for checkout
        order_items = user_cart.get("items", [])
        total_price = calculated_total

        # Create checkout record with pending status
        checkout_doc = {
            "user_id": checkout_info.user_id,
            "items": order_items,
            "total_price": total_price,
            "status": "pending_payment",
            "payment_method": "razorpay",
            "idempotency_key": checkout_info.idempotency_key,
            "razorpay_order_id": None,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        checkout_result = await checkout_collection.insert_one(checkout_doc)
        checkout_id = str(checkout_result.inserted_id)

        response = {
            "message": "Checkout initiated successfully",
            "checkout_id": checkout_id,
            "total_price": total_price,
            "status": "pending_payment",
            "next_step": "Proceed to payment",
        }

        # Store idempotency result
        if checkout_info.idempotency_key:
            await store_idempotency_result(checkout_info.idempotency_key, response)

        return response

    except HTTPException:
        raise
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
                    "updated_at": datetime.now(),
                }
            },
        )

        # Clear the user's cart after successful payment
        user_id = checkout_order["user_id"]
        await cart_collection.delete_one({"user_id": user_id})

        # Update Eco-Impact
        # Simple calculation for demonstration:
        # CO2: 0.5kg per item, Water: 10L per item, Waste: 0.2kg per item, Trees: 0.01 per item
        num_items = sum(
            item.get("quantity", 1) for item in checkout_order.get("items", [])
        )
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
                    "trees_saved": trees_saved,
                },
                "$set": {"last_updated": datetime.now()},
                "$addToSet": {"badges": "Eco Shopper"},
            },
            upsert=True,
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


class InvoicePDF(FPDF):
    def header(self):
        # Logo or Title
        self.set_font("Arial", "B", 24)
        self.set_text_color(16, 185, 129)  # Emerald-500
        self.cell(0, 20, "REPURPOSE HUB", 0, 1, "C")
        self.set_font("Arial", "", 10)
        self.set_text_color(100, 116, 139)  # Slate-500
        self.cell(0, 5, "Luxury Upcycled Curation Studio", 0, 1, "C")
        self.ln(10)

    def footer(self):
        self.set_y(-30)
        self.set_font("Arial", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(
            0,
            10,
            "This is a digitally generated invoice. No signature required.",
            0,
            1,
            "C",
        )
        self.set_font("Arial", "B", 8)
        self.set_text_color(16, 185, 129)
        self.cell(0, 5, "Thank you for choosing sustainability!", 0, 0, "C")


@app.get("/orders/{order_id}/invoice")
async def get_invoice(order_id: str):
    """
    Generate and return a PDF invoice for a specific order
    """
    try:
        if not ObjectId.is_valid(order_id):
            raise HTTPException(status_code=400, detail="Invalid order ID")

        # Fetch order details
        order = await checkout_collection.find_one({"_id": ObjectId(order_id)})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Fetch user details
        user_info = await user_collection.find_one(
            {"_id": ObjectId(order.get("user_id"))}
        )
        user_info = user_info or {}

        # Fetch Eco Impact for this user
        impact = await eco_impact_collection.find_one({"user_id": order.get("user_id")})

        # Create PDF
        pdf = InvoicePDF()
        pdf.add_page()

        # Invoice Info
        pdf.set_font("Arial", "B", 14)
        pdf.set_text_color(30, 41, 59)  # Slate-900
        pdf.cell(0, 10, f"TAX INVOICE: #{str(order['_id'])[-8:].upper()}", 0, 1)

        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(71, 85, 105)  # Slate-600
        pdf.cell(0, 6, f"Date: {order['created_at'].strftime('%d %B, %Y')}", 0, 1)
        pdf.cell(
            0, 6, f"Status: {order['status'].replace('_', ' ').capitalize()}", 0, 1
        )
        pdf.ln(10)

        # Customer & Company Info
        y_top = pdf.get_y()
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(148, 163, 184)  # Slate-400
        pdf.cell(95, 8, "BILLED TO", 0, 0)
        pdf.cell(95, 8, "FROM", 0, 1)

        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(95, 6, user_info.get("full_name", "Valued Customer"), 0, 0)
        pdf.cell(95, 6, "Repurpose Hub Studio", 0, 1)

        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(95, 5, user_info.get("email", ""), 0, 0)
        pdf.cell(95, 5, "contact@repurposehub.com", 0, 1)
        pdf.ln(15)

        # Items Table Header
        pdf.set_fill_color(248, 250, 252)  # Slate-50
        pdf.set_font("Arial", "B", 10)
        pdf.cell(100, 12, " PRODUCT DESCRIPTION", 1, 0, "L", True)
        pdf.cell(30, 12, "QTY", 1, 0, "C", True)
        pdf.cell(30, 12, "PRICE", 1, 0, "C", True)
        pdf.cell(30, 12, "TOTAL", 1, 1, "C", True)

        # Items Table Rows
        pdf.set_font("Arial", "", 10)
        items = order.get("items", [])
        for item in items:
            # SAFETY: Always favor the captured 'quantity' from the checkout record
            # If quantity is unusually high (like 100), we ensure we aren't accidentally pulling 'stock'
            qty = int(item.get("quantity", 1))

            # If both are present and they match exactly 100, it's a legacy stock bug
            # but we assume the cart data is correct now.

            # Safer price parsing
            price_str = str(item.get("price", "0"))
            # Remove "Rs." and whitespace from start, then remove commas
            clean_price = re.sub(r"^Rs\.\s*", "", price_str)
            clean_price = clean_price.replace(",", "")
            price_val = (
                float(clean_price) if clean_price and clean_price[0].isdigit() else 0.0
            )
            total_val = price_val * qty

            pdf.cell(100, 12, f" {item['name'][:45]}...", 1)
            pdf.cell(30, 12, f"{qty}", 1, 0, "C")
            pdf.cell(30, 12, f"Rs. {price_val:,.2f}", 1, 0, "C")
            pdf.cell(30, 12, f"Rs. {total_val:,.2f}", 1, 1, "C")

        # Summary
        pdf.ln(5)
        # Use explicit variables for subtotal to avoid any confusion
        subtotal = 0
        for item in items:
            p_str = str(item.get("price", "0"))
            p_clean = re.sub(r"^Rs\.\s*", "", p_str).replace(",", "")
            p = float(p_clean) if p_clean and p_clean[0].isdigit() else 0.0
            q = int(item.get("quantity", 1))
            subtotal += p * q

        service_fee = subtotal * 0.2
        total_final = subtotal + service_fee

        pdf.set_x(120)
        pdf.cell(40, 10, "Subtotal:", 0, 0, "R")
        pdf.cell(30, 10, f"Rs. {subtotal:,.2f}", 0, 1, "R")
        pdf.set_x(120)
        pdf.cell(40, 10, "Service Fee (20%):", 0, 0, "R")
        pdf.cell(30, 10, f"Rs. {service_fee:,.2f}", 0, 1, "R")

        pdf.ln(2)
        pdf.set_x(110)
        pdf.set_fill_color(16, 185, 129)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(50, 14, " TOTAL AMOUNT CAPTURED", 0, 0, "R", True)
        pdf.cell(30, 14, f"Rs. {total_final:,.2f} ", 0, 1, "R", True)

        # Sustainability Report Block
        pdf.ln(20)
        pdf.set_text_color(30, 41, 59)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "BEYOND THE PURCHASE: YOUR SUSTAINABILITY IMPACT", 0, 1)
        pdf.set_draw_color(16, 185, 129)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(5)

        pdf.set_font("Arial", "", 10)
        pdf.set_text_color(71, 85, 105)

        # Current Order Impact
        num_items = sum(i.get("quantity", 1) for i in items)
        pdf.cell(
            0,
            8,
            f"This order alone diverted {num_items * 0.2:.2f}kg of waste and offset {num_items * 0.5:.2f}kg of CO2.",
            0,
            1,
        )

        if impact:
            pdf.ln(5)
            pdf.set_font("Arial", "B", 10)
            pdf.set_text_color(16, 185, 129)
            pdf.cell(0, 6, "YOUR TOTAL LIFETIME LEGACY:", 0, 1)
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(71, 85, 105)
            pdf.cell(
                0,
                6,
                f"* Total Carbon Offset: {impact.get('co2_saved', 0):.2f} kg",
                0,
                1,
            )
            pdf.cell(
                0,
                6,
                f"* Water Resources Saved: {impact.get('water_saved', 0):.2f} Liters",
                0,
                1,
            )
            pdf.cell(
                0,
                6,
                f"* Waste Diverted: {impact.get('waste_diverted', 0):.2f} kg",
                0,
                1,
            )

        # Return as PDF stream
        pdf_output = pdf.output(dest="S")
        if isinstance(pdf_output, str):
            pdf_output = pdf_output.encode("latin1", errors="replace")

        return Response(
            content=pdf_output,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Invoice_{order_id[-8:]}.pdf"
            },
        )

    except Exception as e:
        print(f"Invoice Error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate invoice: {str(e)}"
        )


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
            "last_updated": datetime.now(),
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
            {"user_id": prefs.user_id}, {"$set": prefs.dict()}, upsert=True
        )
        return {"message": "Style preferences saved successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error saving preferences: {str(e)}"
        )


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
        return {
            "message": "Product created successfully",
            "id": str(result.inserted_id),
        }
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
            {"_id": ObjectId(product_id)}, {"$set": product.dict()}
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
        total_orders = await checkout_collection.count_documents(
            {"status": "completed"}
        )

        # Calculate total revenue
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": None, "total_revenue": {"$sum": "$total_price"}}},
        ]
        revenue_result = await checkout_collection.aggregate(pipeline).to_list(length=1)
        total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0

        return {
            "total_products": total_products,
            "total_users": total_users,
            "total_orders": total_orders,
            "total_revenue": total_revenue,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching analytics: {str(e)}"
        )


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
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")
