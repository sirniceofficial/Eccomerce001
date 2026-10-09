import { Facebook, Instagram, MessageCircle, Phone, Mail, MapPin, CreditCard, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NewsletterSignup from './NewsletterSignup';

interface FooterProps {
  onFaqClick: () => void;
  onContactClick: () => void;
  onShippingClick: () => void;
  onReturnsClick: () => void;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
}

const Footer = ({ 
  onFaqClick, 
  onContactClick, 
  onShippingClick, 
  onReturnsClick, 
  onTermsClick, 
  onPrivacyClick 
}: FooterProps) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/category/${category}`);
  };

  const navigateToPolicy = (tab: string) => {
    navigate(`/store-policy?tab=${tab}`);
  };

  return (
    <footer className="mt-16 bg-gradient-to-b from-accent/30 to-accent/10 border-t border-foreground/10">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary py-4">
        <div className="container text-center">
          <h3 className="text-xl sm:text-2xl font-display text-primary-foreground mb-1">WELCOME TO REMMY HOMES 🥰</h3>
          <p className="text-primary-foreground/80 text-sm">Your One-Stop Shop for Quality Home Essentials</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Newsletter Signup Section */}
        <div className="mb-10">
          <NewsletterSignup />
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Shop by Category */}
          <div>
            <h4 className="text-primary font-bold mb-3 text-sm sm:text-base">Shop</h4>
            <ul className="space-y-2">
              {[
                { label: 'Flash Sales', category: 'flash-sales' },
                { label: 'Refrigerators', category: 'refrigerators' },
                { label: 'Cookers & Ovens', category: 'cookers' },
                { label: 'Washing Machines', category: 'washing-machines' },
                { label: 'Televisions', category: 'televisions' },
                { label: 'Microwaves', category: 'microwaves' },
                { label: 'Kitchen Appliances', category: 'kitchen-appliances' },
                { label: 'Furniture', category: 'furniture-storage' },
              ].map((item, i) => (
                <li key={i}>
                  <span 
                    onClick={() => handleCategoryClick(item.category)} 
                    className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* More Categories */}
          <div>
            <h4 className="text-primary font-bold mb-3 text-sm sm:text-base">Categories</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home & Living', category: 'home-living' },
                { label: 'Kitchen & Dining', category: 'kitchen-dining' },
                { label: 'Bathroom', category: 'bathroom' },
                { label: 'Climate & Comfort', category: 'home-climate' },
                { label: 'Laundry Care', category: 'laundry-garment' },
                { label: 'Home Décor', category: 'home-decor' },
                { label: 'Featured', category: 'featured' },
              ].map((item, i) => (
                <li key={i}>
                  <span 
                    onClick={() => handleCategoryClick(item.category)} 
                    className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors"
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-primary font-bold mb-3 text-sm sm:text-base">Account</h4>
            <ul className="space-y-2">
              <li><span onClick={() => navigate('/customer-profile')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Update My Profile</span></li>
              <li><span onClick={() => navigate('/orders')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">My Orders</span></li>
              <li><span onClick={() => navigate('/search')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Search Products</span></li>
              <li>
                <span 
                  onClick={() => navigate('/rewards')}
                  className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors"
                >
                  🎁 Rewards Program
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-primary font-bold mb-3 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2">
              <li><span onClick={onFaqClick} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">FAQs</span></li>
              <li><span onClick={onContactClick} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Contact Us</span></li>
              <li><span onClick={() => navigateToPolicy('shipping')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Shipping & Delivery</span></li>
              <li><span onClick={() => navigateToPolicy('returns')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Returns & Refunds</span></li>
              <li><span onClick={() => navigateToPolicy('terms')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Terms & Conditions</span></li>
              <li><span onClick={() => navigateToPolicy('privacy')} className="text-muted-foreground text-xs sm:text-sm cursor-pointer hover:text-primary transition-colors">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 pt-6 border-t border-foreground/10">
          {/* Payment Info */}
          <div className="bg-accent/50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-5 h-5 text-primary" />
              <h4 className="text-primary font-bold text-sm">Payment</h4>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm space-y-1">
              <p>Paybill: <span className="text-primary font-bold">247247</span></p>
              <p>Account: <span className="text-primary font-bold">0769353430</span></p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-accent/50 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-primary" />
              <h4 className="text-primary font-bold text-sm">Delivery</h4>
            </div>
            <div className="text-muted-foreground text-xs sm:text-sm space-y-1">
              <p>Nairobi CBD: <span className="text-primary font-semibold">KSh 100</span></p>
              <p>Countrywide: Available</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-accent/50 rounded-lg p-4 border border-primary/20 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-primary" />
              <h4 className="text-primary font-bold text-sm">Contact</h4>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+254769353430" className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" /> +254 769 353 430
              </a>
              <a href="https://wa.me/254769353430" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </a>
              <a href="https://chat.whatsapp.com/J1JHNXyE2uF01qRu2a2zWk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> WhatsApp Group
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6NgiuHAdNLevoAwu0B" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> WhatsApp Channel
              </a>
            </div>
          </div>
        </div>

        {/* Social & Legal */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-foreground/10">
          {/* Social Icons */}
          <div className="flex gap-3">
            <a 
              href="https://facebook.com/remmy_homes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a 
              href="https://instagram.com/remmy_homes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a 
              href="https://wa.me/254769353430" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <a 
              href="https://linktr.ee/remmywholesalers" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-semibold hover:bg-primary/90 transition-all"
            >
              🔗 Links
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
            <span onClick={() => navigateToPolicy('terms')} className="cursor-pointer hover:text-primary transition-colors">Terms</span>
            <span>•</span>
            <span onClick={() => navigateToPolicy('privacy')} className="cursor-pointer hover:text-primary transition-colors">Privacy</span>
            <span>•</span>
            <span onClick={() => navigateToPolicy('shipping')} className="cursor-pointer hover:text-primary transition-colors">Shipping</span>
            <span>•</span>
            <span onClick={() => navigateToPolicy('returns')} className="cursor-pointer hover:text-primary transition-colors">Returns</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 text-center text-muted-foreground text-xs">
          <p>© 2026 Remmy Home. All Rights Reserved. • Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;