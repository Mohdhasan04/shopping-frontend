import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Icons
import { 
  FiFilter, FiX, FiSearch, FiStar, FiTrendingUp, 
  FiRefreshCw, FiChevronLeft, FiChevronRight, 
  FiPackage, FiGrid, FiList, FiChevronDown
} from 'react-icons/fi';
import { TbArrowsSort } from 'react-icons/tb';
import { IoOptionsOutline } from 'react-icons/io5';

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12
  });

  // Listen to URL parameter changes
  useEffect(() => {
    const categoryParam = searchParams.get('category') || '';
    const searchParam = searchParams.get('search') || '';
    const sortParam = searchParams.get('sort') || 'newest';
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';
    const pageParam = parseInt(searchParams.get('page')) || 1;

    setFilters({
      category: categoryParam,
      search: searchParam,
      sort: sortParam,
      minPrice: minPriceParam,
      maxPrice: maxPriceParam,
      page: pageParam,
      limit: 12
    });
  }, [searchParams]);

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://${window.location.hostname}:5000/api/products`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const productsList = data.products || data || [];
        
        // Add sample data if empty (for demo)
        if (productsList.length === 0) {
          const sampleProducts = generateSampleProducts();
          setAllProducts(sampleProducts);
        } else {
          setAllProducts(productsList);
        }
        
        setHasError(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setHasError(true);
        toast.error('Failed to load products. Showing demo data.');
        setAllProducts(generateSampleProducts());
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllProducts();
  }, []);

  // Generate sample products for demo
  const generateSampleProducts = () => {
    const categories = ['Face Care', 'Hair Care', 'Body Care', 'Special Care'];
    const brands = ['Loreal', 'Garnier', 'Nivea', 'Ponds', 'Dove', 'Vaseline'];
    
    return Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      name: `${brands[i % brands.length]} ${categories[i % 4]} Product ${i + 1}`,
      description: 'Premium quality skincare product for daily use',
      price: Math.floor(Math.random() * 2000) + 299,
      original_price: Math.floor(Math.random() * 2500) + 399,
      category_id: (i % 4) + 1,
      brand: brands[i % brands.length],
      rating: (Math.random() * 2 + 3).toFixed(1),
      review_count: Math.floor(Math.random() * 100),
      image: `https://images.unsplash.com/photo-${15720000 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`,
      in_stock: Math.random() > 0.1,
      is_featured: i < 6,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  // Local filtering function
  const filterProductsLocally = useCallback(() => {
    let result = [...allProducts];

    // Category filter
    if (filters.category) {
      const categoryMap = {
        'face-care': 1,
        'hair-care': 2,
        'body-care': 3,
        'special-care': 4
      };
      
      const categoryId = categoryMap[filters.category];
      if (categoryId) {
        result = result.filter(product => Number(product.category_id) === Number(categoryId));
      }
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }

    // Price filter
    const minPrice = parseFloat(filters.minPrice) || 0;
    const maxPrice = parseFloat(filters.maxPrice) || 10000;
    result = result.filter(product => 
      product.price >= minPrice && product.price <= maxPrice
    );

    // Sort
    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'price':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          return b.review_count - a.review_count;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    // Pagination
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    const paginatedResult = result.slice(startIndex, endIndex);

    setProducts(paginatedResult);
    setTotalProducts(result.length);
  }, [allProducts, filters]);

  // Apply filtering
  useEffect(() => {
    if (allProducts.length > 0) {
      filterProductsLocally();
    }
  }, [allProducts, filterProductsLocally]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.append(key, value);
      }
    });
    
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && key !== 'limit') {
        params.append(key, value);
      }
    });
    
    navigate(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      category: '',
      search: '',
      sort: 'newest',
      minPrice: '',
      maxPrice: '',
      page: 1,
      limit: 12
    });
    navigate('/products');
  };

  // Loading Skeleton
  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl w-64 animate-pulse mb-6"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          
          {/* Products Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-500/10 to-emerald-500/10 py-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Discover Amazing Products
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {hasError ? 
                'Showing demo products for preview' : 
                `${totalProducts} premium products waiting for you`
              }
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-14 pr-4 py-4 bg-white rounded-2xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-primary-500/20 focus:border-primary-500 shadow-lg transition-all duration-300"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-500 text-white px-6 py-2 rounded-xl hover:bg-primary-600 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-xl"
          >
            <FiFilter className="text-lg" />
            <span>Filters</span>
            {Object.values(filters).some(val => val && val !== 'newest') && (
              <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {Object.values(filters).filter(val => val && val !== 'newest').length}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            >
              <FiGrid className="text-xl" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            >
              <FiList className="text-xl" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block">
            <FilterSidebar 
              filters={filters}
              allProducts={allProducts}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              totalProducts={totalProducts}
            />
          </div>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsFilterOpen(false)}
              >
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-2xl overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Filters</h2>
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FiX className="text-xl" />
                      </button>
                    </div>
                    <FilterSidebar 
                      filters={filters}
                      allProducts={allProducts}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                      totalProducts={totalProducts}
                      isMobile
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Products Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-6 bg-white rounded-2xl shadow-sm border">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {totalProducts} Products
                </h2>
                <p className="text-gray-600 mt-1">
                  {filters.search && `Search: "${filters.search}"`}
                  {filters.category && ` • Category: ${filters.category.replace('-', ' ')}`}
                </p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="hidden lg:flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                  >
                    <FiGrid className="text-xl" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600'}`}
                  >
                    <FiList className="text-xl" />
                  </button>
                </div>
                
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange({ sort: e.target.value })}
                    className="appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  >
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Top Rated</option>
                    <option value="price">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-2xl shadow-sm border"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FiPackage className="text-5xl text-gray-400" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">No Products Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Try adjusting your search or filter criteria to find what you're looking for.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}`}>
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ProductCard 
                        product={product} 
                        layout={viewMode}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {totalProducts > filters.limit && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 pt-8 border-t border-gray-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600">
                        Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, totalProducts)} of {totalProducts}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(filters.page - 1)}
                          disabled={filters.page <= 1}
                          className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiChevronLeft />
                          <span>Previous</span>
                        </button>
                        
                        <div className="flex items-center space-x-1">
                          {[...Array(Math.ceil(totalProducts / filters.limit))].map((_, i) => {
                            const pageNum = i + 1;
                            const showPage = 
                              pageNum === 1 ||
                              pageNum === Math.ceil(totalProducts / filters.limit) ||
                              Math.abs(pageNum - filters.page) <= 1;
                            
                            if (!showPage) {
                              if (pageNum === filters.page - 2 || pageNum === filters.page + 2) {
                                return <span key={pageNum} className="px-3">...</span>;
                              }
                              return null;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-10 h-10 rounded-xl font-medium transition-colors ${
                                  filters.page === pageNum
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(filters.page + 1)}
                          disabled={filters.page >= Math.ceil(totalProducts / filters.limit)}
                          className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <span>Next</span>
                          <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Sidebar Component
const FilterSidebar = ({ filters, allProducts, onFilterChange, onClearFilters, totalProducts, isMobile = false }) => {
  const categories = [
    { value: '', label: 'All Categories', count: allProducts.length },
    { 
      value: 'face-care', 
      label: 'Face Care', 
      count: allProducts.filter(p => Number(p.category_id) === 1).length 
    },
    { 
      value: 'hair-care', 
      label: 'Hair Care', 
      count: allProducts.filter(p => Number(p.category_id) === 2).length 
    },
    { 
      value: 'body-care', 
      label: 'Body Care', 
      count: allProducts.filter(p => Number(p.category_id) === 3).length 
    },
    { 
      value: 'special-care', 
      label: 'Special Care', 
      count: allProducts.filter(p => Number(p.category_id) === 4).length 
    }
  ];

  const priceRanges = [
    { min: 0, max: 500, label: 'Under ₹500' },
    { min: 500, max: 1000, label: '₹500 - ₹1,000' },
    { min: 1000, max: 2000, label: '₹1,000 - ₹2,000' },
    { min: 2000, max: 5000, label: '₹2,000 - ₹5,000' },
    { min: 5000, max: 10000, label: '₹5,000+' }
  ];

  return (
    <div className={`${!isMobile ? 'sticky top-24' : ''}`}>
      <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <IoOptionsOutline className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Filters</h3>
              <p className="text-sm text-gray-500">{totalProducts} products</p>
            </div>
          </div>
          
          {(filters.category || filters.minPrice || filters.maxPrice) && (
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Category</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onFilterChange({ category: cat.value })}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                  filters.category === cat.value
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    cat.value === filters.category ? 'bg-primary-500' : 'bg-gray-300'
                  }`} />
                  <span>{cat.label}</span>
                </div>
                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Price Range</h4>
          <div className="space-y-2">
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => onFilterChange({ 
                  minPrice: range.min, 
                  maxPrice: range.max 
                })}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all ${
                  Number(filters.minPrice) === range.min && Number(filters.maxPrice) === range.max
                    ? 'bg-primary-50 text-primary-700 border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{range.label}</span>
                <FiTrendingUp className="text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(filters.category || filters.minPrice || filters.maxPrice) && (
          <div className="pt-6 border-t">
            <h4 className="font-semibold text-gray-900 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-sm">
                  {categories.find(c => c.value === filters.category)?.label}
                  <button
                    onClick={() => onFilterChange({ category: '' })}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center bg-primary-100 text-primary-700 px-3 py-1.5 rounded-lg text-sm">
                  ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '10,000+'}
                  <button
                    onClick={() => onFilterChange({ minPrice: '', maxPrice: '' })}
                    className="ml-2 hover:text-primary-900"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;