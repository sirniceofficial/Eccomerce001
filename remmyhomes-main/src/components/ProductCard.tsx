import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';
import ProductImage from './ProductImage';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onQuickView?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  index?: number;
  rating?: number;
  reviewCount?: number;
}

const ProductCard = ({
  product,
  onClick,
  onQuickView,
  onAddToCart,
  onAddToWishlist,
  index = 0,
  rating = 0,
  reviewCount = 0,
}: ProductCardProps) => {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const openDetails = () => {
    if (onQuickView) onQuickView();
    else onClick?.();
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    openDetails();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWishlist?.();
  };

  // Mobile: tapping the card opens a quick-action bottom sheet (no hover needed)
  const handleCardClick = () => {
    if (isMobile) {
      setSheetOpen(true);
      return;
    }
    onClick?.();
  };

  // Generate a mock rating based on product id for demo purposes
  const displayRating = rating > 0 ? rating : ((product.id % 5) + 3) / 1.2 + 1;
  const displayReviewCount = reviewCount > 0 ? reviewCount : (product.id % 50) + 5;

  const renderStars = () => {
    const fullStars = Math.floor(displayRating);
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < fullStars ? 'fill-primary text-primary' : 'text-muted-foreground/40'}`}
      />
    ));
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={handleCardClick}
        className="w-full h-full flex flex-col bg-card-light rounded-xl p-1.5 md:p-2.5 cursor-pointer border border-border/50 shadow-sm transition-all md:hover:-translate-y-1 md:hover:shadow-xl active:scale-95 md:active:scale-100 group relative"
      >
        <div className="overflow-hidden rounded-lg relative h-[80px] md:h-[150px] shrink-0">
          <ProductImage
            src={product.img}
            alt={product.title}
            category={product.category}
            className="rounded-lg transition-transform duration-300 md:group-hover:scale-105"
          />

          {/* Hover overlay actions — desktop only */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-2">
            <button
              onClick={handleQuickView}
              className="w-10 h-10 rounded-full bg-card-light text-card-light-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-lg"
              title="Quick View"
              aria-label="Quick view"
            >
              <Eye className="w-5 h-5" />
            </button>
            {onAddToCart && (
              <button
                onClick={handleAddToCart}
                className="w-10 h-10 rounded-full bg-card-light text-card-light-foreground flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 shadow-lg"
                title="Add to Cart"
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            )}
            {onAddToWishlist && (
              <button
                onClick={handleAddToWishlist}
                className="w-10 h-10 rounded-full bg-card-light text-card-light-foreground flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-all hover:scale-110 shadow-lg"
                title="Add to Wishlist"
                aria-label="Add to wishlist"
              >
                <Heart className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sale Badge */}
          {product.badge && (
            <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[9px] md:text-xs font-bold px-1.5 py-0.5 rounded shadow-md">
              {product.badge}
            </div>
          )}

          {/* Discount percentage */}
          {product.originalPrice && (
            <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] md:text-[10px] font-bold px-1 py-0.5 rounded">
              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </div>
          )}
        </div>

        <div className="p-1 md:p-2 flex flex-col flex-1">
          {/* Star Rating */}
          <div className="flex items-center gap-0.5 mb-0.5 h-4">
            <div className="flex items-center">{renderStars()}</div>
            <span className="text-[9px] md:text-[10px] text-muted-foreground">
              ({displayReviewCount})
            </span>
          </div>

          {/* Product Title — fixed height keeps rows aligned */}
          <div className="font-bold text-xs md:text-sm text-card-light-foreground leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
            {product.title}
          </div>

          {/* Price */}
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <span className="text-primary font-extrabold text-sm md:text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-[10px] md:text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile quick-action sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="text-left">
            <SheetTitle className="text-base line-clamp-2">{product.title}</SheetTitle>
          </SheetHeader>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
              <ProductImage src={product.img} alt={product.title} category={product.category} />
            </div>
            <div className="text-primary font-extrabold text-lg">{formatPrice(product.price)}</div>
          </div>
          <div className="grid gap-2 mt-4">
            <button
              onClick={() => {
                setSheetOpen(false);
                openDetails();
              }}
              className="w-full py-3 rounded-xl bg-muted text-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Eye className="w-4 h-4" /> View details
            </button>
            {onAddToCart && (
              <button
                onClick={() => {
                  setSheetOpen(false);
                  onAddToCart();
                }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <ShoppingCart className="w-4 h-4" /> Add to cart
              </button>
            )}
            {onAddToWishlist && (
              <button
                onClick={() => {
                  setSheetOpen(false);
                  onAddToWishlist();
                }}
                className="w-full py-3 rounded-xl border border-border text-foreground font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Heart className="w-4 h-4" /> Save to wishlist
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ProductCard;
