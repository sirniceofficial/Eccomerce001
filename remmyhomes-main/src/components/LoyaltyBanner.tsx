import { Gift, Star, Trophy, Zap } from 'lucide-react';

const perks = [
  { icon: Gift, title: 'Earn Points', desc: 'Get 1 point for every KSh 100 spent' },
  { icon: Star, title: 'Exclusive Deals', desc: 'Members-only flash sales & early access' },
  { icon: Trophy, title: 'VIP Tiers', desc: 'Unlock Bronze, Silver & Gold rewards' },
  { icon: Zap, title: 'Free Delivery', desc: 'Free shipping on orders above KSh 5,000' },
];

const LoyaltyBanner = () => {
  return (
    <section id="loyalty-banner" className="py-8 md:py-12">
      <div className="bg-gradient-to-r from-primary/15 via-accent/40 to-primary/15 border border-primary/20 rounded-2xl p-5 md:p-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-3">
              <Gift className="w-3 h-3" /> REWARDS PROGRAM
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-foreground">
              Join <span className="text-gradient-gold">Remmy Rewards</span> — Shop More, Earn More!
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
              Sign up for free and start earning points on every purchase. Redeem for discounts, free delivery, and exclusive products.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {perks.map((perk, i) => (
              <div key={i} className="bg-background/40 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center border border-border/30">
                <perk.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs md:text-sm font-semibold text-foreground">{perk.title}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">{perk.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-gradient-gold text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-gold-glow">
              Join Remmy Rewards — It's Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoyaltyBanner;
