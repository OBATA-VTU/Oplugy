
import React from 'react';
import { Link } from 'react-router-dom';

interface ComingSoonPageProps {
  title: string;
  description: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description }) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-[3rem] border border-gray-50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4">{title}</h1>
      <p className="text-xl text-gray-400 font-medium max-w-md mx-auto mb-10 leading-relaxed">
        {description}
      </p>
      <Link 
        to="/dashboard" 
        className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all transform hover:-translate-y-1"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default ComingSoonPage;
