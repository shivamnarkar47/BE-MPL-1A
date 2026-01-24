import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { requestUrl } from '@/lib/requestUrl';
import { user } from '@/lib/getUser';

interface Product {
  id?: string;
  _id?: string;
  name: string;
  price: string;
  imageurl: string;
  companyName?: string;
  companyname?: string;
  quantity?: number;
  rating?: number;
  stock?: number;
}

interface WishlistContextType {
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load wishlist from backend when user is logged in, otherwise localStorage
  useEffect(() => {
    const loadWishlist = async () => {
      if (user?.id) {
        // Load from backend for logged-in users
        try {
          setIsLoading(true);
          const response = await requestUrl({
            method: 'GET',
            endpoint: `wishlist/${user.id}`,
          });
          
          if (response.data && response.data.length > 0) {
            // Flatten items from all wishlist documents
            const allItems = response.data.flatMap((w: any) => w.items || []);
            setWishlist(allItems);
          } else {
            setWishlist([]);
          }
        } catch (error) {
          console.error('Error loading wishlist from backend:', error);
          // Fallback to localStorage
          const savedWishlist = localStorage.getItem('wishlist');
          if (savedWishlist) {
            try {
              setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
              console.error('Error parsing localStorage wishlist:', e);
            }
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        // Load from localStorage for guests
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try {
            setWishlist(JSON.parse(savedWishlist));
          } catch (error) {
            console.error('Error loading wishlist from localStorage:', error);
            localStorage.removeItem('wishlist');
          }
        }
      }
    };

    loadWishlist();
  }, [user?.id]);

  // Save wishlist to backend when user is logged in, otherwise localStorage
  useEffect(() => {
    if (user?.id && !isLoading) {
      // Don't save on initial load to avoid infinite loop
      const saveToBackend = async () => {
        try {
          await requestUrl({
            method: 'POST',
            endpoint: 'wishlist/add',
            data: {
              user_id: user.id,
              items: wishlist,
            },
          });
        } catch (error) {
          console.error('Error saving wishlist to backend:', error);
          // Fallback to localStorage
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
      };
      
      // Debounce save operations
      const timer = setTimeout(saveToBackend, 500);
      return () => clearTimeout(timer);
    } else if (!user?.id) {
      // Save to localStorage for guests
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user?.id, isLoading]);

  const addToWishlist = (product: Product) => {
    setWishlist(prevWishlist => {
      // Check if product is already in wishlist
      const productId = product.id || product._id;
      const exists = prevWishlist.some(item => 
        (item.id || item._id) === productId
      );
      
      if (exists) {
        return prevWishlist; // Product already in wishlist
      }
      
      return [...prevWishlist, product];
    });
  };

  const removeFromWishlist = async (productId: string) => {
    // Remove from state immediately for responsive UI
    setWishlist(prevWishlist => 
      prevWishlist.filter(product => 
        (product.id || product._id) !== productId
      )
    );

    // Remove from backend if user is logged in
    if (user?.id) {
      try {
        await requestUrl({
          method: 'DELETE',
          endpoint: 'wishlist/remove-item',
          data: {
            user_id: user.id,
            item_id: productId,
          },
        });
      } catch (error) {
        console.error('Error removing from backend wishlist:', error);
        // Item already removed from state, so just log error
      }
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(product => 
      (product.id || product._id) === productId
    );
  };

  const clearWishlist = async () => {
    setWishlist([]);

    // Clear from backend if user is logged in
    if (user?.id) {
      try {
        await requestUrl({
          method: 'DELETE',
          endpoint: `wishlist/clear/${user.id}`,
        });
      } catch (error) {
        console.error('Error clearing backend wishlist:', error);
      }
    }
  };

  const wishlistCount = wishlist.length;

  const value: WishlistContextType = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};