import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaTrash, FaEye, FaArrowLeft, FaTimes } from 'react-icons/fa';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (product) => {
    await addToCart(product, 1);
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all items from wishlist?')) {
      for (const item of wishlist) {
        await removeFromWishlist(item.id);
      }
    }
  };

  const totalValue = wishlist.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <FaHeart className="w-5 h-5 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
              </div>
              <p className="text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} • ₹{totalValue.toLocaleString('en-IN')}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link
                to="/products"
                className="px-5 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              {wishlist.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                >
                  <FaTrash className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8">
              Save your favorite products here to access them quickly later.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              <FaShoppingCart className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {wishlist.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Link to={`/product/${product.id}`}>
                      <img
                        src={product.image || `https://via.placeholder.com/400x400?text=${product.name}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:text-red-600 transition"
                      title="Remove"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>

                    {/* Discount Badge */}
                    {product.original_price > product.price && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                          {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 hover:text-green-600 transition">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{parseFloat(product.price || 0).toLocaleString('en-IN')}
                      </span>
                      {product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through ml-2">
                          ₹{parseFloat(product.original_price).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      <span className={`text-sm font-medium ${parseInt(product.stock) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseInt(product.stock) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={parseInt(product.stock) === 0}
                        className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                          parseInt(product.stock) > 0
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FaShoppingCart className="w-4 h-4" />
                        {parseInt(product.stock) > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                      
                      <Link
                        to={`/product/${product.id}`}
                        className="w-full py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{wishlist.length}</div>
                  <p className="text-gray-600">Items Saved</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    {wishlist.filter(item => parseFloat(item.rating) >= 4).length}
                  </div>
                  <p className="text-gray-600">Highly Rated</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 mb-1">
                    ₹{totalValue.toLocaleString('en-IN')}
                  </div>
                  <p className="text-gray-600">Total Value</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-6">
              <Link
                to="/products"
                className="text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                  {wishlist.length} items • ₹{totalValue.toLocaleString('en-IN')}
                </span>
                <Link
                  to="/cart"
                  className="px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition flex items-center gap-2"
                >
                  <FaShoppingCart className="w-4 h-4" />
                  Go to Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;