import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Package, Heart, Eye, TrendingUp, 
  Sparkles, Loader2, ChevronRight, Clock,
  ShoppingBag, Star, Save
} from 'lucide-react';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserActivity } from '@/hooks/useUserActivity';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice, products } from '@/lib/products';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';
import ProductCard from '@/components/ProductCard';
import LocationPicker, { PickedLocation, MapProvider } from '@/components/LocationPicker';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const CustomerProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();
  const { getRecentlyViewed, getMostViewed, getCategoryPreferences, loading: activityLoading } = useUserActivity();
  const { wishlist } = useWishlist();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address_line1: profile.address_line1 || '',
        address_line2: profile.address_line2 || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
      });
    }
  }, [profile]);

  const [mapProvider, setMapProvider] = useState<MapProvider>('osm');
  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'map_provider').maybeSingle()
      .then(({ data }) => {
        if (data?.value === 'google' || data?.value === 'osm') setMapProvider(data.value as MapProvider);
      });
  }, []);

  const handleLocationSave = async (loc: PickedLocation) => {
    const { error } = await updateProfile({
      latitude: loc.lat,
      longitude: loc.lng,
      location_label: loc.label,
    });
    if (error) toast.error('Could not save location');
    else toast.success('Pickup location saved');
  };

  const handleInlineSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await updateProfile(editForm);
    if (error) toast.error('Could not save profile');
    else toast.success('Profile saved');
    setSavingProfile(false);
  };

  const recentlyViewed = getRecentlyViewed();
  const mostViewed = getMostViewed();
  const categoryPreferences = getCategoryPreferences();

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setOrders(data || []);
    };
    
    fetchOrders();
  }, [user]);

  // Get AI recommendations
  const getAiRecommendations = async () => {
    if (aiLoading) return;
    
    setAiLoading(true);
    try {
      const activities = mostViewed.map(p => ({
        productId: p.id,
        productTitle: p.title,
        category: p.category,
        viewCount: p.viewCount,
      }));

      const recentItems = recentlyViewed.slice(0, 5).map(p => ({ title: p.title }));
      
      // Get purchase history from orders
      const purchaseHistory = orders.length > 0 ? [{ title: 'Previous purchases' }] : [];

      const { data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { activities, recentlyViewed: recentItems, purchaseHistory },
      });

      if (error) throw error;
      setAiRecommendation(data.recommendation);
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      setAiRecommendation('Unable to generate recommendations at this time. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setTrackingModalOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SimpleHeader title="My Profile" />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile?.full_name || 'Welcome!'}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button onClick={() => setProfileModalOpen(true)} variant="outline">
              Edit Profile
            </Button>
          </div>

          {/* Inline Profile Editor */}
          <Card className="mb-6 bg-white text-gray-900 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Edit Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInlineSave} className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="ip-name">Full Name</Label>
                  <Input id="ip-name" value={editForm.full_name}
                    onChange={(e) => setEditForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ip-phone">Phone</Label>
                  <Input id="ip-phone" value={editForm.phone}
                    onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))} placeholder="+254 7..." />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ip-city">City</Label>
                  <Input id="ip-city" value={editForm.city}
                    onChange={(e) => setEditForm(p => ({ ...p, city: e.target.value }))} placeholder="Nairobi" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="ip-addr1">Shipping Address</Label>
                  <Input id="ip-addr1" value={editForm.address_line1}
                    onChange={(e) => setEditForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street, building" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ip-addr2">Address Line 2</Label>
                  <Input id="ip-addr2" value={editForm.address_line2}
                    onChange={(e) => setEditForm(p => ({ ...p, address_line2: e.target.value }))} placeholder="Apt, suite (optional)" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ip-postal">Postal Code</Label>
                  <Input id="ip-postal" value={editForm.postal_code}
                    onChange={(e) => setEditForm(p => ({ ...p, postal_code: e.target.value }))} placeholder="00100" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Pickup Location Picker — saves instantly, reused at checkout */}
          <Card className="mb-6 bg-white text-gray-900 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Pickup / Delivery Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                Pin your location on the map. We auto-save it and reuse it during checkout.
              </p>
              <LocationPicker
                provider={mapProvider}
                value={profile?.latitude && profile?.longitude
                  ? { lat: profile.latitude, lng: profile.longitude, label: profile.location_label || '' }
                  : undefined}
                onChange={handleLocationSave}
                height={260}
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">Orders</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{wishlist.length}</p>
                  <p className="text-sm text-muted-foreground">Wishlist</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{recentlyViewed.length}</p>
                  <p className="text-sm text-muted-foreground">Viewed</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-2xl font-bold">{categoryPreferences.length}</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Recommendations Card */}
          <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Powered Insights
              </CardTitle>
              <Button 
                onClick={getAiRecommendations} 
                disabled={aiLoading}
                size="sm"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {aiRecommendation ? (
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap">{aiRecommendation}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Click "Get Recommendations" to receive personalized shopping insights based on your browsing history and preferences.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs defaultValue="recent" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full max-w-md">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recently Viewed
              </h3>
              {recentlyViewed.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {recentlyViewed.slice(0, 8).map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No recently viewed products</p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                      Start Browsing
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Star className="w-5 h-5" /> Most Viewed Products
              </h3>
              {mostViewed.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mostViewed.slice(0, 8).map(product => (
                    <div key={product.id} className="relative">
                      <ProductCard product={product} />
                      <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        {product.viewCount} views
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No favorite products yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Recent Orders
              </h3>
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Card key={order.id} className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => handleTrackOrder(order.id)}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm text-muted-foreground">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="font-semibold">{formatPrice(order.total_amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered' ? 'bg-accent/20 text-accent' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No orders yet</p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                      Start Shopping
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Your Shopping Insights
              </h3>
              
              {categoryPreferences.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Category Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryPreferences.slice(0, 5).map((cat, index) => (
                          <div key={cat.category} className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm capitalize">{cat.category.replace(/-/g, ' ')}</span>
                                <span className="text-sm text-muted-foreground">{cat.count} views</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ 
                                    width: `${(cat.count / categoryPreferences[0].count) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Shopping Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between py-2 border-b">
                        <span>Total Products Viewed</span>
                        <span className="font-bold">{recentlyViewed.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Categories Explored</span>
                        <span className="font-bold">{categoryPreferences.length}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span>Wishlist Items</span>
                        <span className="font-bold">{wishlist.length}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span>Total Orders</span>
                        <span className="font-bold">{orders.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Browse products to see your shopping insights
                    </p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                      Explore Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <SimpleFooter />
      
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
      <OrderTrackingModal 
        isOpen={trackingModalOpen} 
        onClose={() => setTrackingModalOpen(false)}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default CustomerProfilePage;
