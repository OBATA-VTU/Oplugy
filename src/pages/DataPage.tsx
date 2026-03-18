import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { Smartphone, CheckCircle2, Receipt, ArrowRight, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AIRTIME_NETWORKS } from '../constants';
import { adminService } from '../services/adminService';


const DataPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [networks, setNetworks] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchNetworks = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage('Syncing Networks...');
    try {
      const [res, logosRes] = await Promise.all([
        vtuService.getDataNetworks(1),
        adminService.getNetworkLogos()
      ]);

      if (res.status) {
        const customLogos = logosRes.status && logosRes.data ? logosRes.data : {};
        const mapped = (res.data || []).map((n: any) => {
          const constant = AIRTIME_NETWORKS.find(c => c.name.toUpperCase() === n.name.toUpperCase());
          return { 
            ...n, 
            image: customLogos[n.name.toUpperCase()] || constant?.image || 'https://cdn-icons-png.flaticon.com/512/8112/8112396.png'
          };
        });
        setNetworks(mapped);
      } else {
        addNotification("Failed to sync networks.", "error");
      }
    } catch (e) {
      addNotification("Connection error.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  const fetchPlans = useCallback(async (net: string, type: string) => {
    setIsLoading(true);
    setLoadingMessage('Syncing Plans...');
    try {
      const res = await vtuService.getDataPlans({ 
        network: net, 
        type, 
        userRole: user?.role || 'user',
        server: 1
      });
      if (res.status && res.data) {
        setDataPlans(res.data);
      } else {
        addNotification(res.message || 'Plan sync failed.', 'error');
      }
    } catch (e) {
      addNotification("Connection error.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, addNotification]);

  useEffect(() => {
    if (selectedOperator) {
      const fetchCats = async () => {
        setIsLoading(true);
        setLoadingMessage('Fetching Categories...');
        try {
          const res = await vtuService.getDataCategories(selectedOperator, 1);
          if (res.status && res.data) {
            setDataTypes(res.data);
            if (res.data.length === 0) {
              setSelectedType('');
              fetchPlans(selectedOperator, '');
            }
          }
        } catch (e) {
          addNotification("Connection error.", "error");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCats();
    } else {
      setDataTypes([]);
      setDataPlans([]);
    }
  }, [selectedOperator, addNotification, fetchPlans]);

  useEffect(() => {
    if (selectedOperator && (selectedType || dataTypes.length === 0)) {
      fetchPlans(selectedOperator, selectedType);
    }
  }, [selectedOperator, selectedType, dataTypes.length, fetchPlans]);

  useEffect(() => {
    const plan = dataPlans.find(p => p.id === selectedPlanId);
    setSelectedPlan(plan || null);
  }, [selectedPlanId, dataPlans]);

  const handlePurchase = async () => {
    if (!selectedPlan || isPurchasing) return;
    setIsPurchasing(true);
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Processing Order...');

    try {
      const res = await vtuService.purchaseData({
        plan_id: selectedPlan.id,
        phone_number: phoneNumber,
        amount: selectedPlan.amount,
        network: selectedOperator,
        plan_name: selectedPlan.name,
        server: 1,
        resellerPrice: selectedPlan.resellerPrice
      });
      
      if (res.status) {
        updateWalletBalance((walletBalance || 0) - selectedPlan.amount);
        setIsSuccess(true);
      } else {
        addNotification(res.message || 'Fulfillment error.', 'error');
      }
    } catch (e) {
      addNotification("Transaction failed.", "error");
    } finally {
      setIsPurchasing(false);
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedOperator('');
    setSelectedType('');
    setSelectedPlanId('');
    setPhoneNumber('');
    setIsSuccess(false);
  };

  if (isLoading && !isPurchasing) return <LoadingScreen message={loadingMessage} />;

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-32 px-4">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authenticate Transaction"
        description={`Confirm ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredAmount={selectedPlan?.amount || 0}
        currentBalance={walletBalance || 0}
        onPayRemaining={() => navigate(`/funding?amount=${(selectedPlan?.amount || 0) - (walletBalance || 0)}`)}
      />

      <div className="flex flex-col items-center text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-emerald-100/50"
        >
          Data Bundles
        </motion.div>
        <h1 className="text-6xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-[0.8] py-2">
          Stay <br />
          <span className="text-emerald-600">Connected.</span>
        </h1>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto leading-relaxed">
          Affordable data plans for all networks. Fast delivery, zero stress.
        </p>
      </div>

      <div className="bg-white p-8 lg:p-16 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-12 py-10"
            >
              <div className="relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-32 h-32 bg-green-50 text-green-500 rounded-[3rem] flex items-center justify-center mx-auto shadow-inner relative z-10"
                >
                  <CheckCircle2 className="w-16 h-16" />
                </motion.div>
                <div className="absolute inset-0 bg-green-400/20 blur-[60px] rounded-full scale-75"></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Order Sent!</h3>
                <p className="text-gray-400 font-medium text-xl max-w-sm mx-auto leading-relaxed">
                  Your {selectedPlan?.name} bundle is on its way to {phoneNumber}.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button 
                  onClick={resetAll}
                  className="px-12 py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-gray-950 transition-all shadow-2xl shadow-emerald-100 flex items-center justify-center space-x-4 group"
                >
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  <span>Buy Again</span>
                </button>
                <button 
                  onClick={() => navigate('/history')}
                  className="px-12 py-8 bg-gray-100 text-gray-900 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-gray-200 transition-all flex items-center justify-center space-x-4"
                >
                  <Receipt className="w-5 h-5" />
                  <span>View Receipt</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Network Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">1. Select Network</label>
                  <div className="relative">
                    <select 
                      className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all appearance-none"
                      value={selectedOperator}
                      onChange={(e) => {
                        setSelectedOperator(e.target.value);
                        setSelectedType('');
                        setSelectedPlanId('');
                      }}
                    >
                      <option value="">Choose Provider</option>
                      {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Category Selection */}
                {dataTypes.length > 0 && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">2. Plan Type</label>
                    <div className="relative">
                      <select 
                        className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all appearance-none"
                        value={selectedType}
                        onChange={(e) => {
                          setSelectedType(e.target.value);
                          setSelectedPlanId('');
                        }}
                      >
                        <option value="">Select Category</option>
                        {dataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Plan Selection - Grid instead of Dropdown */}
                <div className="md:col-span-2 space-y-6">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">
                    {dataTypes.length > 0 ? '3' : '2'}. Select Data Plan
                  </label>
                  
                  {!selectedOperator ? (
                    <div className="p-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-gray-300">
                        <Smartphone className="w-8 h-8" />
                      </div>
                      <p className="text-gray-400 font-medium">Please select a network provider first.</p>
                    </div>
                  ) : dataPlans.length === 0 ? (
                    <div className="p-12 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-gray-300 animate-pulse">
                        <Zap className="w-8 h-8" />
                      </div>
                      <p className="text-gray-400 font-medium">No plans found for this category.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataPlans.map((p) => (
                        <motion.button
                          key={p.id}
                          whileHover={{ y: -5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedPlanId(p.id)}
                          className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${
                            selectedPlanId === p.id 
                              ? 'border-emerald-600 bg-emerald-50 shadow-xl shadow-emerald-100' 
                              : 'border-gray-100 bg-white hover:border-emerald-200 hover:shadow-lg'
                          }`}
                        >
                          {selectedPlanId === p.id && (
                            <div className="absolute top-4 right-4">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                          )}
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <p className={`text-2xl font-black tracking-tighter leading-none ${selectedPlanId === p.id ? 'text-emerald-900' : 'text-gray-900'}`}>
                                {p.name.split(' ')[0]}
                              </p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {p.validity || '30 Days'}
                              </p>
                            </div>
                            <div className="pt-4 border-t border-gray-100 group-hover:border-emerald-100 transition-colors">
                              <p className={`text-xl font-black ${selectedPlanId === p.id ? 'text-emerald-600' : 'text-gray-900'}`}>
                                ₦{p.amount.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{dataTypes.length > 0 ? '4' : '3'}. Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      className="w-full p-6 pl-14 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-xl outline-none focus:border-emerald-600 focus:bg-white transition-all tracking-tight" 
                      placeholder="08012345678"
                      maxLength={11}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    />
                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              {selectedPlan && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-emerald-900 tracking-tighter">₦{selectedPlan.amount.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}

              <button 
                disabled={!selectedPlan || phoneNumber.length !== 11 || isPurchasing}
                onClick={() => {
                  if (selectedPlan && walletBalance !== null && selectedPlan.amount > walletBalance) {
                    setShowInsufficientModal(true);
                    return;
                  }
                  setShowPinModal(true);
                }}
                className="w-full py-10 bg-emerald-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-emerald-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
              >
                {isPurchasing ? <LoadingScreen message="Processing..." /> : <><Zap className="w-5 h-5" /> <span>Purchase Data</span></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};






export default DataPage;