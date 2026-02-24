import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { CABLE_BILLERS } from '../constants';
import { Tv, CheckCircle2, Receipt, ArrowRight, Zap, Smartphone, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'PROVIDER' | 'SMARTCARD' | 'PLAN' | 'PHONE' | 'CHECKOUT' | 'SUCCESS'>('PROVIDER');
  const [operators] = useState<Operator[]>(CABLE_BILLERS);
  const [cablePlans, setCablePlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [smartcardNo, setSmartcardNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const fetchPlans = useCallback(async (billerName: string) => {
    setIsLoading(true);
    setLoadingMessage('Loading Packages...');
    setCablePlans([]);
    setSelectedPlan(null);
    const response = await vtuService.getCablePlans(billerName);
    if (response.status && response.data) {
      setCablePlans(response.data);
    } else {
      addNotification(response.message || 'Node sync failed.', 'error');
    }
    setTimeout(() => setIsLoading(false), 800);
  }, [addNotification]);

  const handleVerify = async () => {
    if (!selectedOperator || !smartcardNo) return;
    setIsLoading(true);
    setLoadingMessage('Checking Decoder...');
    setCustomerName(null);
    const response = await vtuService.verifyCableSmartcard({ 
      biller: selectedOperator.id, 
      smartCardNumber: smartcardNo,
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Decoder verified successfully.', 'success');
      await fetchPlans(selectedOperator.id);
      setStep('PLAN');
    } else {
      addNotification(response.message || 'Validation failed. Please check the IUC number.', 'error');
    }
    setIsLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !smartcardNo || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Processing Payment...');

    const response = await vtuService.purchaseCable({
      biller: selectedOperator!.id,
      smartCardNumber: smartcardNo,
      planCode: selectedPlan.id,
      amount: selectedPlan.amount,
      plan_name: selectedPlan.name
    });

    if (response.status && response.data) {
      addNotification(`${selectedOperator?.name} active for ${smartcardNo}.`, 'success');
      setStep('SUCCESS');
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Fulfillment error.', 'error');
    }
    setIsPurchasing(false);
    setIsLoading(false);
  };

  const resetAll = () => {
    setStep('PROVIDER');
    setSelectedOperator(null);
    setSelectedPlan(null);
    setSmartcardNo('');
    setPhoneNumber('');
    setCustomerName(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {isLoading && <LoadingScreen message={loadingMessage} />}
      
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authorize Renewal"
        description={`Confirm ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBalance={walletBalance || 0}
        requiredAmount={selectedPlan?.amount || 0}
        onPayRemaining={() => navigate('/funding')}
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Tv className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Cable TV</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Renew your DStv, GOtv, and StarTimes subscriptions instantly.</p>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'PROVIDER' && (
            <motion.div 
              key="provider"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="01" title="Select Provider" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {operators.map(op => (
                  <button 
                    key={op.id}
                    onClick={() => {
                      setSelectedOperator(op);
                      setStep('SMARTCARD');
                    }}
                    className={`group p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center space-y-4 ${selectedOperator?.id === op.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Tv className="w-10 h-10 text-blue-600" />
                    </div>
                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">{op.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'SMARTCARD' && (
            <motion.div 
              key="smartcard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <BackButton onClick={() => setStep('PROVIDER')} />
              <StepHeader num="02" title="IUC / Smartcard" />
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full p-10 bg-gray-50 border-4 border-transparent rounded-[2.5rem] text-4xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all text-center placeholder:text-gray-200" 
                    placeholder="0000000000" 
                    value={smartcardNo} 
                    onChange={e => setSmartcardNo(e.target.value.replace(/\D/g, ''))} 
                  />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300">
                    <CreditCard className="w-8 h-8" />
                  </div>
                </div>
                <button 
                  onClick={handleVerify}
                  disabled={smartcardNo.length < 5}
                  className="w-full py-8 bg-gray-900 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95 disabled:opacity-30"
                >
                  Verify Identity
                </button>
              </div>
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
              <BackButton onClick={() => setStep('SMARTCARD')} />
              <StepHeader num="03" title="Select Package" />
              
              <div className="p-8 bg-blue-50 rounded-[2.5rem] border-2 border-dashed border-blue-100 flex items-center space-x-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <Tv className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Customer Identified</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight uppercase">{customerName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cablePlans.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setStep('PHONE');
                    }}
                    className={`p-8 rounded-[2.5rem] border-2 text-left transition-all flex justify-between items-center group ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{plan.name}</h4>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{selectedOperator?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-600 font-black text-3xl tracking-tighter">₦{plan.amount.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
              </div>
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
              <BackButton onClick={() => setStep('PLAN')} />
              <StepHeader num="04" title="Recipient Phone" />
              <div className="space-y-6">
                <div className="relative">
                  <input 
                    type="tel" 
                    className="w-full p-10 bg-gray-50 border-4 border-transparent rounded-[2.5rem] text-4xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all text-center placeholder:text-gray-200" 
                    placeholder="08000000000" 
                    value={phoneNumber} 
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                    maxLength={11}
                  />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300">
                    <Smartphone className="w-8 h-8" />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (walletBalance !== null && (selectedPlan?.amount || 0) > walletBalance) {
                      setShowInsufficientModal(true);
                      return;
                    }
                    setStep('CHECKOUT');
                  }}
                  disabled={phoneNumber.length !== 11}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-30"
                >
                  Review Order
                </button>
              </div>
            </motion.div>
          )}

          {step === 'CHECKOUT' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="05" title="Final Checkout" />
              
              <div className="bg-gray-50 rounded-[3rem] p-10 space-y-8 border border-gray-100">
                <CheckoutRow label="Provider" value={selectedOperator?.name || ''} />
                <CheckoutRow label="Package" value={selectedPlan?.name || ''} />
                <CheckoutRow label="IUC Number" value={smartcardNo} />
                <CheckoutRow label="Customer" value={customerName || ''} />
                <CheckoutRow label="Recipient" value={phoneNumber} />
                
                <div className="pt-8 border-t-4 border-dashed border-gray-200 flex justify-between items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">₦{selectedPlan?.amount.toLocaleString()}</span>
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
                <p className="text-gray-400 font-medium text-lg">Your {selectedOperator?.name} subscription is now active.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={resetAll}
                  className="px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Renew Another</span>
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

      <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 flex items-start space-x-8">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-blue-900 tracking-tight">Instant Activation</h4>
          <p className="text-blue-800/60 font-medium leading-relaxed">Cable TV renewals are done instantly. Your signal will be back within minutes after payment.</p>
        </div>
      </div>
    </div>
  );
};

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

export default CablePage;