import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, User, CheckCircle, MessageSquare } from "lucide-react";
import { useReviews } from "@/contexts/ReviewContext";
import { getCookie } from "@/lib/getUser";

interface ReviewsSectionProps {
  productId: string;
  productName: string;
}

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, productName, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addReview } = useReviews();
  const user = getCookie();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    addReview({
      productId,
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest User',
      rating,
      comment: comment.trim(),
      verified: false,
    });

    setComment("");
    setRating(5);
    setIsSubmitting(false);
    onSubmit();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Write a Review
        </h3>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Share your experience with ${productName}...`}
              className="min-h-[100px]"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || !comment.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId, productName }) => {
  const [showForm, setShowForm] = useState(false);
  const { getProductReviews, getProductAverageRating, getProductReviewCount } = useReviews();

  const reviews = getProductReviews(productId);
  const averageRating = getProductAverageRating(productId);
  const reviewCount = getProductReviewCount(productId);

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
            style={{ width: size, height: size }}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      {/* Rating Summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800 mb-2">
                {averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(averageRating), 24)}
              <p className="text-sm text-gray-500 mt-2">
                Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 w-full">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-sm w-8">{star} star</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Write Review Button */}
            <div>
              <Button 
                onClick={() => setShowForm(!showForm)}
                className="whitespace-nowrap"
              >
                {showForm ? 'Cancel' : 'Write a Review'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (
        <ReviewForm 
          productId={productId} 
          productName={productName}
          onSubmit={() => setShowForm(false)} 
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 rounded-full p-2">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.userName}</span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                  {renderStars(review.rating, 16)}
                </div>
                <p className="text-gray-700 mt-3">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;