import { Link } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import { Product } from '@/lib/products';
import ProductCard from './ProductCard';
import FlashSaleCountdown from './FlashSaleCountdown';

interface ProductSectionProps {
  id: string;
  title: string;
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart?: (id: number) => void;
  onAddToWishlist?: (id: number) => void;
  categorySlug?: string;
  showViewAll?: boolean;
  isFlashSale?: boolean;
}

const ProductSection = ({ 
  id, 
  title, 
  products, 
  onProductClick, 
  onAddToCart,
  onAddToWishlist,
  categorySlug, 
  showViewAll = true,
  isFlashSale = false,
}: ProductSectionProps) => {
  if (products.length === 0) return null;

  // Extract category slug from id if not provided
  const slug = categorySlug || id.replace('section-', '');

  return (
    <section id={id} className="mt-4 scroll-mt-5 border-t border-border/30 pt-3">
      {/* Flash Sale Header with Countdown */}
      {isFlashSale ? (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="font-display text-foreground text-lg md:text-xl">
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-4">
            <FlashSaleCountdown />
            {showViewAll && (
              <Link 
                to={`/category/${slug}`}
                className="text-primary text-sm font-medium flex items-center gap-1 hover:underline whitespace-nowrap"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-display text-foreground text-lg md:text-xl">{title}</h3>
          {showViewAll && (
            <Link 
              to={`/category/${slug}`}
              className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Products - horizontally scrollable row */}
      <div
        className={`flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 scrollbar-thin ${isFlashSale ? 'pt-2' : ''}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {products.slice(0, 24).map((product, index) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[150px] sm:w-[170px] md:w-[190px] lg:w-[210px]"
          >
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              onAddToCart={onAddToCart ? () => onAddToCart(product.id) : undefined}
              onAddToWishlist={onAddToWishlist ? () => onAddToWishlist(product.id) : undefined}
              index={index}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductSection;