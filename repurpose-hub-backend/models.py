from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# User Models
class User(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "user"


class Login(BaseModel):
    email: str
    password: str


# Product Models
class ProductResponse(BaseModel):
    id: str
    name: str
    price: str
    quantity: int
    companyname: str
    imageurl: str


class ProductCreate(BaseModel):
    name: str
    price: str
    quantity: int
    companyName: str
    image_url: str


class CartItem(BaseModel):
    id: str
    quantity: int
    name: str
    price: str
    companyname: str
    imageurl: str


class Cart(BaseModel):
    user_id: str
    items: List[CartItem]


# Wishlist Models
class WishlistItem(BaseModel):
    id: str
    name: str
    price: str
    companyname: str
    imageurl: str
    rating: Optional[int] = 4
    stock: Optional[int] = 100


class Wishlist(BaseModel):
    user_id: str
    items: List[WishlistItem]


# Checkout Models
class Checkout(BaseModel):
    user_id: str
    total_payment: float


# Donation Models
class Donation(BaseModel):
    id: str
    amount: float
    donor_name: str
    message: Optional[str] = None
    created_at: Optional[datetime] = None


# Razorpay Payment Models
class CreateOrderRequest(BaseModel):
    amount: float
    currency: str = "INR"
    user_id: str


class VerifyPaymentRequest(BaseModel):
    orderId: str
    razorpayPaymentId: str
    razorpaySignature: str


class OrderResponse(BaseModel):
    orderId: str


class VerifyPaymentResponse(BaseModel):
    success: bool
    message: str


class CompleteCheckoutRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str


class EcoImpact(BaseModel):
    user_id: str
    co2_saved: float  # in kg
    water_saved: float  # in liters
    waste_diverted: float  # in kg
    trees_saved: float
    badges: List[str] = []
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class StylePreferences(BaseModel):
    user_id: str
    style: str
    goal: str
    color: str
    interest: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)
