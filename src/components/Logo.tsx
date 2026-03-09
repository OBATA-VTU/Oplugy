
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-10 w-auto' }) => {
  return (
    <Link to="/" className="flex items-center group focus:outline-none rounded-xl p-1 transition-all">
      <div className="relative mr-3">
        <svg
          className={className}
          viewBox="0 0 160 120"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Oplug Logo"
        >
          {/* The Wire 'O' - Main rounded part */}
          <path 
            d="M60 20C37.9086 20 20 37.9086 20 60C20 82.0914 37.9086 100 60 100C82.0914 100 100 82.0914 100 60" 
            stroke="#2563EB" 
            strokeWidth="10" 
            strokeLinecap="round" 
            fill="none"
            className="group-hover:stroke-blue-700 transition-colors duration-300"
          />
          
          {/* Wire moving across the text 'plug' */}
          <path 
            d="M100 60C100 60 110 60 120 60C135 60 145 50 145 35" 
            stroke="#2563EB" 
            strokeWidth="6" 
            strokeLinecap="round" 
            fill="none"
          />

          {/* Star at the end of the rope (positioned above where 'g' would be) */}
          <path 
            d="M145 20L148 25H154L149 28L151 34L145 31L139 34L141 28L136 25H142L145 20Z" 
            fill="#FBBF24" 
            className="animate-bounce"
          />
          
          {/* Inner Plug details in the O */}
          <rect x="48" y="45" width="4" height="10" rx="1" fill="#2563EB" opacity="0.4" />
          <rect x="68" y="45" width="4" height="10" rx="1" fill="#2563EB" opacity="0.4" />
        </svg>
      </div>
      
      <div className="flex flex-col relative">
        <div className="flex items-baseline">
          <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
            <span className="text-blue-600">O</span>plug
          </span>
        </div>
        <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mt-1">Digital Solutions</span>
      </div>
    </Link>
  );
};

export default Logo;
