import { requestUrl } from "@/lib/requestUrl";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { Search, TrendingUp, Star } from "lucide-react";
import WishlistButton from "./WishlistButton";
import PersonalizedRecommendations from "./PersonalizedRecommendations";
import { Link } from "react-router-dom";

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

const MarketPlace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [filteredProducts, setFilteredProducts] = useState(products);

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "allProducts",
    })
      .then((response) => {
        console.log(response.data);
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((e) => {
        console.log("All Products Error ", e);
      });
  }, []);
  // Extract unique brands and categories from products
  const uniqueBrands = useMemo(() => {
    const brands = products.map((p) => p.companyName || p.companyname).filter(Boolean) as string[];
    return [...new Set(brands)].sort();
  }, [products]);

  const uniqueCategories = useMemo(() => {
    const categories = products.map((p) => {
      const name = p.name.toLowerCase();
      if (name.includes('tote') || name.includes('bag')) return 'Bags & Accessories';
      if (name.includes('home') || name.includes('decor')) return 'Home Decor';
      if (name.includes('fashion') || name.includes('clothing')) return 'Fashion';
      if (name.includes('jewelry') || name.includes('jewellery')) return 'Jewelry';
      return 'Other';
    }).filter(Boolean) as string[];
    return [...new Set(categories)].sort();
  }, [products]);

  // Enhanced filtering and search
  const filterAndSearchProducts = useMemo(() => {
    let filtered = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        (product.companyName || product.companyname || "").toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(
        (product) => (product.companyName || product.companyname) === selectedBrand,
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const name = product.name.toLowerCase();
        switch (selectedCategory) {
          case 'Bags & Accessories':
            return name.includes('tote') || name.includes('bag');
          case 'Home Decor':
            return name.includes('home') || name.includes('decor');
          case 'Fashion':
            return name.includes('fashion') || name.includes('clothing');
          case 'Jewelry':
            return name.includes('jewelry') || name.includes('jewellery');
          default:
            return true;
        }
      });
    }

    // Price filters
    if (minPrice || maxPrice) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price.replace(/[^\d.]/g, ''));
        if (minPrice && price < minPrice) return false;
        if (maxPrice && price > maxPrice) return false;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''));
        case 'price-high':
          return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''));
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return (a.companyName || a.companyname || "").localeCompare(b.companyName || b.companyname || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, selectedBrand, selectedCategory, minPrice, maxPrice, sortBy]);

  // Update filtered products when dependencies change
  useEffect(() => {
    setFilteredProducts(filterAndSearchProducts);
  }, [filterAndSearchProducts]);

  

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Personalized Recommendations Section */}
      <PersonalizedRecommendations />

      {/* Search and Filter Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search products by name or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Brand Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                {selectedBrand || "All Brands"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Brands</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedBrand(null)}>
                All Brands
              </DropdownMenuItem>
              {uniqueBrands.map((brand) => (
                <DropdownMenuItem key={brand} onClick={() => setSelectedBrand(brand)}>
                  {brand}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[150px]">
                {selectedCategory || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Categories</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All Categories
              </DropdownMenuItem>
              {uniqueCategories.map((category) => (
                <DropdownMenuItem key={category} onClick={() => setSelectedCategory(category)}>
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price Range */}
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice || ""}
              onChange={(e) => setMinPrice(Number(e.target.value) || null)}
              className="w-20"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={maxPrice || ""}
              onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
              className="w-20"
            />
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[120px]">
                Sort: {sortBy === 'name' ? 'Name' : sortBy === 'price-low' ? 'Price (Low)' : sortBy === 'price-high' ? 'Price (High)' : 'Brand'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-low')}>Price (Low to High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('price-high')}>Price (High to Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('brand')}>Brand</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters */}
          <Button 
            variant="ghost" 
            onClick={() => {
              setSearchQuery("");
              setSelectedBrand(null);
              setSelectedCategory(null);
              setMinPrice(null);
              setMaxPrice(null);
              setSortBy("name");
            }}
          >
            Clear All
          </Button>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => (
            <Link key={product.id || product._id} to={`/product/${product.id || product._id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product?.imageurl}
                      alt={product?.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Trending Badge for popular items */}
                    {product.quantity > 50 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <TrendingUp size={12} />
                        Popular
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                      {product?.name}
                    </h3>
                    <WishlistButton 
                      product={product}
                      className="ml-2 flex-shrink-0"
                    />
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-bold text-green-600">
                      {product.price}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      4.5
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {(product.companyName || product.companyname || "Unknown Brand")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedBrand(null);
                setSelectedCategory(null);
                setMinPrice(null);
                setMaxPrice(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPlace;
