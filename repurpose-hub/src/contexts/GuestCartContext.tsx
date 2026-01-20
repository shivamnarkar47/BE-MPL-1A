import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  companyname: string;
  imageurl: string;
  stock: number;
}

interface GuestCartContextType {
  guestCartItems: CartItem[];
  addToGuestCart: (item: CartItem) => void;
  removeFromGuestCart: (itemId: string) => void;
  updateGuestCartQuantity: (itemId: string, quantity: number) => void;
  clearGuestCart: () => void;
  guestCartTotal: number;
  guestCartCount: number;
  isGuestCheckout: boolean;
  setGuestCheckout: (value: boolean) => void;
}

const GuestCartContext = createContext<GuestCartContextType | undefined>(undefined);

export const useGuestCart = () => {
  const context = useContext(GuestCartContext);
  if (context === undefined) {
    throw new Error('useGuestCart must be used within a GuestCartProvider');
  }
  return context;
};

interface GuestCartProviderProps {
  children: ReactNode;
}

export const GuestCartProvider: React.FC<GuestCartProviderProps> = ({ children }) => {
  const [guestCartItems, setGuestCartItems] = useState<CartItem[]>([]);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  // Load guest cart from localStorage on mount
  useEffect(() => {
    const savedGuestCart = localStorage.getItem('guestCart');
    if (savedGuestCart) {
      try {
        setGuestCartItems(JSON.parse(savedGuestCart));
      } catch (error) {
        console.error('Error loading guest cart from localStorage:', error);
        localStorage.removeItem('guestCart');
      }
    }
  }, []);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('guestCart', JSON.stringify(guestCartItems));
  }, [guestCartItems]);

  const addToGuestCart = (item: CartItem) => {
    setGuestCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        cartItem => cartItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        // Item already exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromGuestCart = (itemId: string) => {
    setGuestCartItems(prevItems =>
      prevItems.filter(item => item.id !== itemId)
    );
  };

  const updateGuestCartQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromGuestCart(itemId);
      return;
    }

    setGuestCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      )
    );
  };

  const clearGuestCart = () => {
    setGuestCartItems([]);
  };

  const guestCartTotal = guestCartItems.reduce((total, item) => {
    const numericPrice = parseFloat(item.price.replace("Rs.", "").replace(/,/g, "").trim());
    return total + (numericPrice * item.quantity);
  }, 0);

  const guestCartCount = guestCartItems.reduce((count, item) => count + item.quantity, 0);

  const value: GuestCartContextType = {
    guestCartItems,
    addToGuestCart,
    removeFromGuestCart,
    updateGuestCartQuantity,
    clearGuestCart,
    guestCartTotal,
    guestCartCount,
    isGuestCheckout,
    setGuestCheckout: setIsGuestCheckout,
  };

  return (
    <GuestCartContext.Provider value={value}>
      {children}
    </GuestCartContext.Provider>
  );
};