
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1 transition-all">
      <div className="relative">
        <svg
          className={className}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Oplug Logo"
        >
          {/* Main Body */}
          <rect width="100" height="100" rx="28" fill="#2563eb" className="group-hover:rotate-6 transition-transform duration-500" />
          
          {/* Plug Prongs */}
          <rect x="35" y="25" width="8" height="20" rx="4" fill="white" />
          <rect x="57" y="25" width="8" height="20" rx="4" fill="white" />
          
          {/* Plug Body */}
          <path
            fill="white"
            d="M30 40h40v30c0 5-5 10-10 10H40c-5 0-10-5-10-10V40z"
          />
          
          {/* Accent Dot */}
          <circle cx="70" cy="70" r="10" fill="#fbbf24" className="animate-pulse" />
        </svg>
        
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Oplug</span>
        <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-1">Digital Services</span>
      </div>
    </Link>
  );
};

export default Logo;
