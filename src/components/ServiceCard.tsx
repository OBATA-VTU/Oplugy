
import React from 'react';
import { Link } from 'react-router-dom';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, to }) => {
  return (
    <Link
      to={to}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer transform hover:-translate-y-1 group"
    >
      <div className="text-blue-600 mb-4 p-4 bg-blue-100 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-200">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </Link>
  );
};

export default ServiceCard;
