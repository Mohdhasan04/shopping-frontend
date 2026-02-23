import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
// Import React Icons
import {
  FaShoppingCart, FaTrash, FaPlus, FaMinus,
  FaArrowLeft, FaCreditCard, FaTruck, FaTag,
  FaLock, FaCheckCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { MdShoppingBag } from 'react-icons/md';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  // ✅ FIXED: Function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '') {
      return 'https://via.placeholder.com/96x96/cccccc/969696?text=No+Image';
    }

    // Check if it's a local uploads path
    if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads/')) {
      return `http://${window.location.hostname}:5000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    }

    // Check if it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // For placeholder URLs
    if (imagePath.includes('via.placeholder.com') || imagePath.includes('unsplash.com')) {
      return imagePath;
    }

    // Default: assume it's a relative path
    return `http://${window.location.hostname}:5000/uploads/${imagePath}`;
  };

  // Calculate cart count manually
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const subtotal = getCartTotal();
  const shippingCost = subtotal >= 299 ? 0 : 50;
  //const tax = getCartTotal() * 0.1;
  const totalAmount = getCartTotal() + shippingCost;

  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleRemoveItem = (cartItemId, productName) => {
    if (window.confirm(`Remove "${productName}" from cart?`)) {
      removeFromCart(cartItemId);
      toast.success('Item removed from cart');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-full flex items-center justify-center">
              <FaShoppingCart className="w-16 h-16 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any products to your cart yet.
            </p>
            <div className="space-y-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                <FaArrowLeft className="w-5 h-5" />
                Continue Shopping
              </Link>
              {!user && (
                <div className="text-sm text-gray-500">
                  <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    Sign in
                  </Link>{' '}
                  to see your saved items
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Shopping Cart</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <FaShoppingCart className="w-5 h-5" />
              <span>{cartCount} items in your cart</span>
            </div>
          </div>
          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
          >
            <FaTrash className="w-4 h-4" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {cartItems.map((item) => {
                // ✅ FIXED: Get the correct image URL
                const imageUrl = getImageUrl(item.image || item.image_url || item.product_image);

                return (
                  <div key={item.cartItemId || item.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* ✅ FIXED: Product Image with proper URL */}
                        <Link to={`/product/${item.id}`} className="relative flex-shrink-0">
                          <div className="w-24 h-24 rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors overflow-hidden bg-gray-100">
                            <img
                              src={imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image failed to load:', imageUrl);
                                e.target.src = 'https://via.placeholder.com/96x96/cccccc/969696?text=No+Image';
                                e.target.onerror = null; // Prevent infinite loop
                              }}
                            />
                          </div>

                          {/* Quantity Badge */}
                          <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                            {item.quantity}
                          </span>

                          {item.stock < item.quantity && (
                            <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                              <FaExclamationTriangle className="w-3 h-3" />
                              <span>Low Stock</span>
                            </div>
                          )}
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800 hover:text-emerald-600 transition-colors">
                                <Link to={`/product/${item.id}`}>
                                  {item.name}
                                </Link>
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded">
                                  {item.category}
                                </span>
                                {item.is_featured && (
                                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                                    <FaTag className="w-3 h-3" />
                                    Featured
                                  </span>
                                )}
                                {item.selectedVariant && (
                                  <span className="text-sm font-semibold text-primary-700 bg-primary-100 px-2 py-0.5 rounded ml-2">
                                    Size: {item.selectedVariant.size}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-emerald-600">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                ₹{item.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 mr-2">Quantity:</span>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => handleQuantityChange(item.cartItemId || item.id, item.quantity - 1)}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <FaMinus className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="w-12 text-center font-medium border-x border-gray-300 py-2">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item.cartItemId || item.id, item.quantity + 1)}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                  <FaPlus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.cartItemId || item.id, item.name)}
                              className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                              <FaTrash className="w-4 h-4" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium px-4 py-3 rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                <FaArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <MdShoppingBag className="w-6 h-6 text-emerald-500" />
                <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
              </div>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({cartCount})</span>
                  <span>₹{getCartTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaTruck className="w-4 h-4" />
                    <span>Shipping</span>
                  </div>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>
                {/* <div className="flex justify-between text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaLock className="w-4 h-4" />
                    <span>Tax (10%)</span>
                  </div>
                  <span>₹{tax.toLocaleString()}</span>
                </div> */}

                {/* Discount Code */}
                {/* <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors">
                      Apply
                    </button>
                  </div>
                </div> */}

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Amount</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        ₹{totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">Incl. all taxes</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {subtotal < 299 && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <FaTruck className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Add ₹{(299 - subtotal).toLocaleString()} more for free shipping!
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 299) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              {user ? (
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  <FaCreditCard className="w-5 h-5" />
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    <FaLock className="w-5 h-5" />
                    Login to Checkout
                  </Link>
                  <p className="text-sm text-gray-600 text-center">
                    New customer?{' '}
                    <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
                      Create an account
                    </Link>
                  </p>
                </div>
              )}

              {/* Security Assurance */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FaLock className="w-4 h-4" />
                  <span>Secure SSL Encryption</span>
                  <FaCheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;