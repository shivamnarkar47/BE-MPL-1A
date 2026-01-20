import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState } from 'react';

interface WishlistButtonProps {
  product: {
    id?: string;
    _id?: string;
    name: string;
    price: string;
    imageurl: string;
    companyName?: string;
    companyname?: string;
  };
  className?: string;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ product, className = "" }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const productId = product.id || product._id || '';
  const inWishlist = isInWishlist(productId);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    
    if (inWishlist) {
      removeFromWishlist(productId);
      console.log('Removed from wishlist');
    } else {
      addToWishlist(product);
      console.log('Added to wishlist!');
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleWishlistClick}
      className={`p-2 hover:bg-pink-50 transition-all duration-300 ${isAnimating ? 'scale-125' : 'scale-100'} ${className}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={20}
        className={`transition-colors duration-300 ${
          inWishlist 
            ? 'fill-pink-500 text-pink-500' 
            : 'text-gray-400 hover:text-pink-500'
        }`}
      />
    </Button>
  );
};

export default WishlistButton;