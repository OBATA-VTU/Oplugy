import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Twitter, Send, MessageCircle, Mail, Phone, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo />
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Oplug is Nigeria's most reliable VTU platform for Airtime, Data, Cable TV, and Electricity bill payments. Fast, secure, and automated.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter size={18} />} />
              <SocialLink href="#" icon={<Send size={18} />} />
              <SocialLink href="#" icon={<MessageCircle size={18} />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-8 text-blue-400">Quick Links</h4>
            <ul className="space-y-4">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/quick-purchase">Quick Buy</FooterLink>
              <FooterLink to="/faq">FAQs</FooterLink>
              <FooterLink to="/support">Support</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-blue-400">Services</h4>
            <ul className="space-y-4">
              <FooterLink to="/airtime">Buy Airtime</FooterLink>
              <FooterLink to="/data">Buy Data</FooterLink>
              <FooterLink to="/bills">Electricity Bills</FooterLink>
              <FooterLink to="/cable">Cable TV</FooterLink>
              <FooterLink to="/api-docs">Developer API</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-blue-400">Contact Info</h4>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-blue-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Email Address</p>
                  <a href="mailto:support@oplug.com" className="hover:text-blue-400 transition-colors">support@oplug.com</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-blue-400 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Phone Number</p>
                  <a href="tel:+2348142452729" className="hover:text-blue-400 transition-colors">+234 814 245 2729</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-800 p-3 rounded-lg">
                <Shield size={14} className="text-green-500" />
                <span>SSL Secured & Verified</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Oplug Digital Solutions. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <a 
    href={href} 
    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-gray-400 hover:text-blue-400 transition-colors text-sm font-medium">
      {children}
    </Link>
  </li>
);

export default Footer;
