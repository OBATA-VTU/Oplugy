import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowLeft, ChevronRight, Search, CheckCircle2, User } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { vtuService } from '../../services/vtuService';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import Spinner from '../../components/Spinner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import LoadingScreen from '../../components/LoadingScreen';

const QuickBuyElectricity: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [discos, setDiscos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  
  const [details, setDetails] = useState({ 
    discoId: '', 
    discoName: '',
    meterNo: '', 
    meterType: 'prepaid' as 'prepaid' | 'postpaid',
    amount: '' 
  });

  useEffect(() => {
    const fetchDiscos = async () => {
      try {
        const res = await vtuService.getElectricityOperators();
        if (res.status) setDiscos(res.data || []);
      } catch (e) {
        addNotification("Failed to sync utility nodes.", "error");
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchDiscos();
  }, [addNotification]);

  const handleVerify = async () => {
    if (!details.discoId || !details.meterNo) {
      addNotification("Select disco and enter meter number.", "warning");
      return;
    }
    setVerifying(true);
    setCustomerName(null);
    try {
      const res = await vtuService.verifyElectricityMeter({
        provider_id: details.discoId,
        meter_number: details.meterNo,
        meter_type: details.meterType
      });
      if (res.status && res.data) {
        setCustomerName(res.data.customerName);
        addNotification("Meter verified successfully.", "success");
      } else {
        addNotification(res.message || "Verification failed.", "error");
      }
    } catch (e) {
      addNotification("Node error during verification.", "error");
    }
    setVerifying(false);
  };

  const handleNext = () => {
    if (!details.discoId || !details.meterNo || !details.amount || !customerName) {
      addNotification("Please verify meter and enter amount.", "warning");
      return;
    }
    
    const checkoutData = {
      service: 'power',
      providerId: details.discoId,
      providerName: details.discoName,
      recipient: details.meterNo,
      meterType: details.meterType,
      customerName,
      amount: Number(details.amount),
      label: 'Electricity Bill'
    };
    
    sessionStorage.setItem('quick_buy_checkout', JSON.stringify(checkoutData));
    navigate('/quick-purchase/checkout');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <nav className="px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate('/quick-purchase')} className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-gray-50 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Electricity <span className="text-blue-600">Bill.</span></h1>
            <p className="text-gray-500 font-medium">Pay for your meter instantly.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">1. Select Disco</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                value={details.discoId}
                onChange={(e) => {
                  const disco = discos.find(d => d.id === e.target.value);
                  setDetails({...details, discoId: e.target.value, discoName: disco?.name || ''});
                  setCustomerName(null);
                }}
              >
                 <option value="">{loading ? 'Loading discos...' : 'Choose a provider'}</option>
                 {discos.map(d => (
                   <option key={d.id} value={d.id}>{d.name}</option>
                 ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">2. Meter Type</label>
              <div className="flex p-1.5 bg-gray-50 rounded-2xl">
                <button 
                  onClick={() => { setDetails({...details, meterType: 'prepaid'}); setCustomerName(null); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                    details.meterType === 'prepaid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                  )}
                >
                  Prepaid
                </button>
                <button 
                  onClick={() => { setDetails({...details, meterType: 'postpaid'}); setCustomerName(null); }}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                    details.meterType === 'postpaid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                  )}
                >
                  Postpaid
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">3. Meter Number</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                  placeholder="Enter meter number"
                  value={details.meterNo}
                  onChange={(e) => { setDetails({...details, meterNo: e.target.value}); setCustomerName(null); }}
                />
                <button 
                  onClick={handleVerify}
                  disabled={verifying || !details.meterNo || !details.discoId}
                  className="px-6 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {verifying ? <Spinner /> : <><Search className="w-4 h-4" /> <span>Verify</span></>}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {customerName && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-green-50 rounded-3xl border-2 border-green-100 flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Customer Name</p>
                    <p className="text-lg font-black text-gray-900 tracking-tight">{customerName}</p>
                  </div>
                  <div className="ml-auto">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">4. Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₦</span>
                <input 
                  type="number" 
                  className="w-full p-5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-2xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                  placeholder="0.00" 
                  value={details.amount} 
                  onChange={(e) => setDetails({...details, amount: e.target.value})} 
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!customerName || !details.amount}
              className="w-full py-6 bg-blue-600 hover:bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-3 transform active:scale-95 disabled:opacity-50"
            >
              <span>Continue to Checkout</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickBuyElectricity;
