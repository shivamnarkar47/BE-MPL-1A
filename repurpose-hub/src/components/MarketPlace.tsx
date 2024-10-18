import { requestUrl } from '@/lib/requestUrl';
import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Filter } from 'lucide-react';
import FilterPopover from './FilterPopover';
import { Link } from 'react-router-dom';

const MarketPlace = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    requestUrl({
      method: "GET",
      endpoint: "allProducts",
    }).then((response) => {
      console.log(response.data)
      setProducts(response.data)
      setFilteredProducts(shuffleArray(response.data))
    }).catch((e) => {
      console.log("All Products Error ", e)
    })
  }, [])
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const filterProducts = () => {
    let filtered = products;

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.companyname === selectedBrand);
    }

    if (maxPrice) {
      filtered = filtered.filter((product) => product.price.replace(",", "").split(" ").at(1) <= maxPrice);
    }


    setFilteredProducts(shuffleArray(filtered));
  };

  const shuffleArray = (array: any[]) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  return (
    <div className='flex md:flex-row flex-col md:items-start items-center '>
      <div className='p-10 '>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="text-white px-4 py-2 rounded">
              <Filter />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='ml-10'>
            <div className="p-4">
              <h4 className="font-semibold mb-2">Filter By:</h4>

              {/* Brand Filter using DropdownMenu */}
              <div className="mb-4">
                <label className="block mb-1">Brand</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="border rounded p-2 w-full">
                      {selectedBrand || 'Select Brand'}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Brands</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedBrand(null)}>
                      All Brands
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedBrand('Rechakra')}>Rechakra</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Price Filter using Input */}
              <div className="mb-4">
                <label className="block mb-1">Max Price</label>
                <input
                  type="number"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
                  placeholder="Enter max price"
                  className="border rounded p-2 w-full"
                />
              </div>

              <Button
                onClick={filterProducts}
                className=" text-white px-4 py-2 rounded"
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="max-h-screen scroll-ml-10 pt-22 p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8  overflow-y-auto">
        {filteredProducts.length > 0 && filteredProducts.map((product: any) => (
          <Link to={`/product/${product.id}`}>

            <Card className="hover:bg-gray-200 cursor-pointer">
              <CardHeader>
                <img src={product?.imageurl} className="w-[400px] h-[400px] object-cover rounded-lg" />
              </CardHeader>
              <CardContent>
                <h1 className="scroll-m-20 mb-10 text-2xl font-semibold tracking-tight">{product?.name}</h1>
                <div className="flex justify-between">
                  <p className="leading-7 [&:not(:first-child)]:mt-2">{product.price}</p>
                  <span className="font-bold">{product.companyname}</span>
                </div>
              </CardContent>
              <CardFooter>

              </CardFooter>
            </Card>

          </Link>
        ))

        }   </div>

    </div>

  )
}

export default MarketPlace
