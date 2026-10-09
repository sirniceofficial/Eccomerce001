import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Product, PRODUCTS } from '@/lib/products';

interface ProductCatalogContextValue {
  products: Product[];
  refreshProducts: () => Promise<void>;
}

const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null);

const mapDatabaseProduct = (
  row: {
    storefront_id: number;
    title: string;
    description: string | null;
    category: string;
    price: number;
    sale_price: number | null;
    image_url: string | null;
  },
  fallback?: Product,
): Product => ({
  id: row.storefront_id,
  title: row.title,
  price: row.sale_price ?? Number(row.price),
  originalPrice: row.sale_price == null ? undefined : Number(row.price),
  sku: fallback?.sku ?? `HUB-${row.storefront_id}`,
  img: row.image_url ?? fallback?.img ?? '',
  category: row.category,
  badge: fallback?.badge ?? (row.sale_price == null ? undefined : 'SALE'),
  description: row.description ?? undefined,
});

export const ProductCatalogProvider = ({ children }: { children: React.ReactNode }) => {
  const [databaseProducts, setDatabaseProducts] = useState<Product[] | null>(null);
  const [hiddenProductIds, setHiddenProductIds] = useState<Set<number>>(new Set());

  const refreshProducts = useCallback(async () => {
    const loadAllPages = async <T,>(loadPage: (from: number, to: number) => PromiseLike<{
      data: T[] | null;
      error: { message: string } | null;
    }>) => {
      const rows: T[] = [];
      for (let from = 0; ; from += 500) {
        const { data, error } = await loadPage(from, from + 499);
        if (error) return { data: null, error };
        rows.push(...(data ?? []));
        if (!data || data.length < 500) return { data: rows, error: null };
      }
    };

    const [productsResult, visibilityResult] = await Promise.all([
      loadAllPages((from, to) => supabase
        .from('products')
        .select('storefront_id,title,description,category,price,sale_price,image_url')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .order('storefront_id', { ascending: true })
        .range(from, to)),
      loadAllPages((from, to) => supabase
        .from('product_visibility')
        .select('storefront_id,is_active')
        .order('storefront_id', { ascending: true })
        .range(from, to)),
    ]);

    if (productsResult.error || visibilityResult.error) {
      const error = productsResult.error ?? visibilityResult.error;
      console.error('Could not load the product catalog:', error);
      toast.error(`Could not refresh products from the store database: ${error.message}`);
      return;
    }

    const staticById = new Map(PRODUCTS.map((product) => [product.id, product]));
    setDatabaseProducts((productsResult.data ?? []).map((row) =>
      mapDatabaseProduct(row, staticById.get(row.storefront_id)),
    ));
    setHiddenProductIds(new Set((visibilityResult.data ?? [])
      .filter((row) => !row.is_active && row.storefront_id !== null)
      .map((row) => row.storefront_id!)));
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const products = useMemo(() => {
    if (databaseProducts === null) return PRODUCTS;

    const databaseById = new Map(databaseProducts.map((product) => [product.id, product]));
    const merged = PRODUCTS
      .filter((product) => !hiddenProductIds.has(product.id))
      .map((product) => databaseById.get(product.id) ?? product);
    const staticIds = new Set(PRODUCTS.map((product) => product.id));
    return [...merged, ...databaseProducts.filter((product) => !staticIds.has(product.id))];
  }, [databaseProducts, hiddenProductIds]);

  const value = useMemo(() => ({ products, refreshProducts }), [products, refreshProducts]);

  return <ProductCatalogContext.Provider value={value}>{children}</ProductCatalogContext.Provider>;
};

export const useProductCatalog = () => {
  const context = useContext(ProductCatalogContext);
  if (!context) {
    throw new Error('useProductCatalog must be used within ProductCatalogProvider');
  }
  return context;
};
