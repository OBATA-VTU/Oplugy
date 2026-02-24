import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import LoadingScreen from '../components/LoadingScreen';
import { Server, Smartphone, Wifi, CheckCircle2, Receipt, ArrowRight, AlertCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { DATA_NETWORKS } from '../constants';

const DataPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [step, setStep] = useState<'SERVER' | 'NETWORK' | 'CATEGORY' | 'PLAN' | 'PHONE' | 'CHECKOUT' | 'SUCCESS'>('SERVER');
  const [selectedServer, setSelectedServer] = useState<1 | 2 | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string>('');
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

  const resetAll = useCallback(() => {
    setStep('SERVER');
    setSelectedServer(null);
    setSelectedOperator('');
    setSelectedPlanId('');
    setPhoneNumber('');
    setSelectedPlan(null);
    setNetworks([]);
    setDataTypes([]);
    setDataPlans([]);
  }, []);

  const handleServerSelect = async (server: 1 | 2) => {
    setSelectedServer(server);
    setIsLoading(true);
    setLoadingMessage('Loading Networks...');
    try {
      const res = await vtuService.getDataNetworks(server);
      if (res.status) {
        setNetworks(res.data || []);
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
    setLoadingMessage('Loading Categories...');
    try {
      const res = await vtuService.getDataCategories(netId, selectedServer!);
      if (res.status && res.data) {
        setDataTypes(res.data);
        if (res.data.length === 0) {
          // No categories, go straight to plans
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
    setLoadingMessage('Loading Plans...');
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
      setSelectedPlanId(planId);
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
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authenticate Transaction"
        description={`Confirm ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center space-y-4">
        <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Service Provider</h2>
        <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">Buy <br /><span className="text-blue-600">Data.</span></h1>
        <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto leading-relaxed">High-velocity data delivery across all Nigerian networks.</p>
      </div>

      <div className="bg-white p-8 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'SERVER' && (
            <motion.div 
              key="server"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start space-x-6">
                 <AlertCircle className="w-8 h-8 text-blue-600 shrink-0" />
                 <div className="space-y-2">
                    <h4 className="text-lg font-black text-blue-900 tracking-tight">Important Notice</h4>
                    <p className="text-blue-800/60 font-medium leading-relaxed">Both servers have different data plans and prices. Please check both to find the best one for you. Delivery speed is the same on both.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <ServerCard 
                   title="Server 1" 
                   desc="Standard service with competitive rates." 
                   icon={<Server className="w-8 h-8" />} 
                   onClick={() => handleServerSelect(1)} 
                 />
                 <ServerCard 
                   title="Server 2" 
                   desc="Alternative service with unique data bundles." 
                   icon={<Zap className="w-8 h-8" />} 
                   onClick={() => handleServerSelect(2)} 
                 />
              </div>
            </motion.div>
          )}

          {step === 'NETWORK' && (
            <motion.div 
              key="network"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="1" title="Select Network" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {networks.map(n => {
                  const constant = DATA_NETWORKS.find(c => c.name.toUpperCase() === n.name.toUpperCase());
                  return (
                    <SelectionButton 
                      key={n.id} 
                      label={n.name} 
                      image={constant?.image}
                      icon={<Smartphone className="w-6 h-6" />} 
                      onClick={() => handleNetworkSelect(n.id)} 
                    />
                  );
                })}
              </div>
              <BackButton onClick={() => setStep('SERVER')} />
            </motion.div>
          )}

          {step === 'CATEGORY' && (
            <motion.div 
              key="category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="2" title="Select Data Type" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataTypes.map(type => (
                  <SelectionButton 
                    key={type} 
                    label={type} 
                    icon={<Wifi className="w-6 h-6" />} 
                    onClick={() => handleCategorySelect(type)} 
                  />
                ))}
              </div>
              <BackButton onClick={() => setStep('NETWORK')} />
            </motion.div>
          )}

          {step === 'PLAN' && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="3" title="Choose Data Plan" />
              <div className="relative">
                <select 
                  className="w-full p-8 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-[2rem] font-black text-xl outline-none transition-all appearance-none"
                  onChange={(e) => handlePlanSelect(e.target.value)}
                  value={selectedPlanId}
                >
                  <option value="">Select a plan</option>
                  {dataPlans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₦{p.amount.toLocaleString()}</option>
                  ))}
                </select>
                <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight className="w-6 h-6 rotate-90" />
                </div>
              </div>
              <BackButton onClick={() => setStep(dataTypes.length > 0 ? 'CATEGORY' : 'NETWORK')} />
            </motion.div>
          )}

          {step === 'PHONE' && (
            <motion.div 
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="4" title="Recipient Number" />
              <div className="space-y-8">
                <input 
                  type="tel" 
                  className="w-full p-10 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-[3rem] text-5xl font-black tracking-tighter text-center outline-none transition-all placeholder:text-gray-200"
                  placeholder="08012345678"
                  maxLength={11}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  disabled={phoneNumber.length !== 11}
                  onClick={() => setStep('CHECKOUT')}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  Continue to Checkout
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
              className="space-y-10"
            >
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Confirm Purchase</h3>
                <p className="text-gray-400 font-medium">Please review the transaction details below.</p>
              </div>

              <div className="bg-gray-50 p-10 rounded-[3rem] space-y-6 border border-gray-100">
                <CheckoutRow label="Service" value="Data Bundle" />
                <CheckoutRow label="Network" value={networks.find(n => n.id === selectedOperator)?.name || selectedOperator} />
                <CheckoutRow label="Plan" value={selectedPlan?.name || ''} />
                <CheckoutRow label="Recipient" value={phoneNumber} />
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">₦{selectedPlan?.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowPinModal(true)}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95"
                >
                  Confirm & Pay
                </button>
                <button 
                  onClick={() => setStep('PHONE')}
                  className="w-full py-6 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all"
                >
                  Go Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 'SUCCESS' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-10 py-10"
            >
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Success!</h3>
                <p className="text-gray-400 font-medium text-lg">Your data bundle has been sent successfully.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={resetAll}
                  className="px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Buy Again</span>
                </button>
                <button 
                  onClick={() => navigate('/history')}
                  className="px-10 py-6 bg-gray-100 text-gray-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center space-x-3"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View Receipt</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ServerCard = ({ title, desc, icon, onClick }: any) => (
  <button 
    onClick={onClick}
    className="p-10 bg-gray-50 border-2 border-transparent hover:border-blue-600 hover:bg-white rounded-[3rem] text-left transition-all group shadow-sm hover:shadow-2xl"
  >
    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all">
      {icon}
    </div>
    <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2">{title}</h4>
    <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
  </button>
);

const SelectionButton = ({ label, icon, image, onClick }: any) => (
  <button 
    onClick={onClick}
    className="p-8 bg-gray-50 border-2 border-transparent hover:border-blue-600 hover:bg-white rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-sm hover:shadow-xl"
  >
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 shadow-sm group-hover:scale-110 transition-all overflow-hidden p-2">
      {image ? <img src={image} alt={label} className="w-full h-full object-contain" /> : icon}
    </div>
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">{label}</span>
  </button>
);

const StepHeader = ({ num, title }: { num: string, title: string }) => (
  <div className="flex items-center space-x-4 mb-8">
    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-sm">{num}</div>
    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h3>
  </div>
);

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