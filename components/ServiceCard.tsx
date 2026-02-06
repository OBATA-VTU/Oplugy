import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  description: string;
  // Updated icon type from React.ReactNode to string
  icon: string; 
  to: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, to }) => {
  return (
    <Link
      to={to}
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1"
    >
      <div className="text-blue-600 mb-4 p-3 bg-blue-50 rounded-full">
        {/* Rendered SVG string using dangerouslySetInnerHTML */}
        <div dangerouslySetInnerHTML={{ __html: icon }} className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
};

export default ServiceCard;