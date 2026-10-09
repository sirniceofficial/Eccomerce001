import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Pencil, Trash2, Search, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/products';
import ImageUploader from './ImageUploader';

interface Product {
  id: string;
  title: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  tags: string[];
  image_url: string | null;
  is_active: boolean;
}

const emptyForm = () => ({
  title: '', description: '', category: '', subcategory: '',
  price: '', sale_price: '', stock: '0', tags: '',
  image_url: null as string | null, is_active: true,
});

const stockBadge = (n: number) =>
  n <= 0 ? <Badge variant="destructive">Out of stock</Badge>
  : n < 10 ? <Badge variant="secondary">Low · {n}</Badge>
  : <Badge variant="outline">{n} in stock</Badge>;

export const ProductsManager = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load products');
    setItems((data ?? []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items]);

  const filtered = items.filter((p) => {
    const s = search.trim().toLowerCase();
    if (s && !(p.title.toLowerCase().includes(s) || p.tags.some((t) => t.toLowerCase().includes(s)) || (p.subcategory ?? '').toLowerCase().includes(s))) return false;
    if (category !== 'all' && p.category !== category) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (stockFilter === 'low' && (p.stock <= 0 || p.stock >= 10)) return false;
    if (stockFilter === 'inactive' && p.is_active) return false;
    return true;
  });

  const openNew = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? '', category: p.category, subcategory: p.subcategory ?? '',
      price: String(p.price), sale_price: p.sale_price != null ? String(p.sale_price) : '',
      stock: String(p.stock), tags: p.tags.join(', '), image_url: p.image_url, is_active: p.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    const price = Number(form.price);
    const sale = form.sale_price.trim() ? Number(form.sale_price) : null;
    const stock = Number(form.stock);
    if (!form.title.trim() || form.title.length > 200) return toast.error('Title is required (max 200 chars)');
    if (!form.category.trim()) return toast.error('Category is required');
    if (!Number.isFinite(price) || price < 0) return toast.error('Enter a valid price');
    if (sale != null && (!Number.isFinite(sale) || sale < 0 || sale >= price)) return toast.error('Sale price must be below the price');
    if (!Number.isInteger(stock) || stock < 0) return toast.error('Stock must be a whole number ≥ 0');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim(),
      subcategory: form.subcategory.trim() || null,
      price, sale_price: sale, stock,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      image_url: form.image_url,
      is_active: form.is_active,
    };
    setSaving(true);
    const { error } = editing
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert(payload);
    setSaving(false);
    if (error) return toast.error(`Save failed: ${error.message}`);
    toast.success(editing ? 'Product updated' : 'Product created');
    setOpen(false);
    load();
  };

  const remove = async (p: Product) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    const { error } = await supabase.from('products').delete().eq('id', p.id);
    if (error) return toast.error('Delete failed');
    toast.success('Product deleted');
    load();
  };

  const toggleActive = async (p: Product) => {
    const { error } = await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    if (error) return toast.error('Update failed');
    setItems((prev) => prev.map((i) => (i.id === p.id ? { ...i, is_active: !p.is_active } : i)));
  };

  const set = <K extends keyof ReturnType<typeof emptyForm>>(k: K, v: ReturnType<typeof emptyForm>[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Products & Inventory</CardTitle>
        <Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1" /> New product</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 md:grid-cols-[1fr_200px_160px]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-3 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search title, tag, subcategory…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
              <SelectItem value="inactive">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Sale</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin inline" /></TableCell></TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
              )}
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md border border-border bg-muted overflow-hidden flex items-center justify-center">
                      {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <ImageOff className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[220px]"><span className="line-clamp-2">{p.title}</span></TableCell>
                  <TableCell className="text-sm">{p.category}{p.subcategory && <span className="text-muted-foreground"> / {p.subcategory}</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatPrice(Number(p.price))}</TableCell>
                  <TableCell className="whitespace-nowrap">{p.sale_price != null ? formatPrice(Number(p.sale_price)) : '—'}</TableCell>
                  <TableCell>{stockBadge(p.stock)}</TableCell>
                  <TableCell><Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} /></TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)} aria-label="Edit"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p)} aria-label="Delete"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit product' : 'New product'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2"><Label>Title</Label><Input value={form.title} maxLength={200} onChange={(e) => set('title', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Description</Label><Textarea rows={3} maxLength={2000} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
            <div>
              <Label>Category</Label>
              <Input list="admin-categories" value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Refrigerators" />
              <datalist id="admin-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div><Label>Subcategory</Label><Input value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} /></div>
            <div><Label>Price (KSh)</Label><Input type="number" min={0} value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
            <div><Label>Sale price (KSh)</Label><Input type="number" min={0} value={form.sale_price} onChange={(e) => set('sale_price', e.target.value)} placeholder="Optional" /></div>
            <div><Label>Stock quantity</Label><Input type="number" min={0} step={1} value={form.stock} onChange={(e) => set('stock', e.target.value)} /></div>
            <div><Label>Tags (comma separated)</Label><Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="new, bestseller" /></div>
            <div className="md:col-span-2"><ImageUploader label="Product image" value={form.image_url} onChange={(v) => set('image_url', v)} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} /><Label>Visible in store</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProductsManager;
