import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/products';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProductCatalog } from '@/contexts/ProductCatalogContext';

export interface CartItem {
  id: number;
  qty: number;
}

interface DbCartItem {
  id: string;
  product_id: number;
  quantity: number;
  product_title: string;
  product_price: number;
  product_image: string | null;
}

const CART_KEY = 'remmy_cart';

export const useCart = () => {
  const { user } = useAuth();
  const { products } = useProductCatalog();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load cart from localStorage or database
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        setLoading(true);
        // Load from database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id);
        
        if (!error && data) {
          const dbCart = (data as DbCartItem[]).map(item => ({
            id: item.product_id,
            qty: item.quantity
          }));
          setCart(dbCart);
          // Clear localStorage when synced to DB
          localStorage.removeItem(CART_KEY);
        }
        setLoading(false);
      } else {
        // Load from localStorage for guests
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
          setCart(JSON.parse(stored));
        }
      }
    };
    loadCart();
  }, [user]);

  // Sync localStorage cart to database when user logs in
  useEffect(() => {
    const syncLocalToDb = async () => {
      if (user) {
        const stored = localStorage.getItem(CART_KEY);
        if (stored) {
          const localCart: CartItem[] = JSON.parse(stored);
          for (const item of localCart) {
            const product = products.find(p => p.id === item.id);
            if (product) {
              await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: item.id,
                product_title: product.title,
                product_price: product.price,
                product_image: product.img,
                quantity: item.qty,
              }, {
                onConflict: 'user_id,product_id'
              });
            }
          }
          localStorage.removeItem(CART_KEY);
        }
      }
    };
    syncLocalToDb();
  }, [user, products]);

  const saveToLocalStorage = useCallback((newCart: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  }, []);

  const addToCart = useCallback(async (id: number, qty = 1) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (user) {
      // Check if item exists in cart
      const { data: existing } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .maybeSingle();

      if (existing) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: (existing as DbCartItem).quantity + qty })
          .eq('user_id', user.id)
          .eq('product_id', id);
      } else {
        // Insert new item
        await supabase.from('cart_items').insert({
          user_id: user.id,
          product_id: id,
          product_title: product.title,
          product_price: product.price,
          product_image: product.img,
          quantity: qty,
        });
      }

      // Refresh cart from DB
      const { data } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) {
        setCart((data as DbCartItem[]).map(item => ({
          id: item.product_id,
          qty: item.quantity
        })));
      }
    } else {
      // Guest user - use localStorage
      setCart(prev => {
        const existing = prev.find(item => item.id === id);
        const newCart = existing
          ? prev.map(item => item.id === id ? { ...item, qty: item.qty + qty } : item)
          : [...prev, { id, qty }];
        saveToLocalStorage(newCart);
        return newCart;
      });
    }
  }, [user, saveToLocalStorage, products]);

  const removeFromCart = useCallback(async (id: number) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', id);
      
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => {
        const newCart = prev.filter(item => item.id !== id);
        saveToLocalStorage(newCart);
        return newCart;
      });
    }
  }, [user, saveToLocalStorage]);

  const updateQuantity = useCallback(async (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }

    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity: qty })
        .eq('user_id', user.id)
        .eq('product_id', id);
      
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
    } else {
      setCart(prev => {
        const newCart = prev.map(item => item.id === id ? { ...item, qty } : item);
        saveToLocalStorage(newCart);
        return newCart;
      });
    }
  }, [user, removeFromCart, saveToLocalStorage]);

  const clearCart = useCallback(async () => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    } else {
      localStorage.removeItem(CART_KEY);
    }
    setCart([]);
  }, [user]);

  const getCartItems = useCallback(() => {
    return cart.map(item => {
      const product = products.find(p => p.id === item.id);
      return product ? { ...product, qty: item.qty } : null;
    }).filter(Boolean) as (Product & { qty: number })[];
  }, [cart, products]);

  const getTotal = useCallback(() => {
    return getCartItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [getCartItems]);

  const getItemCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  return {
    cart,
    isOpen,
    setIsOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItems,
    getTotal,
    getItemCount,
  };
};
