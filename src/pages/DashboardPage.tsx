
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import ReceiptModal from '../components/ReceiptModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon, BoltIcon, ShieldCheckIcon
} from '../components/Icons';

declare const PaystackPop: any;

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance, updateWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const slides = [
    {
      img: "https://images.unsplash.com/photo-1611974714608-35602417562c?auto=format&fit=crop&q=80&w=1200",
      title: "Reseller Tier Redefined",
      desc: "Earn high margins on every transaction. Upgrade for just ₦1,200."
    },
    {
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200",
      title: "Data rates crashed!",
      desc: "MTN SME 1GB now ₦280 for all users."
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

  const handlePaystackUpgrade = () => {
    addNotification("Insufficient balance. Initializing upgrade funding node...", "info");
    const handler = PaystackPop.setup({
      key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
      email: user.email,
      amount: 2500 * 100, // Fixed 2500 as requested
      currency: 'NGN',
      callback: (response: any) => {
        addNotification("Verification successful! Wallet funded and account upgraded.", "success");
        handleResellerUpgrade(true); // Retry upgrade after funding
      },
      onClose: () => {
        addNotification("Transaction aborted.", "warning");
      }
    });
    handler.openIframe();
  };

  const handleResellerUpgrade = async (force = false) => {
    if (user?.role === 'reseller' || user?.role === 'admin') return;
    
    const currentBalance = walletBalance || 0;
    // Check if user has 0 balance or less than 1200
    if (currentBalance < 1200 && !force) {
      handlePaystackUpgrade();
      return;
    }

    setIsUpgrading(true);
    const upgradeRes = await adminService.updateUserRole(user.id, 'reseller');
    if (upgradeRes.status) {
      if (!force) await updateWalletBalance(currentBalance - 1200);
      addNotification("Welcome to Reseller Tier! Your margins have been updated.", "success");
      fetchDashboardData();
    } else {
      addNotification("Upgrade node failed. Contact support.", "error");
    }
    setIsUpgrading(false);
  };

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user.id, pin);
    if (res.status) {
      addNotification("Security PIN set successfully.", "success");
      setShowPinModal(false);
    }
  };

  const openReceipt = (tx: TransactionResponse) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 space-y-10 pb-20">
        
        {/* Main Wallet & Welcome Section */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl border border-white/5 group">
          <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-end gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${user?.role === 'admin' ? 'bg-red-500 shadow-lg shadow-red-500/20' : user?.role === 'reseller' ? 'bg-green-600 shadow-lg shadow-green-500/20' : 'bg-blue-600 shadow-lg shadow-blue-500/20'}`}>
                    {user?.role?.toUpperCase()} NODE
                 </div>
                 <div className="text-white/40 font-black text-[10px] uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full border border-white/10">@{user?.username}</div>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Available Liquidity</p>
                 <div className="text-6xl lg:text-8xl font-black tracking-tighter leading-none flex items-baseline">
                    <span className="text-3xl mr-1 text-white/40">₦</span>
                    {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                 </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                 <div className="bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Affiliate Code</p>
                    <p className="font-black text-blue-400 tracking-tight text-lg uppercase">{user?.referralCode || 'N/A'}</p>
                 </div>
                 {user?.role === 'user' && (
                   <button 
                    onClick={() => handleResellerUpgrade()}
                    disabled={isUpgrading}
                    className="bg-white text-gray-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-50"
                   >
                      {isUpgrading ? <Spinner /> : <><ShieldCheckIcon /> Upgrade to Reseller (₦1,200)</>}
                   </button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
               <ActionBtn onClick={() => navigate('/airtime')} icon={<PhoneIcon />} label="Airtime" />
               <ActionBtn onClick={() => navigate('/data')} icon={<SignalIcon />} label="Data" />
               <ActionBtn onClick={() => navigate('/bills')} icon={<BoltIcon />} label="Electricity" />
               <ActionBtn onClick={() => navigate('/dashboard')} icon={<WalletIcon />} label="Fund" primary />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] -z-0 pointer-events-none group-hover:bg-blue-600/20 transition-all duration-1000"></div>
          <div className="absolute -bottom-20 -left-20 w-[20rem] h-[20rem] bg-blue-400/5 rounded-full blur-[80px] -z-0"></div>
        </div>

        {/* Feature Carousel */}
        <div className="relative h-64 lg:h-96 rounded-[3rem] overflow-hidden group shadow-2xl border-4 border-white animate-in zoom-in-95 duration-700">
           {slides.map((slide, idx) => (
             <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                <img src={slide.img} className="w-full h-full object-cover transform transition-transform duration-[10s] group-hover:scale-110" alt="slide" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-12 flex flex-col justify-end">
                   <h3 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none mb-3">{slide.title}</h3>
                   <p className="text-white/60 text-lg lg:text-xl font-medium max-w-lg">{slide.desc}</p>
                </div>
             </div>
           ))}
        </div>

        {announcement && (
          <div className="bg-blue-600 p-6 rounded-3xl flex items-center space-x-4 shadow-xl shadow-blue-200">
             <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-white/30"><BoltIcon /></div>
             <p className="text-xs font-black text-white uppercase tracking-widest">{announcement}</p>
          </div>
        )}

        {/* Recent Transactions Section */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-12">
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Terminal History</h3>
            <Link to="/history" className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
               View Full Logs
            </Link>
          </div>

          {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
            <div className="space-y-4">
              {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  onClick={() => openReceipt(tx)}
                  className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group transform hover:-translate-x-2"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-sm ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-600'}`}>
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-xl tracking-tight">{tx.source}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString() : 'Processing...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                      {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                    <span className="text-[10px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">Receipt</span>
                  </div>
                </div>
              )) : (
                <div className="py-24 text-center">
                   <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-inner"><HistoryIcon /></div>
                   <h4 className="font-black text-gray-900 text-2xl tracking-tighter">No Activity Logged</h4>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">Your digital footprint will appear here once you initiate a transaction node.</p>
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
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] transition-all hover:scale-105 active:scale-95 group ${primary ? 'bg-white text-gray-900 shadow-2xl' : 'bg-white/5 text-white border border-white/10 hover:bg-blue-600 hover:border-blue-500 shadow-lg'}`}>
     <div className="mb-4 transition-transform group-hover:rotate-12">{icon}</div>
     <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
  </button>
);

export default DashboardPage;
