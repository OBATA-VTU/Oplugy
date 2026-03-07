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
  Users, ArrowLeftRight, GraduationCap, Gift
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
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      {showPhoneModal && <PhoneSetupModal onSuccess={handlePhoneSuccess} />}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header Card */}
        <div className="bg-blue-700 rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden min-h-[240px] flex flex-col justify-between">
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">Hello {user?.username?.toUpperCase() || 'USER'}</h1>
              <span className="text-xs font-black tracking-widest opacity-60 uppercase">{user?.virtualAccount?.bank_name || 'PalmPay'}</span>
            </div>
          </div>

          <div className="relative z-10 flex justify-between items-end">
            <div className="space-y-2">
              <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">Virtual Account</p>
              <h2 className="text-4xl font-black tracking-tighter leading-none">{user?.virtualAccount?.account_number || '6627516112'}</h2>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  if (user?.virtualAccount?.account_number) {
                    navigator.clipboard.writeText(user.virtualAccount.account_number);
                    addNotification("Account number copied!", "success");
                  }
                }}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10"
              >
                <Copy size={20} />
              </button>
              <Link to="/history" className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-3 shadow-xl">
                <ArrowLeftRight size={14} />
                <span>History</span>
              </Link>
            </div>
          </div>
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        </div>

        {/* Refer & Earn Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-blue-800 rounded-[2rem] p-10 text-white relative overflow-hidden flex items-center justify-between shadow-2xl min-h-[200px]">
          <div className="relative z-10 space-y-4 max-w-[60%]">
            <h2 className="text-5xl font-black tracking-tighter italic leading-none">Refer & Earn!</h2>
            <p className="text-sm font-medium leading-tight opacity-80">
              Invite your friends with your referral link to earn <span className="text-yellow-400 font-bold">N100</span> for each friend you referred.
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Terms & conditions apply</p>
          </div>
          <div className="absolute right-0 top-0 h-full w-2/5 overflow-hidden">
             <img 
               src="https://picsum.photos/seed/refer/600/600" 
               alt="Refer" 
               className="h-full w-full object-cover opacity-80 mix-blend-overlay"
               referrerPolicy="no-referrer"
             />
          </div>
        </div>

        {/* Services Grid */}
        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-gray-100">
          <h3 className="text-xl font-black text-gray-900 mb-12 tracking-tight uppercase">Services</h3>
          <div className="grid grid-cols-4 gap-y-12 gap-x-4">
            <ServiceIcon icon={<Smartphone className="text-blue-600" />} label="Airtime" to="/airtime" />
            <ServiceIcon icon={<Wifi className="text-blue-600" />} label="Data" to="/data" />
            <ServiceIcon icon={<Tv className="text-blue-600" />} label="Tv" to="/cable" />
            <ServiceIcon icon={<Zap className="text-blue-600" />} label="Bills" to="/bills" />
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
