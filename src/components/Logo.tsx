
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <Link to="/" className="flex items-center space-x-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl p-1 transition-all">
      <div className="relative">
        <svg
          className={className}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Oplug Logo"
        >
          {/* Main Body */}
          <rect width="100" height="100" rx="24" fill="#2563eb" className="group-hover:scale-105 transition-transform duration-300" />
          
          {/* Plug Prongs */}
          <rect x="38" y="28" width="6" height="15" rx="3" fill="white" />
          <rect x="56" y="28" width="6" height="15" rx="3" fill="white" />
          
          {/* Plug Body */}
          <path
            fill="white"
            d="M32 40h36v25c0 4-4 8-8 8H40c-4 0-8-4-8-8V40z"
          />
          
          {/* Accent Dot */}
          <circle cx="72" cy="72" r="8" fill="#fbbf24" />
        </svg>
      </div>
      
      <div className="flex flex-col">
        <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Oplug</span>
        <span className="text-[7px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mt-0.5">Instant VTU</span>
      </div>
    </Link>
  );
};

export default Logo;
