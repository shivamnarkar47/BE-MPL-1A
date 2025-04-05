from typing import List
from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from models import Cart, Checkout, Donation, Login, ProductResponse, User
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
import datetime

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client.repurposeHub
user_collection = db.users


product_collection = db.products
tutorials_collection = db.tutorials
donations_collection = db.donations
cart_collection = db.cart
checkout_collection = db.checkout


def donation_helper(donation: dict) -> dict:
    donation["_id"] = str(donation["_id"])  # Convert ObjectId to string
    return donation


def cart_helper(cart: dict) -> dict:
    # print(cart)
    cart["_id"] = str(cart["_id"])  # Convert ObjectId to string
    return cart

def checkout_helper(checkout: dict) -> dict:
    checkout["_id"] = str(checkout["_id"])  # Convert ObjectId to string
    return checkout

# Helper function to convert BSON ObjectId to string
def product_helper(product) -> dict:
    return {
        "id": str(product["_id"]),
        "name": product["name"],
        "price": product["price"],
        "quantity": product["quantity"],
        "companyname": product["companyName"],
        "imageurl": product["imageurl"],
    }


def tutorial_helper(tutorial: dict) -> dict:
    tutorial["_id"] = str(tutorial["_id"])  # Convert ObjectId to string
    return tutorial


# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Helper function to hash passwords
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Helper function to convert BSON ObjectId to string
def user_helper(user) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user.get("full_name", ""),
        "role": user.get("role", "user"),  # Ensure default is set
    }


# Create a new user
@app.post("/createUser/")
async def create_user(user: User):
    # Check if the email already exists
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the user's password
    user_data = user.dict()
    user_data["password"] = hash_password(user.password)

    # Insert the user into the database
    result = await user_collection.insert_one(user_data)
    created_user = await user_collection.find_one({"_id": result.inserted_id})

    if created_user:
        return user_helper(created_user)

    raise HTTPException(status_code=400, detail="Failed to create user")


# Get user by ID
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
    # Find the user by email
    user = await user_collection.find_one({"email": login.email})
    if not user or not verify_password(login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Return user details without the password
    return user_helper(user)


@app.get("/allProducts/", response_model=list[ProductResponse])
async def get_all_products():
    products = await product_collection.find().to_list(
        100
    )  # Adjust the limit as needed
    return [product_helper(product) for product in products]


@app.get("/allTutorials/")
async def get_all_tutorials():
    try:
        tutorials_cursor = tutorials_collection.find({})
        tutorials_list = await tutorials_cursor.to_list(
            length=None
        )  # Fetch all tutorials
        return [tutorial_helper(tutorial) for tutorial in tutorials_list]
    except Exception as e:
        return HTTPException(status_code=400, detail={"Wrong", e})


# Get a specific product by ID
@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    if not ObjectId.is_valid(product_id):
        raise HTTPException(status_code=400, detail="Invalid product ID")

    product = await product_collection.find_one({"_id": ObjectId(product_id)})
    if product:
        return product_helper(product)

    raise HTTPException(status_code=404, detail="Product not found")


@app.post("/donations", status_code=201)
async def create_donation(donation: Donation):
    # Check if a donation with the same ID already exists
    existing_donation = await donations_collection.find_one({"id": donation.id})
    if existing_donation:
        raise HTTPException(
            status_code=400, detail="Donation with this ID already exists."
        )

    # Insert the donation into MongoDB
    new_donation = donation.dict()
    await donations_collection.insert_one(new_donation)
    return donation


# GET request to fetch all donations
@app.get("/donations", response_model=List[Donation])
async def get_all_donations():
    donations_cursor = donations_collection.find({})
    donations_list = await donations_cursor.to_list(length=None)  # Fetch all donations

    # Convert ObjectId to string for each donation
    donations = [donation_helper(donation) for donation in donations_list]
    return donations


@app.post("/cart/add")
async def add_to_cart(cart: Cart):
    try:
        # Check if cart already exists for the user
        existing_cart = await cart_collection.find_one({"user_id": cart.user_id})

        if existing_cart:
            # Iterate over the new items being added
            for new_item in cart.items:
                print(new_item)
                product_found = False
                for item in existing_cart["items"]:
                    if item["id"] == new_item.id:
                        # If the product already exists, update the quantity
                        await cart_collection.update_one(
                            {
                                "user_id": cart.user_id,
                                "items.id": new_item.id,
                            },
                            {"$inc": {"items.$.quantity": new_item.quantity}},
                        )
                        product_found = True
                        break
                    else:
                        break
                if not product_found:
                    # If the product doesn't exist in the cart, add it
                    await cart_collection.update_one(
                        {"user_id": cart.user_id},
                        {
                            "$push": {
                                "items": {
                                    "id": new_item.id,
                                    "quantity": new_item.quantity,
                                    "name": new_item.name,
                                    "price": new_item.price,
                                    "companyname": new_item.companyname,
                                    "imageurl": new_item.imageurl,
                                }
                            }
                        },
                    )
        else:
            # If no cart exists, create a new cart for the user
            new_cart = cart.dict()
            await cart_collection.insert_one(new_cart)

        return {"message": "Items added to cart successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")


@app.post("/cart/checkout")
async def checkout(checkout_info: Checkout):
    # Find the cart for the user
    user_cart = await cart_collection.find_one({"user_id": checkout_info.user_id})

    if not user_cart:
        raise HTTPException(status_code=404, detail="Cart not found for the user")

    # Save only the list of items rather than entire cart document
    order_items = user_cart.get("items", [])

    # Create an order
    total_price = checkout_info.total_payment
    checkout_doc = {
        "user_id": checkout_info.user_id,
        "items": order_items,
        "total_price": total_price,
        "status": "completed",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
        
    }

    checkout_id = await checkout_collection.insert_one(checkout_doc)

    # Clear the user's cart after checkout
    await cart_collection.delete_one({"user_id": checkout_info.user_id})

    return {
        "message": "Transaction successfully",
        "order_id": str(checkout_id.inserted_id),
        "total_price": total_price,
    }


@app.get("/cart/{user_id}")
async def get_cart(user_id: str):
    print(user_id)
    user_cursor = cart_collection.find({"user_id": user_id})
    cart_list = await user_cursor.to_list(length=None)  # Fetch all donations
    if not cart_list:
        raise HTTPException(status_code=404, detail="Cart not found")

    carts = [cart_helper(cart) for cart in cart_list]
    return carts

# 

@app.get("/orders/{user_id}")
async def get_orders(user_id: str):
    checkout_cursor =  checkout_collection.find({"user_id": user_id})
    checkout_list = await checkout_cursor.to_list(length=None)  # Fetch all donations
    if not checkout_list:
        raise HTTPException(status_code=404, detail="Orders not found")
    checkouts = [checkout_helper(checkout) for checkout in checkout_list]
    return checkouts
