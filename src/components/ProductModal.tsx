import { useState } from 'react';
import { X, Minus, Plus, Expand, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, formatPrice, getRelatedProducts } from '@/lib/products';
import { Button } from '@/components/ui/button';
import ProductCard from './ProductCard';
import ImageGallery, { ZoomModal } from './ImageGallery';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (id: number, qty: number) => void;
  onProductClick: (product: Product) => void;
}

const ProductModal = ({ product, isOpen, onClose, onAddToCart, onProductClick }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isFullscreenZoom, setIsFullscreenZoom] = useState(false);

  if (!product) return null;

  const relatedProducts = getRelatedProducts(product.id, product.category);

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    onAddToCart(product.id, quantity);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-light rounded-lg max-w-[920px] w-full max-h-[90vh] overflow-y-auto p-5 relative shadow-2xl"
            >
              <div className="absolute right-3 top-2 flex items-center gap-2 z-10">
                <button
                  onClick={() => setIsFullscreenZoom(true)}
                  className="text-card-light-foreground/60 hover:text-card-light-foreground transition-colors"
                  title="Fullscreen zoom"
                >
                  <Expand className="w-6 h-6" />
                </button>
                <button 
                  onClick={onClose}
                  className="text-card-light-foreground/60 hover:text-card-light-foreground transition-colors"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-5">
                <ImageGallery mainImage={product.img} productTitle={product.title} />
                
                <div className="flex-1">
                  <h2 className="font-display text-2xl text-card-light-foreground mb-2">
                    {product.title}
                  </h2>
                  <div className="text-primary font-extrabold text-2xl mb-3">
                    {formatPrice(product.price)}
                    {product.originalPrice && (
                      <span className="text-muted-foreground text-base font-normal line-through ml-2">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-card-light-foreground/70 mb-4">
                    High-quality {product.title}. Premium build, excellent value for everyday use!
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    <label className="text-card-light-foreground/80 font-medium">Qty</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className="w-8 h-8 rounded bg-card-light-foreground/10 flex items-center justify-center hover:bg-card-light-foreground/20 transition-colors"
                      >
                        <Minus className="w-4 h-4 text-card-light-foreground" />
                      </button>
                      <span className="w-10 text-center font-semibold text-card-light-foreground">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(q => q + 1)}
                        className="w-8 h-8 rounded bg-card-light-foreground/10 flex items-center justify-center hover:bg-card-light-foreground/20 transition-colors"
                      >
                        <Plus className="w-4 h-4 text-card-light-foreground" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-4">
                    <Button 
                      onClick={handleAddToCart}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 py-2.5 shadow-lg"
                    >
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={handleBuyNow}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-6 py-2.5 shadow-lg border-2 border-primary"
                    >
                      Buy Now
                    </Button>
                  </div>

                  <div className="text-card-light-foreground/60 text-sm">
                    SKU: {product.sku}
                  </div>
                </div>
              </div>

              {relatedProducts.length > 0 && (
                <div className="mt-8 pt-5 border-t-2 border-card-light-foreground/10">
                  <h4 className="text-card-light-foreground font-semibold text-lg mb-3">
                    Related Products You Might Like
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {relatedProducts.map((p) => (
                      <ProductCard 
                        key={p.id} 
                        product={p} 
                        onClick={() => onProductClick(p)} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* WhatsApp Chat Button - Left Side */}
              <a
                href={`https://wa.me/254769353430?text=${encodeURIComponent(`Hi! I'm interested in ${product.title} (${product.sku}) - ${formatPrice(product.price)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 left-6 md:absolute md:bottom-4 md:left-4 z-20 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 group"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium text-sm hidden sm:inline">Chat on WhatsApp</span>
                <span className="font-medium text-sm sm:hidden">Chat</span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ZoomModal
        isOpen={isFullscreenZoom}
        onClose={() => setIsFullscreenZoom(false)}
        image={product.img}
        title={product.title}
      />
    </>
  );
};

export default ProductModal;
