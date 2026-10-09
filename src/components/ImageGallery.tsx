import { useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageGalleryProps {
  mainImage: string;
  productTitle: string;
}

// Generate gallery images with different "views" using CSS transforms
const generateGalleryImages = (mainImage: string, title: string) => {
  return [
    { src: mainImage, label: 'Front View', transform: '' },
    { src: mainImage, label: 'Side View', transform: 'scale-x-[-1]' },
    { src: mainImage, label: 'Top View', transform: 'rotate-3 scale-105' },
    { src: mainImage, label: 'Detail Shot', transform: 'scale-110 brightness-105' },
    { src: mainImage, label: 'Lifestyle', transform: 'sepia-[0.15] brightness-110' },
    { src: mainImage, label: 'Close-up', transform: 'scale-125 saturate-110' },
  ];
};

const ImageGallery = ({ mainImage, productTitle }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const images = generateGalleryImages(mainImage, productTitle);
  const currentImage = images[selectedIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Main Image with Zoom */}
      <div className="relative group">
        <div
          className={cn(
            "relative w-full h-[300px] md:h-[420px] rounded-md overflow-hidden cursor-zoom-in bg-card-light-foreground/5",
            isZoomed && "cursor-zoom-out"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
        >
          <img
            src={currentImage.src}
            alt={`${productTitle} - ${currentImage.label}`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              currentImage.transform,
              isZoomed && "scale-[2.5]"
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
          />
          
          {/* Zoom indicator */}
          {!isZoomed && (
            <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs text-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-3 h-3" />
              <span>Click to zoom</span>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-background transition-all opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-gold">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all",
              selectedIndex === index
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-card-light-foreground/30"
            )}
          >
            <img
              src={img.src}
              alt={`${productTitle} - ${img.label}`}
              className={cn("w-full h-full object-cover", img.transform)}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

// Fullscreen Zoom Modal Component
export const ZoomModal = ({
  isOpen,
  onClose,
  image,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  title: string;
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.min(Math.max(zoomLevel - e.deltaY * 0.001, 1), 4);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center"
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            Scroll to zoom • Drag to pan • Click outside to close
          </div>

          <motion.div
            className="max-w-[90vw] max-h-[90vh] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            }}
          >
            <img
              src={image}
              alt={title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg select-none"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageGallery;
