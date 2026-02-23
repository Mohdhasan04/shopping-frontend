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
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnType, setReturnType] = useState('return');
  const [selectedItemsForReturn, setSelectedItemsForReturn] = useState([]);
  const [returnDescription, setReturnDescription] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSubmitted, setReturnSubmitted] = useState(false);
  const [returnInfo, setReturnInfo] = useState(null); // DB return status

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
        // Always fetch return status - the function handles both auth and guest
        const email = query.get('email') || localStorage.getItem('customer_email');
        fetchReturnStatus(email);

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

  const fetchReturnStatus = async (email) => {
    try {
      const token = localStorage.getItem('token');

      // If user is logged in, use authenticated endpoint (handles both user_id and email)
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          const response = await api.get(`/returns/my-order/${orderId}`);
          if (response.data.success) {
            if (response.data.return) {
              setReturnInfo(response.data.return);
              setReturnSubmitted(true);
            } else {
              setReturnInfo(null);
              setReturnSubmitted(false);
            }
            return; // Done - no need for email fallback
          }
        } catch (authErr) {
          // If auth endpoint fails (e.g. 404 order not found), fall through to email
          console.log('Auth return fetch failed, trying email fallback...');
        }
      }

      // Fallback: email-based (for guest users)
      if (email) {
        const response = await api.get(`/returns/order/${orderId}?email=${encodeURIComponent(email)}`);
        if (response.data.success && response.data.return) {
          setReturnInfo(response.data.return);
          setReturnSubmitted(true);
        } else {
          setReturnInfo(null);
          setReturnSubmitted(false);
        }
      }
    } catch (err) {
      // No return found - that's fine
      setReturnInfo(null);
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
      current: index === currentIndex && !returnSubmitted,
    }));

    // Add Return step if return exists in DB or was just submitted
    if (returnSubmitted || returnInfo) {
      const info = returnInfo;
      const statusLabel = {
        requested: 'Return Requested',
        approved: 'Return Approved',
        rejected: 'Return Rejected',
        processing: 'Return Processing',
        completed: 'Return Completed',
        cancelled: 'Return Cancelled',
      }[info?.status || 'requested'] || 'Return Requested';

      const statusDesc = {
        requested: 'Your return/exchange request has been submitted and is being reviewed',
        approved: 'Your return has been approved! Please ship the item back',
        rejected: 'Your return request was rejected. Check admin notes for details',
        processing: 'Your return is being processed',
        completed: 'Return completed! Refund has been initiated',
        cancelled: 'Return request was cancelled',
      }[info?.status || 'requested'] || 'Return request submitted';

      mappedSteps.push({
        id: 5,
        status: info?.status || 'requested',
        label: statusLabel,
        description: statusDesc,
        adminNotes: info?.admin_notes,
        refundAmount: info?.refund_amount,
        returnType: info?.type,
        completed: ['approved', 'processing', 'completed'].includes(info?.status),
        current: true,
        isReturn: true,
      });
    }

    return mappedSteps;
  };


  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=100&h=100&fit=crop';
    if (imagePath.startsWith('/uploads/')) {
      return `http://${window.location.hostname}:5000${imagePath}`;
    }
    return imagePath;
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

  const requestReturn = () => {
    // Open return modal
    setSelectedItemsForReturn(order.items.map(item => ({
      order_item_id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      selected: false,
      reason: 'wrong_item'
    })));
    setShowReturnModal(true);
  };

  const submitReturnRequest = async () => {
    const itemsToReturn = selectedItemsForReturn.filter(item => item.selected);

    if (itemsToReturn.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    try {
      setSubmittingReturn(true);
      const payload = {
        order_id: orderId,
        type: returnType,
        items: itemsToReturn.map(item => ({
          order_item_id: item.order_item_id,
          product_id: item.product_id,
          quantity: item.quantity,
          reason: item.reason
        })),
        description: returnDescription
      };

      const response = await api.post('/returns/request', payload);

      if (response.data.success) {
        toast.success('Return request submitted successfully!');
        setShowReturnModal(false);
        setReturnSubmitted(true);
        // Fetch updated return status from DB (handles both auth and guest)
        const query = new URLSearchParams(location.search);
        const email = query.get('email') || localStorage.getItem('customer_email');
        fetchReturnStatus(email);
        fetchOrderDetails();

      }
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };

  const toggleItemSelection = (index) => {
    const updated = [...selectedItemsForReturn];
    updated[index].selected = !updated[index].selected;
    setSelectedItemsForReturn(updated);
  };

  const handleItemReasonChange = (index, reason) => {
    const updated = [...selectedItemsForReturn];
    updated[index].reason = reason;
    setSelectedItemsForReturn(updated);
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
                  const returnColors = {
                    requested: { bg: 'bg-orange-500', border: 'border-orange-300', badge: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-700', label: '⏳ Awaiting Admin Review' },
                    approved: { bg: 'bg-blue-500', border: 'border-blue-300', badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', label: '✅ Approved — Please ship item back' },
                    processing: { bg: 'bg-yellow-500', border: 'border-yellow-300', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', text: 'text-yellow-700', label: '🔄 Being Processed' },
                    completed: { bg: 'bg-green-600', border: 'border-green-400', badge: 'bg-green-50 text-green-700 border-green-200', text: 'text-green-700', label: '🎉 Completed — Refund Initiated' },
                    rejected: { bg: 'bg-red-500', border: 'border-red-300', badge: 'bg-red-50 text-red-700 border-red-200', text: 'text-red-700', label: '❌ Request Rejected' },
                    cancelled: { bg: 'bg-gray-400', border: 'border-gray-300', badge: 'bg-gray-50 text-gray-600 border-gray-200', text: 'text-gray-600', label: '🚫 Cancelled' },
                  };
                  const rc = step.isReturn ? (returnColors[step.status] || returnColors.requested) : null;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.isReturn ? rc.bg : step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                        {step.isReturn ? (
                          <FaUndo className="w-4 h-4 text-white" />
                        ) : step.completed ? (
                          <FaCheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-gray-600 font-medium">{step.id}</span>
                        )}
                      </div>
                      <div className={`pb-4 flex-1 ${idx < steps.length - 1 ? 'border-l-2' : ''} ${step.isReturn ? rc.border : step.completed ? 'border-green-500' : 'border-gray-300'
                        } pl-2`}>
                        <h3 className={`font-medium ${step.isReturn ? rc.text : step.current ? 'text-green-700' : 'text-gray-700'}`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.current && (
                          <div className={`mt-2 px-3 py-1 text-xs rounded-full inline-block border ${step.isReturn ? rc.badge : 'bg-green-50 text-green-700 border-green-200'
                            }`}>
                            {step.isReturn ? rc.label : 'Current Status'}
                          </div>
                        )}
                        {step.isReturn && step.adminNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600">
                            <span className="font-semibold">Admin Note:</span> {step.adminNotes}
                          </div>
                        )}
                        {step.isReturn && step.refundAmount && ['approved', 'processing', 'completed'].includes(step.status) && (
                          <div className="mt-1 text-xs font-semibold text-green-700">
                            💰 Estimated Refund: ₹{parseFloat(step.refundAmount).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
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
                {order.order_status === 'delivered' && !returnInfo && (
                  <button
                    onClick={requestReturn}
                    className="w-full bg-white text-green-600 border border-green-600 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <FaUndo className="w-4 h-4" />
                    Request Return/Exchange
                  </button>
                )}
                {returnInfo && (
                  <div className="w-full bg-orange-50 border border-orange-200 py-3 px-4 rounded-lg text-sm text-orange-700 flex items-center gap-2">
                    <FaUndo className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Return <strong>{returnInfo.type}</strong> request is <strong>{returnInfo.status}</strong>. See progress above.
                    </span>
                  </div>
                )}
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

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Return / Exchange Request</h2>
                <p className="text-gray-500 text-sm">Select items you want to return or exchange</p>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                id="close-return-modal"
              >
                <FaTimesCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Request Type</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setReturnType('return')}
                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-semibold ${returnType === 'return'
                      ? 'border-green-600 bg-green-50 text-green-700 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <FaUndo className="w-5 h-5" />
                    Return for Refund
                  </button>
                  <button
                    onClick={() => setReturnType('exchange')}
                    className={`flex-1 py-4 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 font-semibold ${returnType === 'exchange'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-md transform scale-[1.02]'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <FaSync className="w-5 h-5" />
                    Exchange Item
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Select Items to {returnType === 'return' ? 'Return' : 'Exchange'}</label>
                <div className="space-y-3">
                  {selectedItemsForReturn.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${item.selected
                        ? 'border-green-500 bg-white shadow-sm'
                        : 'border-gray-200 bg-white opacity-70'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          onClick={() => toggleItemSelection(index)}
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors ${item.selected ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'
                            }`}
                        >
                          {item.selected && <FaCheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 cursor-pointer" onClick={() => toggleItemSelection(index)}>
                          <h4 className="font-bold text-gray-800">{item.product_name}</h4>
                          <p className="text-sm text-gray-500">Ordered Quantity: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
                        </div>
                      </div>

                      {item.selected && (
                        <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                          <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">
                            Reason for {returnType}:
                          </label>
                          <div className="relative">
                            <select
                              value={item.reason}
                              onChange={(e) => handleItemReasonChange(index, e.target.value)}
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                            >
                              <option value="wrong_item">Wrong Item Sent</option>
                              <option value="damaged">Damaged or Defective Item</option>
                              <option value="size_issue">Size / Fit Issue</option>
                              <option value="not_matching_desc">Product Quality Not as Expected</option>
                              <option value="changed_mind">Changed My Mind / No Longer needed</option>
                              <option value="others">Other Reasons</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <FaArrowDown className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Additional Description</label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Tell us more about why you want a return/exchange..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none min-h-[120px] transition-all"
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 py-4 px-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                disabled={submittingReturn}
              >
                Cancel
              </button>
              <button
                onClick={submitReturnRequest}
                className="flex-1 py-4 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={submittingReturn}
              >
                {submittingReturn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5" />
                    Confirm {returnType === 'return' ? 'Return' : 'Exchange'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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