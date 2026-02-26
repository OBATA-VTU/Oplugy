import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { AIRTIME_NETWORKS } from '../constants';
import { Zap, CheckCircle2, Receipt, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, updateWalletBalance } = useAuth();
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
      setLoadingMessage('Syncing Networks...');
      const res = await vtuService.getAirtimeOperators();
      if (res.status && res.data) {
        const mapped = res.data.map(op => {
          const constant = AIRTIME_NETWORKS.find(c => c.name.toUpperCase() === op.name.toUpperCase());
          return {
            ...op,
            image: constant?.image || 'https://cdn-icons-png.flaticon.com/512/8112/8112396.png'
          };
        });
        setOperators(mapped);
      } else {
        setOperators(AIRTIME_NETWORKS);
      }
      setTimeout(() => setIsLoading(false), 800);
    };
    fetchOperators();
  }, []);

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
    setLoadingMessage('Processing Order...');

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
    <div className="max-w-5xl mx-auto space-y-16 pb-32 px-4">
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

      <div className="flex flex-col items-center text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.4em] border border-blue-100/50"
        >
          Airtime Top-up
        </motion.div>
        <h1 className="text-6xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-[0.8] py-2">
          Recharge <br />
          <span className="text-blue-600">Instantly.</span>
        </h1>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto leading-relaxed">
          Fast, secure, and reliable airtime recharge for all networks in Nigeria.
        </p>
      </div>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute -top-8 left-0 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ 
              width: step === 'NETWORK' ? '20%' : 
                     step === 'AMOUNT' ? '40%' : 
                     step === 'PHONE' ? '60%' : 
                     step === 'CHECKOUT' ? '80%' : '100%' 
            }}
          />
        </div>

        <div className="bg-white p-8 lg:p-20 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-50 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'NETWORK' && (
              <motion.div 
                key="network"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Select Network</h3>
                  <p className="text-gray-400 font-medium">Which provider are you recharging today?</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {operators.map((op, idx) => (
                    <motion.button
                      key={op.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.05 } }}
                      onClick={() => handleNetworkSelect(op)}
                      className="group relative p-10 bg-gray-50 hover:bg-white rounded-[3rem] flex flex-col items-center gap-6 transition-all border-2 border-transparent hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100"
                    >
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all overflow-hidden p-3">
                        <img src={op.image} alt={op.name} className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-900 transition-colors">{op.name}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'AMOUNT' && (
              <motion.div 
                key="amount"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-12"
              >
                <div className="space-y-2">
                  <h3 className="text-4xl font-black text-gray-900 tracking-tight">Enter Amount</h3>
                  <p className="text-gray-400 font-medium">How much airtime do you need?</p>
                </div>

                <div className="space-y-10">
                  <div className="relative group">
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-5xl font-black text-gray-200 group-focus-within:text-blue-600 transition-colors">₦</span>
                    <input 
                      type="number" 
                      autoFocus
                      className="w-full p-12 pl-24 bg-gray-50 border-4 border-transparent focus:border-blue-600 focus:bg-white rounded-[4rem] text-7xl lg:text-9xl font-black tracking-tighter outline-none transition-all placeholder:text-gray-100"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    {[100, 200, 500, 1000].map(val => (
                      <button 
                        key={val}
                        onClick={() => setAmount(String(val))}
                        className="py-4 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl font-black text-sm transition-all border border-transparent hover:border-blue-100"
                      >
                        ₦{val}
                      </button>
                    ))}
                  </div>

                  <button 
                    disabled={numericAmount < 50}
                    onClick={handleAmountSubmit}
                    className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
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
                    onClick={handlePhoneSubmit}
                    className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50"
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
                    <CheckoutRow label="Service" value="Airtime Recharge" />
                    <CheckoutRow label="Network" value={selectedOperator?.name || ''} />
                    <CheckoutRow label="Recipient" value={phoneNumber} />
                    <div className="pt-8 border-t border-gray-200 flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total to Pay</span>
                        <p className="text-gray-400 text-xs font-medium">No hidden charges</p>
                      </div>
                      <span className="text-5xl font-black text-blue-600 tracking-tighter">₦{numericAmount.toLocaleString()}</span>
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
                    ₦{numericAmount.toLocaleString()} {selectedOperator?.name} airtime is on its way to {phoneNumber}.
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-12 bg-blue-50 rounded-[4rem] border border-blue-100 flex flex-col items-center text-center space-y-6 group hover:bg-white hover:shadow-2xl transition-all">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-all">
            <Zap className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h4 className="text-2xl font-black text-blue-900 tracking-tight">Instant Delivery</h4>
            <p className="text-blue-800/60 font-medium leading-relaxed">Our automated system ensures your airtime reaches the destination in seconds.</p>
          </div>
        </div>

        <div className="p-12 bg-gray-950 rounded-[4rem] text-white flex flex-col items-center text-center space-y-6 group hover:shadow-2xl transition-all relative overflow-hidden">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-all relative z-10">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="space-y-2 relative z-10">
            <h4 className="text-2xl font-black tracking-tight">Secure Payment</h4>
            <p className="text-white/40 font-medium leading-relaxed">Your transactions are protected by bank-grade security and encryption.</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px]"></div>
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

export default AirtimePage;