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
      
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12 pb-20">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
           <div>
              <h2 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">Hello, {user?.username}</h2>
              <p className="text-gray-400 font-medium text-xl mt-4">Node status: <span className="text-orange-500 animate-pulse">Server 2 Integration in Progress...</span></p>
           </div>
        </div>

        {/* Balance Card Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative overflow-hidden bg-gray-900 rounded-[4rem] p-12 lg:p-16 text-white shadow-2xl border border-white/5 group">
            <div className="relative z-10 space-y-12">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-3">Total Wallet Liquidity</p>
                    <div className="text-7xl lg:text-8xl font-black tracking-tighter leading-none flex items-baseline selection:bg-blue-600">
                       <span className="text-4xl mr-2 text-white/30 font-bold">₦</span>
                       {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                 </div>
                 <Link to="/funding" className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 hover:scale-110 transition-all transform active:scale-95 group-hover:rotate-6">
                    <WalletIcon />
                 </Link>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-10 border-t border-white/5">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner"><UsersIcon /></div>
                    <div>
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Master ID</p>
                       <p className="font-black text-white text-lg tracking-tight uppercase">{user?.referralCode || 'OPLUG-USER'}</p>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-green-400 shadow-inner"><ShieldCheckIcon /></div>
                    <div>
                       <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Account Tier</p>
                       <p className="font-black text-white text-lg tracking-tight uppercase">{user?.role || 'User'}</p>
                    </div>
                 </div>
                 {user?.role === 'user' && (
                   <button 
                    onClick={handleResellerUpgrade}
                    disabled={isUpgrading}
                    className="ml-auto bg-white text-gray-900 px-8 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all hover:bg-blue-600 hover:text-white shadow-2xl flex items-center gap-3 active:scale-95 disabled:opacity-50"
                   >
                      {isUpgrading ? <Spinner /> : <><BoltIcon /> <span>Upgrade Node</span></>}
                   </button>
                 )}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-600/10 rounded-full blur-[150px] -z-0 group-hover:bg-blue-600/20 transition-all duration-1000"></div>
          </div>

          <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-gray-50 flex flex-col justify-between group hover:shadow-2xl transition-all">
             <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.75rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><BoltIcon /></div>
                <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Support Terminal</h4>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">Direct clearance for manual funding or technical concerns.</p>
             </div>
             <a href="https://wa.me/2348142452729" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-black text-white py-6 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-4 shadow-xl shadow-green-100 transform active:scale-95">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-1.094 3.993 4.1-.1.071 3.967 1.687-6.162z"/></svg>
                WhatsApp Portal
             </a>
          </div>
        </div>

        {announcement && (
          <div className="bg-blue-600 p-8 rounded-[3rem] flex items-center space-x-8 shadow-2xl shadow-blue-100 overflow-hidden relative group">
             <div className="w-14 h-14 bg-white/20 text-white rounded-[1.75rem] flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform"><BoltIcon /></div>
             <p className="text-sm font-black text-white uppercase tracking-[0.2em] flex-1 animate-pulse">{announcement}</p>
             <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
           <QuickAction to="/airtime" icon={<PhoneIcon />} label="Airtime" color="bg-orange-50 text-orange-600" />
           <QuickAction to="/data" icon={<SignalIcon />} label="Data" color="bg-blue-50 text-blue-600" />
           <QuickAction to="/bills" icon={<BoltIcon />} label="Utility" color="bg-yellow-50 text-yellow-600" />
           <QuickAction to="/cable" icon={<TvIcon />} label="TV" color="bg-indigo-50 text-indigo-600" />
           <QuickAction to="/education" icon={<GamingIcon />} label="Edu" color="bg-purple-50 text-purple-600" />
           <QuickAction to="/history" icon={<HistoryIcon />} label="Logs" color="bg-gray-50 text-gray-900" />
        </div>

        {/* History Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 lg:p-16 shadow-2xl border border-gray-50">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">Traffic Ledger</h3>
                <Link to="/history" className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm transform active:scale-95">
                   Full History
                </Link>
              </div>

              {isHistoryLoading ? <div className="py-24 flex justify-center"><Spinner /></div> : (
                <div className="space-y-5">
                  {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                    <div 
                      key={tx.id} 
                      onClick={() => openReceipt(tx)}
                      className="flex items-center justify-between p-8 bg-gray-50/50 rounded-[2.5rem] border-4 border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group transform active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-8">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-sm transition-all group-hover:rotate-6 ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-red-50 text-red-600'}`}>
                          {tx.type.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-2xl tracking-tight leading-none mb-2">{tx.source}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : 'Processing...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mt-2 inline-block ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{tx.status}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="py-32 text-center bg-gray-50/50 rounded-[3rem] border-4 border-dashed border-gray-100">
                       <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-inner"><HistoryIcon /></div>
                       <h4 className="font-black text-gray-900 text-3xl tracking-tighter leading-none mb-3">No Traffic Detected</h4>
                       <p className="text-gray-400 font-medium text-lg max-w-xs mx-auto">Trigger your first transaction and it will appear in the matrix.</p>
                    </div>
                  )}
                </div>
              )}
           </div>

           <div className="lg:col-span-4 space-y-12">
              <div className="bg-gray-950 p-12 lg:p-14 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl border border-white/5">
                 <div className="relative z-10">
                    <h4 className="text-4xl font-black mb-6 tracking-tighter leading-[0.9]">Refer <br />& Earn.</h4>
                    <p className="text-white/40 text-lg font-medium leading-relaxed mb-12">Earn ₦500 bounty for every upgrade triggered by your node network.</p>
                    <Link to="/referral" className="inline-flex items-center gap-4 bg-white text-gray-950 px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl shadow-white/5 group">
                       Launch Invites
                       <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                    </Link>
                 </div>
                 <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] group-hover:bg-blue-600/30 transition-all duration-700"></div>
              </div>

              <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-gray-50 group hover:shadow-2xl transition-all">
                 <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-8 leading-none">Node Uptime</h4>
                 <div className="space-y-5">
                    <StatusItem label="Data Link" status="Syncing" active={false} />
                    <StatusItem label="Airtime Core" status="Syncing" active={false} />
                    <StatusItem label="Liquidity Node" status="Syncing" active={false} />
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