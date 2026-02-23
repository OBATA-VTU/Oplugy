import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { GraduationCap, ShieldCheck, CheckCircle2, Receipt, ArrowRight, Zap, Smartphone, CreditCard, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const EducationPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, fetchWalletBalance } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'EXAM' | 'QUANTITY' | 'CHECKOUT' | 'SUCCESS'>('EXAM');
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setIsLoading(true);
      setLoadingMessage('Syncing Examination Nodes...');
      const res = await vtuService.getEducationPlans();
      if (res.status && res.data) {
        setExamTypes(res.data);
      }
      setTimeout(() => setIsLoading(false), 800);
    };
    fetchPlans();
  }, []);

  const marginPerPin = 10;
  const totalAmount = (selectedExam ? (selectedExam.price + marginPerPin) : 0) * quantity;

  const handlePurchase = async () => {
    if (!selectedExam || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Generating Secure PINs...');
    
    const response = await vtuService.purchaseEducation({
      type: String(selectedExam.id),
      quantity: Number(quantity),
      amount: totalAmount,
      name: selectedExam.name
    });

    if (response.status) {
      addNotification(`Successfully generated ${quantity} ${selectedExam.name}(s).`, 'success');
      setStep('SUCCESS');
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Transaction failed. Node synchronization interrupted.', 'error');
    }
    setIsPurchasing(false);
    setIsLoading(false);
  };

  const resetAll = () => {
    setStep('EXAM');
    setSelectedExam(null);
    setQuantity(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      {isLoading && <LoadingScreen message={loadingMessage} />}
      
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`Authorize ₦${totalAmount.toLocaleString()} for ${quantity}x ${selectedExam?.name} pins.`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBalance={walletBalance || 0}
        requiredAmount={totalAmount}
        onPayRemaining={() => navigate('/funding')}
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <GraduationCap className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Exam PINs</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Get WAEC, NECO, and NABTEB result checker pins instantly.</p>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'EXAM' && (
            <motion.div 
              key="exam"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <StepHeader num="01" title="Select Exam Type" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {examTypes.map(exam => (
                  <button 
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam);
                      setStep('QUANTITY');
                    }}
                    className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all flex justify-between items-center ${selectedExam?.id === exam.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                  >
                    <div className="space-y-1">
                      <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{exam.name}</h4>
                      <p className="text-blue-600 font-black text-2xl tracking-tighter">₦{(exam.price + marginPerPin).toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedExam?.id === exam.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-300'}`}>
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'QUANTITY' && (
            <motion.div 
              key="quantity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <BackButton onClick={() => setStep('EXAM')} />
              <StepHeader num="02" title="Select Quantity" />
              
              <div className="flex flex-col items-center space-y-12 py-10">
                <div className="flex items-center space-x-12">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Minus className="w-8 h-8" />
                  </button>
                  <span className="text-9xl font-black text-gray-900 tracking-tighter">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="w-20 h-20 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </div>
                
                <div className="bg-gray-900 p-10 rounded-[3rem] w-full max-w-md text-center shadow-2xl border-t-8 border-blue-600">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Total Amount</p>
                  <p className="text-6xl font-black text-white tracking-tighter">₦{totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  if (walletBalance !== null && totalAmount > walletBalance) {
                    setShowInsufficientModal(true);
                    return;
                  }
                  setStep('CHECKOUT');
                }}
                className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95"
              >
                Review Order
              </button>
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
              <StepHeader num="03" title="Final Checkout" />
              
              <div className="bg-gray-50 rounded-[3rem] p-10 space-y-8 border border-gray-100">
                <CheckoutRow label="Exam Type" value={selectedExam?.name || ''} />
                <CheckoutRow label="Quantity" value={`${quantity} PIN(s)`} />
                <CheckoutRow label="Price per PIN" value={`₦${(selectedExam?.price + marginPerPin).toLocaleString()}`} />
                
                <div className="pt-8 border-t-4 border-dashed border-gray-200 flex justify-between items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">₦{totalAmount.toLocaleString()}</span>
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
                  onClick={() => setStep('QUANTITY')}
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
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Purchase Successful!</h3>
                <p className="text-gray-400 font-medium text-lg">Your {quantity}x {selectedExam?.name} PINs have been generated.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={resetAll}
                  className="px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Buy Another</span>
                </button>
                <button 
                  onClick={() => navigate('/history')}
                  className="px-10 py-6 bg-gray-100 text-gray-900 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center space-x-3"
                >
                  <Receipt className="w-4 h-4" />
                  <span>View PINs</span>
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
          <h4 className="text-xl font-black text-blue-900 tracking-tight">Instant Delivery</h4>
          <p className="text-blue-800/60 font-medium leading-relaxed">Exam PINs are delivered instantly. You can find them in your transaction history immediately after protocol confirmation.</p>
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

export default EducationPage;
