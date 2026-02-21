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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
           <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user?.username}! 👋</h2>
              <p className="text-gray-500 font-medium text-lg mt-2">Here's what's happening with your account today.</p>
           </div>
        </div>

        {/* Balance Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden bg-white rounded-[3rem] p-10 lg:p-12 text-gray-900 shadow-xl border border-gray-100 group">
            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Available Balance</p>
                    <div className="text-6xl lg:text-7xl font-black tracking-tighter leading-none flex items-baseline">
                       <span className="text-3xl mr-1 text-gray-300 font-bold">₦</span>
                       {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                 </div>
                 <Link to="/funding" className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 hover:scale-105 transition-all transform active:scale-95 group-hover:rotate-3">
                    <WalletIcon />
                 </Link>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-50">
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><UsersIcon /></div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Referral Code</p>
                       <p className="font-bold text-gray-900 text-sm tracking-tight">{user?.referralCode || 'OPLUG-USER'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><ShieldCheckIcon /></div>
                    <div>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Type</p>
                       <p className="font-bold text-gray-900 text-sm tracking-tight capitalize">{user?.role || 'User'}</p>
                    </div>
                 </div>
                 {user?.role === 'user' && (
                   <button 
                    onClick={handleResellerUpgrade}
                    disabled={isUpgrading}
                    className="ml-auto bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all hover:bg-blue-600 shadow-lg flex items-center gap-2 active:scale-95 disabled:opacity-50"
                   >
                      {isUpgrading ? <Spinner /> : <><BoltIcon /> <span>Upgrade Account</span></>}
                   </button>
                 )}
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-all duration-700"></div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col justify-between group hover:shadow-2xl transition-all">
             <div className="space-y-4">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm"><BoltIcon /></div>
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight">Need Help?</h4>
                <p className="text-gray-500 text-base font-medium leading-relaxed">Our support team is always here to assist you with any issues.</p>
             </div>
             <a href="https://wa.me/2348142452729" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-black text-white py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-100 transform active:scale-95 mt-8">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-1.094 3.993 4.1-.1.071 3.967 1.687-6.162z"/></svg>
                Chat on WhatsApp
             </a>
          </div>
        </div>

        {announcement && (
          <div className="bg-blue-600 p-6 rounded-[2rem] flex items-center space-x-6 shadow-xl shadow-blue-100 overflow-hidden relative group">
             <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform"><BoltIcon /></div>
             <p className="text-sm font-bold text-white tracking-tight flex-1">{announcement}</p>
             <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           <QuickAction to="/airtime" icon={<PhoneIcon />} label="Airtime" color="bg-orange-50 text-orange-600" />
           <QuickAction to="/data" icon={<SignalIcon />} label="Data" color="bg-blue-50 text-blue-600" />
           <QuickAction to="/bills" icon={<BoltIcon />} label="Electricity" color="bg-yellow-50 text-yellow-600" />
           <QuickAction to="/cable" icon={<TvIcon />} label="Cable TV" color="bg-indigo-50 text-indigo-600" />
           <QuickAction to="/education" icon={<GamingIcon />} label="Exam PINs" color="bg-purple-50 text-purple-600" />
           <QuickAction to="/history" icon={<HistoryIcon />} label="History" color="bg-gray-50 text-gray-900" />
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 lg:p-12 shadow-xl border border-gray-50">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
                <Link to="/history" className="text-blue-600 font-bold text-[11px] uppercase tracking-widest bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm transform active:scale-95">
                   View All
                </Link>
              </div>

              {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => openReceipt(tx)}
                      className="flex items-center justify-between p-6 bg-gray-50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group rounded-3xl border border-transparent hover:border-gray-100 transform active:scale-[0.99]"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-sm transition-all group-hover:rotate-3 ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-red-50 text-red-600'}`}>
                          {tx.type.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg tracking-tight mb-1">{tx.source}</p>
                          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                            {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold tracking-tight ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg mt-1 inline-block ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{tx.status}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                       <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-inner"><HistoryIcon /></div>
                       <h4 className="font-bold text-gray-900 text-2xl tracking-tight mb-2">No activity yet</h4>
                       <p className="text-gray-400 font-medium text-base max-w-xs mx-auto">Your recent transactions will appear here once you start using Oplug.</p>
                    </div>
                  )}
                </div>
              )}
           </div>

           <div className="lg:col-span-4 space-y-10">
              <div className="bg-gray-900 p-10 lg:p-12 rounded-[3rem] text-white relative overflow-hidden group shadow-xl">
                 <div className="relative z-10">
                    <h4 className="text-3xl font-bold mb-4 tracking-tight">Refer & Earn</h4>
                    <p className="text-white/50 text-base font-medium leading-relaxed mb-10">Earn ₦500 for every friend who upgrades their account using your link.</p>
                    <Link to="/referral" className="inline-flex items-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl group">
                       Invite Friends
                       <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all duration-700"></div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 group hover:shadow-2xl transition-all">
                 <h4 className="text-xl font-bold text-gray-900 tracking-tight mb-6 leading-none">System Status</h4>
                 <div className="space-y-4">
                    <StatusItem label="Data Services" status="Online" active={true} />
                    <StatusItem label="Airtime Services" status="Online" active={true} />
                    <StatusItem label="Payment Gateway" status="Online" active={true} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </>
  );
};

const QuickAction = ({ to, icon, label, color }: any) => (
  <Link to={to} className={`flex flex-col items-center justify-center p-10 rounded-[3rem] transition-all hover:scale-105 active:scale-95 group shadow-sm hover:shadow-2xl border-4 border-transparent hover:border-blue-100 bg-white`}>
     <div className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center mb-5 transition-all group-hover:rotate-12 ${color} shadow-inner`}>
        {icon}
     </div>
     <span className="text-[11px] font-black uppercase tracking-widest text-gray-900">{label}</span>
  </Link>
);

const StatusItem = ({ label, status, active }: any) => (
  <div className="flex justify-between items-center p-5 bg-gray-50 rounded-[1.75rem] border-2 border-transparent hover:border-gray-100 transition-all">
     <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}`}></div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-green-600' : 'text-orange-600'}`}>{status}</span>
     </div>
  </div>
);

export default DashboardPage;