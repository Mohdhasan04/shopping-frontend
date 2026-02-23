import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import Invoice from '../components/Invoice';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';

const InvoicePage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderForInvoice();
  }, [orderId]);

  const fetchOrderForInvoice = async () => {
    try {
      setLoading(true);
      
      // Get email from URL or localStorage
      const query = new URLSearchParams(location.search);
      let customerEmail = query.get('email');
      
      if (!customerEmail) {
        customerEmail = localStorage.getItem('customer_email');
      }

      if (!customerEmail) {
        toast.error('Please login to view invoice');
        navigate('/orders');
        return;
      }

      

      // Fetch order details
      const response = await api.get(`/orders/track/${orderId}?email=${customerEmail}`);
      
      if (response.data.success) {
        setOrder(response.data.order);
      } else {
        toast.error('Order not found');
        navigate('/orders');
      }
    } catch (error) {
      console.error('❌ Error fetching invoice:', error);
      
      if (error.response?.status === 404) {
        toast.error('Order not found');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to view this invoice');
      } else {
        toast.error('Failed to load invoice');
      }
      
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center py-20">
            <FaSpinner className="w-12 h-12 text-green-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">Loading invoice...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FaExclamationTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-6">The invoice you're looking for doesn't exist.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Invoice Modal */}
      <Invoice 
        order={order} 
        onClose={() => navigate('/orders')}
      />
    </div>
  );
};

export default InvoicePage;