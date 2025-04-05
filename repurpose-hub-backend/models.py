from pydantic import BaseModel, EmailStr, Field
from typing import List, Literal, Optional


class User(BaseModel):
    email: EmailStr
    password: str = Field(
        ..., min_length=8
    )  # Enforcing a minimum length of 8 characters
    full_name: Optional[str] = None
    role: Literal["admin", "user"] = "user"  # Default role is "user"


class Login(BaseModel):
    email: EmailStr
    password: str


class Product(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    price: str
    quantity: int
    companyname: str
    imageurl: str

class ProductResp(BaseModel):
    id: str
    name: str = Field(..., min_length=3, max_length=200)
    price: str
    quantity: int
    companyname: str
    imageurl: str



class ProductResponse(Product):
    id: str  # Field for returning the product ID in response


class Tutorial(BaseModel):
    yt_link: str
    img_src: str
    timing: str
    author: str
    title: str
    desc: str
    date_added: str


class ClothItem(BaseModel):
    id: int
    quantity: int
    clothType: str


class Donation(BaseModel):
    id: int
    items: List[ClothItem]
    user: str
    coins: int

class Cart(BaseModel):
    user_id: str
    items: List[ProductResp]


class Checkout(BaseModel):
    user_id: str
    total_payment: int
    # Add created_at and updated_at
    
    
