"""Payment service - Razorpay integration."""
import razorpay
from config import RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
from typing import Dict, Any, Optional
import os

# Initialize client lazily
_razorpay_client: Optional[razorpay.Client] = None

def get_razorpay_client() -> razorpay.Client:
    """Get or create Razorpay client singleton."""
    global _razorpay_client
    if _razorpay_client is None:
        _razorpay_client = razorpay.Client(
            auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
        )
        _razorpay_client.set_app_details({
            "title": "FastAPI App",
            "version": "1.0"
        })
    return _razorpay_client


def create_order(amount: float, currency: str = "INR", receipt: Optional[str] = None) -> Dict[str, Any]:
    """Create a Razorpay order."""
    client = get_razorpay_client()
    return client.order.create({
        "amount": int(amount * 100),  # Razorpay expects amount in paisa
        "currency": currency,
        "receipt": receipt,
    })


def verify_payment_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify payment signature from Razorpay."""
    import hmac
    import hashlib
    from config import RAZORPAY_KEY_SECRET
    
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()
    
    return generated_signature == signature


def get_payment_status(payment_id: str) -> Dict[str, Any]:
    """Get payment status from Razorpay."""
    client = get_razorpay_client()
    try:
        payment = client.payment.fetch(payment_id)
        return {
            "status": payment.get("status"),
            "amount": payment.get("amount") / 100,
            "currency": payment.get("currency"),
            "method": payment.get("method"),
            "created_at": payment.get("created_at"),
            "email": payment.get("email"),
            "contact": payment.get("contact"),
        }
    except Exception as e:
        return {"error": str(e)}