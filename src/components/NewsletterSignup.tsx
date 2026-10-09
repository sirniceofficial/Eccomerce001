import { useState } from 'react';
import { Mail, Send, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubscribed(true);
    toast.success('Welcome to the Remmy family! 🎉');
    setEmail('');
    setIsSubmitting(false);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/20 py-12 px-4 rounded-2xl border border-primary/20 shadow-lg">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-xl mx-auto text-center">
        {/* Icon header */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-4"
        >
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-3 h-3 text-destructive-foreground" />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h3 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-2"
        >
          Join the Remmy Family! 🏠
        </motion.h3>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-6 text-sm sm:text-base"
        >
          Subscribe for exclusive deals, new arrivals, and home décor inspiration delivered straight to your inbox!
        </motion.p>

        {/* Benefits */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-6"
        >
          {[
            { icon: Gift, text: '10% Off First Order' },
            { icon: Sparkles, text: 'Exclusive Deals' },
          ].map((benefit, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-primary/20 text-xs sm:text-sm"
            >
              <benefit.icon className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{benefit.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          {!isSubscribed ? (
            <motion.form 
              key="form"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-background/80 backdrop-blur-sm border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="h-12 px-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-primary" />
                </div>
              </motion.div>
              <p className="text-foreground font-semibold text-lg">You're In! 🎉</p>
              <p className="text-muted-foreground text-sm">Check your inbox for your 10% discount code</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy note */}
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-xs text-muted-foreground/70"
        >
          We respect your privacy. Unsubscribe anytime.
        </motion.p>
      </div>
    </section>
  );
};

export default NewsletterSignup;
