import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import {
  FaBox,
  FaBoxOpen,
  FaTruck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaShoppingBag,
  FaArrowLeft,
  FaPrint,
  FaDownload,
  FaShareAlt,
  FaShippingFast,
  FaCreditCard,
  FaUndo,
  FaStar,
  FaMoneyBillWave,
  FaCreditCard as FaCard,
  FaMobileAlt,
  FaPaypal,
  FaTag,
  FaShippingFast as FaShipping,
  FaCalculator,
  FaSync,
  FaArrowDown
} from 'react-icons/fa';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemsSubtotal, setItemsSubtotal] = useState(0);
  const [returnSubmitted, setReturnSubmitted] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    // Calculate items subtotal whenever order items change
    if (order?.items) {
      calculateItemsSubtotal();
    }
  }, [order?.items]);

  const calculateItemsSubtotal = () => {
    if (!order?.items) return 0;

    let total = 0;
    order.items.forEach(item => {
      // Use item.price from database (per unit price)
      const itemPrice = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      total += itemPrice * quantity;
    });

    setItemsSubtotal(total);
    return total;
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      // Get email from URL or localStorage
      const query = new URLSearchParams(location.search);
      let customerEmail = query.get('email');

      if (!customerEmail) {
        customerEmail = localStorage.getItem('customer_email');
      }

      const token = localStorage.getItem('token');
      const isLoggedIn = token && token !== 'undefined' && token !== 'null';

      if (!customerEmail && !isLoggedIn) {
        toast.error('Please login to view order details');
        navigate('/orders');
        return;
      }

      console.log('🔍 Fetching order details for:', { orderId, customerEmail, isLoggedIn });

      // Use track order endpoint (public)
      const emailParam = customerEmail ? `?email=${customerEmail}` : '';
      const response = await api.get(`/orders/track/${orderId}${emailParam}`);

      if (response.data.success) {
        setOrder(response.data.order);

        // Log item prices for debugging
        if (response.data.order?.items) {
          console.log('📦 Order Items:', response.data.order.items.map(item => ({
            name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)
          })));
        }
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ Error fetching order details:', error);

      if (error.response?.status === 404) {
        toast.error('Order not found');
      } else if (error.response?.status === 403) {
        toast.error('Email does not match order records');
      } else {
        toast.error('Failed to load order details');
      }

      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };



  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'shipped': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
      case 'confirmed': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' };
      case 'pending': return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
      case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' };
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

  // Calculate shipping amount based on subtotal
  const calculateShipping = (subtotal) => {
    const subtotalNum = parseFloat(subtotal) || 0;
    if (subtotalNum >= 299) {
      return {
        amount: 0,
        isFree: true,
        message: 'FREE',
        note: 'Free shipping on orders above ₹299',
        saved: 50
      };
    } else {
      return {
        amount: 50,
        isFree: false,
        message: '₹50.00',
        note: 'Add ₹' + (299 - subtotalNum).toFixed(2) + ' more for free shipping',
        saved: 0
      };
    }
  };

  // Calculate final total including shipping (NO TAX)
  const calculateOrderTotals = () => {
    // Use calculated items subtotal instead of order.total_amount if wrong
    const subtotal = itemsSubtotal > 0 ? itemsSubtotal : parseFloat(order?.total_amount) || 0;
    const shipping = calculateShipping(subtotal);
    const finalTotal = subtotal + shipping.amount;

    return {
      subtotal,
      shipping,
      finalTotal
    };
  };

  const getPaymentStatusInfo = () => {
    const isCOD = order?.payment_method === 'cod';
    const isDelivered = order?.order_status === 'delivered';
    const isPaidOnline = ['completed', 'paid'].includes(order?.payment_status);

    if (isCOD) {
      if (isDelivered) {
        return {
          status: 'Paid ✓',
          color: 'bg-green-100 text-green-700 border-green-300',
          description: 'Cash collected on delivery',
          icon: '✓'
        };
      } else {
        const totals = calculateOrderTotals();
        return {
          status: 'To Pay',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          description: `Pay ₹${totals.finalTotal.toFixed(2)} on delivery`,
          icon: '⏳'
        };
      }
    } else {
      if (isPaidOnline) {
        return {
          status: 'Paid ✓',
          color: 'bg-green-100 text-green-700 border-green-300',
          description: 'Payment completed online',
          icon: '✓'
        };
      } else {
        return {
          status: 'Pending',
          color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
          description: 'Payment pending',
          icon: '⏳'
        };
      }
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cod': return <FaMoneyBillWave className="w-4 h-4" />;
      case 'card': return <FaCard className="w-4 h-4" />;
      case 'upi': return <FaMobileAlt className="w-4 h-4" />;
      case 'paypal': return <FaPaypal className="w-4 h-4" />;
      default: return <FaCreditCard className="w-4 h-4" />;
    }
  };

  const getPaymentMethodDisplay = (method) => {
    switch (method) {
      case 'cod': return 'Cash on Delivery';
      case 'card': return 'Credit/Debit Card';
      case 'upi': return 'UPI Payment';
      case 'paypal': return 'PayPal';
      default: return method || 'Cash on Delivery';
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 1, status: 'pending', label: 'Order Placed', description: 'Your order has been placed' },
      { id: 2, status: 'confirmed', label: 'Confirmed', description: 'Order confirmed by seller' },
      { id: 3, status: 'shipped', label: 'Shipped', description: 'Order has been shipped' },
      { id: 4, status: 'delivered', label: 'Delivered', description: 'Order delivered successfully' },
    ];

    const currentStatus = order?.order_status;
    const currentIndex = steps.findIndex(step => step.status === currentStatus);

    const mappedSteps = steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));



    return mappedSteps;
  };


  const getImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop';

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

  // Calculate item total correctly
  const calculateItemTotal = (item) => {
    const itemPrice = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    return itemPrice * quantity;
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = () => {
    toast.success('Invoice download feature coming soon!');
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order #${orderId}`,
        text: `Check out my order details for Order #${orderId} from Organic Beauty`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const buyAgain = () => {
    toast.success('All items added to cart!');
    // Implement add to cart logic here
  };



  const rateProducts = () => {
    navigate(`/rate-order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <FaTimesCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors = getStatusColor(order.order_status);
  const steps = getStatusSteps();
  const totals = calculateOrderTotals();
  const paymentStatusInfo = getPaymentStatusInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20 print:pt-0">
      <div className="container mx-auto px-4 py-8">
        {/* Header with actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="flex items-center gap-4 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 bg-white rounded-lg shadow border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Back to Orders"
            >
              <FaArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Order #{order.id}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${statusColors.bg} ${statusColors.text} border ${statusColors.border}`}>
                  {getStatusIcon(order.order_status)}
                  <span>{order.order_status.toUpperCase()}</span>
                </div>
                <span className="text-gray-500 text-sm">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={printInvoice}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <FaPrint className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={downloadInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaDownload className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={shareOrder}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaShareAlt className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Progress & Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info Banner */}
            {totals.shipping.isFree && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <FaTag className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800">🎉 Free Shipping Applied!</h3>
                    <p className="text-green-600 text-sm">You saved ₹{totals.shipping.saved} on shipping</p>
                  </div>
                </div>
              </div>
            )}

            {/* Order Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaTruck className="w-5 h-5 text-blue-600" />
                Order Progress
              </h2>

              <div className="space-y-4">
                {steps.map((step, idx) => {
                    <div key={step.id} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                        {step.completed ? (
                          <FaCheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-gray-600 font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className={`pb-4 flex-1 ${idx < steps.length - 1 ? 'border-l-2' : ''} ${step.completed ? 'border-green-500' : 'border-gray-300'
                        } pl-2`}>
                        <h3 className={`font-medium ${step.current ? 'text-green-700' : 'text-gray-700'}`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.current && (
                          <div className={`mt-2 px-3 py-1 text-xs rounded-full inline-block border bg-green-50 text-green-700 border-green-200`}>
                            Current Status
                          </div>
                        )}
                      </div>
                    </div>
                })}
              </div>
            </div>

            {/* Order Items - FIXED PRICE CALCULATION */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBoxOpen className="w-5 h-5 text-green-600" />
                  Order Items ({order.items?.length || 0})
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <FaCalculator className="w-4 h-4" />
                  <span className="text-sm">Items Total: <span className="font-bold">₹{itemsSubtotal.toFixed(2)}</span></span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const itemPrice = parseFloat(item.price) || 0;
                  const quantity = parseInt(item.quantity) || 1;
                  const itemTotal = calculateItemTotal(item);

                  return (
                    <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop';
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                Qty: {quantity}
                              </span>
                              <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">
                                Price: ₹{itemPrice.toFixed(2)}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${statusColors.bg} ${statusColors.text}`}>
                              {item.item_status || order.order_status}
                            </span>
                          </div>
                          {/* Price breakdown */}
                          <div className="mt-2 text-xs text-gray-500">
                            ₹{itemPrice.toFixed(2)} × {quantity} = ₹{itemTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-gray-800 text-lg">₹{itemTotal.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Item Total</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Items Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Items ({order.items?.length || 0})</span>
                  <div className="text-right">
                    <p className="font-bold text-gray-800 text-xl">₹{itemsSubtotal.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Sum of all item totals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaCreditCard className="w-5 h-5 text-purple-600" />
                Payment & Summary
              </h2>

              <div className="space-y-4">
                {/* Payment Method */}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Payment Method</span>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${order.payment_method === 'cod'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : order.payment_method === 'card'
                        ? 'bg-purple-100 text-purple-700 border border-purple-300'
                        : order.payment_method === 'upi'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}>
                      {getPaymentMethodIcon(order.payment_method)}
                      <span>{getPaymentMethodDisplay(order.payment_method)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Payment Status</span>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 ${paymentStatusInfo.color} border`}>
                      <span className="text-base">{paymentStatusInfo.icon}</span>
                      {paymentStatusInfo.status}
                    </span>
                    <span className="text-xs text-gray-500 text-right max-w-[200px]">
                      {paymentStatusInfo.description}
                    </span>
                  </div>
                </div>

                {/* Order Amounts - NO TAX SECTION */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">Items Total</span>
                    <span className="font-bold text-gray-800">₹{totals.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-100">
                    <div>
                      <span className="text-gray-600 flex items-center gap-2">
                        <FaShipping className="w-4 h-4" />
                        Shipping Fee
                      </span>
                      {!totals.shipping.isFree && totals.subtotal > 0 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Add ₹{(299 - totals.subtotal).toFixed(2)} more for free shipping
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${totals.shipping.isFree ? 'text-green-600' : 'text-gray-800'}`}>
                        {totals.shipping.message}
                      </span>
                      {totals.shipping.isFree && (
                        <p className="text-xs text-green-600 mt-1">You saved ₹50</p>
                      )}
                    </div>
                  </div>

                  {/* Final Total - NO TAX */}
                  <div className="border-t border-gray-300 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-800">Order Total</span>
                        {totals.shipping.isFree ? (
                          <p className="text-sm text-green-600 mt-1">Free shipping included</p>
                        ) : (
                          <p className="text-sm text-gray-500 mt-1">Shipping fee included</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-700">₹{totals.finalTotal.toFixed(2)}</span>
                        <p className="text-sm text-gray-500 mt-1">
                          = ₹{totals.subtotal.toFixed(2)} + ₹{totals.shipping.amount.toFixed(2)} shipping
                        </p>
                      </div>
                    </div>

                    {order.payment_method === 'cod' && order.order_status !== 'delivered' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700 font-medium">
                          <span className="font-bold">COD Note:</span> Pay ₹{totals.finalTotal.toFixed(2)} when delivery arrives
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaUser className="w-5 h-5 text-blue-600" />
                Customer Information
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaUser className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.customer_email}</p>
                  </div>
                </div>
                {order.customer_phone && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{order.customer_phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaMapMarkerAlt className="w-5 h-5 text-red-600" />
                Shipping Details
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mt-1" />
                  <div>
                    <p className="font-medium text-gray-800">Delivery Address</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-line">{order.shipping_address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaShippingFast className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Shipping Method</p>
                    <p className="font-medium">
                      {totals.shipping.isFree ? 'Free Shipping (3-7 days)' : 'Standard Shipping (3-7 days)'}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg mt-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Shipping Policy:</span> Free shipping on orders above ₹299.
                    Orders below ₹299 incur a ₹50 shipping charge. No additional taxes.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-bold text-gray-800 mb-4">Order Actions</h3>
              <div className="space-y-3">

                {order.order_status === 'delivered' && (
                  <button
                    onClick={rateProducts}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaStar className="w-4 h-4" />
                    Rate Products
                  </button>
                )}
                <button
                  onClick={buyAgain}
                  className="w-full bg-white text-gray-700 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <FaShoppingBag className="w-4 h-4" />
                  Buy Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:pt-0 {
            padding-top: 0 !important;
          }
          button, nav, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;