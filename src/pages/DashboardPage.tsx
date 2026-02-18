
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
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon, ArrowIcon,
  ShieldCheckIcon, UsersIcon, BoltIcon
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
      if (historyRes.status && historyRes.data) setRecentTransactions(historyRes.data);
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
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl shadow-blue-900/20">
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-red-500' : 'bg-blue-600'}`}>
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'reseller' ? 'Reseller Node' : 'Standard Account'}
                  </span>
                  <span className="text-white/40 font-black text-[10px] uppercase tracking-widest">@{user?.username}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Wallet Assets</p>
                <div className="text-6xl lg:text-8xl font-black tracking-tighter leading-none">
                  ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                </div>
                <div className="flex items-center space-x-6">
                   <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Referral Code</p>
                      <p className="font-black text-blue-400 tracking-tight">{user?.referralCode || 'N/A'}</p>
                   </div>
                   <div className="w-px h-8 bg-white/10"></div>
                   <div>
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Earnings</p>
                      <p className="font-black text-green-400 tracking-tight">₦{(user?.referralEarnings || 0).toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row gap-4">
                 <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center space-x-3 bg-white text-gray-900 p-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all hover:scale-[1.05]">
                    <WalletIcon /><span>Fund Account</span>
                 </button>
                 <button onClick={() => navigate('/airtime')} className="flex items-center justify-center space-x-3 bg-blue-600 text-white p-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900">
                    <PhoneIcon /><span>Airtime</span>
                 </button>
                 <button onClick={() => navigate('/data')} className="flex items-center justify-center space-x-3 bg-blue-600 text-white p-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all hover:bg-white hover:text-gray-900">
                    <SignalIcon /><span>Data Plans</span>
                 </button>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-500/10 rounded-full blur-[120px] -z-0"></div>
        </div>

        {/* SLIDESHOW */}
        <div className="relative h-64 rounded-[3rem] overflow-hidden group shadow-xl">
           <img src={slides[slideIndex].img} className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000" alt="slide" />
           <div className="absolute inset-0 bg-black/40 p-12 flex flex-col justify-end">
              <h3 className="text-3xl font-black text-white tracking-tight">{slides[slideIndex].title}</h3>
              <p className="text-white/70 font-medium">{slides[slideIndex].desc}</p>
           </div>
           <div className="absolute bottom-6 right-10 flex space-x-2">
              {slides.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === slideIndex ? 'bg-blue-600 w-6' : 'bg-white/50'}`}></div>
              ))}
           </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-xl border border-gray-50">
          <div className="flex justify-between items-center mb-12">
            <div>
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Activity Stream</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Live ledger of your account operations</p>
            </div>
            <Link to="/history" className="text-blue-600 font-black text-[11px] uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-2">
               <span>View All Logs</span><HistoryIcon />
            </Link>
          </div>

          {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100 group">
                  <div className="flex items-center space-x-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${tx.status === 'SUCCESS' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 tracking-tight text-lg">{tx.source}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{tx.status}</span>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200"><HistoryIcon /></div>
                   <p className="font-black text-gray-900 text-xl tracking-tighter">No transactions yet.</p>
                   <p className="text-gray-400 text-sm mt-2">Fund your wallet to start plugging.</p>
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
