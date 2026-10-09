import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, ChevronRight, ArrowLeft, AlertCircle, Search, ChevronLeft, MessageCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/products';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  whatsapp_notified?: boolean;
  whatsapp_last_resend_at?: string | null;
  whatsapp_resend_count?: number;
  customer_name?: string | null;
}

interface OrderItem {
  id: string;
  product_id: number;
  product_title: string;
  product_price: number;
  quantity: number;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const getStatusIndex = (status: string) => {
  const i = statusSteps.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const OrdersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [waNumber, setWaNumber] = useState('254769353430');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'whatsapp_business_number').maybeSingle()
      .then(({ data }) => { if (data?.value) setWaNumber(String(data.value).replace(/\D/g, '')); });
  }, []);

  const handleResendWhatsapp = async () => {
    if (!selected) return;
    setResending(true);
    try {
      // Build message with order summary
      const addr = selected.shipping_address || {};
      const lines = [
        `🔁 *Order Resend #${selected.id.slice(0, 8).toUpperCase()}*`,
        ``,
        `*Customer:* ${addr.full_name || selected.customer_name || ''}`,
        `*Phone:* ${addr.phone || ''}`,
        ``,
        `*Items:*`,
        ...items.map(i => `• ${i.product_title} × ${i.quantity} — ${formatPrice(i.product_price * i.quantity)}`),
        ``,
        `*Total:* ${formatPrice(selected.total_amount)}`,
        `*Status:* ${selected.status}`,
      ];
      const text = encodeURIComponent(lines.join('\n'));
      const w = window.open(`https://wa.me/${waNumber}?text=${text}`, '_blank', 'noopener,noreferrer');
      const now = new Date().toISOString();
      const newCount = (selected.whatsapp_resend_count || 0) + 1;
      const { error } = await supabase
        .from('orders')
        .update({
          whatsapp_last_resend_at: now,
          whatsapp_resend_count: newCount,
          whatsapp_notified: true,
        })
        .eq('id', selected.id);
      if (error) throw error;
      setSelected({ ...selected, whatsapp_last_resend_at: now, whatsapp_resend_count: newCount, whatsapp_notified: true });
      setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, whatsapp_last_resend_at: now, whatsapp_resend_count: newCount, whatsapp_notified: true } : o));
      if (w) toast.success('WhatsApp resend opened — send the message to confirm.');
      else toast.warning('Pop-up blocked — open WhatsApp manually.');
    } catch (e) {
      console.error(e);
      toast.error('Could not log WhatsApp resend');
    } finally {
      setResending(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(o => {
      if (statusFilter === 'completed') {
        if (o.status !== 'delivered') return false;
      } else if (statusFilter !== 'all') {
        if (o.status !== statusFilter) return false;
      }
      if (!q) return true;
      return o.id.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q) ||
        String(o.total_amount).includes(q);
    });
  }, [orders, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageOrders = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, statusFilter]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const openOrder = async (o: Order) => {
    setSelected(o);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', o.id);
    setItems((data as OrderItem[]) ?? []);
  };

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader title="My Orders" />
      <main className="container mx-auto px-4 py-8 mt-20 max-w-3xl">
        <h1 className="text-2xl font-bold mb-1">My Orders</h1>
        <p className="text-sm text-muted-foreground mb-6">View status, items, totals, and shipping for every order.</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading orders…</div>
        ) : selected ? (
          <Card className="p-5 bg-white text-gray-900 border-2 border-primary/20">
            <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-3">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <h2 className="text-lg font-bold text-primary mb-4">Order #{selected.id.slice(0, 8).toUpperCase()}</h2>

            {/* timeline */}
            <div className="relative bg-gradient-to-r from-primary/5 to-secondary/5 p-5 rounded-xl mb-5">
              <div className="flex justify-between">
                {statusSteps.map((step, idx) => {
                  const cur = getStatusIndex(selected.status);
                  const done = idx <= cur;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`text-xs mt-2 text-center ${done ? 'text-green-700 font-medium' : 'text-gray-400'}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
              {selected.status === 'cancelled' && (
                <div className="mt-4 flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" /> This order was cancelled.
                </div>
              )}
              <div className={`mt-3 text-xs px-3 py-2 rounded-md border ${
                selected.whatsapp_notified
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {selected.whatsapp_notified
                  ? '✓ WhatsApp confirmation link was opened for this order.'
                  : '⚠ WhatsApp confirmation link was not opened — please contact us via WhatsApp.'}
              </div>
              {(selected.whatsapp_resend_count ?? 0) > 0 && (
                <div className="mt-2 text-xs px-3 py-2 rounded-md border bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" />
                  Last resend: {selected.whatsapp_last_resend_at ? formatDate(selected.whatsapp_last_resend_at) : '—'} · Total resends: {selected.whatsapp_resend_count}
                </div>
              )}
              {isAdmin && (
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleResendWhatsapp}
                    disabled={resending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {resending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
                    Resend WhatsApp confirmation
                  </Button>
                </div>
              )}
            </div>

            {selected.shipping_address && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2 text-emerald-800">
                  <MapPin className="w-4 h-4" /> Shipping
                </h4>
                <p className="text-sm font-medium">{selected.shipping_address.full_name}</p>
                <p className="text-sm">{selected.shipping_address.address_line1}</p>
                {selected.shipping_address.address_line2 && <p className="text-sm">{selected.shipping_address.address_line2}</p>}
                <p className="text-sm">{selected.shipping_address.city} {selected.shipping_address.postal_code}</p>
                {selected.shipping_address.phone && (
                  <p className="text-sm flex items-center gap-1 mt-1"><Phone className="w-3 h-3" /> {selected.shipping_address.phone}</p>
                )}
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Items</h4>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <div>
                      <p className="font-medium">{it.product_title}</p>
                      <p className="text-sm text-gray-500">{formatPrice(it.product_price)} × {it.quantity}</p>
                    </div>
                    <p className="font-bold text-primary">{formatPrice(it.product_price * it.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary/20">
                <span className="font-bold">Total</span>
                <span className="font-bold text-xl text-primary">{formatPrice(selected.total_amount)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-4 space-y-0.5">
              <p>Placed: {formatDate(selected.created_at)}</p>
              <p>Updated: {formatDate(selected.updated_at)}</p>
              {selected.whatsapp_last_resend_at && (
                <p>Latest WhatsApp resend: {formatDate(selected.whatsapp_last_resend_at)} ({selected.whatsapp_resend_count || 0}×)</p>
              )}
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border">
            <Package className="w-14 h-14 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No orders yet</p>
            <Button className="mt-4" onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Pending' },
                { key: 'processing', label: 'Processing' },
                { key: 'completed', label: 'Completed' },
              ] as const).map(chip => (
                <button
                  key={chip.key}
                  onClick={() => setStatusFilter(chip.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    statusFilter === chip.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order ID, status, or amount…"
                className="pl-9 bg-white text-gray-900 border-gray-300"
              />
            </div>

            {pageOrders.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No orders match your search.</p>
            ) : pageOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => openOrder(o)}
                className="w-full text-left p-4 bg-white text-gray-900 border-2 border-gray-200 rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatPrice(o.total_amount)}</p>
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize bg-gray-100 text-gray-700 border border-gray-300">
                        {o.status}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </button>
            ))}

            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
      <SimpleFooter />
    </div>
  );
};

export default OrdersPage;
