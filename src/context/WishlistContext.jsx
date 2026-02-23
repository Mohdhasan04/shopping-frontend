// client/src/context/WishlistContext.jsx - COMPLETE FIXED
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // ✅ SIMPLE TOAST HELPER - FIXED
  const showWishlistToast = (type, message) => {
    toast.dismiss(); // Always remove previous toasts first
    
    if (type === 'success') {
      toast.success(message, {
        position: 'bottom-center',
        duration: 3000,
      });
    } else if (type === 'error') {
      toast.error(message, {
        position: 'bottom-center',
        duration: 4000,
      });
    }
  };

  // Load wishlist when user logs in
  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, fetching wishlist...');
      fetchWishlist();
    } else {
      console.log('👤 No user, clearing wishlist');
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Fetching wishlist from API...');
      
      const response = await api.get('/wishlist');
      
      if (response.data.success) {
        console.log('✅ Wishlist loaded:', response.data.wishlist?.length || 0, 'items');
        setWishlist(response.data.wishlist || []);
      } else {
        console.error('Wishlist fetch failed:', response.data.message);
        setWishlist([]);
      }
      
    } catch (error) {
      console.error('Fetch wishlist error:', error.response?.data || error.message);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      showWishlistToast('error', 'Please login to add to wishlist');
      return false;
    }

    const numericProductId = parseInt(productId);
    
    try {
      const response = await api.post('/wishlist', { 
        product_id: numericProductId 
      });
      
      if (response.data.success) {
        await fetchWishlist(); // Refresh list
        // ✅ NO TOAST HERE - ProductDetails will handle it
        return true;
      } else {
        showWishlistToast('error', response.data.message || 'Failed to add');
        return false;
      }
      
    } catch (error) {
      console.error('Add error:', error.response?.data || error.message);
      showWishlistToast('error', error.response?.data?.message || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    const numericProductId = parseInt(productId);
    
    try {
      const response = await api.delete(`/wishlist/${numericProductId}`);
      
      if (response.data.success) {
        setWishlist(prev => prev.filter(item => item.id !== numericProductId));
        // ✅ NO TOAST HERE - ProductDetails will handle it
        return true;
      } else {
        showWishlistToast('error', 'Failed to remove');
        return false;
      }
      
    } catch (error) {
      console.error('Remove error:', error);
      showWishlistToast('error', 'Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    const numericProductId = parseInt(productId);
    return wishlist.some(item => item.id === numericProductId);
  };

  const value = {
    wishlist,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};