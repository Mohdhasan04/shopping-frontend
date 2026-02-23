// ✅ MOBILE FIXED VERSION
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { ReturnsProvider } from './context/ReturnsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Orders from './components/Orders';
import AdminDashboard from './pages/AdminDashboard';
import OrderConfirmation from './components/OrderConfirmation';
import OrderTracking from './components/OrderTracking';
import OrderItemTracking from './components/OrderItemTracking';
import Wishlist from './pages/Wishlist';
import UserReturns from './pages/UserReturns';
import Profile from './pages/Profile';
import OrderDetails from './pages/OrderDetails';
import InvoicePage from './pages/InvoicePage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ReviewsProvider>
            <ReturnsProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <div className="App min-h-screen bg-white flex flex-col">
                  <Header />
                  
                  {/* ✅ MOBILE FIX: MAIN CONTENT AREA */}
                  <main className="flex-grow w-full max-w-[100vw] overflow-x-hidden">
                    <div className="mx-auto w-full px-4 sm:px-6 md:px-8">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/returns" element={<UserReturns />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/order-confirmed/:orderId" element={<OrderConfirmation />} />
                        <Route path="/track-order/:orderId" element={<OrderTracking />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/order/:orderId" element={<OrderDetails />} />
                        <Route path="/invoice/:orderId" element={<InvoicePage />} />
                        <Route path="/track-order-item/:orderId/:itemId" element={<OrderItemTracking />} />
                      </Routes>
                    </div>
                  </main>
                  
                  <Footer />
                  
                  // ✅ SIMPLE TOAST FIX - All Devices Bottom Center
<Toaster 
  position="bottom-center"
  gutter={12}
  containerStyle={{
    bottom: '20px',
    left: '0',
    right: '0',
    margin: '0 auto',
    maxWidth: '500px',
    width: '100%',
    padding: '0 20px',
    zIndex: 9999,
  }}
  toastOptions={{
    duration: 3000,
    style: {
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '10px',
      padding: '14px 18px',
      textAlign: 'center',
      boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      margin: '8px auto',
      width: '100%',
      maxWidth: '500px',
    },
    success: {
      style: {
        background: '#10B981',
        color: 'white',
        borderLeft: '4px solid #059669',
      },
    },
    error: {
      style: {
        background: '#EF4444',
        color: 'white',
        borderLeft: '4px solid #DC2626',
      },
    },
  }}
/>
                </div>
              </Router>
            </ReturnsProvider>
          </ReviewsProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;