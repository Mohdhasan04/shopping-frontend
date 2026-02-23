import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

// ✅ React Icons
import { 
  FaCheckCircle, 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaShoppingBag,
  FaCalendarAlt,
  FaTruck,
  FaPhoneAlt,
  FaHome,
  FaCreditCard,
  FaMoneyBillWave,
  FaRegClock,
  FaBoxOpen,
  FaShieldAlt,
  FaUser,
  FaEnvelope,
  FaFileInvoice,
  FaWhatsapp,
  FaSpinner,
  FaExclamationCircle,
  FaRupeeSign,
  FaGoogle,
  FaMobileAlt
} from 'react-icons/fa';
import { 
  HiOutlineClipboardCheck, 
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineDeviceMobile,
  HiOutlineCreditCard
} from 'react-icons/hi';
import { 
  RiCustomerService2Fill, 
  RiSecurePaymentLine,
  RiMastercardFill,
  RiVisaLine,
  RiBankCardFill
} from 'react-icons/ri';
import { SiPhonepe, SiPaytm } from 'react-icons/si';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for order data with PRODUCT DETAILS
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Helper function to fix image URLs
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100';
    
    // Fix for /uploads/ paths
    if (imagePath.startsWith('/uploads/')) {
      return `http://${window.location.hostname}:5000${imagePath}`;
    }
    
    // Fix for filename only
    if (imagePath && !imagePath.includes('/') && !imagePath.startsWith('http')) {
      return `http://${window.location.hostname}:5000/uploads/${imagePath}`;
    }
    
    // Already full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Default placeholder
    return 'https://via.placeholder.com/100x100';
  };

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
    } else if (methodLower.includes('netbanking') || methodLower.includes('net banking')) {
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
    } else if (methodLower.includes('razorpay')) {
      return <span className="text-lg font-bold text-blue-600">R</span>;
    } else if (methodLower.includes('paypal')) {
      return <span className="text-lg font-bold text-blue-800">PP</span>;
    } else if (methodLower.includes('netbanking')) {
      return <RiBankCardFill className="w-6 h-6 text-indigo-600" />;
    } else if (methodLower.includes('wallet')) {
      return <FaRupeeSign className="w-6 h-6 text-yellow-600" />;
    }
    
    return <HiOutlineCreditCard className="w-6 h-6 text-gray-600" />;
  };

  const getPaymentBadge = (paymentMethod, paymentStatus) => {
    const methodLower = paymentMethod?.toLowerCase() || '';
    
    // Cash on Delivery
    if (methodLower.includes('cash') || methodLower.includes('cod')) {
      return {
        text: 'Pay on Delivery',
        color: 'bg-amber-100 text-amber-800 border border-amber-200',
        icon: <FaMoneyBillWave className="w-4 h-4" />
      };
    }
    
    // Paid status
    if (paymentStatus === 'paid') {
      return {
        text: 'Paid',
        color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: <HiOutlineCheckCircle className="w-4 h-4" />
      };
    }
    
    // Default pending status
    return {
      text: 'Pending',
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: <FaRegClock className="w-4 h-4" />
    };
  };

  // ✅ Fetch order with product details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching order details for ID:', orderId);
        
        // Step 1: Get order details
        const orderResponse = await api.get(`/orders/${orderId}`);
        const order = orderResponse.data.order;
        
        if (!order || !order.items) {
          throw new Error('Invalid order data received');
        }
        
        // ✅ EXTRACT PAYMENT DATA
        const paymentData = {
          payment_method: order?.payment_method || 'Cash on Delivery',
          payment_status: order?.payment_status || 'pending',
          payment_gateway: order?.payment_gateway,
          transaction_id: order?.transaction_id,
          card_last4: order?.card_last4
        };
        
        // Step 2: Enhance items with product details
        const itemsWithDetails = await Promise.all(
          order.items.map(async (item) => {
            try {
              const productResponse = await api.get(`/products/${item.product_id}`);
              const product = productResponse.data.product;
              
              return {
                ...item,
                product_name: product?.name || item.product_name || 'Unknown Product',
                image: getImageUrl(product?.image || item.image),
                category_name: product?.category_name || product?.category || 'General',
                brand: product?.brand || '',
                description: product?.description || ''
              };
            } catch (productError) {
              console.warn(`Could not fetch product ${item.product_id}:`, productError.message);
              return {
                ...item,
                product_name: item.product_name || 'Unknown Product',
                image: getImageUrl(item.image),
                category_name: 'General',
                brand: '',
                description: ''
              };
            }
          })
        );
        
        const finalOrderData = {
          ...order,
          ...paymentData,
          items: itemsWithDetails,
          total_amount: parseFloat(order.total_amount) || 0,
          created_at: order.created_at ? new Date(order.created_at) : new Date()
        };
        
        setOrderData(finalOrderData);
        
      } catch (error) {
        console.error('❌ Error fetching order:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load order details');
        
        // Fallback to mock data
        setOrderData({
          id: orderId,
          order_number: `ORD${orderId}`,
          created_at: new Date(),
          total_amount: 2459.99,
          payment_method: 'Cash on Delivery',
          payment_status: 'pending',
          order_status: 'confirmed',
          estimated_delivery: '3-5 business days',
          shipping_address: "123 Main St, Chennai, Tamil Nadu 600001",
          customer_name: user?.name || 'Customer',
          customer_email: user?.email || 'customer@example.com',
          customer_phone: '+91 9876543210',
          items: [
            {
              id: 1,
              product_id: 1,
              product_name: 'Premium Headphones',
              quantity: 1,
              price: 999,
              image: 'https://via.placeholder.com/100x100',
              category_name: 'Electronics',
              brand: 'Sony'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user]);

  // const trackOrder = () => {
  //   navigate(`/track-order/${orderId}`);
  // };

  const backToOrders = () => {
    navigate('/orders');
  };

  const contactWhatsApp = () => {
    window.open('https://wa.me/919876543210', '_blank');
  };

  const downloadInvoice = () => {
    alert('Invoice download feature coming soon!');
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-24 w-24 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaBoxOpen className="w-10 h-10 text-primary-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Loading Order Details</h2>
          <p className="text-gray-600">Fetching your order #{orderId}...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error && !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-200">
              <div className="text-center">
                <FaExclamationCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-3">Order Not Found</h2>
                <p className="text-red-700 mb-6">{error}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={backToOrders}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                  >
                    Back to Orders
                  </button>
                  <Link 
                    to="/products"
                    className="px-6 py-3 bg-white text-red-600 font-semibold rounded-xl border-2 border-red-200 hover:border-red-300 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentBadge = getPaymentBadge(orderData.payment_method, orderData.payment_status);
  const displayPaymentMethod = formatPaymentMethod(orderData.payment_method);
  const paymentIcon = getPaymentIcon(orderData.payment_method);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-emerald-50/20 pt-20 pb-12">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Floating Back Button */}
        <div className="mb-8">
          <button 
            onClick={backToOrders}
            className="inline-flex items-center space-x-3 px-5 py-3.5 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-primary-300 hover:-translate-y-0.5"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-primary-600 transition-colors group-hover:-translate-x-1" />
            <span className="text-gray-700 group-hover:text-primary-700 font-medium transition-colors text-sm">
              Back to My Orders
            </span>
          </button>
        </div>

        {/* Success Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-green-500 to-teal-600 p-8 text-center rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-10 w-8 h-8 rounded-full bg-white"></div>
            <div className="absolute bottom-8 right-12 w-12 h-12 rounded-full bg-white"></div>
            <div className="absolute top-1/2 left-1/3 w-6 h-6 rounded-full bg-white"></div>
          </div>
          
          <div className="relative">
            <div className="inline-block mb-6 relative">
              <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-8 border-white/40 shadow-2xl animate-pulse-slow">
                <FaCheckCircle className="w-16 h-16 text-white animate-bounce-in" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <FaBoxOpen className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                {orderData.payment_method?.toLowerCase().includes('cash') ? 'Order Received!' : 'Order Confirmed!'}
              </h1>
              <p className="text-xl text-white/95 max-w-2xl mx-auto">
                Thank you for your order, <span className="font-semibold bg-white/20 px-2 py-1 rounded-md">{orderData.customer_name}</span>!
              </p>
              <p className="text-white/80 mt-3 text-lg">
                Order #{orderData.order_number || orderData.id}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Order Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={downloadInvoice}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
                    >
                      <FaFileInvoice className="w-4 h-4" />
                      <span>Invoice</span>
                    </button>
                    <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${paymentBadge.color}`}>
                      {paymentBadge.icon}
                      <span className="text-sm font-medium">{paymentBadge.text}</span>
                    </div>
                  </div>
                </div>

                {/* Order Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Order Number */}
                  <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-primary-100">
                        <HiOutlineClipboardCheck className="w-7 h-7 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Order Number</p>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">
                          #{orderData.order_number || orderData.id}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <FaShieldAlt className="w-3 h-3 mr-1" />
                          Secured order
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Date */}
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100">
                        <FaCalendarAlt className="w-7 h-7 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Order Date</p>
                        <p className="text-xl font-bold text-gray-900">
                          {new Date(orderData.created_at).toLocaleDateString('en-IN', { 
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(orderData.created_at).toLocaleTimeString('en-IN', { 
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅✅✅ CLEAN Payment Method Card ✅✅✅ */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                        {paymentIcon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-600 font-medium">Payment Method</p>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${paymentBadge.color}`}>
                            {paymentBadge.text}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xl font-bold text-gray-900">
                                {displayPaymentMethod}
                              </p>
                              {orderData.payment_method?.toLowerCase().includes('card') && orderData.card_last4 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  Card ending in •••• {orderData.card_last4}
                                </p>
                              )}
                              {orderData.transaction_id && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Txn ID: {orderData.transaction_id}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                {formatPrice(orderData.total_amount)}
                              </p>
                              {orderData.payment_method?.toLowerCase().includes('cash') && (
                                <p className="text-sm text-amber-600 font-medium mt-1">
                                  Pay on delivery
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                        <FaTruck className="w-7 h-7 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1 font-medium">Estimated Delivery</p>
                        <p className="text-xl font-bold text-gray-900">
                          {orderData.estimated_delivery || '3-5 business days'}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">Free shipping</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-10 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Order Items ({orderData.items?.length || 0})</h3>
                  
                  {orderData.items && orderData.items.length > 0 ? (
                    <div className="space-y-4">
                      {orderData.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            {/* Product Image */}
                            <div className="relative">
                              <img 
                                src={getImageUrl(item.image)}
                                alt={item.product_name}
                                className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/80x80';
                                }}
                              />
                              <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                {item.quantity}x
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div>
                              <h4 className="font-semibold text-gray-800">{item.product_name}</h4>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {item.category_name && (
                                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                    {item.category_name}
                                  </span>
                                )}
                                {item.brand && (
                                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                                    {item.brand}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-800">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} each
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Total Amount */}
                      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-300">
                        <div>
                          <p className="text-xl font-bold text-gray-900">Total Amount</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Includes all taxes and shipping
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            {formatPrice(orderData.total_amount)}
                          </p>
                          {orderData.payment_method?.toLowerCase().includes('cash') && (
                            <p className="text-sm text-amber-600 mt-2 font-medium">
                              To be paid on delivery
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FaBoxOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No items found in this order</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Support */}
          <div className="space-y-8">
            
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                
                <div className="space-y-4">
                  <Link
  to={`/track-order/${orderId}?email=${encodeURIComponent(orderData.customer_email)}`}
  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
>
  <div className="flex items-center space-x-3">
    <FaMapMarkerAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
    <span className="font-semibold">Track Order</span>
  </div>
  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
    Live
  </div>
</Link>
                  
                  <Link 
                    to="/products"
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
                  >
                    <FaShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Continue Shopping</span>
                  </Link>
                  
                  <button 
                    onClick={contactWhatsApp}
                    className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
                  >
                    <FaWhatsapp className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold">Chat on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Customer Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-800 truncate">
                        {orderData.customer_name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800 truncate">
                        {orderData.customer_email}
                      </p>
                    </div>
                  </div>
                  
                  {orderData.customer_phone && (
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPhoneAlt className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-800">
                          {orderData.customer_phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-6">
                <RiCustomerService2Fill className="w-8 h-8 text-primary-300" />
                <h3 className="text-xl font-bold">24/7 Support</h3>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={contactWhatsApp}
                  className="w-full flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors"
                >
                  <FaWhatsapp className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <p className="font-semibold">WhatsApp Support</p>
                    <p className="text-xs text-gray-300">Instant response</p>
                  </div>
                </button>
                
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <HiOutlineDeviceMobile className="w-5 h-5 text-primary-300" />
                  <div>
                    <p className="text-sm text-gray-300">Call Support</p>
                    <p className="font-semibold">1800-123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <HiOutlineMail className="w-5 h-5 text-primary-300" />
                  <div>
                    <p className="text-sm text-gray-300">Email Support</p>
                    <p className="font-semibold">support@shopeasy.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FaShieldAlt className="w-8 h-8 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-gray-900">Secure & Protected</h4>
                  <p className="text-sm text-gray-600">Your transaction is 100% secure</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <RiSecurePaymentLine className="w-5 h-5 text-emerald-500" />
                <p className="text-xs text-gray-600">
                  Encrypted payment • PCI-DSS compliant • GDPR compliant
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col items-center space-y-4 max-w-2xl mx-auto p-8 bg-gradient-to-r from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg">
            <p className="text-lg text-gray-700">
              ✨ A confirmation email has been sent to{' '}
              <span className="font-bold text-primary-700">{orderData.customer_email}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={backToOrders}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                View All Orders
              </button>
              <Link 
                to="/products"
                className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:shadow-md transition-all duration-300"
              >
                Shop More Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.9; }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
        }
      `}</style>
    </div>
  );
};

export default OrderConfirmation;