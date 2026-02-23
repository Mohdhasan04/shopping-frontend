import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { StaticStarRating, AverageRating } from '../components/StarRating';
import ProductReviews from '../components/ProductReviews';
import toast from 'react-hot-toast';

// ✅ React Icons
import {
  FaShoppingCart,
  FaHeart,
  FaCheckCircle,
  FaTruck,
  FaShieldAlt,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaTag,
  FaBox,
  FaStar,
  FaArrowLeft
} from 'react-icons/fa';

// ✅ SIMPLE TOAST HELPER
const showProductDetailsToast = (type, message) => {
  toast.dismiss();
  if (type === 'success') {
    toast.success(message, { position: 'bottom-center', duration: 3000 });
  } else if (type === 'error') {
    toast.error(message, { position: 'bottom-center', duration: 4000 });
  }
};

// ✅ IMAGE HELPER FUNCTIONS
const getSafeImageUrl = (imageInput, productName = 'Product') => {
  const backendUrl = `http://${window.location.hostname}:5000`;
  let imagePath = '';

  if (typeof imageInput === 'string') {
    imagePath = imageInput;
  } else if (imageInput && typeof imageInput === 'object') {
    imagePath = imageInput.url || imageInput.image || '';
  } else if (imageInput === null || imageInput === undefined) {
    imagePath = '';
  }

  if (!imagePath || imagePath === '' || imagePath === '/api/placeholder/500/500') {
    return getLocalPlaceholderSVG(productName);
  }

  const imagePathStr = String(imagePath);

  if (imagePathStr.includes('via.placeholder.com') ||
    imagePathStr.includes('placeholder.com') ||
    imagePathStr.includes('/api/placeholder')) {
    return getLocalPlaceholderSVG(productName);
  }

  if (imagePathStr.startsWith('data:image')) return imagePathStr;

  if (imagePathStr.startsWith('http') && !imagePathStr.includes('placeholder')) {
    return imagePathStr;
  }

  if (imagePathStr.startsWith('/uploads/') || imagePathStr.startsWith('uploads/')) {
    const cleanPath = imagePathStr.startsWith('/') ? imagePathStr : `/${imagePathStr}`;
    return backendUrl + cleanPath;
  }

  return backendUrl + '/uploads/' + imagePathStr;
};

const getLocalPlaceholderSVG = (text = "Product Image") => {
  const svg = `
    <svg width="500" height="500" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org2000/svg">
      <rect width="500" height="500" fill="#f3f4f6"/>
      <text x="250" y="250" font-family="Arial" font-size="16" fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [refreshReviewsKey, setRefreshReviewsKey] = useState(0); // ✅ FOR REVIEW REFRESH
  const reviewsRef = useRef(null);

  // ✅ NEW: Add these states for REAL review count
  const [realReviewCount, setRealReviewCount] = useState(0);
  const [realAverageRating, setRealAverageRating] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // In the useEffect that fetches product, update it:
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);

        if (!isMounted) return;

        if (response.data.success && response.data.product) {
          const productData = response.data.product;
          setProduct(productData);
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }

          // ✅ Fetch REAL review count after product loads
          setTimeout(() => {
            fetchRealReviewStats();
          }, 500);
        } else {
          setProduct(getDummyProduct(id));
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error loading product:', error);
        setProduct(getDummyProduct(id));
      } finally {
        if (isMounted) {
          setTimeout(() => setLoading(false), 300);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const getDummyProduct = (productId) => {
    return {
      id: productId,
      name: "Premium Beauty Product",
      description: "Experience premium quality...",
      price: 1299,
      original_price: 1999,
      stock: 15,
      category: "Face Care",
      rating: 4.7,
      image: getLocalPlaceholderSVG("Main Product"),
      images: [],
      brand: "Premium Beauty",
      sku: `PB-${productId}`,
      ingredients: "Natural oils, Vitamins, Plant extracts",
      benefits: "Hydrates, Brightens, Reduces blemishes"
    };
  };

  // Add this function after handleBuyNow function
  const fetchRealReviewStats = async () => {
    try {
      console.log(`📊 Fetching real review stats for product ${id}...`);
      const response = await api.get(`/reviews/product/${id}`);

      if (response.data.success) {
        const reviews = response.data.reviews || [];
        const count = reviews.length;
        const average = count > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
          : 0;

        console.log(`✅ Real stats: ${count} reviews, ${average.toFixed(1)} rating`);

        setRealReviewCount(count);
        setRealAverageRating(parseFloat(average.toFixed(1)));

        // Update product data too
        if (product) {
          setProduct(prev => ({
            ...prev,
            review_count: count,
            rating: parseFloat(average.toFixed(1))
          }));
        }

        return count;
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
      setRealReviewCount(0);
      setRealAverageRating(0);
      return 0;
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock <= 0) {
      showProductDetailsToast('error', `${product.name} is out of stock!`);
      return;
    }
    const productToAdd = selectedVariant
      ? { ...product, price: parseFloat(selectedVariant.price), selectedVariant }
      : product;

    addToCart(productToAdd, quantity);
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      showProductDetailsToast('success', 'Removed from wishlist');
    } else {
      addToWishlist(product.id);
      showProductDetailsToast('success', 'Added to wishlist!');
    }
  };

  const handleBuyNow = () => {
    if (!product) return;

    if (product.stock <= 0) {
      showProductDetailsToast('error', 'Product out of stock!');
      return;
    }
    const productToAdd = selectedVariant
      ? { ...product, price: parseFloat(selectedVariant.price), selectedVariant }
      : product;

    addToCart(productToAdd, quantity);
    setTimeout(() => {
      navigate('/checkout');
    }, 300);
  };

  // ✅ Function to refresh reviews when new review is added
  // Update handleReviewAdded function
  const handleReviewAdded = async () => {
    console.log('🔄 Review added, refreshing reviews...');

    // 1. Force refresh reviews component
    setRefreshReviewsKey(prev => prev + 1);

    // 2. Wait 1 second and update review count
    setTimeout(async () => {
      await fetchRealReviewStats();
      console.log('✅ Review count updated to:', realReviewCount + 1);
    }, 1000);
  };

  // Re-fetch product function
  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      if (response.data.success && response.data.product) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.error('Error refreshing product:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-8"></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-[500px] animate-pulse"></div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-200 rounded-xl h-24 animate-pulse"></div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBox className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for might have been removed or is temporarily unavailable.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Browse All Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let safeImages = [];

  if (Array.isArray(product.images) && product.images.length > 0) {
    safeImages = product.images.map((img, index) =>
      getSafeImageUrl(img, `${product.name} ${index + 1}`)
    );
  } else if (product.image) {
    safeImages = [getSafeImageUrl(product.image, product.name)];
  } else {
    safeImages = [getLocalPlaceholderSVG(product.name)];
  }

  if (safeImages.length === 0) {
    safeImages = [getLocalPlaceholderSVG(product.name)];
  }

  const isOutOfStock = product.stock <= 0;
  const discount = product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-primary-600 transition-colors flex items-center space-x-1">
                <span>Home</span>
              </Link>
            </li>
            <li>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
            </li>
            <li>
              <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
            </li>
            <li>
              <FaChevronRight className="w-3 h-3 text-gray-400" />
            </li>
            <li>
              <span className="text-gray-800 font-medium">{product.name}</span>
            </li>
          </ol>
        </nav>

        {/* Product Display */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images Section */}
            <div>
              <div className="relative mb-6">
                <img
                  src={safeImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-contain rounded-2xl border-2 border-gray-100"
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center space-x-2">
                    <FaTag className="w-4 h-4" />
                    <span>{discount}% OFF</span>
                  </div>
                )}
              </div>

              {safeImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {safeImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`border-2 rounded-xl overflow-hidden transition-all duration-300 ${selectedImage === idx
                          ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
                          : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
                        }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Section */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AverageRating
                    rating={realAverageRating || product?.rating || 0}
                    reviewCount={realReviewCount || product?.review_count || 0}
                    size="md"
                  />
                  <span className="text-gray-600">
                    ({realReviewCount || product?.review_count || 0} reviews) {/* ✅ REAL COUNT */}
                  </span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold flex items-center space-x-2 ${isOutOfStock
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span>{isOutOfStock ? 'Out of Stock' : 'In Stock'}</span>
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-4 mb-3">
                  <span className="text-5xl font-bold text-primary-600">
                    ₹{selectedVariant ? selectedVariant.price : product.price}
                  </span>
                  {product.original_price > product.price && !selectedVariant && (
                    <>
                      <span className="text-2xl text-gray-400 line-through">₹{product.original_price}</span>
                      <span className="text-lg font-bold text-green-600 flex items-center space-x-1">
                        <FaTag className="w-4 h-4" />
                        <span>Save ₹{(product.original_price - product.price).toFixed(2)}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                  <p className="font-semibold text-gray-800 mb-3 block">Select Size / Variant:</p>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 border-2 rounded-xl transition-all font-medium ${selectedVariant?.size === v.size
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:bg-gray-50'
                          }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-gray-700 text-lg mb-8 leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                {product.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaTruck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Free Delivery</p>
                    <p className="text-sm text-gray-600">Above ₹299</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">100% Authentic</p>
                    <p className="text-sm text-gray-600">Quality Guaranteed</p>
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-8">
                <p className="font-semibold text-gray-800 mb-3">Quantity:</p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-5 py-3 text-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                      <FaMinus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 text-xl font-bold min-w-[80px] text-center bg-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={isOutOfStock || quantity >= product.stock}
                      className="px-5 py-3 text-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className={`text-lg font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                    {isOutOfStock ? 'Out of stock' : `${product.stock} units available`}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 text-lg font-bold rounded-xl transition-all duration-300 ${isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-600 to-emerald-600 text-white hover:shadow-xl hover:scale-[1.02] shadow-lg'
                    }`}
                >
                  <FaShoppingCart className="w-5 h-5" />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 text-lg font-bold rounded-xl border-2 transition-all duration-300 ${isOutOfStock
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'border-primary-600 text-primary-600 hover:bg-gradient-to-r hover:from-primary-600 hover:to-emerald-600 hover:text-white hover:border-transparent'
                    }`}
                >
                  <FaCheckCircle className="w-5 h-5" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={handleWishlistToggle}
                  disabled={isOutOfStock}
                  className={`px-6 py-4 text-lg rounded-xl border-2 transition-all duration-300 flex items-center justify-center space-x-2 ${isOutOfStock
                      ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                      : isInWishlist(product.id)
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:bg-red-100'
                        : 'border-gray-300 text-gray-700 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50'
                    }`}
                >
                  <FaHeart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  <span>{isInWishlist(product.id) ? 'Saved' : 'Wishlist'}</span>
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t border-gray-200 pt-8">
                <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center space-x-2">
                  <FaBox className="w-5 h-5 text-primary-600" />
                  <span>Product Details</span>
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Category</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {product.category_name || product.category || 'Skincare'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Brand</p>
                    <p className="font-semibold text-gray-800 text-green-600">Organic Beauty</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Rating</p>
                    <p className="font-semibold text-gray-800 flex items-center">
                      <FaStar className="w-4 h-4 text-yellow-500 mr-1" />
                      {product.rating ? product.rating.toFixed(1) : '4.5'} / 5
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-gray-600 text-sm mb-1">Stock Status</p>
                    <p className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stock} units`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100" ref={reviewsRef}>
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 py-5 text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'description'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-gradient-to-b from-primary-50 to-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <span>Description</span>
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-5 text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'reviews'
                    ? 'text-primary-600 border-b-2 border-primary-600 bg-gradient-to-b from-primary-50 to-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <FaStar className="w-4 h-4" />
                <span>Reviews ({realReviewCount || product?.review_count || 0})</span> {/* ✅ REAL COUNT */}
              </button>
              {product.ingredients && (
                <button
                  onClick={() => setActiveTab('ingredients')}
                  className={`flex-1 py-5 text-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-300 ${activeTab === 'ingredients'
                      ? 'text-primary-600 border-b-2 border-primary-600 bg-gradient-to-b from-primary-50 to-transparent'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <span>Ingredients</span>
                </button>
              )}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FaBox className="w-5 h-5 text-primary-600" />
                  </div>
                  <span>About this product</span>
                </h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-6 rounded-xl border border-gray-100">
                    {product.description}
                  </p>
                  {product.benefits && (
                    <div className="mt-8">
                      <h4 className="text-xl font-bold mb-6 flex items-center space-x-2">
                        <FaCheckCircle className="w-5 h-5 text-green-600" />
                        <span>Key Benefits:</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.benefits.split(',').map((benefit, idx) => (
                          <div key={idx} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-100">
                            <FaCheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-800 font-medium">{benefit.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center">
                        <FaStar className="w-5 h-5 text-yellow-600" />
                      </div>
                      <span>Customer Reviews</span>
                    </h3>
                    <p className="text-gray-600 mt-2">What customers are saying about this product</p>
                  </div>
                  <div className="text-center bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                    <div className="text-5xl font-bold text-primary-600 mb-2">
                      {(realAverageRating || product?.rating || 0).toFixed(1)}
                    </div>
                    <StaticStarRating rating={realAverageRating || product?.rating || 0} showText={true} size="lg" />
                    <p className="text-gray-600 mt-3 font-medium">
                      {realReviewCount || product?.review_count || 0} reviews {/* ✅ REAL COUNT */}
                    </p>
                  </div>
                </div>


                {/* ✅ Reviews List with refresh key */}
                <ProductReviews
                  productId={product.id}
                  key={refreshReviewsKey}
                  onReviewAdded={() => {
                    // This function will be called when reviews load or new review added
                    console.log('🔄 Reviews updated, fetching new count...');

                    // Fetch updated review stats
                    setTimeout(async () => {
                      try {
                        const response = await api.get(`/reviews/product/${product.id}`);
                        if (response.data.success) {
                          const newCount = response.data.reviews?.length || 0;
                          console.log(`📈 New review count: ${newCount}`);

                          // Update local state
                          setRealReviewCount(newCount);

                          // Update product data
                          setProduct(prev => ({
                            ...prev,
                            review_count: newCount
                          }));
                        }
                      } catch (error) {
                        console.error('Error updating review count:', error);
                      }
                    }, 500);
                  }}
                />
              </div>
            )}

            {activeTab === 'ingredients' && product.ingredients && (
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span>Ingredients</span>
                </h3>
                <div className="bg-gradient-to-r from-gray-50 to-white p-8 rounded-2xl border border-gray-200">
                  <p className="text-gray-700 leading-relaxed text-lg">{product.ingredients}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;