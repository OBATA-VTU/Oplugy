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
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon, BoltIcon
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
      title: "Data rates crashed!",
      desc: "MTN SME 1GB now ₦280 for all users."
    },
    {
      img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200",
      title: "Earn as you refer",
      desc: "Get ₦500 instantly when your referral funds ₦2,000."
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
      if (historyRes.status && historyRes.data) setRecentTransactions(historyRes.data.slice(0, 5));
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
      alert("Please ensure you have ₦1,200 in your wallet. Logic is active.");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8 pb-20">
        
        {/* REFINED DASHBOARD HERO - COMPACT BUT PROMINENT */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl border border-white/5 group">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                 <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-red-500' : user?.role === 'reseller' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {user?.role?.toUpperCase()} NODE
                 </div>
                 <div className="text-white/40 font-black text-[8px] uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">@{user?.username}</div>
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Portfolio Balance</p>
                 <div className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">
                    ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                 </div>
              </div>
              <div className="flex items-center space-x-4">
                 <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest">Referral Code</p>
                    <p className="font-black text-blue-400 tracking-tight text-xs uppercase">{user?.referralCode || 'N/A'}</p>
                 </div>
                 {user?.role !== 'reseller' && (
                   <button onClick={handleResellerUpgrade} className="bg-blue-600 hover:bg-white hover:text-blue-600 text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all">
                      Upgrade (₦1,200)
                   </button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
               <ActionBtn onClick={() => navigate('/dashboard')} icon={<WalletIcon />} label="Fund" primary />
               <ActionBtn onClick={() => navigate('/airtime')} icon={<PhoneIcon />} label="Airtime" />
               <ActionBtn onClick={() => navigate('/data')} icon={<SignalIcon />} label="Data" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] -z-0 pointer-events-none"></div>
        </div>

        {/* IMAGE SLIDER */}
        <div className="relative h-48 rounded-[2rem] overflow-hidden group shadow-xl border border-white">
           {slides.map((slide, idx) => (
             <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.img} className="w-full h-full object-cover" alt="slide" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                   <h3 className="text-xl font-black text-white tracking-tighter leading-none mb-1">{slide.title}</h3>
                   <p className="text-white/60 text-xs font-medium">{slide.desc}</p>
                </div>
             </div>
           ))}
        </div>

        {/* ANNOUNCEMENT */}
        {announcement && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center space-x-3">
             <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg"><BoltIcon /></div>
             <p className="text-xs font-black text-blue-800 tracking-tight">{announcement}</p>
          </div>
        )}

        {/* TRANSACTION HISTORY LEDGER */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-900 tracking-tighter">Terminal Ledger</h3>
            <Link to="/history" className="text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
               Full History
            </Link>
          </div>

          {isHistoryLoading ? <div className="py-10 flex justify-center"><Spinner /></div> : (
            <div className="space-y-3">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-100 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${tx.status === 'SUCCESS' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">{tx.source}</p>
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                        {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString() : 'Pending...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center">
                   <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-200"><HistoryIcon /></div>
                   <h4 className="font-black text-gray-900 text-sm tracking-tighter">No logs found</h4>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ActionBtn = ({ onClick, icon, label, primary }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all hover:scale-105 ${primary ? 'bg-white text-gray-900 shadow-xl' : 'bg-white/10 text-white border border-white/10 hover:bg-white hover:text-gray-900'}`}>
     <div className="mb-2">{icon}</div>
     <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default DashboardPage;