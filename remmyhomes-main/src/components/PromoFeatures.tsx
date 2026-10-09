import { Truck, CreditCard, Percent, RotateCcw } from 'lucide-react';

const features = [
  { icon: Truck, title: 'Free Delivery CBD', subtitle: 'orders above KSh 2,000' },
  { icon: CreditCard, title: 'M-Pesa Payments', subtitle: 'Secure & instant' },
  { icon: Percent, title: '30% OFF Sale', subtitle: 'Limited time' },
  { icon: RotateCcw, title: 'Easy Returns', subtitle: '14-day policy' },
];

const PromoFeatures = () => {
  return (
    <div className="mt-4 bg-gradient-to-r from-accent/30 to-transparent p-4 rounded-lg flex gap-6 items-center justify-between flex-wrap">
      {features.map((feature) => (
        <div key={feature.title} className="flex items-center gap-2">
          <feature.icon className="w-5 h-5 text-primary" />
          <div>
            <div className="text-foreground font-semibold text-sm">{feature.title}</div>
            <div className="text-muted-foreground text-xs">{feature.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PromoFeatures;
