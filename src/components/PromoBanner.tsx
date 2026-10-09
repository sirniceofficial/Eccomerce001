import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_MESSAGE =
  'Up to 30% off TVs, appliances & furniture · Free delivery within CBD · Easy M-Pesa payments';

const PromoBanner = () => {
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('banners')
      .select('title,subtitle')
      .eq('banner_type', 'announcement')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .then(({ data }) => {
        const row = data?.[0];
        if (!cancelled && row?.title) {
          setMessage([row.title, row.subtitle].filter(Boolean).join(' · '));
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-gradient-gold py-2.5 overflow-hidden">
      <p className="container text-center text-primary-foreground font-semibold text-xs sm:text-sm truncate">
        {message}
      </p>
    </div>
  );
};

export default PromoBanner;
