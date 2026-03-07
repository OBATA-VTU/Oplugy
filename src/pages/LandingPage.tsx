import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  ArrowRight, CheckCircle2,
  Users, TrendingUp,
  Wifi, Tv, Lightbulb, Menu, X, Zap as ZapIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { label: 'Active Users', value: '50k+', icon: <Users className="w-5 h-5" /> },
    { label: 'Daily Orders', value: '100k+', icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Success Rate', value: '99.9%', icon: <CheckCircle2 className="w-5 h-5" /> },
  ];

  const navLinks = [
    { name: 'Pricing', to: '/pricing' },
    { name: 'Quick Buy', to: '/quick-purchase' },
    { name: 'Blog', to: '/blog' },
    { name: 'About Us', to: '/about' },
    { name: 'Privacy', to: '/privacy' },
    { name: 'Terms', to: '/terms' },
  ];

  return (
    <div className="bg-white dark:bg-[#050505] text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/90 dark:bg-[#050505]/90 backdrop-blur-2xl py-4 border-b border-gray-100 dark:border-white/5 shadow-sm' : 'bg-transparent py-10'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Logo />
          
          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.to} className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transition-all">
                {link.name}
              </Link>
            ))}
            <div className="w-px h-6 bg-gray-100 dark:bg-white/10 mx-2"></div>
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-900 dark:text-white hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-950 transition-all shadow-2xl shadow-blue-600/20">Sign Up</Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[150]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-[#050505] z-[151] p-10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-16">
                <Logo />
                <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col space-y-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.to} 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-2xl font-black tracking-tighter uppercase hover:text-blue-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-4">
                <Link to="/login" className="block w-full py-5 text-center font-black uppercase tracking-widest text-xs border border-gray-100 dark:border-white/10 rounded-2xl">Login</Link>
                <Link to="/signup" className="block w-full py-5 text-center font-black uppercase tracking-widest text-xs bg-blue-600 text-white rounded-2xl">Create Account</Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* HERO SECTION - Editorial Style */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-7xl lg:text-[10vw] font-black tracking-tighter leading-[0.85] uppercase mb-12">
                Digital <br />
                <span className="text-blue-600">Freedom.</span>
              </h1>
              
              <div className="grid lg:grid-cols-12 gap-12 items-center text-left mt-20">
                <div className="lg:col-span-7">
                  <p className="text-2xl lg:text-4xl font-black tracking-tight leading-tight mb-10">
                    The most powerful VTU platform in Nigeria. Wholesale rates, instant delivery, and 24/7 reliability.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <Link to="/signup" className="bg-blue-600 text-white px-12 py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-gray-950 transition-all shadow-2xl shadow-blue-600/20 flex items-center space-x-4">
                      <span>Get Started</span>
                      <ArrowRight size={20} />
                    </Link>
                    <Link to="/quick-purchase" className="bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white px-12 py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                      Quick Buy
                    </Link>
                  </div>
                </div>
                
                <div className="lg:col-span-5">
                  <div className="bg-gray-50 dark:bg-white/2 p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 space-y-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                        <ZapIcon size={24} />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest">Instant Fulfillment</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                      Our proprietary routing engine ensures that 99.9% of transactions are completed in under 3 seconds.
                    </p>
                    <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#050505] bg-gray-200">
                            <img src={`https://picsum.photos/seed/u${i}/100/100`} alt="User" className="rounded-full" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">50k+ Active Users</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-indigo-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* SERVICES - Bento Grid Style */}
      <section className="py-32 lg:py-48 bg-gray-50 dark:bg-white/2 rounded-[4rem] lg:rounded-[6rem] mx-4 lg:mx-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600 mb-6">Our Ecosystem</h2>
            <p className="text-5xl lg:text-7xl font-black tracking-tighter uppercase leading-none">Complete <br /><span className="text-gray-400">Connectivity.</span></p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white dark:bg-[#050505] p-12 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm group hover:shadow-2xl transition-all duration-700">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                <div className="space-y-6 max-w-md">
                  <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600">
                    <Wifi size={32} />
                  </div>
                  <h3 className="text-4xl font-black tracking-tight uppercase">Wholesale Data</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Get MTN, Airtel, Glo, and 9mobile data at prices you won't find anywhere else. Perfect for personal use or reselling.
                  </p>
                </div>
                <div className="w-full md:w-64 h-64 bg-gray-50 dark:bg-white/5 rounded-[2rem] p-8 flex flex-col justify-between">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">MTN SME</span>
                      <TrendingUp size={16} className="text-blue-600" />
                   </div>
                   <p className="text-4xl font-black tracking-tighter">₦235<span className="text-lg">/GB</span></p>
                   <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-3/4"></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-blue-600 p-12 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-blue-600/20">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center">
                <Smartphone size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight uppercase mb-4">Airtime Topup</h3>
                <p className="text-white/70 font-medium leading-relaxed mb-8">
                  Instant recharge for all networks with up to 3% cashback on every transaction.
                </p>
                <Link to="/signup" className="inline-flex items-center space-x-3 text-sm font-black uppercase tracking-widest group">
                  <span>Recharge Now</span>
                  <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 bg-gray-950 p-12 rounded-[3rem] text-white flex flex-col justify-between">
               <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-blue-500">
                <Lightbulb size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight uppercase mb-4">Utility Bills</h3>
                <p className="text-white/40 font-medium leading-relaxed mb-8">
                  Pay for electricity and other utility bills across Nigeria with zero stress and zero fees.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-white dark:bg-[#050505] p-12 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-16 h-16 bg-purple-50 dark:bg-purple-500/10 rounded-3xl flex items-center justify-center text-purple-600">
                    <Tv size={32} />
                  </div>
                  <h3 className="text-4xl font-black tracking-tight uppercase">TV Subscriptions</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                    Renew your DSTV, GOTV, and Startimes subscriptions instantly. No more waiting for signals to return.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                   {['DSTV', 'GOTV', 'STARTIMES', 'SHOWMAX'].map(tv => (
                     <div key={tv} className="px-6 py-4 bg-gray-50 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-gray-100 dark:border-white/5">
                        {tv}
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS - Minimalist */}
      <section className="py-32 lg:py-48">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-600">{stat.label}</p>
                <p className="text-7xl lg:text-8xl font-black tracking-tighter leading-none">{stat.value}</p>
                <div className="w-12 h-1 bg-gray-100 dark:bg-white/10"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Bold Editorial */}
      <section className="py-48 lg:py-64 bg-gray-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <h2 className="text-6xl lg:text-[8vw] font-black tracking-tighter leading-[0.85] uppercase mb-16">
              Join the <br />
              <span className="text-blue-600">Revolution.</span>
            </h2>
            <p className="text-2xl lg:text-4xl font-black tracking-tight text-white/40 mb-20 max-w-2xl">
              Stop overpaying for data. Start your journey with Oplug today and experience digital freedom.
            </p>
            <div className="flex flex-wrap gap-8">
              <Link to="/signup" className="bg-blue-600 text-white px-16 py-8 rounded-[2.5rem] text-xl font-black uppercase tracking-widest hover:bg-white hover:text-gray-950 transition-all shadow-2xl shadow-blue-600/20">
                Create Account
              </Link>
              <Link to="/support" className="border border-white/20 text-white px-16 py-8 rounded-[2.5rem] text-xl font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Text */}
        <div className="absolute -bottom-20 -right-20 text-[20vw] font-black text-white/5 leading-none pointer-events-none select-none">
          OPLUG
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
