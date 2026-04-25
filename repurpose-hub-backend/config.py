"""Shared configuration for the application."""
import os

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Razorpay Configuration
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_RZmsXRdoSG9Eu4")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "L2ogP0mVvA0wSAGdweRJlupr")

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""),
]