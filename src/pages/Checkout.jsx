import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

// ✅ React Icons Import
import {
  FaShoppingCart,
  FaUser,
  FaHome,
  FaCreditCard,
  FaPaypal,
  FaMoneyBillWave,
  FaTruck,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowRight,
  FaLock,
  FaShieldAlt,
  FaUndo,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCity,
  FaFlag,
  FaTag,
  FaBox
} from 'react-icons/fa';
import { GiIndiaGate } from 'react-icons/gi';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    paymentMethod: 'cod'
  });

  // ✅ ADD UPI STATE VARIABLES
  const [upiId, setUpiId] = useState('');
  const [showUpiInput, setShowUpiInput] = useState(false);

  // ✅ Debug: Check cart items
  useEffect(() => {
    if (cartItems.length > 0) {
      console.log('🔍 Cart Items Debug:', cartItems);
      console.log('🖼️ First item image data:', {
        image: cartItems[0]?.image,
        image_url: cartItems[0]?.image_url,
        images: cartItems[0]?.images,
        id: cartItems[0]?.id,
        name: cartItems[0]?.name
      });
    }
  }, [cartItems]);

  // ✅ Function to get product image URL
  const getProductImage = (item) => {
    console.log(`🖼️ Getting image for ${item.name}:`, {
      image: item.image,
      image_url: item.image_url,
      images: item.images
    });

    const getFullImageUrl = (imagePath) => {
      if (!imagePath || imagePath === '') {
        return 'https://via.placeholder.com/200x200/cccccc/969696?text=No+Image';
      }

      if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads/')) {
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        return `http://${window.location.hostname}:5000${cleanPath}`;
      }

      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }

      if (imagePath.includes('via.placeholder.com') || imagePath.includes('unsplash.com')) {
        return imagePath;
      }

      return `http://${window.location.hostname}:5000/uploads/${imagePath}`;
    };

    if (item.image && typeof item.image === 'string') {
      return getFullImageUrl(item.image);
    }

    if (item.image_url && typeof item.image_url === 'string') {
      return getFullImageUrl(item.image_url);
    }

    if (item.images && Array.isArray(item.images)) {
      if (item.images.length > 0) {
        if (typeof item.images[0] === 'string') {
          return getFullImageUrl(item.images[0]);
        }
        if (item.images[0] && item.images[0].url) {
          return getFullImageUrl(item.images[0].url);
        }
      }
    }

    if (item.image && item.image.url) {
      return getFullImageUrl(item.image.url);
    }

    return 'https://via.placeholder.com/200x200/cccccc/969696?text=No+Image';
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ UPI VALIDATION FUNCTION
  const validateUpiId = (id) => {
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiPattern.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // ✅ UPI VALIDATION
    if (formData.paymentMethod === 'upi') {
      if (!upiId.trim()) {
        toast.error('Please enter your UPI ID');
        return;
      }

      if (!validateUpiId(upiId.trim())) {
        toast.error('Please enter a valid UPI ID (e.g., username@upi)');
        return;
      }
    }

    // ✅ CRITICAL: Check for out of stock items in cart
    const outOfStockItems = cartItems.filter(item => {
      return item.stock === 0 || item.stock === undefined || item.stock === null;
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.name).join(', ');
      toast.error(`Cannot proceed: ${itemNames} ${outOfStockItems.length === 1 ? 'is' : 'are'} out of stock. Please remove ${outOfStockItems.length === 1 ? 'it' : 'them'} from cart.`);
      return;
    }

    // ✅ Check for low stock items
    const lowStockItems = cartItems.filter(item => {
      return item.stock > 0 && item.stock < item.quantity;
    });

    if (lowStockItems.length > 0) {
      const item = lowStockItems[0];
      toast.error(`Insufficient stock for ${item.name}. Available: ${item.stock}, Requested: ${item.quantity}`);
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Placing order...');

      // ✅ Pre-order stock verification from API
      console.log('🔍 Verifying stock from server...');

      for (const item of cartItems) {
        try {
          const response = await api.get(`/products/${item.id}`);
          const product = response.data.product;

          if (!product) {
            toast.error(`Product "${item.name}" not found`);
            setLoading(false);
            return;
          }

          if (product.stock === 0) {
            toast.error(`"${product.name}" is now out of stock. Please remove from cart.`);
            setLoading(false);
            return;
          }

          if (product.stock < item.quantity) {
            toast.error(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
            setLoading(false);
            return;
          }

          console.log(`✅ Stock verified: ${product.name} - Available: ${product.stock}`);
        } catch (error) {
          console.error(`Stock verification failed for ${item.name}:`, error);
          toast.error(`Could not verify stock for ${item.name}. Please try again.`);
          setLoading(false);
          return;
        }
      }

      // Calculate totals properly
      const subtotal = getCartTotal();
      const shipping = subtotal >= 299 ? 0 : 50;
      const total = subtotal + shipping;

      // ✅ FIXED: orderData INSIDE try block
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.selectedVariant ? `${item.name} (${item.selectedVariant.size})` : item.name,
          quantity: item.quantity,
          price: parseFloat(item.price) || 0,
        })),
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone,
        total_amount: parseFloat(total) || 0,
        payment_method: formData.paymentMethod,
        payment_status: formData.paymentMethod === 'cod' ? 'pending' : 'paid',
        user_id: user?.id || null,
        tracking_number: `TRK${Date.now().toString().slice(-8)}`,
        expected_delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      };

      console.log('📦 Order data:', orderData);

      const response = await api.post('/orders', orderData);
      console.log('✅ Order response:', response.data);

      toast.success('Order placed successfully! 🎉');
      clearCart();

      // Redirect to order confirmation
      if (response.data.orderId) {
        setTimeout(() => {
          navigate(`/order-confirmed/${response.data.orderId}`);
        }, 1000);
      } else if (response.data.order && response.data.order.id) {
        setTimeout(() => {
          navigate(`/order-confirmed/${response.data.order.id}`);
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/orders');
        }, 1000);
      }

    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('❌ Error response:', error.response?.data);

      if (error.response?.data?.message?.includes('stock') ||
        error.response?.data?.message?.includes('Stock') ||
        error.response?.data?.message?.includes('out of stock')) {

        toast.error(`Stock issue detected: ${error.response.data.message}. Your cart will be cleared.`);

        setTimeout(() => {
          clearCart();
          window.location.reload();
        }, 3000);

      } else {
        const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;

  // Check for out of stock items in cart
  const outOfStockInCart = cartItems.filter(item => item.stock === 0);
  const canCheckout = cartItems.length > 0 && outOfStockInCart.length === 0;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-4 text-lg rounded-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            >
              <FaArrowRight className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <FaCheckCircle className="w-8 h-8 text-green-600" />
          <span>Checkout</span>
        </h1>
        <p className="text-gray-600 mb-8">Complete your purchase securely</p>

        {/* ✅ Warning for out of stock items */}
        {outOfStockInCart.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl">
            <div className="flex items-start">
              <FaExclamationTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
              <div>
                <p className="text-red-800 font-medium">Cannot proceed with checkout</p>
                <p className="text-red-600 text-sm mt-1">
                  {outOfStockInCart.map(item => item.name).join(', ')}
                  {outOfStockInCart.length === 1 ? ' is' : ' are'} out of stock.
                  Please remove {outOfStockInCart.length === 1 ? 'it' : 'them'} from your cart.
                </p>
                <button
                  onClick={() => navigate('/cart')}
                  className="mt-3 text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-2"
                >
                  <FaArrowRight className="w-3 h-3" />
                  Go to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                  <FaUser className="w-6 h-6 text-green-600" />
                  <span>Personal Information</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="form-label font-medium flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-gray-500" />
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label font-medium flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-gray-500" />
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-2">
                    <label className="form-label font-medium flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4 text-gray-500" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="form-label font-medium flex items-center gap-2">
                      <FaPhone className="w-4 h-4 text-gray-500" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                  <FaHome className="w-6 h-6 text-green-600" />
                  <span>Shipping Address</span>
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="form-label font-medium flex items-center gap-2">
                      <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Street address, apartment, suite"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="form-label font-medium flex items-center gap-2">
                        <FaCity className="w-4 h-4 text-gray-500" />
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="form-label font-medium flex items-center gap-2">
                        <FaFlag className="w-4 h-4 text-gray-500" />
                        State *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter state"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="form-label font-medium flex items-center gap-2">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="600001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="form-label font-medium flex items-center gap-2">
                        <GiIndiaGate className="w-4 h-4 text-gray-500" />
                        Country *
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="form-input w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="India">India</option>
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ UPDATED PAYMENT METHOD SECTION WITH UPI */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
                  <FaCreditCard className="w-6 h-6 text-green-600" />
                  <span>Payment Method</span>
                </h2>
                <div className="space-y-4">
                  {/* Cash on Delivery */}
                  <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'cod' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300 hover:bg-green-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <FaMoneyBillWave className="w-6 h-6 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                  </label>

                  {/* ✅ UPI Payment Option */}
                  <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">UPI Payment</p>
                      <p className="text-sm text-gray-600">Pay instantly with any UPI app</p>
                    </div>
                  </label>

                  {/* ✅ UPI ID INPUT FIELD */}
                  {formData.paymentMethod === 'upi' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <label className="block font-medium text-gray-700 mb-2">
                        Enter UPI ID *
                      </label>
                      <div className="flex flex-col space-y-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@upi"
                          className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <div className="flex items-center text-sm text-blue-600">
                          <FaCheckCircle className="w-4 h-4 mr-2" />
                          <span>Examples: 9876543210@ybl, username@okicici, name@paytm</span>
                        </div>

                        {/* UPI Apps */}
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="text-sm text-gray-600 mb-2">Supported UPI Apps:</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs">Google Pay</span>
                            <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs">PhonePe</span>
                            <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs">Paytm</span>
                            <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs">BHIM</span>
                            <span className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs">Amazon Pay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Credit/Debit Card */}
                  <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'card' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                    />
                    <FaCreditCard className="w-6 h-6 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Credit/Debit Card</p>
                      <p className="text-sm text-gray-600">Secure card payment</p>
                    </div>
                  </label>

                  {/* PayPal */}
                  <label className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all duration-200 ${formData.paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <FaPaypal className="w-6 h-6 text-blue-400" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">PayPal</p>
                      <p className="text-sm text-gray-600">Fast and secure online payment</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Badges */}
              <div className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <FaLock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">SSL Secure</p>
                  </div>
                  <div className="text-center">
                    <FaShieldAlt className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">100% Safe</p>
                  </div>
                  <div className="text-center">
                    <FaUndo className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">Easy Returns</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !canCheckout}
                className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${canCheckout
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Placing Order...</span>
                  </>
                ) : !canCheckout ? (
                  <>
                    <FaExclamationTriangle className="w-5 h-5" />
                    <span>Cannot Checkout (Out of Stock Items)</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Place Order - ₹{total.toFixed(2)}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary - FIXED IMAGE DISPLAY */}
          <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl p-8 h-fit sticky top-24 border border-gray-100">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3 text-gray-800">
              <FaShoppingCart className="w-6 h-6 text-green-600" />
              <span>Order Summary</span>
              <span className="ml-auto bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </span>
            </h2>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
              {cartItems.map((item) => {
                const isOutOfStock = item.stock === 0;
                const isLowStock = item.stock > 0 && item.stock <= 5;

                const itemImage = getProductImage(item);

                return (
                  <div key={item.cartItemId || item.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:border-green-200 transition-colors duration-200">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={itemImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.log('❌ Image load failed:', item.name);
                              e.target.src = 'https://via.placeholder.com/96x96/cccccc/969696?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-800 truncate">
                          {item.name}
                          {item.selectedVariant && (
                            <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded ml-2">
                              {item.selectedVariant.size}
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <FaTag className="w-3 h-3 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            ₹{item.price?.toFixed(2) || '0.00'} each
                          </p>
                        </div>

                        {/* Stock Status */}
                        {isOutOfStock ? (
                          <div className="flex items-center gap-1 mt-2">
                            <FaExclamationTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 font-semibold truncate">Out of Stock</p>
                          </div>
                        ) : isLowStock ? (
                          <div className="flex items-center gap-1 mt-2">
                            <FaExclamationTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                            <p className="text-xs text-yellow-600 font-semibold truncate">
                              Only {item.stock} left!
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mt-2">
                            <FaCheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <p className="text-xs text-green-600 truncate">In Stock ({item.stock || 0})</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="font-bold text-gray-800 block whitespace-nowrap">
                        ₹{((item.price || 0) * item.quantity).toFixed(2)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.quantity} × ₹{item.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Total Summary */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Subtotal</span>
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium flex items-center gap-2">
                  <FaTruck className="w-4 h-4" />
                  Shipping
                </span>
                <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                  {shipping === 0 ? (
                    <span className="flex items-center gap-1">
                      <FaCheckCircle className="w-4 h-4" />
                      FREE
                    </span>
                  ) : `₹${shipping.toFixed(2)}`}
                </span>
              </div>

              {/* Free Shipping Progress Bar */}
              {subtotal < 299 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                      <FaBox className="w-4 h-4" />
                      Free Shipping on orders over ₹299
                    </p>
                    <p className="text-sm font-bold text-green-700">
                      ₹{(299 - subtotal).toFixed(2)} more to go!
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 299) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center text-xl font-bold text-gray-800 border-t border-gray-300 pt-4">
                <span>Total Amount</span>
                <span className="text-green-600 text-2xl">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaLock className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700">Secure Checkout</p>
                  <p className="text-xs">Your payment information is secured with 256-bit SSL encryption</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;