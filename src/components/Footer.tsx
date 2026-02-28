import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Twitter, Send, MessageCircle, Mail, Phone, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050505] text-white pt-32 pb-16 border-t border-white/5 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 mb-32">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-10 text-white/40 font-medium leading-relaxed max-w-sm text-lg">
              The best platform for data, airtime, and bill payments in Nigeria. Built to be fast, easy, and reliable for everyone.
            </p>
            <div className="flex space-x-6 mt-12">
              <SocialLink href="https://twitter.com/obata_v2" icon={<Twitter size={20} />} />
              <SocialLink href="https://t.me/obata_v2" icon={<Send size={20} />} />
              <SocialLink href="https://wa.me/2348142452729" icon={<MessageCircle size={20} />} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-10">Our Services</h4>
            <ul className="space-y-5">
              <FooterLink to="/airtime">Buy Airtime</FooterLink>
              <FooterLink to="/data">Buy Data</FooterLink>
              <FooterLink to="/bills">Pay Bills</FooterLink>
              <FooterLink to="/cable">Cable TV</FooterLink>
              <FooterLink to="/quick-purchase">Quick Buy</FooterLink>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-10">About Us</h4>
            <ul className="space-y-5">
              <FooterLink to="/pricing">Our Prices</FooterLink>
              <FooterLink to="/referral">Refer and Earn</FooterLink>
              <FooterLink to="/support">Support</FooterLink>
              <FooterLink to="/api-docs">Developer API</FooterLink>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-500 mb-10">Contact Us</h4>
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Email Us</p>
                  <a href="mailto:support@obata.com" className="text-lg font-bold hover:text-blue-500 transition-colors">support@obata.com</a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/10">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Call Us</p>
                  <a href="tel:+2348142452729" className="text-lg font-bold hover:text-blue-500 transition-colors">+234 814 245 2729</a>
                </div>
              </div>

              <div className="pt-4">
                 <div className="inline-flex items-center space-x-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/80">System is working well</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} OBATA DIGITAL SOLUTIONS.
            </p>
            <div className="flex space-x-8">
              <Link to="/privacy" className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/20 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Terms of Use</Link>
            </div>
          </div>
          <p className="text-white/10 text-[8px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
            <Shield size={10} />
            Secure and safe system
          </p>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-blue-600/5 rounded-full blur-[150px] translate-y-1/2 translate-x-1/2"></div>
    </footer>
  );
};

const SocialLink = ({ href, icon }: { href: string, icon: React.ReactNode }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-blue-500 hover:bg-white/10 border border-white/10 transition-all transform hover:-translate-y-1"
  >
    {icon}
  </a>
);

const FooterLink = ({ to, children }: { to: string, children: React.ReactNode }) => (
  <li>
    <Link to={to} className="group flex items-center text-white/40 hover:text-white transition-all font-bold text-sm">
      <span className="w-0 group-hover:w-4 h-px bg-blue-500 mr-0 group-hover:mr-3 transition-all"></span>
      {children}
    </Link>
  </li>
);

export default Footer;
