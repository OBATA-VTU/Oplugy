import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => {
  return (
    <Link to="/" className="flex items-center space-x-3">
      <svg
        viewBox="0 0 120 120"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="120" height="120" rx="28" fill="#2563eb" />

        {/* Power Circle */}
        <circle cx="60" cy="60" r="28" fill="none" stroke="white" strokeWidth="8" />

        {/* Power Line */}
        <rect x="56" y="25" width="8" height="30" fill="white" />

        {/* Lightning */}
        <path
          d="M65 60 L50 85 L65 85 L55 105"
          stroke="#facc15"
          strokeWidth="6"
          fill="none"
        />
      </svg>

      <span className="text-2xl font-black text-white tracking-tight uppercase">
        Oplug
      </span>
    </Link>
  );
};

export default Logo;