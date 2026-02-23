// File: client/src/context/CartContext.jsx - FIXED
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// ✅ SIMPLE TOAST HELPER - FIXED
const showToast = (type, message) => {
  // Always dismiss previous toasts first
  toast.dismiss();

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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ FETCH FROM DATABASE AND CONVERT FIELDS
  useEffect(() => {
    const fetchProductsFromDB = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching products from database...');

        const apiUrl = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000/api`;
        const response = await fetch(`${apiUrl}/products`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 Raw API response:', data);

        let dbProducts = [];
        if (Array.isArray(data)) {
          dbProducts = data;
        } else if (data.products && Array.isArray(data.products)) {
          dbProducts = data.products;
        } else {
          console.error('Unexpected API format:', data);
          dbProducts = [];
        }

        console.log(`📊 Found ${dbProducts.length} products in database`);

        // ✅ CONVERT DATABASE FIELDS TO FRONTEND FORMAT
        const convertedProducts = dbProducts.map(dbProduct => {
          console.log('🔍 Processing product:', dbProduct);

          return {
            // Required fields
            id: dbProduct.id,
            name: dbProduct.name || 'Unnamed Product',

            // Price handling
            price: parseFloat(dbProduct.price) || 0,
            original_price: parseFloat(dbProduct.original_price) ||
              parseFloat(dbProduct.price) || 0,

            // Stock handling - multiple field names
            stock: dbProduct.stock ||
              dbProduct.stock_quantity ||
              dbProduct.quantity ||
              dbProduct.stockQuantity ||
              0,

            // Category handling
            category: dbProduct.category ||
              dbProduct.category_name ||
              `Category ${dbProduct.category_id || ''}`,

            // Images handling
            images: dbProduct.images ||
              (dbProduct.image_url ? [{ url: dbProduct.image_url }] :
                (dbProduct.image ? [{ url: dbProduct.image }] : [])),

            // Rating
            rating: parseFloat(dbProduct.rating) ||
              parseFloat(dbProduct.average_rating) ||
              0,

            review_count: dbProduct.review_count ||
              dbProduct.total_reviews ||
              dbProduct.reviewCount ||
              0,

            // Description
            description: dbProduct.description ||
              dbProduct.product_description ||
              'No description available',

            // Keep all original fields
            ...dbProduct
          };
        });

        console.log('✅ Converted products:', convertedProducts);
        setProducts(convertedProducts);

      } catch (error) {
        console.error('❌ Failed to fetch products:', error);
        // ✅ NO TOAST HERE - Let the components handle it
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsFromDB();
  }, []);

  // ✅ LOAD CART FROM LOCALSTORAGE
  useEffect(() => {
    if (!loading) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);

          const validCartItems = parsedCart.filter(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            return product && (product.stock > 0);
          });

          setCartItems(validCartItems);
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartItems([]);
        }
      }
    }
  }, [loading, products]);

  // ✅ SAVE CART TO LOCALSTORAGE
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  // ✅ ADD TO CART - FIXED: Only one toast
  const addToCart = (product, quantity = 1) => {
    if (!product || typeof product !== 'object') {
      showToast('error', 'Invalid product information');
      return;
    }

    const stock = product.stock || 0;

    if (stock <= 0) {
      showToast('error', `${product.name} is out of stock!`);
      return;
    }

    if (quantity > stock) {
      showToast('error', `Only ${stock} units available for ${product.name}`);
      return;
    }

    const cartItemId = product.selectedVariant ? `${product.id}-${product.selectedVariant.size}` : product.id;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => (item.cartItemId || item.id) === cartItemId);

      if (existingItem) {
        const newTotalQuantity = existingItem.quantity + quantity;

        if (newTotalQuantity > stock) {
          const available = stock - existingItem.quantity;
          if (available <= 0) {
            showToast('error', `${product.name} is now out of stock!`);
          } else {
            showToast('error', `Only ${available} more units available for ${product.name}`);
          }
          return prevItems;
        }

        const updatedItems = prevItems.map(item =>
          (item.cartItemId || item.id) === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );

        showToast('success', `Added ${product.name} to cart!`);
        return updatedItems;
      } else {
        showToast('success', `Added ${product.name} to cart!`);
        return [...prevItems, {
          ...product,
          cartItemId,
          quantity
        }];
      }
    });
  };

  // ✅ REMOVE FROM CART
  const removeFromCart = (cartItemId) => {
    const item = cartItems.find(item => (item.cartItemId || item.id) === cartItemId);
    if (item) {
      showToast('success', `Removed ${item.name} from cart`);
    }
    setCartItems(prevItems => prevItems.filter(item => (item.cartItemId || item.id) !== cartItemId));
  };

  // ✅ UPDATE QUANTITY
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const cartItem = cartItems.find(item => (item.cartItemId || item.id) === cartItemId);
    const product = products.find(p => p.id === (cartItem ? cartItem.id : cartItemId));
    if (!product) {
      showToast('error', 'Product not found');
      return;
    }

    const stock = product.stock || 0;
    if (quantity > stock) {
      showToast('error', `Only ${stock} units available for ${product.name}`);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
      )
    );

    // ✅ NO TOAST FOR QUANTITY UPDATE (can be annoying)
    // showToast('success', `Quantity updated to ${quantity}`);
  };

  // ✅ CLEAR CART
  const clearCart = () => {
    setCartItems([]);
    showToast('success', 'Cart cleared');
  };

  // ✅ CALCULATE TOTALS
  const getCartTotal = () => {
    return cartItems.reduce((total, item) =>
      total + ((item.price || 0) * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // ✅ PRODUCT FILTERING
  const getProductsByCategory = (categoryName) => {
    return products.filter(product =>
      product.category && product.category.toLowerCase().includes(categoryName.toLowerCase())
    );
  };

  const getAllProducts = () => {
    return products;
  };

  const getProductById = (id) => {
    return products.find(product => product.id === parseInt(id));
  };

  // ✅ OTHER FUNCTIONS (Keep your original)
  const getProductsBySubcategory = (subcategory) => {
    return products.filter(product => product.subcategory === subcategory);
  };

  const updateProduct = (productId, updatedData) => {
    setProducts(prev => prev.map(product =>
      product.id === productId ? { ...product, ...updatedData } : product
    ));
  };

  const addProduct = (newProduct) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (productId) => {
    setProducts(prev => prev.filter(product => product.id !== productId));
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const checkCartStock = () => {
    const issues = [];

    cartItems.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) {
        issues.push(`${cartItem.name}: Product not found`);
      } else {
        const stock = product.stock || 0;
        if (stock <= 0) {
          issues.push(`${product.name}: Out of stock`);
        } else if (stock < cartItem.quantity) {
          issues.push(`${product.name}: Only ${stock} available, but ${cartItem.quantity} in cart`);
        }
      }
    });

    return issues;
  };

  const validateCartForCheckout = () => {
    const stockIssues = checkCartStock();
    if (stockIssues.length > 0) {
      // Show only first error message
      if (stockIssues[0]) {
        showToast('error', stockIssues[0]);
      }
      return false;
    }
    return true;
  };

  const value = {
    // State
    cartItems,
    products,
    loading,

    // Cart Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,

    // Product Actions
    getProductsByCategory,
    getAllProducts,
    getProductById,
    getProductsBySubcategory,
    updateProduct,
    addProduct,
    deleteProduct,

    // Validation
    checkCartStock,
    validateCartForCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};