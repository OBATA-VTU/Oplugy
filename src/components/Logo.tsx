import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-10 w-auto' }) => {
  return (
    <div className="flex items-center space-x-2">
      <svg
        className={className}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Oplug Logo"
      >
        <path
          fill="#2563eb"
          d="M50,5 A45,45 0 1,1 5,50 A45,45 0 0,1 50,5 M50,15 A35,35 0 1,0 85,50 A35,35 0 0,0 50,15"
        />
        <rect fill="white" x="35" y="30" width="10" height="25" rx="3" />
        <rect fill="white" x="55" y="30" width="10" height="25" rx="3" />
        <rect fill="white" x="45" y="60" width="10" height="15" rx="3" />
      </svg>
       <span className="text-2xl font-bold text-blue-700">Oplug</span>
    </div>
  );
};

export default Logo;
