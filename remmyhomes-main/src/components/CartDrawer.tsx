import { X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, formatPrice } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CheckoutModal } from '@/components/modals/CheckoutModal';
import { LoginModal, SignupModal } from '@/components/modals/AuthModals';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: (Product & { qty: number })[];
  total: number;
  onRemove: (id: number) => void;
  onClear: () => void;
}

const CartDrawer = ({ isOpen, onClose, items, total, onRemove, onClear }: CartDrawerProps) => {
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!user) {
      setLoginOpen(true);
      return;
    }

    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    onClear();
    onClose();
    toast.success('Order placed successfully!');
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-background/50 z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-screen w-full max-w-[400px] bg-white shadow-2xl z-50 overflow-y-auto border-l-4 border-primary"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary to-secondary p-4 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-primary-foreground">🛒 Your Cart</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={onClear}
                      className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20"
                    >
                      Clear
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={onClose}
                      className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/20"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-gray-400 text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">🛒</div>
                    <p className="font-medium text-gray-500">Cart is empty</p>
                    <p className="text-sm text-gray-400 mt-1">Add some products to get started</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center p-3 border-2 border-gray-200 rounded-lg bg-white hover:border-primary/30 transition-colors shadow-sm">
                      <img 
                        src={item.img} 
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-gray-900">{item.title}</div>
                        <div className="text-gray-500 text-sm">
                          {formatPrice(item.price)} × {item.qty}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary mb-1">
                          {formatPrice(item.price * item.qty)}
                        </div>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-4 bg-primary/10 p-3 rounded-lg">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-2xl text-primary">{formatPrice(total)}</span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  disabled={items.length === 0}
                  className="w-full bg-green-600 text-white hover:bg-green-700 font-bold text-lg py-6 shadow-lg disabled:opacity-50"
                >
                  {user ? '✅ Proceed to Checkout' : '🔐 Login to Checkout'}
                </Button>
                {!user && (
                  <div className="text-center text-gray-500 text-xs mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                    ⚠️ Login required to complete purchase
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        total={total}
        onSuccess={handleCheckoutSuccess}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => setSignupOpen(true)}
      />
      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
    </>
  );
};

export default CartDrawer;
