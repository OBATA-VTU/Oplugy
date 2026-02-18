
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon,
  ShieldCheckIcon, BoltIcon
} from '../components/Icons';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance } = useAuth();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200",
      title: "Lowest Data Rates in Nigeria",
      desc: "Buy 1GB for as low as ₦280."
    },
    {
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
      title: "Instant Wallet Funding",
      desc: "Get funded automatically via Paystack."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      fetchWalletBalance();
      setIsHistoryLoading(true);
      const [settingsRes, historyRes] = await Promise.all([
        adminService.getGlobalSettings(),
        vtuService.getTransactionHistory()
      ]);
      if (settingsRes.status && settingsRes.data?.announcement) setAnnouncement(settingsRes.data.announcement);
      if (historyRes.status && historyRes.data) setRecentTransactions(historyRes.data.slice(0, 10));
      setIsHistoryLoading(false);
    }
  }, [user, fetchWalletBalance]);

  useEffect(() => {
    fetchDashboardData();
    if (user && !user.isPinSet) setShowPinModal(true);
  }, [fetchDashboardData, user]);

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user.id, pin);
    if (res.status) setShowPinModal(false);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12 pb-20">
        
        {/* HERO CARD */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900 rounded-[3.5rem] p-10 lg:p-14 text-white shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-red-500' : 'bg-blue-600'}`}>
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'reseller' ? 'Reseller Node' : 'Standard Plug'}
                  </span>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">@{user?.username}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Portfolio Balance</p>
                <div className="text-6xl lg:text-8xl font-black tracking-tighter leading-none">
                  ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="flex items-center space-x-6">
                   <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Invite Code</p>
                      <p className="font-black text-blue-400 tracking-tight">{user?.referralCode || 'N/A'}</p>
                   </div>
                   <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Invite Earnings</p>
                      <p className="font-black text-green-400 tracking-tight">₦{(user?.referralEarnings || 0).toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                 <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center space-y-3 bg-white text-gray-900 p-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05]">
                    <WalletIcon /><span>Fund Wallet</span>
                 </button>
                 <button onClick={() => navigate('/airtime')} className="flex flex-col items-center justify-center space-y-3 bg-blue-600/50 backdrop-blur-md text-white p-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900 border border-white/10">
                    <PhoneIcon /><span>Airtime</span>
                 </button>
                 <button onClick={() => navigate('/data')} className="flex flex-col items-center justify-center space-y-3 bg-blue-600/50 backdrop-blur-md text-white p-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900 border border-white/10">
                    <SignalIcon /><span>Data Bundle</span>
                 </button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-500/10 rounded-full blur-[120px] -z-0"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[80px] -z-0"></div>
        </div>

        {/* ANNOUNCEMENT STRIP */}
        {announcement && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center space-x-4 animate-in slide-in-from-left duration-700">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0"><BoltIcon /></div>
             <p className="text-sm font-black text-blue-800 tracking-tight">{announcement}</p>
          </div>
        )}

        {/* IMAGE SLIDESHOW */}
        <div className="relative h-72 rounded-[3.5rem] overflow-hidden group shadow-2xl border border-white">
           {slides.map((slide, idx) => (
             <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === slideIndex ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.img} className="w-full h-full object-cover" alt="slide" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12 flex flex-col justify-end">
                   <h3 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{slide.title}</h3>
                   <p className="text-white/60 font-medium text-lg">{slide.desc}</p>
                </div>
             </div>
           ))}
           <div className="absolute bottom-10 right-12 flex space-x-3">
              {slides.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === slideIndex ? 'bg-blue-600 w-10' : 'bg-white/50 w-3'}`}></div>
              ))}
           </div>
        </div>

        {/* TRANSACTION HISTORY STREAM */}
        <div className="bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-2xl shadow-gray-100 border border-gray-50">
          <div className="flex justify-between items-center mb-12">
            <div>
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Activity Ledger</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live stream of your account operations</p>
            </div>
            <Link to="/history" className="text-blue-600 font-black text-[11px] uppercase tracking-widest bg-blue-50 px-8 py-4 rounded-[1.5rem] hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-2">
               <span>Open Full Ledger</span><HistoryIcon />
            </Link>
          </div>

          {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-7 bg-gray-50/50 rounded-[2.5rem] hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center space-x-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-sm ${tx.status === 'SUCCESS' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 tracking-tight text-xl">{tx.source}</p>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                        {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleString() : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black tracking-tighter ${tx.type === 'FUNDING' || tx.type === 'REFERRAL' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'FUNDING' || tx.type === 'REFERRAL' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{tx.status}</span>
                  </div>
                </div>
              )) : (
                <div className="py-32 text-center">
                   <div className="w-24 h-24 bg-gray-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 text-gray-200"><HistoryIcon /></div>
                   <h4 className="font-black text-gray-900 text-2xl tracking-tighter">No transactions yet</h4>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Fund your wallet or refer friends to see your financial activity here.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
