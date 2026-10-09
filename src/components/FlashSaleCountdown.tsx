import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock } from 'lucide-react';
import { useFlashSale } from '@/hooks/useFlashSale';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const FlashSaleCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { sale } = useFlashSale();

  useEffect(() => {
    // Prefer the active flash sale end date from the database,
    // fall back to end of the current month.
    const endDate = sale
      ? new Date(sale.ends_at)
      : (() => {
          const now = new Date();
          return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        })();

    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - Date.now();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [sale]);


  const TimeBox = ({ value, label }: { value: number; label: string }) => (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-gradient-to-b from-primary to-secondary text-primary-foreground font-bold text-[10px] md:text-xs w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center shadow-sm relative overflow-hidden">
        <span className="relative z-10">{String(value).padStart(2, '0')}</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
      </div>
      <span className="text-foreground/70 text-[7px] md:text-[8px] mt-0.5 font-medium uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  );

  const Separator = () => (
    <div className="flex flex-col justify-center gap-0.5 pb-3">
      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
    </div>
  );

  return (
    <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-primary/20">
      {/* Icon */}
      <div className="hidden sm:flex items-center gap-2">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        >
          <Flame className="w-6 h-6 text-primary" />
        </motion.div>
        <div className="text-foreground">
          <div className="text-xs font-medium text-primary">SALE ENDS IN</div>
        </div>
      </div>

      {/* Mobile label */}
      <div className="flex sm:hidden items-center gap-1">
        <Clock className="w-4 h-4 text-primary" />
      </div>

      {/* Timer */}
      <div className="flex items-center gap-0.5 md:gap-1">
        <TimeBox value={timeLeft.days} label="Days" />
        <Separator />
        <TimeBox value={timeLeft.hours} label="Hrs" />
        <Separator />
        <TimeBox value={timeLeft.minutes} label="Min" />
        <Separator />
        <TimeBox value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
};

export default FlashSaleCountdown;