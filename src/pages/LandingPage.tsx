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
    <div className="bg-[#000] text-white overflow-hidden selection:bg-blue-600 selection:text-white scroll-smooth font-sans">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-black/80 backdrop-blur-2xl py-4 border-b border-white/5' : 'bg-transparent py-8'}`}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden lg:flex items-center space-x-12">
            <nav className="flex items-center space-x-10">
              <a href="#services" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all">Services</a>
              <a href="#how-it-works" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all">Protocol</a>
              <Link to="/pricing" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all">Pricing</Link>
            </nav>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center space-x-8">
              <button 
                onClick={toggleTheme}
                className="text-white/40 hover:text-white transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <Link to="/login" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-white transition-all">Login</Link>
              <Link to="/signup" className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-xl">Join Now</Link>
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
              <ArrowRight className="w-5 h-5" />
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
                className="inline-flex items-center space-x-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-12"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-blue-400">v2.0 Protocol Active</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-[14vw] lg:text-[9vw] font-black leading-[0.85] tracking-[-0.05em] uppercase mb-12"
              >
                Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">Ascension.</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl lg:text-2xl text-white/40 font-medium max-w-xl mb-16 leading-relaxed"
              >
                The most advanced infrastructure for digital commerce in Nigeria. Instant fulfillment, surgical precision.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6"
              >
                <Link to="/signup" className="w-full sm:w-auto bg-blue-600 text-white px-12 py-6 rounded-full text-lg font-black hover:bg-white hover:text-black transition-all shadow-2xl shadow-blue-600/40">Start Building</Link>
                <Link to="/pricing" className="w-full sm:w-auto border border-white/10 text-white px-12 py-6 rounded-full text-lg font-black hover:bg-white/5 transition-all">Network Rates</Link>
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
                    className="w-[80%] h-[80%] bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[4rem] backdrop-blur-3xl border border-white/10 overflow-hidden shadow-2xl"
                  >
                    <img 
                      src="https://picsum.photos/seed/oplug_tech/1000/1000"
                      alt="Oplug Technology"
                      className="w-full h-full object-cover opacity-50 grayscale mix-blend-overlay"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Floating Stats */}
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-10 -right-10 bg-white text-black p-8 rounded-[2.5rem] shadow-2xl z-20"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Uptime</p>
                  <p className="text-3xl font-black tracking-tighter">99.99%</p>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-10 -left-10 bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-2xl z-20"
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Latency</p>
                  <p className="text-3xl font-black tracking-tighter">14ms</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] bg-blue-600/10 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      </section>

      {/* MARQUEE TRUST */}
      <section className="py-20 border-y border-white/5 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-20 px-10">
              <span className="text-4xl font-black tracking-tighter text-white/10 uppercase">MTN NIGERIA</span>
              <span className="text-4xl font-black tracking-tighter text-white/10 uppercase">AIRTEL</span>
              <span className="text-4xl font-black tracking-tighter text-white/10 uppercase">9MOBILE</span>
              <span className="text-4xl font-black tracking-tighter text-white/10 uppercase">GLO WORLD</span>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES BENTO */}
      <section id="services" className="py-40 lg:py-60 px-6 lg:px-16">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-32 gap-10">
            <div className="max-w-4xl">
              <p className="text-blue-500 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Our Capabilities</p>
              <h2 className="text-7xl lg:text-[100px] font-black tracking-[-0.04em] leading-[0.85] uppercase">
                Engineered for <br />
                <span className="text-white/20">Performance.</span>
              </h2>
            </div>
            <div className="lg:max-w-xs">
              <p className="text-lg text-white/40 font-medium leading-relaxed">
                We've built a robust infrastructure that ensures your transactions are processed in milliseconds, not minutes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white/5 border border-white/10 rounded-[4rem] p-16 relative overflow-hidden group">
              <div className="relative z-10 max-w-md">
                <Rocket className="text-blue-500 mb-10" size={48} />
                <h3 className="text-5xl font-black tracking-tighter mb-8 uppercase">Instant <br />Fulfillment</h3>
                <p className="text-xl text-white/40 font-medium leading-relaxed">
                  Our automated delivery system ensures that 98% of orders are completed in under 5 seconds.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>

            <div className="md:col-span-4 bg-blue-600 rounded-[4rem] p-16 flex flex-col justify-between group hover:bg-white hover:text-black transition-all duration-700">
              <Globe size={64} className="mb-10" />
              <div>
                <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase">Social <br />Growth</h3>
                <p className="text-lg font-medium opacity-70 mb-10">
                  Boost your social presence with our premium SMM panel. Real results, real fast.
                </p>
                <Link to="/smm" className="inline-flex items-center space-x-3 text-[11px] font-black uppercase tracking-widest">
                  <span>Explore SMM</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="md:col-span-4 bg-white/5 border border-white/10 rounded-[4rem] p-16 group hover:border-white/30 transition-all">
              <Smartphone className="text-purple-500 mb-10" size={48} />
              <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase">Mobile <br />First</h3>
              <p className="text-lg text-white/40 font-medium leading-relaxed">
                A seamless experience across all devices. Manage your business on the go.
              </p>
            </div>

            <div className="md:col-span-8 bg-[#111] border border-white/5 rounded-[4rem] p-16 flex flex-col md:flex-row items-center gap-16 group">
              <div className="flex-1">
                <CreditCard className="text-emerald-500 mb-10" size={48} />
                <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase">Secure <br />Payments</h3>
                <p className="text-lg text-white/40 font-medium leading-relaxed">
                  Multiple funding options including bank transfer and card payments, all protected by industry-standard encryption.
                </p>
              </div>
              <div className="flex-1 w-full h-64 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <Logo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROTOCOL SECTION */}
      <section id="how-it-works" className="py-40 lg:py-60 bg-white text-black rounded-[5rem] lg:rounded-[8rem] mx-4 lg:mx-10">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-32 items-start">
            <div className="lg:sticky lg:top-40">
              <p className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-10">The Protocol</p>
              <h2 className="text-[10vw] lg:text-[8vw] font-black leading-[0.82] tracking-[-0.04em] uppercase mb-12">
                Simple. <br />
                Direct. <br />
                <span className="text-gray-300">Fast.</span>
              </h2>
              <Link to="/signup" className="inline-flex items-center space-x-6 bg-black text-white px-12 py-6 rounded-full text-xl font-black hover:bg-blue-600 transition-all">
                <span>Join the Network</span>
                <ArrowRight />
              </Link>
            </div>

            <div className="space-y-32">
              <Step number="01" title="Onboarding" desc="Create your secure digital identity in seconds. No complex forms, just the essentials." />
              <Step number="02" title="Capitalization" desc="Fund your wallet through our secure payment gateways. Instant reflection, zero delays." />
              <Step number="03" title="Execution" desc="Select your service and execute. Our system handles the rest with surgical precision." />
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
            className="text-[15vw] font-black leading-[0.75] tracking-[-0.05em] uppercase mb-24"
          >
            Ready to <br />
            <span className="text-blue-600">Ascend?</span>
          </motion.h2>
          <div className="flex flex-col sm:flex-row justify-center gap-10">
            <Link to="/signup" className="bg-white text-black px-20 py-10 rounded-full text-3xl font-black hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-4 shadow-2xl">Get Started</Link>
            <Link to="/support" className="border border-white/10 text-white px-20 py-10 rounded-full text-3xl font-black hover:bg-white/5 transition-all transform hover:-translate-y-4">Contact Us</Link>
          </div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-blue-600/5 rounded-full blur-[200px] -z-10"></div>
      </section>

      <Footer />
    </div>
  );
};

const Step = ({ number, title, desc }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="flex items-baseline space-x-8 mb-8">
      <span className="text-4xl font-black text-blue-600 tracking-tighter">{number}</span>
      <h3 className="text-6xl font-black tracking-tighter uppercase">{title}</h3>
    </div>
    <p className="text-2xl text-gray-500 font-medium leading-relaxed max-w-xl">
      {desc}
    </p>
    <div className="mt-12 h-px w-full bg-gray-100 group-hover:bg-blue-600 transition-colors duration-700"></div>
  </motion.div>
);

export default LandingPage;
