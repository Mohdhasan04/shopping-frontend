import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

import {
  FaLeaf, FaFlask, FaPaw, FaRecycle,
  FaUserMd, FaShower, FaSpa, FaArrowRight,
  FaShoppingBag, FaStar, FaTruck, FaSync
} from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [faceCareProducts, setFaceCareProducts] = useState([]);
  const [hairCareProducts, setHairCareProducts] = useState([]);
  const [bodyCareProducts, setBodyCareProducts] = useState([]);

  // ✅ COMPLETE fetchProducts function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🏠 Fetching products...');

      const apiUrl = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`;
      const response = await axios.get(`${apiUrl}/products`);
      console.log('📦 API response:', response.data);

      let productsArray = [];

      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && data.products) {
        productsArray = data.products;
      } else if (data && data.data) {
        productsArray = data.data;
      } else {
        console.error('Unexpected format:', data);
        productsArray = [];
      }

      console.log(`📊 Raw products from API: ${productsArray.length}`);

      // 🚨 TEMPORARY: Ignore localStorage filter
      const activeProducts = productsArray.filter(p =>
        p.is_active !== 0 && p.is_active !== false
      );

      console.log(`✅ Active products after basic filter: ${activeProducts.length}`);

      if (activeProducts.length > 0) {
        console.log('🔍 First product:', activeProducts[0]);
      }

      // Set all products
      setAllProducts(activeProducts);

      // Process categories
      setFeaturedProducts(activeProducts.slice(0, Math.min(8, activeProducts.length)));

      // Face care = category_id = 1
      const faceProducts = activeProducts.filter(p => p.category_id === 1);
      setFaceCareProducts(faceProducts.slice(0, 4));

      // Hair care = category_id = 2
      const hairProducts = activeProducts.filter(p => p.category_id === 2);
      setHairCareProducts(hairProducts.slice(0, 4));

      // Body care = category_id = 3
      const bodyProducts = activeProducts.filter(p => p.category_id === 3);
      setBodyCareProducts(bodyProducts.slice(0, 4));

      console.log('📊 Final counts:', {
        all: activeProducts.length,
        featured: activeProducts.slice(0, 8).length,
        face: faceProducts.length,
        hair: hairProducts.length,
        body: bodyProducts.length
      });

    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setAllProducts([]);
      setFeaturedProducts([]);
      setFaceCareProducts([]);
      setHairCareProducts([]);
      setBodyCareProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    // ✅ EVENT LISTENER
    const handleProductUpdate = () => {
      console.log('🔄 Refreshing products...');
      fetchProducts();
    };

    window.addEventListener('productDeleted', handleProductUpdate);
    window.addEventListener('productUpdated', handleProductUpdate);

    return () => {
      window.removeEventListener('productDeleted', handleProductUpdate);
      window.removeEventListener('productUpdated', handleProductUpdate);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500"></div>
      </div>
    );
  }

  // Empty state
  if (allProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-20 text-center">
          <FaShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Products Available</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Products will appear here once added by admin.
          </p>
          <button
            onClick={fetchProducts}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 mx-auto"
          >
            <FaSync className="w-4 h-4" />
            Refresh Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Refresh Button */}
      {/* <button
        onClick={fetchProducts}
        className="fixed top-24 right-4 z-50 bg-white shadow-lg p-3 rounded-full hover:bg-green-50 border border-gray-200"
        title="Refresh"
      >
        <FaSync className="w-5 h-5 text-green-600" />
      </button> */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-green-600 font-semibold">
                <FaLeaf className="w-5 h-5" />
                <span>100% Organic & Natural</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-800">
                Mufi Organic
                <span className="text-green-600 block">Beauty Care</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Discover the power of nature with our certified organic skincare,
                hair care, and body care products. Pure ingredients, visible results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 text-center flex items-center justify-center gap-2"
                >
                  <FaShoppingBag className="w-5 h-5" />
                  <span>Shop All Products</span>
                </Link>
                <Link
                  to="/products/face-care"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 text-center flex items-center justify-center gap-2"
                >
                  <FaUserMd className="w-5 h-5" />
                  <span>Explore Face Care</span>
                </Link>
              </div>
            </div>
            <div>
              <img
                src="/webbanner.png"
                alt="Organic Beauty Products"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Organic Beauty?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-xl border border-gray-100">
              <FaLeaf className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">100% Organic</h3>
              <p className="text-gray-600 text-sm">Pure natural ingredients</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100">
              <FaFlask className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chemical Free</h3>
              <p className="text-gray-600 text-sm">No synthetic additives</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100">
              <FaPaw className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cruelty Free</h3>
              <p className="text-gray-600 text-sm">Never tested on animals</p>
            </div>
            <div className="text-center p-6 rounded-xl border border-gray-100">
              <FaRecycle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Eco Packaging</h3>
              <p className="text-gray-600 text-sm">Sustainable materials</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">Featured Products</h2>
                <p className="text-gray-600">
                  {featuredProducts.length} products • Updated just now
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={fetchProducts}
                  className="text-gray-500 hover:text-green-600 transition-colors duration-200"
                  title="Refresh"
                >
                  <FaSync className="w-5 h-5" />
                </button>
                <Link
                  to="/products"
                  className="text-green-600 hover:text-green-700 font-semibold text-lg flex items-center gap-2"
                >
                  <span>View All</span>
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Face Care */}
      {faceCareProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <FaUserMd className="w-8 h-8 text-green-600" />
                  <span>Face Care</span>
                </h2>
                <p className="text-gray-600">{faceCareProducts.length} organic skincare products</p>
              </div>
              <Link
                to="/products/face-care"
                className="text-green-600 hover:text-green-700 font-semibold text-lg flex items-center gap-2"
              >
                <span>View All</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {faceCareProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hair Care */}
      {hairCareProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <FaShower className="w-8 h-8 text-green-600" />
                  <span>Hair Care</span>
                </h2>
                <p className="text-gray-600">{hairCareProducts.length} natural hair solutions</p>
              </div>
              <Link
                to="/products/hair-care"
                className="text-green-600 hover:text-green-700 font-semibold text-lg flex items-center gap-2"
              >
                <span>View All</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hairCareProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Body Care */}
      {bodyCareProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <FaSpa className="w-8 h-8 text-green-600" />
                  <span>Body Care</span>
                </h2>
                <p className="text-gray-600">{bodyCareProducts.length} nourishing body products</p>
              </div>
              <Link
                to="/products/body-care"
                className="text-green-600 hover:text-green-700 font-semibold text-lg flex items-center gap-2"
              >
                <span>View All</span>
                <FaArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bodyCareProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <FaTruck className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Free Shipping</p>
              <p className="text-sm text-gray-600">Orders over ₹299</p>
            </div>
            <div className="text-center">
              <FaStar className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Premium Quality</p>
              <p className="text-sm text-gray-600">Certified Organic</p>
            </div>
            <div className="text-center">
              <GiLotusFlower className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Ayurvedic</p>
              <p className="text-sm text-gray-600">Traditional Formulas</p>
            </div>
            <div className="text-center">
              <FaRecycle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <p className="font-semibold text-gray-800">Eco Friendly</p>
              <p className="text-sm text-gray-600">Sustainable Packaging</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;