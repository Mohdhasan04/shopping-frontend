import React from 'react';
import { Link } from 'react-router-dom';
// Import React Icons
import {
  FaShoppingBag, FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaLeaf,
  FaTruck, FaShieldAlt, FaHeadset, FaCreditCard, FaRecycle
} from 'react-icons/fa';
import { MdLocalOffer } from 'react-icons/md';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <FaLeaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Organic Beauty
                </h2>
                <p className="text-sm text-gray-400">Pure & Natural Products</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md leading-relaxed">
              Discover the power of nature with our certified organic skincare, 
              hair care, and body care products. Pure ingredients, visible results, 
              and sustainable beauty for conscious consumers.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-8">
              <a href="#" className="p-2.5 bg-gray-800 hover:bg-emerald-600 rounded-lg transition-all duration-300 group" aria-label="Facebook">
                <FaFacebook className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2.5 bg-gray-800 hover:bg-emerald-600 rounded-lg transition-all duration-300 group" aria-label="Twitter">
                <FaTwitter className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2.5 bg-gray-800 hover:bg-emerald-600 rounded-lg transition-all duration-300 group" aria-label="Instagram">
                <FaInstagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="p-2.5 bg-gray-800 hover:bg-emerald-600 rounded-lg transition-all duration-300 group" aria-label="YouTube">
                <FaYoutube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              </a>
            </div>

            {/* Newsletter */}
            <div className="bg-gray-800/50 p-4 rounded-xl">
              <h4 className="font-semibold mb-2 text-gray-200">Stay Updated</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-r-lg font-medium transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 flex items-center gap-2">
              <FaShoppingBag className="w-5 h-5 text-emerald-400" />
              Shop
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>All Products</span>
                </Link>
              </li>
              <li>
                <Link to="/products/face-care" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Face Care</span>
                </Link>
              </li>
              <li>
                <Link to="/products/hair-care" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Hair Care</span>
                </Link>
              </li>
              <li>
                <Link to="/products/body-care" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Body Care</span>
                </Link>
              </li>
              <li>
                <Link to="/products/special-care" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Special Care</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 flex items-center gap-2">
              <FaHeadset className="w-5 h-5 text-emerald-400" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link to="/faq" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <FaTruck className="w-4 h-4 text-gray-500" />
                  <span>Shipping Info</span>
                </Link>
              </li>
              <li>
                <Link to="/returns" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <FaRecycle className="w-4 h-4 text-gray-500" />
                  <span>Return Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="flex items-center gap-2 text-gray-300 hover:text-emerald-400 transition-colors group">
                  <FaShieldAlt className="w-4 h-4 text-gray-500" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-700 flex items-center gap-2">
              <FaPhone className="w-5 h-5 text-emerald-400" />
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">
                  123 Organic Street,<br />
                  Green City, EC 12345
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">support@organicbeauty.com</span>
              </li>
              <li className="flex items-center gap-3">
                <FaClock className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-gray-300">Mon-Fri: 9AM-6PM</span>
              </li>
            </ul>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold mb-3 text-gray-400">We Accept</h4>
              <div className="flex space-x-2">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <FaCreditCard className="w-5 h-5 text-gray-400" />
                </div>
                <div className="p-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-bold text-gray-400">VISA</span>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-bold text-gray-400">MC</span>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg">
                  <span className="text-xs font-bold text-gray-400">PP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 py-6 border-t border-gray-700">
          <div className="flex items-center gap-3">
            <FaTruck className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="font-semibold">Free Shipping</p>
              <p className="text-sm text-gray-400">On orders over ₹299</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaRecycle className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="font-semibold">Easy Returns</p>
              <p className="text-sm text-gray-400">30-day return policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaShieldAlt className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="font-semibold">Secure Payment</p>
              <p className="text-sm text-gray-400">100% secure transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MdLocalOffer className="w-8 h-8 text-emerald-400" />
            <div>
              <p className="font-semibold">Best Price</p>
              <p className="text-sm text-gray-400">Price match guarantee</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              © {currentYear} Organic Beauty. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Certified Organic • Cruelty Free • Eco-Friendly Packaging
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;