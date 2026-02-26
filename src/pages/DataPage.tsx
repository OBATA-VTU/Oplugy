import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import LoadingScreen from '../components/LoadingScreen';
import { Server, Smartphone, Wifi, CheckCircle2, Receipt, ArrowRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { AIRTIME_NETWORKS } from '../constants';


const DataPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [step, setStep] = useState<'SERVER' | 'NETWORK' | 'CATEGORY' | 'PLAN' | 'PHONE' | 'CHECKOUT' | 'SUCCESS'>('SERVER');
  const [selectedServer, setSelectedServer] = useState<1 | 2 | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [networks, setNetworks] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const resetAll = useCallback(() => {
    setStep('SERVER');
    setSelectedServer(null);
    setSelectedOperator('');
    setPhoneNumber('');
    setSelectedPlan(null);
    setNetworks([]);
    setDataTypes([]);
    setDataPlans([]);
  }, []);

  const handleServerSelect = async (server: 1 | 2) => {
    setSelectedServer(server);
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
        setStep('NETWORK');
      } else {
        addNotification("Failed to sync networks.", "error");
      }
    } catch (e) {
      addNotification("Connection error.", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleNetworkSelect = async (netId: string) => {
    setSelectedOperator(netId);
    setIsLoading(true);
    setLoadingMessage('Fetching Categories...');
    try {
      const res = await vtuService.getDataCategories(netId, selectedServer!);
      if (res.status && res.data) {
        setDataTypes(res.data);
        if (res.data.length === 0) {
          await fetchPlans(netId, '');
        } else {
          setStep('CATEGORY');
        }
      } else {
        addNotification("Failed to fetch categories.", "error");
      }
    } catch (e) {
      addNotification("Connection error.", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handleCategorySelect = async (type: string) => {
    await fetchPlans(selectedOperator, type);
  };

  const fetchPlans = async (net: string, type: string) => {
    setIsLoading(true);
    setLoadingMessage('Syncing Plans...');
    try {
      const res = await vtuService.getDataPlans({ 
        network: net, 
        type, 
        userRole: user?.role || 'user',
        server: selectedServer!
      });
      if (res.status && res.data) {
        setDataPlans(res.data);
        setStep('PLAN');
      } else {
        addNotification(res.message || 'Plan sync failed.', 'error');
      }
    } catch (e) {
      addNotification("Connection error.", "error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const handlePlanSelect = (planId: string) => {
    const plan = dataPlans.find(p => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      setStep('PHONE');
    }
  };

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
        server: selectedServer!
      });
      
      if (res.status) {
        updateWalletBalance((walletBalance || 0) - selectedPlan.amount);
        setStep('SUCCESS');
      } else {
        addNotification(res.message || 'Fulfillment error.', 'error');
      }
    } catch (e) {
      addNotification("Transaction failed.", "error");
    } finally {
      setIsPurchasing(false);
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  if (isLoading) return <LoadingScreen message={loadingMessage} />;

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-32 px-4">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authenticate Transaction"
        description={`Confirm ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
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

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute -top-8 left-0 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ 
              width: step === 'SERVER' ? '15%' : 
                     step === 'NETWORK' ? '30%' : 
                     step === 'CATEGORY' ? '45%' : 
                     step === 'PLAN' ? '60%' : 
                     step === 'PHONE' ? '75%' : 
                     step === 'CHECKOUT' ? '90%' : '100%' 
            }}
          />
        </div>

        <div className="bg-white p-8 lg:p-20 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'SERVER' && (
              <motion.div 
                key="server"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Select Server</h3>
                  <p className="text-gray-400 font-medium">Choose a gateway to browse available plans.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServerSelect(1)}
                    className="p-12 bg-gray-50 hover:bg-white rounded-[3rem] border-2 border-transparent hover:border-blue-600 transition-all text-left group hover:shadow-2xl hover:shadow-blue-100"
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-10 text-blue-600 shadow-sm group-hover:rotate-6 transition-all">
                      <Server className="w-10 h-10" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Server 1</h4>
                    <p className="text-gray-400 font-medium">Optimized for stability and competitive pricing.</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServerSelect(2)}
                    className="p-12 bg-gray-950 text-white rounded-[3rem] border-2 border-transparent hover:border-blue-600 transition-all text-left group hover:shadow-2xl"
                  >
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-10 text-white shadow-sm group-hover:rotate-6 transition-all">
                      <Zap className="w-10 h-10" />
                    </div>
                    <h4 className="text-3xl font-black tracking-tight mb-2">Server 2</h4>
                    <p className="text-white/40 font-medium">High-speed delivery with exclusive data bundles.</p>
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'NETWORK' && (
              <motion.div 
                key="network"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Select Network</h3>
                  <p className="text-gray-400 font-medium">Which provider are you using?</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {networks.map((n, idx) => (
                    <motion.button
                      key={n.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                      onClick={() => handleNetworkSelect(n.id)}
                      className="group relative p-10 bg-gray-50 hover:bg-white rounded-[3rem] flex flex-col items-center gap-6 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100"
                    >
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all overflow-hidden p-3">
                        {n.image ? (
                          <img src={n.image} alt={n.name} className="w-full h-full object-contain" />
                        ) : (
                          <Smartphone className="w-10 h-10 text-gray-300" />
                        )}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">{n.name}</span>
                    </motion.button>
                  ))}
                </div>
                <BackButton onClick={() => setStep('SERVER')} />
              </motion.div>
            )}

            {step === 'CATEGORY' && (
              <motion.div 
                key="category"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Plan Type</h3>
                  <p className="text-gray-400 font-medium">What kind of data bundle do you need?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {dataTypes.map((type, idx) => (
                    <motion.button
                      key={type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                      onClick={() => handleCategorySelect(type)}
                      className="p-10 bg-gray-50 hover:bg-white rounded-[3rem] border-2 border-transparent hover:border-blue-600 transition-all text-left flex items-center space-x-8 group hover:shadow-2xl hover:shadow-blue-100"
                    >
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-all">
                        <Wifi className="w-10 h-10" />
                      </div>
                      <span className="text-2xl font-black text-gray-900 tracking-tight">{type}</span>
                    </motion.button>
                  ))}
                </div>
                <BackButton onClick={() => setStep('NETWORK')} />
              </motion.div>
            )}

            {step === 'PLAN' && (
              <motion.div 
                key="plan"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Select Plan</h3>
                  <p className="text-gray-400 font-medium">Pick a bundle that fits your needs.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {dataPlans.map((p, idx) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.03 } }}
                      onClick={() => handlePlanSelect(p.id)}
                      className="p-8 bg-gray-50 hover:bg-white rounded-[2.5rem] border-2 border-transparent hover:border-blue-600 transition-all flex items-center justify-between group hover:shadow-xl hover:shadow-blue-50"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-all">
                          <Zap className="w-6 h-6" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tight">{p.name}</span>
                      </div>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">₦{p.amount.toLocaleString()}</span>
                    </motion.button>
                  ))}
                </div>
                <BackButton onClick={() => setStep(dataTypes.length > 0 ? 'CATEGORY' : 'NETWORK')} />
              </motion.div>
            )}

            {step === 'PHONE' && (
              <motion.div 
                key="phone"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Recipient Number</h3>
                  <p className="text-gray-400 font-medium">Who are we sending this to?</p>
                </div>

                <div className="space-y-10">
                  <div className="relative">
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Smartphone className="text-blue-600 w-8 h-8" />
                    </div>
                    <input 
                      type="tel" 
                      autoFocus
                      className="w-full p-12 pl-32 bg-gray-50 border-4 border-transparent focus:border-blue-600 focus:bg-white rounded-[4rem] text-5xl lg:text-7xl font-black tracking-tighter outline-none transition-all placeholder:text-gray-200"
                      placeholder="08012345678"
                      maxLength={11}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <button 
                    disabled={phoneNumber.length !== 11}
                    onClick={() => setStep('CHECKOUT')}
                    className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
                  >
                    Review Order
                  </button>
                </div>
                <BackButton onClick={() => setStep('PLAN')} />
              </motion.div>
            )}

            {step === 'CHECKOUT' && (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <Receipt className="w-10 h-10" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Confirm Order</h3>
                  <p className="text-gray-400 font-medium text-lg">Double check the details before we proceed.</p>
                </div>

                <div className="bg-gray-50 p-12 rounded-[3.5rem] space-y-8 border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="w-32 h-32 text-blue-600" />
                  </div>
                  
                  <div className="space-y-6 relative z-10">
                    <CheckoutRow label="Service" value="Data Bundle" />
                    <CheckoutRow label="Network" value={networks.find(n => n.id === selectedOperator)?.name || selectedOperator} />
                    <CheckoutRow label="Plan" value={selectedPlan?.name || ''} />
                    <CheckoutRow label="Recipient" value={phoneNumber} />
                    <div className="pt-8 border-t border-gray-200 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Pay</span>
                        <p className="text-gray-400 text-xs font-medium">Instant fulfillment</p>
                      </div>
                      <span className="text-5xl font-black text-blue-600 tracking-tighter">₦{selectedPlan?.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={() => setShowPinModal(true)}
                    className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95"
                  >
                    Confirm & Pay
                  </button>
                  <button 
                    onClick={() => setStep('PHONE')}
                    className="w-full py-6 text-gray-400 font-black text-[11px] uppercase tracking-widest hover:text-gray-900 transition-all"
                  >
                    Edit Details
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'SUCCESS' && (
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
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const CheckoutRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="font-black text-gray-900 tracking-tight">{value}</span>
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-all flex items-center space-x-2"
  >
    <span>← Back to previous step</span>
  </button>
);


export default DataPage;