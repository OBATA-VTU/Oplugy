import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  WalletIcon, UsersIcon, ArrowIcon
} from '../components/Icons';
import { motion } from 'motion/react';
import { Globe, Star, MessageSquare, ChevronRight, Play, Zap } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 }
  };

  return (
    <div className="bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-600 scroll-smooth">
      {/* Navigation */}
      <nav className={`fixed w-full z-[100] transition-all duration-700 ${scrolled ? 'bg-white/95 backdrop-blur-3xl shadow-2xl py-4 border-b border-gray-100' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-12">
            <a href="#services" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">Our Services</a>
            <a href="#how-it-works" className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors">How it works</a>
            <Link to="/quick-purchase" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-100">Quick Buy</Link>
            <Link to="/login" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-gray-300">Login</Link>
          </div>
          <Link to="/login" className="md:hidden bg-blue-600 text-white p-4 rounded-2xl shadow-xl">
            <UsersIcon />
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-24 lg:pt-64 lg:pb-80 bg-gradient-to-b from-blue-50/50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-20 lg:gap-32">
          <motion.div 
            className="w-full lg:w-3/5 text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-4 bg-white text-blue-600 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.5em] mb-12 border-2 border-blue-50 mx-auto lg:mx-0 shadow-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span>Fast & Easy Payments</span>
            </div>
            <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[1] lg:leading-[0.9] mb-12 tracking-tighter">
              Instant Data <br />
              <span className="text-blue-600 relative">
                & Airtime.
                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 0 100 5" stroke="#2563eb" strokeWidth="4" fill="none" /></svg>
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-500 mb-16 max-w-2xl font-medium tracking-tight mx-auto lg:mx-0 leading-relaxed">
              Experience the fastest VTU platform in Nigeria. Get cheap data, airtime, and pay bills instantly with zero delays.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-8">
              <Link to="/signup" className="bg-blue-600 text-white px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-3 flex items-center justify-center space-x-4">
                <span>Join Oplug</span>
                <ArrowIcon />
              </Link>
              <Link to="/quick-purchase" className="bg-white border-4 border-gray-100 text-gray-900 px-12 lg:px-20 py-8 lg:py-10 rounded-[3rem] text-xl lg:text-2xl font-black hover:border-blue-600 hover:shadow-2xl transition-all transform hover:-translate-y-3">
                Quick Checkout
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="w-full lg:w-2/5 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
             <div className="relative w-full max-w-md lg:max-w-none">
                <div className="absolute inset-0 bg-blue-600 rounded-[4rem] lg:rounded-[6rem] blur-[120px] opacity-20"></div>
                <div className="relative group overflow-hidden rounded-[4rem] lg:rounded-[6rem] shadow-2xl border-8 border-white">
                  <img src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200" className="w-full h-auto transition-transform duration-700 group-hover:scale-110" alt="Oplug Experience" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/40 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                      <Play className="text-blue-600 fill-blue-600" size={32} />
                    </div>
                  </div>
                </div>
                <motion.div 
                  className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[3rem] shadow-2xl z-20 hidden lg:block border border-gray-50"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">System Status</p>
                   <p className="text-4xl font-black text-emerald-500 tracking-tighter">Servers Online</p>
                </motion.div>
             </div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-24 h-24 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
      </section>

      {/* PARTNERS / NETWORKS */}
      <section className="py-20 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-12">Supported Networks</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/MTN_Logo.svg" className="h-12 lg:h-16" alt="MTN" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Airtel_logo.png/640px-Airtel_logo.png" className="h-12 lg:h-16" alt="Airtel" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/9mobile_Logo.png/1200px-9mobile_Logo.png" className="h-12 lg:h-16" alt="9mobile" referrerPolicy="no-referrer" />
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfZcer-ds2QYQ7lANRzCE5dMglP8I4cR8RfUITEvtO-w&s" className="h-12 lg:h-16" alt="Glo" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-32 lg:py-48 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8">
            <StatItem label="Active Users" value="50K+" icon={<UsersIcon />} />
            <StatItem label="Transactions" value="1M+" icon={<Zap size={32} />} />
            <StatItem label="Servers" value="99.9%" icon={<Globe size={32} />} />
            <StatItem label="Support" value="24/7" icon={<MessageSquare size={32} />} />
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-24">
          <motion.h2 
            className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8"
            {...fadeIn}
          >
            Onboarding
          </motion.h2>
          <motion.h3 
            className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter"
            {...fadeIn}
          >
            How it works
          </motion.h3>
        </div>
        <motion.div 
          className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-16"
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
        >
          <StepCard 
            number="01" 
            title="Create Account" 
            desc="Sign up in seconds. It's very easy and fast." 
            icon={<UsersIcon />}
          />
          <StepCard 
            number="02" 
            title="Add Money" 
            desc="Put money in your wallet safely using your card or transfer." 
            icon={<WalletIcon />}
          />
          <StepCard 
            number="03" 
            title="Buy Now" 
            desc="Buy data, airtime or pay bills and get it immediately." 
            icon={<BoltIcon />}
          />
        </motion.div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-32 lg:py-64 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
           <div className="text-center mb-32 max-w-4xl mx-auto">
              <motion.h2 
                className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8"
                {...fadeIn}
              >
                Infrastructure
              </motion.h2>
              <motion.h3 
                className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none"
                {...fadeIn}
              >
                All your bills <br /> in one place.
              </motion.h3>
           </div>
           
           <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
           >
              <ServiceCard 
                icon={<SignalIcon />} 
                title="Cheap Data" 
                desc="Get cheap data for MTN, Airtel, Glo, and 9mobile instantly." 
                img="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<PhoneIcon />} 
                title="Instant Airtime" 
                desc="Recharge your phone in seconds. Supports all networks." 
                img="https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<BoltIcon />} 
                title="Electricity Bills" 
                desc="Pay your light bills easily and get your token immediately." 
                img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<TvIcon />} 
                title="TV Subscription" 
                desc="Renew your DStv, GOtv, and StarTimes without any stress." 
                img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<UsersIcon />} 
                title="Earn Money" 
                desc="Invite your friends and earn money when they buy data." 
                img="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800"
              />
              <ServiceCard 
                icon={<WalletIcon />} 
                title="Safe & Secure" 
                desc="Your money is safe with us. We use the best security." 
                img="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800"
              />
           </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 lg:py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-12">
            <div className="max-w-2xl">
              <h2 className="text-blue-600 text-[11px] font-black uppercase tracking-[0.5em] mb-8">Testimonials</h2>
              <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">What our users say.</h3>
            </div>
            <div className="flex space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer">
                <ChevronRight className="rotate-180" />
              </div>
              <div className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer">
                <ChevronRight />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <TestimonialCard 
              name="Ayomide S." 
              role="Freelancer" 
              text="Oplug is the fastest VTU platform I've ever used. The data delivery is literally instant!"
              avatar="https://i.pravatar.cc/150?u=ayomide"
            />
            <TestimonialCard 
              name="Blessing O." 
              role="Student" 
              text="I save so much money on data using Oplug. Their prices are unbeatable in the market."
              avatar="https://i.pravatar.cc/150?u=blessing"
            />
            <TestimonialCard 
              name="Chidi K." 
              role="Business Owner" 
              text="The customer support is top-notch. They helped me resolve a payment issue in minutes."
              avatar="https://i.pravatar.cc/150?u=chidi"
            />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-48 lg:py-80 bg-gray-950 relative overflow-hidden text-center text-white">
        <motion.div 
          className="max-w-5xl mx-auto px-6 relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl lg:text-[140px] font-black mb-16 tracking-tighter leading-[0.8]">Get <br /> Started.</h2>
          <p className="text-xl lg:text-3xl text-white/40 font-medium mb-20 max-w-3xl mx-auto">Create your free account today and start buying data and airtime easily.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-10">
             <Link to="/signup" className="bg-blue-600 text-white px-16 lg:px-24 py-10 lg:py-12 rounded-[4rem] text-2xl lg:text-3xl font-black shadow-2xl shadow-blue-200 hover:bg-white hover:text-black transition-all transform hover:-translate-y-4">Join Now</Link>
          </div>
        </motion.div>
        <div className="absolute top-0 left-0 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </section>

      <Footer />
    </div>
  );
};

const StatItem = ({ label, value, icon }: any) => (
  <motion.div 
    className="flex flex-col items-center text-center p-10 bg-white/5 rounded-[3rem] border border-white/10 hover:bg-white/10 transition-all"
    whileHover={{ y: -10 }}
  >
    <div className="text-blue-500 mb-6">{icon}</div>
    <div className="text-5xl font-black mb-2 tracking-tighter">{value}</div>
    <div className="text-white/40 font-bold uppercase text-[10px] tracking-[0.3em]">{label}</div>
  </motion.div>
);

const TestimonialCard = ({ name, role, text, avatar }: any) => (
  <motion.div 
    className="p-12 bg-gray-50 rounded-[4rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group"
    whileHover={{ y: -10 }}
  >
    <div className="flex text-yellow-400 mb-8">
      {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
    </div>
    <p className="text-xl text-gray-600 font-medium leading-relaxed mb-10 italic">"{text}"</p>
    <div className="flex items-center space-x-6">
      <img src={avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt={name} referrerPolicy="no-referrer" />
      <div>
        <h4 className="text-xl font-black text-gray-900 tracking-tight">{name}</h4>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{role}</p>
      </div>
    </div>
  </motion.div>
);

const StepCard = ({ number, title, desc, icon }: any) => (
  <motion.div 
    className="flex flex-col items-center text-center p-12 bg-gray-50 rounded-[4rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all group"
    variants={{
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 }
    }}
  >
    <div className="text-6xl font-black text-blue-600/10 mb-8 group-hover:text-blue-600/20 transition-colors">{number}</div>
    <div className="w-20 h-20 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
    <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

const ServiceCard = ({ icon, title, desc, img }: any) => (
  <motion.div 
    className="bg-white rounded-[4rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-700 group h-full flex flex-col"
    variants={{
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 }
    }}
  >
     <div className="h-64 overflow-hidden relative">
        <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={title} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-10 w-16 h-16 bg-white text-blue-600 rounded-3xl flex items-center justify-center shadow-xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:-translate-y-2">
           {icon}
        </div>
     </div>
     <div className="p-12 pt-8 flex-grow">
        <h4 className="text-3xl font-black text-gray-900 mb-5 tracking-tight">{title}</h4>
        <p className="text-gray-400 text-lg font-medium leading-relaxed">{desc}</p>
     </div>
  </motion.div>
);

export default LandingPage;
