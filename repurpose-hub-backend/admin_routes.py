from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi import status as http_status
from typing import List, Optional
from datetime import datetime, timedelta
from pymongo import MongoClient
from bson import ObjectId
import motor.motor_asyncio

from models import User, AdminStats, ActivityLog, SystemMetrics
from admin_auth import get_current_admin_user, create_access_token
from admin_activity import log_activity, AdminActions, ResourceTypes

router = APIRouter(prefix="/admin", tags=["admin"])

# MongoDB connection - use same database as main app
from motor.motor_asyncio import AsyncIOMotorClient

motor_client = AsyncIOMotorClient("mongodb://localhost:27017")
db = motor_client["repurpose-hub"]


@router.get("/me")
async def get_admin_me(current_user: User = Depends(get_current_admin_user)):
    """Get current admin user info"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": getattr(current_user, "role", "unknown"),
        "is_admin": getattr(current_user, "is_admin", False),
    }


@router.post("/login")
async def admin_login(email: str, password: str, request: Request):
    """Admin login endpoint"""
    try:
        # Find user in database
        user_data = await db.users.find_one({"email": email})

        if not user_data or not user_data.get("is_admin", False):
            raise HTTPException(
                status_code=http_status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin credentials",
            )

        # In production, verify password hash
        # Convert MongoDB _id to id for User model
        if "_id" in user_data:
            user_data["id"] = str(user_data["_id"])
            del user_data["_id"]

        user = User(**user_data)

        # Create JWT token
        access_token = create_access_token(data={"sub": user.id})

        # Log admin login
        await log_activity(
            db,
            str(user.id) if user.id else "unknown",
            user.email,
            AdminActions.LOGIN,
            ResourceTypes.SYSTEM,
            request=request,
        )

        # Update last login
        await db.users.update_one(
            {"_id": ObjectId(user.id)}, {"$set": {"last_login": datetime.utcnow()}}
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}",
        )


@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(current_user: User = Depends(get_current_admin_user)):
    """Get dashboard statistics"""
    try:
        # Get counts from all collections
        total_users = await db.users.count_documents({})
        total_products = await db.products.count_documents({})
        total_orders = await db.checkout.count_documents({})
        total_donations = await db.donations.count_documents({})

        # Get pending orders and processing donations
        pending_orders = await db.checkout.count_documents({"status": "pending"})
        processing_donations = await db.donations.count_documents(
            {"status": "Processing"}
        )

        # Get today's new users
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = await db.users.count_documents(
            {"created_at": {"$gte": today}}
        )

        # Calculate total revenue from completed orders
        completed_orders_cursor = db.checkout.find({"status": "completed"})
        completed_orders = []
        async for order in completed_orders_cursor:
            completed_orders.append(order)

        total_revenue = sum(order.get("total_price", 0) for order in completed_orders)

        # Get today's revenue
        revenue_today = sum(
            order.get("total_price", 0)
            for order in completed_orders
            if order.get("created_at", datetime.min) >= today
        )

        return AdminStats(
            total_users=total_users,
            total_products=total_products,
            total_orders=total_orders,
            total_donations=total_donations,
            total_revenue=total_revenue,
            pending_orders=pending_orders,
            processing_donations=processing_donations,
            new_users_today=new_users_today,
            revenue_today=revenue_today,
        )

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}",
        )


@router.get("/users")
async def get_users(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    role: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Get all users with pagination and filtering"""
    try:
        skip = (page - 1) * limit

        # Build filter
        filter_dict = {}
        if search:
            filter_dict["$or"] = [
                {"email": {"$regex": search, "$options": "i"}},
                {"full_name": {"$regex": search, "$options": "i"}},
            ]
        if role:
            filter_dict["role"] = role

        # Get users
        cursor = (
            db.users.find(filter_dict).skip(skip).limit(limit).sort("created_at", -1)
        )
        users = []

        async for user_data in cursor:
            user_data["id"] = str(user_data.pop("_id"))
            users.append(user_data)

        # Get total count
        total = await db.users.count_documents(filter_dict)

        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get users: {str(e)}",
        )


@router.get("/users/{user_id}")
async def get_user(user_id: str, current_user: User = Depends(get_current_admin_user)):
    """Get specific user details"""
    try:
        user_data = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        user_data["id"] = str(user_data.pop("_id"))
        return user_data

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user: {str(e)}",
        )


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: dict,
    current_user: User = Depends(get_current_admin_user),
):
    """Update user details"""
    try:
        # Remove fields that shouldn't be updated directly
        user_update.pop("id", None)
        user_update.pop("_id", None)

        result = await db.users.update_one(
            {"_id": ObjectId(user_id)}, {"$set": user_update}
        )

        if result.matched_count == 0:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Log activity
        await log_activity(
            db,
            str(current_user.id) if current_user.id else user_id,
            current_user.email,
            AdminActions.UPDATE,
            ResourceTypes.USER,
            user_id,
            user_update,
        )

        return {"message": "User updated successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}",
        )


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str, current_user: User = Depends(get_current_admin_user)
):
    """Delete user"""
    try:
        result = await db.users.delete_one({"_id": ObjectId(user_id)})

        if result.deleted_count == 0:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Log activity
        await log_activity(
            db,
            str(current_user.id) if current_user.id else "unknown",
            current_user.email,
            AdminActions.DELETE,
            ResourceTypes.USER,
            user_id,
        )

        return {"message": "User deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}",
        )


@router.get("/products")
async def get_products(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Get all products with pagination and filtering"""
    try:
        skip = (page - 1) * limit

        # Build filter
        filter_dict = {}
        if search:
            filter_dict["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"companyname": {"$regex": search, "$options": "i"}},
            ]

        # Get products
        cursor = db.products.find(filter_dict).skip(skip).limit(limit)
        products = []

        async for product_data in cursor:
            product_data["id"] = str(product_data.pop("_id"))
            products.append(product_data)

        # Get total count
        total = await db.products.count_documents(filter_dict)

        return {
            "products": products,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get products: {str(e)}",
        )


@router.get("/orders")
async def get_orders(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Get all orders with pagination and filtering"""
    try:
        skip = (page - 1) * limit

        # Build filter
        filter_dict = {}
        if status:
            filter_dict["status"] = status

        # Get orders
        cursor = (
            db.checkout.find(filter_dict).skip(skip).limit(limit).sort("created_at", -1)
        )
        orders = []

        async for order_data in cursor:
            order_data["id"] = str(order_data.pop("_id"))
            orders.append(order_data)

        # Get total count
        total = await db.checkout.count_documents(filter_dict)

        return {
            "orders": orders,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get orders: {str(e)}",
        )


@router.get("/donations")
async def get_donations(
    page: int = 1,
    limit: int = 20,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Get all donations with pagination and filtering"""
    try:
        skip = (page - 1) * limit

        # Build filter
        filter_dict = {}
        if status:
            filter_dict["status"] = status

        # Get donations
        cursor = (
            db.donations.find(filter_dict)
            .skip(skip)
            .limit(limit)
            .sort("created_at", -1)
        )
        donations = []

        async for donation_data in cursor:
            donation_data["id"] = str(donation_data.pop("_id"))
            donations.append(donation_data)

        # Get total count
        total = await db.donations.count_documents(filter_dict)

        return {
            "donations": donations,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get donations: {str(e)}",
        )


@router.get("/activities")
async def get_activities(
    page: int = 1,
    limit: int = 50,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    current_user: User = Depends(get_current_admin_user),
):
    """Get admin activity logs"""
    try:
        skip = (page - 1) * limit

        # Build filter
        filter_dict = {}
        if action:
            filter_dict["action"] = action
        if resource_type:
            filter_dict["resource_type"] = resource_type

        # Get activities
        cursor = (
            db.activity_logs.find(filter_dict)
            .skip(skip)
            .limit(limit)
            .sort("timestamp", -1)
        )
        activities = []

        async for activity_data in cursor:
            activity_data["id"] = str(activity_data.pop("_id"))
            activities.append(activity_data)

        # Get total count
        total = await db.activity_logs.count_documents(filter_dict)

        return {
            "activities": activities,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit,
        }

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get activities: {str(e)}",
        )


@router.get("/system/metrics", response_model=SystemMetrics)
async def get_system_metrics(current_user: User = Depends(get_current_admin_user)):
    """Get system metrics"""
    try:
        # Mock system metrics - in production, use actual system monitoring
        import psutil
        import time

        return SystemMetrics(
            cpu_usage=psutil.cpu_percent(),
            memory_usage=psutil.virtual_memory().percent,
            disk_usage=psutil.disk_usage("/").percent,
            active_users=0,  # Track active sessions
            api_requests_today=0,  # Track API requests
            error_rate=0.0,  # Track error rate
            uptime=str(timedelta(seconds=int(time.time() - psutil.boot_time()))),
        )

    except ImportError:
        # Fallback if psutil not installed
        return SystemMetrics(
            cpu_usage=0.0,
            memory_usage=0.0,
            disk_usage=0.0,
            active_users=0,
            api_requests_today=0,
            error_rate=0.0,
            uptime="Unknown",
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get system metrics: {str(e)}",
        )
