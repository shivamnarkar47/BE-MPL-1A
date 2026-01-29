import { requestUrl } from "@/lib/requestUrl";
import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "./ui/card";
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
import { Search, Star } from "lucide-react";
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
  stock?: number;
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
        setProducts(response.data);
        setFilteredProducts(response.data);
      })
      .catch((e) => {
        console.log("All Products Error ", e);
      });
  }, []);

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

  const filterAndSearchProducts = useMemo(() => {
    let filtered = [...products];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        (product.companyName || product.companyname || "").toLowerCase().includes(query)
      );
    }
    if (selectedBrand) {
      filtered = filtered.filter((product) => (product.companyName || product.companyname) === selectedBrand);
    }
    if (selectedCategory) {
      filtered = filtered.filter((product) => {
        const name = product.name.toLowerCase();
        switch (selectedCategory) {
          case 'Bags & Accessories': return name.includes('tote') || name.includes('bag');
          case 'Home Decor': return name.includes('home') || name.includes('decor');
          case 'Fashion': return name.includes('fashion') || name.includes('clothing');
          case 'Jewelry': return name.includes('jewelry') || name.includes('jewellery');
          default: return true;
        }
      });
    }
    if (minPrice || maxPrice) {
      filtered = filtered.filter((product) => {
        const price = parseFloat(product.price.replace(/^Rs\.\s*/, "").replace(/,/g, "").trim()) || 0;
        if (minPrice && price < minPrice) return false;
        if (maxPrice && price > maxPrice) return false;
        return true;
      });
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return parseFloat(b.price.replace(/[^\d.]/g, '')) - parseFloat(a.price.replace(/[^\d.]/g, ''));
        case 'price-high': return parseFloat(a.price.replace(/[^\d.]/g, '')) - parseFloat(b.price.replace(/[^\d.]/g, ''));
        case 'name': return a.name.localeCompare(b.name);
        case 'brand': return (a.companyName || a.companyname || "").localeCompare(b.companyName || b.companyname || "");
        default: return 0;
      }
    });
    return filtered;
  }, [products, searchQuery, selectedBrand, selectedCategory, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    setFilteredProducts(filterAndSearchProducts);
  }, [filterAndSearchProducts]);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* Personalized Recommendations Section */}
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <PersonalizedRecommendations />
        </section>

        {/* Header & Controls */}
        <div id="marketplace-main" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                <Star className="w-3 h-3 fill-emerald-600" />
                Curation Studio
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Marketplace</h1>
              <p className="text-slate-500 font-medium">Discover upcycled luxury and sustainable essentials.</p>
            </div>
          </div>

          {/* Search & Filter Glass Box */}
          <Card className="border-none bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-6 lg:p-8 space-y-6">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <Input
                type="text"
                placeholder="Search products, brands, or materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 h-16 text-lg bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-emerald-500 shadow-inner"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
                    {selectedBrand || "All Brands"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl p-2 min-w-[200px]">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Filter Brands</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl" onClick={() => setSelectedBrand(null)}>All Brands</DropdownMenuItem>
                  {uniqueBrands.map((brand) => (
                    <DropdownMenuItem key={brand} className="rounded-xl" onClick={() => setSelectedBrand(brand)}>
                      {brand}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
                    {selectedCategory || "All Categories"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl p-2 min-w-[200px]">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400">Shop By Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-xl" onClick={() => setSelectedCategory(null)}>All Categories</DropdownMenuItem>
                  {uniqueCategories.map((category) => (
                    <DropdownMenuItem key={category} className="rounded-xl" onClick={() => setSelectedCategory(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(Number(e.target.value) || null)}
                  className="w-20 h-9 bg-transparent border-none focus:ring-0 text-sm font-bold"
                />
                <span className="text-slate-300">—</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
                  className="w-20 h-9 bg-transparent border-none focus:ring-0 text-sm font-bold"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold bg-white hover:bg-slate-50">
                    Sort: {sortBy === 'price-low' ? 'Cheapest First' : sortBy === 'price-high' ? 'Luxury First' : 'A-Z'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-2xl p-2 min-w-[180px]">
                  <DropdownMenuItem className="rounded-xl" onClick={() => setSortBy('name')}>Alphabetical</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl" onClick={() => setSortBy('price-low')}>Price: Low to High</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl" onClick={() => setSortBy('price-high')}>Price: High to Low</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery(""); setSelectedBrand(null); setSelectedCategory(null);
                  setMinPrice(null); setMaxPrice(null); setSortBy("name");
                }}
                className="text-slate-400 hover:text-emerald-600 font-bold"
              >
                Reset Filters
              </Button>

              <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {filteredProducts.length} Results Found
              </div>
            </div>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link key={product.id || product._id} to={`/product/${product.id || product._id}`} className="group relative">
                <Card className="border-none bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-100 group-hover:-translate-y-2">
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

                    {/* Popular Badge */}
                    {product.stock! > 50 && (
                      <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xl">
                        <Star size={12} />
                        Trending
                      </div>
                    )}

                    {/* Quick Add Overlay (Mock UI) */}
                    <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold hover:bg-emerald-500 hover:text-white transition-colors shadow-2xl">
                        View Details
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-black text-slate-800 text-lg leading-tight line-clamp-2">
                        {product?.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {product.companyName || product.companyname || "Sustain Co."}
                        </p>
                        <p className="text-xl font-black text-emerald-600">
                          {product.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-black">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        4.8
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32 space-y-6">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center">
                <Search size={40} className="text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No products matched your search</p>
              <Button
                variant="outline"
                className="rounded-xl px-10 h-12"
                onClick={() => { setSearchQuery(""); setSelectedBrand(null); setSelectedCategory(null); }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketPlace;
