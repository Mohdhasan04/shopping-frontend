import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Modern Icons
import { 
  FiHeart, 
  FiShoppingCart, 
  FiEye, 
  FiStar,
  FiTrendingUp,
  FiPackage,
  FiZap,
  FiCheck,
  FiClock,
  FiPercent,
  FiImage
} from 'react-icons/fi';
import { RiFlashlightFill } from 'react-icons/ri';
import { HiOutlineFire } from 'react-icons/hi';

const ProductCard = ({ product, layout = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [wishlistStatus, setWishlistStatus] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // ✅ SIMPLE TOAST HELPER - FIXED (no cooldown needed)
  const showProductToast = (type, message) => {
    toast.dismiss(); // Always remove previous toasts first
    
    if (type === 'success') {
      toast.success(message, {
        position: 'bottom-center',
        duration: 3000,
      });
    } else if (type === 'error') {
      toast.error(message, {
        position: 'bottom-center',
        duration: 4000,
      });
    } else {
      toast(message, {
        position: 'bottom-center',
        duration: 3000,
      });
    }
  };

  // Check wishlist status
  useEffect(() => {
    if (user && product) {
      const status = isInWishlist(parseInt(product.id));
      setWishlistStatus(status);
    } else {
      setWishlistStatus(false);
    }
  }, [product, user, isInWishlist]);

  // Product data
  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price > product.price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  
  const isNew = product.created_at && 
    (new Date() - new Date(product.created_at)) < 30 * 24 * 60 * 60 * 1000;
  
  const isPopular = (product.rating >= 4.5) || (product.review_count > 100);
  const isFeatured = product.is_featured || false;

  // **FIXED: IMAGE URL FUNCTION - WORKS WITH YOUR DATABASE**
  const getImageUrl = () => {
    if (!product.image) {
      // Default placeholder for products without image
      return getPlaceholderImage();
    }
    
    const img = product.image.toString().trim();
    
    // Case 1: Already a full URL (https://images.unsplash.com)
    if (img.startsWith('http://') || img.startsWith('https://')) {
      return img;
    }
    
    // Case 2: Local upload with /uploads/ prefix
    if (img.startsWith('/uploads/')) {
      return `http://${window.location.hostname}:5000${img}`;
    }
    
    // Case 3: Just a filename
    if (img.includes('.jpg') || img.includes('.png') || img.includes('.jpeg')) {
      // Check if it has uploads folder in path
      if (img.includes('uploads')) {
        // Fix any backslashes
        const cleanPath = img.replace(/\\/g, '/');
        // Ensure it starts with /
        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `http://${window.location.hostname}:5000${finalPath}`;
      } else {
        return `http://${window.location.hostname}:5000/uploads/${img}`;
      }
    }
    
    // Case 4: Use placeholder
    return getPlaceholderImage();
  };

  // Simple placeholder generator
  const getPlaceholderImage = () => {
    const colors = [
      ['#ec4899', '#db2777'], // Pink - Face Care
      ['#f59e0b', '#d97706'], // Amber - Hair Care
      ['#10b981', '#059669'], // Emerald - Body Care
      ['#8b5cf6', '#7c3aed'], // Violet - Special Care
    ];
    
    const categoryId = product.category_id || 1;
    const colorIndex = (categoryId - 1) % colors.length;
    const [color1, color2] = colors[colorIndex];
    
    const productName = product.name || 'Product';
    const initials = productName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${color1}" stop-opacity="1"/>
            <stop offset="100%" stop-color="${color2}" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#grad)"/>
        <text x="200" y="220" font-family="Arial" font-size="60" 
              fill="white" text-anchor="middle" font-weight="bold" opacity="0.9">
          ${initials}
        </text>
        <text x="200" y="280" font-family="Arial" font-size="24" 
              fill="white" text-anchor="middle" opacity="0.7">
          ${product.brand || 'Premium'}
        </text>
      </svg>
    `)}`;
  };

  const imageUrl = getImageUrl();

  // ✅ Add to Cart Handler - FIXED
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      showProductToast('error', 'Product is out of stock!');
      return;
    }
    
    // Toast will be shown by CartContext
    addToCart(product, 1);
  };

  // ✅ Wishlist Handler - FIXED
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showProductToast('error', 'Please login to use wishlist');
      navigate('/login');
      return;
    }
    
    if (isWishlistLoading) return;
    
    setIsWishlistLoading(true);
    try {
      if (wishlistStatus) {
        await removeFromWishlist(parseInt(product.id));
        showProductToast('success', 'Removed from wishlist');
      } else {
        await addToWishlist(parseInt(product.id));
        showProductToast('success', 'Added to wishlist!');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      showProductToast('error', 'Something went wrong');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Quick View Handler
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Open quick view modal or navigate to product page
    navigate(`/product/${product.id}`);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FiStar key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-3.5 h-3.5">
            <FiStar className="absolute text-gray-300 w-3.5 h-3.5" />
            <div className="absolute overflow-hidden w-1/2">
              <FiStar className="text-amber-400 fill-amber-400 w-3.5 h-3.5" />
            </div>
          </div>
        );
      } else {
        stars.push(<FiStar key={i} className="w-3.5 h-3.5 text-gray-300" />);
      }
    }
    return stars;
  };

  // List View Layout
  if (layout === 'list') {
    return (
      <div 
        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/3 lg:w-1/4 relative overflow-hidden">
            <div className="relative h-56 md:h-full bg-gray-100">
              {/* Loading Skeleton */}
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <FiImage className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Image Error State */}
              {imageError && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                  <FiImage className="w-16 h-16 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Image not available</span>
                </div>
              )}
              
              {/* Product Image */}
              <img
                src={imageUrl}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => {
                  setImageLoaded(true);
                  setImageError(false);
                }}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
                loading="lazy"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {isNew && (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <FiZap className="w-3 h-3" />
                    NEW
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <FiPercent className="w-3 h-3" />
                    {discount}% OFF
                  </span>
                )}
              </div>
              
              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
                className={`absolute top-3 right-3 p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                  wishlistStatus ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                } ${isWishlistLoading ? 'animate-pulse' : 'hover:scale-110'}`}
              >
                {isWishlistLoading ? (
                  <FiClock className="w-4 h-4 animate-spin" />
                ) : (
                  <FiHeart className={`w-4 h-4 ${wishlistStatus ? 'fill-current' : ''}`} />
                )}
              </button>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="md:w-2/3 lg:w-3/4 p-6">
            <div className="flex flex-col h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                    {product.category?.replace('-', ' ') || 'Beauty'}
                  </span>
                  {isPopular && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      <HiOutlineFire className="w-3 h-3" />
                      Popular
                    </span>
                  )}
                </div>
                
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || 'Premium quality skincare product for radiant results'}
                </p>
              </div>
              
              {/* Rating & Brand */}
              <div className="flex items-center gap-4 mb-4">
                {product.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {product.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.review_count || 0} reviews)
                    </span>
                  </div>
                )}
                
                {product.brand && (
                  <span className="text-xs text-gray-500">
                    By <span className="font-medium">{product.brand}</span>
                  </span>
                )}
              </div>
              
              {/* Price & Stock */}
              <div className="mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    {product.original_price > product.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          ₹{product.original_price.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Save ₹{(product.original_price - product.price).toFixed(2)}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {!isOutOfStock && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPackage className="w-4 h-4" />
                      <span>{product.stock || 10}+ in stock</span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isOutOfStock
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg hover:shadow-primary-200'
                    }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <FiPackage className="w-4 h-4" />
                        <span>Out of Stock</span>
                      </>
                    ) : (
                      <>
                        <FiShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleQuickView}
                    className="p-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {/* Loading Skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
              <FiImage className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {/* Image Error State */}
          {imageError && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <FiImage className="w-20 h-20 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Image not available</span>
            </div>
          )}
          
          {/* Product Image */}
          <img
            src={imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110 rotate-1' : 'scale-100'}`}
            onLoad={() => {
              setImageLoaded(true);
              setImageError(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoaded(false);
            }}
            loading="lazy"
          />
          
          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse animate-pulse-slow">
                <RiFlashlightFill className="w-3 h-3" />
                NEW
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <FiPercent className="w-3 h-3" />
                {discount}% OFF
              </span>
            )}
            {isFeatured && (
              <span className="bg-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <FiTrendingUp className="w-3 h-3" />
                FEATURED
              </span>
            )}
          </div>
          
          {/* Quick Actions Overlay */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}>
            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              disabled={isWishlistLoading}
              className={`p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 ${
                wishlistStatus ? 'text-red-500 shadow-red-200' : 'text-gray-600 hover:text-red-500'
              } ${isWishlistLoading ? 'animate-pulse' : 'hover:scale-110'}`}
            >
              {isWishlistLoading ? (
                <FiClock className="w-4 h-4 animate-spin" />
              ) : (
                <FiHeart className={`w-4 h-4 ${wishlistStatus ? 'fill-current' : ''}`} />
              )}
            </button>
            
            {/* Quick View Button */}
            <button
              onClick={handleQuickView}
              className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-600 hover:text-primary-600 transition-all duration-300 hover:scale-110"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </div>
          
          {/* Stock Status */}
          {isOutOfStock ? (
            <div className="absolute bottom-3 left-3 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
              <FiPackage className="w-3 h-3" />
              <span>Out of Stock</span>
            </div>
          ) : product.stock < 10 && (
            <div className="absolute bottom-3 left-3 bg-amber-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
              <FiPackage className="w-3 h-3" />
              <span>Only {product.stock} left</span>
            </div>
          )}
          
          {/* Add to Cart Overlay */}
          <div className={`absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-gray-900 hover:bg-primary-600 hover:text-white shadow-lg'
              }`}
            >
              {isOutOfStock ? (
                <>
                  <FiPackage className="w-4 h-4" />
                  <span>Out of Stock</span>
                </>
              ) : (
                <>
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          {/* Category & Brand */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              {product.category?.replace('-', ' ') || 'Beauty'}
            </span>
            {product.brand && (
              <span className="text-xs text-gray-500 font-medium">
                {product.brand}
              </span>
            )}
          </div>
          
          {/* Product Name */}
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 mb-2">
              {product.name}
            </h3>
          </Link>
          
          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {product.description || 'Premium organic beauty product with natural ingredients'}
          </p>
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm font-medium text-gray-900">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({product.review_count || 0})
            </span>
          </div>
        )}

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.original_price > product.price && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.original_price.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-green-600">
                    Save ₹{(product.original_price - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>
            
            {/* Free Shipping Badge */}
            {product.price > 499 && (
              <div className="flex items-center gap-1 mt-1">
                <FiCheck className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Free Shipping</span>
              </div>
            )}
          </div>
          
          {/* Quick Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-3 rounded-xl transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            <FiShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;