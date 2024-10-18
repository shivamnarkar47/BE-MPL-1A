
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
}



const FilterPopover = ({products}:any) => {
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);

  const filterProducts = () => {
    let filtered = products;

    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    if (maxPrice) {
      filtered = filtered.filter((product) => product.price <= maxPrice);
    }

    setFilteredProducts(filtered);
  };

  return (
    <div>
      {/* Filter Button using Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Filter Products
          </button>
        </PopoverTrigger>
        <PopoverContent>
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
                  <DropdownMenuItem onClick={() => setSelectedBrand('Brand A')}>
                    Brand A
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedBrand('Brand B')}>
                    Brand B
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSelectedBrand('Brand C')}>
                    Brand C
                  </DropdownMenuItem>
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

            <button
              onClick={filterProducts}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Apply Filters
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Filtered Products */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold">Filtered Products:</h3>
        {filteredProducts.length > 0 ? (
          <ul className="mt-4">
            {filteredProducts.map((product) => (
              <li key={product.id} className="border-b py-2">
                {product.name} - ${product.price} - {product.brand}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4">No products found with the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default FilterPopover;
