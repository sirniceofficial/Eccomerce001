import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface FlashSale {
  id: string;
  name: string;
  discount_percent: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm = () => ({
  name: '',
  discount_percent: 10,
  starts_at: toLocalInput(new Date().toISOString()),
  ends_at: toLocalInput(new Date(Date.now() + 7 * 864e5).toISOString()),
  is_active: true,
});

export const FlashSalesManager = () => {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .order('ends_at', { ascending: false });
    if (error) toast.error('Failed to load flash sales');
    setSales((data as FlashSale[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditingId(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (s: FlashSale) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      discount_percent: s.discount_percent,
      starts_at: toLocalInput(s.starts_at),
      ends_at: toLocalInput(s.ends_at),
      is_active: s.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error('Campaign name is required'); return; }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) { toast.error('End time must be after start time'); return; }
    if (form.discount_percent < 0 || form.discount_percent > 90) { toast.error('Discount must be between 0 and 90%'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      discount_percent: Number(form.discount_percent),
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: new Date(form.ends_at).toISOString(),
      is_active: form.is_active,
    };
    const { error } = editingId
      ? await supabase.from('flash_sales').update(payload).eq('id', editingId)
      : await supabase.from('flash_sales').insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editingId ? 'Flash sale updated' : 'Flash sale created');
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('flash_sales').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Flash sale deleted'); load(); }
  };

  const toggleActive = async (s: FlashSale) => {
    const { error } = await supabase.from('flash_sales').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) toast.error(error.message);
    else load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Flash Sales</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> New campaign</Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          The homepage countdown reads the soonest-ending active campaign.
        </p>
        {loading ? (
          <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.discount_percent}%</TableCell>
                  <TableCell>{new Date(s.starts_at).toLocaleString()}</TableCell>
                  <TableCell>{new Date(s.ends_at).toLocaleString()}</TableCell>
                  <TableCell><Switch checked={s.is_active} onCheckedChange={() => toggleActive(s)} /></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {sales.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No flash sales yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingId ? 'Edit flash sale' : 'New flash sale'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="fs-name">Campaign name</Label>
              <Input id="fs-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="fs-disc">Discount %</Label>
              <Input id="fs-disc" type="number" min={0} max={90} value={form.discount_percent}
                onChange={(e) => setForm({ ...form, discount_percent: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="fs-start">Starts</Label>
                <Input id="fs-start" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="fs-end">Ends</Label>
                <Input id="fs-end" type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="fs-active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label htmlFor="fs-active">Active</Label>
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

export default FlashSalesManager;
