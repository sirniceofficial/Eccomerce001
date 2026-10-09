import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, PRODUCTS, getProductsByCategory, CATEGORY_INFO } from '@/lib/products';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useUserActivity } from '@/hooks/useUserActivity';

import PromoBanner from '@/components/PromoBanner';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';
import QuickCategories from '@/components/QuickCategories';
import PromoFeatures from '@/components/PromoFeatures';
import ProductSection from '@/components/ProductSection';
import RecentlyViewedSection from '@/components/RecentlyViewedSection';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import DealsSlider from '@/components/DealsSlider';
import BackToTop from '@/components/BackToTop';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import ProductCompare from '@/components/ProductCompare';
import QuickSearch from '@/components/QuickSearch';
import LoyaltyBanner from '@/components/LoyaltyBanner';

import FaqModal from '@/components/modals/FaqModal';
import ContactModal from '@/components/modals/ContactModal';
import { LoginModal, SignupModal } from '@/components/modals/AuthModals';
import { ShippingModal, ReturnsModal, TermsModal, PrivacyModal } from '@/components/modals/PolicyModals';
import { ProfileModal } from '@/components/modals/ProfileModal';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';
import { WishlistModal } from '@/components/modals/WishlistModal';

const Index = () => {
  const navigate = useNavigate();
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

  const { 
    count: wishlistCount, 
    getWishlistItems, 
    toggleWishlist 
  } = useWishlist();

  const { trackProductView } = useUserActivity();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  
  // Modal states
  const [faqOpen, setFaqOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnsOpen, setReturnsOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const handleCategoryClick = useCallback((category: string) => {
    // On the homepage, smooth-scroll to the matching section when present.
    const section = document.getElementById(`section-${category}`);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(`/category/${category}`);
  }, [navigate]);

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
    // Track the product view
    trackProductView(product.id);
  }, [trackProductView]);

  const handleAddToCart = useCallback((id: number, qty: number = 1) => {
    addToCart(id, qty);
    setCartIsOpen(true);
  }, [addToCart, setCartIsOpen]);

  return (
    <div className="min-h-screen bg-gradient-navy">
      <PromoBanner />
      
      <Header 
        cartCount={getItemCount()}
        wishlistCount={wishlistCount}
        onCartClick={() => setCartIsOpen(true)}
        onWishlistClick={() => setWishlistOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
        onSignupClick={() => setSignupOpen(true)}
        onFaqClick={() => setFaqOpen(true)}
        onContactClick={() => setContactOpen(true)}
        onCategoryClick={handleCategoryClick}
        onProfileClick={() => setProfileOpen(true)}
        onOrdersClick={() => setOrdersOpen(true)}
      />

      <main className="container">
        <HeroCarousel onCategoryClick={handleCategoryClick} />
        <DealsSlider />
        {/* QuickCategories, QuickSearch, PromoFeatures moved to header drawer */}

        {/* Recently Viewed Products - Shows for logged in users */}
        <RecentlyViewedSection onProductClick={handleProductClick} />

        {/* LoyaltyBanner removed from homepage, accessible via drawer */}

        {/* Flash Sales - Special grid for hot deals with countdown */}
        <ProductSection
          id="section-flash-sales"
          title={CATEGORY_INFO['flash-sales'].title}
          products={getProductsByCategory('flash-sales')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
          isFlashSale={true}
        />

        {/* Home & Living */}
        <ProductSection
          id="section-home-living"
          title={CATEGORY_INFO['home-living'].title}
          products={getProductsByCategory('home-living')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Kitchen Appliances */}
        <ProductSection
          id="section-kitchen-appliances"
          title={CATEGORY_INFO['kitchen-appliances'].title}
          products={getProductsByCategory('kitchen-appliances')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Kitchen & Dining */}
        <ProductSection
          id="section-kitchen-dining"
          title={CATEGORY_INFO['kitchen-dining'].title}
          products={getProductsByCategory('kitchen-dining')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Bathroom Accessories */}
        <ProductSection
          id="section-bathroom"
          title={CATEGORY_INFO['bathroom'].title}
          products={getProductsByCategory('bathroom')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Furniture & Storage */}
        <ProductSection
          id="section-furniture-storage"
          title={CATEGORY_INFO['furniture-storage'].title}
          products={getProductsByCategory('furniture-storage')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Home Climate & Comfort */}
        <ProductSection
          id="section-home-climate"
          title={CATEGORY_INFO['home-climate'].title}
          products={getProductsByCategory('home-climate')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Laundry & Garment Care */}
        <ProductSection
          id="section-laundry-garment"
          title={CATEGORY_INFO['laundry-garment'].title}
          products={getProductsByCategory('laundry-garment')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Home Décor */}
        <ProductSection
          id="section-home-decor"
          title={CATEGORY_INFO['home-decor'].title}
          products={getProductsByCategory('home-decor')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Refrigerators & Freezers */}
        <ProductSection
          id="section-refrigerators"
          title={CATEGORY_INFO['refrigerators'].title}
          products={getProductsByCategory('refrigerators')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Cookers & Ovens */}
        <ProductSection
          id="section-cookers"
          title={CATEGORY_INFO['cookers'].title}
          products={getProductsByCategory('cookers')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Washing Machines */}
        <ProductSection
          id="section-washing-machines"
          title={CATEGORY_INFO['washing-machines'].title}
          products={getProductsByCategory('washing-machines')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Televisions & Audio */}
        <ProductSection
          id="section-televisions"
          title={CATEGORY_INFO['televisions'].title}
          products={getProductsByCategory('televisions')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Microwaves */}
        <ProductSection
          id="section-microwaves"
          title={CATEGORY_INFO['microwaves'].title}
          products={getProductsByCategory('microwaves')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Featured Products */}
        <ProductSection
          id="section-featured"
          title={CATEGORY_INFO['featured'].title}
          products={getProductsByCategory('featured')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Smart Home & Gadgets */}
        <ProductSection
          id="section-smart-home"
          title={CATEGORY_INFO['smart-home'].title}
          products={getProductsByCategory('smart-home')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Small Appliances */}
        <ProductSection
          id="section-small-appliances"
          title={CATEGORY_INFO['small-appliances'].title}
          products={getProductsByCategory('small-appliances')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Outdoor & Garden */}
        <ProductSection
          id="section-outdoor-garden"
          title={CATEGORY_INFO['outdoor-garden'].title}
          products={getProductsByCategory('outdoor-garden')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Baby & Kids */}
        <ProductSection
          id="section-baby-kids"
          title={CATEGORY_INFO['baby-kids'].title}
          products={getProductsByCategory('baby-kids')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Pet Supplies */}
        <ProductSection
          id="section-pet-supplies"
          title={CATEGORY_INFO['pet-supplies'].title}
          products={getProductsByCategory('pet-supplies')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Office Essentials */}
        <ProductSection
          id="section-office-essentials"
          title={CATEGORY_INFO['office-essentials'].title}
          products={getProductsByCategory('office-essentials')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Fitness & Wellness */}
        <ProductSection
          id="section-fitness-wellness"
          title={CATEGORY_INFO['fitness-wellness'].title}
          products={getProductsByCategory('fitness-wellness')}
          onProductClick={handleProductClick}
          onAddToCart={(id) => handleAddToCart(id, 1)}
          onAddToWishlist={toggleWishlist}
        />

        {/* Electronics & Mobile */}
        <ProductSection id="section-electronics" title={CATEGORY_INFO['electronics'].title}
          products={getProductsByCategory('electronics')} onProductClick={handleProductClick} />

        {/* Beauty & Personal Care */}
        <ProductSection id="section-beauty-personal-care" title={CATEGORY_INFO['beauty-personal-care'].title}
          products={getProductsByCategory('beauty-personal-care')} onProductClick={handleProductClick} />

        {/* Tools & Hardware */}
        <ProductSection id="section-tools-hardware" title={CATEGORY_INFO['tools-hardware'].title}
          products={getProductsByCategory('tools-hardware')} onProductClick={handleProductClick} />

        {/* Toys & Games */}
        <ProductSection id="section-toys-games" title={CATEGORY_INFO['toys-games'].title}
          products={getProductsByCategory('toys-games')} onProductClick={handleProductClick} />

        {/* Books & Stationery */}
        <ProductSection id="section-books-stationery" title={CATEGORY_INFO['books-stationery'].title}
          products={getProductsByCategory('books-stationery')} onProductClick={handleProductClick} />

        {/* Travel & Luggage */}
        <ProductSection id="section-travel-luggage" title={CATEGORY_INFO['travel-luggage'].title}
          products={getProductsByCategory('travel-luggage')} onProductClick={handleProductClick} />

        {/* Sports & Outdoors */}
        <ProductSection id="section-sports-outdoors" title={CATEGORY_INFO['sports-outdoors'].title}
          products={getProductsByCategory('sports-outdoors')} onProductClick={handleProductClick} />
        <TestimonialsCarousel />
        <ProductCompare onProductClick={handleProductClick} />

        <ContactForm />
      </main>

      <Footer
        onFaqClick={() => setFaqOpen(true)}
        onContactClick={() => setContactOpen(true)}
        onShippingClick={() => setShippingOpen(true)}
        onReturnsClick={() => setReturnsOpen(true)}
        onTermsClick={() => setTermsOpen(true)}
        onPrivacyClick={() => setPrivacyOpen(true)}
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

      <BackToTop />

      {/* Info Modals */}
      <FaqModal isOpen={faqOpen} onClose={() => setFaqOpen(false)} />
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)} 
        onSwitchToSignup={() => setSignupOpen(true)}
      />
      <SignupModal 
        isOpen={signupOpen} 
        onClose={() => setSignupOpen(false)} 
        onSwitchToLogin={() => setLoginOpen(true)}
      />
      <ShippingModal isOpen={shippingOpen} onClose={() => setShippingOpen(false)} />
      <ReturnsModal isOpen={returnsOpen} onClose={() => setReturnsOpen(false)} />
      <TermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
      <PrivacyModal isOpen={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <OrderTrackingModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
      <WishlistModal 
        isOpen={wishlistOpen} 
        onClose={() => setWishlistOpen(false)}
        items={getWishlistItems()}
        onRemove={toggleWishlist}
        onAddToCart={(id) => handleAddToCart(id, 1)}
        onProductClick={handleProductClick}
      />
    </div>
  );
};

export default Index;
