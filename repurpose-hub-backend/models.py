from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


# User Models
class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "user"
    is_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    profile_image: Optional[str] = None

    @property
    def is_admin_user(self) -> bool:
        """Check if user is admin based on role or is_admin flag"""
        return self.is_admin or self.role in ["admin", "super_admin"]

    class Config:
        json_encoders = {ObjectId: str}


class Login(BaseModel):
    email: str
    password: str


# Product Models
class ProductResponse(BaseModel):
    id: str
    name: str
    price: str
    stock: int
    companyname: str
    imageurl: str


class ProductCreate(BaseModel):
    name: str
    price: str
    stock: int
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
    idempotency_key: Optional[str] = None


# Donation Models
class ClothItem(BaseModel):
    id: int
    quantity: int
    clothType: str


class Donation(BaseModel):
    id: str
    items: List[ClothItem]
    user: str
    coins: int
    status: Optional[str] = "Processing"
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


# Admin Models
class AdminUser(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime


class ActivityLog(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(ObjectId()))
    admin_id: str
    admin_email: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Optional[dict]
    ip_address: Optional[str]
    user_agent: Optional[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}


class AdminStats(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_donations: int
    total_revenue: float
    pending_orders: int
    processing_donations: int
    new_users_today: int
    revenue_today: float


class SystemMetrics(BaseModel):
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    active_users: int
    api_requests_today: int
    error_rate: float
    uptime: str
