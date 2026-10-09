import { Zap, Home, UtensilsCrossed, Utensils, Bath, Armchair, Wind, WashingMachine, Palette, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickCategoriesProps {
  onCategoryClick: (category: string) => void;
}

const categories = [
  { icon: Zap, label: 'Flash Sales', category: 'flash-sales' },
  { icon: Home, label: 'Home & Living', category: 'home-living' },
  { icon: UtensilsCrossed, label: 'Appliances', category: 'kitchen-appliances' },
  { icon: Utensils, label: 'Kitchen', category: 'kitchen-dining' },
  { icon: Bath, label: 'Bathroom', category: 'bathroom' },
  { icon: Armchair, label: 'Furniture', category: 'furniture-storage' },
  { icon: Wind, label: 'Climate', category: 'home-climate' },
  { icon: WashingMachine, label: 'Laundry', category: 'laundry-garment' },
  { icon: Palette, label: 'Décor', category: 'home-decor' },
  { icon: Star, label: 'Featured', category: 'featured' },
];

const QuickCategories = ({ onCategoryClick }: QuickCategoriesProps) => {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 mt-4">
      {categories.map((cat, index) => (
        <motion.button
          key={cat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          onClick={() => onCategoryClick(cat.category)}
          className="bg-accent/30 p-3 rounded-lg text-center border border-accent/20 cursor-pointer transition-all hover:bg-accent/50 hover:border-primary hover:-translate-y-0.5 group"
        >
          <cat.icon className="w-6 h-6 mx-auto mb-1 text-primary stroke-[1.5] group-hover:scale-110 transition-transform" />
          <div className="text-xs text-foreground font-medium truncate">{cat.label}</div>
        </motion.button>
      ))}
    </div>
  );
};

export default QuickCategories;
