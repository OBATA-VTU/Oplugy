
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-20">
          <div className="col-span-1">
            <Logo />
            <p className="mt-8 text-gray-400 font-medium leading-relaxed max-w-sm">
              OBATA v2 is an independent high-velocity digital utility gateway. Built for speed, engineered for reliability.
            </p>
            <div className="flex space-x-6 mt-10">
              {['Twitter', 'Telegram', 'Support'].map(platform => (
                <a key={platform} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                  {platform}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8">Navigation</h4>
            <ul className="space-y-4">
              <li><a href="#services" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Core Ecosystem</a></li>
              <li><Link to="/pricing" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Global Tariffs</Link></li>
              <li><Link to="/login" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Secure Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8">Governance</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><span className="text-sm font-medium text-gray-400">+234 814 245 2729</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} OBATA DIGITAL SOLUTIONS. Independent Infrastructure.
          </p>
          <div className="flex items-center space-x-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Network Status: Live</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
