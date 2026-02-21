import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, ArrowLeft, Smartphone, ChevronRight, Layers } from 'lucide-react';
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

const QuickBuyData: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [networks, setNetworks] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);
  
  const [details, setDetails] = useState({ 
    network: '', 
    category: '', 
    planId: '', 
    phone: '', 
    amount: '',
    planName: ''
  });

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const res = await vtuService.getDataNetworks(1);
        if (res.status) setNetworks(res.data || []);
      } catch (e) {
        addNotification("Failed to sync networks.", "error");
      } finally {
        setTimeout(() => setLoading(false), 1500);
      }
    };
    fetchNetworks();
  }, [addNotification]);

  useEffect(() => {
    if (details.network) {
      const fetchCats = async () => {
        setLoadingCats(true);
        setCategories([]);
        setDetails(prev => ({ ...prev, category: '', planId: '' }));
        const res = await vtuService.getDataCategories(details.network, 1);
        if (res.status) setCategories(res.data || []);
        setLoadingCats(false);
      };
      fetchCats();
    }
  }, [details.network]);

  useEffect(() => {
    if (details.network && (details.category || categories.length === 0)) {
      const fetchPlans = async () => {
        setLoadingPlans(true);
        setPlans([]);
        const res = await vtuService.getDataPlans({ 
          network: details.network, 
          type: details.category, 
          server: 1 
        });
        if (res.status) setPlans(res.data || []);
        setLoadingPlans(false);
      };
      fetchPlans();
    }
  }, [details.network, details.category, categories.length]);

  const handleNext = () => {
    if (!details.network || !details.planId || details.phone.length !== 11) {
      addNotification("Please fill all fields correctly.", "warning");
      return;
    }
    
    const checkoutData = {
      service: 'data',
      network: details.network,
      recipient: details.phone,
      amount: Number(details.amount),
      planId: details.planId,
      planName: details.planName,
      label: 'Data Bundle'
    };
    
    sessionStorage.setItem('quick_buy_checkout', JSON.stringify(checkoutData));
    navigate('/quick-purchase/checkout');
  };

  if (loading) return <LoadingScreen message="Syncing Data Nodes..." />;

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
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Wifi className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Data <span className="text-blue-600">Bundle.</span></h1>
            <p className="text-gray-500 font-medium">Cheap data delivered instantly.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">1. Select Network</label>
              <div className="relative">
                <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all"
                  value={details.network}
                  onChange={(e) => setDetails({...details, network: e.target.value})}
                >
                   <option value="">Choose a network</option>
                   {networks.map(n => (
                     <option key={n.id} value={n.id}>{n.name}</option>
                   ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {details.network && categories.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">2. Data Category</label>
                  <div className="relative">
                    <select 
                      className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all"
                      value={details.category}
                      onChange={(e) => setDetails({...details, category: e.target.value})}
                    >
                       <option value="">{loadingCats ? 'Loading categories...' : 'Choose a category'}</option>
                       {categories.map(cat => (
                         <option key={cat} value={cat}>{cat}</option>
                       ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">3. Select Plan</label>
              <div className="relative">
                <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                  value={details.planId ? `${details.planId}|${details.amount}|${details.planName}` : ''}
                  onChange={(e) => {
                    const [id, price, name] = e.target.value.split('|');
                    setDetails({...details, planId: id, amount: price, planName: name});
                  }}
                  disabled={!details.network || loadingPlans}
                >
                   <option value="">{loadingPlans ? 'Loading plans...' : 'Choose a plan'}</option>
                   {plans.map(p => (
                     <option key={p.id} value={`${p.id}|${p.amount}|${p.name}`}>{p.name} - ₦{p.amount}</option>
                   ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">4. Phone Number</label>
              <input 
                type="tel" 
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                placeholder="08012345678"
                maxLength={11}
                value={details.phone}
                onChange={(e) => setDetails({...details, phone: e.target.value.replace(/\D/g, '')})}
              />
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-6 bg-blue-600 hover:bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-3 transform active:scale-95"
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

export default QuickBuyData;
