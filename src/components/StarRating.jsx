import React, { useState } from 'react';

// ✅ React Icons
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: { icon: 'w-4 h-4', gap: 'space-x-1' },
    md: { icon: 'w-6 h-6', gap: 'space-x-1.5' },
    lg: { icon: 'w-8 h-8', gap: 'space-x-2' },
    xl: { icon: 'w-10 h-10', gap: 'space-x-2.5' }
  };

  const { icon: iconSize, gap: gapSize } = sizeClasses[size] || sizeClasses.md;

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex ${gapSize}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating);
        const isCurrentHover = star === hoverRating && !readonly;
        
        return (
          <button
            key={star}
            type="button"
            className={`transition-all duration-300 ${
              readonly 
                ? 'cursor-default' 
                : 'cursor-pointer transform hover:scale-125 active:scale-95 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded-full'
            } ${isCurrentHover ? 'animate-pulse' : ''}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={star <= rating}
          >
            {isFilled ? (
              <FaStar 
                className={`${iconSize} text-yellow-400 fill-current drop-shadow-sm ${
                  readonly ? '' : 'filter hover:brightness-110'
                }`}
              />
            ) : (
              <FaRegStar 
                className={`${iconSize} text-gray-300 ${
                  readonly ? '' : 'hover:text-yellow-300'
                }`}
              />
            )}
          </button>
        );
      })}
      
      {/* Rating Text Display */}
      {!readonly && rating > 0 && (
        <div className="ml-3 flex items-center space-x-1">
          <span className="text-lg font-bold text-gray-800">{rating}.0</span>
          <span className="text-xs text-gray-500">/ 5.0</span>
        </div>
      )}
    </div>
  );
};

// ✅ Rating Description Helper
export const getRatingDescription = (rating) => {
  switch (rating) {
    case 5: return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    case 4: return { text: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-100' };
    case 3: return { text: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case 2: return { text: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    case 1: return { text: 'Very Poor', color: 'text-red-600', bg: 'bg-red-100' };
    default: return { text: 'Not rated', color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

// ✅ Static Star Rating Display Component
export const StaticStarRating = ({ rating, showText = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;
  const description = getRatingDescription(rating);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${iconSize} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      
      {showText && (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-800">{rating}.0</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${description.bg} ${description.color}`}>
            {description.text}
          </span>
        </div>
      )}
    </div>
  );
};

// ✅ Average Rating Component
export const AverageRating = ({ rating, reviewCount, size = 'md' }) => {
  const sizeClasses = {
    sm: { star: 'w-4 h-4', text: 'text-sm', count: 'text-xs' },
    md: { star: 'w-5 h-5', text: 'text-base', count: 'text-sm' },
    lg: { star: 'w-6 h-6', text: 'text-lg', count: 'text-base' }
  };

  const sizes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        <FaStar className={`${sizes.star} text-yellow-400 fill-current`} />
        <span className={`${sizes.text} font-bold text-gray-800`}>
          {typeof rating === 'number' ? rating.toFixed(1) : '0.0'}
        </span>
      </div>
      
      {reviewCount !== undefined && (
        <div className="h-4 w-px bg-gray-300"></div>
      )}
      
      {reviewCount !== undefined && (
        <span className={`${sizes.count} text-gray-600`}>
          {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};

export default StarRating;