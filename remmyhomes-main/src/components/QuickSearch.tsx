import { useState, useRef, useEffect } from 'react';
import { Search, X, TrendingUp } from 'lucide-react';
import { Product, CATEGORY_INFO } from '@/lib/products';
import { useProductCatalog } from '@/contexts/ProductCatalogContext';

interface QuickSearchProps {
  onProductClick: (product: Product) => void;
}

const trendingSearches = ['Air Fryer', 'Smart TV', 'Blender', 'Sofa', 'Washing Machine'];
const priceRanges = ['all', 'under5k', '5k-15k', '15k-50k', 'over50k'] as const;
type PriceRange = typeof priceRanges[number];

const parsePriceRange = (value: string): PriceRange =>
  priceRanges.find((range) => range === value) ?? 'all';

const QuickSearch = ({ onProductClick }: QuickSearchProps) => {
  const { products } = useProductCatalog();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filterByPrice = (p: Product) => {
    switch (priceRange) {
      case 'under5k': return p.price < 5000;
      case '5k-15k': return p.price >= 5000 && p.price <= 15000;
      case '15k-50k': return p.price > 15000 && p.price <= 50000;
      case 'over50k': return p.price > 50000;
      default: return true;
    }
  };

  const results = query.trim().length >= 2
    ? products.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) &&
          (selectedCategory === 'all' || p.category === selectedCategory) &&
          filterByPrice(p)
      ).slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = Object.entries(CATEGORY_INFO).slice(0, 6);

  return (
    <section className="py-6 md:py-8">
      <div ref={containerRef} className="relative">
        <div className="bg-accent/30 border border-border/50 rounded-xl p-4 md:p-6">
          <h2 className="text-lg md:text-2xl font-bold text-foreground mb-3">🔎 Quick Search</h2>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              placeholder="Search for products..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] md:text-xs px-2 py-1 rounded-lg bg-background border border-border/50 text-foreground"
            >
              <option value="all">All Categories</option>
              {categories.map(([key, info]) => (
                <option key={key} value={key}>{info.icon} {info.title.replace(/^[^\s]+ /, '')}</option>
              ))}
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(parsePriceRange(e.target.value))}
              className="text-[10px] md:text-xs px-2 py-1 rounded-lg bg-background border border-border/50 text-foreground"
            >
              <option value="all">Any Price</option>
              <option value="under5k">Under KSh 5,000</option>
              <option value="5k-15k">KSh 5,000 - 15,000</option>
              <option value="15k-50k">KSh 15,000 - 50,000</option>
              <option value="over50k">Over KSh 50,000</option>
            </select>
          </div>

          {/* Trending */}
          {focused && !query && (
            <div className="flex flex-wrap gap-2 mt-3">
              <TrendingUp className="w-3 h-3 text-primary mt-1" />
              {trendingSearches.map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="text-[10px] md:text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Dropdown */}
        {focused && query.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border/50 rounded-xl shadow-2xl z-50 max-h-[350px] overflow-y-auto">
            {results.length > 0 ? (
              results.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onProductClick(p);
                    setFocused(false);
                    setQuery('');
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors border-b border-border/20 last:border-0 text-left"
                >
                  <img src={p.img} alt={p.title} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.category.replace(/-/g, ' ')}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">KSh {p.price.toLocaleString()}</p>
                    {p.originalPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">KSh {p.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted-foreground">No products found for "{query}"</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickSearch;
