import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, MenuIcon, WalletIcon } from '../components/Icons';

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-600 scroll-smooth">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center">
            <Logo />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-12">
              <a href="#features" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">How It Works</a>
              <Link to="/login" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all transform hover:-translate-y-1">
                Start Plugging
              </Link>
            </div>

            <button className="md:hidden text-gray-900 p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MenuIcon />
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 transition-all duration-300 overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-8 space-y-6 text-center">
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="block text-sm font-black uppercase tracking-widest text-gray-500">Features</a>
            <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="block text-sm font-black uppercase tracking-widest text-gray-500">How It Works</a>
            <Link to="/login" className="block text-sm font-black uppercase tracking-widest text-gray-500">Sign In</Link>
            <Link to="/signup" className="block bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest">Register</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-56 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10">
          <div className="lg:flex items-center gap-24">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-100 text-blue-700 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-10 animate-bounce">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                <span>Oplug v2.5 is now Live</span>
              </div>
              <h1 className="text-6xl lg:text-9xl font-black text-gray-900 leading-[0.9] mb-10 tracking-tighter">
                VTU Made <br />
                <span className="text-blue-600 italic">Seamless.</span>
              </h1>
              <p className="text-xl lg:text-2xl text-gray-400 mb-14 max-w-2xl mx-auto lg:mx-0 leading-tight font-medium tracking-tight">
                No delays. No complex steps. Just instant data, airtime, and bill payments for modern Nigerians who value speed.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                <Link to="/signup" className="bg-gray-900 text-white px-14 py-6 rounded-[2rem] text-lg font-black shadow-2xl shadow-gray-200 hover:bg-black transition-all transform hover:-translate-y-2">
                  Create Account
                </Link>
                <div className="flex items-center space-x-5 bg-white border border-gray-100 px-10 py-6 rounded-[2rem] shadow-xl">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i+10}`} className="w-10 h-10 rounded-full border-4 border-white shadow-lg" alt="user" />)}
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900 tracking-tighter">50K+</div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Plugs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5 mt-32 lg:mt-0 relative">
               <div className="relative z-20 bg-white p-4 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(37,99,235,0.2)] border border-gray-50 transform lg:rotate-6 hover:rotate-0 transition-transform duration-700">
                  <div className="bg-gray-900 rounded-[3.5rem] p-10 overflow-hidden relative">
                     <div className="space-y-8">
                        <div className="flex justify-between items-center text-white/50 text-[10px] font-black uppercase tracking-widest">
                           <span>Oplug Wallet</span>
                           <span>Personal Account</span>
                        </div>
                        <div className="text-white">
                           <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Total Balance</div>
                           <div className="text-4xl font-black tracking-tighter">₦75,250.00</div>
                        </div>
                        <div className="flex gap-4">
                           <div className="flex-1 bg-white/10 p-4 rounded-2xl border border-white/5 text-center">
                              <div className="text-white/40 text-[9px] uppercase font-black mb-1">Total Spent</div>
                              <div className="text-white font-bold tracking-tighter">₦12.5K</div>
                           </div>
                           <div className="flex-1 bg-blue-600 p-4 rounded-2xl text-center">
                              <div className="text-white/70 text-[9px] uppercase font-black mb-1">Savings</div>
                              <div className="text-white font-bold tracking-tighter">₦2.4K</div>
                           </div>
                        </div>
                     </div>
                     <div className="mt-12 space-y-4">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-3/4"></div>
                        </div>
                        <p className="text-white/30 text-[9px] font-bold text-center">Transaction limit refreshed for today</p>
                     </div>
                  </div>
               </div>
               {/* Decorative Blobs */}
               <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
               <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -z-10 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="features" className="py-40 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="lg:flex items-end justify-between mb-24">
            <div className="max-w-xl">
               <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.2em] mb-6">Our Ecosystem</h2>
               <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">Powering Your <br /> Digital Lifestyle.</h3>
            </div>
            <p className="hidden lg:block text-gray-400 font-medium max-w-sm mb-2">We've built Oplug to be the only platform you need for all your routine digital payments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <FeatureItem icon={<SignalIcon />} title="Bulk Data" desc="MTN SME, Gifting & Corporate data at rates that beat everyone else." color="blue" />
            <FeatureItem icon={<PhoneIcon />} title="Airtime Discount" desc="Instant recharge with up to 5% cashback on every single transaction." color="indigo" />
            <FeatureItem icon={<BoltIcon />} title="Utility Bills" desc="Pay for IKEDC, EKEDC, PHED and more. Get tokens in 2 seconds." color="yellow" />
            <FeatureItem icon={<TvIcon />} title="Cable Renewal" desc="Keep the show going. DSTV & GOTV subscriptions that never fail." color="purple" />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="py-48 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
           <div className="lg:flex items-center gap-32">
              <div className="lg:w-1/2 relative">
                 <div className="absolute -inset-10 bg-gray-100 rounded-[5rem] -rotate-3 -z-10"></div>
                 <img 
                    src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=1000" 
                    alt="Simplified workflow" 
                    className="rounded-[4rem] shadow-2xl border-8 border-white"
                 />
              </div>
              <div className="lg:w-1/2 mt-24 lg:mt-0">
                 <h3 className="text-5xl lg:text-7xl font-black text-gray-900 mb-16 tracking-tighter">Instant is our <br /> <span className="text-blue-600">Standard.</span></h3>
                 <div className="space-y-16">
                    <ProcessStep num="01" title="Register & Verify" desc="Create your profile in 30 seconds. No long forms, just the basics." />
                    <ProcessStep num="02" title="Fund Instantly" desc="Use Paystack or Manual Transfer. Your funds reflect as soon as you pay." />
                    <ProcessStep num="03" title="Select & Pay" desc="Choose your service, input details, and witness instant delivery." />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-40 bg-gray-900 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10 text-center lg:text-left">
            <div className="lg:flex items-center justify-between">
               <div className="space-y-12">
                  <StatItem value="99.9%" label="API Uptime" />
                  <StatItem value="5M+" label="Bills Paid" />
               </div>
               <div className="mt-20 lg:mt-0 space-y-12">
                  <StatItem value="₦250M+" label="Monthly Volume" />
                  <StatItem value="2s" label="Avg. Delivery" />
               </div>
               <div className="lg:w-1/3 mt-24 lg:mt-0 bg-white/5 p-12 rounded-[3rem] border border-white/10 backdrop-blur-xl">
                  <h4 className="text-3xl font-black text-white mb-6 tracking-tight">Ready to join the Oplug family?</h4>
                  <p className="text-white/40 font-medium mb-10 leading-relaxed">Stop using platforms that keep you waiting. Switch to Oplug and experience the difference today.</p>
                  <Link to="/signup" className="block w-full bg-blue-600 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/20">Get Started Now</Link>
               </div>
            </div>
         </div>
         {/* Background pattern */}
         <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureItem = ({ icon, title, desc, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-100',
    yellow: 'bg-yellow-500 shadow-yellow-100',
    purple: 'bg-purple-600 shadow-purple-100'
  };
  return (
    <div className="group p-10 bg-white rounded-[3rem] border border-gray-100 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] transition-all duration-700 hover:-translate-y-3">
      <div className={`w-16 h-16 ${colors[color]} rounded-[1.25rem] flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
      <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
};

const ProcessStep = ({ num, title, desc }: any) => (
  <div className="flex gap-10 group">
    <div className="text-6xl font-black text-blue-50 group-hover:text-blue-100 transition-colors duration-500">{num}</div>
    <div className="pt-2">
      <h4 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">{title}</h4>
      <p className="text-gray-400 font-medium leading-relaxed max-w-sm">{desc}</p>
    </div>
  </div>
);

const StatItem = ({ value, label }: any) => (
  <div className="text-center lg:text-left">
    <div className="text-7xl lg:text-9xl font-black text-white tracking-tighter">{value}</div>
    <div className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mt-2">{label}</div>
  </div>
);

export default LandingPage;