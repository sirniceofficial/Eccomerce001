import { Link } from 'react-router-dom';
import { ChevronRight, Clock, History } from 'lucide-react';
import { Product } from '@/lib/products';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useAuth } from '@/contexts/AuthContext';
import ProductCard from './ProductCard';

interface RecentlyViewedSectionProps {
  onProductClick: (product: Product) => void;
}

const RecentlyViewedSection = ({ onProductClick }: RecentlyViewedSectionProps) => {
  const { user } = useAuth();
  const { getRecentlyViewed, loading } = useUserActivity();
  
  const recentProducts = getRecentlyViewed();

  // Don't show if user is not logged in or no recent products
  if (!user || loading || recentProducts.length === 0) return null;

  return (
    <section className="mt-8 scroll-mt-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <History className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-display text-foreground text-lg md:text-xl">
            Recently Viewed
          </h3>
        </div>
        <div className="text-muted-foreground text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Based on your browsing
        </div>
      </div>
      
      <div className="relative">
        {/* Gradient background for emphasis */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg -m-2 pointer-events-none" />
        
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 relative">
          {recentProducts.map((product, index) => (
            <div key={product.id} className="snap-start shrink-0 w-[150px] sm:w-[170px] md:w-[190px] lg:w-[210px]">
              <ProductCard
                product={product}
                onClick={() => onProductClick(product)}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedSection;