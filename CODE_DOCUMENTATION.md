# Repurpose Hub - Code Documentation

## Project Overview

**Repurpose Hub** is a full-stack e-commerce platform for upcycled and repurposed products. It combines data scraping, ML-powered image classification, payment processing, and a modern React frontend to create a sustainable marketplace.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                  │
│                    repurpose-hub/src/components/               │
└─────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
        ┌───────────────────┐       ┌───────────────────┐
        │  Python Backend   │       │   Go Backend      │
        │  (FastAPI :8000)  │       │  (Fiber :8080)     │
        │ repurpose-ml       │       │  GoLang/          │
        │ (:8001) - ML API  │       └───────────────────┘
        └───────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
    MongoDB                 External APIs
    (:27017)                (Razorpay)
```

---

## Project Structure

```
BE-MPL-1A/
├── repurpose-hub/           # React + TypeScript frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── contexts/        # React contexts (Auth, Cart, Wishlist)
│   │   └── lib/             # Utilities
│   └── package.json
│
├── repurpose-hub-backend/   # Python FastAPI backend
│   ├── app.py              # Main API (1398 lines)
│   ├── models.py           # Pydantic models
│   ├── admin_routes.py     # Admin endpoints
│   ├── admin_auth.py       # Admin authentication
│   ├── admin_activity.py   # Activity logging
│   └── GoLang/             # Go Fiber backend (optional)
│
├── repurpose-ml/           # ML Image Classification API
│   └── app.py              # Vision Transformer model
│
└── data-scraper/           # Product data extraction
    └── main.py
```

---

## Most Important Code Segments

### 1. Payment Integration with Idempotency (`app.py:668-750`)

The payment flow uses Razorpay with idempotency keys to prevent duplicate charges:

```python
@app.post("/payment/create-order", response_model=OrderResponse)
async def create_razorpay_order(order_request: CreateOrderRequest):
    amount_in_paise = int(order_request.amount * 100)
    order_data = {
        "amount": amount_in_paise,
        "currency": order_request.currency,
        "receipt": f"receipt_{order_request.user_id}_",
        "notes": {"user_id": order_request.user_id},
        "payment_capture": 1,
    }
    order = razorpay_client.order.create(data=order_data)
    # Store in database...
```

### 2. Cart Amount Validation (`app.py:204-234`)

Critical security feature preventing price manipulation:

```python
async def validate_cart_amount(user_id: str, expected_total: float) -> tuple[bool, float]:
    user_cart = await cart_collection.find_one({"user_id": user_id})
    calculated_total = 0.0
    for item in user_cart["items"]:
        price_str = str(item.get("price", "0"))
        clean_price = re.sub(r"^Rs\.\s*", "", price_str).replace(",", "")
        price_val = float(clean_price) if clean_price and clean_price[0].isdigit() else 0.0
        qty = int(item.get("quantity", 1))
        calculated_total += price_val * qty
    
    calculated_total = calculated_total * 1.2  # 20% service fee
    tolerance = calculated_total * 0.01  # 1% rounding tolerance
    is_valid = abs(calculated_total - expected_total) <= tolerance
    return is_valid, round(calculated_total, 2)
```

### 3. JWT Authentication (`app.py:47-165`)

Complete JWT token management with access/refresh tokens:

```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id: str = payload.get("sub")
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    return user_helper(user)
```

### 4. Invoice PDF Generation (`app.py:972-1189`)

FPDF-based invoice with sustainability impact report:

```python
class InvoicePDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 24)
        self.set_text_color(16, 185, 129)  # Emerald
        self.cell(0, 20, "REPURPOSE HUB", 0, 1, "C")

@app.get("/orders/{order_id}/invoice")
async def get_invoice(order_id: str):
    # Fetches order, user, eco-impact data
    # Generates PDF with:
    # - Product table with quantities/prices
    # - Service fee (20%)
    # - Sustainability impact report (CO2, water, waste)
    # Returns PDF stream
```

### 5. ML Image Classification (`repurpose-ml/app.py:257-370`)

Vision Transformer model for detecting upcyclable objects:

```python
@app.post("/upcycle/")
async def upcycle(file: UploadFile = File(...), language: str = Form("en")):
    # Save and load image
    image = Image.open(file_path)
    
    # Model prediction
    inputs = image_processor(images=image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    top_k_indices = torch.topk(logits, k=5, dim=-1).indices.squeeze().tolist()
    
    # Map to upcycling ideas
    suggestions = []
    for obj in detected_objects:
        if obj in upcycling_ideas:
            text, img_name = upcycling_ideas[obj]
            suggestions.append(f"Object: {obj}\nIdea: {text}")
    
    # TTS audio generation
    tts = gTTS(text=tts_text, lang=lang)
    tts.save(tts_path)
```

### 6. Eco-Impact Tracking (`app.py:922-946`)

Tracks sustainability metrics per order:

```python
await eco_impact_collection.update_one(
    {"user_id": user_id},
    {
        "$inc": {
            "co2_saved": num_items * 0.5,
            "water_saved": num_items * 10.0,
            "waste_diverted": num_items * 0.2,
            "trees_saved": num_items * 0.01,
        },
        "$set": {"last_updated": datetime.now()},
        "$addToSet": {"badges": "Eco Shopper"},
    },
    upsert=True,
)
```

### 7. Admin Authentication (`admin_routes.py:22-87`)

Admin-only endpoints with activity logging:

```python
@router.post("/admin/login")
async def admin_login(email: str, password: str, request: Request):
    user_data = await db.users.find_one({"email": email})
    if not user_data or not user_data.get("is_admin", False):
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    # Log admin activity
    await log_activity(
        db, str(user.id), user.email,
        AdminActions.LOGIN, ResourceTypes.SYSTEM,
        request=request
    )

@router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_user: User = Depends(get_current_admin_user)):
    # Returns: total_users, total_products, total_orders, 
    #           total_donations, total_revenue, pending_orders, etc.
```

### 8. Checkout Flow with Idempotency (`app.py:801-955`)

Complete checkout with idempotency key support:

```python
@app.post("/cart/checkout")
async def checkout(checkout_info: Checkout):
    # 1. Check idempotency - prevent duplicate processing
    if checkout_info.idempotency_key:
        exists, existing = await check_idempotency(checkout_info.idempotency_key)
        if exists and existing:
            return existing
    
    # 2. Validate cart amount server-side
    is_valid, calculated_total = await validate_cart_amount(
        checkout_info.user_id, checkout_info.total_payment
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Amount mismatch")
    
    # 3. Create checkout record
    checkout_doc = {
        "user_id": checkout_info.user_id,
        "items": order_items,
        "total_price": total_price,
        "status": "pending_payment",
    }
    
    # 4. Store idempotency result
    if checkout_info.idempotency_key:
        await store_idempotency_result(checkout_info.idempotency_key, response)
```

### 9. Frontend Auth Context (`repurpose-hub/src/contexts/AuthContext.tsx`)

React context for authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
  
  const login = async (email: string, password: string) => {
    const response = await axios.post(`${BASE_URL}/login/`, { email, password });
    Cookies.set('token', response.data.access_token);
    setToken(response.data.access_token);
    setUser(response.data.user);
  };
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout, !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 10. Razorpay Payment Integration (Frontend)

```typescript
// In Cart.tsx or payment-dialog.tsx
import Razorpay from 'react-razorpay';

const handlePayment = async () => {
  // 1. Create order
  const orderRes = await axios.post(`${BASE_URL}/payment/create-order`, {
    amount: total,
    currency: 'INR',
    user_id: user.id
  });
  
  // 2. Initialize Razorpay
  const options = {
    key: RAZORPAY_KEY_ID,
    amount: orderRes.data.amount * 100,
    name: 'Repurpose Hub',
    order_id: orderRes.data.orderId,
    handler: async (response: any) => {
      // 3. Verify payment
      await axios.post(`${BASE_URL}/payment/verify-payment`, {
        orderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature
      });
    }
  };
  
  const razorpay = new Razorpay(options);
  razorpay.open();
};
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/createUser/` | Register new user |
| POST | `/login/` | Login (returns JWT) |
| POST | `/token` | OAuth2 token endpoint |
| POST | `/refresh-token` | Refresh access token |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/allProducts/` | List all products |
| GET | `/products/{id}` | Get single product |
| POST | `/admin/products` | Create product (admin) |
| PUT | `/admin/products/{id}` | Update product (admin) |
| DELETE | `/admin/products/{id}` | Delete product (admin) |

### Cart & Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cart/add` | Add to cart |
| GET | `/cart/{user_id}` | Get cart |
| DELETE | `/cart/remove-item` | Remove item |
| POST | `/cart/checkout` | Initiate checkout |
| POST | `/cart/complete-checkout` | Complete order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payment/create-order` | Create Razorpay order |
| POST | `/payment/verify-payment` | Verify payment signature |
| GET | `/payment/order-status/{id}` | Get order status |
| GET | `/orders/{order_id}/invoice` | Download PDF invoice |

### Eco-Impact
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/eco-impact/{user_id}` | Get user's sustainability impact |
| GET | `/community-impact` | Get aggregate community impact |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/login` | Admin login |
| GET | `/admin/stats` | Dashboard statistics |
| GET | `/admin/users` | List users (paginated) |
| GET | `/admin/orders` | List orders |
| GET | `/admin/activities` | Activity logs |
| GET | `/admin/system/metrics` | System metrics |

### ML Service (Port 8001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upcycle/` | Image classification + upcycling suggestions |

---

## Data Models

### User
```python
{
    "id": "ObjectId",
    "email": str,
    "password": str (hashed),
    "full_name": str,
    "role": "user" | "admin",
    "is_admin": bool,
    "created_at": datetime
}
```

### Product
```python
{
    "id": "ObjectId",
    "name": str,
    "price": str,
    "stock": int,
    "companyname": str,
    "image_url": str
}
```

### EcoImpact
```python
{
    "user_id": str,
    "co2_saved": float,      # kg
    "water_saved": float,    # liters
    "waste_diverted": float, # kg
    "trees_saved": float,
    "badges": [str],
    "last_updated": datetime
}
```

---

## Key Security Features

1. **Password Hashing**: Argon2 via `passlib.context.CryptContext`
2. **JWT Authentication**: Access + Refresh tokens with expiration
3. **Amount Validation**: Server-side cart total calculation prevents price manipulation
4. **Payment Idempotency**: Keys expire after 30 minutes to prevent duplicate charges
5. **Admin Authorization**: Admin-only routes with dependency injection
6. **CORS Protection**: Configured allowed origins

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| UI Components | Radix UI, Lucide Icons, Framer Motion |
| Backend | Python FastAPI, Motor (MongoDB async) |
| ML | PyTorch, Transformers (ViT), gTTS |
| Payments | Razorpay API |
| Database | MongoDB |
| Auth | JWT (jose library) |
| PDF | FPDF |

---

## Running the Project

```bash
# 1. Start MongoDB
mongod

# 2. Backend (Port 8000)
cd repurpose-hub-backend
uvicorn app:app --reload

# 3. ML Service (Port 8001)
cd repurpose-ml
uvicorn app:app --port 8001

# 4. Frontend
cd repurpose-hub
npm run dev
```

---

## Database Collections

- `users` - User accounts
- `products` - Product catalog
- `cart` - User shopping carts
- `wishlist` - User wishlists
- `checkout` - Order records
- `orders` - Razorpay order records
- `donations` - Cloth donations
- `eco_impact` - Sustainability metrics
- `style_preferences` - User style quiz results
- `idempotency` - Payment idempotency keys
- `activity_logs` - Admin activity tracking

---

*Generated on: April 2026*
