import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Search, Crosshair } from 'lucide-react';

// Fix default marker icons (Leaflet + bundlers)
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface PickedLocation {
  lat: number;
  lng: number;
  label: string;
  address?: {
    road?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: PickedLocation['address'];
}

export type MapProvider = 'osm' | 'google';

interface LocationPickerProps {
  value?: { lat: number; lng: number; label?: string } | null;
  onChange: (loc: PickedLocation) => void;
  height?: number;
  provider?: MapProvider;
}

const FlyTo = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14));
  }, [lat, lng, map]);
  return null;
};

const ClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
};

const reverseGeocode = async (lat: number, lng: number): Promise<PickedLocation> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  return {
    lat,
    lng,
    label: data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    address: data.address,
  };
};

const LocationPicker = ({ value, onChange, height = 320, provider = 'osm' }: LocationPickerProps) => {
  // Default: Nairobi
  const initial = value ?? { lat: -1.2921, lng: 36.8219, label: '' };
  const [pos, setPos] = useState<{ lat: number; lng: number }>({ lat: initial.lat, lng: initial.lng });
  const [label, setLabel] = useState<string>(initial.label || '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const handlePick = async (lat: number, lng: number) => {
    setPos({ lat, lng });
    try {
      const loc = await reverseGeocode(lat, lng);
      setLabel(loc.label);
      onChange(loc);
    } catch {
      const loc = { lat, lng, label: `${lat.toFixed(5)}, ${lng.toFixed(5)}` };
      setLabel(loc.label);
      onChange(loc);
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  }, [query]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        handlePick(p.coords.latitude, p.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectResult = (r: SearchResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setPos({ lat, lng });
    setLabel(r.display_name);
    setResults([]);
    setQuery('');
    onChange({ lat, lng, label: r.display_name, address: r.address });
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search address or place..."
              className="pl-9"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <Button type="button" variant="outline" onClick={useMyLocation} disabled={locating} title="Use my current location">
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
          </Button>
        </div>
        {results.length > 0 && (
          <div className="absolute z-[1000] mt-1 w-full bg-popover text-popover-foreground border rounded-md shadow-lg max-h-60 overflow-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => selectResult(r)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-0"
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ height }} className="rounded-md overflow-hidden border">
        <MapContainer center={[pos.lat, pos.lng]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          {provider === 'google' ? (
            <TileLayer
              attribution='&copy; Google Maps'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            />
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          <Marker
            position={[pos.lat, pos.lng]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const m = e.target as L.Marker;
                const ll = m.getLatLng();
                handlePick(ll.lat, ll.lng);
              },
            }}
          />
          <ClickHandler onPick={handlePick} />
          <FlyTo lat={pos.lat} lng={pos.lng} />
        </MapContainer>
      </div>

      {label && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">{label}</span>
        </p>
      )}
    </div>
  );
};

export default LocationPicker;
