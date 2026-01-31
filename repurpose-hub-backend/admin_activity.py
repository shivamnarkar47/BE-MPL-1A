from typing import Optional, Dict, Any
from fastapi import Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from models import ActivityLog
import json


async def log_activity(
    db: AsyncIOMotorDatabase,
    admin_id: str,
    admin_email: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    request: Optional[Request] = None,
):
    """Log admin activity to database"""

    # Extract client information if request is available
    ip_address = None
    user_agent = None

    if request:
        # Get client IP (considering proxy headers)
        if request.client:
            ip_address = request.client.host
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            ip_address = forwarded_for.split(",")[0].strip()

        user_agent = request.headers.get("user-agent")

    # Create activity log entry
    activity = ActivityLog(
        admin_id=admin_id,
        admin_email=admin_email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
        timestamp=datetime.utcnow(),
    )

    # Convert to dict and insert into database
    activity_dict = activity.dict(exclude_unset=True)
    if "id" in activity_dict:
        activity_dict["_id"] = activity_dict.pop("id")

    await db.activity_logs.insert_one(activity_dict)


async def get_admin_activities(
    db: AsyncIOMotorDatabase,
    admin_id: Optional[str] = None,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list:
    """Get admin activity logs with filtering"""

    # Build filter
    filter_dict = {}
    if admin_id:
        filter_dict["admin_id"] = admin_id
    if action:
        filter_dict["action"] = action
    if resource_type:
        filter_dict["resource_type"] = resource_type

    # Query with pagination
    cursor = (
        db.activity_logs.find(filter_dict)
        .sort("timestamp", -1)
        .skip(offset)
        .limit(limit)
    )

    activities = []
    async for document in cursor:
        # Convert ObjectId to string
        if "_id" in document:
            document["id"] = str(document["_id"])
            del document["_id"]
        activities.append(document)

    return activities


# Common activity actions for consistency
class AdminActions:
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    APPROVE = "approve"
    REJECT = "reject"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    BULK_UPDATE = "bulk_update"
    BULK_DELETE = "bulk_delete"


# Resource types for logging
class ResourceTypes:
    USER = "user"
    PRODUCT = "product"
    ORDER = "order"
    DONATION = "donation"
    PARTNER = "partner"
    CONTENT = "content"
    ANALYTICS = "analytics"
    SYSTEM = "system"
