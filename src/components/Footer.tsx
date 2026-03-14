import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { 
  Twitter, Mail, Phone, Shield,
  Facebook, Instagram
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-emerald-950 text-white pt-20 pb-10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Logo />
            <p className="text-emerald-200/60 leading-relaxed max-w-sm text-sm">
              Oplug is Nigeria's most reliable VTU platform for Airtime, Data, Cable TV, and Electricity bill payments. Fast, secure, and automated.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={<Twitter size={18} />} />
              <SocialLink href="#" icon={<Facebook size={18} />} />
              <SocialLink href="#" icon={<Instagram size={18} />} />
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-8 text-emerald-400">Quick Links</h4>
            <ul className="space-y-4">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/quick-purchase">Quick Buy</FooterLink>
              <FooterLink to="/faq">FAQs</FooterLink>
              <FooterLink to="/support">Support</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-emerald-400">Services</h4>
            <ul className="space-y-4">
              <FooterLink to="/airtime">Buy Airtime</FooterLink>
              <FooterLink to="/data">Buy Data</FooterLink>
              <FooterLink to="/bills">Electricity Bills</FooterLink>
              <FooterLink to="/cable">Cable TV</FooterLink>
              <FooterLink to="/api-docs">Developer API</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-8 text-emerald-400">Contact Info</h4>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Mail size={18} className="text-emerald-400 mt-1" />
                <div>
                  <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Email Address</p>
                  <a href="mailto:support@oplug.com" className="hover:text-emerald-400 transition-colors">support@oplug.com</a>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone size={18} className="text-emerald-400 mt-1" />
                <div>
                  <p className="text-xs text-emerald-500 uppercase font-bold mb-1">Phone Number</p>
                  <a href="tel:+2348142452729" className="hover:text-emerald-400 transition-colors">+234 814 245 2729</a>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-emerald-200/40 bg-emerald-900/50 p-3 rounded-lg">
                <Shield size={14} className="text-emerald-500" />
                <span>SSL Secured & Verified</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-emerald-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-emerald-200/40 text-sm">
            &copy; {new Date().getFullYear()} Oplug Digital Solutions. All Rights Reserved.
          </p>
          <div className="flex space-x-6 text-sm text-emerald-200/40">
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
    className="w-10 h-10 bg-emerald-900 rounded-lg flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-emerald-200/60 hover:text-emerald-400 transition-colors text-sm font-medium">
      {children}
    </Link>
  </li>
);

export default Footer;
