import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ActiveFlashSale {
  id: string;
  name: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
}

/** Reads the currently running flash sale (active, started, not yet ended). */
export const useFlashSale = () => {
  const [sale, setSale] = useState<ActiveFlashSale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from('flash_sales')
        .select('id,name,discount_percent,starts_at,ends_at')
        .eq('is_active', true)
        .lte('starts_at', nowIso)
        .gt('ends_at', nowIso)
        .order('ends_at', { ascending: true })
        .limit(1);
      if (!cancelled) {
        setSale((data?.[0] as ActiveFlashSale) ?? null);
        setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return { sale, loading };
};
