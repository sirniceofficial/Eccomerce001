import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const StarRating = ({ rating, reviewCount = 0, size = 'sm', showCount = true }: StarRatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const iconSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  // Generate stars
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${iconSize} fill-primary text-primary`}
        />
      );
    }

    // Half star
    if (hasHalfStar && fullStars < 5) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${iconSize} text-muted-foreground/30`} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={`${iconSize} fill-primary text-primary`} />
          </div>
        </div>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${iconSize} text-muted-foreground/30`}
        />
      );
    }

    return stars;
  };

  if (rating === 0 && reviewCount === 0) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${iconSize} text-muted-foreground/30`} />
          ))}
        </div>
        {showCount && (
          <span className={`${textSize} text-muted-foreground`}>
            No reviews
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>
      {showCount && (
        <span className={`${textSize} text-muted-foreground`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default StarRating;