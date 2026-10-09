import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProductReview {
  id: string;
  user_id: string;
  product_id: number;
  rating: number;
  title: string | null;
  review_text: string | null;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductReviews = (productId?: number) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);

  // Fetch reviews for a product
  const fetchReviews = useCallback(async (id?: number) => {
    const targetId = id ?? productId;
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      // Public reviews via view (no user_id exposed)
      const { data, error } = await supabase
        .from('product_reviews_public')
        .select('*')
        .eq('product_id', targetId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data ?? [])
        .filter((review) => review.id !== null && review.product_id !== null && review.rating !== null)
        .map((review) => ({
          ...review,
          id: review.id!,
          product_id: review.product_id!,
          rating: review.rating!,
          verified_purchase: review.verified_purchase ?? false,
          created_at: review.created_at ?? '',
          updated_at: review.updated_at ?? '',
          user_id: '',
        })));

      // Fetch the current user's own review separately
      if (user) {
        const { data: mine } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('product_id', targetId)
          .eq('user_id', user.id)
          .maybeSingle();
        setUserReview(mine);
      } else {
        setUserReview(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Submit a review
  const submitReview = useCallback(async (
    productId: number,
    rating: number,
    title?: string,
    reviewText?: string
  ) => {
    if (!user) {
      toast.error('Please log in to submit a review');
      return { error: 'Not authenticated' };
    }

    // Input validation
    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return { error: 'Invalid rating' };
    }
    if (title && title.length > 150) {
      toast.error('Title must be 150 characters or less');
      return { error: 'Title too long' };
    }
    if (reviewText && reviewText.length > 2000) {
      toast.error('Review must be 2000 characters or less');
      return { error: 'Review too long' };
    }

    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .upsert({
          user_id: user.id,
          product_id: productId,
          rating,
          title,
          review_text: reviewText,
        }, {
          onConflict: 'user_id,product_id',
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Review submitted successfully!');
      fetchReviews(productId);
      return { data };
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [user, fetchReviews]);

  // Delete a review
  const deleteReview = useCallback(async (reviewId: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Review deleted');
      fetchReviews();
      return { success: true };
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }, [user, fetchReviews]);

  // Get average rating
  const getAverageRating = useCallback((): number => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  }, [reviews]);

  // Get rating distribution
  const getRatingDistribution = useCallback((): Record<number, number> => {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return distribution;
  }, [reviews]);

  return {
    reviews,
    loading,
    userReview,
    submitReview,
    deleteReview,
    getAverageRating,
    getRatingDistribution,
    refetch: fetchReviews,
  };
};
