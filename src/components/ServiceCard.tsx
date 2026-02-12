
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
      className="bg-white rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 p-10 flex flex-col group relative overflow-hidden h-full"
    >
      <div className="relative z-10">
        <div className="text-blue-600 mb-8 w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-xl group-hover:shadow-blue-100">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">{description}</p>
        
        <div className="mt-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
          <span>Proceed Now</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </div>
      </div>
      
      {/* Decorative gradient on hover */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-3xl"></div>
    </Link>
  );
};

export default ServiceCard;
