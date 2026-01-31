#!/usr/bin/env python3
"""
Test script for admin endpoints
Run this to verify admin functionality is working
"""

import requests
import json
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@example.com"  # Replace with actual admin email
ADMIN_PASSWORD = "admin123"  # Replace with actual admin password


def test_admin_login():
    """Test admin login endpoint"""
    print("🔐 Testing admin login...")

    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            params={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful! Token received")
            return data.get("access_token")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        print(f"❌ Login error: {e}")
        return None


def test_admin_stats(token: str):
    """Test admin stats endpoint"""
    print("\n📊 Testing admin stats...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/stats", headers=headers)

        if response.status_code == 200:
            stats = response.json()
            print("✅ Stats retrieved successfully!")
            print(f"   Total Users: {stats.get('total_users', 0)}")
            print(f"   Total Products: {stats.get('total_products', 0)}")
            print(f"   Total Orders: {stats.get('total_orders', 0)}")
            print(f"   Total Donations: {stats.get('total_donations', 0)}")
            print(f"   Total Revenue: ${stats.get('total_revenue', 0):.2f}")
        else:
            print(f"❌ Stats failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Stats error: {e}")


def test_admin_users(token: str):
    """Test admin users endpoint"""
    print("\n👥 Testing admin users...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/users", headers=headers)

        if response.status_code == 200:
            users_data = response.json()
            print("✅ Users retrieved successfully!")
            print(f"   Total: {users_data.get('total', 0)} users")
            print(f"   Page: {users_data.get('page', 0)}")
            print(f"   Limit: {users_data.get('limit', 0)}")

            # Show first user if exists
            users = users_data.get("users", [])
            if users:
                first_user = users[0]
                print(
                    f"   First user: {first_user.get('email', 'N/A')} - {first_user.get('full_name', 'N/A')}"
                )
        else:
            print(f"❌ Users failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Users error: {e}")


def test_admin_products(token: str):
    """Test admin products endpoint"""
    print("\n🛍️ Testing admin products...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/products", headers=headers)

        if response.status_code == 200:
            products_data = response.json()
            print("✅ Products retrieved successfully!")
            print(f"   Total: {products_data.get('total', 0)} products")
        else:
            print(f"❌ Products failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Products error: {e}")


def test_admin_activities(token: str):
    """Test admin activities endpoint"""
    print("\n📋 Testing admin activities...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/activities", headers=headers)

        if response.status_code == 200:
            activities_data = response.json()
            print("✅ Activities retrieved successfully!")
            print(f"   Total: {activities_data.get('total', 0)} activities")

            # Show first activity if exists
            activities = activities_data.get("activities", [])
            if activities:
                first_activity = activities[0]
                print(
                    f"   First activity: {first_activity.get('action', 'N/A')} - {first_activity.get('resource_type', 'N/A')}"
                )
        else:
            print(f"❌ Activities failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ Activities error: {e}")


def test_system_metrics(token: str):
    """Test system metrics endpoint"""
    print("\n🖥️ Testing system metrics...")

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/admin/system/metrics", headers=headers)

        if response.status_code == 200:
            metrics = response.json()
            print("✅ System metrics retrieved successfully!")
            print(f"   CPU Usage: {metrics.get('cpu_usage', 0)}%")
            print(f"   Memory Usage: {metrics.get('memory_usage', 0)}%")
            print(f"   Disk Usage: {metrics.get('disk_usage', 0)}%")
            print(f"   Uptime: {metrics.get('uptime', 'N/A')}")
        else:
            print(f"❌ System metrics failed: {response.status_code} - {response.text}")

    except Exception as e:
        print(f"❌ System metrics error: {e}")


def main():
    """Run all admin tests"""
    print("🚀 Starting Admin Endpoint Tests")
    print("=" * 50)

    # Test login first
    token = test_admin_login()

    if not token:
        print("\n❌ Cannot proceed without valid admin token")
        return

    # Test all endpoints with admin token
    test_admin_stats(token)
    test_admin_users(token)
    test_admin_products(token)
    test_admin_activities(token)
    test_system_metrics(token)

    print("\n" + "=" * 50)
    print("✨ Admin endpoint tests completed!")


if __name__ == "__main__":
    main()
