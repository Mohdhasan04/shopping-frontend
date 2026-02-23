import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, 
  FaEdit, FaSave, FaCalendarAlt, FaCheckCircle,
  FaShieldAlt, FaArrowLeft, FaHeart, FaShoppingCart, FaHistory
} from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Initialize form data when user is available
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data to send - handle empty strings
      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zipCode: formData.zipCode?.trim() || null
      };

      console.log('🔄 Sending update to /auth/profile:', updateData);
      
      // Direct call to the endpoint
      const response = await api.put('/auth/profile', updateData);
      
      console.log('✅ Profile update response:', response.data);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        
        // Update user in context
        updateUser(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        
        // Refresh form data
        setFormData({
          name: updatedUser.name || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          address: updatedUser.address || '',
          city: updatedUser.city || '',
          state: updatedUser.state || '',
          zipCode: updatedUser.zipCode || ''
        });
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          toast.error(
            <div className="text-left p-2">
              <p className="font-bold text-red-700">Backend Route Missing!</p>
              <p className="text-sm mt-1">Please add this route to your backend.</p>
            </div>,
            { duration: 10000 }
          );
        } else if (error.response.status === 400) {
          toast.error(error.response.data.message || 'Validation error');
        } else if (error.response.status === 500) {
          if (error.response.data.sqlError) {
            toast.error(
              <div>
                <p className="font-bold">Database Error!</p>
                <p className="text-sm">Please add missing columns to users table:</p>
                <pre className="text-xs bg-gray-800 text-white p-2 rounded mt-1 overflow-auto">
{`ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN state VARCHAR(100);
ALTER TABLE users ADD COLUMN zip_code VARCHAR(20);`}
                </pre>
              </div>,
              { duration: 15000 }
            );
          } else {
            toast.error('Server error. Please try again.');
          }
        } else {
          toast.error(`Error ${error.response.status}: ${error.response.data.message}`);
        }
      } else {
        toast.error('Network error. Please check console.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      });
    }
    setIsEditing(false);
  };

  // Test database connection
  const testConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      const response = await api.get('/api/test');
      console.log('✅ Backend test response:', response.data);
      
      // Test profile endpoint
      const profileTest = await api.put('/auth/profile', {
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        city: user.city || null,
        state: user.state || null,
        zipCode: user.zipCode || null
      });
      console.log('✅ Profile endpoint works');
      
    } catch (error) {
      console.error('❌ Test failed:', error.response?.data || error.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view profile</h2>
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
          
          {/* Debug button - remove in production */}
          <button
            onClick={testConnection}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Test Backend Connection
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <FaUser className="w-6 h-6 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="flex gap-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <FaEdit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-800">{user.name}</p>
                      </div>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaEnvelope className="w-4 h-4" />
                      Email Address *
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-800">{user.email}</p>
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaPhone className="w-4 h-4" />
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        placeholder="+91 9876543210"
                      />
                    ) : (
                      <div className="px-4 py-2 bg-gray-50 rounded-lg">
                        <p className="text-gray-800">
                          {user.phone || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Member Since */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-800">
                        {new Date(user.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    Shipping Address
                  </label>
                  
                  {isEditing ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="State"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            placeholder="ZIP Code"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gray-50 rounded-lg">
                      <p className="text-gray-800">
                        {user.address 
                          ? `${user.address}, ${user.city}, ${user.state} ${user.zipCode}`
                          : 'No address provided'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaShieldAlt className="w-5 h-5 text-green-600" />
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email Verified</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <FaCheckCircle className="w-4 h-4" />
                    Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium text-blue-600">
                    {user.role === 'admin' ? 'Administrator' : 'Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  to="/orders" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <FaHistory className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
                  <span className="group-hover:text-blue-700">My Orders</span>
                </Link>
                <Link 
                  to="/wishlist" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <FaHeart className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                  <span className="group-hover:text-red-700">My Wishlist</span>
                </Link>
                <Link 
                  to="/cart" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
                >
                  <FaShoppingCart className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  <span className="group-hover:text-green-700">Shopping Cart</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;