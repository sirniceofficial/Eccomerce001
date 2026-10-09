import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductCatalog } from '@/contexts/ProductCatalogContext';

const WISHLIST_KEY = 'remmy_wishlist';

const parseWishlist = (stored: string): number[] => {
  try {
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.every((id) => Number.isInteger(id))) {
      return parsed;
    }
  } catch (error) {
    console.error('Could not read saved wishlist:', error);
  }

  localStorage.removeItem(WISHLIST_KEY);
  return [];
};

export const useWishlist = () => {
  const { user } = useAuth();
  const { products } = useProductCatalog();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load wishlist from localStorage or database
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('wishlist_items')
          .select('product_id')
          .eq('user_id', user.id);
        
        if (!error && data) {
          setWishlist(data.map(item => item.product_id));
          localStorage.removeItem(WISHLIST_KEY);
        }
        setLoading(false);
      } else {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
          setWishlist(parseWishlist(stored));
        }
      }
    };
    loadWishlist();
  }, [user]);

  // Sync localStorage wishlist to database when user logs in
  useEffect(() => {
    const syncLocalToDb = async () => {
      if (user) {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
          const localWishlist = parseWishlist(stored);
          for (const productId of localWishlist) {
            const product = products.find(p => p.id === productId);
            if (product) {
              await supabase.from('wishlist_items').upsert({
                user_id: user.id,
                product_id: productId,
                product_title: product.title,
                product_price: product.price,
                product_image: product.img,
              }, {
                onConflict: 'user_id,product_id'
              });
            }
          }
          localStorage.removeItem(WISHLIST_KEY);
        }
      }
    };
    syncLocalToDb();
  }, [user, products]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const toggleWishlist = useCallback(async (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isCurrentlyInWishlist = wishlist.includes(productId);

    if (user) {
      if (isCurrentlyInWishlist) {
        await supabase
          .from('wishlist_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        await supabase.from('wishlist_items').insert({
          user_id: user.id,
          product_id: productId,
          product_title: product.title,
          product_price: product.price,
          product_image: product.img,
        });
        setWishlist(prev => [...prev, productId]);
      }
    } else {
      if (isCurrentlyInWishlist) {
        const newWishlist = wishlist.filter(id => id !== productId);
        setWishlist(newWishlist);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
      } else {
        const newWishlist = [...wishlist, productId];
        setWishlist(newWishlist);
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist));
      }
    }
  }, [user, wishlist, products]);

  const getWishlistItems = useCallback(() => {
    return wishlist.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
  }, [wishlist, products]);

  const clearWishlist = useCallback(async () => {
    if (user) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id);
    } else {
      localStorage.removeItem(WISHLIST_KEY);
    }
    setWishlist([]);
  }, [user]);

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    getWishlistItems,
    clearWishlist,
    count: wishlist.length,
  };
};
