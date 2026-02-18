
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  GamingIcon, ExchangeIcon,
  ArrowIcon, ShieldCheckIcon, WalletIcon
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
            <a href="#about" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">Infrastructure</a>
            <a href="#services" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">Ecosystem</a>
            <Link to="/quick-purchase" className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">Secure Access</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-72">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-24">
          <div className="lg:w-3/5 text-center lg:text-left">
            <div className="inline-flex items-center space-x-3 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-10 border border-blue-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span>Propelling Digital Utility</span>
            </div>
            <h1 className="text-6xl lg:text-[120px] font-black text-gray-900 leading-[0.82] mb-14 tracking-tighter">
              Instant. <br />
              Secure. <br />
              <span className="text-blue-600">Limitless.</span>
            </h1>
            <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-tight">
              Cheap Data, Automated Bills & Global Connectivity. Experience Nigeria's highest-speed VTU node.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
              <Link to="/signup" className="bg-blue-600 text-white px-14 py-8 rounded-[2.5rem] text-xl font-black shadow-2xl shadow-blue-300/50 hover:bg-black transition-all transform hover:-translate-y-2">
                Become a Plug
              </Link>
              <Link to="/quick-purchase" className="bg-white border-2 border-gray-100 text-gray-900 px-14 py-8 rounded-[2.5rem] text-xl font-black hover:border-blue-600 hover:shadow-xl transition-all transform hover:-translate-y-2">
                Guest Purchase
              </Link>
            </div>
          </div>
          <div className="lg:w-2/5">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-[5rem] blur-[80px] opacity-20 animate-pulse"></div>
                <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1000" className="relative rounded-[5rem] shadow-2xl border-8 border-white animate-float" alt="Mobile Services" />
                <div className="absolute -bottom-12 -left-12 bg-white p-10 rounded-[3.5rem] shadow-2xl border border-gray-50 flex items-center space-x-6">
                   <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center"><WalletIcon /></div>
                   <div>
                      <p className="text-gray-900 font-black text-2xl tracking-tighter">₦10B+</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Turnover</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/40 -z-10 rounded-l-[15rem]"></div>
      </section>

      {/* Trust & Stats */}
      <section className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-16 text-center">
          <StatItem value="99.9%" label="Engine Uptime" />
          <StatItem value="1.5s" label="Avg. Delivery" />
          <StatItem value="250k+" label="Signed Plugs" />
          <StatItem value="24/7" label="Support Sync" />
        </div>
      </section>

      {/* Ecosystem Grid */}
      <section id="services" className="py-48 bg-gray-50/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-10">
            <div className="max-w-3xl">
              <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8">The Ecosystem</h2>
              <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9]">Universal Digital Utility.</h3>
            </div>
            <Link to="/quick-purchase" className="group flex items-center space-x-6 bg-white px-12 py-7 rounded-[2rem] shadow-xl hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-xs">
              <span>Enter Guest Mode</span>
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard img="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800" icon={<SignalIcon />} title="Bulk Data Plans" desc="High-speed SME, Gifting & Corporate data. Verified delivery in 2 seconds." />
            <FeatureCard img="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800" icon={<PhoneIcon />} title="VTU Airtime" desc="Recharge any network instantly with 3% cashback on every transaction." />
            <FeatureCard img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800" icon={<BoltIcon />} title="Utility Gateway" desc="Generate electricity tokens for IKEDC, EKEDC, PHED & more. Zero downtime." />
            <FeatureCard img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800" icon={<TvIcon />} title="Cable Renewal" desc="Instant DStv, GOtv & StarTimes subscriptions. Keep the entertainment alive." />
            <FeatureCard img="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" icon={<GamingIcon />} title="Gaming Credits" desc="Top-up Free Fire, COD Mobile, and PUBG Mobile directly from your wallet." />
            <FeatureCard img="https://images.unsplash.com/photo-1556742521-9713bf2728be?auto=format&fit=crop&q=80&w=800" icon={<ExchangeIcon />} title="Liquidity Bridge" desc="Convert excess airtime into real cash in your bank account. Secure & Fast." />
          </div>
        </div>
      </section>

      {/* Infrastructure Section */}
      <section id="about" className="py-48 bg-gray-900 text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
               <h3 className="text-6xl lg:text-[80px] font-black tracking-tighter leading-[0.85] mb-12">Built for <br /> <span className="text-blue-500">Scale.</span></h3>
               <p className="text-xl text-white/40 font-medium mb-14 leading-relaxed max-w-xl">
                  We use advanced API routing and distributed cloud clusters to ensure your digital needs are met before your screen refreshes. Security is baked into every packet.
               </p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfrastructurePoint icon={<ShieldCheckIcon />} label="ISO 27001 Security" />
                  <InfrastructurePoint icon={<BoltIcon />} label="Real-time Synchronization" />
               </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-8">
               <div className="space-y-8">
                  <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-80 w-full object-cover shadow-2xl" alt="Tech" />
                  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-64 w-full object-cover shadow-2xl" alt="Server" />
               </div>
               <div className="space-y-8 mt-16">
                  <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-64 w-full object-cover shadow-2xl" alt="Team" />
                  <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] h-80 w-full object-cover shadow-2xl" alt="Hardware" />
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px] -z-0"></div>
      </section>

      {/* Quick Buy CTA */}
      <section className="py-40 bg-blue-600 relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl lg:text-[100px] font-black text-white tracking-tighter leading-none mb-16">In a rush? <br /> Use Guest Mode.</h2>
            <Link to="/quick-purchase" className="inline-block bg-white text-blue-600 px-20 py-10 rounded-[3rem] text-2xl font-black shadow-2xl hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-3">
               Quick Purchase Now
            </Link>
         </div>
         <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </section>

      <Footer />
    </div>
  );
};

const StatItem = ({ value, label }: any) => (
  <div>
     <h4 className="text-6xl font-black text-gray-900 mb-3 tracking-tighter">{value}</h4>
     <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">{label}</p>
  </div>
);

const FeatureCard = ({ img, icon, title, desc }: any) => (
  <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 hover:shadow-blue-100 transition-all group h-full flex flex-col">
    <div className="h-56 relative overflow-hidden">
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

const InfrastructurePoint = ({ icon, label }: any) => (
  <div className="flex items-center space-x-6 p-8 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-colors">
     <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">{icon}</div>
     <p className="font-black text-xs tracking-widest uppercase">{label}</p>
  </div>
);

export default LandingPage;
