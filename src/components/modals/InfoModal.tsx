import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'large';
}

const InfoModal = ({ isOpen, onClose, title, children, size = 'small' }: InfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-background/90 flex items-center justify-center z-50 p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={`bg-card-light rounded-lg w-full max-h-[90vh] overflow-y-auto p-5 relative shadow-2xl ${
              size === 'large' ? 'max-w-[800px]' : 'max-w-[480px]'
            }`}
          >
            <button 
              onClick={onClose}
              className="absolute right-3 top-2 text-card-light-foreground/60 hover:text-card-light-foreground transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            <h3 className="text-xl font-bold text-card-light-foreground mb-4">{title}</h3>
            
            <div className="text-card-light-foreground/80 leading-relaxed">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
