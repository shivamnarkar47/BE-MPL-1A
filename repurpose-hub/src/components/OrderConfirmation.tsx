import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CheckCircle, Package, Mail, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [orderNumber] = useState(() => 
    `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  );

  // Generate random order details for demo
  const [orderDetails] = useState(() => ({
    items: 3,
    total: 7650,
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }));

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
            <p className="text-muted-foreground">
              Your order has been placed successfully.
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-green-800 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <Package className="mx-auto h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm font-medium">Items Ordered</p>
              <p className="text-lg font-bold">{orderDetails.items} items</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Mail className="mx-auto h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm font-medium">Confirmation</p>
              <p className="text-lg font-bold">Email Sent</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <MapPin className="mx-auto h-8 w-8 text-orange-600 mb-2" />
              <p className="text-sm font-medium">Estimated Delivery</p>
              <p className="text-lg font-bold">{orderDetails.estimatedDelivery}</p>
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Order Total</p>
            <p className="text-3xl font-bold text-green-600">
              Rs. {orderDetails.total.toFixed(2)}
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate("/home")}
              className="w-full"
            >
              Continue Shopping
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            A confirmation email has been sent to your registered email address.
            You can track your order status in your account dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}