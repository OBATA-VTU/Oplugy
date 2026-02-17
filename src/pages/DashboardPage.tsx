
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';
import { SERVICE_CATEGORIES } from '../constants';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  GamingIcon, GiftIcon, ExchangeIcon 
} from '../components/Icons';

const serviceIcons: { [key: string]: React.ReactNode } = {
  airtime: <PhoneIcon />,
  data: <SignalIcon />,
  bills: <BoltIcon />,
  cable: <TvIcon />,
  gaming: <GamingIcon />,
  giftcards: <GiftIcon />,
  airtime_to_cash: <ExchangeIcon />,
};

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, isAuthenticated, user } = useAuth();
  const [activeServices, setActiveServices] = useState(SERVICE_CATEGORIES);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    }
  }, [isAuthenticated, fetchWalletBalance]);

  const handleRefreshServices = async () => {
    setIsRefreshing(true);
    // Refreshing connection to OBATA service clusters
    await new Promise(resolve => setTimeout(resolve, 800));
    setActiveServices(SERVICE_CATEGORIES);
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Spinner />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing with OBATA Cluster...</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Secured Session</h2>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
            Hello, {user?.fullName?.split(' ')[0] || 'User'}.
          </h1>
        </div>
        <button 
          onClick={handleRefreshServices}
          className="flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all"
        >
          {isRefreshing ? <Spinner /> : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              <span>Refresh Services</span>
            </>
          )}
        </button>
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

      <div className="mt-20 p-12 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden">
         <div className="relative z-10 lg:flex items-center justify-between gap-10">
            <div className="max-w-xl">
               <h3 className="text-3xl font-black tracking-tighter mb-4">Refer a Friend, Get Rewarded.</h3>
               <p className="text-white/40 font-medium leading-relaxed">
                 Invite your friends to OBATA v2 and get instant referral bonuses on their first wallet funding.
               </p>
            </div>
            <button className="mt-8 lg:mt-0 bg-blue-600 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-blue-600 transition-all shadow-xl shadow-blue-500/20">
               Copy Referral Link
            </button>
         </div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default DashboardPage;
