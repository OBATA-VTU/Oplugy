
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
              <a href="#giftcards" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">Gift Cards</a>
              <a href="#testimonials" className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-blue-600 transition-colors">Testimonials</a>
              <Link to="/login" className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Log In</Link>
            </div>

            <button className="md:hidden text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-64 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="lg:flex items-center gap-24">
            <div className="lg:w-3/5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-blue-50 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8 border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
                <span>Experience OBATA v2</span>
              </div>
              <h1 className="text-6xl lg:text-[110px] font-black text-gray-900 leading-[0.85] mb-12 tracking-tighter">
                Everything <br />
                <span className="text-blue-600">Instantly.</span>
              </h1>
              <p className="text-xl lg:text-3xl text-gray-400 mb-16 max-w-2xl leading-tight font-medium tracking-tight mx-auto lg:mx-0">
                Data, Airtime, Cable TV, Electricity, Gaming Credits, Gift Cards, and Airtime-to-Cash. All in one place.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-6">
                <Link to="/signup" className="bg-blue-600 text-white px-16 py-7 rounded-[2rem] text-xl font-black shadow-2xl shadow-blue-200 hover:bg-black transition-all transform hover:-translate-y-2">
                  Get Started Free
                </Link>
                <div className="flex items-center space-x-5 bg-white border border-gray-100 px-10 py-7 rounded-[2rem] shadow-xl">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i+20}`} className="w-10 h-10 rounded-full border-4 border-white shadow-lg" alt="user" />)}
                  </div>
                  <div>
                    <div className="text-lg font-black text-gray-900 tracking-tighter">100k+ Users</div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Plugs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/5 mt-32 lg:mt-0 relative group">
               <div className="relative z-20 bg-white p-4 rounded-[4rem] shadow-2xl border border-gray-100 animate-float">
                  <img 
                    src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&q=80&w=800" 
                    alt="Mobile Payments" 
                    className="rounded-[3.5rem]"
                  />
                  <div className="absolute -bottom-10 -right-10 bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white max-w-xs border border-white/10">
                     <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                           <ExchangeIcon />
                        </div>
                        <div className="text-xs font-black uppercase tracking-widest">Airtime to Cash</div>
                     </div>
                     <p className="text-[11px] font-medium text-white/60">Instant bank alert for your excess airtime. Safe & Secure.</p>
                  </div>
               </div>
               <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-40 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-32">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Our Ecosystem</h2>
            <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter">Instant Value. <br /> Zero Stress.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureBlock icon={<SignalIcon />} title="Data Bundles" desc="Cheap MTN SME, Gifting & Corporate data for all networks." color="blue" />
            <FeatureBlock icon={<PhoneIcon />} title="Airtime Topup" desc="Refill your lines instantly with automated cashback rewards." color="indigo" />
            <FeatureBlock icon={<TvIcon />} title="Cable TV" desc="Renew DStv, GOtv & Startimes. Watch without interruptions." color="purple" />
            <FeatureBlock icon={<BoltIcon />} title="Electricity" desc="Generate tokens for IKEDC, EKEDC, and more in seconds." color="yellow" />
          </div>
        </div>
      </section>

      {/* Gaming & Gift Cards Section */}
      <section id="gaming" className="py-48 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
           <div className="lg:flex items-center gap-32">
              <div className="lg:w-1/2">
                 <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Digital Entertainment</h2>
                 <h3 className="text-5xl lg:text-[100px] font-black text-gray-900 leading-[0.85] tracking-tighter mb-12">Level Up <br /> Your Gaming.</h3>
                 <p className="text-xl text-gray-400 font-medium mb-12 max-w-lg leading-relaxed">
                   Purchase Free Fire Diamonds, Call of Duty Credits, and other gaming top-ups. Or get global Gift Cards (iTunes, Steam, Amazon) instantly.
                 </p>
                 <div className="grid grid-cols-2 gap-8">
                    <MiniFeature icon={<GamingIcon />} title="Free Fire" />
                    <MiniFeature icon={<GamingIcon />} title="COD Mobile" />
                    <MiniFeature icon={<GiftIcon />} title="iTunes Cards" />
                    <MiniFeature icon={<GiftIcon />} title="Steam Cards" />
                 </div>
              </div>
              <div className="lg:w-1/2 mt-24 lg:mt-0">
                 <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000" 
                      alt="Gaming" 
                      className="rounded-[4rem] shadow-2xl"
                    />
                    <div className="absolute -top-10 -left-10 bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-50 flex items-center space-x-5">
                       <div className="w-14 h-14 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center">
                          <GiftIcon />
                       </div>
                       <div>
                          <p className="text-gray-900 font-black tracking-tight">Gift Cards</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Access</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Airtime to Cash Section */}
      <section className="py-40 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
           <div className="lg:flex flex-row-reverse items-center gap-32">
              <div className="lg:w-1/2">
                 <h2 className="text-blue-500 text-xs font-black uppercase tracking-[0.4em] mb-6">Wallet Management</h2>
                 <h3 className="text-5xl lg:text-[100px] font-black text-white leading-[0.85] tracking-tighter mb-12">Airtime to <br /> Cash.</h3>
                 <p className="text-xl text-white/40 font-medium mb-12 leading-relaxed">
                    Accidentally over-recharged? No problem. Convert your excess airtime into real cash delivered straight to your bank account within minutes.
                 </p>
                 <Link to="/signup" className="inline-flex items-center space-x-4 bg-white text-gray-900 px-12 py-5 rounded-2xl font-black text-lg transition-all hover:bg-blue-600 hover:text-white">
                    <span>Convert Now</span>
                    <ExchangeIcon />
                 </Link>
              </div>
              <div className="lg:w-1/2 mt-24 lg:mt-0">
                 <div className="bg-white/5 border border-white/10 p-12 rounded-[4rem] backdrop-blur-3xl">
                    <div className="space-y-8">
                       {[1,2,3].map(i => (
                         <div key={i} className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/5">
                            <div className="flex items-center space-x-4">
                               <div className="w-10 h-10 bg-blue-600/20 text-blue-500 rounded-full flex items-center justify-center">
                                  <PhoneIcon />
                               </div>
                               <div>
                                  <p className="text-white font-bold text-sm tracking-tight">MTN Airtime Sent</p>
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Successful</p>
                               </div>
                            </div>
                            <div className="text-green-500 font-black tracking-tighter">+₦5,000</div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-48 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-32">
            <h2 className="text-blue-600 text-xs font-black uppercase tracking-[0.4em] mb-6">Success Stories</h2>
            <h3 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter">Trusted by Plugs.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ReviewCard 
              name="Boluwatife Ayuba" 
              role="Freelancer" 
              image="https://i.pravatar.cc/150?u=ayuba"
              text="OBATA v2 is a game changer. I buy gaming credits for my Free Fire account and they arrive instantly. The interface is also super clean!"
            />
            <ReviewCard 
              name="Sarah Okafor" 
              role="Business Owner" 
              image="https://i.pravatar.cc/150?u=sarah"
              text="I've used many VTU sites, but OBATA's airtime-to-cash feature is the fastest. Highly recommend for any business person."
            />
            <ReviewCard 
              name="Ahmed Bello" 
              role="Student" 
              image="https://i.pravatar.cc/150?u=ahmed"
              text="Best rates on data subscriptions. I don't go anywhere else. SME data is incredibly cheap here."
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 bg-blue-600 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl lg:text-[120px] font-black text-white leading-[0.8] tracking-tighter mb-16">Plug Into <br /> The Best.</h2>
          <Link to="/signup" className="inline-block bg-gray-900 text-white px-20 py-8 rounded-[2.5rem] text-2xl font-black shadow-2xl hover:bg-white hover:text-blue-600 transition-all transform hover:-translate-y-3">
             Create Your Free Account
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '60px 60px'}}></div>
      </section>

      <Footer />
    </div>
  );
};

const FeatureBlock = ({ icon, title, desc, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-100',
    purple: 'bg-purple-600 shadow-purple-100',
    yellow: 'bg-yellow-500 shadow-yellow-100'
  };
  return (
    <div className="p-10 bg-white rounded-[3rem] border border-gray-100 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 group">
      <div className={`w-16 h-16 ${colors[color]} rounded-2xl flex items-center justify-center text-white mb-10 group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <h4 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{title}</h4>
      <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
};

const MiniFeature = ({ icon, title }: any) => (
  <div className="flex items-center space-x-4 group">
    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
       {icon}
    </div>
    <span className="font-black text-gray-900 tracking-tight">{title}</span>
  </div>
);

const ReviewCard = ({ name, role, image, text }: any) => (
  <div className="p-12 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center">
    <img src={image} className="w-20 h-20 rounded-full border-4 border-white shadow-xl mb-8" alt={name} />
    <p className="text-gray-500 font-medium leading-relaxed italic mb-8">"{text}"</p>
    <div>
      <h5 className="text-gray-900 font-black tracking-tight">{name}</h5>
      <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-1">{role}</p>
    </div>
  </div>
);

export default LandingPage;
