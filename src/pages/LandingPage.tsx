import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { motion, useScroll, useTransform } from 'motion/react';
import { Rocket, Smartphone, ArrowRight, Globe, CreditCard, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-slate-950 text-slate-50 overflow-hidden selection:bg-blue-600 selection:text-white scroll-smooth font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-slate-950/90 backdrop-blur-2xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden lg:flex items-center space-x-12">
            <nav className="flex items-center space-x-10">
              <a href="#services" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Services</a>
              <a href="#how-it-works" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Protocol</a>
              <Link to="/pricing" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Pricing</Link>
            </nav>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center space-x-8">
              <button 
                onClick={toggleTheme}
                className="text-slate-500 hover:text-white transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link to="/login" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all shadow-2xl shadow-blue-600/20">Get Started</Link>
            </div>
          </div>
          <div className="lg:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/60"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/login" className="bg-white/5 p-3 rounded-xl border border-white/10">
              <ArrowRight className="w-5 h-5 text-white" />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 px-6 lg:px-12 overflow-hidden">
        <motion.div style={{ opacity, y }} className="max-w-[1400px] mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-3 px-5 py-2.5 bg-blue-600/10 border border-blue-600/20 rounded-full mb-12"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">Network Status: Operational</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[16vw] lg:text-[10vw] font-black leading-[0.8] tracking-[-0.06em] uppercase mb-12 text-white"
              >
                Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-blue-900">Dominance.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-3xl text-slate-400 font-medium max-w-2xl mb-16 leading-tight tracking-tight"
              >
                The most advanced infrastructure for digital commerce in Nigeria. Instant fulfilment, military-grade accuracy.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
              >
                <Link to="/signup" className="w-full sm:w-auto bg-blue-600 text-white px-14 py-7 rounded-full text-xl font-black hover:bg-white hover:text-black transition-all shadow-2xl shadow-blue-600/40">Launch Dashboard</Link>
                <Link to="/pricing" className="w-full sm:w-auto border border-white/10 text-white px-14 py-7 rounded-full text-xl font-black hover:bg-white/5 transition-all">View Rates</Link>
              </motion.div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-square">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-white/5 rounded-full"
                ></motion.div>
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-12 border border-white/10 border-dashed rounded-full"
                ></motion.div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-[85%] h-[85%] bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-[5rem] backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl"
                  >
                    <img 
                      src="https://picsum.photos/seed/oplug_tech/1200/1200"
                      alt="Oplug Technology"
                      className="w-full h-full object-cover opacity-60 grayscale mix-blend-overlay"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Floating Stats */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-white text-black p-10 rounded-[3rem] shadow-2xl z-20"
                >
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-2">Network Uptime</p>
                  <p className="text-4xl font-black tracking-tighter">99.99%</p>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-blue-600 text-white p-10 rounded-[3rem] shadow-2xl z-20"
                >
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Global Latency</p>
                  <p className="text-4xl font-black tracking-tighter">14ms</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-blue-600/20 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      </section>

      {/* MARQUEE TRUST */}
      <section className="py-24 border-y border-white/5 overflow-hidden bg-slate-900/50">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-24 px-12">
              <span className="text-5xl font-black tracking-tighter text-white/5 uppercase">MTN NIGERIA</span>
              <span className="text-5xl font-black tracking-tighter text-white/5 uppercase">AIRTEL AFRICA</span>
              <span className="text-5xl font-black tracking-tighter text-white/5 uppercase">9MOBILE</span>
              <span className="text-5xl font-black tracking-tighter text-white/5 uppercase">GLO WORLD</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section id="services" className="py-40 lg:py-60 px-6 lg:px-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-10">
            <div className="max-w-4xl">
              <p className="text-blue-500 text-[12px] font-black uppercase tracking-[0.6em] mb-8">Service Protocol</p>
              <h2 className="text-7xl lg:text-[120px] font-black tracking-[-0.05em] leading-[0.8] uppercase text-white">
                Built for <br />
                <span className="text-slate-800">Scale.</span>
              </h2>
            </div>
            <div className="lg:max-w-sm">
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                We've engineered a robust infrastructure that ensures your transactions are processed in milliseconds, not minutes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-8 bg-slate-900/50 border border-white/5 rounded-[5rem] p-20 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-700">
              <div className="relative z-10 max-w-lg">
                <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-12 border border-blue-600/20">
                  <Rocket className="text-blue-500" size={40} />
                </div>
                <h3 className="text-6xl font-black tracking-tighter mb-8 uppercase text-white">Instant <br />Fulfilment</h3>
                <p className="text-2xl text-slate-500 font-medium leading-snug">
                  Our automated delivery system ensures that 98% of orders are completed in under 5 seconds.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>

            <div className="md:col-span-4 bg-blue-600 rounded-[5rem] p-20 flex flex-col justify-between group hover:bg-white hover:text-black transition-all duration-700 shadow-2xl shadow-blue-600/20">
              <Globe size={80} className="mb-12" />
              <div>
                <h3 className="text-5xl font-black tracking-tighter mb-8 uppercase">Social <br />Growth</h3>
                <p className="text-xl font-medium opacity-80 mb-12 leading-relaxed">
                  Boost your social presence with our premium SMM panel. Real results, real fast.
                </p>
                <Link to="/smm" className="inline-flex items-center space-x-4 text-[12px] font-black uppercase tracking-[0.3em] group-hover:translate-x-4 transition-transform">
                  <span>Explore SMM</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 bg-slate-900/50 border border-white/5 rounded-[5rem] p-20 group hover:border-purple-500/30 transition-all duration-700">
              <div className="w-20 h-20 bg-purple-600/10 rounded-3xl flex items-center justify-center mb-12 border border-purple-600/20">
                <Smartphone className="text-purple-500" size={40} />
              </div>
              <h3 className="text-5xl font-black tracking-tighter mb-8 uppercase text-white">Mobile <br />First</h3>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                A seamless experience across all devices. Manage your business on the go with our responsive app.
              </p>
            </div>

            <div className="md:col-span-8 bg-slate-900/50 border border-white/5 rounded-[5rem] p-20 flex flex-col md:flex-row items-center gap-20 group hover:border-emerald-500/30 transition-all duration-700">
              <div className="flex-1">
                <div className="w-20 h-20 bg-emerald-600/10 rounded-3xl flex items-center justify-center mb-12 border border-emerald-600/20">
                  <CreditCard className="text-emerald-500" size={40} />
                </div>
                <h3 className="text-5xl font-black tracking-tighter mb-8 uppercase text-white">Secure <br />Payments</h3>
                <p className="text-xl text-slate-500 font-medium leading-relaxed">
                  Multiple funding options including bank transfer and card payments, all protected by encryption.
                </p>
              </div>
              <div className="flex-1 w-full h-80 bg-slate-950 rounded-[3rem] border border-white/5 flex items-center justify-center group-hover:scale-105 transition-all duration-700 shadow-2xl">
                <Logo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROTOCOL SECTION */}
      <section id="how-it-works" className="py-40 lg:py-60 bg-white text-slate-950 rounded-[5rem] lg:rounded-[10rem] mx-4 lg:mx-10 shadow-2xl">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-32 items-start">
            <div className="lg:sticky lg:top-40">
              <p className="text-blue-600 text-[12px] font-black uppercase tracking-[0.6em] mb-12">The Protocol</p>
              <h2 className="text-[12vw] lg:text-[9vw] font-black leading-[0.8] tracking-[-0.05em] uppercase mb-16">
                Simple. <br />
                Direct. <br />
                <span className="text-slate-200">Fast.</span>
              </h2>
              <Link to="/signup" className="inline-flex items-center space-x-8 bg-slate-950 text-white px-16 py-8 rounded-full text-2xl font-black hover:bg-blue-600 transition-all shadow-2xl shadow-slate-950/20">
                <span>Join Network</span>
                <ArrowRight size={32} />
              </Link>
            </div>

              <div className="space-y-40">
                <Step number="01" title="Registration" desc="Create your secure account in seconds. No complex forms, just the essentials for your digital success." />
                <Step number="02" title="Funding" desc="Fund your wallet through our secure payment gateways. Instant reflection, zero delays, 100% security." />
                <Step number="03" title="Purchase" desc="Select your service and buy. Our system handles the rest with high accuracy and instant delivery." />
              </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-60 lg:py-80 px-6 lg:px-16 relative">
        <div className="max-w-[1800px] mx-auto text-center relative z-10">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-[18vw] font-black leading-[0.7] tracking-[-0.06em] uppercase mb-32 text-white"
          >
            Ready to <br />
            <span className="text-blue-600">Succeed?</span>
          </motion.h2>
          <div className="flex flex-col sm:flex-row justify-center gap-12">
            <Link to="/signup" className="bg-white text-slate-950 px-24 py-12 rounded-full text-4xl font-black hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-6 shadow-2xl shadow-white/10">Get Started</Link>
            <Link to="/support" className="border border-white/10 text-white px-24 py-12 rounded-full text-4xl font-black hover:bg-white/5 transition-all transform hover:-translate-y-6">Contact Us</Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-blue-600/10 rounded-full blur-[200px] -z-10"></div>
      </section>

      <Footer />
    </div>
  );
};

const Step = ({ number, title, desc }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="flex items-baseline space-x-10 mb-10">
      <span className="text-5xl font-black text-blue-600 tracking-tighter">{number}</span>
      <h3 className="text-7xl font-black tracking-tighter uppercase text-slate-950">{title}</h3>
    </div>
    <p className="text-3xl text-slate-500 font-medium leading-tight max-w-2xl tracking-tight">
      {desc}
    </p>
    <div className="mt-16 h-px w-full bg-slate-100 group-hover:bg-blue-600 transition-colors duration-700"></div>
  </motion.div>
);

export default LandingPage;
