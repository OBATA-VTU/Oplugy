import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { CheckCircle2, Receipt, ArrowRight, Zap, Smartphone, CreditCard, Lightbulb, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const navigate = useNavigate();
  
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const numericAmount = parseFloat(amount);
  const selectedOperator = operators.find(op => op.id === selectedOperatorId);

  const fetchOperators = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage('Loading Companies...');
    const response = await vtuService.getElectricityOperators();
    if (response.status && response.data) {
      setOperators(response.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleVerify = async () => {
    if (!selectedOperatorId || !meterNumber) return;
    setIsLoading(true);
    setLoadingMessage('Checking Meter...');
    setCustomerName(null);
    const response = await vtuService.verifyElectricityMeter({
      provider_id: selectedOperatorId,
      meter_number: meterNumber,
      meter_type: meterType,
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Meter verified successfully.', 'success');
    } else {
      addNotification(response.message || 'Verification failed. Please check the meter number.', 'error');
    }
    setIsLoading(false);
  };

  const handlePurchase = async () => {
    if (!customerName || !numericAmount || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Getting Token...');

    const response = await vtuService.purchaseElectricity({
      provider_id: selectedOperatorId,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: numericAmount,
      phone: phoneNumber,
      provider_name: selectedOperator?.name || ''
    });

    if (response.status && response.data) {
      setToken(response.data.token || null);
      addNotification(`Payment successful!`, 'success');
      setIsSuccess(true);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Payment failed.', 'error');
    }
    setIsPurchasing(false);
    setIsLoading(false);
  };

  const resetAll = () => {
    setSelectedOperatorId('');
    setMeterNumber('');
    setAmount('');
    setPhoneNumber('');
    setCustomerName(null);
    setToken(null);
    setIsSuccess(false);
  };

  if (isLoading && !isPurchasing) return <LoadingScreen message={loadingMessage} />;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 px-4">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authorize Payment"
        description={`Confirm ₦${numericAmount.toLocaleString()} for electricity.`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBalance={walletBalance || 0}
        requiredAmount={numericAmount}
        onPayRemaining={() => navigate(`/funding?amount=${numericAmount - (walletBalance || 0)}`)}
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Lightbulb className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Electricity</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Pay your electricity bills and get tokens instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-16 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {isSuccess ? (
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
                <p className="text-gray-400 font-medium text-lg">Your electricity bill has been paid.</p>
                {token && (
                  <div className="bg-gray-900 p-8 rounded-[2rem] border-t-4 border-blue-600 shadow-2xl mt-6">
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-2">Your Token</p>
                    <p className="text-4xl font-black text-white tracking-[0.2em]">{token}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={resetAll}
                  className="px-10 py-6 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 flex items-center justify-center space-x-3"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Pay Another</span>
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
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Disco Selection */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">1. Select Disco</label>
                  <div className="relative">
                    <select 
                      className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none transition-all appearance-none"
                      value={selectedOperatorId}
                      onChange={(e) => {
                        setSelectedOperatorId(e.target.value);
                        setCustomerName(null);
                      }}
                    >
                      <option value="">Choose Company</option>
                      {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Meter Type */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">2. Meter Type</label>
                  <div className="flex p-2 bg-gray-50 rounded-[2rem]">
                    <button 
                      onClick={() => setMeterType('prepaid')}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${meterType === 'prepaid' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
                    >
                      Prepaid
                    </button>
                    <button 
                      onClick={() => setMeterType('postpaid')}
                      className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${meterType === 'postpaid' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
                    >
                      Postpaid
                    </button>
                  </div>
                </div>

                {/* Meter Number */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">3. Meter Number</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        className="w-full p-6 pl-14 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                        placeholder="00000000000"
                        value={meterNumber}
                        onChange={(e) => {
                          setMeterNumber(e.target.value.replace(/\D/g, ''));
                          setCustomerName(null);
                        }}
                      />
                      <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    </div>
                    <button 
                      onClick={handleVerify}
                      disabled={!selectedOperatorId || meterNumber.length < 5 || isLoading}
                      className="px-8 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-30"
                    >
                      Verify
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">4. Amount (₦)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      className="w-full p-6 pl-14 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₦</span>
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

              {/* Customer Info */}
              {customerName && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex items-center space-x-6"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer Name</p>
                    <p className="text-xl font-black text-gray-900 tracking-tight uppercase">{customerName}</p>
                  </div>
                </motion.div>
              )}

              <button 
                disabled={!customerName || !amount || numericAmount <= 0 || phoneNumber.length !== 11 || isPurchasing}
                onClick={() => {
                  if (walletBalance !== null && numericAmount > walletBalance) {
                    setShowInsufficientModal(true);
                    return;
                  }
                  setShowPinModal(true);
                }}
                className="w-full py-10 bg-blue-600 text-white rounded-[3rem] font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-200 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
              >
                {isPurchasing ? <LoadingScreen message="Processing..." /> : <><Zap className="w-5 h-5" /> <span>Pay Bill</span></>}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-10 bg-blue-50 rounded-[3rem] border border-blue-100 flex items-start space-x-8">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Zap className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h4 className="text-xl font-black text-blue-900 tracking-tight">Instant Token</h4>
          <p className="text-blue-800/60 font-medium leading-relaxed">Your token will be ready immediately after payment. We will also send it to your phone via SMS.</p>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;
