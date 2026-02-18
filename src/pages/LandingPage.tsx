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
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-2xl shadow-2xl border-b border-gray-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-10">
            <a href="#about" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">Why Us</a>
            <a href="#services" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600">Services</a>
            <Link to="/quick-purchase" className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all">Guest Mode</Link>
            <Link to="/login" className="bg-gray-900 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200">Login</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
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
            <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[0.85] mb-14 tracking-tighter">
              Instant. <br />
              Secure. <br />
              <span className="text-blue-600">Limitless.</span>
            </h1>
            <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-tight">
              Cheap Data, Automated Bills & Global Connectivity. Nigeria's fastest VTU node.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
              <Link to="/signup" className="bg-blue-600 text-white px-14 py-8 rounded-[2.5rem] text-xl font-black shadow-2xl hover:bg-black transition-all transform hover:-translate-y-2">
                Get Started
              </Link>
              <Link to="/quick-purchase" className="bg-white border-2 border-gray-100 text-gray-900 px-14 py-8 rounded-[2.5rem] text-xl font-black hover:border-blue-600 transition-all transform hover:-translate-y-2">
                Guest Buy
              </Link>
            </div>
          </div>
          <div className="lg:w-2/5">
             <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-[5rem] blur-[80px] opacity-20"></div>
                <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1000" className="relative rounded-[5rem] shadow-2xl border-8 border-white animate-float" alt="Mobile Services" />
             </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="about" className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                 <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Why Choose Oplug</h2>
                 <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-10">Engineered for <br /><span className="text-blue-600">High Velocity.</span></h3>
                 <div className="space-y-8">
                    <Benefit icon={<ShieldCheckIcon />} title="Bank-Grade Security" desc="All transactions are processed through highly encrypted gateways." />
                    <Benefit icon={<BoltIcon />} title="Instant Fulfillment" desc="We process and deliver services in 1.5 seconds on average." />
                    <Benefit icon={<WalletIcon />} title="Automated Funding" desc="Fund your wallet and see the reflection immediately." />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem] h-80 object-cover" alt="Team" />
                 <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800" className="rounded-[2.5rem] h-80 object-cover mt-12" alt="Cloud" />
              </div>
           </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
             <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-6">Our Ecosystem</h2>
             <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">Everything you need.</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <ServiceBlock icon={<SignalIcon />} title="Cheap Data" desc="MTN, Airtel, Glo, & 9mobile at wholesale prices." />
            <ServiceBlock icon={<PhoneIcon />} title="VTU Airtime" desc="Instant airtime recharge with 3% discount." />
            <ServiceBlock icon={<BoltIcon />} title="Utility Bills" desc="Pay electricity tokens for all DISCOs instantly." />
            <ServiceBlock icon={<TvIcon />} title="Cable TV" desc="Renew DStv, GOtv, and StarTimes without stress." />
            <ServiceBlock icon={<UsersIcon />} title="Reseller API" desc="Build your VTU business with our robust API." />
            <ServiceBlock icon={<WalletIcon />} title="Gift Cards" desc="Buy and sell digital assets at high rates." />
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="py-40 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h3 className="text-5xl font-black mb-20 tracking-tighter">3 Simple Steps to Start.</h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <Step num="01" title="Register" desc="Create an account with your username and email." />
              <Step num="02" title="Fund Wallet" desc="Deposit minimum ₦200 into your secure wallet." />
              <Step num="03" title="Buy Service" desc="Pick any service and enjoy instant delivery." />
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const Benefit = ({ icon, title, desc }: any) => (
  <div className="flex items-start space-x-6">
     <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">{icon}</div>
     <div>
        <h4 className="text-xl font-black text-gray-900 tracking-tight mb-2">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
     </div>
  </div>
);

const ServiceBlock = ({ icon, title, desc }: any) => (
  <div className="p-10 rounded-[3rem] bg-gray-50 border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm hover:shadow-2xl">
     <div className="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center mb-8 shadow-sm">{icon}</div>
     <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
     <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const Step = ({ num, title, desc }: any) => (
  <div className="space-y-6">
     <div className="text-6xl font-black text-blue-600 tracking-tighter opacity-50">{num}</div>
     <h4 className="text-2xl font-black">{title}</h4>
     <p className="text-white/40 font-medium leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;