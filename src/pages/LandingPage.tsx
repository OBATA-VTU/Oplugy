
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  ShieldCheckIcon, WalletIcon, UsersIcon
} from '../components/Icons';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-600">
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-2xl shadow-xl py-3 border-b border-gray-100' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-10">
            <a href="#about" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Infrastructure</a>
            <a href="#services" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Ecosystem</a>
            <Link to="/quick-purchase" className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">Secure Portal</Link>
          </div>
          <Link to="/login" className="md:hidden bg-blue-600 text-white p-3 rounded-xl shadow-lg">
            <UsersIcon />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pt-64 lg:pb-72">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <div className="w-full lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-blue-100 mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Leading Digital Solutions Hub</span>
            </div>
            <h1 className="text-5xl lg:text-[110px] font-black text-gray-900 leading-[1.1] lg:leading-[0.85] mb-10 tracking-tighter">
              Instant. <br />
              Secure. <br />
              <span className="text-blue-600">OBATA v2.</span>
            </h1>
            <p className="text-lg lg:text-3xl text-gray-400 mb-12 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-relaxed">
              Experience Nigeria's most robust independent gateway for data, airtime, and utility renewals. Automated for high-velocity users.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5">
              <Link to="/signup" className="bg-blue-600 text-white px-10 lg:px-14 py-6 lg:py-8 rounded-[2rem] lg:rounded-[2.5rem] text-lg lg:text-xl font-black shadow-2xl shadow-blue-200/50 hover:bg-black transition-all transform hover:-translate-y-2">
                Create Free Account
              </Link>
              <Link to="/quick-purchase" className="bg-white border-2 border-gray-100 text-gray-900 px-10 lg:px-14 py-6 lg:py-8 rounded-[2rem] lg:rounded-[2.5rem] text-lg lg:text-xl font-black hover:border-blue-600 hover:shadow-xl transition-all transform hover:-translate-y-2">
                Guest Checkout
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/5 flex justify-center">
             <div className="relative w-full max-w-sm lg:max-w-none">
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] lg:rounded-[5rem] blur-[80px] opacity-20"></div>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000" className="relative rounded-[3rem] lg:rounded-[5rem] shadow-2xl border-4 lg:border-8 border-white animate-float w-full h-auto" alt="OBATA Digital Ecosystem" />
             </div>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-gray-900 py-16 lg:py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <Stat value="100k+" label="Active Nodes" />
          <Stat value="99.9%" label="Uptime Record" />
          <Stat value="2s" label="Avg Delivery" />
          <Stat value="24/7" label="Human Support" />
        </div>
      </section>

      {/* WHY US - REDEFINED AS INFRASTRUCTURE */}
      <section id="about" className="py-24 lg:py-48 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
              <div>
                 <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Our Infrastructure</h2>
                 <h3 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-10">Proprietary <br /><span className="text-blue-600">Technology.</span></h3>
                 <p className="text-lg lg:text-xl text-gray-400 font-medium mb-12 leading-relaxed">
                   We don't just resell; we've built a custom terminal designed for maximum redundancy and speed. OBATA v2 operates independently to ensure your transactions never fail.
                 </p>
                 <div className="space-y-6">
                    <Benefit icon={<ShieldCheckIcon />} title="ISO Security" desc="Bank-grade encryption for all financial movements." />
                    <Benefit icon={<BoltIcon />} title="Direct Gateway" desc="Immediate fulfillment without third-party delay." />
                    <Benefit icon={<WalletIcon />} title="Smart Liquidity" desc="Automated funding via secure bank-integrated nodes." />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4 lg:gap-8">
                 <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem] lg:rounded-[3.5rem] h-64 lg:h-[30rem] w-full object-cover shadow-2xl" alt="Innovation" />
                 <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem] lg:rounded-[3.5rem] h-64 lg:h-[30rem] w-full object-cover shadow-2xl mt-12 lg:mt-24" alt="Reliability" />
              </div>
           </div>
        </div>
      </section>

      {/* SERVICES ECOSYSTEM */}
      <section id="services" className="py-24 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 lg:mb-32">
             <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">The Ecosystem</h2>
             <h3 className="text-4xl lg:text-8xl font-black text-gray-900 tracking-tighter">Everything in one plug.</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <ServiceCard icon={<SignalIcon />} title="High-Speed Data" desc="MTN, Airtel, Glo, & 9mobile SME, Gifting & CG. Validity displayed on every plan." />
            <ServiceCard icon={<PhoneIcon />} title="Express Airtime" desc="Instant recharge for all networks with exclusive member discounts." />
            <ServiceCard icon={<BoltIcon />} title="Power Hub" desc="Instant electricity tokens for all DISCOs. Prepaid and Postpaid verified." />
            <ServiceCard icon={<TvIcon />} title="Premium Cable" desc="DStv, GOtv, and StarTimes. Keep your entertainment live without stress." />
            <ServiceCard icon={<UsersIcon />} title="Partner API" desc="Independent merchants can integrate our robust API for their apps." />
            <ServiceCard icon={<WalletIcon />} title="Automated Wallet" desc="Multiple ways to fund your account with instant reflection." />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 lg:py-56 bg-blue-600 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl lg:text-[100px] font-black mb-12 tracking-tighter leading-[0.9]">Ready to scale? <br /> Join OBATA today.</h2>
          <p className="text-xl lg:text-2xl text-blue-100 font-medium mb-16 max-w-2xl mx-auto">Stop worrying about network downtime. Trust the platform built for reliability.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
             <Link to="/signup" className="bg-white text-blue-600 px-12 py-7 rounded-3xl text-xl font-black shadow-2xl hover:bg-black hover:text-white transition-all transform hover:-translate-y-2">Get Started Now</Link>
             <Link to="/quick-purchase" className="bg-blue-700 text-white px-12 py-7 rounded-3xl text-xl font-black hover:bg-white hover:text-blue-600 transition-all border border-blue-500">Guest Gateway</Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px]"></div>
      </section>

      <Footer />
    </div>
  );
};

const Stat = ({ value, label }: any) => (
  <div>
    <p className="text-4xl lg:text-6xl font-black tracking-tighter mb-2">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{label}</p>
  </div>
);

const Benefit = ({ icon, title, desc }: any) => (
  <div className="flex items-start space-x-5 lg:space-x-6">
     <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">{icon}</div>
     <div>
        <h4 className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight mb-2">{title}</h4>
        <p className="text-gray-400 text-sm lg:text-base leading-relaxed">{desc}</p>
     </div>
  </div>
);

const ServiceCard = ({ icon, title, desc }: any) => (
  <div className="p-10 lg:p-12 rounded-[3rem] lg:rounded-[4rem] bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm hover:shadow-2xl group h-full">
     <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
     <h4 className="text-2xl lg:text-3xl font-black text-gray-900 mb-5 tracking-tight leading-none">{title}</h4>
     <p className="text-gray-400 text-sm lg:text-lg font-medium leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
