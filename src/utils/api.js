// client/src/utils/api.js - UPDATED WITH TOKEN FIX
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
  withCredentials: false
});

// ✅ FIXED: Request interceptor that ALWAYS adds token
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} request to: ${config.url}`);

    // ✅ ALWAYS get fresh token from localStorage
    const token = localStorage.getItem('token');

    console.log('🔑 Token check:', {
      hasToken: !!token,
      token: token ? token.substring(0, 20) + '...' : 'No token',
      tokenLength: token?.length
    });

    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.log('❌ No valid token found');
      // Don't add Authorization header if no token
      delete config.headers.Authorization;
    }

    // Log final headers
    console.log('📤 Request headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers.Authorization ? 'Present' : 'Missing'
    });

    return config;
  },
  (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
  }
);

// ✅ FIXED: Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status} from ${response.config.url}`);
    console.log('📥 Response data:', response.data);
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Log detailed error info
    console.error('❌ API Error Details:', {
      URL: originalRequest?.url,
      Method: originalRequest?.method,
      Status: error.response?.status,
      StatusText: error.response?.statusText,
      ErrorMessage: error.message,
      HasResponse: !!error.response,
      HeadersSent: {
        'Authorization': originalRequest?.headers?.Authorization ? 'Yes' : 'No',
        'Content-Type': originalRequest?.headers?.['Content-Type']
      }
    });

    // Show response data if exists
    if (error.response?.data) {
      console.error('📝 Server response:', error.response.data);
    }

    // Handle 401 - Token issues
    if (error.response?.status === 401) {
      console.warn('⚠️ 401 Unauthorized - Token issue detected');

      // Check if token exists
      const currentToken = localStorage.getItem('token');
      console.log('🔍 Current token in localStorage:', {
        exists: !!currentToken,
        length: currentToken?.length,
        value: currentToken ? currentToken.substring(0, 30) + '...' : 'null'
      });

      // Don't auto-redirect, just show error
      // The component should handle login redirect
    }

    // Handle 404 - Endpoint not found
    if (error.response?.status === 404) {
      console.error('🔍 404 - Endpoint not found:', originalRequest?.url);
    }

    // Handle 500 - Server error
    if (error.response?.status === 500) {
      console.error('💥 500 - Server error');
    }

    // Network errors
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
    }

    if (!error.response) {
      console.error('🌐 Network error - Server might be down');
    }

    return Promise.reject(error);
  }
);

// ✅ NEW: Function to manually set token (call this after login)
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    console.log('✅ Token saved to localStorage');
  } else {
    localStorage.removeItem('token');
    console.log('🗑️ Token removed from localStorage');
  }
};

// ✅ NEW: Function to check if token exists
export const hasValidToken = () => {
  const token = localStorage.getItem('token');
  return token && token !== 'undefined' && token !== 'null' && token.length > 10;
};

// ✅ NEW: Function to get current token
export const getCurrentToken = () => {
  return localStorage.getItem('token');
};

// ✅ NEW: Test function to verify token works
export const testToken = async () => {
  try {
    const token = getCurrentToken();
    console.log('🧪 Testing token:', {
      exists: !!token,
      length: token?.length,
      preview: token ? token.substring(0, 20) + '...' : 'No token'
    });

    // Test a simple endpoint
    const response = await api.get('/auth/verify');
    console.log('✅ Token test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Token test failed:', error.response?.status || error.message);
    return false;
  }
};

// ✅ NEW: Function to fix token issues
export const fixTokenIssue = async () => {
  console.log('🔧 Attempting to fix token issues...');

  // 1. Clear potentially corrupted token
  const oldToken = localStorage.getItem('token');
  if (oldToken && (oldToken === 'undefined' || oldToken === 'null')) {
    localStorage.removeItem('token');
    console.log('🗑️ Removed invalid token');
  }

  // 2. Try to get new token from server
  try {
    // Check if we're logged in by calling a public endpoint
    await api.get('/products');
    console.log('✅ Connection to server is working');

    // If user is logged in, token should be in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ Valid token found');
      return true;
    } else {
      console.log('ℹ️ No token found - user might not be logged in');
      return false;
    }
  } catch (error) {
    console.error('❌ Cannot connect to server:', error.message);
    return false;
  }
};

export { api };