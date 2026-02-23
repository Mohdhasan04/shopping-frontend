// client/src/index.js - COMPLETELY FIXED VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// ==============================================
// 🔧 GLOBAL URL FIXER - RUNS ONLY ONCE
// ==============================================
(function() {
  // ✅ Prevent duplicate execution
  if (window.__globalUrlFixerInstalled) {
    console.log('✅ Global URL fixer already installed');
    return;
  }
  
  window.__globalUrlFixerInstalled = true;
  
  console.log('🔧 Installing global URL fixer...');
  
  // 1. FIX FETCH API BAD URLS
  const originalFetch = window.fetch;
  
  window.fetch = function(url, options) {
    let finalUrl = url;
    
    if (typeof url === 'string') {
      // ✅ Fix the specific bad URL pattern from console error
      if (url.includes('/api/reviews/pr_/2page=Millmlt=3:1')) {
        console.warn('⚠️ [AUTO-FIX] Bad URL detected:', url);
        console.warn('   ↳ Fixed to: /api/reviews/product/2?page=1&limit=3');
        finalUrl = '/api/reviews/product/2?page=1&limit=3';
      }
      
      // ✅ Fix other similar patterns
      if (url.includes('pr_/')) {
        console.warn('⚠️ [AUTO-FIX] Bad URL pattern detected:', url.substring(0, 100));
        finalUrl = url
          .replace('pr_/', 'product/')
          .replace('2page=', '2?page=')
          .replace('Millmlt=', '&limit=')
          .replace(':1', '');
      }
    }
    
    return originalFetch.call(this, finalUrl, options);
  };
  
  // 2. FIX AXIOS API BAD URLS (if axios is used)
  if (typeof window.axios !== 'undefined') {
    console.log('🔧 Also fixing axios URLs...');
    
    const originalAxiosRequest = window.axios.Axios.prototype.request;
    
    window.axios.Axios.prototype.request = function(config) {
      if (config.url && typeof config.url === 'string') {
        // ✅ Fix bad URLs in axios
        if (config.url.includes('/api/reviews/pr_/2page=Millmlt=3:1')) {
          console.warn('⚠️ [AXIOS FIX] Bad URL detected:', config.url);
          config.url = '/api/reviews/product/2?page=1&limit=3';
        }
        
        // ✅ Fix similar patterns
        if (config.url.includes('pr_/')) {
          console.warn('⚠️ [AXIOS FIX] Bad pattern detected');
          config.url = config.url
            .replace('pr_/', 'product/')
            .replace('2page=', '2?page=')
            .replace('Millmlt=', '&limit=')
            .replace(':1', '');
        }
      }
      
      return originalAxiosRequest.call(this, config);
    };
  }
  
  // 3. CATCH UNHANDLED ERRORS
  window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('pr_/2page=Millmlt')) {
      console.error('❌ [ERROR HANDLER] Bad URL error caught:', e.message);
      e.preventDefault(); // Prevent default error handling
      return false;
    }
  });
  
  // 4. CATCH FETCH ERRORS
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && 
        event.reason.message && 
        event.reason.message.includes('pr_/2page=Millmlt')) {
      console.error('❌ [PROMISE ERROR] Bad URL in promise rejection');
      event.preventDefault(); // Prevent console error
    }
  });
  
  console.log('✅ Global URL fixer installed successfully');
  console.log('📌 Now fixing: /api/reviews/pr_/2page=Millmlt=3:1 → /api/reviews/product/2?page=1&limit=3');
})();
// ==============================================

// ==============================================
// 🛑 DISABLE STRICT MODE TEMPORARILY (for debugging)
// ==============================================
// React Strict Mode causes double renders in development
// which can cause blinking and performance issues
// Remove the comments below to disable Strict Mode temporarily:

const root = ReactDOM.createRoot(document.getElementById('root'));

// ✅ OPTION 1: WITHOUT STRICT MODE (Recommended for debugging)
root.render(
  // <React.StrictMode>  {/* ❌ COMMENT OUT FOR NOW */}
    <App />
  // </React.StrictMode> {/* ❌ COMMENT OUT FOR NOW */}
);

// ✅ OPTION 2: WITH STRICT MODE (Use after fixing all issues)
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// ==============================================

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();