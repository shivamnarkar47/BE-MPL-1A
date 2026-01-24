import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentDialog } from "./payment-dialog";
import { requestUrl } from "@/lib/requestUrl";
import { user } from "@/lib/getUser";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { RefreshCw, ShoppingCart, Trash2, Package, CreditCard, ArrowRight } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  companyname: string;
  imageurl: string;
  stock: number;
}

interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
}

interface OrderItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  status?: string;
}

interface Order {
  id: string;
  _id: string;
  user_id: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<Cart[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const fetchCart = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    } else if (isLoading) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `cart/${user?.id}`,
      });
      console.log("Cart data:", response.data);

      if (!response.data || response.data.length === 0) {
        setCartItems([]);
        return;
      }

      const transformedCart = response.data.map((cart: Cart) => ({
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
          quantity: 1,
          stock: 100,
        })),
      }));

      setCartItems(transformedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items. Please try refreshing.");
      setCartItems([]);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      } else if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `orders/${user?.id}`,
      });
      console.log("Orders data:", response.data);
      setPastOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCart();
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isPaymentDialogOpen) {
      const timer = setTimeout(() => {
        fetchCart();
        fetchOrders();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isPaymentDialogOpen]);

  function calculateCartTotal(cartItems: CartItem[]): number {
    if (!cartItems || cartItems.length === 0) return 0;

    let total = 0;

    for (const item of cartItems) {
      const numericPrice = parseFloat(
        item.price.replace("Rs.", "").replace(/,/g, "").trim(),
      );
      const itemTotal = numericPrice * 1;
      total += itemTotal;
    }

    return total;
  }

  const handleRefreshCart = () => {
    fetchCart(true);
  };

  const getTotalAmount = (): number => {
    if (cartItems.length === 0 || !cartItems[0]?.items) return 0;

    const subtotal = calculateCartTotal(cartItems[0].items);
    const serviceFee = subtotal * 0.2;
    return subtotal + serviceFee;
  };

  const total = getTotalAmount();

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user?.id) {
        setError("User not found. Please log in again.");
        return;
      }

      setRemovingItems(prev => new Set(prev).add(itemId));

      await requestUrl({
        method: "DELETE",
        endpoint: `cart/remove-item`,
        data: {
          user_id: user.id,
          item_id: itemId,
        },
      });

      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item. Please try again.");
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
              <p className="text-sm text-slate-600 mt-1">
                {user ? `Welcome back, ${user.email || user.id}` : "Please log in to continue"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCart}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw
              className={`w-4 h-4 ${(isRefreshing || isLoading) ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : isLoading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-full">
                  <RefreshCw className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setError(null);
                      fetchCart(true);
                    }}
                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!user ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Login Required</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Please log in to view and manage your shopping cart
              </p>
              <Button onClick={() => window.location.href = '/login'} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600">Loading your cart...</p>
            </CardContent>
          </Card>
        ) : cartItems.length === 0 ? (
          <Card className="text-center py-12 bg-gradient-to-r from-slate-50 to-slate-100">
            <CardContent>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Your cart is empty</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Looks like you haven't added any items yet. Start shopping to fill it up!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.href = '/'} className="bg-primary hover:bg-primary/90">
                  Start Shopping
                </Button>
                <Button variant="outline" onClick={handleRefreshCart} disabled={isRefreshing}>
                  {isRefreshing ? "Checking..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-sm border-0 bg-white">
                  <CardHeader className="pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Cart Items</CardTitle>
                      <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {cartItems[0]?.items?.length || 0} items
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      {cartItems.map((cart) =>
                        cart?.items?.length > 0 ? (
                          <div className="divide-y">
                            {cart.items.map((item) => (
                              <div
                                key={item.id}
                                className="p-6 hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex gap-4">
                                  <div className="relative group">
                                    <img
                                      src={item.imageurl}
                                      alt={item.name}
                                      className="w-20 h-20 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                                    />
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                      <Package className="w-3 h-3 text-white" />
                                    </div>
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 mb-1">{item.name}</h3>
                                    <p className="text-sm text-slate-600 mb-2">{item.companyname}</p>
                                    
                                    <div className="flex items-center gap-4">
                                      <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                        ✓ In Stock ({item.stock} available)
                                      </span>
                                      <div className="flex items-center gap-1 text-sm text-slate-600">
                                        <span>Qty:</span>
                                        <span className="font-semibold">1</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className="mb-3">
                                      <p className="text-2xl font-bold text-slate-900">
                                        Rs.{" "}
                                        {parseFloat(
                                          item.price.replace("Rs.", "").replace(/,/g, ""),
                                        ).toFixed(2)}
                                      </p>
                                    </div>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeFromCart(item.id)}
                                      disabled={removingItems.has(item.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    >
                                      {removingItems.has(item.id) ? (
                                        <>
                                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                          Removing
                                        </>
                                      ) : (
                                        <>
                                          <Trash2 className="w-3 h-3 mr-1" />
                                          Remove
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center">
                            <p className="text-slate-600">No items in cart</p>
                          </div>
                        ),
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <Card className="shadow-sm border-0 bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cartItems[0]?.items && cartItems[0].items.length > 0 && (
                        <>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Subtotal</span>
                              <span className="font-medium">
                                Rs. {calculateCartTotal(cartItems[0].items).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Service Fee (20%)</span>
                              <span className="font-medium">
                                Rs. {(calculateCartTotal(cartItems[0].items) * 0.2).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="font-semibold text-lg">Total</span>
                            <span className="font-bold text-xl text-primary">Rs. {total.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button
                        size="lg"
                        disabled={cartItems.length === 0 || cartItems[0]?.items?.length === 0}
                        onClick={() => setIsPaymentDialogOpen(true)}
                        className="w-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-shadow"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <p className="text-xs text-slate-500 text-center mt-3 w-full">
                        Secure checkout powered by Razorpay
                      </p>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}

        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          total={total}
        />

        {cartItems.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-slate-600" />
              <h2 className="text-2xl font-bold text-slate-900">Order History</h2>
            </div>
            
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {pastOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders yet</h3>
                      <p className="text-slate-600">Your order history will appear here once you make a purchase.</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {pastOrders.map((order) => (
                        <div key={order._id || order.id} className="p-6 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : order.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {order.status || 'Processing'}
                              </div>
                              <span className="text-sm text-slate-600">
                                {new Date(order.created_at).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">
                                Order #{order._id?.slice(-8) || order.id?.slice(-8)}
                              </p>
                              <p className="text-sm text-slate-600">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid gap-3 mb-4">
                            {order.items?.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center">
                                    <Package className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm text-slate-900">{item.name}</p>
                                    <p className="text-xs text-slate-600">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="text-sm font-medium text-slate-900">{item.price}</p>
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <p className="text-sm text-slate-600 text-center">
                                +{order.items.length - 3} more items
                              </p>
                            )}
                          </div>
                          
                          <Separator className="my-4" />
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-slate-600">Total Amount</p>
                              <p className="text-xl font-bold text-slate-900">
                                Rs. {order.total_price?.toFixed(2) || '0.00'}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </div>
  );
}