import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import product images for carousel
import airFryer from '@/assets/products/air-fryer.jpg';
import coffeeMaker from '@/assets/products/coffee-maker.jpg';
import officeDesk from '@/assets/products/office-desk.jpg';
import robotVacuum from '@/assets/products/robot-vacuum.jpg';
import showerCaddy from '@/assets/products/shower-caddy.jpg';
import chandelier from '@/assets/products/chandelier.jpg';

interface Slide {
  title: string;
  description: string;
  image: string;
  category: string;
  buttonText: string;
}

const slides: Slide[] = [
  {
    title: "January Madness!",
    description: "UP TO 30% OFF on TVs, appliances, furniture & more. BUY MORE, SAVE MORE with bulk discounts!",
    image: airFryer,
    category: "flash-sales",
    buttonText: "Shop January Deals"
  },
  {
    title: "Kitchen Essentials",
    description: "Upgrade your kitchen with premium cookware, utensils, and appliances. Quality that lasts!",
    image: coffeeMaker,
    category: "kitchen-appliances",
    buttonText: "Explore Kitchen"
  },
  {
    title: "Office Productivity",
    description: "Create the perfect workspace with our desk organizers, lamps, and office essentials.",
    image: officeDesk,
    category: "furniture-storage",
    buttonText: "Shop Office"
  },
  {
    title: "Smart Electronics",
    description: "FREE DELIVERY within CBD. Latest speakers, kettles, blenders & more with M-Pesa payments!",
    image: robotVacuum,
    category: "home-climate",
    buttonText: "Shop Electronics"
  },
  {
    title: "Bathroom Makeover",
    description: "Transform your bathroom with stylish organizers, mats, towel racks & premium accessories.",
    image: showerCaddy,
    category: "bathroom",
    buttonText: "Shop Bathroom"
  },
  {
    title: "Home Decor",
    description: "Beautiful clocks, lamps, and decorative pieces to make your house feel like home.",
    image: chandelier,
    category: "home-decor",
    buttonText: "Explore Decor"
  }
];

interface HeroCarouselProps {
  onCategoryClick: (category: string) => void;
}

const HeroCarousel = ({ onCategoryClick }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleButtonClick = (category: string) => {
    navigate(`/category/${category}`);
    onCategoryClick(category);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div 
      className="relative h-[220px] sm:h-[280px] md:h-[350px] rounded-xl overflow-hidden mt-4 shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src={slides[currentSlide].image} 
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center p-6 md:p-10">
            <div className="max-w-lg">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary mb-3 drop-shadow-lg"
              >
                {slides[currentSlide].title}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/90 mb-5 leading-relaxed text-sm md:text-base drop-shadow-md"
              >
                {slides[currentSlide].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button 
                  onClick={() => handleButtonClick(slides[currentSlide].category)}
                  className="bg-primary text-primary-foreground hover:bg-secondary font-bold px-6 py-3 transition-all hover:-translate-y-0.5 shadow-gold-glow text-sm md:text-base"
                >
                  {slides[currentSlide].buttonText}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left Arrow */}
      <button
        onClick={goToPrevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all hover:scale-110 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Navigation Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-primary w-8' 
                : 'bg-white/50 w-2.5 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* Pause Indicator */}
      {isPaused && (
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
          Paused
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
