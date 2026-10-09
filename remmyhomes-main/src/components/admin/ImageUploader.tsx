import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const BUCKET = 'product-images';
// The workspace blocks public buckets, so we mint a long-lived signed URL.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
}

export const ImageUploader = ({ value, onChange, label = 'Image' }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be 5MB or smaller');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (upErr) {
      setUploading(false);
      toast.error(`Upload failed: ${upErr.message}`);
      return;
    }
    const { data, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_URL_TTL);
    setUploading(false);
    if (signErr || !data?.signedUrl) {
      toast.error('Uploaded, but could not generate a public link');
      return;
    }
    onChange(data.signedUrl);
    toast.success('Image uploaded');
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-start gap-3">
        <div className="w-20 h-20 rounded-lg border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            <img src={value} alt="Preview" className="object-cover w-full h-full" loading="lazy" />
          ) : (
            <Upload className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Upload
            </Button>
            {value && (
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                <Trash2 className="w-4 h-4 mr-2" /> Remove
              </Button>
            )}
          </div>
          <Input
            placeholder="…or paste an image URL"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value || null)}
          />
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
};

export default ImageUploader;
