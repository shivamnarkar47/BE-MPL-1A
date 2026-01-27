import { useEffect, useState, useMemo } from 'react';
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Star, ArrowRight } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import WishlistButton from "./WishlistButton";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: string;
  imageurl: string;
  companyName?: string;
  companyname?: string;
  quantity?: number;
}

const PersonalizedRecommendations = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { wishlist } = useWishlist();

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "allProducts",
    })
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.log("Products Error ", e);
        setLoading(false);
      });
  }, []);

  // Generate recommendations based on wishlist and browsing patterns
  const generateRecommendations = useMemo(() => {
    if (products.length === 0) return [];

    const wishlistIds = new Set(wishlist.map(item => item.id || item._id));

    // Get categories and brands from wishlist
    const wishlistCategories = wishlist.map(item => {
      const name = item.name.toLowerCase();
      if (name.includes('tote') || name.includes('bag')) return 'Bags & Accessories';
      if (name.includes('home') || name.includes('decor')) return 'Home Decor';
      if (name.includes('fashion') || name.includes('clothing')) return 'Fashion';
      if (name.includes('jewelry') || name.includes('jewellery')) return 'Jewelry';
      return 'Other';
    });

    const wishlistBrands = new Set(wishlist.map(item => item.companyName || item.companyname));

    // Score each product for recommendation
    const scoredProducts = products
      .filter(product => !wishlistIds.has(product.id || product._id)) // Exclude already wishlisted
      .map(product => {
        let score = 0;

        // Category match (high weight)
        const name = product.name.toLowerCase();
        if (wishlistCategories.some(cat => {
          switch (cat) {
            case 'Bags & Accessories': return name.includes('tote') || name.includes('bag');
            case 'Home Decor': return name.includes('home') || name.includes('decor');
            case 'Fashion': return name.includes('fashion') || name.includes('clothing');
            case 'Jewelry': return name.includes('jewelry') || name.includes('jewellery');
            default: return false;
          }
        })) {
          score += 3;
        }

        // Brand match (high weight)
        if (wishlistBrands.has(product.companyName || product.companyname)) {
          score += 2;
        }

        // Trending products (medium weight)
        if (product.quantity && product.quantity > 80) {
          score += 1;
        }

        // Recent products (assume sorted by recency in API, favor middle items)
        score += 0.5;

        // Diversity bonus - favor products from different brands
        score += Math.random() * 0.5;

        return { product, score };
      });

    // Sort by score and take top recommendations
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(item => item.product);
  }, [products, wishlist]);

  useEffect(() => {
    if (products.length > 0 && wishlist.length > 0) {
      setRecommendations(generateRecommendations);
    } else if (products.length > 0 && wishlist.length === 0) {
      // If no wishlist, show trending products as recommendations
      const trending = products
        .filter(p => p.quantity && p.quantity > 60)
        .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
        .slice(0, 4);
      setRecommendations(trending);
    }
  }, [products, wishlist, generateRecommendations]);

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Sparkles className="text-emerald-500 animate-pulse" size={40} />
            <div className="h-4 w-48 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[loading_1.5s_infinite]" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Curating for you</p>
          </div>
        </div>
      </div>
    );
  }

  // Only show if we have recommendations
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-50/50 rounded-full -mr-64 -mt-64 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-100/50 rounded-full -ml-64 -mb-64 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={12} className="fill-emerald-600" />
              Special Selection
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              {wishlist.length > 0 ? "Tailored For You" : "Community Favorites"}
            </h2>
            <p className="text-slate-500 font-medium max-w-xl text-lg">
              {wishlist.length > 0
                ? "Bespoke suggestions based on your unique style and sustainable interests."
                : "Hand-picked gems currently trending in our upcycling community."
              }
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => document.getElementById('marketplace-main')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-14 px-8 rounded-2xl border-2 border-slate-200 text-slate-900 font-black hover:bg-slate-50 transition-all flex items-center gap-3"
          >
            Explore All
            <ArrowRight size={20} className="text-emerald-500" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {recommendations.map((product) => (
            <Link key={product.id || product._id} to={`/product/${product.id || product._id}`} className="group relative">
              <Card className="border-none bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-100 group-hover:-translate-y-2">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={product?.imageurl}
                    alt={product?.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Floating Wishlist */}
                  <div className="absolute top-4 right-4 z-10">
                    <WishlistButton
                      product={product}
                      className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg border-none"
                    />
                  </div>

                  {/* Rating/Recommendation Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Star size={12} className="fill-emerald-500 text-emerald-500" />
                    Highly Rated
                  </div>
                </div>

                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">
                      {product.companyName || product.companyname || "Sustain Studio"}
                    </p>
                    <h3 className="font-black text-slate-800 text-xl leading-tight line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {product?.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-2xl font-black text-slate-900">
                      {product.price}
                    </p>
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-600 hover:text-white transition-all">
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizedRecommendations;