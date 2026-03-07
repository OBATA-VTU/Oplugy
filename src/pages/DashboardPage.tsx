import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import PhoneSetupModal from '../components/PhoneSetupModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Zap, Tv, 
  Copy,
  Users, ArrowLeftRight, GraduationCap, Gift,
  Wallet, History, ShieldCheck
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user } = useAuth();
  const { addNotification } = useNotifications();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      fetchWalletBalance();
      await Promise.all([
        adminService.getGlobalSettings(),
        vtuService.getTransactionHistory()
      ]);
    }
  }, [user, fetchWalletBalance]);

  useEffect(() => {
    fetchDashboardData();
    if (user) {
      if (!user.isPinSet) setShowPinModal(true);
      if (!user.phone) setShowPhoneModal(true);
    }
  }, [fetchDashboardData, user]);

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

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24">
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      {showPhoneModal && <PhoneSetupModal onSuccess={handlePhoneSuccess} />}
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-16"
      >
        {/* Hero Section: Balance & Account */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Wallet Card */}
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-4">Available Liquidity</p>
                <h2 className="text-6xl font-black tracking-tighter leading-none">
                  ₦{user?.walletBalance?.toLocaleString() || '0.00'}
                </h2>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                <Wallet size={28} />
              </div>
            </div>

            <div className="relative z-10 flex items-center space-x-4">
              <Link to="/funding" className="flex-1 bg-white text-blue-600 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-center hover:bg-gray-100 transition-all shadow-xl">
                Add Funds
              </Link>
              <Link to="/history" className="px-8 py-5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 backdrop-blur-xl">
                <History size={20} />
              </Link>
            </div>

            {/* Decorative background element */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          {/* Virtual Account Card */}
          <div className="bg-gray-50 dark:bg-white/2 rounded-[3rem] p-12 border border-gray-100 dark:border-white/5 flex flex-col justify-between min-h-[320px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-4">Settlement Account</p>
                <h3 className="text-3xl font-black tracking-tighter uppercase text-gray-900 dark:text-white">{user?.virtualAccount?.bank_name || 'PalmPay'}</h3>
              </div>
              <div className="px-4 py-2 bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Number</p>
                  <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">{user?.virtualAccount?.account_number || '6627516112'}</p>
                </div>
                <button 
                  onClick={() => {
                    if (user?.virtualAccount?.account_number) {
                      navigator.clipboard.writeText(user.virtualAccount.account_number);
                      addNotification("Account number copied!", "success");
                    }
                  }}
                  className="p-5 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 text-gray-500 hover:text-blue-600 transition-all shadow-sm"
                >
                  <Copy size={20} />
                </button>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Name: <span className="text-gray-900 dark:text-white">{user?.virtualAccount?.account_name || 'OPLUG / ' + user?.username}</span></p>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-black tracking-tighter uppercase">Operations</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select a service to proceed</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ServiceCard icon={<Smartphone />} label="Airtime" to="/airtime" color="bg-orange-500" />
            <ServiceCard icon={<Wifi />} label="Data" to="/data" color="bg-blue-500" />
            <ServiceCard icon={<Tv />} label="Cable" to="/cable" color="bg-purple-500" />
            <ServiceCard icon={<Zap />} label="Electricity" to="/bills" color="bg-yellow-500" />
            <ServiceCard icon={<GraduationCap />} label="Education" to="/education" color="bg-emerald-500" />
            <ServiceCard icon={<ArrowLeftRight />} label="P2P" to="/p2p" color="bg-rose-500" />
            <ServiceCard icon={<Gift />} label="Gift Cards" to="/giftcards" color="bg-indigo-500" />
            <ServiceCard icon={<Users />} label="Referrals" to="/referrals" color="bg-cyan-500" />
          </div>
        </div>

        {/* Info Banners */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Refer Banner */}
          <div className="bg-black rounded-[3rem] p-12 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="inline-block px-4 py-2 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">Limited Offer</div>
              <h4 className="text-4xl font-black tracking-tighter leading-none">Invite friends, <br /> earn ₦100.</h4>
              <p className="text-gray-400 text-sm max-w-[240px]">Get rewarded for every successful referral you bring to the platform.</p>
              <Link to="/referrals" className="inline-flex items-center space-x-3 text-blue-500 font-black uppercase tracking-widest text-[10px]">
                <span>Get Started</span>
                <ArrowLeftRight size={14} />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-20 group-hover:opacity-40 transition-opacity">
              <img src="https://picsum.photos/seed/money/600/600" alt="Refer" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>

          {/* Support Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-[3rem] p-12 border border-blue-100 dark:border-blue-900/30 space-y-8">
            <h4 className="text-2xl font-black tracking-tighter uppercase text-blue-900 dark:text-blue-100">Need Assistance?</h4>
            <div className="grid grid-cols-2 gap-4">
              <SupportButton label="WhatsApp" color="bg-[#25D366]" />
              <SupportButton label="Email Support" color="bg-blue-600" />
              <SupportButton label="Call Center" color="bg-gray-900" />
              <SupportButton label="Live Chat" color="bg-emerald-600" />
            </div>
          </div>
        </div>

        {/* Notification */}
        <div className="p-10 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start space-x-6">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className="space-y-2">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Security Advisory</h5>
            <p className="text-emerald-900 dark:text-emerald-100 text-sm font-medium leading-relaxed">
              Never share your transaction PIN with anyone. Oplug staff will never ask for your password or PIN. Stay safe.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ServiceCard = ({ icon, label, to, color }: any) => (
  <Link to={to} className="group">
    <div className="p-8 bg-white dark:bg-white/2 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex flex-col items-center text-center space-y-6 hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-500/10 active:scale-95">
      <div className={`w-16 h-16 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-blue-600 transition-colors">{label}</span>
    </div>
  </Link>
);

const SupportButton = ({ label, color }: any) => (
  <button className={`w-full ${color} text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all active:scale-95`}>
    {label}
  </button>
);

export default DashboardPage;
