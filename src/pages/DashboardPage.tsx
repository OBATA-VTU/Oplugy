import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import PhoneSetupModal from '../components/PhoneSetupModal';
import ReceiptModal from '../components/ReceiptModal';
import PinPromptModal from '../components/PinPromptModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Zap, Tv, History, 
  Wallet, ShieldCheck, Zap as Bolt, ArrowUpRight, 
  MessageSquare, Bell, ChevronRight, Copy, Check
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance, updateWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [copied, setCopied] = useState(false);

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
    if (user) {
      if (!user.isPinSet) setShowPinModal(true);
      if (!user.phone) setShowPhoneModal(true);
    }
  }, [fetchDashboardData, user]);

  const copyReferral = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addNotification("Referral code copied!", "success");
    }
  };

  const executeUpgrade = async (isPaymentVerified = false) => {
    setIsUpgrading(true);
    try {
      const upgradeRes = await adminService.updateUserRole(user!.id, 'reseller');
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
    const res = await authService.setTransactionPin(user!.id, pin);
    if (res.status) {
      addNotification("Your Security PIN has been saved.", "success");
      setShowPinModal(false);
    }
  };

  const handlePhoneSuccess = async (phone: string) => {
    try {
      const userRef = doc(db, "users", user!.id);
      await updateDoc(userRef, { phone: phone.trim() });
      addNotification("Phone number saved successfully!", "success");
      setShowPhoneModal(false);
    } catch (error) {
      throw new Error("Failed to save phone number.");
    }
  };

  const openReceipt = (tx: TransactionResponse) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-24 px-4 sm:px-6 lg:px-8">
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      {showPhoneModal && <PhoneSetupModal onSuccess={handlePhoneSuccess} />}
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
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-2">Welcome to Obata App</h2>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.85]">
                  Welcome back, <br /><span className="text-blue-600">{user?.username}.</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">App Online</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden bg-gray-950 rounded-[4rem] p-12 text-white shadow-2xl group">
              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Your Balance</p>
                    <div className="text-6xl lg:text-8xl font-black tracking-tighter leading-none flex items-baseline">
                      <span className="text-3xl mr-2 text-white/20 font-bold">₦</span>
                      {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                  </div>
                  <Link to="/funding" className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/20 hover:scale-110 transition-all transform active:scale-95 group-hover:rotate-6">
                    <Wallet className="w-8 h-8" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-12 border-t border-white/10">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Account Type</p>
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <p className="font-black text-lg tracking-tight capitalize">{user?.role || 'User'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Referral Code</p>
                    <button onClick={copyReferral} className="flex items-center space-x-2 group/btn">
                      <p className="font-black text-lg tracking-tight">{user?.referralCode || 'JOIN-OBATA'}</p>
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white/20 group-hover/btn:text-white transition-colors" />}
                    </button>
                  </div>
                  {user?.role === 'user' && (
                    <button 
                      onClick={handleResellerUpgrade}
                      disabled={isUpgrading}
                      className="hidden sm:flex items-center justify-center space-x-3 bg-white text-gray-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {isUpgrading ? <Spinner /> : <><Bolt className="w-4 h-4" /> <span>Upgrade</span></>}
                    </button>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 flex flex-col justify-between h-full group hover:shadow-2xl transition-all relative overflow-hidden">
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="text-3xl font-black text-gray-900 tracking-tighter">Customer Support</h4>
                <p className="text-gray-400 font-medium text-lg leading-relaxed">Our support team is active 24/7 to help you with your transactions.</p>
              </div>
              <a href="https://wa.me/2348142452729" target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 hover:bg-gray-950 text-white py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-green-100 transform active:scale-95 mt-12 relative z-10">
                <Smartphone className="w-5 h-5" />
                WhatsApp Support
              </a>
              <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            </div>
          </div>
        </div>

        {announcement && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-600 p-8 rounded-[3rem] flex items-center space-x-8 shadow-2xl shadow-blue-100 overflow-hidden relative group"
          >
            <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-transform">
              <Bell className="w-8 h-8" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Announcement</p>
              <p className="text-xl font-black text-white tracking-tight">{announcement}</p>
            </div>
            <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
          </motion.div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
           <QuickAction to="/airtime" icon={<Smartphone />} label="Airtime" color="bg-orange-50 text-orange-600" />
           <QuickAction to="/data" icon={<Wifi />} label="Data" color="bg-blue-50 text-blue-600" />
           <QuickAction to="/bills" icon={<Zap />} label="Power" color="bg-yellow-50 text-yellow-600" />
           <QuickAction to="/cable" icon={<Tv />} label="Cable" color="bg-indigo-50 text-indigo-600" />
           <QuickAction to="/whatsapp-bot" icon={<MessageSquare />} label="Bot" color="bg-green-50 text-green-600" />
           <QuickAction to="/history" icon={<History />} label="History" color="bg-gray-50 text-gray-900" />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 bg-white rounded-[4rem] p-12 lg:p-16 shadow-2xl border border-gray-50">
            <div className="flex justify-between items-center mb-12">
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Recent Transactions</h3>
                <p className="text-gray-400 font-medium">Your latest transaction history.</p>
              </div>
              <Link to="/history" className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-8 py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm transform active:scale-95 flex items-center space-x-2">
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
              <div className="space-y-6">
                {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                  <motion.div 
                    key={tx.id} 
                    whileHover={{ x: 10 }}
                    onClick={() => openReceipt(tx)}
                    className="flex items-center justify-between p-8 bg-gray-50 hover:bg-white hover:shadow-2xl transition-all cursor-pointer group rounded-[2.5rem] border border-transparent hover:border-gray-100 transform active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner transition-all group-hover:rotate-6 ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-600'}`}>
                        {tx.type.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-xl tracking-tight mb-1">{tx.source}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-3xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg inline-block ${tx.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{tx.status}</span>
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-32 text-center bg-gray-50 rounded-[3rem] border-4 border-dashed border-gray-100">
                     <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-inner"><History className="w-12 h-12" /></div>
                     <h4 className="font-black text-gray-900 text-3xl tracking-tighter mb-4">No activity yet</h4>
                     <p className="text-gray-400 font-medium text-lg max-w-xs mx-auto leading-relaxed">Your transaction history will show up here once you make a purchase.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-12">
            <div className="bg-gray-950 p-12 rounded-[4rem] text-white relative overflow-hidden group shadow-2xl">
               <div className="relative z-10 space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-4xl font-black tracking-tighter">Refer & <br /><span className="text-blue-600">Earn.</span></h4>
                    <p className="text-white/40 text-lg font-medium leading-relaxed">Earn ₦500 for every friend who upgrades through your link.</p>
                  </div>
                  <Link to="/referrals" className="inline-flex items-center gap-4 bg-white text-gray-950 px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl group/btn">
                     Invite Friend
                     <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </Link>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all duration-1000"></div>
            </div>

            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 group hover:shadow-2xl transition-all">
               <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-10 leading-none">Service Status</h4>
               <div className="space-y-6">
                  <StatusItem label="Data Service" status="Active" active={true} />
                  <StatusItem label="Airtime Service" status="Active" active={true} />
                  <StatusItem label="Payment Service" status="Active" active={true} />
               </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const QuickAction = ({ to, icon, label, color }: any) => (
  <Link to={to} className={`flex flex-col items-center justify-center p-12 rounded-[3.5rem] transition-all hover:scale-105 active:scale-95 group shadow-sm hover:shadow-2xl border-4 border-transparent hover:border-blue-100 bg-white`}>
     <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 transition-all group-hover:rotate-12 ${color} shadow-inner`}>
        {React.cloneElement(icon, { className: 'w-8 h-8' })}
     </div>
     <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-900">{label}</span>
  </Link>
);

const StatusItem = ({ label, status, active }: any) => (
  <div className="flex justify-between items-center p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-gray-100 transition-all">
     <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
     <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${active ? 'bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]' : 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.8)]'}`}></div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-green-600' : 'text-orange-600'}`}>{status}</span>
     </div>
  </div>
);

export default DashboardPage;
