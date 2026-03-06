import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
  return (
    <Link to="/" className="flex items-center space-x-3">

      <svg
        viewBox="0 0 200 200"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >

        <defs>
          <linearGradient id="oplugGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        <circle cx="100" cy="100" r="90" fill="url(#oplugGradient)" />

        <circle cx="100" cy="100" r="45" fill="white" />

        <rect x="92" y="20" width="16" height="40" rx="5" fill="white" />

        <rect x="60" y="60" width="20" height="60" rx="8" fill="white" />

        <rect x="120" y="60" width="20" height="60" rx="8" fill="white" />

      </svg>

      <span className="text-2xl font-black tracking-tight text-white">
        Oplug
      </span>

    </Link>
  );
};

export default Logo;