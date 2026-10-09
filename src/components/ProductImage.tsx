import { useEffect, useState } from 'react';
import { getFallbackImage, resolveImageSrc } from '@/lib/imageFallback';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  /** Category slug or name — decides which fallback photo is used. */
  category?: string | null;
  className?: string;
}

/**
 * Renders a product image with a graceful fallback: if the local asset
 * (bundled import, /public path or storage URL) is missing or fails to load,
 * a high-quality categorized photo is shown instead of an empty gray box.
 */
const ProductImage = ({ src, alt, category, className = '' }: ProductImageProps) => {
  const [current, setCurrent] = useState(() => resolveImageSrc(src, category));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(resolveImageSrc(src, category));
    setFailed(false);
  }, [src, category]);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (failed) return;
        setFailed(true);
        setCurrent(getFallbackImage(category));
      }}
      className={`object-cover w-full h-full ${className}`}
    />
  );
};

export default ProductImage;
