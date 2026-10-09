import { useState } from 'react';
import InfoModal from './InfoModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import LocationPicker, { type PickedLocation } from '@/components/LocationPicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address_line1: profile?.address_line1 || '',
    address_line2: profile?.address_line2 || '',
    city: profile?.city || '',
    state: profile?.state || '',
    postal_code: profile?.postal_code || '',
    country: profile?.country || 'Kenya',
    latitude: (profile?.latitude as number | null | undefined) ?? null,
    longitude: (profile?.longitude as number | null | undefined) ?? null,
    location_label: (profile?.location_label as string | null | undefined) ?? '',
  });

  const handleLocation = (loc: PickedLocation) => {
    setFormData(prev => ({
      ...prev,
      latitude: loc.lat,
      longitude: loc.lng,
      location_label: loc.label,
      address_line1: loc.address?.road || prev.address_line1,
      city: loc.address?.city || prev.city,
      state: loc.address?.state || prev.state,
      postal_code: loc.address?.postcode || prev.postal_code,
      country: loc.address?.country || prev.country,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      onClose();
    }
    setLoading(false);
  };

  return (
    <InfoModal isOpen={isOpen} onClose={onClose} title="My Profile">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        <div className="space-y-2">
          <Label htmlFor="full_name" className="text-card-light-foreground">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-card-light-foreground">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+254 700 000 000"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-card-light-foreground">Pin your location on the map</Label>
          <LocationPicker
            value={
              formData.latitude && formData.longitude
                ? { lat: formData.latitude, lng: formData.longitude, label: formData.location_label || '' }
                : null
            }
            onChange={handleLocation}
            height={260}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line1" className="text-card-light-foreground">Address Line 1</Label>
          <Input
            id="address_line1"
            name="address_line1"
            placeholder="Street address"
            value={formData.address_line1}
            onChange={handleChange}
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_line2" className="text-card-light-foreground">Address Line 2</Label>
          <Input
            id="address_line2"
            name="address_line2"
            placeholder="Apartment, suite, etc. (optional)"
            value={formData.address_line2}
            onChange={handleChange}
            disabled={loading}
            className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-card-light-foreground">City</Label>
            <Input
              id="city"
              name="city"
              placeholder="Nairobi"
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
              className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state" className="text-card-light-foreground">State/County</Label>
            <Input
              id="state"
              name="state"
              placeholder="Nairobi County"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
              className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="postal_code" className="text-card-light-foreground">Postal Code</Label>
            <Input
              id="postal_code"
              name="postal_code"
              placeholder="00100"
              value={formData.postal_code}
              onChange={handleChange}
              disabled={loading}
              className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country" className="text-card-light-foreground">Country</Label>
            <Input
              id="country"
              name="country"
              placeholder="Kenya"
              value={formData.country}
              onChange={handleChange}
              disabled={loading}
              className="bg-card-light-foreground/5 border-card-light-foreground/20 text-card-light-foreground"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-secondary"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile'}
        </Button>
      </form>
    </InfoModal>
  );
};