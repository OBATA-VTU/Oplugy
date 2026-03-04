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
  Smartphone, Wifi, Zap, Tv, 
  Copy, Globe,
  Users, Plus, ArrowLeftRight, GraduationCap, Gift
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
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
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
        {/* Header Card */}
        <div className="bg-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-black tracking-tight uppercase">Hello {user?.username?.toUpperCase() || 'USER'}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium opacity-80">{user?.virtualAccount?.bank_name || 'PalmPay'}</span>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Wallet Balance</p>
                <h2 className="text-3xl font-black tracking-tighter">₦{walletBalance?.toLocaleString() || '0.00'}</h2>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-lg font-black tracking-tight">{user?.virtualAccount?.account_number || '---'}</span>
                  <button 
                    onClick={() => {
                      if (user?.virtualAccount?.account_number) {
                        navigator.clipboard.writeText(user.virtualAccount.account_number);
                        addNotification("Account number copied!", "success");
                      }
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-all"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Link to="/funding" className="flex-1 bg-white text-blue-700 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 shadow-lg">
                <Plus size={14} />
                <span>Fund Wallet</span>
              </Link>
              <Link to="/history" className="flex-1 bg-white/20 backdrop-blur-md text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 border border-white/10">
                <ArrowLeftRight size={14} />
                <span>History</span>
              </Link>
            </div>
          </div>
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        </div>

        {/* Refer & Earn Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden flex items-center justify-between shadow-lg">
          <div className="relative z-10 space-y-4 max-w-[60%]">
            <h2 className="text-4xl font-black tracking-tighter italic">Refer & Earn!</h2>
            <p className="text-sm font-medium leading-tight">
              Invite your friends with your referral link to earn <span className="text-yellow-400 font-bold">₦100</span> for each friend you referred.
            </p>
            <p className="text-[10px] opacity-60">Terms & conditions apply</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 overflow-hidden">
             <img 
               src="https://picsum.photos/seed/refer/400/400" 
               alt="Refer" 
               className="h-full w-full object-cover opacity-80 mix-blend-overlay"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>

        {/* Services Grid */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-8 tracking-tight">Services</h3>
          <div className="grid grid-cols-4 gap-y-10 gap-x-4">
            <ServiceIcon icon={<Smartphone className="text-blue-600" />} label="Airtime" to="/airtime" />
            <ServiceIcon icon={<Wifi className="text-blue-600" />} label="Data" to="/data" />
            <ServiceIcon icon={<Tv className="text-blue-600" />} label="Tv" to="/cable" />
            <ServiceIcon icon={<Zap className="text-blue-600" />} label="Bills" to="/electricity" />
            <ServiceIcon icon={<GraduationCap className="text-blue-600" />} label="Education Pin" to="/education" />
            <ServiceIcon icon={<ArrowLeftRight className="text-blue-600" />} label="P2P Transfer" to="/p2p" />
            <ServiceIcon icon={<Gift className="text-blue-600" />} label="Gift Card" to="/giftcards" />
            <ServiceIcon icon={<Users className="text-blue-600" />} label="Referrals" to="/referrals" />
          </div>
        </div>

        {/* Important Notification */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8">
          <h3 className="text-sm font-black text-emerald-900 mb-4 uppercase tracking-widest">IMPORTANT NOTIFICATION</h3>
          <p className="text-emerald-800 text-sm font-medium leading-relaxed">
            Please, don't send Airtel Awoof and Gifting to any number owing Airtel. It will not deliver and you will not be refunded. Thank you for choosing Oplug.
          </p>
        </div>

        {/* Need Help Section */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 space-y-6">
          <h3 className="text-lg font-black text-emerald-900 tracking-tight">Need Help?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-800 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest">Call us</button>
            <button className="bg-red-500 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest">Whatsapp us</button>
            <button className="bg-yellow-500 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest">Whatsapp Group</button>
            <button className="bg-cyan-500 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest">Email us</button>
          </div>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-black text-xs uppercase tracking-widest">Download App</button>
        </div>
      </motion.div>
    </div>
  );
};

const ServiceIcon = ({ icon, label, to }: any) => (
  <Link to={to} className="flex flex-col items-center space-y-2 group">
    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-all border border-gray-100 group-hover:border-blue-100">
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight text-center">{label}</span>
  </Link>
);

export default DashboardPage;
