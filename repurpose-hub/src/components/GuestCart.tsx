import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Trash2, ShoppingBag, UserPlus } from "lucide-react";
import { useGuestCart } from "@/contexts/GuestCartContext";
import { Link, useNavigate } from "react-router-dom";

export default function GuestCart() {
  const { guestCartItems, guestCartTotal, removeFromGuestCart, updateGuestCartQuantity, clearGuestCart } = useGuestCart();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const calculateTotal = () => {
    const subtotal = guestCartTotal;
    const serviceFee = subtotal * 0.2;
    return subtotal + serviceFee;
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    navigate("/guest-checkout");
  };

  if (guestCartItems.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some upcycled products to your cart to get started!
            </p>
            <Link to="/">
              <Button>Start Shopping</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Sign up prompt */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <UserPlus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Create an account</h3>
                  <p className="text-sm text-muted-foreground">
                    Sign up to save your cart, track orders, and get personalized recommendations
                  </p>
                </div>
              </div>
              <Link to="/register">
                <Button variant="outline">Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total = calculateTotal();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearGuestCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Cart Items ({guestCartItems.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {guestCartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center mb-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.imageurl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.companyname}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-green-600">
                          In stock: {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      Rs. {parseFloat(item.price.replace("Rs.", "").replace(/,/g, "")).toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGuestCartQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateGuestCartQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        +
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeFromGuestCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({guestCartItems.length} items)</span>
                  <span>Rs. {guestCartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Service Fee (20%)</span>
                  <span>Rs. {(guestCartTotal * 0.2).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={handleCheckout}
                className="w-full"
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </Button>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Sign up for faster checkout */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserPlus className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Create an account</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Sign up to save your cart, track orders, and get exclusive offers
              </p>
              <Link to="/register" className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Sign Up Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Security info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              🔒 Secure checkout powered by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}