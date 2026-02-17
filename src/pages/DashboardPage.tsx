
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';
import { SERVICE_CATEGORIES } from '../constants';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  GamingIcon, GiftIcon, ExchangeIcon, CurrencyDollarIcon
} from '../components/Icons';

const serviceIcons: { [key: string]: React.ReactNode } = {
  airtime: <PhoneIcon />,
  data: <SignalIcon />,
  bills: <BoltIcon />,
  cable: <TvIcon />,
  pricing: <CurrencyDollarIcon />,
  gaming: <GamingIcon />,
  giftcards: <GiftIcon />,
  airtime_to_cash: <ExchangeIcon />,
};

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, isAuthenticated, user } = useAuth();
  const [activeServices] = useState(SERVICE_CATEGORIES);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated, fetchWalletBalance]);

  const referralLink = `${window.location.origin}/#/signup?ref=${user?.referralCode || user?.id || 'OBATA'}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Spinner />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Establishing Secure Session...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="mb-16">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Welcome Home</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
          Greetings, {user?.fullName?.split(' ')[0] || 'User'}.
        </h1>
      </div>

      {/* Referral Card */}
      <div className="bg-blue-600 rounded-[3rem] p-10 lg:p-14 text-white mb-12 relative overflow-hidden shadow-2xl shadow-blue-200">
         <div className="relative z-10 lg:flex items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
               <h3 className="text-3xl font-black tracking-tighter mb-4">Refer & Earn Big</h3>
               <p className="text-white/70 font-medium text-sm leading-relaxed mb-8 max-w-sm">
                 Earn instant commissions when your friends join OBATA v2 and fund their wallets. Passive income made easy.
               </p>
               <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between overflow-hidden">
                     <span className="text-[11px] font-black truncate mr-4 opacity-80">{referralLink}</span>
                     <button 
                        onClick={copyReferral}
                        className={`flex-shrink-0 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                     >
                        {copied ? 'Copied!' : 'Copy Link'}
                     </button>
                  </div>
               </div>
            </div>
            <div className="lg:w-1/3 grid grid-cols-2 gap-4">
               <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center">
                  <div className="text-2xl font-black">{user?.referralCount || 0}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Referrals</div>
               </div>
               <div className="bg-white/10 p-6 rounded-3xl border border-white/10 text-center">
                  <div className="text-2xl font-black">₦{user?.referralEarnings?.toLocaleString() || 0}</div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-white/40">Total Earned</div>
               </div>
            </div>
         </div>
         <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {activeServices.map((service) => (
          <ServiceCard
            key={service.id}
            title={service.name}
            description={service.description}
            icon={serviceIcons[service.id]}
            to={service.path}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
