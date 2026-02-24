import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, ArrowLeft, ChevronRight, Search, CheckCircle2, User } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { vtuService } from '../../services/vtuService';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import Spinner from '../../components/Spinner';

const QuickBuyCable: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [providers, setProviders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  
  const [details, setDetails] = useState({ 
    providerId: '', 
    providerName: '',
    smartcard: '', 
    planId: '',
    planName: '',
    amount: '' 
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await vtuService.getCableProviders();
        if (res.status) setProviders(res.data || []);
      } catch (e) {
        addNotification("Failed to sync cable nodes.", "error");
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchProviders();
  }, [addNotification]);

  useEffect(() => {
    if (details.providerName) {
      const fetchPlans = async () => {
        setLoadingPlans(true);
        setPlans([]);
        const res = await vtuService.getCablePlans(details.providerName);
        if (res.status) setPlans(res.data || []);
        setLoadingPlans(false);
      };
      fetchPlans();
    }
  }, [details.providerName]);

  const handleVerify = async () => {
    if (!details.providerId || !details.smartcard) {
      addNotification("Select provider and enter smartcard number.", "warning");
      return;
    }
    setVerifying(true);
    setCustomerName(null);
    try {
      const res = await vtuService.verifyCableSmartcard({
        biller: details.providerId,
        smartCardNumber: details.smartcard
      });
      if (res.status && res.data) {
        setCustomerName(res.data.customerName);
        addNotification("Smartcard verified successfully.", "success");
      } else {
        addNotification(res.message || "Verification failed.", "error");
      }
    } catch (e) {
      addNotification("Node error during verification.", "error");
    }
    setVerifying(false);
  };

  const handleNext = () => {
    if (!details.providerId || !details.smartcard || !details.planId || !customerName) {
      addNotification("Please verify smartcard and select a plan.", "warning");
      return;
    }
    
    const checkoutData = {
      service: 'tv',
      providerId: details.providerId,
      providerName: details.providerName,
      recipient: details.smartcard,
      customerName,
      planId: details.planId,
      planName: details.planName,
      amount: Number(details.amount),
      label: 'Cable TV Subscription'
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
            <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tv className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Cable <span className="text-blue-600">TV.</span></h1>
            <p className="text-gray-500 font-medium">Renew your subscription instantly.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">1. Select Provider</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                value={details.providerId}
                onChange={(e) => {
                  const provider = providers.find(p => p.id === e.target.value);
                  setDetails({...details, providerId: e.target.value, providerName: provider?.name || '', planId: '', amount: ''});
                  setCustomerName(null);
                }}
              >
                 <option value="">{loading ? 'Loading providers...' : 'Choose a provider'}</option>
                 {providers.map(p => (
                   <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">2. Smartcard / IUC Number</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                  placeholder="Enter IUC number"
                  value={details.smartcard}
                  onChange={(e) => { setDetails({...details, smartcard: e.target.value}); setCustomerName(null); }}
                />
                <button 
                  onClick={handleVerify}
                  disabled={verifying || !details.smartcard || !details.providerId}
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
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">3. Select Bouquet</label>
              <div className="relative">
                <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                  value={details.planId ? `${details.planId}|${details.amount}|${details.planName}` : ''}
                  onChange={(e) => {
                    const [id, price, name] = e.target.value.split('|');
                    setDetails({...details, planId: id, amount: price, planName: name});
                  }}
                  disabled={!details.providerName || loadingPlans}
                >
                   <option value="">{loadingPlans ? 'Loading plans...' : 'Choose a bouquet'}</option>
                   {plans.map(p => (
                     <option key={p.id} value={`${p.id}|${p.amount}|${p.name}`}>{p.name} - ₦{p.amount}</option>
                   ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!customerName || !details.planId}
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

export default QuickBuyCable;
