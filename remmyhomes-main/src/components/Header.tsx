import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, HelpCircle, Mail, ChevronDown, LogOut, Heart, Search, Menu, X, FileText, Truck, RotateCcw, Shield, Gift, CreditCard, Percent } from 'lucide-react';
import MegaMenu from './MegaMenu';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const categoryLinks = [
  { label: 'Flash Sales', category: 'flash-sales' },
  { label: 'Home & Living', category: 'home-living' },
  { label: 'Appliances', category: 'kitchen-appliances' },
  { label: 'Kitchen', category: 'kitchen-dining' },
  { label: 'Refrigerators', category: 'refrigerators' },
  { label: 'Cookers', category: 'cookers' },
  { label: 'Washing Machines', category: 'washing-machines' },
  { label: 'Televisions', category: 'televisions' },
  { label: 'Microwaves', category: 'microwaves' },
  { label: 'Bathroom', category: 'bathroom' },
  { label: 'Furniture', category: 'furniture-storage' },
  { label: 'Climate', category: 'home-climate' },
  { label: 'Laundry', category: 'laundry-garment' },
  { label: 'Décor', category: 'home-decor' },
  { label: 'Featured', category: 'featured' },
];

interface HeaderProps {
  cartCount: number;
  wishlistCount?: number;
  onCartClick: () => void;
  onWishlistClick?: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onFaqClick: () => void;
  onContactClick: () => void;
  onCategoryClick: (category: string) => void;
  onProfileClick?: () => void;
  onOrdersClick?: () => void;
}

const Header = ({ 
  cartCount, 
  wishlistCount = 0,
  onCartClick, 
  onWishlistClick,
  onLoginClick, 
  onSignupClick,
  onFaqClick,
  onContactClick,
  onCategoryClick,
  onProfileClick,
  onOrdersClick 
}: HeaderProps) => {
  const navigate = useNavigate();
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navigateToPolicy = (tab: string) => {
    navigate(`/store-policy?tab=${tab}`);
  };

  return (
    <header className="container py-3">
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div 
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-extrabold text-base sm:text-xl shadow-gold cursor-pointer"
            onClick={() => navigate('/')}
          >
            RE
          </div>
          <div className="cursor-pointer hidden xs:block" onClick={() => navigate('/')}>
            <h1 className="text-sm sm:text-lg font-bold text-foreground">Remmy HomesHub</h1>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Kitchen • Home • Office</div>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </form>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => navigate('/search')}
            className="lg:hidden text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-accent hover:text-foreground"
          >
            <Search className="w-4 h-4" />
          </button>

          <button 
            onClick={onFaqClick}
            className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">FAQs</span>
          </button>

          <button 
            onClick={onContactClick}
            className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground flex items-center gap-1"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden lg:inline">Contact</span>
          </button>

          {/* Store Policy Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span className="hidden lg:inline">Policies</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
              <DropdownMenuItem onClick={() => navigateToPolicy('shipping')} className="cursor-pointer">
                <Truck className="w-4 h-4 mr-2" />
                Shipping & Delivery
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateToPolicy('returns')} className="cursor-pointer">
                <RotateCcw className="w-4 h-4 mr-2" />
                Returns & Refunds
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigateToPolicy('terms')} className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Terms & Conditions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigateToPolicy('privacy')} className="cursor-pointer">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Policy
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline max-w-[80px] truncate">{profile?.full_name || 'Account'}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
                <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onOrdersClick} className="cursor-pointer">
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onWishlistClick} className="cursor-pointer">
                  <Heart className="w-4 h-4 mr-2" />
                  Wishlist ({wishlistCount})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground flex items-center gap-1"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Login</span>
              </button>
              <button 
                onClick={onSignupClick}
                className="hidden lg:block text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:bg-accent hover:text-foreground"
              >
                Sign Up
              </button>
            </>
          )}

          <button 
            onClick={onWishlistClick}
            className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-accent hover:text-foreground flex items-center relative"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {wishlistCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={onCartClick}
            className="text-muted-foreground px-2 py-2 rounded-lg font-semibold text-sm transition-all hover:bg-accent hover:text-foreground flex items-center gap-1"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden lg:inline">Cart</span>
            <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full text-[10px] font-bold">
              {cartCount}
            </span>
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-1">
          <button 
            onClick={() => navigate('/search')}
            className="text-muted-foreground p-2 rounded-lg transition-all hover:bg-accent hover:text-foreground"
          >
            <Search className="w-5 h-5" />
          </button>

          <button 
            onClick={onWishlistClick}
            className="text-muted-foreground p-2 rounded-lg transition-all hover:bg-accent hover:text-foreground relative"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={onCartClick}
            className="text-muted-foreground p-2 rounded-lg transition-all hover:bg-accent hover:text-foreground relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>

          {/* Mobile Menu Sheet */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="text-muted-foreground p-2 rounded-lg transition-all hover:bg-accent hover:text-foreground">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-extrabold">
                      RE
                    </div>
                    <div>
                      <h2 className="font-bold text-foreground">Remmy HomesHub</h2>
                      <p className="text-xs text-muted-foreground">Menu</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                  {/* User Section */}
                  {user ? (
                    <div className="px-4 mb-4">
                      <div className="bg-accent/50 rounded-lg p-3 mb-3">
                        <p className="font-medium text-foreground text-sm">{profile?.full_name || user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <SheetClose asChild>
                          <button onClick={onProfileClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                            <User className="w-4 h-4" /> My Profile
                          </button>
                        </SheetClose>
                        <SheetClose asChild>
                          <button onClick={onOrdersClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" /> My Orders
                          </button>
                        </SheetClose>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 mb-4 space-y-2">
                      <SheetClose asChild>
                        <Button onClick={onLoginClick} className="w-full" variant="default">Login</Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button onClick={onSignupClick} className="w-full" variant="outline">Sign Up</Button>
                      </SheetClose>
                    </div>
                  )}

                  <div className="px-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">Quick Links</p>
                    <SheetClose asChild>
                      <button onClick={onFaqClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> FAQs
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button onClick={onContactClick} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Contact Us
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button onClick={() => navigate('/search')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <Search className="w-4 h-4" /> Quick Search
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button 
                        onClick={() => navigate('/rewards')}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2"
                      >
                        <Gift className="w-4 h-4" /> Rewards Program
                      </button>
                    </SheetClose>
                  </div>

                  {/* Promo Info */}
                  <div className="px-4 mt-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">Offers & Info</p>
                    <div className="px-3 py-2 text-sm text-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4 text-primary" /> Free Delivery CBD (above KSh 2,000)
                    </div>
                    <div className="px-3 py-2 text-sm text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" /> M-Pesa Payments
                    </div>
                    <div className="px-3 py-2 text-sm text-foreground flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary" /> 30% OFF Sale — Limited time
                    </div>
                    <div className="px-3 py-2 text-sm text-foreground flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-primary" /> Easy Returns — 14-day policy
                    </div>
                  </div>

                  {/* Store Policies */}
                  <div className="px-4 mt-4 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider px-3 py-2">Store Policies</p>
                    <SheetClose asChild>
                      <button onClick={() => navigateToPolicy('shipping')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Shipping & Delivery
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button onClick={() => navigateToPolicy('returns')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Returns & Refunds
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button onClick={() => navigateToPolicy('terms')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Terms & Conditions
                      </button>
                    </SheetClose>
                    <SheetClose asChild>
                      <button onClick={() => navigateToPolicy('privacy')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent text-sm text-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Privacy Policy
                      </button>
                    </SheetClose>
                  </div>
                </div>

                {/* Sign Out */}
                {user && (
                  <div className="p-4 border-t border-border">
                    <SheetClose asChild>
                      <Button onClick={handleSignOut} variant="destructive" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Scrollable Category Links */}
      <div className="mt-2 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1 px-1 py-1.5 min-w-max">
          <button
            onClick={() => navigate('/')}
            className="text-primary text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all hover:bg-accent hover:text-foreground"
          >
            Home
          </button>
          {categoryLinks.map((cat) => (
            <button
              key={cat.category}
              onClick={() => onCategoryClick(cat.category)}
              className="text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all hover:bg-accent hover:text-foreground"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Header;