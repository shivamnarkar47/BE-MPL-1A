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
