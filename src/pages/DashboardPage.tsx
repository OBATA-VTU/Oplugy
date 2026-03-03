import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import PhoneSetupModal from '../components/PhoneSetupModal';
import ReceiptModal from '../components/ReceiptModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Zap, Tv, History, 
  Wallet, ShieldCheck, 
  Bell, ChevronRight, Copy, Check, Globe,
  TrendingUp, Users
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user, walletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
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
    <div className="max-w-7xl mx-auto space-y-8 pb-24 px-4 sm:px-6 lg:px-8">
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      {showPhoneModal && <PhoneSetupModal onSuccess={handlePhoneSuccess} />}
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter leading-none">
              Welcome back, <span className="text-gray-400">{user?.username}.</span>
            </h1>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Wallet Card */}
          <div className="lg:col-span-8 bg-[#0A0A0B] rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl border border-white/5">
            <div className="relative z-10 flex flex-col h-full justify-between space-y-16">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Active Balance</span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-blue-600 mr-6">₦</span>
                    <h2 className="text-8xl lg:text-[10rem] font-black tracking-tighter leading-none bg-gradient-to-b from-white via-white to-white/20 bg-clip-text text-transparent">
                      {walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
                    </h2>
                  </div>
                </div>
                <Link to="/funding" className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center hover:scale-110 transition-all shadow-2xl shadow-blue-600/40 active:scale-95 group/btn">
                  <Wallet className="w-10 h-10 group-hover/btn:rotate-12 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5 items-center">
                <Stat label="Account Status" value={user?.role || 'User'} icon={<ShieldCheck size={16} className="text-blue-500" />} />
                <Stat label="Referral Code" value={user?.referralCode || '---'} icon={<Users size={16} className="text-blue-500" />} />
                <div className="md:col-span-2 flex items-center justify-end space-x-4">
                  <button onClick={copyReferral} className="flex items-center space-x-4 px-8 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group/copy">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover/copy:text-white transition-colors">Copy Code</span>
                    {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-white/20 group-hover/copy:text-white transition-colors" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Immersive Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[150px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[120px]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
          </div>

          {/* Virtual Account Card */}
          <div className="lg:col-span-4 bg-white border border-gray-100 rounded-[2.5rem] p-10 flex flex-col justify-between shadow-xl group relative overflow-hidden">
            {user?.virtualAccount ? (
              <div className="space-y-6 relative z-10">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase text-gray-400 mb-4">Dedicated Account</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Bank Name</p>
                      <p className="text-xl font-black tracking-tight text-gray-900">{user.virtualAccount.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Account Number</p>
                      <div className="flex items-center justify-between">
                        <p className="text-3xl font-black tracking-tighter text-blue-600">{user.virtualAccount.account_number}</p>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(user.virtualAccount!.account_number);
                            addNotification("Account number copied!", "success");
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Copy size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Account Name</p>
                      <p className="text-sm font-bold text-gray-600">{user.virtualAccount.account_name}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] font-medium text-gray-400 italic">* Funds sent here credit your wallet instantly.</p>
              </div>
            ) : (
              <div className="space-y-6 relative z-10 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Wallet size={28} />
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase">Automated Funding</h3>
                  <p className="text-gray-400 font-medium leading-relaxed">Generate a dedicated virtual account to fund your wallet instantly via bank transfer.</p>
                </div>
                <Link to="/funding" className="w-full bg-gray-950 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-blue-600 transition-all shadow-lg">
                  <span>Generate Account</span>
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Announcement */}
        {announcement && (
          <div className="bg-blue-600 rounded-[2rem] p-6 flex items-center space-x-6 text-white shadow-xl shadow-blue-100">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Bell size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Important Notice</p>
              <p className="text-lg font-black tracking-tight">{announcement}</p>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
           <ServiceItem to="/airtime" icon={<Smartphone />} label="Airtime" color="bg-orange-50 text-orange-600" />
           <ServiceItem to="/data" icon={<Wifi />} label="Data" color="bg-blue-50 text-blue-600" />
           <ServiceItem to="/smm" icon={<Globe />} label="Social" color="bg-purple-50 text-purple-600" />
           <ServiceItem to="/bills" icon={<Zap />} label="Power" color="bg-yellow-50 text-yellow-600" />
           <ServiceItem to="/cable" icon={<Tv />} label="Cable" color="bg-indigo-50 text-indigo-600" />
           <ServiceItem to="/funding" icon={<Wallet />} label="Fund" color="bg-emerald-50 text-emerald-600" />
           <ServiceItem to="/history" icon={<History />} label="History" color="bg-gray-50 text-gray-900" />
        </div>

        {/* History & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-3xl font-black tracking-tighter uppercase">Recent Activity</h3>
              <Link to="/history" className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                View All
              </Link>
            </div>

            {isHistoryLoading ? <div className="py-20 flex justify-center"><Spinner /></div> : (
              <div className="space-y-4">
                {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    onClick={() => openReceipt(tx)}
                    className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all cursor-pointer group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${tx.status === 'SUCCESS' ? 'bg-blue-600 text-white' : 'bg-red-50 text-red-600'}`}>
                        {tx.type.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 tracking-tight">{tx.source}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {tx.date_created?.seconds ? new Date(tx.date_created.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'}) : 'Just now'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-emerald-600' : 'text-gray-900'}`}>
                        {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-orange-500'}`}>{tx.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <History className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No recent records</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 space-y-8">
                <TrendingUp className="text-blue-500" size={32} />
                <h3 className="text-3xl font-black tracking-tighter uppercase">Refer & <br />Earn</h3>
                <p className="text-white/40 font-medium leading-relaxed">Invite your friends to Oplug and get rewarded for every successful signup.</p>
                <Link to="/referrals" className="inline-flex items-center space-x-3 bg-white text-gray-950 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                  <span>Start Earning</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Stat = ({ label, value, icon }: any) => (
  <div>
    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-center space-x-2">
      {icon}
      <p className="text-sm font-black tracking-tight uppercase">{value}</p>
    </div>
  </div>
);

const ServiceItem = ({ to, icon, label, color }: any) => (
  <Link to={to} className="bg-white border border-gray-100 p-6 rounded-3xl flex flex-col items-center justify-center transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 group">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:rotate-12 ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{label}</span>
  </Link>
);


export default DashboardPage;
