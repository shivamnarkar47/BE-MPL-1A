import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Mail, Phone, MapPin, CreditCard, ShoppingBag, ArrowLeft } from "lucide-react";
import { useGuestCart } from "@/contexts/GuestCartContext";
import { useNavigate } from "react-router-dom";

interface GuestCheckoutProps {
  onBack?: () => void;
  onComplete?: () => void;
}

export default function GuestCheckout({ onBack, onComplete }: GuestCheckoutProps = {}) {
  const { guestCartItems, guestCartTotal, clearGuestCart } = useGuestCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const subtotal = guestCartTotal;
    const serviceFee = subtotal * 0.2;
    return subtotal + serviceFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city || 
        !formData.state || !formData.pincode) {
      setError("Please fill in all required fields");
      setIsProcessing(false);
      return;
    }

    // Simulate payment processing
    try {
      // In a real app, this would integrate with Razorpay or another payment provider
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success - clear cart and complete checkout
      clearGuestCart();
      onComplete?.();
      navigate("/order-confirmation");
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (guestCartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={onBack}>Continue Shopping</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4 flex items-center gap-2">
        <ArrowLeft size={20} />
        Back to Cart
      </Button>

      <h1 className="text-2xl font-bold mb-6">Guest Checkout</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Maharashtra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">PIN Code *</Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {guestCartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageurl}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    Rs. {parseFloat(item.price.replace("Rs.", "").replace(/,/g, "")).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs. {guestCartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Service Fee (20%)</span>
                <span>Rs. {(guestCartTotal * 0.2).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      type="password"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                className="w-full" 
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : `Pay Rs. ${total.toFixed(2)}`}
              </Button>
            </CardFooter>
          </Card>

          <p className="text-xs text-muted-foreground text-center">
            By completing this purchase, you agree to our Terms of Service and Privacy Policy.
            An account will be created for you automatically.
          </p>
        </div>
      </div>
    </div>
  );
}