
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  MenuIcon, GamingIcon, GiftIcon, ExchangeIcon 
} from '../components/Icons';

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
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100 py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center">
            <Logo />
            
            <div className="hidden md:flex items-center space-x-12">
              <a href="#services" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">Services</a>
              <a href="#gaming" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">Gaming</a>
              <a href="#testimonials" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">Success Stories</a>
              <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">Log In</Link>
              <Link to="/signup" className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all transform hover:-translate-y-1">
                Join OBATA
              </Link>
            </div>

            <button className="md:hidden text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-64 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center lg:text-left">
          <div className="lg:flex items-center gap-24">
            <div className="lg:w-3/5">
              <div className="inline-flex items-center space-x-3 bg-gray-100 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-8 border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>The Future is Obata v2</span>
              </div>
              <h1 className="text-6xl lg:text-[140px] font-black text-gray-900 leading-[0.85] mb-12 tracking-tighter">
                Payments <br />
                <span className="text-blue-600">Redefined.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl leading-tight font-medium tracking-tight">
                One platform. Every service. Instant delivery. Airtime, Data, Gaming, Gift Cards, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/signup" className="bg-blue-600 text-white px-16 py-7 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-2">
                  Launch Dashboard
                </Link>
                <div className="flex items-center space-x-5 bg-white border border-gray-100 px-10 py-7 rounded-[2rem] shadow-xl">
                  <div className="text-lg font-black text-gray-900">5M+ Transactions</div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5 mt-32 lg:mt-0 relative">
               <div className="bg-gray-900 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group">
                  <div className="space-y-12">
                     <div className="flex justify-between items-center text-white/40 text-[10px] font-black uppercase tracking-widest">
                        <span>OBATA PAY</span>
                        <div className="w-8 h-8 rounded-full bg-blue-600"></div>
                     </div>
                     <div className="space-y-2">
                        <p className="text-white/30 text-xs font-bold">Available Funds</p>
                        <h4 className="text-5xl font-black text-white tracking-tighter">₦182,500.00</h4>
                     </div>
                     <div className="pt-10 space-y-4">
                        <div className="flex justify-between items-center text-white text-sm font-bold">
                           <span>Monthly Spend</span>
                           <span>72%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 w-3/4"></div>
                        </div>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/40 transition-all"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section id="services" className="py-40 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-24">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Omni-Channel Services</h2>
            <h3 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter">The Complete Bundle.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceBlock icon={<PhoneIcon />} title="Airtime" desc="Recharge instantly with up to 5% cashback on all networks." color="blue" />
            <ServiceBlock icon={<SignalIcon />} title="Bulk Data" desc="Cheapest MTN SME and Gifting data delivered in seconds." color="indigo" />
            <ServiceBlock icon={<BoltIcon />} title="Electricity" desc="Pay for IKEDC, EKEDC, and more. Generate tokens instantly." color="yellow" />
            <ServiceBlock icon={<TvIcon />} title="Cable TV" desc="DStv, GOtv, and Startimes renewal without the wait." color="purple" />
          </div>
        </div>
      </section>

      {/* Specialized Services (Gaming & Giftcards) */}
      <section id="gaming" className="py-40 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="lg:flex items-center gap-32">
            <div className="lg:w-1/2">
              <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Gaming & More</h2>
              <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter mb-12 leading-[0.9]">Gear Up, <br /> Pay Smarter.</h3>
              <p className="text-xl text-gray-400 font-medium mb-12 leading-relaxed">
                OBATA is more than just data. We are the home of entertainment. Top up your gaming accounts, buy gift cards, or even turn your airtime into liquid cash.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <MiniService icon={<GamingIcon />} title="Game Topup" desc="Diamonds & COD Points." />
                <MiniService icon={<GiftIcon />} title="Gift Cards" desc="Steam, iTunes, & more." />
                <MiniService icon={<ExchangeIcon />} title="Airtime-to-Cash" desc="Convert Airtime to Bank." />
                <MiniService icon={<SignalIcon />} title="Data Share" desc="Share with friends." />
              </div>
            </div>
            
            <div className="lg:w-1/2 mt-24 lg:mt-0">
              <img 
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000" 
                alt="Gaming Gear" 
                className="rounded-[4rem] shadow-2xl border-8 border-gray-50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-40 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-24">
             <h2 className="text-blue-500 text-xs font-black uppercase tracking-[0.4em] mb-6">Our Community</h2>
             <h3 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">Trusted by Thousands.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <TestimonialCard 
              name="Boluwatife Ayuba" 
              role="Freelancer" 
              text="Obata is literally the fastest. I buy my Free Fire diamonds here and they arrive before I can even close the app!" 
              image="https://i.pravatar.cc/150?u=1" 
            />
            <TestimonialCard 
              name="Sarah Okafor" 
              role="Student" 
              text="The SME data rates are insane. I save so much every month subscribing on Obata instead of directly." 
              image="https://i.pravatar.cc/150?u=2" 
            />
            <TestimonialCard 
              name="Ahmed Musa" 
              role="Business Owner" 
              text="I use the Airtime to Cash feature a lot. It is safe, fast, and the rates are very reasonable compared to others." 
              image="https://i.pravatar.cc/150?u=3" 
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-48 bg-blue-600 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl lg:text-8xl font-black text-white mb-12 tracking-tighter">Ready to join <br /> OBATA v2?</h2>
          <Link to="/signup" className="inline-block bg-white text-blue-600 px-16 py-7 rounded-[2rem] text-xl font-black shadow-2xl hover:bg-gray-900 hover:text-white transition-all transform hover:-translate-y-2">
            Create Free Account
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
      </section>

      <Footer />
    </div>
  );
};

const ServiceBlock = ({ icon, title, desc, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-100',
    yellow: 'bg-yellow-500 shadow-yellow-100',
    purple: 'bg-purple-600 shadow-purple-100'
  };
  return (
    <div className="group p-12 bg-white rounded-[3.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4">
      <div className={`w-16 h-16 ${colors[color]} rounded-2xl flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tighter">{title}</h4>
      <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
};

const MiniService = ({ icon, title, desc }: any) => (
  <div className="flex items-start gap-6 group">
    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      {icon}
    </div>
    <div>
      <h5 className="font-black text-gray-900 tracking-tight">{title}</h5>
      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{desc}</p>
    </div>
  </div>
);

const TestimonialCard = ({ name, role, text, image }: any) => (
  <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-xl">
    <div className="flex items-center gap-4 mb-8">
      <img src={image} className="w-12 h-12 rounded-full border-2 border-blue-500" alt={name} />
      <div>
        <h5 className="text-white font-black tracking-tight">{name}</h5>
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">{role}</p>
      </div>
    </div>
    <p className="text-white/60 font-medium leading-relaxed italic">"{text}"</p>
  </div>
);

export default LandingPage;
