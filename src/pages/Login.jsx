import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ✅ React Icons Import - MOVED TO TOP
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaUserPlus,
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaLeaf,
  FaShieldAlt
} from 'react-icons/fa';
import { GiFlowerEmblem } from 'react-icons/gi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // ✅ SINGLE TOAST FUNCTION - FIXED
  const showLoginToast = (type, message) => {
    // Always dismiss previous toasts FIRST
    toast.dismiss();
    
    const options = {
      position: 'bottom-center',
      duration: 3000,
    };
    
    if (type === 'success') {
      toast.success(message, options);
    } else if (type === 'error') {
      toast.error(message, options);
    } else {
      toast(message, options);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showLoginToast('error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    // ✅ Remove any existing toasts before login attempt
    toast.dismiss();

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        showLoginToast('success', 'Welcome back! Login successful');
        navigate('/');
      } else {
        showLoginToast('error', result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showLoginToast('error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // ✅ Single toast for social login
    toast.dismiss();
    toast.info(`Sign in with ${provider} is coming soon!`, {
      position: 'bottom-center',
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <GiFlowerEmblem className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Welcome Back
              <span className="text-green-600 block text-3xl">to Mufi Organic's</span>
            </h1>
            <p className="text-gray-600">Sign in to access your account and continue shopping</p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Social Login */}
            {/* <div className="mb-8">
              <p className="text-center text-gray-600 mb-4">Or sign in with</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialLogin('Google')}
                  className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaGoogle className="w-5 h-5 text-red-500" />
                  <span className="font-medium text-gray-700">Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('Facebook')}
                  className="flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <FaFacebook className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-700">Facebook</span>
                </button>
              </div>
            </div> */}

            {/* Divider */}
            {/* <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div> */}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="form-label font-medium flex items-center gap-2">
                  <FaEnvelope className="w-4 h-4 text-gray-500" />
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="you@example.com"
                  />
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="form-label font-medium flex items-center gap-2">
                  <FaLock className="w-4 h-4 text-gray-500" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  loading 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-xl hover:scale-[1.02]'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="w-5 h-5" />
                    <span>Sign In to Your Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-gray-600">
                New to Organic Beauty?{' '}
                <Link 
                  to="/signup" 
                  className="text-green-600 hover:text-green-700 font-semibold flex items-center justify-center gap-2 mt-2"
                >
                  <FaUserPlus className="w-4 h-4" />
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Security & Features */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                <FaShieldAlt className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Secure Login</h3>
              <p className="text-sm text-gray-600">256-bit SSL encryption</p>
            </div>
            
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                <FaLeaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Organic Rewards</h3>
              <p className="text-sm text-gray-600">Earn points on purchases</p>
            </div>
            
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-xl">
              <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
                <GiFlowerEmblem className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Fast Checkout</h3>
              <p className="text-sm text-gray-600">Save your details</p>
            </div>
          </div>

          {/* Guest Checkout */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Want to shop without an account?</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              Continue as guest →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;