import { useState } from 'react';
import { Star, ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ProductReviewsProps {
  productId: number;
  productTitle: string;
}

export const ProductReviews = ({ productId, productTitle }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { 
    reviews, 
    loading, 
    userReview, 
    submitReview, 
    deleteReview,
    getAverageRating,
    getRatingDistribution 
  } = useProductReviews(productId);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const avgRating = getAverageRating();
  const distribution = getRatingDistribution();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    const result = await submitReview(productId, rating, title, reviewText);
    
    if (!result.error) {
      setShowForm(false);
      setTitle('');
      setReviewText('');
      setRating(5);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (userReview) {
      await deleteReview(userReview.id);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center md:w-1/3">
          <div className="text-4xl font-bold text-foreground">{avgRating || '-'}</div>
          <div className="flex justify-center my-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= Math.round(avgRating) ? 'fill-accent text-accent' : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          <div className="text-sm text-muted-foreground">{reviews.length} reviews</div>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-3">{stars}</span>
              <Star className="w-4 h-4 fill-accent text-accent" />
              <Progress 
                value={reviews.length ? (distribution[stars] / reviews.length) * 100 : 0} 
                className="flex-1 h-2"
              />
              <span className="text-sm text-muted-foreground w-8">{distribution[stars]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {user && !userReview && (
        <Button onClick={() => setShowForm(!showForm)} variant="outline">
          Write a Review
        </Button>
      )}

      {/* User's existing review */}
      {userReview && (
        <div className="p-4 border border-primary/30 rounded-lg bg-primary/5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-sm text-primary font-medium">Your Review</span>
              <div className="flex mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= userReview.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
          {userReview.title && <h4 className="font-semibold">{userReview.title}</h4>}
          {userReview.review_text && <p className="text-sm text-muted-foreground mt-1">{userReview.review_text}</p>}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Review (optional)</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.filter(r => r.id !== userReview?.id).map(review => (
          <div key={review.id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= review.rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              {review.verified_purchase && (
                <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                  Verified Purchase
                </span>
              )}
            </div>
            {review.title && <h4 className="font-semibold">{review.title}</h4>}
            {review.review_text && (
              <p className="text-sm text-muted-foreground mt-1">{review.review_text}</p>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              {new Date(review.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </div>
        )}
      </div>
    </div>
  );
};
