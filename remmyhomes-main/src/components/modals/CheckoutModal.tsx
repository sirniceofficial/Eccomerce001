import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, Package, MapPin, Phone, CreditCard, MessageCircle } from 'lucide-react';
import LocationPicker, { PickedLocation, MapProvider } from '@/components/LocationPicker';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, formatPrice } from '@/lib/products';
import { buildWhatsAppOrderUrl } from '@/lib/whatsapp';

// Kenyan phone: accepts 07XXXXXXXX, 01XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX
const phoneRegex = /^(?:\+?254|0)(?:7|1)\d{8}$/;
const shippingSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  phone: z.string().trim().regex(phoneRegex, 'Enter a valid Kenyan phone number'),
  addressLine1: z.string().trim().min(3, 'Address is required').max(200),
  addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required').max(100),
  postalCode: z.string().trim().max(20).optional().or(z.literal('')),
});

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: (Product & { qty: number })[];
  total: number;
  onSuccess: () => void;
}

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingInfo {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
}

export const CheckoutModal = ({ isOpen, onClose, items, total, onSuccess }: CheckoutModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<'idle' | 'sent' | 'failed'>('idle');
  const [whatsappNumber, setWhatsappNumber] = useState<string>('254769353430');
  const [mapProvider, setMapProvider] = useState<MapProvider>('osm');
  const [pickedLocation, setPickedLocation] = useState<PickedLocation | null>(
    profile?.latitude && profile?.longitude
      ? { lat: profile.latitude, lng: profile.longitude, label: profile.location_label || '' }
      : null
  );

  useEffect(() => {
    supabase.from('app_settings').select('key,value').in('key', ['whatsapp_business_number','map_provider'])
      .then(({ data }) => {
        const wa = data?.find(d => d.key === 'whatsapp_business_number');
        if (wa?.value) setWhatsappNumber(String(wa.value).replace(/\D/g, ''));
        const mp = data?.find(d => d.key === 'map_provider');
        if (mp?.value === 'google' || mp?.value === 'osm') setMapProvider(mp.value as MapProvider);
      });
  }, []);

  const handleLocationChange = (loc: PickedLocation) => {
    setPickedLocation(loc);
    // Persist to profile so it's reusable next time
    if (user) {
      updateProfile({
        latitude: loc.lat,
        longitude: loc.lng,
        location_label: loc.label,
      }).catch(() => { /* non-blocking */ });
    }
  };

  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    addressLine1: profile?.address_line1 || '',
    addressLine2: profile?.address_line2 || '',
    city: profile?.city || '',
    postalCode: profile?.postal_code || '',
  });

  const [mpesaPhone, setMpesaPhone] = useState(profile?.phone || '');

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = shippingSchema.safeParse(shipping);
    if (!result.success) {
      toast.error(result.error.errors[0]?.message ?? 'Please complete the shipping form');
      return;
    }
    setStep('payment');
  };

  const handlePayment = async () => {
    if (!phoneRegex.test(mpesaPhone.trim())) {
      toast.error('Enter a valid Kenyan M-Pesa phone number');
      return;
    }
    if (!user) {
      toast.error('Please log in to complete your order');
      return;
    }
    const reCheck = shippingSchema.safeParse(shipping);
    if (!reCheck.success) {
      toast.error(reCheck.error.errors[0]?.message ?? 'Invalid shipping details');
      setStep('shipping');
      return;
    }
    setLoading(true);
    
    try {
      // Server-side order creation with authoritative pricing
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          cart: items.map(item => ({ product_id: item.id, qty: item.qty })),
          shipping: {
            full_name: shipping.fullName,
            phone: shipping.phone,
            address_line1: shipping.addressLine1,
            address_line2: shipping.addressLine2,
            city: shipping.city,
            postal_code: shipping.postalCode,
          },
        },
      });

      if (error || !data?.order_id) {
        throw new Error(data?.error || error?.message || 'Failed to create order');
      }

      // Simulate M-Pesa STK push
      await new Promise(resolve => setTimeout(resolve, 2000));

      setOrderId(data.order_id);
      setStep('confirmation');
      onSuccess();

      // Auto-send order details to business WhatsApp using shared builder
      try {
        const url = buildWhatsAppOrderUrl(whatsappNumber, {
          orderId: data.order_id,
          customerName: shipping.fullName,
          shippingPhone: shipping.phone,
          mpesaPhone,
          addressLine1: shipping.addressLine1,
          addressLine2: shipping.addressLine2,
          city: shipping.city,
          postalCode: shipping.postalCode,
          pickupLocation: pickedLocation,
          items: items.map(i => ({ title: i.title, qty: i.qty, price: i.price })),
          total,
        });
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (w) {
          setWhatsappStatus('sent');
          toast.success('WhatsApp message opened — send it to confirm with us');
          await supabase.from('orders').update({ whatsapp_notified: true }).eq('id', data.order_id);
        } else {
          setWhatsappStatus('failed');
          toast.error('WhatsApp window was blocked — open it manually from your order');
        }
      } catch (e) {
        console.warn('WhatsApp open failed', e);
        setWhatsappStatus('failed');
        toast.error('Could not open WhatsApp');
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('shipping');
    setOrderId(null);
    setWhatsappStatus('idle');
    onClose();
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-white text-gray-900 border-2 border-primary/30">
        <DialogHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-lg">
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {step === 'shipping' && <><MapPin className="w-5 h-5 text-primary" /> Shipping Details</>}
            {step === 'payment' && <><CreditCard className="w-5 h-5 text-primary" /> Payment</>}
            {step === 'confirmation' && <><CheckCircle className="w-5 h-5 text-green-600" /> Order Confirmed</>}
          </DialogTitle>
        </DialogHeader>

        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-700 font-medium">Full Name *</Label>
              <Input
                id="fullName"
                value={shipping.fullName}
                onChange={(e) => setShipping(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="John Doe"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number *</Label>
              <Input
                id="phone"
                value={shipping.phone}
                onChange={(e) => setShipping(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="0712 345 678"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1" className="text-gray-700 font-medium">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={shipping.addressLine1}
                onChange={(e) => setShipping(prev => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="Street address"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2" className="text-gray-700 font-medium">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={shipping.addressLine2}
                onChange={(e) => setShipping(prev => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Apartment, suite, etc. (optional)"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700 font-medium">City *</Label>
                <Input
                  id="city"
                  value={shipping.city}
                  onChange={(e) => setShipping(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Nairobi"
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode" className="text-gray-700 font-medium">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={shipping.postalCode}
                  onChange={(e) => setShipping(prev => ({ ...prev, postalCode: e.target.value }))}
                  placeholder="00100"
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-primary"
                />
              </div>
            </div>

            {/* Real-time pickup location */}
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Pickup / Delivery Location (optional)
              </Label>
              <p className="text-xs text-gray-500">Drop the pin or use your current location — saved to your profile and sent to our team.</p>
              <LocationPicker
                value={pickedLocation ? { lat: pickedLocation.lat, lng: pickedLocation.lng, label: pickedLocation.label } : undefined}
                onChange={handleLocationChange}
                provider={mapProvider}
                height={240}
              />
            </div>

            {/* Order Summary */}
            <div className="border-t-2 border-primary/20 pt-4 mt-4 bg-amber-50/50 -mx-6 px-6 pb-4 rounded-b">
              <h4 className="font-semibold mb-2 text-gray-800">Order Summary</h4>
              <div className="space-y-1 text-sm">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-700">
                    <span>{item.title} × {item.qty}</span>
                    <span className="font-medium">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t border-primary/20 text-gray-900 text-base">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-base py-5 shadow-lg">
              Continue to Payment
            </Button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-6 mt-2">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 text-emerald-800 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Shipping to:
              </h4>
              <p className="text-sm text-emerald-900 font-medium">{shipping.fullName}</p>
              <p className="text-sm text-emerald-700">{shipping.addressLine1}</p>
              {shipping.addressLine2 && <p className="text-sm text-emerald-700">{shipping.addressLine2}</p>}
              <p className="text-sm text-emerald-700">{shipping.city} {shipping.postalCode}</p>
              <p className="text-sm text-emerald-700">{shipping.phone}</p>
            </div>

            <div className="border-t-2 border-primary/20 pt-4 bg-amber-50/50 -mx-6 px-6 py-4">
              <div className="flex justify-between font-bold text-lg mb-2">
                <span className="text-gray-800">Total Amount</span>
                <span className="text-primary text-xl">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="space-y-2 bg-green-50 border border-green-200 p-4 rounded-lg">
              <Label htmlFor="mpesaPhone" className="flex items-center gap-2 text-green-800 font-semibold">
                <Phone className="w-4 h-4" /> M-Pesa Phone Number
              </Label>
              <Input
                id="mpesaPhone"
                value={mpesaPhone}
                onChange={(e) => setMpesaPhone(e.target.value)}
                placeholder="0712 345 678"
                className="bg-white border-green-300 text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-green-700">
                An STK push will be sent to this number
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('shipping')}
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg py-5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  '💳 Pay with M-Pesa'
                )}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center space-y-6 py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-500">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600">
                Your order has been received and is being processed.
              </p>
            </div>

            {orderId && (
              <div className="bg-primary/10 border-2 border-primary/30 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Order ID</p>
                <p className="font-mono font-bold text-primary text-xl">{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              <Package className="w-4 h-4 text-blue-600" />
              <span>You'll receive a confirmation SMS shortly</span>
            </div>

            <div className={`flex items-center justify-center gap-2 text-sm p-3 rounded-lg border ${
              whatsappStatus === 'sent'
                ? 'bg-green-50 text-green-800 border-green-200'
                : whatsappStatus === 'failed'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <MessageCircle className="w-4 h-4" />
              <span>
                {whatsappStatus === 'sent' && 'WhatsApp message link opened — please send it to confirm.'}
                {whatsappStatus === 'failed' && 'WhatsApp link did not open. Please contact us manually.'}
                {whatsappStatus === 'idle' && 'Preparing WhatsApp confirmation…'}
              </span>
            </div>

            <Button onClick={handleClose} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-5 shadow-lg">
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
