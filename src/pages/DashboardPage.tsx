
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';
import { adminService } from '../services/adminService';
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
  const [announcement, setAnnouncement] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
      adminService.getGlobalSettings().then(res => {
        if (res.status && res.data?.announcement) {
          setAnnouncement(res.data.announcement);
        }
      });
    }
  }, [isAuthenticated, fetchWalletBalance]);

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
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Welcome Home</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">
          Greetings, {user?.fullName?.split(' ')[0] || 'User'}.
        </h1>
      </div>

      {announcement && (
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl mb-12 flex items-start space-x-4 animate-in slide-in-from-top-4">
           <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <BoltIcon />
           </div>
           <div>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">Global Announcement</p>
              <p className="text-gray-800 font-bold leading-relaxed">{announcement}</p>
           </div>
        </div>
      )}

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
