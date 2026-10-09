import { motion } from 'framer-motion';

interface MegaMenuProps {
  onCategoryClick: (category: string) => void;
}

const categories = [
  {
    title: '⚡ Flash Sales',
    items: ['Hot Deals', 'Limited Offers', 'Daily Specials', 'Clearance'],
    category: 'flash-sales'
  },
  {
    title: '🏠 Home & Living',
    items: ['Sofas & Seating', 'Beds & Mattresses', 'Decor Items', 'Plants & Planters'],
    category: 'home-living'
  },
  {
    title: '🍳 Kitchen Appliances',
    items: ['Cookers & Stoves', 'Ovens & Microwaves', 'Refrigerators', 'Blenders & Mixers'],
    category: 'kitchen-appliances'
  },
  {
    title: '🍽️ Kitchen & Dining',
    items: ['Pots & Pans', 'Plates & Bowls', 'Cutlery Sets', 'Dish Racks'],
    category: 'kitchen-dining'
  },
  {
    title: '🚿 Bathroom',
    items: ['Mirrors', 'Soap Dispensers', 'Towel Sets', 'Shower Accessories'],
    category: 'bathroom'
  },
  {
    title: '🪑 Furniture & Storage',
    items: ['Tables & Desks', 'Wardrobes', 'Shoe Racks', 'Bookshelves'],
    category: 'furniture-storage'
  },
  {
    title: '🌬️ Climate & Comfort',
    items: ['Air Conditioners', 'Fans', 'Heaters', 'Air Purifiers'],
    category: 'home-climate'
  },
  {
    title: '🧺 Laundry Care',
    items: ['Washing Machines', 'Dryers', 'Irons', 'Ironing Boards'],
    category: 'laundry-garment'
  },
  {
    title: '🎨 Home Décor',
    items: ['Carpets & Rugs', 'Wall Art', 'Clocks', 'Curtains'],
    category: 'home-decor'
  },
  {
    title: '🔥 Featured',
    items: ['Best Sellers', 'New Arrivals', 'Top Rated', 'Staff Picks'],
    category: 'featured'
  }
];

const MegaMenu = ({ onCategoryClick }: MegaMenuProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute left-0 top-full w-full max-w-[1200px] glass-dark p-4 rounded-lg shadow-gold z-40 mt-2"
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((col) => (
          <div key={col.title}>
            <h4 
              className="text-primary font-semibold text-sm mb-2 cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() => onCategoryClick(col.category)}
            >
              {col.title}
            </h4>
            <ul className="space-y-1.5">
              {col.items.map((item) => (
                <li 
                  key={item}
                  onClick={() => onCategoryClick(col.category)}
                  className="text-muted-foreground text-xs cursor-pointer transition-colors hover:text-foreground"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MegaMenu;
