import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewsContext';
import toast from 'react-hot-toast';
import ReviewForm from './ReviewForm';

// ✅ React Icons Import
import {
  FaBox,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUndo,
  FaStar,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaSearch,
  FaShoppingBag,
  FaExclamationTriangle,
  FaTrash,
  FaEye,
  FaShippingFast,
  FaArrowRight,
  FaPhone
} from 'react-icons/fa';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { createReview } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-refresh orders every 60 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [user]);



  const fetchOrders = async () => {
    try {
      console.log('🔍 DEBUG fetchOrders started');
      console.log('👤 User:', user);
      console.log('🔑 Token:', localStorage.getItem('token'));

      let response;
      let ordersData = [];

      // ✅ OPTION 1: If user is logged in with token, use /orders endpoint
      if (user && localStorage.getItem('token')) {
        console.log('📱 Attempting authenticated user endpoint (/orders)');
        try {
          response = await api.get('/orders');
          console.log('✅ Authenticated orders response:', response.data);
          ordersData = response.data.orders || [];
        } catch (authError) {
          console.error('❌ Auth orders failed:', {
            status: authError.response?.status,
            message: authError.message
          });

          if (authError.response?.status === 401) {
            toast.error('Session expired. Please login again.');
            // Clear invalid token
            localStorage.removeItem('token');
          }
        }
      }

      // ✅ OPTION 2: If auth failed or no user/token, try email method
      if (ordersData.length === 0) {
        console.log('🔄 Falling back to email-based orders...');

        const getEmailForOrders = () => {
          if (user?.customer_email) {
            return user.customer_email;
          }

          if (user?.email) {
            return user.email;
          }

          const savedEmail = localStorage.getItem('customer_email');
          if (savedEmail) {
            return savedEmail;
          }

          const urlParams = new URLSearchParams(window.location.search);
          const urlEmail = urlParams.get('email');
          if (urlEmail) {
            localStorage.setItem('customer_email', urlEmail);
            return urlEmail;
          }

          return null;
        };

        const customerEmail = getEmailForOrders();

        if (!customerEmail) {
          console.log('❌ No email found for order lookup');
          if (user) {
            toast.error('Unable to find your order email. Please update your profile.');
          }
          setOrders([]);
          setLoading(false);
          return;
        }

        console.log('📧 Using email endpoint for:', customerEmail);
        try {
          response = await api.get(`/customer/${customerEmail}`);
          ordersData = response.data.orders || [];
        } catch (emailError) {
          console.error('❌ Email orders failed:', emailError.response?.status);
        }
      }

      // Convert total_amount to number for each order
      const processedOrders = ordersData.map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount) || 0,
        items: order.items || []
      }));

      console.log(`✅ Loaded ${processedOrders.length} orders`);
      setOrders(processedOrders);

    } catch (error) {
      console.error('❌ General error fetching orders:', error);

      if (error.response?.status === 404) {
        toast.error('No orders found for your account');
      } else if (error.response?.status === 401) {
        toast.error('Please login to view your orders');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Failed to load orders');
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Cancel order function
  const cancelOrder = async (orderId) => {
    const orderToCancel = orders.find(order => order.id === orderId);

    if (!orderToCancel) {
      toast.error('Order not found');
      return;
    }

    if (orderToCancel.order_status === 'cancelled') {
      toast.error('This order is already cancelled');
      return;
    }

    if (['confirmed', 'shipped', 'delivered'].includes(orderToCancel.order_status)) {
      toast.error('Order cannot be cancelled after confirmation by admin');
      return;
    }

    const reason = prompt('Please enter reason for cancellation:');

    if (!reason || reason.trim() === '') {
      toast.error('Cancellation reason is required');
      return;
    }

    try {
      const response = await api.post(`/orders/${orderId}/cancel`, {
        cancellation_reason: reason
      });

      if (response.data.success) {
        toast.success('Order cancelled successfully!');
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? { ...order, order_status: 'cancelled' }
              : order
          )
        );
      }
    } catch (error) {
      console.error('❌ Cancel order failed:', error);

      let errorMessage = 'Failed to cancel order';

      if (error.response?.status === 404) {
        errorMessage = 'Order not found';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to cancel this order';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot cancel order that is already confirmed/shipped';
      }

      toast.error(errorMessage);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const getEmailForOrders = () => {
        if (user?.customer_email) return user.customer_email;
        if (user?.email) return user.email;
        const savedEmail = localStorage.getItem('customer_email');
        if (savedEmail) return savedEmail;
        const urlParams = new URLSearchParams(window.location.search);
        const urlEmail = urlParams.get('email');
        if (urlEmail) {
          localStorage.setItem('customer_email', urlEmail);
          return urlEmail;
        }
        return null;
      };

      const customerEmail = getEmailForOrders();

      if (!customerEmail) {
        toast.error('Please login to view order details');
        navigate('/login');
        return;
      }

      navigate(`/order/${orderId}?email=${encodeURIComponent(customerEmail)}`);

    } catch (error) {
      console.error('❌ Error navigating to order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const trackOrder = (orderId, customerEmail) => {
    navigate(`/track-order/${orderId}?email=${customerEmail}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      case 'shipped': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'confirmed': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'pending': return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <FaCheckCircle className="w-5 h-5" />;
      case 'shipped': return <FaTruck className="w-5 h-5" />;
      case 'confirmed': return <FaCheckCircle className="w-5 h-5" />;
      case 'pending': return <FaClock className="w-5 h-5" />;
      case 'cancelled': return <FaTimesCircle className="w-5 h-5" />;
      default: return <FaClock className="w-5 h-5" />;
    }
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556228578-8c89e-6adf883?w=100&h=100&fit=crop';

    // Hardcode local backend for stability
    const baseUrl = 'https://shopping-backend-jggd.onrender.com';

    if (img.startsWith('http')) return img;

    if (img.startsWith('/uploads/')) {
      return `${baseUrl}${img}`;
    }

    if (img.includes('uploads')) {
      const cleanPath = img.replace(/\\/g, '/');
      const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
      return `${baseUrl}${finalPath}`;
    }

    return `${baseUrl}/uploads/${img}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading your orders...</p>
            <p className="text-gray-400 text-sm">Please wait while we fetch your order history</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <FaBoxOpen className="w-8 h-8 text-green-600" />
              My Orders
            </h1>
            <p className="text-gray-600">Track and manage your purchases</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <FaShoppingBag className="w-5 h-5" />
              Continue Shopping
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FaBox className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.order_status === 'delivered').length}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.order_status === 'shipped').length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FaTruck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.order_status === 'pending' || o.order_status === 'confirmed').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>


        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {user ? 'You haven\'t placed any orders yet.' : 'Please login to view your orders.'}
              Start shopping to discover our organic beauty products!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold px-8 py-4 text-lg rounded-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                <FaShoppingBag className="w-5 h-5" />
                Browse All Products
              </button>
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-green-600 border border-green-600 font-semibold px-8 py-4 text-lg rounded-lg hover:bg-green-50 transition-all duration-300 flex items-center gap-3"
                >
                  <FaUser className="w-5 h-5" />
                  Login to View Orders
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalAmount = typeof order.total_amount === 'number'
                ? order.total_amount
                : parseFloat(order.total_amount) || 0;

              const canCancel = order.order_status === 'pending';
              const statusColors = getStatusColor(order.order_status);

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                  {/* Order Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          Order #{order.id}
                        </h3>
                        <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                          {getStatusIcon(order.order_status)}
                          <span>
                            {order.order_status ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1) : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="w-4 h-4" />
                          <span>Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <FaUser className="w-4 h-4" />
                          <span>{order.customer_name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <FaEnvelope className="w-4 h-4" />
                          <span>{order.customer_email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 lg:mt-0 lg:text-right">
                      <div className="flex items-center justify-end gap-2 mb-3">
                        <FaRupeeSign className="w-5 h-5 text-gray-700" />
                        <p className="text-2xl font-bold text-gray-800">
                          ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        {canCancel && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                          >
                            <FaTrash className="w-4 h-4" />
                            <span>Cancel Order</span>
                          </button>
                        )}

                        <button
                          onClick={() => navigate(`/invoice/${order.id}?email=${encodeURIComponent(order.customer_email)}`)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FaBox className="w-5 h-5 text-green-600" />
                      Order Items ({order.items?.length || 0})
                    </h4>

                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-4">
                        {order.items.map((item) => {
                          const itemPrice = typeof item.price === 'number'
                            ? item.price
                            : parseFloat(item.price) || 0;

                          return (
                            <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                              <div className="flex items-start sm:items-center space-x-4 flex-1">
                                <div className="relative">
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.product_name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                    onError={(e) => {
                                      e.target.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop';
                                    }}
                                  />
                                  <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                    {item.quantity}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-gray-800 truncate">{item.product_name}</h5>
                                  <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                      <FaRupeeSign className="w-3 h-3" />
                                      <span>{itemPrice.toFixed(2)} each</span>
                                    </div>
                                    <div className="w-px h-4 bg-gray-300"></div>
                                    <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${statusColors.bg} ${statusColors.text}`}>
                                      {getStatusIcon(order.order_status)}
                                      {order.order_status.toUpperCase()}
                                    </span>

                                    {/* Review Button */}
                                    {order.order_status === 'delivered' && (
                                      <>
                                        <div className="w-px h-4 bg-gray-300"></div>
                                        <button
                                          onClick={() => setShowReviewForm({
                                            orderId: order.id,
                                            productId: item.product_id,
                                            productName: item.product_name
                                          })}
                                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                                        >
                                          <FaStar className="w-4 h-4" />
                                          <span>Write Review</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right">
                                <span className="font-bold text-lg text-gray-800">
                                  ₹{(itemPrice * item.quantity).toFixed(2)}
                                </span>
                                <p className="text-sm text-gray-500">
                                  {item.quantity} × ₹{itemPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <FaExclamationTriangle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No items found in this order</p>
                      </div>
                    )}

                    {/* Review Form */}
                    {showReviewForm && order.items.some(item =>
                      item.product_id === showReviewForm.productId && order.id === showReviewForm.orderId
                    ) && (
                        <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                              <FaStar className="w-5 h-5 text-yellow-500" />
                              Write a Review
                            </h5>
                            <button
                              onClick={() => setShowReviewForm(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </div>
                          <ReviewForm
                            orderId={showReviewForm.orderId}
                            productId={showReviewForm.productId}
                            productName={showReviewForm.productName}
                            onSuccess={() => {
                              setShowReviewForm(null);
                              toast.success('Thank you for your review! ⭐');
                              fetchOrders();
                            }}
                            onCancel={() => setShowReviewForm(null)}
                          />
                        </div>
                      )}
                  </div>

                  {/* Order Footer */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Need help with this order?</p>
                        <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                          <FaShippingFast className="w-4 h-4" />
                          Contact Support
                        </button>
                      </div>

                      <div className="flex items-center gap-4">


                        <button
                          onClick={() => viewOrderDetails(order.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 hover:underline"
                        >
                          <FaArrowRight className="w-4 h-4" />
                          View Order Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Need Help Section */}
        {orders.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-6 lg:mb-0 lg:mr-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                  <FaExclamationTriangle className="w-6 h-6 text-green-600" />
                  Need Help With Your Order?
                </h3>
                <p className="text-gray-600 mb-4">
                  Have questions about your order status or delivery?
                  Our customer support team is here to help you.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <FaEnvelope className="w-4 h-4" />
                    Email Support
                  </button>
                  <button className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
                    <FaPhone className="w-4 h-4" />
                    Call Support
                  </button>
                </div>
              </div>
              <div className="text-center lg:text-right">
                <div className="bg-white p-6 rounded-xl shadow inline-block">
                  <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                  <p className="text-gray-700 font-medium">Customer Support</p>
                  <p className="text-sm text-gray-500">We're always here to help</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;