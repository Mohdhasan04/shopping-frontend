// File: client/src/components/ProductReviews.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { FaStar, FaUser, FaPlus, FaCheckCircle } from 'react-icons/fa';
import ReviewForm from './ReviewForm';

const ProductReviews = ({ productId, refreshTrigger, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    console.log('🔄 ProductReviews useEffect, productId:', productId);
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      console.log('📡 Fetching reviews for product:', productId);
      
      const response = await api.get(`/reviews/product/${productId}`);
      console.log('📦 API Response:', response.data);
      
      if (response.data.success) {
        const reviewsData = response.data.reviews || [];
        console.log('✅ Got', reviewsData.length, 'reviews');
        
        setReviews(reviewsData);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
          setAverageRating(parseFloat(avg.toFixed(1)));
        } else {
          setAverageRating(0);
        }
        
        // ✅ IMPORTANT: Notify parent about review count
        if (onReviewAdded) {
          console.log('📤 Notifying parent of review count:', reviewsData.length);
          // Just trigger update without sending count
          onReviewAdded();
        }
        
        // Check if current user has reviewed
        checkUserReviewStatus();
      } else {
        console.log('❌ API not successful');
        setReviews([]);
        setAverageRating(0);
      }
    } catch (error) {
      console.error('❌ Failed to fetch reviews:', error);
      setReviews([]);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReviewStatus = () => {
    // Check if current user has already reviewed
    // You can implement this based on your auth system
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const hasReviewed = reviews.some(review => review.user_id === user.id);
      setUserHasReviewed(hasReviewed);
    }
  };

  const handleNewReview = (newReview) => {
    console.log('🌟 New review received:', newReview);
    
    // Add to beginning of reviews list
    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    
    // Update average rating
    const newAvg = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
    setAverageRating(parseFloat(newAvg.toFixed(1)));
    
    // ✅ CRITICAL: Notify parent that a new review was added
    if (onReviewAdded) {
      console.log('📤 Notifying parent of new review');
      onReviewAdded(); // This triggers count update in ProductDetails
    }
    
    // Mark that user has reviewed
    setUserHasReviewed(true);
    
    // Hide the form
    setShowReviewForm(false);
    
    // Refresh after 1 second to get updated data
    setTimeout(() => {
      fetchReviews();
    }, 1000);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Render stars
  const renderStars = (rating, size = 'md') => {
    const starSize = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${starSize} ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ REVIEW FORM BUTTON */}
      {/* {!userHasReviewed && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
            <p className="text-gray-600 mt-1">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''} • {averageRating.toFixed(1)} average rating
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FaPlus className="w-4 h-4" />
            <span className="font-semibold">Write a Review</span>
          </button>
        </div>
      )} */}

      {/* ✅ REVIEW FORM (SHOW WHEN CLICKED) */}
      {/* {showReviewForm && (
        <div className="mb-8">
          <ReviewForm 
            productId={productId}
            onSuccess={handleNewReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )} */}

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h3 className="text-2xl font-bold text-gray-900">Customer Feedback</h3>
            <p className="text-gray-600 mt-2">
              Based on {reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-700 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating), 'lg')}
            </div>
            <p className="text-gray-600 font-medium">
              {reviews.length} {reviews.length === 1 ? 'review' : 'total reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
            <FaStar className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No reviews yet</h3>
          <p className="text-gray-600 text-lg max-w-md mx-auto mb-8">
            Be the first to share your experience with this product!
          </p>
          {!userHasReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all"
            >
              <FaPlus className="w-5 h-5" />
              <span>Write the First Review</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                <div className="flex items-start space-x-4">
                  {/* User Avatar */}
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {review.user_name ? (
                      <span className="text-blue-700 font-bold text-xl">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <FaUser className="w-7 h-7 text-blue-500" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {review.user_name || 'Anonymous User'}
                    </h4>
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                      <span className="ml-3 font-bold text-gray-800">
                        {review.rating}.0
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                  {formatDate(review.created_at)}
                </div>
              </div>
              
              {/* Review Comment */}
              {review.comment && (
                <div className="mt-6">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    "{review.comment}"
                  </p>
                </div>
              )}
              
              {/* Verified Badge */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center text-green-700">
                  <FaCheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Verified Purchase</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;