import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { CATEGORY_INFO, CategoryKey, Product, formatPrice } from '@/lib/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import { useProductCatalog } from '@/contexts/ProductCatalogContext';

const SearchPage = () => {
  const { products } = useProductCatalog();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high'>('relevance');
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  
  const { 
    isOpen: cartIsOpen, 
    setIsOpen: setCartIsOpen,
    addToCart,
    removeFromCart,
    clearCart,
    getCartItems,
    getTotal,
    getItemCount 
  } = useCart();

  const { isInWishlist, toggleWishlist } = useWishlist();

  const categories = Object.entries(CATEGORY_INFO).map(([key, info]) => ({
    key,
    title: info.title.replace(/^[^\s]+\s/, ''), // Remove emoji
  }));

  const filteredProducts = useMemo(() => {
    let results = products;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      results = results.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by price range
    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    if (sortBy === 'price-low') {
      results = [...results].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      results = [...results].sort((a, b) => b.price - a.price);
    }

    return results;
  }, [products, searchQuery, selectedCategories, priceRange, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchQuery });
  };

  const toggleCategory = (categoryKey: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryKey) 
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setSortBy('relevance');
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleAddToCart = (id: number, qty: number = 1) => {
    addToCart(id, qty);
    setCartIsOpen(true);
  };

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat.key} className="flex items-center space-x-2">
              <Checkbox
                id={cat.key}
                checked={selectedCategories.includes(cat.key)}
                onCheckedChange={() => toggleCategory(cat.key)}
              />
              <Label htmlFor={cat.key} className="text-sm cursor-pointer">
                {cat.title}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={100000}
            step={500}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <div className="space-y-2">
          {[
            { value: 'relevance', label: 'Relevance' },
            { value: 'price-low', label: 'Price: Low to High' },
            { value: 'price-high', label: 'Price: High to Low' },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={option.value}
                name="sort"
                checked={sortBy === option.value}
                onChange={() => setSortBy(option.value as typeof sortBy)}
                className="w-4 h-4"
              />
              <Label htmlFor={option.value} className="text-sm cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-navy">
      <Header 
        cartCount={getItemCount()}
        onCartClick={() => setCartIsOpen(true)}
        onLoginClick={() => {}}
        onSignupClick={() => {}}
        onFaqClick={() => {}}
        onContactClick={() => {}}
        onCategoryClick={(cat) => navigate(`/category/${cat}`)}
        onProfileClick={() => {}}
        onOrdersClick={() => {}}
      />

      <main className="container py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-12 pr-4 py-6 text-lg bg-card-light"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </form>

        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card-light p-4 rounded-lg sticky top-4">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </h2>
              <FiltersContent />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {filteredProducts.length} products found
                {searchQuery && <span> for "{searchQuery}"</span>}
              </p>
              
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-card-light">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl font-semibold">No products found</p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.slice(0, 48).map((product) => (
                  <div
                    key={product.id}
                    className="bg-card-light rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={product.img}
                        alt={product.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleProductClick(product)}
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded">
                          {product.badge}
                        </span>
                      )}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2 right-2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <Heart 
                          className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-destructive text-destructive' : ''}`}
                        />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 
                        className="font-semibold text-sm truncate cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer
        onFaqClick={() => {}}
        onContactClick={() => {}}
        onShippingClick={() => {}}
        onReturnsClick={() => {}}
        onTermsClick={() => {}}
        onPrivacyClick={() => {}}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
      />

      <CartDrawer
        isOpen={cartIsOpen}
        onClose={() => setCartIsOpen(false)}
        items={getCartItems()}
        total={getTotal()}
        onRemove={removeFromCart}
        onClear={clearCart}
      />
    </div>
  );
};

export default SearchPage;
