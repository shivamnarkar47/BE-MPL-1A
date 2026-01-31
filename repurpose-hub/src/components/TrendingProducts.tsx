import { requestUrl } from "@/lib/requestUrl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { TrendingUp, Star, ArrowRight } from "lucide-react";
import WishlistButton from "./WishlistButton";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: string;
  quantity: number;
  imageurl?: string;
  description?: string;
  companyname?: string;
}

const TrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "allProducts",
    })
      .then((response) => {
        // Get trending products (those with higher quantity and sort by price)
        const products = response.data;
        const trending = products
          .filter((product: Product) => product.quantity > 50) // Products with good stock
          .sort((a: Product, b: Product) => {
            // Sort by a combination of stock and price (higher priced items might be more popular)
            const parsePrice = (p: string) => parseFloat(p.replace(/^Rs\.\s*/, "").replace(/,/g, "").trim()) || 0;
            const scoreA = (a.quantity || 0) + parsePrice(a.price) / 100;
            const scoreB = (b.quantity || 0) + parsePrice(b.price) / 100;
            return scoreB - scoreA;
          })
          .slice(0, 8); // Top 8 trending products

        setTrendingProducts(trending);
      })
      .catch((e) => {
        console.log("Trending Products Error ", e);
      });
  }, []);

  if (trendingProducts.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-r from-green-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="text-green-600" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Trending Products</h2>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular upcycled products that are making waves in the sustainable community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {trendingProducts.map((product: Product) => (
            <Link key={product.id || product._id} to={`/product/${product.id || product._id}`}>
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group border-0 shadow-md">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product?.imageurl}
                      alt={product?.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <TrendingUp size={12} />
                      Hot
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-green-600 transition-colors flex-1">
                      {product?.name}
                    </h3>
                    <WishlistButton
                      product={product}
                      className="ml-2 flex-shrink-0"
                    />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xl font-bold text-green-600">
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
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    {product.quantity}+ in stock
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/home">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto">
              View All Products
              <ArrowRight size={20} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TrendingProducts;