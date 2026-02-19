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
  const [operators] = useState<Operator[]>(AIRTIME_NETWORKS);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const numericAmount = parseFloat(amount);

  const handlePrePurchaseCheck = () => {
    if (!selectedOperator || !phoneNumber || !numericAmount) {
      addNotification('Please fill all required fields.', 'warning');
      return;
    }
    if (!/^\d{11}$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }
    if (numericAmount < 50) {
      addNotification('Minimum purchase is ₦50.', 'warning');
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
      amount: numericAmount,
    };

    const response = await vtuService.purchaseAirtime(payload);

    if (response.status && response.data) {
      addNotification(`Airtime sent successfully to ${phoneNumber}.`, 'success');
      if (walletBalance !== null) {
        updateWalletBalance(walletBalance - numericAmount);
      }
      setPhoneNumber('');
      setAmount('');
      setSelectedOperator(null);
    } else {
      addNotification(response.message || 'Purchase failed. Please try again.', 'error');
    }
    setIsPurchasing(false);
  };

  const isFormValid = selectedOperator && phoneNumber.length === 11 && numericAmount >= 50;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Verify Purchase"
        description={`Paying ₦${numericAmount.toLocaleString()} for ${selectedOperator?.name} Airtime`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Buy Airtime</h2>
        <p className="text-gray-400 font-medium">Get instant recharge on all mobile networks.</p>
      </div>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
        <div className="space-y-10">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Select Network</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op)}
                  className={`p-6 border-2 rounded-[2rem] transition-all duration-300 flex flex-col items-center gap-3 ${selectedOperator?.id === op.id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <img src={op.image} alt={op.name} className="h-12 w-12 object-contain" />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOperator?.id === op.id ? 'text-blue-600' : 'text-gray-400'}`}>{op.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-xl font-black tracking-tight"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                required
                disabled={isPurchasing}
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                <input
                  type="number"
                  id="amount"
                  className="w-full p-5 pl-10 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-xl font-black tracking-tight"
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
            className="w-full bg-blue-600 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 flex items-center justify-center uppercase tracking-[0.2em] text-sm"
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Buy Now'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Airtime"
        footer={
          <div className="flex gap-4 w-full">
            <button className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="flex-2 bg-blue-600 hover:bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px]" onClick={startPinVerification} disabled={isPurchasing}>
              {isPurchasing ? <Spinner /> : `Authorize`}
            </button>
          </div>
        }
      >
        <div className="text-center py-6 space-y-4">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <img src={selectedOperator?.image} alt={selectedOperator?.name} className="w-8 h-8 object-contain" />
           </div>
           <p className="text-gray-500 font-medium">You are about to buy <span className="text-gray-900 font-black tracking-tight">₦{numericAmount.toLocaleString()}</span> airtime for:</p>
           <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{phoneNumber}</h3>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Network: {selectedOperator?.name}</p>
        </div>
      </Modal>
    </div>
  );
};

export default AirtimePage;