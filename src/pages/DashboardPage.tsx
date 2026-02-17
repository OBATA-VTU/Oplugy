
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/ServiceCard';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
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
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
      adminService.getGlobalSettings().then(res => {
        if (res.status && res.data?.announcement) {
          setAnnouncement(res.data.announcement);
        }
      });

      // Show PIN modal if PIN is not configured
      if (user && !user.isPinSet) {
        setShowPinModal(true);
      }
    }
  }, [isAuthenticated, user, fetchWalletBalance]);

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user.id, pin);
    if (res.status) {
      setShowPinModal(false);
    } else {
      throw new Error(res.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Spinner />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Establishing Secure Session...</p>
      </div>
    );
  }

  const referralCode = user?.referralCode || 'JOIN';
  const referralLink = `${window.location.origin}/#/signup?ref=${referralCode}`;

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      
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

        {/* Referral Quick Link Banner */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 mb-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group border border-white/5 shadow-2xl shadow-gray-200">
           <div className="relative z-10">
              <h4 className="text-xl font-black tracking-tight mb-2">Refer & Earn Commission</h4>
              <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Share your code: <span className="text-blue-400 font-black">{referralCode}</span></p>
           </div>
           <button 
             onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('Referral link copied to clipboard!');
             }}
             className="bg-blue-600 hover:bg-white hover:text-blue-600 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 relative z-10"
           >
              Copy My Invite Link
           </button>
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform"></div>
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
    </>
  );
};

export default DashboardPage;
