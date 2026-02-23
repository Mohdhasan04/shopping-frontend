import React, { createContext, useState, useContext } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const ReturnsContext = createContext();

export const useReturns = () => {
  const context = useContext(ReturnsContext);
  if (!context) {
    throw new Error('useReturns must be used within a ReturnsProvider');
  }
  return context;
};

export const ReturnsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const createReturnRequest = async (returnData) => {
    try {
      setLoading(true);
      console.log('🔄 Submitting return request:', returnData);

      const response = await api.post('/returns/request', returnData); // ✅ CORRECTED URL

      if (response.data.success) {
        toast.success('Return request submitted successfully! 🔄');
        return response.data.return_id;
      }
    } catch (error) {
      console.error('Create return request error:', error);
      const message = error.response?.data?.message || 'Failed to submit return request';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserReturns = async () => {
    try {
      console.log('📋 Fetching user returns...');
      const response = await api.get('/returns/user'); // ✅ CORRECTED URL
      return response.data.returns || [];
    } catch (error) {
      console.error('Get user returns error:', error);
      // Don't show toast for empty returns
      if (error.response?.status !== 404) {
        toast.error('Failed to load return requests');
      }
      return [];
    }
  };

  const getReturnDetails = async (returnId) => {
    try {
      console.log('🔍 Fetching return details:', returnId);
      const response = await api.get(`/returns/${returnId}`); // ✅ CORRECTED URL
      return response.data.return;
    } catch (error) {
      console.error('Get return details error:', error);
      const message = error.response?.data?.message || 'Failed to fetch return details';
      toast.error(message);
      throw error;
    }
  };

  const cancelReturnRequest = async (returnId) => {
    try {
      console.log('❌ Canceling return request:', returnId);
      const response = await api.put(`/returns/${returnId}/cancel`); // ✅ CORRECTED URL

      if (response.data.success) {
        toast.success('Return request cancelled successfully');
        return true;
      }
    } catch (error) {
      console.error('Cancel return request error:', error);
      const message = error.response?.data?.message || 'Failed to cancel return request';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    loading,
    createReturnRequest,
    getUserReturns,
    getReturnDetails,
    cancelReturnRequest
  };

  return (
    <ReturnsContext.Provider value={value}>
      {children}
    </ReturnsContext.Provider>
  );
};