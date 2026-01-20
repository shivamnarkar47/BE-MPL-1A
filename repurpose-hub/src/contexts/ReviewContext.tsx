import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: boolean;
}

interface ReviewContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  getProductReviews: (productId: string) => Review[];
  getProductAverageRating: (productId: string) => number;
  getProductReviewCount: (productId: string) => number;
  hasUserReviewed: (productId: string, userId: string) => boolean;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

interface ReviewProviderProps {
  children: ReactNode;
}

export const ReviewProvider: React.FC<ReviewProviderProps> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  // Load reviews from localStorage on mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (error) {
        console.error('Error loading reviews from localStorage:', error);
        localStorage.removeItem('reviews');
      }
    } else {
      // Initialize with some sample reviews for demo
      const sampleReviews: Review[] = [
        {
          id: '1',
          productId: 'product-1',
          userId: 'user-1',
          userName: 'Priya Sharma',
          rating: 5,
          comment: 'Absolutely love this upcycled tote bag! The quality is amazing and I feel good knowing it\'s sustainable.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          verified: true,
        },
        {
          id: '2',
          productId: 'product-1',
          userId: 'user-2',
          userName: 'Rahul Kumar',
          rating: 4,
          comment: 'Great product! The design is unique and the craftsmanship is excellent. Delivery was a bit slow though.',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          verified: true,
        },
        {
          id: '3',
          productId: 'product-2',
          userId: 'user-3',
          userName: 'Anita Desai',
          rating: 5,
          comment: 'Perfect gift for eco-conscious friends. The fabric patterns are beautiful and meaningful.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          verified: true,
        },
      ];
      setReviews(sampleReviews);
      localStorage.setItem('reviews', JSON.stringify(sampleReviews));
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem('reviews', JSON.stringify(reviews));
    }
  }, [reviews]);

  const addReview = (review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setReviews(prevReviews => [newReview, ...prevReviews]);
  };

  const getProductReviews = (productId: string): Review[] => {
    return reviews
      .filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getProductAverageRating = (productId: string): number => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;
    
    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / productReviews.length) * 10) / 10;
  };

  const getProductReviewCount = (productId: string): number => {
    return getProductReviews(productId).length;
  };

  const hasUserReviewed = (productId: string, userId: string): boolean => {
    return reviews.some(review => review.productId === productId && review.userId === userId);
  };

  const value: ReviewContextType = {
    reviews,
    addReview,
    getProductReviews,
    getProductAverageRating,
    getProductReviewCount,
    hasUserReviewed,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};