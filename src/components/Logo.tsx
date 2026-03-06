import React from "react";
import { Link } from "react-router-dom";

const Logo: React.FC<{ className?: string }> = ({
  className = "h-12 w-auto"
}) => {
  return (
    <Link to="/" className="flex items-center gap-3">

      <img
        src="https://image2url.com/r2/default/images/1772785147253-780bc3dc-c1f8-4a04-a1db-592b9a53c31d.png"
        alt="Oplug Logo"
        className={`${className} object-contain`}
      />

    </Link>
  );
};

export default Logo;