
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-32 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div className="col-span-1 md:col-span-1">
            <Logo />
            <p className="mt-8 text-gray-400 font-medium leading-relaxed">
              OBATA v2 is Nigeria's leading digital service platform. We redefine speed and reliability in the VTU ecosystem.
            </p>
            <div className="flex space-x-4 mt-10">
              {['Twitter', 'Instagram', 'Telegram'].map(platform => (
                <a key={platform} href={`https://${platform.toLowerCase()}.com/obata_v2`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">
                  {platform}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8">Navigation</h4>
            <ul className="space-y-5">
              <li><a href="#services" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Core Services</a></li>
              <li><a href="#gaming" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Gaming Hub</a></li>
              <li><Link to="/login" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">My Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8">Special Services</h4>
            <ul className="space-y-5">
              <li><Link to="/gaming" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Gaming Topups</Link></li>
              <li><Link to="/giftcards" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Buy Gift Cards</Link></li>
              <li><Link to="/airtime-to-cash" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Airtime to Cash</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-900 mb-8">Get In Touch</h4>
            <ul className="space-y-5">
              <li><span className="text-sm font-medium text-gray-400">support@obata.com</span></li>
              <li><span className="text-sm font-medium text-gray-400">+234 814 245 2729</span></li>
              <li><Link to="/privacy" className="text-sm font-medium text-gray-400 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-xs font-medium">
            &copy; {new Date().getFullYear()} OBATA DIGITAL SOLUTIONS. Crafted for speed.
          </p>
          <div className="flex items-center space-x-6">
             <div className="flex items-center space-x-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span>System Status: Optimal</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
