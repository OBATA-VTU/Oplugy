
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  ShieldCheckIcon, WalletIcon, UsersIcon, ArrowIcon
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
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-3xl shadow-2xl py-4 border-b border-gray-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-12">
            <a href="#services" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Ecosystem</a>
            <a href="#why-us" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Why us</a>
            <a href="#reseller" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Reseller Tier</a>
            <Link to="/quick-purchase" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100">Quick Purchase</Link>
            <Link to="/login" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-gray-300 transform active:scale-95">Secure Portal</Link>
          </div>
          <Link to="/login" className="md:hidden bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
            <UsersIcon />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-64 lg:pb-80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          <div className="w-full lg:w-3/5 text-center lg:text-left animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center space-x-4 bg-blue-50 text-blue-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 border-2 border-blue-100 mx-auto lg:mx-0 shadow-lg shadow-blue-100/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span>Proprietary Gateway v2.0</span>
            </div>
            <h1 className="text-6xl lg:text-[130px] font-black text-gray-900 leading-[1] lg:leading-[0.85] mb-12 tracking-tighter">
              The Ultimate <br />
              Digital <br />
              <span className="text-blue-600">Plug.</span>
            </h1>
            <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-relaxed">
              Experience Nigeria's most reliable independent infrastructure for instant data, airtime, and utility renewals. Automated for performance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-8">
              <Link to="/signup" className="bg-blue-600 text-white px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-3 active:scale-95">
                Join Ecosystem
              </Link>
              <Link to="/quick-purchase" className="bg-white border-4 border-gray-100 text-gray-900 px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black hover:border-blue-600 hover:shadow-2xl transition-all transform hover:-translate-y-3 active:scale-95">
                Guest Checkout
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-2/5 flex justify-center animate-in fade-in slide-in-from-right-8 duration-1000">
             <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-blue-600 rounded-[4rem] lg:rounded-[6rem] blur-[120px] opacity-20"></div>
                <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=1000" className="relative rounded-[4rem] lg:rounded-[6rem] shadow-2xl border-8 border-white animate-float w-full h-auto z-10" alt="OBATA Digital Hub" />
                <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[3rem] shadow-2xl z-20 hidden lg:block border border-gray-50">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Nodes</p>
                   <p className="text-4xl font-black text-blue-600 tracking-tighter">102k+</p>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-blue-50/50 rounded-full blur-[200px] -z-0"></div>
      </section>

      {/* SERVICE SHOWCASE */}
      <section id="services" className="py-32 lg:py-64 bg-gray-50/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center mb-32 max-w-4xl mx-auto">
              <h2 className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Unified Services</h2>
              <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none">Built for every digital requirement.</h3>
              <p className="text-xl lg:text-2xl text-gray-400 mt-12 font-medium">From individual recharges to enterprise-grade API integration, our ecosystem handles millions of recharges daily.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
              <DeepServiceCard 
                icon={<SignalIcon />} 
                title="SME/CG Data" 
                desc="Automated delivery across all 4 major networks. High-velocity SME nodes ensure zero downtime." 
                img="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
              />
              <DeepServiceCard 
                icon={<PhoneIcon />} 
                title="Express Airtime" 
                desc="Instant top-up for voice and credit. Exclusive discounts for OBATA members across all carriers." 
                img="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800"
              />
              <DeepServiceCard 
                icon={<BoltIcon />} 
                title="Utility Terminals" 
                desc="Verified meter identification for all DISCOs. Prepaid and Postpaid renewals in seconds." 
                img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800"
              />
              <DeepServiceCard 
                icon={<TvIcon />} 
                title="Cable TV Renew" 
                desc="DStv, GOtv, and StarTimes. Direct connection to billing servers for instant reactivation." 
                img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800"
              />
              <DeepServiceCard 
                icon={<UsersIcon />} 
                title="API Gateway" 
                desc="Connect your own application to our robust infrastructure. Developer documentation available." 
                img="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"
              />
              <DeepServiceCard 
                icon={<WalletIcon />} 
                title="Auto Liquidity" 
                desc="Fund your wallet via multiple nodes. Instant reflection in your portfolio balance." 
                img="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800"
              />
           </div>
        </div>
      </section>

      {/* WHY US - THE INFRASTRUCTURE STORY */}
      <section id="why-us" className="py-32 lg:py-64 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-24 lg:gap-40">
           <div className="w-full lg:w-1/2">
              <h2 className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Infrastructure</h2>
              <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none mb-12">Engineered for <br /><span className="text-blue-600">Absolute Speed.</span></h3>
              <p className="text-xl lg:text-2xl text-gray-400 font-medium mb-16 leading-relaxed">
                OBATA v2 doesn't just resell services; we've built a custom terminal designed for maximum redundancy. When other networks fail, we stay live.
              </p>
              <div className="space-y-12">
                 <BigBenefit icon={<ShieldCheckIcon />} title="Military Grade Security" desc="All transactions and personal identities are protected by bank-level encryption and secure socket layers." />
                 <BigBenefit icon={<BoltIcon />} title="Zero-Latency Delivery" desc="Our automated nodes respond in milliseconds, ensuring your customers never wait for fulfillment." />
                 <BigBenefit icon={<WalletIcon />} title="Dynamic Funding" desc="Access multiple funding gateways including Paystack and dedicated virtual accounts." />
              </div>
           </div>
           <div className="w-full lg:w-1/2 grid grid-cols-2 gap-8 lg:gap-12">
              <div className="space-y-8 lg:space-y-12 pt-16 lg:pt-32">
                 <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] lg:rounded-[4rem] shadow-2xl h-80 object-cover w-full" alt="infra1" />
                 <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-200">
                    <p className="text-6xl font-black mb-2 tracking-tighter">99.9%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Uptime Reliability</p>
                 </div>
              </div>
              <div className="space-y-8 lg:space-y-12">
                 <div className="bg-gray-900 p-10 rounded-[3rem] text-white shadow-2xl">
                    <p className="text-6xl font-black mb-2 tracking-tighter">1.2M+</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Monthly Nodes</p>
                 </div>
                 <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800" className="rounded-[3rem] lg:rounded-[4rem] shadow-2xl h-[30rem] object-cover w-full" alt="infra2" />
              </div>
           </div>
        </div>
      </section>

      {/* RESELLER TIER SECTION */}
      <section id="reseller" className="py-32 lg:py-64 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div>
                 <h2 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Business Tier</h2>
                 <h3 className="text-5xl lg:text-8xl font-black tracking-tighter leading-none mb-12">Scale with <br /> OBATA Reseller.</h3>
                 <p className="text-xl lg:text-2xl text-white/40 font-medium mb-16 leading-relaxed">
                   Join thousands of independent merchants who use our infrastructure to power their businesses. Access the absolute lowest rates in Nigeria.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-8">
                    <Link to="/signup" className="bg-white text-gray-950 px-12 py-8 rounded-[3rem] text-xl font-black shadow-2xl transition-all transform hover:-translate-y-3">Start Reselling</Link>
                    <Link to="/pricing" className="bg-white/10 border border-white/20 px-12 py-8 rounded-[3rem] text-xl font-black hover:bg-white/20 transition-all transform hover:-translate-y-3">View Reseller Rates</Link>
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-12 lg:p-20 rounded-[4rem] backdrop-blur-3xl relative">
                 <div className="absolute top-0 right-0 p-12 text-blue-500"><ShieldCheckIcon /></div>
                 <h4 className="text-3xl font-black mb-12 tracking-tight">Tier Benefits</h4>
                 <ul className="space-y-10">
                    <BenefitItem title="Massive Margins" desc="Save up to ₦50 on every GB purchase compared to regular users." />
                    <BenefitItem title="API Access" desc="Direct programmatic access to all our vending services." />
                    <BenefitItem title="Premium Support" desc="Direct line to our senior engineering team for technical needs." />
                    <BenefitItem title="Branded Invoices" desc="Generate custom transaction receipts for your customers." />
                 </ul>
              </div>
           </div>
        </div>
        <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[150px]"></div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-48 lg:py-80 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-6xl lg:text-[140px] font-black mb-16 tracking-tighter leading-[0.8] text-gray-900">Ready to <br /> Plug In?</h2>
          <p className="text-xl lg:text-3xl text-gray-400 font-medium mb-20 max-w-3xl mx-auto">Experience the most robust digital gateway in Nigeria. Fast, secure, and always live.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-10">
             <Link to="/signup" className="bg-blue-600 text-white px-16 lg:px-24 py-10 lg:py-12 rounded-[4rem] text-2xl lg:text-3xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-4">Create Free Account</Link>
             <Link to="/quick-purchase" className="bg-white border-4 border-gray-100 text-gray-900 px-16 lg:px-24 py-10 lg:py-12 rounded-[4rem] text-2xl lg:text-3xl font-black hover:border-blue-600 transition-all transform hover:-translate-y-4 shadow-xl">Guest Gateway</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const DeepServiceCard = ({ icon, title, desc, img }: any) => (
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

const BigBenefit = ({ icon, title, desc }: any) => (
  <div className="flex items-start space-x-10 group">
     <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:scale-110">
        {icon}
     </div>
     <div>
        <h4 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-4">{title}</h4>
        <p className="text-gray-400 text-lg lg:text-xl font-medium leading-relaxed">{desc}</p>
     </div>
  </div>
);

const BenefitItem = ({ title, desc }: any) => (
  <li className="flex items-start space-x-6">
     <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-3 flex-shrink-0"></div>
     <div>
        <p className="font-black text-xl tracking-tight text-white mb-2">{title}</p>
        <p className="text-white/40 text-sm font-medium leading-relaxed">{desc}</p>
     </div>
  </li>
);

const Stat = ({ value, label }: any) => (
  <div>
    <p className="text-5xl lg:text-7xl font-black tracking-tighter mb-4">{value}</p>
    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40">{label}</p>
  </div>
);

export default LandingPage;
