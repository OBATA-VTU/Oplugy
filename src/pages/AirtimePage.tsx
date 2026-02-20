import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import PinPromptModal from '../components/PinPromptModal';
import { AIRTIME_NETWORKS } from '../constants';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, updateWalletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoadingOperators, setIsLoadingOperators] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  React.useEffect(() => {
    const fetchOperators = async () => {
      setIsLoadingOperators(true);
      const res = await vtuService.getAirtimeOperators();
      if (res.status && res.data) {
        // Map API operators to our constants to get images
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
      setIsLoadingOperators(false);
    };
    fetchOperators();
  }, []);

  const numericAmount = parseFloat(amount);

  const handlePrePurchaseCheck = () => {
    if (!selectedOperator || !phoneNumber || !numericAmount) {
      addNotification('Please fill all fields.', 'warning');
      return;
    }
    if (!/^\d{11}$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }
    if (numericAmount < 50) {
      addNotification('The minimum airtime amount is ₦50.', 'warning');
      return;
    }
    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const startPinVerification = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !phoneNumber || !numericAmount || isPurchasing) return;

    setIsPurchasing(true);
    setShowPinModal(false);

    const payload = {
      phone: phoneNumber,
      network: selectedOperator.id,
      amount: numericAmount
    };

    const response = await vtuService.purchaseAirtime(payload as any);

    if (response.status && response.data) {
      addNotification(`${selectedOperator.name} Airtime recharge successful for ${phoneNumber}.`, 'success');
      if (walletBalance !== null) {
        updateWalletBalance(walletBalance - numericAmount);
      }
      setPhoneNumber('');
      setAmount('');
      setSelectedOperator(null);
    } else {
      addNotification(response.message || 'Purchase failed. Please try again later.', 'error');
    }
    setIsPurchasing(false);
  };

  const isFormValid = selectedOperator && phoneNumber.length === 11 && numericAmount >= 50;

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Approve Transaction"
        description={`Paying ₦${numericAmount.toLocaleString()} for ${selectedOperator?.name} Airtime.`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4">Express Airtime</h2>
        <p className="text-gray-400 font-medium text-lg">Instant recharges with high-velocity delivery.</p>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 space-y-12">
        <div className="space-y-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">1. Select Network</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isLoadingOperators ? (
                <div className="col-span-full flex justify-center py-10">
                  <Spinner />
                </div>
              ) : operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op)}
                  className={`p-6 border-4 rounded-[2.5rem] transition-all duration-300 flex flex-col items-center gap-3 ${selectedOperator?.id === op.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                >
                  <img src={op.image} alt={op.name} className="h-12 w-12 object-contain" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOperator?.id === op.id ? 'text-blue-600' : 'text-gray-400'}`}>{op.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">2. Destination Phone</label>
              <input
                type="tel"
                id="phoneNumber"
                className="w-full p-6 bg-gray-50 border-4 border-transparent rounded-[2rem] focus:border-blue-600 focus:bg-white transition-all text-2xl font-black tracking-tight text-center outline-none"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                required
                disabled={isPurchasing}
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">3. Value (₦)</label>
              <div className="relative">
                <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">₦</span>
                <input
                  type="number"
                  id="amount"
                  className="w-full p-6 pl-14 bg-gray-50 border-4 border-transparent rounded-[2rem] focus:border-blue-600 focus:bg-white transition-all text-2xl font-black tracking-tight text-center outline-none"
                  placeholder="0.00"
                  min="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={isPurchasing}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handlePrePurchaseCheck}
            className="w-full bg-blue-600 hover:bg-black text-white font-black py-10 rounded-[3rem] shadow-2xl shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.4em] text-sm"
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Execute Recharge'}
          </button>
        </div>
      </div>

      <div className="p-10 bg-gray-900 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div>
               <h4 className="text-2xl font-black tracking-tight">Instant Node Fulfillment</h4>
               <p className="text-white/40 text-sm font-medium">Recharges are processed within 2 seconds across our distributed network core.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Order"
        footer={
          <div className="flex gap-4 w-full">
            <button className="flex-1 bg-gray-100 text-gray-400 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="flex-[2] bg-blue-600 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px] shadow-xl shadow-blue-500/20" onClick={startPinVerification} disabled={isPurchasing}>
              {isPurchasing ? <Spinner /> : `Approve & Pay`}
            </button>
          </div>
        }
      >
        <div className="text-center py-6 space-y-6">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
              <img src={selectedOperator?.image} alt={selectedOperator?.name} className="w-14 h-14 object-contain" />
           </div>
           <p className="text-gray-400 font-medium text-lg leading-tight">Recharging <span className="text-gray-900 font-black tracking-tight">₦{numericAmount.toLocaleString()}</span> to:</p>
           <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{phoneNumber}</h3>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-6 py-2 rounded-full inline-block">Carrier: {selectedOperator?.name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default AirtimePage;