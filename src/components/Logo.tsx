
import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <Link to="/" className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md">
      <svg
        className={className}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="OBATA Logo"
      >
        <rect width="100" height="100" rx="24" fill="#2563eb" />
        <path
          fill="white"
          d="M30 30h40v10H30zM30 45h40v10H30zM30 60h25v10H30z"
        />
        <circle cx="70" cy="65" r="8" fill="#fbbf24" />
      </svg>
       <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">OBATA <span className="text-blue-600">v2</span></span>
    </Link>
  );
};

export default Logo;
