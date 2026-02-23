import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

// ✅ React Icons
import { 
  FaArrowLeft, 
  FaSyncAlt, 
  FaCheckCircle, 
  FaClock, 
  FaShippingFast,
  FaBoxOpen,
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaExclamationCircle,
  FaTruck,
  FaHome
} from 'react-icons/fa';

const OrderItemTracking = () => {
  const { orderId, itemId } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ IMAGE FIX FUNCTION
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100x100';
    
    // Fix 1: If image starts with /uploads/
    if (imagePath.startsWith('/uploads/')) {
      return `http://${window.location.hostname}:5000${imagePath}`;
    }
    
    // Fix 2: If image is just filename without path
    if (imagePath && !imagePath.includes('/') && !imagePath.startsWith('http')) {
      return `http://${window.location.hostname}:5000/uploads/${imagePath}`;
    }
    
    // Fix 3: If already full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    return imagePath;
  };

  useEffect(() => {
    fetchItemTracking();
  }, [orderId, itemId, email]);

  const fetchItemTracking = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!email) {
        setError('Please provide your email to track this item');
        setLoading(false);
        return;
      }
      
      const response = await api.get(`/orders/${orderId}/items/${itemId}/track?email=${email}`);
      
      if (response.data.success) {
        const itemData = response.data.item;
        
        // Ensure price is a number
        if (itemData.price) {
          itemData.price = parseFloat(itemData.price);
        }
        
        setItem(itemData);
      } else {
        setError(response.data.message || 'Failed to load tracking information');
      }
    } catch (error) {
      console.error('Fetch item tracking error:', error);
      setError('Unable to load tracking information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const backToOrders = () => {
    navigate('/orders');
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
        description: 'Item is on the way to you',
        icon: <FaShippingFast className="w-5 h-5" />
      },
      { 
        status: 'delivered', 
        label: 'Delivered', 
        description: 'Item delivered successfully',
        icon: <FaHome className="w-5 h-5" />
      }
    ];
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

  const formatPrice = (price) => {
    try {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice)) return '₹0.00';
      return `₹${numPrice.toFixed(2)}`;
    } catch (error) {
      return '₹0.00';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBoxOpen className="w-6 h-6 text-primary-600 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-600 mt-6 font-medium">Loading item tracking details...</p>
              <p className="text-sm text-gray-500 mt-2">Order #{orderId} • Item #{itemId}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <button 
                onClick={backToOrders}
                className="flex items-center space-x-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border border-gray-100 hover:border-primary-200"
              >
                <FaArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-primary-600 transition-colors" />
                <span className="text-gray-700 group-hover:text-primary-700 font-medium transition-colors">
                  Back to Orders
                </span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto border-8 border-white/30 shadow-lg">
                  <FaExclamationCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mt-6 mb-3">Tracking Error</h2>
                <p className="text-white/90">We couldn't load the tracking information</p>
              </div>

              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={backToOrders}
                    className="flex items-center justify-center space-x-3 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 group"
                  >
                    <FaArrowLeft className="w-4 h-4" />
                    <span>Back to Orders</span>
                  </button>
                  <button 
                    onClick={fetchItemTracking}
                    className="flex items-center justify-center space-x-3 px-8 py-3 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                  >
                    <FaSyncAlt className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const displayStatus = item.item_status || item.order_status || 'pending';
  const steps = getStatusSteps();
  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(displayStatus.toLowerCase());

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="mb-8">
            <button 
              onClick={backToOrders}
              className="flex items-center space-x-3 px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group border border-gray-100 hover:border-primary-200"
            >
              <FaArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-primary-600 transition-colors" />
              <span className="text-gray-700 group-hover:text-primary-700 font-medium transition-colors">
                Back to Orders
              </span>
            </button>
          </div>

          {/* Main Tracking Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Item Tracking</h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <span className="flex items-center space-x-2">
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Order #{orderId}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Item #{itemId}</span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                      {getStatusIcon(displayStatus)}
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(displayStatus)}`}>
                        {displayStatus.toUpperCase()}
                      </span>
                      <div className="mt-2">
                        <button 
                          onClick={fetchItemTracking}
                          className="text-sm text-white/90 hover:text-white flex items-center space-x-1 transition-colors"
                        >
                          <FaSyncAlt className="w-3 h-3" />
                          <span>Refresh Status</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Product Information */}
              <div className="flex items-start space-x-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <div className="relative">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.product_name} 
                    className="w-32 h-32 object-cover rounded-xl shadow-sm"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/128x128';
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.quantity}x
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.product_name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                      <p className="text-xl font-bold text-gray-800">{formatPrice(item.price)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="text-xl font-bold text-gray-800">{item.quantity}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-xl font-bold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Progress Timeline */}
              <div className="mb-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <FaTruck className="w-5 h-5 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Delivery Progress</h3>
                </div>
                
                <div className="relative pl-12">
                  {/* Vertical Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {/* Progress Fill */}
                  <div 
                    className="absolute left-5 top-0 w-0.5 bg-green-500 transition-all duration-700 ease-out"
                    style={{ height: `${(currentStatusIndex + 1) * 25}%` }}
                  ></div>
                  
                  {/* Status Steps */}
                  {steps.map((step, index) => {
                    const stepIndex = statusOrder.indexOf(step.status);
                    const isCompleted = stepIndex <= currentStatusIndex;
                    const isCurrent = step.status === displayStatus.toLowerCase();
                    
                    return (
                      <div key={step.status} className="relative mb-8 last:mb-0">
                        {/* Step Connector */}
                        {index < steps.length - 1 && (
                          <div className="absolute left-[-36px] top-14 h-8 w-0.5 bg-gray-200"></div>
                        )}
                        
                        {/* Step Content */}
                        <div className="flex items-start">
                          {/* Status Indicator */}
                          <div className={`absolute left-[-48px] top-0 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted 
                              ? 'bg-green-500 scale-110 shadow-lg shadow-green-500/30' 
                              : 'bg-gray-300'
                          } ${isCurrent ? 'ring-4 ring-green-300 ring-offset-2' : ''}`}>
                            {isCompleted ? (
                              <FaCheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <span className="text-gray-700 font-bold">{index + 1}</span>
                            )}
                          </div>
                          
                          {/* Content Card */}
                          <div className={`flex-1 ml-4 p-5 rounded-xl border transition-all duration-300 ${
                            isCurrent 
                              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-sm' 
                              : isCompleted 
                                ? 'bg-white border-gray-200' 
                                : 'bg-gray-50 border-gray-100'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${
                                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  {step.icon}
                                </div>
                                <div>
                                  <h4 className={`text-lg font-semibold ${
                                    isCompleted ? 'text-green-700' : 'text-gray-700'
                                  } ${isCurrent ? 'font-bold' : ''}`}>
                                    {step.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                </div>
                              </div>
                              
                              {isCurrent && (
                                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                  Current
                                </div>
                              )}
                            </div>
                            
                            {step.status === 'delivered' && isCompleted && (
                              <div className="mt-4 pt-4 border-t border-green-200">
                                <div className="flex items-center space-x-2 text-green-700">
                                  <FaCheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Delivered successfully!</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FaUser className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Customer Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <FaUser className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-800">{item.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-800">{item.customer_email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FaCalendarAlt className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">Delivery Information</h4>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Expected Delivery</p>
                      <p className="font-medium text-gray-800">
                        {item.expected_delivery || '3-5 business days'}
                      </p>
                    </div>
                    {item.tracking_id && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tracking ID</p>
                        <p className="font-medium text-gray-800 font-mono">{item.tracking_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 border-t border-gray-200">
                <button 
                  onClick={backToOrders}
                  className="flex items-center justify-center space-x-3 px-8 py-3 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 border border-gray-200"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Back to All Orders</span>
                </button>
                <button 
                  onClick={fetchItemTracking}
                  className="flex items-center justify-center space-x-3 px-8 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-200 group"
                >
                  <FaSyncAlt className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Refresh Tracking Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemTracking;