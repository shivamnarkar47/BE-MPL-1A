import { useState } from "react";
import { Heart, ShoppingCart, Trash2, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { requestUrl } from "@/lib/requestUrl";
import { user } from "@/lib/getUser";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: string;
  imageurl: string;
  companyname?: string;
  companyName?: string;
  quantity?: number;
  rating?: number;
  stock?: number;
}

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleRefreshWishlist = () => {
    setIsLoading(true);
    setError(null);
    // Simulate refresh - in real app, you'd fetch from backend
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const addToCart = async (product: Product) => {
    if (!user?.id) {
      setError("Please log in to add items to cart");
      return;
    }

    const productId = product.id || product._id || '';
    setAddingToCart(prev => new Set(prev).add(productId));

    try {
      await requestUrl({
        method: "POST",
        endpoint: "cart/add",
        data: {
          user_id: user.id,
          items: [{
            id: productId,
            name: product.name,
            price: product.price,
            quantity: 1,
            companyname: product.companyname || product.companyName,
            imageurl: product.imageurl,
            stock: product.stock || 100
          }]
        }
      });

      // Remove from wishlist after adding to cart
      removeFromWishlist(productId);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError("Failed to add item to cart. Please try again.");
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const addAllToCart = async () => {
    if (!user?.id) {
      setError("Please log in to add items to cart");
      return;
    }

    setIsLoading(true);
    setError(null);

    const itemsToAdd = [...wishlist]; // Copy the wishlist to avoid mutation during iteration

    try {
      // Process all items in parallel
      await Promise.all(
        itemsToAdd.map(async (product) => {
          const productId = product.id || product._id || '';
          
          try {
            await requestUrl({
              method: "POST",
              endpoint: "cart/add",
              data: {
                user_id: user.id,
                items: [{
                  id: productId,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  companyname: product.companyname || product.companyName,
                  imageurl: product.imageurl,
                  stock: product.stock || 100
                }]
              }
            });

            // Remove from wishlist after adding to cart
            removeFromWishlist(productId);
          } catch (error) {
            console.error(`Error adding ${product.name} to cart:`, error);
          }
        })
      );
    } catch (error) {
      console.error("Error adding items to cart:", error);
      setError("Some items failed to add to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlistWithLoading = (productId: string) => {
    setRemovingItems(prev => new Set(prev).add(productId));
    removeFromWishlist(productId);
    
    setTimeout(() => {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }, 300);
  };

  const clearWishlistWithConfirm = () => {
    if (window.confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist();
    }
  };

  const getProductImage = (imageurl: string) => {
    if (!imageurl || imageurl === "N/A") {
      return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop";
    }
    return imageurl;
  };

  const renderStars = (rating: number = 0) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="text-center py-16">
            <CardContent>
              <div className="mx-auto w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-pink-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Login Required</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Please log in to view and manage your wishlist items
              </p>
              <Button onClick={() => window.location.href = '/login'} className="bg-pink-500 hover:bg-pink-600">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Heart className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Wishlist</h1>
              <p className="text-sm text-slate-600 mt-1">
                {wishlist.length === 0 
                  ? "Your wishlist is empty" 
                  : `${wishlist.length} item${wishlist.length === 1 ? '' : 's'} saved`
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {wishlist.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearWishlistWithConfirm}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshWishlist}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          </div>
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
                    onClick={() => setError(null)}
                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-100 border-red-200"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {wishlist.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-r from-pink-50 to-slate-50">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-pink-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your wishlist is empty</h2>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Start adding items you love to your wishlist! They'll appear here for you to review later.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.href = '/'} className="bg-pink-500 hover:bg-pink-600">
                  Start Shopping
                </Button>
                <Button variant="outline" onClick={handleRefreshWishlist} disabled={isLoading}>
                  {isLoading ? "Checking..." : "Refresh"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => {
              const productId = product.id || product._id || '';
              const isRemoving = removingItems.has(productId);
              const isAdding = addingToCart.has(productId);

              return (
                <Card key={productId} className="group shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={getProductImage(product.imageurl)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Remove button overlay */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromWishlistWithLoading(productId)}
                      disabled={isRemoving}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-600 hover:text-red-700 border-red-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {isRemoving ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>

                    {/* Heart indicator */}
                    <div className="absolute top-2 left-2 bg-pink-500 text-white p-1.5 rounded-full">
                      <Heart className="w-3 h-3 fill-white" />
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {product.companyname || product.companyName || 'Unknown Brand'}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {renderStars(product.rating || 4)}
                      <span className="text-xs text-slate-600 ml-1">({product.rating || 4.0})</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xl font-bold text-slate-900">
                          Rs. {parseFloat(product.price.replace('Rs.', '').replace(/,/g, '')).toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 font-medium">
                          ✓ In Stock
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        disabled={isAdding}
                        className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                      >
                        {isAdding ? (
                          <>
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/product/${productId}`}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary card for non-empty wishlist */}
        {wishlist.length > 0 && (
          <Card className="mt-8 bg-gradient-to-r from-pink-50 to-slate-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Wishlist Summary</h3>
                    <p className="text-sm text-slate-600">
                      Total value: Rs. {wishlist.reduce((total, item) => 
                        total + parseFloat(item.price.replace('Rs.', '').replace(/,/g, '')), 0
                      ).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={addAllToCart}
                  disabled={isLoading}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Adding All...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add All to Cart
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}