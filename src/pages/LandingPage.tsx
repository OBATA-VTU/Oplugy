import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  WalletIcon, UsersIcon, ArrowIcon
} from '../components/Icons';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-600 scroll-smooth">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-3xl shadow-2xl py-4 border-b border-gray-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-12">
            <a href="#services" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Our Services</a>
            <a href="#how-it-works" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">How it works</a>
            <Link to="/quick-purchase" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-gray-300">Login</Link>
          </div>
          <Link to="/login" className="md:hidden bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
            <UsersIcon />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-64 lg:pb-80 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          <div className="w-full lg:w-3/5 text-center lg:text-left animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="inline-flex items-center space-x-4 bg-white text-blue-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 border-2 border-blue-50 mx-auto lg:mx-0 shadow-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span>Fast & Automated Payments</span>
            </div>
            <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[1] lg:leading-[0.9] mb-12 tracking-tighter">
              Instant Data <br />
              <span className="text-blue-600 relative">
                Gateway.
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 0 100 5" stroke="#2563eb" strokeWidth="4" fill="none" /></svg>
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-500 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-relaxed">
              Experience Nigeria's premier VTU destination. Cheap prices, no delays, and instant delivery across all service providers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-8">
              <Link to="/signup" className="bg-blue-600 text-white px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-3 flex items-center justify-center space-x-4">
                <span>Join Oplug</span>
                <ArrowIcon />
              </Link>
              <Link to="/quick-purchase" className="bg-white border-4 border-gray-100 text-gray-900 px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black hover:border-blue-600 hover:shadow-2xl transition-all transform hover:-translate-y-3">
                Quick Checkout
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/5 flex justify-center animate-in fade-in zoom-in duration-1000">
             <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-blue-600 rounded-[4rem] lg:rounded-[6rem] blur-[120px] opacity-20"></div>
                <div className="relative group overflow-hidden rounded-[4rem] lg:rounded-[6rem] shadow-2xl border-8 border-white">
                  <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200" className="w-full h-auto transition-transform duration-700 group-hover:scale-110" alt="Oplug Experience" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>
                </div>
                <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[3rem] shadow-2xl z-20 hidden lg:block border border-gray-50 animate-bounce">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">System Status</p>
                   <p className="text-4xl font-black text-blue-600 tracking-tighter">Live & Optimal</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-24">
          <h2 className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Onboarding</h2>
          <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Seamlessly Connect</h3>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-16">
          <StepCard 
            number="01" 
            title="Create Identity" 
            desc="Sign up with Oplug in seconds. No complex verification required." 
            icon={<UsersIcon />}
          />
          <StepCard 
            number="02" 
            title="Secure Funding" 
            desc="Fund your wallet via multiple high-security payment nodes." 
            icon={<WalletIcon />}
          />
          <StepCard 
            number="03" 
            title="Instant Recharge" 
            desc="Trigger automated delivery for any digital service instantly." 
            icon={<BoltIcon />}
          />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-32 lg:py-64 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center mb-32 max-w-4xl mx-auto">
              <h2 className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Infrastructure</h2>
              <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none">Universal Digital <br /> Utility Hub.</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
              <ServiceCard 
                icon={<SignalIcon />} 
                title="Premium Data" 
                desc="Affordable data for MTN, Airtel, Glo, and 9mobile. SME and Gifting available." 
                img="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<PhoneIcon />} 
                title="Express Airtime" 
                desc="High-velocity recharges for your line. Support for all Nigerian networks." 
                img="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<BoltIcon />} 
                title="Power & Bills" 
                desc="Pay electricity bills for all Discos. Verified instantly upon payment." 
                img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<TvIcon />} 
                title="Cable TV Hub" 
                desc="Renew DStv, GOtv, and StarTimes subscriptions via our 24/7 nodes." 
                img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<UsersIcon />} 
                title="Earn Passive" 
                desc="Upgrade to Oplug Reseller and earn massive profit on every transaction." 
                img="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<WalletIcon />} 
                title="Vault Security" 
                desc="Encrypted wallet storage with automated 2-way verification protocols." 
                img="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800"
              />
           </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-48 lg:py-80 bg-gray-950 relative overflow-hidden text-center text-white">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <h2 className="text-6xl lg:text-[140px] font-black mb-16 tracking-tighter leading-[0.8]">Plug In <br /> Now.</h2>
          <p className="text-xl lg:text-3xl text-white/40 font-medium mb-20 max-w-3xl mx-auto">Create your free Oplug account today and start experiencing zero-latency VTU.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-10">
             <Link to="/signup" className="bg-blue-600 text-white px-16 lg:px-24 py-10 lg:py-12 rounded-[4rem] text-2xl lg:text-3xl font-black shadow-2xl shadow-blue-200 hover:bg-white hover:text-black transition-all transform hover:-translate-y-4">Join The Hub</Link>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </section>

      <Footer />
    </div>
  );
};

const StepCard = ({ number, title, desc, icon }: any) => (
  <div className="flex flex-col items-center text-center p-12 bg-gray-50 rounded-[4rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group">
    <div className="text-6xl font-black text-blue-600/10 mb-8 group-hover:text-blue-600/20 transition-colors">{number}</div>
    <div className="w-20 h-20 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
    <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
  </div>
);

const ServiceCard = ({ icon, title, desc, img }: any) => (
  <div className="bg-white rounded-[4rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-700 group h-full flex flex-col">
     <div className="h-64 overflow-hidden relative">
        <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-10 w-16 h-16 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:-translate-y-2">
           {icon}
        </div>
     </div>
     <div className="p-12 pt-8 flex-grow">
        <h4 className="text-3xl font-black text-gray-900 mb-5 tracking-tight">{title}</h4>
        <p className="text-gray-400 text-lg font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

export default LandingPage;