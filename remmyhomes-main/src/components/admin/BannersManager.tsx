import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import ImageUploader from './ImageUploader';

interface Banner {
  id: string;
  banner_type: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const TYPES = [
  { value: 'announcement', label: 'Announcement bar' },
  { value: 'hero', label: 'Hero banner' },
  { value: 'promo_card', label: 'Promotional card' },
];

const emptyForm = () => ({
  banner_type: 'announcement',
  title: '',
  subtitle: '',
  image_url: null as string | null,
  link_url: '',
  sort_order: 0,
  is_active: true,
});

export const BannersManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('banner_type', { ascending: true })
      .order('sort_order', { ascending: true });
    if (error) toast.error('Failed to load banners');
    setBanners((data as Banner[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditingId(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      banner_type: b.banner_type,
      title: b.title,
      subtitle: b.subtitle ?? '',
      image_url: b.image_url,
      link_url: b.link_url ?? '',
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    const payload = {
      banner_type: form.banner_type,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      image_url: form.image_url,
      link_url: form.link_url.trim() || null,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    const { error } = editingId
      ? await supabase.from('banners').update(payload).eq('id', editingId)
      : await supabase.from('banners').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Banner updated' : 'Banner created');
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Banner deleted'); load(); }
  };

  const toggleActive = async (b: Banner) => {
    const { error } = await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Promotions &amp; Banners</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New banner</Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          The top announcement bar shows the first active announcement (lowest sort order).
        </p>
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="w-14 h-10 rounded-md bg-muted overflow-hidden">
                      {b.image_url && <img src={b.image_url} alt={b.title} className="object-cover w-full h-full" loading="lazy" />}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{b.banner_type.replace('_', ' ')}</TableCell>
                  <TableCell className="font-medium max-w-[220px] truncate">{b.title}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[140px] truncate">{b.link_url || '—'}</TableCell>
                  <TableCell>{b.sort_order}</TableCell>
                  <TableCell><Switch checked={b.is_active} onCheckedChange={() => toggleActive(b)} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No banners yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit banner' : 'New banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Type</Label>
              <Select value={form.banner_type} onValueChange={(v) => setForm({ ...form, banner_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="b-title">Title</Label>
              <Input id="b-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="b-sub">Subtitle</Label>
              <Input id="b-sub" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} label="Banner image" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="b-link">Target route / link</Label>
                <Input id="b-link" placeholder="/category/televisions" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="b-sort">Sort order</Label>
                <Input id="b-sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="b-active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label htmlFor="b-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BannersManager;
