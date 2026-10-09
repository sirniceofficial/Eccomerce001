import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/products';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    postal_code?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  product_id: number;
  product_title: string;
  product_price: number;
  quantity: number;
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string | null;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: string) => {
  const index = statusSteps.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
};

export const OrderTrackingModal = ({ isOpen, onClose, orderId }: OrderTrackingModalProps) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // If orderId is provided, fetch that specific order
  useEffect(() => {
    if (orderId && orders.length > 0) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        handleSelectOrder(order);
      }
    }
  }, [orderId, orders]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    if (isOpen) {
      fetchOrders();
    }
  }, [user, isOpen]);

  const fetchOrderItems = async (orderId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (!error && data) {
      setOrderItems(data as OrderItem[]);
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white text-gray-900 border-2 border-primary/30">
        <DialogHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {selectedOrder ? (
              <>
                <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2 hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <span className="text-primary font-bold">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
              </>
            ) : (
              <>
                <Package className="w-5 h-5 text-primary" />
                Track Your Orders
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-2 text-gray-500">Loading orders...</p>
          </div>
        ) : !selectedOrder ? (
          // Orders List
          <div className="space-y-3 mt-2">
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No orders yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your orders will appear here after checkout
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-primary text-lg">{formatPrice(order.total_amount)}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                            : order.status === 'processing'
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Order Details
          <div className="space-y-6 mt-2">
            {/* Status Timeline */}
            <div className="relative bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl">
              <div className="flex justify-between">
                {statusSteps.map((step, index) => {
                  const currentIndex = getStatusIndex(selectedOrder.status);
                  const isCompleted = index <= currentIndex;
                  const isCurrent = index === currentIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center transition-all
                        ${isCompleted 
                          ? 'bg-green-500 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-400'
                        }
                        ${isCurrent ? 'ring-4 ring-green-200 scale-110' : ''}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className={`text-xs mt-2 text-center font-medium ${
                        isCompleted ? 'text-green-700' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-9 left-0 right-0 h-1 bg-gray-200 -z-10 mx-12 rounded-full">
                <div 
                  className="h-full bg-green-500 transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${(getStatusIndex(selectedOrder.status) / (statusSteps.length - 1)) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shipping_address && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-emerald-800">
                  <MapPin className="w-4 h-4" /> Shipping Address
                </h4>
                <p className="text-sm font-medium text-emerald-900">{selectedOrder.shipping_address.full_name}</p>
                <p className="text-sm text-emerald-700">
                  {selectedOrder.shipping_address.address_line1}
                </p>
                {selectedOrder.shipping_address.address_line2 && (
                  <p className="text-sm text-emerald-700">
                    {selectedOrder.shipping_address.address_line2}
                  </p>
                )}
                <p className="text-sm text-emerald-700">
                  {selectedOrder.shipping_address.city} {selectedOrder.shipping_address.postal_code}
                </p>
                {selectedOrder.shipping_address.phone && (
                  <p className="text-sm flex items-center gap-1 mt-1 text-emerald-800 font-medium">
                    <Phone className="w-3 h-3" /> {selectedOrder.shipping_address.phone}
                  </p>
                )}
              </div>
            )}

            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 text-gray-800">Order Items</h4>
              <div className="space-y-2">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{item.product_title}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.product_price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-primary">
                      {formatPrice(item.product_price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary/20">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-primary">{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            {/* Order Info */}
            <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p>📅 Order placed: {formatDate(selectedOrder.created_at)}</p>
              <p>🔄 Last updated: {formatDate(selectedOrder.updated_at)}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
