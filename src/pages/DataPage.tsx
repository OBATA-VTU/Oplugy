import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { Smartphone, Wifi, CheckCircle2, Receipt, ArrowRight, Zap, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AIRTIME_NETWORKS } from '../constants';


const DataPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [selectedServer, setSelectedServer] = useState<1 | 2>(1);
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

  const fetchNetworks = useCallback(async (server: 1 | 2) => {
    setIsLoading(true);
    setLoadingMessage('Syncing Networks...');
    try {
      const res = await vtuService.getDataNetworks(server);
      if (res.status) {
        const mapped = (res.data || []).map((n: any) => {
          const constant = AIRTIME_NETWORKS.find(c => c.name.toUpperCase() === n.name.toUpperCase());
          return { ...n, image: constant?.image };
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
    fetchNetworks(selectedServer);
  }, [selectedServer, fetchNetworks]);

  useEffect(() => {
    if (selectedOperator) {
      const fetchCats = async () => {
        setIsLoading(true);
        setLoadingMessage('Fetching Categories...');
        try {
          const res = await vtuService.getDataCategories(selectedOperator, selectedServer);
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
  }, [selectedOperator, selectedServer, addNotification]);

  useEffect(() => {
    if (selectedOperator && (selectedType || dataTypes.length === 0)) {
      fetchPlans(selectedOperator, selectedType);
    }
  }, [selectedOperator, selectedType, selectedServer]);

  const fetchPlans = async (net: string, type: string) => {
    setIsLoading(true);
    setLoadingMessage('Syncing Plans...');
    try {
      const res = await vtuService.getDataPlans({ 
        network: net, 
        type, 
        userRole: user?.role || 'user',
        server: selectedServer
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
  };

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
        server: selectedServer
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
          className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-blue-100/50"
        >
          Data Bundles
        </motion.div>
        <h1 className="text-6xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-[0.8] py-2">
          Stay <br />
          <span className="text-blue-600">Connected.</span>
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
                  className="px-12 py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] hover:bg-gray-950 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center space-x-4 group"
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
                {/* Server Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">1. Select Server</label>
                  <div className="flex p-2 bg-gray-50 rounded-[2rem]">
                    <button 
                      onClick={() => setSelectedServer(1)}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${selectedServer === 1 ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
                    >
                      Server 1
                    </button>
                    <button 
                      onClick={() => setSelectedServer(2)}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${selectedServer === 2 ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
                    >
                      Server 2
                    </button>
                  </div>
                </div>

                {/* Network Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">2. Select Network</label>
                  <div className="relative">
                    <select 
                      className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all appearance-none"
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">3. Plan Type</label>
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

                {/* Plan Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">4. Data Plan</label>
                  <div className="relative">
                    <select 
                      className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all appearance-none"
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      disabled={!selectedOperator}
                    >
                      <option value="">Select Bundle</option>
                      {dataPlans.map(p => <option key={p.id} value={p.id}>{p.name} - ₦{p.amount}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">5. Phone Number</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      className="w-full p-6 pl-14 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
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
                  className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-blue-900 tracking-tighter">₦{selectedPlan.amount.toLocaleString()}</span>
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
                className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
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