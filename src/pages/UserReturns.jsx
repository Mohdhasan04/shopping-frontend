import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useReturns } from '../context/ReturnsContext';

// ✅ React Icons
import {
  FaBoxOpen,
  FaUndo,
  FaExchangeAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaBan,
  FaArrowLeft,
  FaExclamationCircle,
  FaSpinner,
  FaCalendarAlt,
  FaInfoCircle,
  FaRupeeSign,
  FaShoppingBag
} from 'react-icons/fa';

const UserReturns = () => {
  const { getUserReturns, cancelReturnRequest, loading } = useReturns();
  const [returns, setReturns] = useState([]);

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    const userReturns = await getUserReturns();
    setReturns(userReturns);
  };

  const handleCancelReturn = async (returnId) => {
    if (window.confirm('Are you sure you want to cancel this return request?')) {
      try {
        await cancelReturnRequest(returnId);
        fetchReturns(); // Refresh the list
      } catch (error) {
        console.error('Error cancelling return:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': 
        return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200';
      case 'approved': 
        return 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200';
      case 'processing': 
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-700 border border-yellow-200';
      case 'requested': 
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
      case 'rejected': 
        return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200';
      case 'cancelled': 
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border border-gray-300';
      default: 
        return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <FaCheckCircle className="w-4 h-4" />;
      case 'approved': return <FaCheckCircle className="w-4 h-4" />;
      case 'processing': return <FaClock className="w-4 h-4" />;
      case 'requested': return <FaClock className="w-4 h-4" />;
      case 'rejected': return <FaTimesCircle className="w-4 h-4" />;
      case 'cancelled': return <FaBan className="w-4 h-4" />;
      default: return <FaInfoCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'return' ? (
      <FaUndo className="w-6 h-6 text-primary-600" />
    ) : (
      <FaExchangeAlt className="w-6 h-6 text-blue-600" />
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '₹0.00';
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-primary-200 border-t-primary-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaBoxOpen className="w-8 h-8 text-primary-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Returns</h3>
              <p className="text-gray-600">Fetching your return and exchange requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaBoxOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Returns & Exchanges</h1>
                <p className="text-gray-600 mt-1">Manage your return and exchange requests</p>
              </div>
            </div>
            
            <Link 
              to="/orders" 
              className="flex items-center space-x-3 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 shadow-sm"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back to Orders</span>
            </Link>
          </div>

          {/* Content */}
          {returns.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaBoxOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Return Requests</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven't submitted any return or exchange requests yet. 
                You can request returns or exchanges from your order history.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/orders" 
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                >
                  <FaShoppingBag className="w-4 h-4" />
                  <span>View My Orders</span>
                </Link>
                <Link 
                  to="/" 
                  className="flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  <span>Continue Shopping</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium text-gray-700">
                      Total Requests: <span className="font-bold text-primary-600">{returns.length}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-300"></div>
                    <div className="text-sm font-medium text-gray-700">
                      Pending: <span className="font-bold text-yellow-600">
                        {returns.filter(r => ['requested', 'processing'].includes(r.status?.toLowerCase())).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Returns List */}
              {returns.map((returnReq) => (
                <div key={returnReq.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(returnReq.type)}
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {returnReq.type === 'return' ? 'Return' : 'Exchange'} Request
                          </h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2 text-gray-600">
                              <FaCalendarAlt className="w-4 h-4" />
                              <span className="text-sm">{formatDate(returnReq.created_at)}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">
                              Order #{returnReq.order_id}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold ${getStatusColor(returnReq.status)}`}>
                          {getStatusIcon(returnReq.status)}
                          <span>{returnReq.status?.charAt(0).toUpperCase() + returnReq.status?.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Items in Request</p>
                        <p className="text-2xl font-bold text-gray-800">{returnReq.item_count || 0}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <span className="text-sm text-gray-500">Total Quantity:</span>
                          <span className="font-medium">{returnReq.total_quantity || 0}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
                        <div className="flex items-center space-x-1">
                          <FaRupeeSign className="w-4 h-4 text-gray-700" />
                          <p className="text-2xl font-bold text-gray-800">{formatPrice(returnReq.refund_amount)}</p>
                        </div>
                        {returnReq.refund_amount > 0 && (
                          <p className="text-xs text-green-600 font-medium mt-2">
                            ✓ Refund will be processed
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Request Reason</p>
                        <p className="font-medium text-gray-800 capitalize">
                          {returnReq.reason?.replace(/_/g, ' ') || 'Not specified'}
                        </p>
                        {returnReq.type === 'exchange' && (
                          <p className="text-xs text-blue-600 font-medium mt-2">
                            ↻ Exchange requested
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {returnReq.description && (
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <FaInfoCircle className="w-4 h-4 text-gray-500" />
                          <p className="font-medium text-gray-700">Additional Information</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                          <p className="text-gray-700">{returnReq.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Request ID: <span className="font-mono font-bold">{returnReq.id}</span>
                      </div>
                      
                      {['requested', 'approved'].includes(returnReq.status?.toLowerCase()) && (
                        <button 
                          onClick={() => handleCancelReturn(returnReq.id)}
                          className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:from-red-700 hover:to-rose-700"
                        >
                          <FaBan className="w-4 h-4" />
                          <span>Cancel Request</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help Section */}
          {returns.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Need Help with Your Return?</h4>
                  <p className="text-gray-700 text-sm">
                    If you have questions about your return status or need assistance, 
                    please contact our customer support team. Typical processing time 
                    for returns is 5-7 business days after approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReturns;