import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Amina O.',
    location: 'Lagos',
    rating: 5,
    text: 'The air fryer I ordered was delivered the next day! Excellent quality and the price was unbeatable. Will definitely shop here again.',
    product: 'Air Fryer 3.5L',
    avatar: 'AO',
  },
  {
    id: 2,
    name: 'David K.',
    location: 'Nairobi',
    rating: 5,
    text: 'Best online store for home appliances. The rice cooker works perfectly and customer service was very responsive.',
    product: 'Rice Cooker 1.8L',
    avatar: 'DK',
  },
  {
    id: 3,
    name: 'Fatima B.',
    location: 'Accra',
    rating: 4,
    text: 'Great selection of kitchen items. The blender is powerful and looks premium. Shipping took a bit longer but worth the wait.',
    product: 'Blender 500W',
    avatar: 'FB',
  },
  {
    id: 4,
    name: 'James M.',
    location: 'Kampala',
    rating: 5,
    text: 'Furnished my entire apartment from Remmy HomesHub. The sofa set and dining table are stunning. Highly recommended!',
    product: 'Sofa Set 3+2',
    avatar: 'JM',
  },
  {
    id: 5,
    name: 'Grace T.',
    location: 'Dar es Salaam',
    rating: 5,
    text: 'The washing machine has been a game changer. Easy to set up and works quietly. Love shopping here!',
    product: 'Washing Machine 7kg',
    avatar: 'GT',
  },
  {
    id: 6,
    name: 'Samuel A.',
    location: 'Abuja',
    rating: 4,
    text: 'Bought a smart TV during the flash sale. Picture quality is amazing and the price was the best I could find anywhere.',
    product: 'Smart TV 43"',
    avatar: 'SA',
  },
];

const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const itemsPerView = typeof window !== 'undefined' && window.innerWidth >= 768 ? 3 : 1;
  const maxIndex = Math.max(0, testimonials.length - itemsPerView);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, maxIndex]);

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrent((c) => (c <= 0 ? maxIndex : c - 1));
  };

  const next = () => {
    setIsAutoPlaying(false);
    setCurrent((c) => (c >= maxIndex ? 0 : c + 1));
  };

  return (
    <section className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-foreground">💬 What Our Customers Say</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Real reviews from happy shoppers</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center hover:bg-accent transition-colors text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * (100 / itemsPerView)}%)` }}
        >
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="shrink-0 px-2"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <div className="bg-accent/30 border border-border/50 rounded-xl p-4 md:p-5 h-full flex flex-col">
                <Quote className="w-5 h-5 text-primary/40 mb-2 shrink-0" />
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.location} · {t.product}</p>
                  </div>
                  <div className="flex gap-0.5 ml-auto shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < t.rating ? 'fill-primary text-primary' : 'text-border'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
