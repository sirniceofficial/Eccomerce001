import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, Users, DollarSign, 
  TrendingUp, Clock, CheckCircle, Truck, 
  AlertCircle, RefreshCw, MessageCircle, Save,
  Boxes, Megaphone, Zap, ShieldAlert
} from 'lucide-react';
import SimpleHeader from '@/components/SimpleHeader';
import ProductsManager from '@/components/admin/ProductsManager';
import BannersManager from '@/components/admin/BannersManager';
import FlashSalesManager from '@/components/admin/FlashSalesManager';
import AuthLogsManager from '@/components/admin/AuthLogsManager';
import SimpleFooter from '@/components/SimpleFooter';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdmin } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/products';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  processing: <RefreshCw className="w-4 h-4" />,
  shipped: <Truck className="w-4 h-4" />,
  delivered: <CheckCircle className="w-4 h-4" />,
  cancelled: <AlertCircle className="w-4 h-4" />,
};

type TabId = 'products' | 'banners' | 'flash' | 'orders' | 'logs';
const TABS: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: 'products', label: 'Products & Inventory', icon: Boxes },
  { id: 'banners', label: 'Promotions & Banners', icon: Megaphone },
  { id: 'flash', label: 'Flash Sales', icon: Zap },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'logs', label: 'Auth Security Logs', icon: ShieldAlert },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, loading, stats, fetchStats, updateOrderStatus } = useAdmin();
  const [tab, setTab] = useState<TabId>('products');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [pending, setPending] = useState<{ orderId: string; newStatus: string } | null>(null);
  const [waNumber, setWaNumber] = useState('');
  const [savingWa, setSavingWa] = useState(false);
  const [mapProvider, setMapProvider] = useState<'osm' | 'google'>('osm');
  const [savingMap, setSavingMap] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from('app_settings').select('key,value').in('key', ['whatsapp_business_number','map_provider'])
      .then(({ data }) => {
        const wa = data?.find(d => d.key === 'whatsapp_business_number');
        if (wa?.value) setWaNumber(String(wa.value));
        const mp = data?.find(d => d.key === 'map_provider');
        if (mp?.value === 'google' || mp?.value === 'osm') setMapProvider(mp.value);
      });
  }, [isAdmin]);

  const saveWhatsappNumber = async () => {
    const cleaned = waNumber.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast.error('Enter a valid WhatsApp number with country code');
      return;
    }
    setSavingWa(true);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'whatsapp_business_number', value: cleaned, updated_at: new Date().toISOString() });
    setSavingWa(false);
    if (error) toast.error('Failed to save number');
    else { toast.success('WhatsApp number saved'); setWaNumber(cleaned); }
  };

  const saveMapProvider = async (next: 'osm' | 'google') => {
    setSavingMap(true);
    setMapProvider(next);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: 'map_provider', value: next, updated_at: new Date().toISOString() });
    setSavingMap(false);
    if (error) toast.error('Failed to save map provider');
    else toast.success(`Map provider set to ${next === 'google' ? 'Google Maps' : 'OpenStreetMap'}`);
  };

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin, fetchStats]);

  const requestStatusChange = (orderId: string, newStatus: string) => {
    setPending({ orderId, newStatus });
  };

  const confirmStatusChange = async () => {
    if (!pending) return;
    const { orderId, newStatus } = pending;
    setUpdatingOrder(orderId);
    setPending(null);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      fetchStats();
    }
    setUpdatingOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader title="Admin Dashboard" />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 shrink-0">
            <div className="flex items-center gap-2 mb-4 px-1">
              <LayoutDashboard className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Admin</h1>
            </div>
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:sticky md:top-24">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm whitespace-nowrap text-left transition-colors ${
                    tab === t.id ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">
          {tab === 'products' && <ProductsManager />}
          {tab === 'banners' && <BannersManager />}
          {tab === 'flash' && <FlashSalesManager />}
          {tab === 'logs' && <AuthLogsManager />}
          {tab === 'orders' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                  </div>
                  <Package className="w-10 h-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Orders</p>
                    <p className="text-3xl font-bold">{stats?.pendingOrders || 0}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-3xl font-bold">{stats?.totalCustomers || 0}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Orders by Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats?.ordersByStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${statusColors[status]}`}>
                        {statusIcons[status]}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="capitalize">{status}</span>
                          <span className="font-bold">{count as number}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ 
                              width: `${((count as number) / (stats?.totalOrders || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart (Simple) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.revenueByDay?.map((day) => (
                    <div key={day.date} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-24">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ 
                            width: `${Math.max(2, (day.revenue / Math.max(...stats.revenueByDay.map(d => d.revenue), 1)) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-28 text-right">
                        {formatPrice(day.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* WhatsApp Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp Business Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Used for auto-sending order confirmation messages from checkout. Include country code, no '+'.
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="wa">Number (e.g. 254769353430)</Label>
                  <Input
                    id="wa"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="254769353430"
                  />
                </div>
                <Button onClick={saveWhatsappNumber} disabled={savingWa}>
                  {savingWa ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Map Provider Setting */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Map Provider (Pickup Picker)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Switch the map tiles used in the checkout & profile location pickers. Both options work without API keys.
              </p>
              <div className="flex gap-2">
                <Button
                  variant={mapProvider === 'osm' ? 'default' : 'outline'}
                  onClick={() => saveMapProvider('osm')}
                  disabled={savingMap}
                >
                  OpenStreetMap
                </Button>
                <Button
                  variant={mapProvider === 'google' ? 'default' : 'outline'}
                  onClick={() => saveMapProvider('google')}
                  disabled={savingMap}
                >
                  Google Maps
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentOrders?.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.total_amount)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => requestStatusChange(order.id, value)}
                          disabled={updatingOrder === order.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No orders yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
          )}
          </div>
        </div>
      </main>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm status change</AlertDialogTitle>
            <AlertDialogDescription>
              Move order #{pending?.orderId.slice(0, 8).toUpperCase()} to{' '}
              <span className="font-semibold capitalize">{pending?.newStatus}</span>?
              This action is logged and notifies the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SimpleFooter />
    </div>
  );
};

export default AdminDashboard;
