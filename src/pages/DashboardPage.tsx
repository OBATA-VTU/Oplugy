
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import ReceiptModal from '../components/ReceiptModal';
import PinPromptModal from '../components/PinPromptModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, SignalIcon, WalletIcon, HistoryIcon, BoltIcon, ShieldCheckIcon,
  TvIcon, GamingIcon, UsersIcon
} from '../components/Icons';

declare const PaystackPop: any;

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance, updateWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

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

  const executeUpgrade = async (isPaymentVerified = false) => {
    setIsUpgrading(true);
    try {
      const upgradeRes = await adminService.updateUserRole(user.id, 'reseller');
      if (upgradeRes.status) {
        if (!isPaymentVerified) {
          const currentBalance = walletBalance || 0;
          await updateWalletBalance(currentBalance - 1200);
        }
        addNotification("Success! You are now a Reseller.", "success");
        fetchDashboardData();
      } else {
        addNotification("Upgrade failed.", "error");
      }
    } catch (error) {
      addNotification("A system error occurred. Please try again.", "error");
    }
    setIsUpgrading(false);
  };

  const handleResellerUpgrade = async () => {
    if (user?.role === 'reseller' || user?.role === 'admin') return;
    if ((walletBalance || 0) < 1200) {
      navigate('/funding');
      addNotification("Please fund your wallet with at least ₦1,200 to upgrade.", "warning");
      return;
    }
    setShowPinPrompt(true);
  };

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user.id, pin);
    if (res.status) {
      addNotification("Your Security PIN has been saved.", "success");
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
      <PinPromptModal 
        isOpen={showPinPrompt} 
        onClose={() => setShowPinPrompt(false)} 
        onSuccess={() => executeUpgrade(false)}
        title="Upgrade to Reseller"
        description="Enter your PIN to pay the ₦1,200 upgrade fee from your wallet."
      />
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-10 pb-20">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Hello, {user?.username}</h2>
              <p className="text-gray-400 font-medium text-lg">What would you like to do today?</p>
           </div>
           <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Node Connected
              </div>
           </div>
        </div>

        {/* Balance Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden bg-gray-900 rounded-[3.5rem] p-10 lg:p-14 text-white shadow-2xl border border-white/5">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2">Total Wallet Balance</p>
                    <div className="text-6xl lg:text-7xl font-black tracking-tighter leading-none flex items-baseline">
                       <span className="text-3xl mr-1 text-white/40">₦</span>
                       {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                 </div>
                 <Link to="/funding" className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 hover:scale-110 transition-transform">
                    <WalletIcon />
                 </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/5">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-400"><UsersIcon /></div>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Affiliate ID</p>
                       <p className="font-black text-white text-sm tracking-tight uppercase">{user?.referralCode || 'OPLUG-USER'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-green-400"><ShieldCheckIcon /></div>
                    <div>
                       <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Account Tier</p>
                       <p className="font-black text-white text-sm tracking-tight uppercase">{user?.role || 'User'}</p>
                    </div>
                 </div>
                 {user?.role === 'user' && (
                   <button 
                    onClick={handleResellerUpgrade}
                    disabled={isUpgrading}
                    className="ml-auto bg-white text-gray-900 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white shadow-xl flex items-center gap-2 active:scale-95 disabled:opacity-50"
                   >
                      {isUpgrading ? <Spinner /> : 'Upgrade to Reseller'}
                   </button>
                 )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] -z-0"></div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 flex flex-col justify-between">
             <div>
                <h4 className="text-xl font-black text-gray-900 tracking-tight mb-2">Quick Support</h4>
                <p className="text-gray-400 text-sm font-medium">Need help? Chat with an Oplug agent now.</p>
             </div>
             <a href="https://wa.me/2348142452729" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-black text-white py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-1.094 3.993 4.1-.1.071 3.967 1.687-6.162z"/></svg>
                Open WhatsApp
             </a>
          </div>
        </div>

        {announcement && (
          <div className="bg-blue-600 p-6 rounded-[2.5rem] flex items-center space-x-6 shadow-2xl shadow-blue-100 overflow-hidden relative group">
             <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20"><BoltIcon /></div>
             <p className="text-xs font-black text-white uppercase tracking-widest flex-1 animate-pulse">{announcement}</p>
             <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
           <QuickAction to="/airtime" icon={<PhoneIcon />} label="Airtime" color="bg-orange-50 text-orange-600" />
           <QuickAction to="/data" icon={<SignalIcon />} label="Data" color="bg-blue-50 text-blue-600" />
           <QuickAction to="/bills" icon={<BoltIcon />} label="Bills" color="bg-yellow-50 text-yellow-600" />
           <QuickAction to="/cable" icon={<TvIcon />} label="TV" color="bg-indigo-50 text-indigo-600" />
           <QuickAction to="/education" icon={<GamingIcon />} label="Edu" color="bg-purple-50 text-purple-600" />
           <QuickAction to="/history" icon={<HistoryIcon />} label="Logs" color="bg-gray-50 text-gray-900" />
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           <div className="lg:col-span-8 bg-white rounded-[3.5rem] p-10 lg:p-14 shadow-2xl border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Recent Transactions</h3>
                <Link to="/history" className="text-blue-600 font-black text-[9px] uppercase tracking-widest bg-blue-50 px-5 py-2.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                   View History
                </Link>
              </div>

              {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => openReceipt(tx)}
                      className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black shadow-sm transition-transform group-hover:scale-110 ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-600'}`}>
                          {tx.type.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-xl tracking-tight">{tx.source}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>{tx.status}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center">
                       <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200"><HistoryIcon /></div>
                       <h4 className="font-black text-gray-900 text-2xl tracking-tighter">No transactions found</h4>
                       <p className="text-gray-400 font-medium max-w-xs mx-auto mt-2">When you recharge or fund, it shows up here.</p>
                    </div>
                  )}
                </div>
              )}
           </div>

           <div className="lg:col-span-4 space-y-10">
              <div className="bg-gray-950 p-10 lg:p-12 rounded-[3.5rem] text-white relative overflow-hidden group shadow-2xl">
                 <div className="relative z-10">
                    <h4 className="text-3xl font-black mb-4 tracking-tight">Refer & Earn</h4>
                    <p className="text-white/40 text-sm font-medium leading-relaxed mb-8">Get ₦500 instantly when your referral upgrades to reseller tier.</p>
                    <Link to="/referral" className="inline-flex items-center gap-3 bg-white text-gray-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5">
                       Invite Friends
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all"></div>
              </div>

              <div className="bg-white p-10 lg:p-12 rounded-[3.5rem] shadow-xl border border-gray-50">
                 <h4 className="text-xl font-black text-gray-900 tracking-tighter mb-6">Service Status</h4>
                 <div className="space-y-4">
                    <StatusItem label="Data Delivery" status="Fast" active />
                    <StatusItem label="Airtime Node" status="Stable" active />
                    <StatusItem label="Bank Funding" status="Operational" active />
                    <StatusItem label="TV & Bills" status="Slow" active={false} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

const QuickAction = ({ to, icon, label, color }: any) => (
  <Link to={to} className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] transition-all hover:scale-105 active:scale-95 group shadow-sm hover:shadow-2xl border border-transparent hover:border-blue-100 bg-white`}>
     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:rotate-12 ${color} shadow-inner`}>
        {icon}
     </div>
     <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">{label}</span>
  </Link>
);

const StatusItem = ({ label, status, active }: any) => (
  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${active ? 'bg-green-500 animate-pulse' : 'bg-orange-500'}`}></div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-green-600' : 'text-orange-600'}`}>{status}</span>
     </div>
  </div>
);

export default DashboardPage;
