
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  ArrowIcon, ShieldCheckIcon, WalletIcon, UsersIcon
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
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-10">
            <a href="#about" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Infrastructure</a>
            <a href="#services" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Ecosystem</a>
            <Link to="/quick-purchase" className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">Secure Access</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - REFINED */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-72">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Nigeria's Fastest VTU Node</span>
            </div>
            <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[0.85] mb-14 tracking-tighter">
              Connectivity <br />
              Redefined. <br />
              <span className="text-blue-600">Instantly.</span>
            </h1>
            <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-tight">
              Cheap Data, Automated Bills & Global Connectivity. Experience the next generation of digital utility delivery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
              <Link to="/signup" className="bg-blue-600 text-white px-14 py-8 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-blue-300/50 hover:bg-black transition-all transform hover:-translate-y-2">
                Become a Member
              </Link>
              <Link to="/quick-purchase" className="bg-white border-2 border-gray-100 text-gray-900 px-14 py-8 rounded-[2.5rem] text-xl font-black hover:border-blue-600 hover:shadow-xl transition-all transform hover:-translate-y-2">
                Guest Purchase
              </Link>
            </div>
          </div>
          <div className="lg:w-2/5 relative">
             <div className="absolute inset-0 bg-blue-600 rounded-[5rem] blur-[80px] opacity-10"></div>
             <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000" className="relative rounded-[5rem] shadow-2xl border-8 border-white transform rotate-3 hover:rotate-0 transition-transform duration-700" alt="Mobile Services" />
             <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 animate-float">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">99.99%</p>
             </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-16 text-center relative z-10">
          <StatItem value="₦280" label="1GB Data From" />
          <StatItem value="1.2s" label="Avg Delivery" />
          <StatItem value="100k+" label="Signed Plugs" />
          <StatItem value="24/7" label="Support Sync" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="about" className="py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
             <div>
                <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Infrastructure</h2>
                <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-12">Automated Engineering.</h3>
                <p className="text-xl text-gray-400 font-medium mb-14 leading-relaxed">
                  Our system is built on a distributed cloud cluster, ensuring that your transactions are processed through the fastest available route in real-time. No delays, no manual intervention.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShieldCheckIcon /></div>
                      <span className="font-black text-xs uppercase tracking-widest">ISO 27001 Security</span>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><BoltIcon /></div>
                      <span className="font-black text-xs uppercase tracking-widest">Instant Fulfillment</span>
                   </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-8">
                <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-96 w-full object-cover shadow-2xl" alt="Infrastructure" />
                <div className="pt-20">
                  <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-96 w-full object-cover shadow-2xl" alt="Cloud" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* SERVICE BREAKDOWN */}
      <section id="services" className="py-48 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-32">
             <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8">Our Ecosystem</h2>
             <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter">Everything in one plug.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard img="https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?auto=format&fit=crop&q=80&w=800" icon={<SignalIcon />} title="Bulk Data Plans" desc="High-speed SME & Gifting data across all networks. Starting from ₦280." />
            <FeatureCard img="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800" icon={<PhoneIcon />} title="VTU Airtime" desc="Get instant recharge for MTN, Glo, Airtel and 9mobile with 3% cashback." />
            <FeatureCard img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800" icon={<BoltIcon />} title="Utility Gateway" desc="Generate electricity tokens for all DISCOs instantly. Zero downtime." />
            <FeatureCard img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800" icon={<TvIcon />} title="Cable Renewal" desc="DStv, GOtv, and StarTimes. Keep your entertainment live without stress." />
            <FeatureCard img="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" icon={<UsersIcon />} title="Reseller Program" desc="Build your own VTU business with our robust API and reseller dashboard." />
            <FeatureCard img="https://images.unsplash.com/photo-1556742521-9713bf2728be?auto=format&fit=crop&q=80&w=800" icon={<WalletIcon />} title="Wallet Funding" desc="Securely fund your account via Paystack or Bank Transfer instantly." />
          </div>
        </div>
      </section>

      {/* QUICK BUY CTA - REDESIGNED */}
      <section className="py-48 relative overflow-hidden bg-blue-600">
         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-6xl lg:text-[100px] font-black text-white tracking-tighter leading-none mb-16 italic">In a rush? <br /> Use Guest Mode.</h2>
            <p className="text-2xl text-blue-100 font-medium mb-16 max-w-2xl mx-auto">No account? No problem. Use our guest gateway to buy data and airtime in under 30 seconds.</p>
            <Link to="/quick-purchase" className="inline-block bg-white text-blue-600 px-24 py-10 rounded-[3rem] text-2xl font-black shadow-2xl hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-3">
               Quick Purchase Now
            </Link>
         </div>
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-[150px] -z-0"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-[100px] -z-0"></div>
      </section>

      <Footer />
    </div>
  );
};

const StatItem = ({ value, label }: any) => (
  <div>
     <h4 className="text-6xl font-black mb-3 tracking-tighter">{value}</h4>
     <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">{label}</p>
  </div>
);

const FeatureCard = ({ img, icon, title, desc }: any) => (
  <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 hover:shadow-blue-100 transition-all group h-full flex flex-col">
    <div className="h-64 relative overflow-hidden">
      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
      <div className="absolute inset-0 bg-blue-600/10"></div>
    </div>
    <div className="p-12 flex-grow flex flex-col">
       <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
       <h4 className="text-3xl font-black text-gray-900 mb-5 tracking-tight">{title}</h4>
       <p className="text-gray-400 font-medium leading-relaxed flex-grow text-lg">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
