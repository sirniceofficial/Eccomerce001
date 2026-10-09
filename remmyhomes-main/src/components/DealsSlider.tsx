import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Tag, Flame, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Deal {
  title: string;
  subtitle: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  gradient: string;
}

const deals: Deal[] = [
  {
    title: "Weekly Kitchen Deals",
    subtitle: "Save up to 40%",
    description: "Blenders, kettles, cookers & more at unbeatable prices. This week only!",
    category: "kitchen-appliances",
    icon: <Flame className="w-6 h-6" />,
    gradient: "from-orange-600/90 via-red-600/80 to-rose-700/90",
  },
  {
    title: "Furniture Flash Sale",
    subtitle: "Up to 35% OFF",
    description: "Sofas, desks, wardrobes & dining tables. Transform your home for less!",
    category: "furniture-storage",
    icon: <Tag className="w-6 h-6" />,
    gradient: "from-emerald-700/90 via-teal-600/80 to-cyan-700/90",
  },
  {
    title: "Seasonal Clearance",
    subtitle: "Buy 2 Get 1 Free",
    description: "Home décor, curtains, rugs & accessories. Refresh your space this season!",
    category: "home-decor",
    icon: <Gift className="w-6 h-6" />,
    gradient: "from-violet-700/90 via-purple-600/80 to-indigo-700/90",
  },
  {
    title: "Electronics Mega Sale",
    subtitle: "Free Delivery on all TVs",
    description: "Smart TVs, soundbars, speakers & more. Premium brands at low prices!",
    category: "flash-sales",
    icon: <Sparkles className="w-6 h-6" />,
    gradient: "from-blue-700/90 via-sky-600/80 to-cyan-700/90",
  },
];

const DealsSlider = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % deals.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const deal = deals[current];

  return (
    <div className="relative mt-4 rounded-lg overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35 }}
          className={`bg-gradient-to-r ${deal.gradient} px-4 py-4 md:px-8 md:py-5`}
        >
          <div className="flex items-center gap-3 md:gap-6">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm items-center justify-center text-white shrink-0">
              {deal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{deal.subtitle}</span>
              </div>
              <h3 className="text-white font-bold text-base md:text-lg leading-tight truncate">{deal.title}</h3>
              <p className="text-white/80 text-xs md:text-sm mt-0.5 line-clamp-1">{deal.description}</p>
            </div>
            <Button
              onClick={() => navigate(`/category/${deal.category}`)}
              size="sm"
              className="bg-card-light text-card-light-foreground hover:bg-card-light/90 font-bold text-xs shrink-0 shadow-lg"
            >
              Shop Now
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <button
        onClick={() => setCurrent((prev) => (prev - 1 + deals.length) % deals.length)}
        className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 z-10"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % deals.length)}
        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 z-10"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
        {deals.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DealsSlider;
