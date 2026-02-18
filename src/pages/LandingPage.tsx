
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  MenuIcon, GamingIcon, GiftIcon, ExchangeIcon,
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
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-10">
            <a href="#about" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">About</a>
            <a href="#services" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">Services</a>
            <Link to="/quick-purchase" className="text-[11px] font-black uppercase tracking-widest text-blue-600 border-2 border-blue-600 px-5 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Log In</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-64">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-3/5 text-center lg:text-left">
            <span className="inline-block bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-100">
              ⚡ Instant Digital Infrastructure
            </span>
            <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[0.85] mb-12 tracking-tighter">
              Digital Services <br />
              <span className="text-blue-600">Reimagined.</span>
            </h1>
            <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-tight">
              Cheap Data, Instant Airtime, Automated Bill Payments & Gaming Top-ups. Experience Nigeria's fastest VTU node.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
              <Link to="/signup" className="bg-blue-600 text-white px-12 py-7 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all">
                Join OBATA v2
              </Link>
              <Link to="/quick-purchase" className="bg-white border-2 border-gray-100 text-gray-900 px-12 py-7 rounded-[2rem] text-xl font-black hover:border-blue-600 transition-all">
                Buy without Login
              </Link>
            </div>
          </div>
          <div className="lg:w-2/5">
             <div className="relative animate-float">
                <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=800" className="rounded-[4rem] shadow-2xl border-8 border-white" alt="Mobile Services" />
                <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 flex items-center space-x-5">
                   <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><WalletIcon /></div>
                   <div>
                      <p className="text-gray-900 font-black tracking-tight">₦2.5M+</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Processed Today</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/30 -z-10 rounded-l-[10rem]"></div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          <div>
             <h4 className="text-5xl font-black text-gray-900 mb-2">99.9%</h4>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Uptime Guarantee</p>
          </div>
          <div>
             <h4 className="text-5xl font-black text-gray-900 mb-2">2s</h4>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Average Delivery</p>
          </div>
          <div>
             <h4 className="text-5xl font-black text-gray-900 mb-2">100k+</h4>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Plugs</p>
          </div>
          <div>
             <h4 className="text-5xl font-black text-gray-900 mb-2">24/7</h4>
             <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Expert Support</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="services" className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10">
            <div className="max-w-2xl">
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Our Ecosystem</h2>
              <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Everything you need for your digital life.</h3>
            </div>
            <Link to="/quick-purchase" className="group flex items-center space-x-4 bg-white px-10 py-6 rounded-3xl shadow-xl hover:bg-blue-600 hover:text-white transition-all font-black uppercase tracking-widest text-xs">
              <span>Explore All Services</span>
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard img="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800" icon={<SignalIcon />} title="Data Bundles" desc="Cheap SME, Gifting & Corporate data for all networks. Prices from ₦150/GB." />
            <FeatureCard img="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800" icon={<PhoneIcon />} title="Airtime Recharge" desc="Automated top-up with 3% cashback on every recharge. Instant processing." />
            <FeatureCard img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800" icon={<BoltIcon />} title="Utility Bills" desc="Pay electricity bills and generate tokens instantly. IKEDC, EKEDC, PHED & more." />
            <FeatureCard img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800" icon={<TvIcon />} title="Cable TV" desc="Renew GOtv, DStv & StarTimes without leaving your bed. Zero transaction fee." />
            <FeatureCard img="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800" icon={<GamingIcon />} title="Gaming Hub" desc="Free Fire Diamonds, COD Points & PUBG Credits. Game harder, pay easier." />
            <FeatureCard img="https://images.unsplash.com/photo-1556742521-9713bf2728be?auto=format&fit=crop&q=80&w=800" icon={<ExchangeIcon />} title="Airtime-to-Cash" desc="Convert excess airtime to bank alert within 5 minutes. Secure & reliable." />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="about" className="py-48 bg-gray-900 text-white relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
               <h3 className="text-6xl font-black tracking-tighter leading-none mb-12">Built for the <br /> <span className="text-blue-500">Fast Generation.</span></h3>
               <p className="text-xl text-white/40 font-medium mb-12 leading-relaxed">
                  We understand that in the digital world, speed is everything. OBATA v2 uses advanced API routing to ensure your data arrives before your screen finishes loading.
               </p>
               <div className="space-y-6">
                  <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><ShieldCheckIcon /></div>
                     <p className="font-bold text-sm tracking-widest uppercase">SSL Encrypted Transactions</p>
                  </div>
                  <div className="flex items-center space-x-6 p-6 bg-white/5 rounded-3xl border border-white/10">
                     <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center"><BoltIcon /></div>
                     <p className="font-bold text-sm tracking-widest uppercase">Automated API Fulfillment</p>
                  </div>
               </div>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6">
               <img src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800" className="rounded-3xl h-64 w-full object-cover" alt="Tech 1" />
               <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" className="rounded-3xl h-64 w-full object-cover mt-12" alt="Tech 2" />
               <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" className="rounded-3xl h-64 w-full object-cover" alt="Tech 3" />
               <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" className="rounded-3xl h-64 w-full object-cover mt-12" alt="Tech 4" />
            </div>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]"></div>
      </section>

      {/* Quick Purchase CTA */}
      <section className="py-32 bg-blue-600">
         <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl lg:text-7xl font-black text-white tracking-tighter mb-12">Need a quick top-up? <br /> No login required.</h2>
            <Link to="/quick-purchase" className="inline-block bg-white text-blue-600 px-16 py-8 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-2">
               Quick Buy Now
            </Link>
         </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ img, icon, title, desc }: any) => (
  <div className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition-all group h-full flex flex-col">
    <div className="h-48 relative overflow-hidden">
      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
      <div className="absolute inset-0 bg-blue-600/20"></div>
    </div>
    <div className="p-10 flex-grow flex flex-col">
       <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
       <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
       <p className="text-gray-400 font-medium leading-relaxed flex-grow">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
