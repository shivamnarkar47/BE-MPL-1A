import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { PaymentDialog } from "./payment-dialog";
import { requestUrl } from "@/lib/requestUrl";
import { user } from "@/lib/getUser";
import { ScrollArea } from "./ui/scroll-area";
import {
  RefreshCw,
  ShoppingCart,
  Trash2,
  Package,
  CreditCard,
  ArrowRight,
  ChevronRight,
  Calendar,
  Info,
  ShoppingBag,
  Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchCart = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    else if (isLoading) setIsLoading(true);
    setError(null);

    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `cart/${user?.id}`,
      });

      if (!response.data || response.data.length === 0) {
        setCartItems([]);
        return;
      }

      const transformedCart = response.data.map((cart: Cart) => ({
        ...cart,
        items: cart.items.map((item) => ({
          ...item,
        })),
      }));

      setCartItems(transformedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart items. Please try refreshing.");
      setCartItems([]);
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `orders/${user?.id}`,
      });
      setPastOrders(response.data || []);
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

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await requestUrl({
        method: "GET",
        endpoint: `orders/${orderId}/invoice`,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${orderId.slice(-8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error downloading invoice:", err);
      setError("Failed to download invoice.");
    }
  };

  useEffect(() => {
    if (!isPaymentDialogOpen) {
      const timer = setTimeout(() => {
        fetchCart();
        fetchOrders();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPaymentDialogOpen]);

  function calculateCartTotal(items: CartItem[]): number {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      const cleanPrice = item.price.replace(/^Rs\.\s*/, "").replace(/,/g, "").trim();
      const numericPrice = parseFloat(cleanPrice) || 0;
      return total + (numericPrice * item.quantity);
    }, 0);
  }

  const getTotalAmount = (): number => {
    if (cartItems.length === 0 || !cartItems[0]?.items) return 0;
    const subtotal = calculateCartTotal(cartItems[0].items);
    const serviceFee = subtotal * 0.2;
    return subtotal + serviceFee;
  };

  const total = getTotalAmount();

  const removeFromCart = async (itemId: string) => {
    try {
      if (!user?.id) return;
      setRemovingItems(prev => new Set(prev).add(itemId));
      await requestUrl({
        method: "DELETE",
        endpoint: `cart/remove-item`,
        data: { user_id: user.id, item_id: itemId },
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item.");
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    try {
      if (!user?.id || newQty < 0) return;

      if (newQty === 0) {
        await removeFromCart(itemId);
        return;
      }

      await requestUrl({
        method: "PATCH",
        endpoint: "cart/update-quantity",
        data: {
          user_id: user.id,
          item_id: itemId,
          quantity: newQty
        }
      });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl bg-white/70 backdrop-blur-xl rounded-[2rem] overflow-hidden">
          <CardContent className="pt-12 pb-10 text-center">
            <div className="mx-auto w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 animate-pulse">
              <ShoppingCart className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Sign in Required</h1>
            <p className="text-slate-500 mb-8 max-w-[280px] mx-auto">
              Unlock your cart and start your sustainable shopping journey.
            </p>
            <Button
              onClick={() => window.location.href = '/login'}
              className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
            >
              Take me to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Curating your selection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
              <ShoppingBag className="w-4 h-4" />
              <span>Your Boutique</span>
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-slate-400 font-medium">
              Check out with confidence. Your sustainable choices matter.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => fetchCart(true)}
            disabled={isRefreshing}
            className="h-12 px-6 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white text-slate-600 border border-slate-200 shadow-sm transition-all hover:shadow-md"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing ? "animate-spin" : "")} />
            {isRefreshing ? "Updating..." : "Refresh Basket"}
          </Button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl flex items-center gap-4 text-red-600 animate-in fade-in slide-in-from-top-4">
            <Info className="w-5 h-5 shrink-0" />
            <span className="flex-1 font-medium text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={() => setError(null)} className="hover:bg-red-100">Dismiss</Button>
          </div>
        )}

        {cartItems.length === 0 || cartItems[0]?.items?.length === 0 ? (
          <Card className="border-none shadow-2xl bg-white/60 backdrop-blur-2xl rounded-[2.5rem] py-20 text-center border border-white/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <CardContent className="relative z-10">
              <div className="mx-auto w-32 h-32 bg-slate-100/50 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-6">
                <Package className="w-16 h-16 text-slate-300" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Your basket is waiting</h3>
              <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                Sustainability starts here. Explore our collection of repurposed treasures.
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                className="h-16 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-2xl shadow-slate-900/10 transition-all hover:scale-105"
              >
                Browse Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Main Cart Items */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  Basket Items
                  <span className="text-sm font-normal text-slate-400 ml-2 bg-slate-100 px-3 py-1 rounded-full">
                    {cartItems[0]?.items?.length || 0}
                  </span>
                </h2>
              </div>

              <div className="grid gap-6">
                {cartItems[0].items.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:border-slate-300 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors"></div>

                    <div className="relative shrink-0 overflow-hidden rounded-2xl w-full sm:w-40 aspect-square sm:h-40 bg-slate-100">
                      <img
                        src={item.imageurl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                            {item.name}
                          </h3>
                        </div>
                        <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mb-4">
                          <Package className="w-3.5 h-3.5" />
                          {item.companyname}
                        </p>

                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500 border border-slate-100">
                            Units Ordered
                          </span>
                          <div className="flex items-center bg-slate-100 rounded-full px-1 py-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 rounded-full hover:bg-white text-slate-600"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              −
                            </Button>
                            <span className="w-8 text-center text-[11px] font-black text-slate-900">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-6 h-6 rounded-full hover:bg-white text-slate-600"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-6">
                        <div className="space-y-1">
                          <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Price</span>
                          <p className="text-2xl font-black text-slate-900">
                            Rs. {parseFloat(item.price.replace("Rs.", "").replace(/,/g, "")).toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          disabled={removingItems.has(item.id)}
                          className="w-12 h-12 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                        >
                          {removingItems.has(item.id) ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-10">
              <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 relative z-10">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Order Summary
                </h2>

                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between text-slate-500">
                    <span className="font-medium">Subtotal</span>
                    <span className="text-slate-900 font-bold">Rs. {calculateCartTotal(cartItems[0].items).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-4">
                    <span className="font-medium">Service Fee (20%)</span>
                    <span className="text-slate-900 font-bold">Rs. {(calculateCartTotal(cartItems[0].items) * 0.2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-primary block">Rs. {total.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inclusive of all taxes</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <Button
                    size="lg"
                    onClick={() => setIsPaymentDialogOpen(true)}
                    className="w-full h-16 rounded-[1.25rem] bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold shadow-2xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    Checkout Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Secured by Razorpay</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Logic */}
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          total={total}
        />

        {/* Order History Section */}
        {user && !isLoading && (
          <section className="mt-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between px-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px]">
                  <RefreshCw className="w-3 h-3" />
                  <span>Your Legacy</span>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Purchase History</h2>
                <p className="text-slate-400 font-medium text-sm">Every order tells a story of sustainable change.</p>
              </div>
            </div>

            {pastOrders.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-sm border border-slate-200 border-dashed rounded-[2.5rem] py-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No past orders yet</h3>
                <p className="text-slate-400 max-w-xs mx-auto text-sm">Your journey with us will start showing up here once you make your first purchase.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pastOrders.map((order) => (
                  <Card
                    key={order._id || order.id}
                    className="group border border-slate-200/60 bg-white/60 backdrop-blur-sm rounded-[2rem] hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:border-slate-300 overflow-hidden"
                  >
                    <CardContent className="p-0 items-center flex flex-col sm:flex-row gap-0">
                      {/* Order Status Color Bar */}
                      <div className={cn(
                        "w-2 self-stretch hidden sm:block",
                        order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                      )} />
                      <div className={cn(
                        "h-2 self-stretch sm:hidden block w-full",
                        order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                      )} />

                      <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                          <p className="font-bold text-slate-900">#{order._id?.slice(-8) || order.id?.slice(-8)}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Placed</span>
                          <div className="flex items-center gap-2 font-semibold text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {new Date(order.created_at).toLocaleDateString('en-GB')}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Price</span>
                          <p className="font-black text-slate-900 text-lg">Rs. {order.total_price?.toFixed(2)}</p>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter border-2",
                            order.status === 'completed'
                              ? 'bg-green-50 text-green-700 border-green-200/50'
                              : order.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                : 'bg-slate-50 text-slate-700 border-slate-200/50'
                          )}>
                            {order.status || 'Processing'}
                          </span>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => setSelectedOrder(order)}
                                className="w-10 h-10 rounded-xl bg-slate-100/50 hover:bg-slate-900 hover:text-white transition-all group/btn"
                              >
                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl border-none shadow-3xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden">
                              <div className="p-8 bg-slate-900 text-white relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <DialogHeader className="relative z-10">
                                  <div className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">Authenticated Order Details</div>
                                  <DialogTitle className="text-3xl font-black flex items-center gap-3">
                                    Order #{selectedOrder?._id?.slice(-8)}
                                  </DialogTitle>
                                  <DialogDescription className="text-slate-400 font-medium">
                                    Timeline: Finalized on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                              </div>

                              <div className="p-8">
                                <div className="space-y-6">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Articles Purchased ({selectedOrder?.items?.length})</h4>
                                    {selectedOrder?.status === 'completed' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDownloadInvoice(selectedOrder._id || selectedOrder.id)}
                                        className="h-8 rounded-lg border-emerald-200 text-emerald-600 hover:bg-emerald-50 text-[10px] font-black uppercase tracking-widest gap-2"
                                      >
                                        <Download className="w-3 h-3" />
                                        Invoice
                                      </Button>
                                    )}
                                  </div>

                                  <ScrollArea className="h-[300px] -mx-8 px-8">
                                    <div className="space-y-4">
                                      {selectedOrder?.items?.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center bg-slate-50/50 border border-slate-100 rounded-2xl p-4 transition-all hover:bg-white hover:border-slate-200 hover:shadow-sm">
                                          <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center shrink-0">
                                              <Package className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div>
                                              <p className="font-bold text-slate-900 leading-tight mb-1">{item.name}</p>
                                              <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Qty: {item.quantity}</p>
                                            </div>
                                          </div>
                                          <p className="font-black text-slate-900">Rs. {parseFloat(item.price.replace("Rs.", "").replace(/,/g, "")).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </ScrollArea>

                                  <div className="border-t border-slate-100 pt-6 mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-slate-400 font-bold uppercase tracking-widest">Transactional Total</span>
                                      <span className="font-bold text-slate-900">Rs. {selectedOrder?.total_price?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                      <span className="text-slate-900 font-black text-xl">Amount Captured</span>
                                      <span className="text-2xl font-black text-primary">Rs. {selectedOrder?.total_price?.toFixed(2)}</span>
                                    </div>
                                  </div>

                                  <div className="pt-4">
                                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-2xl border border-green-100">
                                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                      <span className="text-[11px] font-bold uppercase tracking-widest">Payment verified for this transaction</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}