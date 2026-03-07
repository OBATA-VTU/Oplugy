import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { 
  Smartphone, Zap, ShieldCheck, 
  ArrowRight, CheckCircle2, Star, 
  Users, TrendingUp, CreditCard,
  Wifi, Tv, Lightbulb
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { icon: <Wifi className="w-6 h-6" />, name: 'Cheap Data', desc: 'MTN, Airtel, Glo & 9mobile at wholesale prices.' },
    { icon: <Smartphone className="w-6 h-6" />, name: 'Airtime Topup', desc: 'Instant airtime recharge with up to 3% discount.' },
    { icon: <Lightbulb className="w-6 h-6" />, name: 'Utility Bills', desc: 'Pay electricity bills (Prepaid & Postpaid) instantly.' },
    { icon: <Tv className="w-6 h-6" />, name: 'TV Sub', desc: 'Renew DSTV, GOTV & Startimes without stress.' },
  ];

  const stats = [
    { label: 'Active Users', value: '50k+', icon: <Users className="w-5 h-5" /> },
    { label: 'Daily Orders', value: '100k+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Success Rate', value: '99.9%', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-white dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl py-4 border-b border-gray-100 dark:border-white/5 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-colors">Pricing</a>
            <Link to="/login" className="text-sm font-bold text-gray-900 dark:text-white">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Create Account</Link>
          </div>
          <Link to="/login" className="md:hidden bg-blue-600 text-white p-3 rounded-xl">
            <ArrowRight size={20} />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full mb-8">
                <Zap size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Fastest VTU in Nigeria</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8">
                Buy Data & Airtime <br />
                <span className="text-blue-600">Instantly.</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-xl leading-relaxed">
                Experience the cheapest rates for MTN, Airtel, Glo, and 9mobile. Automated delivery, 24/7 support, and 100% secure payments.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-3">
                  <span>Start Buying Now</span>
                  <ArrowRight size={20} />
                </Link>
                <Link to="/pricing" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center">
                  Check Our Rates
                </Link>
              </div>

              <div className="mt-12 flex items-center space-x-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200 dark:bg-white/10 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Trusted by 50,000+ Nigerians</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-white/5 rounded-[3rem] p-8 border border-gray-100 dark:border-white/10 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {services.map((service, i) => (
                    <div key={i} className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all group">
                      <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                        {service.icon}
                      </div>
                      <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-10 bg-blue-600 rounded-[3rem] text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-10">
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Virtual Account</p>
                      <CreditCard size={24} />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter leading-none mb-2">6627516112</h2>
                    <p className="text-xs font-bold opacity-60 uppercase tracking-widest">PalmPay Limited</p>
                    
                    <div className="mt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="px-4 py-2 bg-white/20 rounded-full">Active Account</span>
                      <span className="opacity-40">ID: OPL-8829</span>
                    </div>
                  </div>
                  {/* Subtle pattern */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center space-x-4 justify-center md:justify-start">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 dark:border-white/5">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tight">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-blue-600 text-sm font-black uppercase tracking-[0.3em] mb-4">Why Choose Us</h2>
            <p className="text-4xl lg:text-5xl font-black tracking-tight mb-6">Built for Speed and Reliability.</p>
            <p className="text-lg text-gray-600 dark:text-gray-400">We understand that time is money. That's why we've built a system that works as hard as you do.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Instant Delivery"
              desc="Our automated system processes your orders in seconds. No manual delays, just instant results."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8" />}
              title="Secure Payments"
              desc="Your funds are safe with us. We use industry-standard encryption and secure payment gateways."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Cheapest Rates"
              desc="We offer the most competitive prices in the Nigerian market, helping you save more on every purchase."
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 lg:py-32 bg-blue-600 text-white rounded-[3rem] lg:rounded-[5rem] mx-4 lg:mx-10 mb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-white/60 text-sm font-black uppercase tracking-[0.3em] mb-4">Simple Process</h2>
            <p className="text-4xl lg:text-5xl font-black tracking-tight">Start in 3 Easy Steps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 border border-white/20">1</div>
              <h3 className="text-2xl font-bold mb-4">Create Account</h3>
              <p className="text-white/70 leading-relaxed">Sign up with your basic details in less than a minute.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 border border-white/20">2</div>
              <h3 className="text-2xl font-bold mb-4">Fund Wallet</h3>
              <p className="text-white/70 leading-relaxed">Add money via bank transfer or card instantly.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 border border-white/20">3</div>
              <h3 className="text-2xl font-bold mb-4">Buy Services</h3>
              <p className="text-white/70 leading-relaxed">Select your service and get instant delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-8">Ready to experience the <span className="text-blue-600">Oplug</span> difference?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">Join thousands of Nigerians who trust us for their daily digital needs.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/signup" className="bg-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">Get Started Now</Link>
            <Link to="/support" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Contact Support</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="p-10 bg-white dark:bg-white/2 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all group">
    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
