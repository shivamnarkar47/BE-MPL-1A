from typing import Optional
from fastapi import HTTPException, Depends
from fastapi import status as http_status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import User

from config import SECRET_KEY, ALGORITHM
from helpers import to_model

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=http_status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Import database connection from db.py
    from db import user_collection

    user_data = await user_collection.find_one({"_id": ObjectId(user_id)})

    if user_data is None:
        raise credentials_exception

    # Convert MongoDB document to User model using helper
    return to_model(user_data, User)


async def get_current_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get current authenticated admin user"""
    # Check if user is admin - handle missing fields gracefully
    is_admin = getattr(current_user, "is_admin", False) or getattr(
        current_user, "role", None
    ) in ["admin", "super_admin"]
    if not is_admin:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


def create_access_token(data: dict, expires_delta: Optional[int] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        to_encode.update({"exp": expires_delta})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
