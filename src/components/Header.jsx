import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

// ✅ React Icons
import {
  FaHome, FaShoppingBag, FaHeart, FaShoppingCart,
  FaBox, FaExchangeAlt, FaSignOutAlt, FaCog,
  FaUser, FaLeaf, FaSmile, FaShower, FaBath,
  FaUserCircle
} from 'react-icons/fa';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ✅ Function to handle category navigation - FIXED
  const handleCategoryClick = (category) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/products?category=${category}`);
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  };

  // ✅ Check if current page is active (including query params)
  const isCategoryActive = (category) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category') === category;
  };

  const handleLogout = () => {
    logout();

    // ✅ Remove any existing toasts
    toast.dismiss();

    // ✅ Show single logout toast
    toast.success('Logged out successfully', {
      position: 'bottom-center',
      duration: 3000,
    });

    navigate('/');
    setIsProfileOpen(false);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // ✅ Navigation items with category handling
  const navItems = [
    {
      type: 'link',
      path: '/',
      label: 'Home',
      icon: <FaHome className="w-5 h-5" />
    },
    {
      type: 'link',
      path: '/products',
      label: 'All Products',
      icon: <FaShoppingBag className="w-5 h-5" />
    },
    {
      type: 'category',
      category: 'face-care',
      label: 'Face Care',
      icon: <FaSmile className="w-5 h-5" />
    },
    {
      type: 'category',
      category: 'hair-care',
      label: 'Hair Care',
      icon: <FaShower className="w-5 h-5" />
    },
    {
      type: 'category',
      category: 'body-care',
      label: 'Body Care',
      icon: <FaBath className="w-5 h-5" />
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <FaLeaf className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Mufi Organic
              </span>
              <span className="text-xs text-gray-500 -mt-1">Pure & Natural</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isActiveRoute(item.path)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => handleCategoryClick(item.category)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${isCategoryActive(item.category)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              }
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Wishlist - Show only for regular users */}
                {user.role !== 'admin' && (
                  <Link
                    to="/wishlist"
                    className="hidden md:flex relative p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group"
                    title="Wishlist"
                  >
                    <div className={`flex items-center space-x-1 ${isActiveRoute('/wishlist') ? 'text-red-600' : 'text-gray-600 group-hover:text-red-600'
                      } ${wishlistLoading ? 'opacity-50' : ''}`}>
                      {wishlistLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      ) : (
                        <FaHeart className="w-5 h-5" />
                      )}
                    </div>
                    {!wishlistLoading && wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart - Show only for regular users */}
                {user.role !== 'admin' && (
                  <Link
                    to="/cart"
                    className="relative p-3 rounded-xl hover:bg-blue-50 transition-all duration-200 group"
                    title="Shopping Cart"
                  >
                    <div className={`flex items-center space-x-1 ${isActiveRoute('/cart') ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                      }`}>
                      <FaShoppingCart className="w-5 h-5" />
                    </div>
                    {getCartItemsCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <FaUserCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">
                        {user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.role === 'admin' ? 'Administrator' : 'Customer'}
                      </span>
                    </div>
                    <HiChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''
                      }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <p className="text-xs font-medium text-emerald-600 mt-1">
                          {user.role === 'admin' ? 'Administrator' : 'Customer'}
                        </p>
                      </div>

                      {/* ADMIN USER */}
                      {user.role === 'admin' ? (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaCog className="w-5 h-5 text-gray-500" />
                            <span>Admin Dashboard</span>
                          </Link>

                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                            >
                              <FaSignOutAlt className="w-5 h-5" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        /* REGULAR USER */
                        <>
                          <Link
                            to="/orders"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaBox className="w-5 h-5 text-gray-500" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            to="/wishlist"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaHeart className="w-5 h-5 text-gray-500" />
                            <span>My Wishlist</span>
                            {wishlist.length > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                {wishlist.length}
                              </span>
                            )}
                          </Link>

                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FaUser className="w-5 h-5 text-gray-500" />
                            <span>My Profile</span>
                          </Link>

                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                toast.dismiss(); // ✅ ADD THIS
                                toast.success('Logged out successfully', {
                                  position: 'bottom-center',
                                  duration: 3000,
                                });
                                navigate('/');
                                setIsMenuOpen(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors rounded-xl"
                            >
                              <FaSignOutAlt className="w-5 h-5" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:from-emerald-600 hover:to-green-700"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden flex items-center justify-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <HiX className="w-6 h-6 text-gray-600" />
              ) : (
                <HiMenu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 ${isMenuOpen ? 'max-h-[80vh] overflow-y-auto pb-4 border-t border-gray-100 mt-2' : 'max-h-0 overflow-hidden'
          }`}>
          <nav className="flex flex-col space-y-2 pt-4">
            {navItems.map((item) => {
              if (item.type === 'link') {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${isActiveRoute(item.path)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              } else {
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => handleCategoryClick(item.category)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-left transition-all duration-200 ${isCategoryActive(item.category)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              }
            })}

            {user && (
              <>
                {/* Cart for Mobile - Only for regular users */}
                {user.role !== 'admin' && (
                  <Link
                    to="/cart"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    {getCartItemsCount() > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </Link>
                )}

                {/* Regular User - Mobile Links */}
                {user.role !== 'admin' && (
                  <>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaBox className="w-5 h-5" />
                      <span>My Orders</span>
                    </Link>

                    <Link
                      to="/wishlist"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {wishlistLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      ) : (
                        <FaHeart className="w-5 h-5" />
                      )}
                      <span>Wishlist</span>
                      {!wishlistLoading && wishlist.length > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Admin User - Mobile Links */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaCog className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <div className="border-t border-gray-100 pt-3 mt-2">
                  <div className="px-4 py-2">
                    <p className="text-sm font-medium text-gray-900">Hello, {user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs font-medium text-emerald-600">
                      {user.role === 'admin' ? 'Administrator' : 'Customer'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors rounded-xl"
                  >
                    <FaSignOutAlt className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="border-t border-gray-100 pt-3 mt-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center space-x-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-all duration-200 rounded-xl border border-gray-200 mb-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white transition-all duration-200 rounded-xl shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;