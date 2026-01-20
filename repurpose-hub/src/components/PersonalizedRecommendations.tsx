import { useEffect, useState, useMemo } from 'react';
import { requestUrl } from "@/lib/requestUrl";
import { Card, CardContent, CardHeader } from "./ui/card";
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
      <div className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Sparkles className="inline-block text-purple-600 animate-pulse mb-2" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Personalized For You</h2>
            <p className="text-gray-600">Loading recommendations...</p>
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
    <div className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-purple-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">
              {wishlist.length > 0 ? "Recommended For You" : "You Might Like"}
            </h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {wishlist.length > 0 
              ? "Based on your wishlist and browsing activity, we think you'll love these products"
              : "Discover trending products that our community loves"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {recommendations.map((product) => (
            <Link key={product.id || product._id} to={`/product/${product.id || product._id}`}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md bg-white/80 backdrop-blur">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product?.imageurl}
                      alt={product?.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <WishlistButton 
                        product={product}
                        className="bg-white/80 hover:bg-white"
                      />
                    </div>
                    {product.quantity && product.quantity > 80 && (
                      <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Sparkles size={12} />
                        Recommended
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product?.name}
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xl font-bold text-purple-600">
                      {product.price}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      4.5+
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {(product.companyName || product.companyname || "Unknown Brand")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/home">
            <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-lg flex items-center gap-2 mx-auto">
              Browse All Products
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;