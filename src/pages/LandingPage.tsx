import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  ArrowRight, CheckCircle2,
  Users,
  Wifi, Tv, Lightbulb, Zap as ZapIcon,
  Bitcoin, Coins, Wallet as WalletIcon
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const services = [
    { name: 'Crypto Hub', icon: <Bitcoin className="w-8 h-8" />, desc: 'Buy, sell, and fund your wallet with Bitcoin, Ethereum, and more.', color: 'bg-orange-500' },
    { name: 'Cheap Data', icon: <Wifi className="w-8 h-8" />, desc: 'Buy cheap data plans for all networks at wholesale prices.', color: 'bg-blue-500' },
    { name: 'Airtime Topup', icon: <Smartphone className="w-8 h-8" />, desc: 'Instant airtime recharge for MTN, GLO, Airtel, and 9mobile.', color: 'bg-emerald-500' },
    { name: 'Cable TV', icon: <Tv className="w-8 h-8" />, desc: 'Renew your DSTV, GOTV, and Startimes subscriptions instantly.', color: 'bg-purple-600' },
    { name: 'Electricity Bills', icon: <Lightbulb className="w-8 h-8" />, desc: 'Pay your electricity bills (Prepaid & Postpaid) with ease.', color: 'bg-yellow-500' },
    { name: 'SMM Services', icon: <Users className="w-8 h-8" />, desc: 'Boost your social media presence with our SMM tools.', color: 'bg-pink-600' },
  ];

  const features = [
    { title: 'Fast Delivery', desc: 'All our services are automated and delivered instantly to your phone.', icon: <ZapIcon className="w-6 h-6 text-emerald-600" /> },
    { title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard security protocols.', icon: <CheckCircle2 className="w-6 h-6 text-green-600" /> },
    { title: '24/7 Support', desc: 'Our dedicated support team is always available to assist you anytime.', icon: <ArrowRight className="w-6 h-6 text-emerald-600" /> },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-emerald-600 selection:text-white">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-br from-gray-900 via-emerald-900 to-black py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-md">
                <Bitcoin size={16} className="text-orange-400" />
                <span>Now Supporting Crypto Payments</span>
              </div>
              <h1 className="text-4xl lg:text-7xl font-extrabold leading-tight mb-6 tracking-tighter">
                The Ultimate <span className="text-emerald-400">Digital Assets</span> Platform
              </h1>
              <p className="text-lg lg:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
                Buy Airtime, Data, and Crypto at the best rates. Secure, fast, and fully automated transactions for the modern Nigerian.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="bg-yellow-400 text-emerald-900 px-8 py-4 rounded-lg text-lg font-bold hover:bg-yellow-500 transition-all shadow-xl">
                  Get Started Now
                </Link>
                <Link to="/login" className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-lg text-lg font-bold hover:bg-white/20 transition-all">
                  Login to Account
                </Link>
              </div>
              <div className="mt-10 flex items-center space-x-4 text-sm text-emerald-200">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} alt="user" className="w-8 h-8 rounded-full border-2 border-emerald-800" />
                  ))}
                </div>
                <span>Trusted by 50,000+ Nigerians</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block relative"
            >
              <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              <img 
                src="https://picsum.photos/seed/crypto-trading/800/800" 
                alt="Digital Assets" 
                className="rounded-3xl shadow-2xl border border-white/10 relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                    <Bitcoin size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Bitcoin Price</p>
                    <p className="text-xl font-black">$64,231</p>
                  </div>
                </div>
              </div>
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
            <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Our Services</h2>
            <p className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">What We Offer You</p>
            <div className="w-20 h-1.5 bg-emerald-600 mx-auto mt-4 rounded-full"></div>
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
                <Link to="/signup" className="text-emerald-600 font-bold flex items-center hover:underline">
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
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Why Choose Us</h2>
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
                <p className="text-4xl font-extrabold text-emerald-600 mb-1">99.9%</p>
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHERE TO BEGIN */}
      <section className="py-24 bg-white dark:bg-emerald-950/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Getting Started</h2>
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
                  <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="#10b981" fillOpacity="0.1" />
                    <path d="M70 150C70 130 80 120 100 120C120 120 130 130 130 150" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                    <circle cx="100" cy="80" r="30" stroke="#10b981" strokeWidth="8" />
                    <path d="M140 60L160 40M160 40H140M160 40V60" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="130" y="80" width="40" height="60" rx="8" fill="white" stroke="#10b981" strokeWidth="4" />
                    <circle cx="150" cy="95" r="5" fill="#10b981" />
                    {/* Crypto Symbol */}
                    <circle cx="40" cy="40" r="15" fill="#f59e0b" fillOpacity="0.2" />
                    <text x="35" y="45" fill="#f59e0b" fontSize="14" fontWeight="bold">₿</text>
                  </svg>
                )
              },
              { 
                step: '02', 
                title: 'Fund Wallet', 
                desc: 'Add money to your wallet via bank transfer or card.',
                svg: (
                  <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="#10b981" fillOpacity="0.1" />
                    <rect x="50" y="70" width="100" height="60" rx="12" stroke="#10b981" strokeWidth="8" />
                    <circle cx="100" cy="100" r="15" stroke="#fbbf24" strokeWidth="8" />
                    <path d="M160 80L180 60M180 60H160M180 60V80" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              },
              { 
                step: '03', 
                title: 'Buy Service', 
                desc: 'Select any service and get instant delivery.',
                svg: (
                  <svg width="160" height="160" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="100" r="80" fill="#10b981" fillOpacity="0.1" />
                    <path d="M60 60H140L150 110H50L60 60Z" stroke="#10b981" strokeWidth="8" strokeLinejoin="round" />
                    <path d="M100 40V60M80 50H120" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
                    <rect x="120" y="40" width="50" height="30" rx="15" fill="#10b981" />
                    <path d="M130 55L140 65L160 45" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-emerald-900/10 p-10 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/30 hover:border-emerald-500 transition-all group">
                <div className="mb-8 flex justify-center">{item.svg}</div>
                <span className="text-emerald-600 font-black text-4xl opacity-20 group-hover:opacity-100 transition-opacity">{item.step}</span>
                <h3 className="text-2xl font-bold mt-4 mb-4 text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES WITH CHARACTERS */}
      <section className="py-24 bg-gray-50 dark:bg-emerald-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div>
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Crypto Trading</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-white">Buy & Sell Crypto</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                Trade Bitcoin, Ethereum, and other popular cryptocurrencies instantly. Our platform provides the most secure and fastest way to manage your digital assets.
              </p>
              <Link to="/signup" className="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl inline-block">
                Start Trading
              </Link>
            </div>
            <div className="flex justify-center">
              {/* Crypto Trading SVG */}
              <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#10b981" fillOpacity="0.05" />
                {/* Chart */}
                <path d="M40 140L70 110L100 130L140 80L160 100" stroke="#10b981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                {/* Coins */}
                <circle cx="140" cy="80" r="20" fill="#f59e0b" />
                <text x="135" y="87" fill="white" fontSize="20" fontWeight="bold">₿</text>
                <circle cx="60" cy="60" r="15" fill="#6366f1" />
                <text x="56" y="65" fill="white" fontSize="14" fontWeight="bold">Ξ</text>
                {/* Character */}
                <path d="M60 180C60 150 80 130 100 130C120 130 140 150 140 180" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              {/* Family watching TV SVG */}
              <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#10b981" fillOpacity="0.05" />
                {/* TV */}
                <rect x="40" y="50" width="120" height="80" rx="10" fill="#064e3b" stroke="#10b981" strokeWidth="8" />
                <rect x="50" y="60" width="100" height="60" rx="4" fill="#10b981" fillOpacity="0.2" />
                {/* Stand */}
                <path d="M80 130L70 150M120 130L130 150" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                {/* Remote Signal */}
                <path d="M170 100L190 100" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" />
                <path d="M175 90L185 90" stroke="#fbbf24" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                {/* Happy Face on TV */}
                <circle cx="100" cy="90" r="15" stroke="white" strokeWidth="4" />
                <path d="M90 95C90 100 110 100 110 95" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Entertainment</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-white">Cable TV Subscription</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                Don't miss your favorite shows. Renew your DSTV, GOTV, and Startimes subscriptions instantly from the comfort of your home.
              </p>
              <Link to="/signup" className="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl inline-block">
                Renew Now
              </Link>
            </div>
          </div>

          {/* New Sections */}
          <div className="grid lg:grid-cols-2 gap-20 items-center mt-32 mb-32">
            <div>
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Instant Funding</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-white">Fund Wallet with Crypto</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                No bank? No problem. Use your crypto assets to fund your Oplug wallet instantly and start buying services immediately.
              </p>
              <Link to="/signup" className="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl inline-block">
                Fund Now
              </Link>
            </div>
            <div className="flex justify-center">
              {/* Wallet Funding SVG */}
              <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#10b981" fillOpacity="0.05" />
                {/* Wallet */}
                <rect x="50" y="70" width="100" height="70" rx="12" fill="#064e3b" stroke="#10b981" strokeWidth="8" />
                <rect x="130" y="90" width="30" height="30" rx="6" fill="#fbbf24" />
                {/* Coins falling into wallet */}
                <motion.g
                  animate={{ y: [0, 40, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <circle cx="100" cy="40" r="10" fill="#f59e0b" />
                  <text x="96" y="44" fill="white" fontSize="10" fontWeight="bold">₿</text>
                </motion.g>
              </svg>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
            <div className="order-2 lg:order-1 flex justify-center">
              {/* Student checking result SVG */}
              <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="90" fill="#10b981" fillOpacity="0.05" />
                {/* Paper/Result */}
                <rect x="60" y="40" width="80" height="100" rx="4" fill="white" stroke="#10b981" strokeWidth="6" />
                <path d="M80 70H120M80 90H120M80 110H100" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                {/* Graduation Cap */}
                <path d="M130 40L160 30L190 40L160 50L130 40Z" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                <path d="M145 45V60" stroke="#10b981" strokeWidth="2" />
                {/* Character */}
                <path d="M40 180C40 160 50 150 70 150" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                <circle cx="70" cy="130" r="20" stroke="#10b981" strokeWidth="8" />
              </svg>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">Education</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-white">Exam Result Pins</p>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-10 leading-relaxed">
                Check your results without stress. Purchase WAEC, NECO, and NABTEB result checker pins instantly and securely.
              </p>
              <Link to="/signup" className="bg-emerald-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl inline-block">
                Buy PIN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* RESELLER CTA */}
      <section className="py-24 bg-white dark:bg-emerald-950/20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight">Start Your Crypto Journey Today!</h2>
                <p className="text-xl text-emerald-100 mb-10 leading-relaxed">
                  Join thousands of users who trust Oplug for their digital asset management. Secure, fast, and reliable.
                </p>
                <Link to="/signup" className="bg-white text-emerald-900 px-10 py-5 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl inline-block">
                  Create Free Account
                </Link>
              </div>
              <div className="flex justify-center">
                {/* Crypto Character SVG */}
                <svg width="350" height="350" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="90" fill="white" fillOpacity="0.1" />
                  {/* Character */}
                  <path d="M60 160C60 130 80 110 100 110C120 110 140 130 140 160" stroke="white" strokeWidth="10" strokeLinecap="round" />
                  <circle cx="100" cy="70" r="30" stroke="white" strokeWidth="10" />
                  {/* Bitcoin Icon */}
                  <circle cx="150" cy="100" r="25" fill="#f59e0b" />
                  <text x="142" y="110" fill="white" fontSize="24" fontWeight="bold">₿</text>
                  {/* Smile */}
                  <path d="M90 75C90 80 110 80 110 75" stroke="white" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API CTA */}
      <section className="py-24 bg-white dark:bg-emerald-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
               {/* Developer Character SVG */}
               <svg width="400" height="400" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="90" fill="#10b981" fillOpacity="0.05" />
                  {/* Laptop */}
                  <rect x="40" y="100" width="120" height="70" rx="8" fill="#064e3b" stroke="#10b981" strokeWidth="6" />
                  <rect x="50" y="110" width="100" height="50" rx="4" fill="#10b981" fillOpacity="0.1" />
                  {/* Code symbols */}
                  <path d="M70 125L60 135L70 145" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M130 125L140 135L130 145" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Character Head peeking */}
                  <path d="M80 100C80 80 90 70 100 70C110 70 120 80 120 100" stroke="#10b981" strokeWidth="8" strokeLinecap="round" />
                  <circle cx="100" cy="60" r="20" stroke="#10b981" strokeWidth="8" />
                  {/* Gear */}
                  <circle cx="160" cy="60" r="15" stroke="#fbbf24" strokeWidth="6" strokeDasharray="4 4" />
               </svg>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-emerald-600 font-bold uppercase tracking-wider mb-2">For Developers</h2>
              <p className="text-4xl lg:text-5xl font-black mb-6 leading-tight text-gray-900 dark:text-white">Integrate Our Powerful API</p>
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
