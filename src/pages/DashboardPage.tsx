
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
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon, BoltIcon, ArrowIcon, UsersIcon, ShieldCheckIcon
} from '../components/Icons';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance } = useAuth();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
      title: "Lowest Data Rates in Nigeria",
      desc: "Buy 1GB for as low as ₦280. Automate your savings."
    },
    {
      img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200",
      title: "Earn More as a Reseller",
      desc: "Upgrade for ₦1,200 and unlock exclusive partner pricing."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % slides.length), 6000);
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
      if (historyRes.status && historyRes.data) setRecentTransactions(historyRes.data.slice(0, 8));
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

  const handleResellerUpgrade = () => {
    if (window.confirm("Upgrade to Reseller for ₦1,200?")) {
      alert("This will deduct ₦1,200 from your wallet and activate reseller pricing.");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10 pb-20">
        
        {/* REFINED BALANCE HERO CARD */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-10 lg:p-12 text-white shadow-2xl border border-white/5 group">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-red-500' : user?.role === 'reseller' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {user?.role?.toUpperCase()} NODE
                 </div>
                 <div className="text-white/40 font-black text-[9px] uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">@{user?.username}</div>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Portfolio Value</p>
                 <div className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
                    ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                 </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 w-fit p-1 rounded-2xl border border-white/10">
                 <div className="px-4 py-2">
                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Referral Code</p>
                    <p className="font-black text-blue-400 tracking-tight text-sm uppercase">{user?.referralCode || 'OBATA-NEW'}</p>
                 </div>
                 {user?.role !== 'reseller' && (
                   <button onClick={handleResellerUpgrade} className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all">
                      Upgrade to Reseller
                   </button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-[450px]">
               <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center p-6 bg-white text-gray-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105">
                  <WalletIcon /><span className="mt-3">Fund Account</span>
               </button>
               <button onClick={() => navigate('/airtime')} className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all hover:bg-white hover:text-gray-900">
                  <PhoneIcon /><span className="mt-3">Buy Airtime</span>
               </button>
               <button onClick={() => navigate('/data')} className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all hover:bg-white hover:text-gray-900">
                  <SignalIcon /><span className="mt-3">Get Data</span>
               </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
        </div>

        {/* IMAGE SLIDER */}
        <div className="relative h-64 rounded-[2.5rem] overflow-hidden group shadow-2xl border-4 border-white">
           {slides.map((slide, idx) => (
             <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.img} className="w-full h-full object-cover" alt="slide" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/10 to-transparent p-12 flex flex-col justify-end">
                   <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">{slide.title}</h3>
                   <p className="text-white/70 font-medium">{slide.desc}</p>
                </div>
             </div>
           ))}
           <div className="absolute bottom-8 right-10 flex space-x-2">
              {slides.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-blue-600 w-10' : 'bg-white/50 w-3'}`}></div>
              ))}
           </div>
        </div>

        {/* ANNOUNCEMENT */}
        {announcement && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center space-x-4 animate-in slide-in-from-left duration-700">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200"><BoltIcon /></div>
             <p className="text-sm font-black text-blue-800 tracking-tight">{announcement}</p>
          </div>
        )}

        {/* TRANSACTION HISTORY LEDGER */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-2xl shadow-gray-100 border border-gray-50">
          <div className="flex justify-between items-center mb-10">
            <div>
               <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Activity Ledger</h3>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Real-time terminal logs</p>
            </div>
            <Link to="/history" className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center space-x-2">
               <span>Full History</span><HistoryIcon />
            </Link>
          </div>

          {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[2.5rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-blue-100 group">
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm ${tx.status === 'SUCCESS' ? 'bg-white text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 tracking-tight text-lg">{tx.source}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleString() : 'Processing Matrix...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black tracking-tighter ${tx.type === 'FUNDING' || tx.type === 'REFERRAL' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'FUNDING' || tx.type === 'REFERRAL' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${tx.status === 'SUCCESS' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-100'}`}>{tx.status}</span>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200"><HistoryIcon /></div>
                   <h4 className="font-black text-gray-900 text-xl tracking-tighter">No Operations Found</h4>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">Perform a recharge or fund your account to see live ledger entries.</p>
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
