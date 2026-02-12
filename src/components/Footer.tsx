import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-6 text-gray-500 leading-relaxed">
              Oplug is Africa's fastest-growing VTU platform. We provide seamless digital payment solutions for airtime, data, and bills.
            </p>
            <div className="flex space-x-4 mt-8">
              <a href="https://twitter.com/oplugvtu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="https://instagram.com/oplugvtu" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/#features" className="text-gray-500 hover:text-blue-600">Features</Link></li>
              <li><Link to="/#how-it-works" className="text-gray-500 hover:text-blue-600">How It Works</Link></li>
              <li><Link to="/login" className="text-gray-500 hover:text-blue-600">User Login</Link></li>
              <li><Link to="/signup" className="text-gray-500 hover:text-blue-600">Join Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Services</h4>
            <ul className="space-y-4">
              <li><Link to="/airtime" className="text-gray-500 hover:text-blue-600">Buy Airtime</Link></li>
              <li><Link to="/data" className="text-gray-500 hover:text-blue-600">Data Subscriptions</Link></li>
              <li><Link to="/bills" className="text-gray-500 hover:text-blue-600">Electricity Bills</Link></li>
              <li><Link to="/cable" className="text-gray-500 hover:text-blue-600">Cable TV</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Support & Legal</h4>
            <ul className="space-y-4">
              <li><Link to="/terms" className="text-gray-500 hover:text-blue-600">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-500 hover:text-blue-600">Privacy Policy</Link></li>
              <li><span className="text-gray-500">support@oplug.com</span></li>
              <li><span className="text-gray-500">+234 814 245 2729</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Oplug VTU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;