// client/src/context/ReviewsContext.jsx - COMPLETELY FIXED
import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const ReviewsContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const createReview = useCallback(async (reviewData) => {
    try {
      setLoading(true);
      const response = await api.post('/reviews', reviewData);
      
      if (response.data.success) {
        toast.success('Review submitted successfully! ⭐');
        return response.data.review;
      }
      
      throw new Error(response.data.message || 'Failed to submit review');
    } catch (error) {
      console.error('Create review error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to submit review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductReviews = useCallback(async (productId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get product reviews error:', error.message);
      
      // Return empty data instead of throwing error
      return {
        reviews: [],
        average_rating: 0,
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalReviews: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
  }, []);

  const getUserReviews = useCallback(async () => {
    try {
      const response = await api.get('/reviews/user');
      return response.data.reviews || [];
    } catch (error) {
      console.error('Get user reviews error:', error);
      return [];
    }
  }, []);

  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      setLoading(true);
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      
      if (response.data.success) {
        toast.success('Review updated successfully! ✏️');
        return true;
      }
      
      throw new Error(response.data.message || 'Failed to update review');
    } catch (error) {
      console.error('Update review error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/reviews/${reviewId}`);
      
      if (response.data.success) {
        toast.success('Review deleted successfully 🗑️');
        return true;
      }
      
      throw new Error(response.data.message || 'Failed to delete review');
    } catch (error) {
      console.error('Delete review error:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ CORRECT: useMemo is imported
  const value = useMemo(() => ({
    loading,
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview
  }), [
    loading,
    createReview,
    getProductReviews,
    getUserReviews,
    updateReview,
    deleteReview
  ]);

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};