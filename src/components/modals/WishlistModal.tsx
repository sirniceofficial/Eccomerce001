import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import { Product, formatPrice } from '@/lib/products';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (id: number) => void;
  onAddToCart: (id: number) => void;
  onProductClick: (product: Product) => void;
}

export const WishlistModal = ({ 
  isOpen, 
  onClose, 
  items, 
  onRemove, 
  onAddToCart,
  onProductClick 
}: WishlistModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card-light text-card-light-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" fill="currentColor" />
            My Wishlist ({items.length} items)
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Your wishlist is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click the heart icon on products to add them here
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 items-center p-3 border border-border rounded-lg hover:bg-muted/10 transition-colors"
              >
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded cursor-pointer"
                  onClick={() => {
                    onProductClick(item);
                    onClose();
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h4 
                    className="font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                    onClick={() => {
                      onProductClick(item);
                      onClose();
                    }}
                  >
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>
                  {item.badge && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-destructive text-destructive-foreground text-xs rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => onAddToCart(item.id)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemove(item.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
