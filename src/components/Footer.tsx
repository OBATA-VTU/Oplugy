
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-950 text-white pt-32 pb-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          <div className="col-span-1 lg:col-span-1">
            <Logo />
            <p className="mt-10 text-white/40 font-medium leading-relaxed max-w-sm text-lg">
              OBATA v2 is Nigeria's premier independent high-velocity digital utility gateway. Built for high-frequency users and digital entrepreneurs.
            </p>
            <div className="flex space-x-8 mt-12">
              <a href="https://twitter.com/obata_v2" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-blue-500 transition-colors">
                Twitter
              </a>
              <a href="https://t.me/obata_v2" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-blue-500 transition-colors">
                Telegram
              </a>
              <a href="https://wa.me/2348142452729" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-blue-500 transition-colors">
                WhatsApp
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-10">Ecosystem</h4>
            <ul className="space-y-5">
              <li><Link to="/airtime" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Express Airtime</Link></li>
              <li><Link to="/data" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Data Terminals</Link></li>
              <li><Link to="/bills" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Utility Hub</Link></li>
              <li><Link to="/cable" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Cable Renewals</Link></li>
              <li><Link to="/quick-purchase" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Guest Gateway</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-10">Governance</h4>
            <ul className="space-y-5">
              <li><Link to="/pricing" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Service Tariffs</Link></li>
              <li><Link to="/referral" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Refer and Earn</Link></li>
              <li><Link to="/support" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Help Center</Link></li>
              <li><Link to="/api-docs" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">API Gateway</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-10">Infrastructure</h4>
            <ul className="space-y-5">
              <li><Link to="/privacy" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Privacy Protocol</Link></li>
              <li><Link to="/terms" className="text-white/60 hover:text-white hover:translate-x-2 inline-block transition-all font-bold text-sm">Terms of Service</Link></li>
              <li><a href="tel:+2348142452729" className="text-white/60 hover:text-blue-500 font-black text-sm transition-all">+234 814 245 2729</a></li>
              <li className="pt-4">
                 <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/80">All Nodes Green</span>
                 </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
            &copy; {new Date().getFullYear()} OBATA DIGITAL SOLUTIONS. Independent Infrastructure Node.
          </p>
          <p className="text-white/10 text-[8px] font-black uppercase tracking-widest">
            Developed for Maximum Velocity. SSL v3 Encrypted.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
