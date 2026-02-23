import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';

// ✅ React Icons - Added Payment Icons
import {
  FaArrowLeft,
  FaSyncAlt,
  FaCheckCircle,
  FaClock,
  FaShippingFast,
  FaBoxOpen,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaPrint,
  FaTruck,
  FaHome,
  FaExclamationCircle,
  FaSpinner,
  FaCreditCard,
  FaMoneyBillWave,
  FaRupeeSign,
  FaGoogle,
  FaWallet,
  FaReceipt
} from 'react-icons/fa';
import { HiOutlineCreditCard, HiOutlineCheckCircle } from 'react-icons/hi';
import { RiMastercardFill, RiVisaLine, RiBankCardFill } from 'react-icons/ri';
import { SiPhonepe, SiPaytm } from 'react-icons/si';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Payment Method Helper Functions
  const formatPaymentMethod = (method) => {
    if (!method) return 'Payment Method';
    
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('cash') || methodLower.includes('cod')) {
      return 'Cash on Delivery';
    } else if (methodLower.includes('credit')) {
      return 'Credit Card';
    } else if (methodLower.includes('debit')) {
      return 'Debit Card';
    } else if (methodLower.includes('upi')) {
      return 'UPI Payment';
    } else if (methodLower.includes('google') || methodLower.includes('gpay')) {
      return 'Google Pay';
    } else if (methodLower.includes('phone') || methodLower.includes('phonepay')) {
      return 'PhonePe';
    } else if (methodLower.includes('paytm')) {
      return 'Paytm Wallet';
    } else if (methodLower.includes('razorpay')) {
      return 'Razorpay';
    } else if (methodLower.includes('paypal')) {
      return 'PayPal';
    } else if (methodLower.includes('netbanking')) {
      return 'Net Banking';
    } else if (methodLower.includes('wallet')) {
      return 'Digital Wallet';
    }
    
    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  const getPaymentIcon = (method) => {
    if (!method) return <HiOutlineCreditCard className="w-6 h-6 text-gray-600" />;
    
    const methodLower = method.toLowerCase();
    
    if (methodLower.includes('cash') || methodLower.includes('cod')) {
      return <FaMoneyBillWave className="w-6 h-6 text-green-600" />;
    } else if (methodLower.includes('credit')) {
      return <RiMastercardFill className="w-6 h-6 text-orange-600" />;
    } else if (methodLower.includes('debit')) {
      return <RiVisaLine className="w-6 h-6 text-blue-600" />;
    } else if (methodLower.includes('upi')) {
      return <FaRupeeSign className="w-6 h-6 text-purple-600" />;
    } else if (methodLower.includes('google') || methodLower.includes('gpay')) {
      return <FaGoogle className="w-6 h-6 text-blue-600" />;
    } else if (methodLower.includes('phone') || methodLower.includes('phonepay')) {
      return <SiPhonepe className="w-6 h-6 text-purple-600" />;
    } else if (methodLower.includes('paytm')) {
      return <SiPaytm className="w-6 h-6 text-blue-800" />;
    } else if (methodLower.includes('netbanking')) {
      return <RiBankCardFill className="w-6 h-6 text-indigo-600" />;
    } else if (methodLower.includes('wallet')) {
      return <FaWallet className="w-6 h-6 text-yellow-600" />;
    }
    
    return <HiOutlineCreditCard className="w-6 h-6 text-gray-600" />;
  };

  const getPaymentBadge = (paymentMethod, paymentStatus) => {
    const methodLower = paymentMethod?.toLowerCase() || '';
    
    if (methodLower.includes('cash') || methodLower.includes('cod')) {
      return {
        text: 'Pay on Delivery',
        color: 'bg-amber-100 text-amber-800 border border-amber-200',
        icon: <FaMoneyBillWave className="w-4 h-4" />
      };
    }
    
    if (paymentStatus === 'paid') {
      return {
        text: 'Paid',
        color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: <HiOutlineCheckCircle className="w-4 h-4" />
      };
    }
    
    return {
      text: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: <FaClock className="w-4 h-4" />
    };
  };

  // ✅ Image fix function
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100';
    
    if (imagePath.startsWith('/uploads/')) {
      return `http://${window.location.hostname}:5000${imagePath}`;
    }
    
    if (imagePath && !imagePath.includes('/') && !imagePath.startsWith('http')) {
      return `http://${window.location.hostname}:5000/uploads/${imagePath}`;
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return imagePath;
  };

  // ✅ GET EMAIL FROM URL PARAMS AUTOMATICALLY
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromUrl = params.get('email');
    
    if (emailFromUrl) {
      fetchOrder(emailFromUrl);
    } else {
      const userEmail = localStorage.getItem('user_email') || 
                        localStorage.getItem('customer_email');
      
      if (userEmail) {
        fetchOrder(userEmail);
      } else {
        setError('Please provide your email to track this order');
      }
    }
  }, [orderId, location]);

  // ✅ AUTO-TRACK FUNCTION
  const fetchOrder = async (customerEmail) => {
    if (!customerEmail) {
      setError('Email is required for order tracking');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/orders/track/${orderId}?email=${customerEmail}`);
      const orderData = response.data.order;
      
      // Ensure payment data exists
      const enhancedOrder = {
        ...orderData,
        payment_method: orderData.payment_method || 'Cash on Delivery',
        payment_status: orderData.payment_status || 'pending'
      };
      
      setOrder(enhancedOrder);
    } catch (error) {
      console.error('Track order error:', error);
      setError('Order not found or email does not match');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const backToOrders = () => {
    navigate('/orders');
  };

  const refreshOrder = () => {
    const userEmail = localStorage.getItem('user_email') || 
                      localStorage.getItem('customer_email');
    if (userEmail) {
      fetchOrder(userEmail);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return <FaHome className="w-4 h-4" />;
      case 'shipped': return <FaShippingFast className="w-4 h-4" />;
      case 'confirmed': return <FaCheckCircle className="w-4 h-4" />;
      case 'pending': return <FaClock className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  const getStatusSteps = () => {
    return [
      { 
        status: 'pending', 
        label: 'Order Placed', 
        description: 'Your order has been received',
        icon: <FaClock className="w-5 h-5" />
      },
      { 
        status: 'confirmed', 
        label: 'Order Confirmed', 
        description: 'Order is being processed',
        icon: <FaCheckCircle className="w-5 h-5" />
      },
      { 
        status: 'shipped', 
        label: 'Shipped', 
        description: 'Your order is on the way',
        icon: <FaShippingFast className="w-5 h-5" />
      },
      { 
        status: 'delivered', 
        label: 'Delivered', 
        description: 'Order delivered successfully',
        icon: <FaHome className="w-5 h-5" />
      }
    ];
  };

  const formatPrice = (price) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) return '₹0.00';
      return `₹${numPrice.toFixed(2)}`;
    } catch (error) {
      return '₹0.00';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/20 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Floating Back Button */}
        <div className="mb-8">
          <button 
            onClick={backToOrders}
            className="inline-flex items-center space-x-3 px-5 py-3.5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-primary-300 hover:-translate-y-0.5"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-primary-600 transition-colors group-hover:-translate-x-1" />
            <span className="text-gray-700 group-hover:text-primary-700 font-medium transition-colors text-sm">
              Back to Orders
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Order</h1>
            <p className="text-gray-600">Real-time updates for order #{orderId}</p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <button 
              onClick={refreshOrder}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              <FaSyncAlt className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="font-medium">Refresh Status</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-200 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-2">Unable to Track Order</h3>
                <p className="text-red-700 mb-3">{error}</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => navigate('/orders')}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    ← Go back to orders
                  </button>
                  <button 
                    onClick={refreshOrder}
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    ⟳ Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 mb-8 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-24 w-24 border-4 border-primary-200 border-t-primary-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBoxOpen className="w-10 h-10 text-primary-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Tracking Order</h3>
              <p className="text-gray-600">Looking up order #{orderId}...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {order && !loading && (
          <>
            {/* Order Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      <FaTruck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Order #{order.id}
                      </h2>
                      <div className="flex flex-wrap items-center gap-4 text-white/90">
                        <div className="flex items-center space-x-2">
                          <FaClock className="w-4 h-4" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                        <div className="hidden md:block">•</div>
                        <div className="flex items-center space-x-2">
                          <FaBoxOpen className="w-4 h-4" />
                          <span>{order.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ✅ Payment Method Info */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2.5 rounded-lg">
                          {getPaymentIcon(order.payment_method)}
                        </div>
                        <div>
                          <p className="text-sm text-white/80">Payment Method</p>
                          <p className="text-lg font-bold text-white">
                            {formatPaymentMethod(order.payment_method)}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.order_status)}`}>
                        {order.order_status?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center lg:text-right">
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-2">
                    {formatPrice(order.total_amount)}
                  </p>
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${
                    getPaymentBadge(order.payment_method, order.payment_status).color
                  }`}>
                    {getPaymentBadge(order.payment_method, order.payment_status).icon}
                    <span>{getPaymentBadge(order.payment_method, order.payment_status).text}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Progress Timeline */}
              <div className="lg:col-span-2 space-y-8">
                {/* Order Progress Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaShippingFast className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Order Progress</h3>
                  </div>
                  
                  <div className="relative pl-12">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 to-blue-200"></div>
                    
                    {/* Status Steps */}
                    {getStatusSteps().map((step, index) => {
                      const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
                      const currentIndex = statusOrder.indexOf(order.order_status?.toLowerCase());
                      const stepIndex = statusOrder.indexOf(step.status);
                      const isCompleted = stepIndex <= currentIndex;
                      const isCurrent = step.status === order.order_status?.toLowerCase();
                      
                      return (
                        <div key={step.status} className="relative mb-10 last:mb-0">
                          {/* Step Connector */}
                          {index < 3 && (
                            <div className="absolute left-[-42px] top-16 h-10 w-0.5 bg-gray-200"></div>
                          )}
                          
                          {/* Step Content */}
                          <div className="flex items-start">
                            {/* Status Indicator */}
                            <div className={`absolute left-[-54px] top-0 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 scale-110' 
                                : 'bg-gradient-to-r from-gray-300 to-gray-400'
                            } ${isCurrent ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
                              {isCompleted ? (
                                <FaCheckCircle className="w-6 h-6 text-white" />
                              ) : (
                                <span className="text-gray-700 font-bold text-lg">{index + 1}</span>
                              )}
                            </div>
                            
                            {/* Content Card */}
                            <div className={`flex-1 ml-4 p-6 rounded-xl border-2 transition-all duration-300 ${
                              isCurrent 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md' 
                                : isCompleted 
                                  ? 'bg-white border-green-200' 
                                  : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`p-3 rounded-xl ${
                                    isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {step.icon}
                                  </div>
                                  <div>
                                    <h4 className={`text-xl font-bold ${
                                      isCompleted ? 'text-green-800' : 'text-gray-800'
                                    } ${isCurrent ? 'text-green-900' : ''}`}>
                                      {step.label}
                                    </h4>
                                    <p className="text-gray-600 mt-2">{step.description}</p>
                                  </div>
                                </div>
                                
                                {isCurrent && (
                                  <div className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium border border-green-200">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                    Current Status
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaBoxOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">Order Items ({order.items?.length || 0})</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-5">
                          <div className="relative">
                            <img 
  src={getImageUrl(item.product_image || item.image)} 
  alt={item.product_name}
  className="w-24 h-24 object-cover rounded-xl shadow-sm border border-gray-200"
  onError={(e) => {
    e.target.src = 'https://via.placeholder.com/96x96';
  }}
/>
                            <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                              {item.quantity}x
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-800 mb-2">{item.product_name}</h4>
                            <div className="flex flex-wrap items-center gap-4">
                              <span className="text-sm font-medium text-gray-700">
                                Unit: {formatPrice(item.price)}
                              </span>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(item.item_status || order.order_status)}`}>
                                {item.item_status || order.order_status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-800">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            Total for {item.quantity} item{item.quantity > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Order Summary */}
                    <div className="mt-8 pt-8 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-2xl font-bold text-gray-900">Order Total</p>
                          <p className="text-gray-600 mt-2">Includes all taxes and shipping</p>
                        </div>
                        <div className="text-right">
                          <p className="text-4xl font-bold text-gray-900">
                            {formatPrice(order.total_amount)}
                          </p>
                          <div className="mt-3">
                            <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${
                              getPaymentBadge(order.payment_method, order.payment_status).color
                            }`}>
                              {getPaymentBadge(order.payment_method, order.payment_status).icon}
                              <span>{getPaymentBadge(order.payment_method, order.payment_status).text}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer & Shipping Info */}
              <div className="space-y-8">
                {/* Customer Information */}
                <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Customer Details</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                        <FaUser className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{order.customer_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                        <FaEnvelope className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email Address</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{order.customer_email}</p>
                      </div>
                    </div>
                    
                    {order.customer_phone && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-200">
                          <FaPhone className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Phone Number</p>
                          <p className="text-lg font-bold text-gray-800 mt-1">{order.customer_phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Payment Information Card */}
                {/* <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaCreditCard className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Payment Information</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-emerald-200">
                            {getPaymentIcon(order.payment_method)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Payment Method</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">
                              {formatPaymentMethod(order.payment_method)}
                            </p>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                          getPaymentBadge(order.payment_method, order.payment_status).color
                        }`}>
                          {getPaymentBadge(order.payment_method, order.payment_status).text}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900">
                          {formatPrice(order.total_amount)}
                        </p>
                      </div>
                    </div>
                    
                    {order.payment_method?.toLowerCase().includes('cash') && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <div className="flex items-center space-x-3">
                          <FaMoneyBillWave className="w-5 h-5 text-amber-600" />
                          <p className="font-medium text-amber-800">Cash on Delivery Order</p>
                        </div>
                        <p className="text-sm text-amber-700 mt-2">
                          Please keep exact change ready for delivery
                        </p>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Shipping Information */}
                <div className="bg-white rounded-2xl shadow-xl p-7 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaMapMarkerAlt className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Shipping Address</h3>
                  </div>
                  
                  <div className="p-5 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <FaHome className="w-5 h-5 text-gray-500 mt-1" />
                      </div>
                      <div>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                          {order.shipping_address}
                        </p>
                        <div className="flex items-center space-x-4 mt-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaTruck className="w-4 h-4" />
                            <span>Standard Shipping</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaClock className="w-4 h-4" />
                            <span>3-5 business days</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center mt-12 pt-10 border-t-2 border-gray-200">
              <button 
                onClick={backToOrders}
                className="flex items-center justify-center space-x-3 px-10 py-4 bg-white text-gray-800 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 hover:shadow-lg"
              >
                <FaArrowLeft className="w-5 h-5" />
                <span className="text-lg">Back to All Orders</span>
              </button>
              <button 
                onClick={() => window.print()}
                className="flex items-center justify-center space-x-3 px-10 py-4 bg-gradient-to-r from-primary-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group"
              >
                <FaPrint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-lg">Print Order Details</span>
              </button>
              <button 
                onClick={refreshOrder}
                className="flex items-center justify-center space-x-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group"
              >
                <FaSyncAlt className="w-5 h-5 group-hover:rotate-180 transition-transform" />
                <span className="text-lg">Refresh Status</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;