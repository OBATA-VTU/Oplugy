import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  ArrowRight, CheckCircle2,
  Users,
  Wifi, Tv, Lightbulb, Zap as ZapIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const services = [
    { name: 'Airtime Topup', icon: <Smartphone className="w-8 h-8" />, desc: 'Instant airtime recharge for MTN, GLO, Airtel, and 9mobile.', color: 'bg-blue-500' },
    { name: 'Cheap Data', icon: <Wifi className="w-8 h-8" />, desc: 'Buy cheap data plans for all networks at wholesale prices.', color: 'bg-green-500' },
    { name: 'Cable TV', icon: <Tv className="w-8 h-8" />, desc: 'Renew your DSTV, GOTV, and Startimes subscriptions instantly.', color: 'bg-purple-500' },
    { name: 'Electricity Bills', icon: <Lightbulb className="w-8 h-8" />, desc: 'Pay your electricity bills (Prepaid & Postpaid) with ease.', color: 'bg-yellow-500' },
    { name: 'Exam Pins', icon: <CheckCircle2 className="w-8 h-8" />, desc: 'Purchase WAEC, NECO, and NABTEB result checker pins.', color: 'bg-red-500' },
    { name: 'SMM Services', icon: <Users className="w-8 h-8" />, desc: 'Boost your social media presence with our SMM tools.', color: 'bg-indigo-500' },
  ];

  const features = [
    { title: 'Fast Delivery', desc: 'All our services are automated and delivered instantly to your phone.', icon: <ZapIcon className="w-6 h-6 text-blue-600" /> },
    { title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard security protocols.', icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> },
    { title: '24/7 Support', desc: 'Our dedicated support team is always available to assist you anytime.', icon: <ArrowRight className="w-6 h-6 text-purple-600" /> },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-blue-700 to-blue-900 py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
                Fast, Reliable & Secure <span className="text-yellow-400">VTU Platform</span>
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 mb-10 leading-relaxed">
                Experience the best way to buy Airtime, Data, Pay Bills, and more at the cheapest rates in Nigeria. Join thousands of happy users today!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-500 transition-all shadow-xl">
                  Get Started Now
                </Link>
                <Link to="/login" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/20 transition-all">
                  Login to Account
                </Link>
              </div>
              <div className="mt-10 flex items-center space-x-4 text-sm text-blue-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="w-8 h-8 rounded-full border-2 border-blue-800" />
                  ))}
                </div>
                <span>Trusted by 50,000+ Nigerians</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              <img 
                src="https://picsum.photos/seed/nigeria-vtu/800/600" 
                alt="VTU Services" 
                className="rounded-2xl shadow-2xl border-8 border-white/10"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">Our Services</h2>
            <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">What We Offer You</p>
            <div className="w-20 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
              >
                <div className={`${service.color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {service.desc}
                </p>
                <Link to="/signup" className="text-blue-600 font-bold flex items-center hover:underline">
                  Buy Now <ArrowRight size={16} className="ml-2" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">Why Choose Us</h2>
              <p className="text-3xl lg:text-4xl font-extrabold mb-6">Experience Seamless Digital Transactions</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10">
                We provide the most reliable and affordable VTU services in Nigeria. Our platform is designed to give you the best value for your money.
              </p>
              
              <div className="space-y-8">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/vtu-features/600/700" 
                alt="Features" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -left-10 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 hidden md:block">
                <p className="text-4xl font-extrabold text-blue-600 mb-1">99.9%</p>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHERE TO BEGIN */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">Getting Started</h2>
            <p className="text-4xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">Where to Begin?</p>
            <p className="text-gray-500 mt-4 text-lg">Follow these 3 simple steps to start enjoying our services.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                title: 'Create Account', 
                desc: 'Sign up in seconds with just your basic details.',
                svg: (
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
                    <circle cx="50" cy="40" r="15" stroke="#2563EB" strokeWidth="4" />
                    <path d="M30 75C30 65 40 60 50 60C60 60 70 65 70 75" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                    <path d="M75 30L85 20M85 20H75M85 20V30" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
              { 
                step: '02', 
                title: 'Fund Wallet', 
                desc: 'Add money to your wallet via bank transfer or card.',
                svg: (
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="20" y="30" width="60" height="40" rx="8" stroke="#2563EB" strokeWidth="4" />
                    <circle cx="50" cy="50" r="8" stroke="#FBBF24" strokeWidth="4" />
                    <path d="M80 45V55" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                    <path d="M10 50H20" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )
              },
              { 
                step: '03', 
                title: 'Buy Service', 
                desc: 'Select any service and get instant delivery.',
                svg: (
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 20H70L80 50H20L30 20Z" stroke="#2563EB" strokeWidth="4" strokeLinejoin="round" />
                    <rect x="25" y="50" width="50" height="30" stroke="#2563EB" strokeWidth="4" />
                    <path d="M50 60V70M40 65H60" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-all group">
                <div className="mb-8">{item.svg}</div>
                <span className="text-blue-600 font-black text-4xl opacity-20 group-hover:opacity-100 transition-opacity">{item.step}</span>
                <h3 className="text-2xl font-bold mt-4 mb-4 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">Testimonials</h2>
            <p className="text-3xl lg:text-4xl font-extrabold">What Our Users Say</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Emeka Obi', role: 'Business Owner', text: 'This is the best VTU platform I have used. The data delivery is super fast and the prices are very affordable.' },
              { name: 'Amina Yusuf', role: 'Student', text: 'I love how easy it is to buy data on this site. No more stress, and I save a lot of money every month.' },
              { name: 'Olawale Adeyemi', role: 'Freelancer', text: 'Reliable and secure. I use it for all my utility bills and airtime topups. Highly recommended!' },
            ].map((t, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-1 text-yellow-500 mb-4">
                  {[1, 2, 3, 4, 5].map(s => <ZapIcon key={s} size={16} fill="currentColor" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-400 italic mb-6">"{t.text}"</p>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold mb-6">Ready to Experience Fast VTU?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of Nigerians who trust us for their daily digital needs. Sign up now and start enjoying cheap rates!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="bg-white text-blue-600 px-10 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all shadow-xl">
              Create Free Account
            </Link>
            <Link to="/support" className="bg-blue-700 text-white border border-blue-500 px-10 py-4 rounded-lg font-bold hover:bg-blue-800 transition-all">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORTED BY */}
      <section className="py-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Supported Networks & Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {['MTN', 'Airtel', 'Glo', '9mobile', 'DSTV', 'GOTV', 'Startimes', 'Paystack'].map(p => (
               <span key={p} className="text-2xl font-black tracking-tighter text-gray-400">{p}</span>
             ))}
          </div>
        </div>
      </section>

      {/* RESELLER CTA */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Start Your Own VTU Business Today!</h2>
                <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
                  Join our reseller program and get access to even cheaper rates. Build your own customer base and earn daily income with Oplug.
                </p>
                <Link to="/signup" className="bg-white text-indigo-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-xl inline-block">
                  Become a Reseller
                </Link>
              </div>
              <div className="flex justify-center">
                {/* SVG Character for Reseller */}
                <svg width="300" height="300" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
                  <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1" />
                  <path d="M60 140C60 117.909 77.9086 100 100 100C122.091 100 140 117.909 140 140" stroke="white" strokeWidth="12" strokeLinecap="round" />
                  <circle cx="100" cy="65" r="25" stroke="white" strokeWidth="12" />
                  <path d="M130 80L150 60M150 60L130 40M150 60H100" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
        </div>
      </section>

      {/* API CTA */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
               {/* SVG Character for API */}
               <svg width="350" height="350" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="40" y="40" width="120" height="120" rx="20" stroke="#2563EB" strokeWidth="8" />
                  <path d="M70 80L50 100L70 120" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M130 80L150 100L130 120" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M110 70L90 130" stroke="#FBBF24" strokeWidth="8" strokeLinecap="round" />
               </svg>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">For Developers</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Integrate Our Powerful API</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                Build your own VTU application using our robust and well-documented API. Fast response times and 99.9% uptime guaranteed.
              </p>
              <Link to="/api-docs" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-10 py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-xl inline-block">
                View API Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
