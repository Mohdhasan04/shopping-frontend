// client/src/context/AuthContext.jsx - FIXED WITH updateUser
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

          // Try to get user from localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('✅ User from localStorage:', parsedUser);
      setUser(parsedUser);
      setLoading(false);
      return;
    }


      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      if (userData) {
        const enhancedUser = {
          ...userData,
          customer_email: userData.customer_email || userData.email
        };
        
        console.log('✅ Auth user:', enhancedUser);
        setUser(enhancedUser);
        
            localStorage.setItem('user', JSON.stringify(enhancedUser));
        localStorage.setItem('customer_email', enhancedUser.customer_email || enhancedUser.email);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('customer_email');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ SIMPLE TOAST HELPER
  const showAuthToast = (type, message) => {
    toast.dismiss(); // Always remove previous toasts
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

 const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    const enhancedUser = {
      ...user,
      customer_email: user.customer_email || user.email || email
    };
    
    // ✅ PERMANENT FIX: Save ALL user data
    localStorage.setItem('token', token);
    localStorage.setItem('customer_email', enhancedUser.customer_email);
    localStorage.setItem('user', JSON.stringify(enhancedUser)); // ✅ ADD THIS LINE
    
    setUser(enhancedUser);
    console.log('✅ User saved to localStorage:', enhancedUser);
    
    return { success: true };
  } catch (error) {
    const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
    return { success: false, message };
  }
};

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
      // ✅ Toast for signup only (Signup page will handle)
      showAuthToast('success', 'Account created successfully!');
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed. Please try again.';
      showAuthToast('error', message);
      return { success: false, message };
    }
  };

 const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('customer_email');
  localStorage.removeItem('user'); // ✅ ADD THIS LINE
  setUser(null);
};

  // ✅ NEW: Direct user update function (used by Profile.jsx)
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    console.log('✅ User state updated:', updatedUserData);
  };

  // ✅ FIXED: updateProfile now uses API call
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        showAuthToast('success', 'Profile updated successfully!');
        return { success: true, user: updatedUser };
      } else {
        showAuthToast('error', response.data.message || 'Update failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Update failed. Please try again.';
      showAuthToast('error', message);
      return { success: false, message };
    }
  };

  // Wishlist functions - NO TOASTS HERE
  const addToWishlist = async (productId) => {
    try {
      const response = await api.post('/wishlist/add', { productId });
      
      if (response.data.user) {
        setUser(response.data.user);
      } else if (response.data.wishlist) {
        setUser(prev => ({
          ...prev,
          wishlist: [...(prev?.wishlist || []), productId]
        }));
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to wishlist';
      return { success: false, message };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(`/wishlist/remove/${productId}`);
      
      if (response.data.user) {
        setUser(response.data.user);
      } else if (response.data.wishlist) {
        setUser(prev => ({
          ...prev,
          wishlist: prev?.wishlist?.filter(id => id !== productId) || []
        }));
      }
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      return { success: false, message };
    }
  };

  const checkWishlistStatus = (productId) => {
    return user?.wishlist?.includes(productId) || false;
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,     // ✅ API call function
    updateUser,        // ✅ NEW: Direct state update function
    loading,
    isAuthenticated: !!user,
    // Wishlist functions
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};