import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { getNetworkLogo } from '../constants';
import { Smartphone, Zap, CheckCircle2, Receipt, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'NETWORK' | 'AMOUNT' | 'PHONE' | 'CHECKOUT' | 'SUCCESS'>('NETWORK');
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  useEffect(() => {
    const fetchOperators = async () => {
      setIsLoading(true);
      setLoadingMessage('Syncing Network Nodes...');
      const res = await vtuService.getAirtimeOperators();
      if (res.status && res.data) {
        const mapped = res.data.map(op => ({
          ...op,
          image: getNetworkLogo(op.name)
        }));
        setOperators(mapped);
      } else {
        addNotification("Failed to sync airtime networks.", "error");
      }
      setTimeout(() => setIsLoading(false), 800);
    };
    fetchOperators();
  }, [addNotification]);

  const numericAmount = parseFloat(amount) || 0;

  const handleNetworkSelect = (op: Operator) => {
    setSelectedOperator(op);
    setStep('AMOUNT');
  };

  const handleAmountSubmit = () => {
    if (numericAmount < 50) {
      addNotification('Minimum airtime is ₦50.', 'warning');
      return;
    }
    setStep('PHONE');
  };

  const handlePhoneSubmit = () => {
    if (phoneNumber.length !== 11) {
      addNotification('Enter a valid 11-digit number.', 'warning');
      return;
    }
    if (walletBalance !== null && numericAmount > walletBalance) {
      setShowInsufficientModal(true);
      return;
    }
    setStep('CHECKOUT');
  };

  const handlePurchase = async () => {
    if (!selectedOperator || isPurchasing) return;
    setIsPurchasing(true);
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Fulfilling Airtime Protocol...');

    try {
      const res = await vtuService.purchaseAirtime({
        phone: phoneNumber,
        network: selectedOperator.id,
        amount: numericAmount
      } as any);
      
      if (res.status) {
        updateWalletBalance((walletBalance || 0) - numericAmount);
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

  const resetAll = () => {
    setStep('NETWORK');
    setSelectedOperator(null);
    setPhoneNumber('');
    setAmount('');
  };

  if (isLoading) return <LoadingScreen message={loadingMessage} />;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authenticate Transaction"
        description={`Confirm ₦${numericAmount.toLocaleString()} ${selectedOperator?.name} Airtime`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredAmount={numericAmount}
        currentBalance={walletBalance || 0}
        onPayRemaining={() => navigate('/funding')}
      />

      <div className="text-center space-y-4">
        <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Fulfillment Node</h2>
        <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">Buy <br /><span className="text-blue-600">Airtime.</span></h1>
        <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto leading-relaxed">Instant airtime recharge across all Nigerian networks.</p>
      </div>

      <div className="bg-white p-8 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'NETWORK' && (
            <motion.div 
              key="network"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <StepHeader num="1" title="Select Network" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {operators.map(op => (
                  <button
                    key={op.id}
                    onClick={() => handleNetworkSelect(op)}
                    className="p-8 bg-gray-50 border-2 border-transparent hover:border-blue-600 hover:bg-white rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-all overflow-hidden p-2">
                      <img src={op.image} alt={op.name} className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900">{op.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'AMOUNT' && (
            <motion.div 
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="2" title="Enter Amount" />
              <div className="space-y-8">
                <div className="relative">
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-200">₦</span>
                  <input 
                    type="number" 
                    className="w-full p-10 pl-20 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-[3rem] text-6xl font-black tracking-tighter outline-none transition-all placeholder:text-gray-200"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <button 
                  disabled={numericAmount < 50}
                  onClick={handleAmountSubmit}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
              <BackButton onClick={() => setStep('NETWORK')} />
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
              <StepHeader num="3" title="Recipient Number" />
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
                  onClick={handlePhoneSubmit}
                  className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  Review Order
                </button>
              </div>
              <BackButton onClick={() => setStep('AMOUNT')} />
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
                <CheckoutRow label="Service" value="Airtime Recharge" />
                <CheckoutRow label="Network" value={selectedOperator?.name || ''} />
                <CheckoutRow label="Recipient" value={phoneNumber} />
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-3xl font-black text-blue-600 tracking-tighter">₦{numericAmount.toLocaleString()}</span>
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
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Recharge Successful!</h3>
                <p className="text-gray-400 font-medium text-lg">Airtime has been delivered to {phoneNumber}.</p>
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

      <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 flex items-start space-x-8">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-blue-900 tracking-tight">Instant Fulfillment</h4>
          <p className="text-blue-800/60 font-medium leading-relaxed">Our airtime nodes are optimized for sub-second delivery. Your recharge will materialize on the recipient's device immediately after protocol confirmation.</p>
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

export default AirtimePage;