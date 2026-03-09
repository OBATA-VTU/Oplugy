import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  ArrowRight, CheckCircle2,
  Users, TrendingUp,
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

      {/* HOW IT WORKS */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider mb-2">How It Works</h2>
            <p className="text-3xl lg:text-4xl font-extrabold">Start in 3 Simple Steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for a free account in less than a minute with your basic details.' },
              { step: '02', title: 'Fund Wallet', desc: 'Add money to your wallet using any of our secure payment methods.' },
              { step: '03', title: 'Purchase Service', desc: 'Select any service you want and get it delivered to you instantly.' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="text-6xl font-black text-blue-600/10 absolute -top-10 left-1/2 -translate-x-1/2 z-0">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/signup" className="bg-blue-600 text-white px-10 py-4 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg">
              Get Started Now
            </Link>
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

      {/* CTA SECTION */}
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

      <Footer />
    </div>
  );
};

export default LandingPage;
