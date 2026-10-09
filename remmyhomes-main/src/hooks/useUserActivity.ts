import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/lib/products';
import { useProductCatalog } from '@/contexts/ProductCatalogContext';

interface UserActivity {
  id: string;
  product_id: number;
  activity_type: string;
  view_count: number;
  last_viewed_at: string;
}

export const useUserActivity = () => {
  const { user } = useAuth();
  const { products } = useProductCatalog();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user activities
  const fetchActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('last_viewed_at', { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Track product view
  const trackProductView = useCallback(async (productId: number) => {
    if (!user) return;

    try {
      // Check if activity exists
      const { data: existing } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('activity_type', 'view')
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('user_activity')
          .update({
            view_count: existing.view_count + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Create new
        await supabase
          .from('user_activity')
          .insert({
            user_id: user.id,
            product_id: productId,
            activity_type: 'view',
            view_count: 1,
          });
      }

      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error('Error tracking product view:', error);
    }
  }, [user, fetchActivities]);

  // Get recently viewed products
  const getRecentlyViewed = useCallback((): Product[] => {
    return activities
      .filter(a => a.activity_type === 'view')
      .slice(0, 10)
      .map(a => products.find(p => p.id === a.product_id))
      .filter(Boolean) as Product[];
  }, [activities, products]);

  // Get most viewed products
  const getMostViewed = useCallback((): (Product & { viewCount: number })[] => {
    return activities
      .filter(a => a.activity_type === 'view')
      .sort((a, b) => b.view_count - a.view_count)
      .slice(0, 10)
      .map(a => {
        const product = products.find(p => p.id === a.product_id);
        return product ? { ...product, viewCount: a.view_count } : null;
      })
      .filter(Boolean) as (Product & { viewCount: number })[];
  }, [activities, products]);

  // Get category preferences
  const getCategoryPreferences = useCallback((): { category: string; count: number }[] => {
    const categoryCount: Record<string, number> = {};
    
    activities.forEach(activity => {
      const product = products.find(p => p.id === activity.product_id);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + activity.view_count;
      }
    });

    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [activities, products]);

  return {
    activities,
    loading,
    trackProductView,
    getRecentlyViewed,
    getMostViewed,
    getCategoryPreferences,
    refetch: fetchActivities,
  };
};
