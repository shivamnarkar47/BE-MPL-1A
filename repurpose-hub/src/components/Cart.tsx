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
import { Separator } from "@radix-ui/react-dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { RefreshCw } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  companyname: string;
  imageurl: string;
  stock: number; // Added stock field
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

  const fetchCart = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `cart/${user?.id}`,
      });
      console.log("Cart data:", response.data);

      // Transform cart items to ensure quantity is 1 and add stock information
      const transformedCart = response.data.map((cart: Cart) => ({
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
          quantity: 1, // Force quantity to be 1
          stock: 100, // Set stock to 100 for all items
        })),
      }));

      setCartItems(transformedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items. Please try refreshing.");
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
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
    fetchCart();
    if (user?.id) {
      fetchOrders();
    }
  }, []);

  // Auto-refresh cart when payment dialog closes (after successful payment)
  useEffect(() => {
    if (!isPaymentDialogOpen) {
      // Small delay to ensure backend has processed the payment
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
      // Extract numeric price - handle different price formats
      const numericPrice = parseFloat(
        item.price.replace("Rs.", "").replace(/,/g, "").trim(),
      );

      // Calculate item total - quantity is always 1
      const itemTotal = numericPrice * 1; // item.quantity is always 1

      // Add to total
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
    const serviceFee = subtotal * 0.2; // 20% service fee
    return subtotal + serviceFee;
  };

  const total = getTotalAmount();

  // Function to remove item from cart
  const removeFromCart = async (itemId: string) => {
    try {
      await requestUrl({
        method: "DELETE",
        endpoint: `cart/remove-item`,
        data: {
          user_id: user?.id,
          item_id: itemId,
        },
      });

      // Refresh cart to get updated data
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshCart}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh Cart"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty</p>
            <Button onClick={handleRefreshCart} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh Cart"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cart Items</CardTitle>
            <span className="text-sm text-muted-foreground">
              {cartItems[0]?.items?.length || 0} items
            </span>
          </CardHeader>
          <CardContent>
            {cartItems.map((cart) =>
              cart?.items?.length > 0 ? (
                cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center mb-4 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={item.imageurl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <span className="font-medium block">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.companyname}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-green-600">
                            In stock: {item.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-medium text-lg">
                        Rs.{" "}
                        {parseFloat(
                          item.price.replace("Rs.", "").replace(/,/g, ""),
                        ).toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Quantity: 1
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No items in cart
                </p>
              ),
            )}

            {cartItems[0]?.items && cartItems[0].items.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-2 mt-4">
                  <span>Service Fee (20%)</span>
                  <span>
                    Rs.{" "}
                    {(calculateCartTotal(cartItems[0].items) * 0.2).toFixed(2)}
                  </span>
                </div>
                <Separator className="border my-2" />
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <div>
              <span className="font-bold block">Total:</span>
              <span className="text-sm text-muted-foreground">
                {cartItems[0]?.items?.length || 0} items
              </span>
            </div>
            <span className="font-bold text-lg">Rs. {total.toFixed(2)}</span>
          </CardFooter>
        </Card>
      )}

      <div className="mt-4">
        <Button
          disabled={cartItems.length === 0 || cartItems[0]?.items?.length === 0}
          onClick={() => setIsPaymentDialogOpen(true)}
          className="w-full"
        >
          Proceed to Payment
        </Button>
      </div>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        total={total}
      />

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Past Orders</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ScrollArea className="h-full pr-4">
              {pastOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No past orders found
                </p>
              ) : (
                pastOrders.map((order) => (
                  <div
                    key={order._id || order.id}
                    className="mb-4 p-3 border rounded-lg"
                  >
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Order #{order._id?.slice(-6) || order.id?.slice(-6)}
                      </span>
                      <span>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="text-right">
                          <span className="block text-sm">{item.price}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {order.status}
                          </span>
                        </p>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Order Total:</span>
                      <span>Rs. {order.total_price?.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
