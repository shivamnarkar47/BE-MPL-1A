import { ChevronLeft, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { requestUrl } from "@/lib/requestUrl";
import { getCookie } from "@/lib/getUser";
import WishlistButton from "./WishlistButton";
import ReviewsSection from "./ReviewsSection";
import { useReviews } from "@/contexts/ReviewContext";

type ProductType = {
  companyname: string;
  id: string;
  imageurl: string;
  name: string;
  price: string;
  stock: number;
};

export default function ProductPage() {
  const { productId } = useParams();
  const user = getCookie();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const { getProductAverageRating, getProductReviewCount } = useReviews();

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: `products/${productId}`,
    })
      .then((res) => {
        setProduct(res.data);
      })
      .catch((e) => {
        console.log(e);
      });

    // Check if product is in cart
    if (user?.id) {
      requestUrl({
        method: "GET",
        endpoint: `cart/${user.id}`,
      }).then((res) => {
        const cartItems = res.data[0]?.items || [];
        const item = cartItems.find((i: any) => i.id === productId);
        if (item) {
          setCartQuantity(item.quantity);
        }
      });
    }
  }, [productId, user?.id]);

  const addToCart = (navigateAfter = false) => {
    if (!product || !user?.id) return;
    requestUrl({
      method: "POST",
      endpoint: "cart/add",
      data: {
        user_id: user.id,
        items: [{ ...product, quantity: 1 }],
      },
    })
      .then(() => {
        setCartQuantity(1);
        if (navigateAfter) navigate("/cart");
      })
      .catch((e) => console.error(e));
  };

  const updateQuantity = (val: number) => {
    const newQty = cartQuantity + val;
    if (newQty < 0 || !user?.id || !productId) return;

    requestUrl({
      method: "PATCH",
      endpoint: "cart/update-quantity",
      data: {
        user_id: user.id,
        item_id: productId,
        quantity: newQty
      }
    }).then(() => {
      setCartQuantity(newQty);
    }).catch(e => console.error(e));
  };

  const averageRating = getProductAverageRating(productId || '');
  const reviewCount = getProductReviewCount(productId || '');

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 gap-y-4 flex flex-col py-8 animate-in fade-in duration-500">
      <Link
        className="rounded-xl w-12 h-12 flex items-center justify-center border-slate-200 hover:bg-slate-100 border bg-white text-slate-600 transition-colors shadow-sm"
        to={"/home"}
      >
        <ChevronLeft size={20} />
      </Link>

      <Card className="overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl">
        <CardContent className="p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square group">
              <img
                src={product.imageurl}
                alt={product.name}
                className="rounded-[2rem] object-cover w-full h-full shadow-lg transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute top-6 right-6 scale-125">
                <WishlistButton product={product} />
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                  {product.companyname}
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {reviewCount > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-sm font-black">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {averageRating.toFixed(1)}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {reviewCount} Verified Review{reviewCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-black text-emerald-600">{product.price}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">In Stock: {product.stock} Units</span>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed font-medium">
                  Experience the perfect fusion of recycled artistry and functional design. This handcrafted piece tells a story of sustainability, weaving together premium materials with artisanal precision to create something truly unique for your collection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {cartQuantity > 0 ? (
                  <div className="flex-1 h-14 bg-slate-100 rounded-2xl flex items-center justify-between px-2 overflow-hidden border border-slate-200">
                    <Button
                      variant="ghost"
                      className="w-10 h-10 rounded-xl hover:bg-white hover:text-emerald-600 transition-all font-black text-xl"
                      onClick={() => updateQuantity(-1)}
                    >
                      −
                    </Button>
                    <span className="font-black text-slate-900">{cartQuantity}</span>
                    <Button
                      variant="ghost"
                      className="w-10 h-10 rounded-xl hover:bg-white hover:text-emerald-600 transition-all font-black text-xl"
                      onClick={() => updateQuantity(1)}
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="flex-1 h-16 rounded-[1.25rem] bg-slate-900 text-white font-black text-lg hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                    onClick={() => addToCart(false)}
                  >
                    <ShoppingCart className="mr-3 h-5 w-5" /> Add to Cart
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="flex-1 h-16 rounded-[1.25rem] border-2 border-slate-200 text-slate-900 font-black text-lg hover:bg-slate-50 transition-all active:scale-[0.98]"
                  onClick={() => {
                    if (cartQuantity > 0) {
                      navigate("/cart");
                    } else {
                      addToCart(true);
                    }
                  }}
                >
                  {cartQuantity > 0 ? "Proceed to Cart" : "Buy Now"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <ReviewsSection
        productId={productId || ''}
        productName={product.name || 'this product'}
      />
    </div>
  );
}
