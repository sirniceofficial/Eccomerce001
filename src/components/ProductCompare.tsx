import { useState } from 'react';
import { X, Plus, GitCompareArrows } from 'lucide-react';
import { Product, PRODUCTS } from '@/lib/products';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface ProductCompareProps {
  onProductClick?: (product: Product) => void;
}

const ProductCompare = ({ onProductClick }: ProductCompareProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  const filtered = PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.id === p.id)
  ).slice(0, 8);

  const addProduct = (product: Product) => {
    if (selected.length < 3) {
      setSelected([...selected, product]);
      setSearch('');
    }
  };

  const removeProduct = (id: number) => {
    setSelected(selected.filter((p) => p.id !== id));
  };

  const discount = (p: Product) =>
    p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;

  return (
    <section className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-foreground">🔍 Compare Products</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Select up to 3 products to compare side by side</p>
        </div>
      </div>

      {/* Selection Area */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map((slot) => {
          const product = selected[slot];
          return (
            <Dialog key={slot} open={!product && open} onOpenChange={(o) => !product && setOpen(o)}>
              {product ? (
                <div className="bg-accent/30 border border-border/50 rounded-xl p-3 relative group">
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <img
                    src={product.img}
                    alt={product.title}
                    className="w-full h-[60px] md:h-[100px] object-cover rounded-lg mb-2"
                  />
                  <p className="text-[10px] md:text-xs font-semibold text-foreground truncate">{product.title}</p>
                  <p className="text-xs md:text-sm font-bold text-primary">KSh {product.price.toLocaleString()}</p>
                </div>
              ) : (
                <DialogTrigger asChild>
                  <button
                    onClick={() => setOpen(true)}
                    className="bg-accent/20 border border-dashed border-border/50 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center gap-2 hover:bg-accent/30 transition-colors min-h-[100px] md:min-h-[150px]"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] md:text-xs text-muted-foreground">Add Product</span>
                  </button>
                </DialogTrigger>
              )}
              {!product && (
                <DialogContent className="max-w-md bg-background">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Select a Product</DialogTitle>
                  </DialogHeader>
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-3"
                  />
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {filtered.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          addProduct(p);
                          setOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                      >
                        <img src={p.img} alt={p.title} className="w-10 h-10 object-cover rounded" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                          <p className="text-xs text-primary">KSh {p.price.toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground py-4">No products found</p>
                    )}
                  </div>
                </DialogContent>
              )}
            </Dialog>
          );
        })}
      </div>

      {/* Comparison Table */}
      {selected.length >= 2 && (
        <div className="bg-accent/20 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 text-muted-foreground font-medium w-24 md:w-32">Feature</th>
                  {selected.map((p) => (
                    <th key={p.id} className="p-3 text-center text-foreground font-semibold">{p.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/20">
                  <td className="p-3 text-muted-foreground">Price</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-3 text-center font-bold text-primary">
                      KSh {p.price.toLocaleString()}
                    </td>
                  ))}
                </tr>
                {selected.some((p) => p.originalPrice) && (
                  <tr className="border-b border-border/20">
                    <td className="p-3 text-muted-foreground">Discount</td>
                    {selected.map((p) => (
                      <td key={p.id} className="p-3 text-center">
                        {p.originalPrice ? (
                          <span className="text-primary font-semibold">{discount(p)}% OFF</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                )}
                <tr className="border-b border-border/20">
                  <td className="p-3 text-muted-foreground">Category</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-3 text-center text-foreground capitalize">
                      {p.category.replace(/-/g, ' ')}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border/20">
                  <td className="p-3 text-muted-foreground">SKU</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-3 text-center text-muted-foreground font-mono text-[10px]">
                      {p.sku}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-muted-foreground">Status</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-semibold">
                        In Stock
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCompare;
