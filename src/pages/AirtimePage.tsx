import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import { AIRTIME_NETWORKS } from '../constants';
import { BoltIcon } from '../components/Icons';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoadingOperators, setIsLoadingOperators] = useState(true);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

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
            // Ensure we use the correct serviceID from the API
            id: op.id, 
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
      setShowInsufficientModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const handlePayRemaining = () => {
    setShowInsufficientModal(false);
    // Redirect to funding with the required amount or trigger payment gateway
    addNotification("Redirecting to payment gateway...", "info");
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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`You are about to buy ₦${numericAmount.toLocaleString()} ${selectedOperator?.name} airtime.`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredAmount={numericAmount}
        currentBalance={walletBalance || 0}
        onPayRemaining={handlePayRemaining}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        requiredAmount={numericAmount}
        currentBalance={walletBalance || 0}
        onPayRemaining={handlePayRemaining}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Buy Airtime</h2>
        <p className="text-gray-500 font-medium text-lg">Recharge any phone number instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 space-y-10">
        <div className="space-y-8">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">1. Select Network</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {isLoadingOperators ? (
                <div className="col-span-full flex justify-center py-10">
                  <Spinner />
                </div>
              ) : operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op)}
                  className={`p-5 border-2 rounded-3xl transition-all duration-300 flex flex-col items-center gap-3 ${selectedOperator?.id === op.id ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                >
                  <img src={op.image} alt={op.name} className="h-10 w-10 object-contain" />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedOperator?.id === op.id ? 'text-blue-600' : 'text-gray-400'}`}>{op.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="phoneNumber" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">2. Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-2xl font-bold tracking-tight text-center outline-none"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                maxLength={11}
                required
                disabled={isPurchasing}
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">3. Amount (₦)</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₦</span>
                <input
                  type="number"
                  id="amount"
                  className="w-full p-5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-blue-600 focus:bg-white transition-all text-2xl font-bold tracking-tight text-center outline-none"
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
            className="w-full bg-blue-600 hover:bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all duration-300 transform active:scale-95 disabled:opacity-50 flex items-center justify-center uppercase tracking-widest text-sm"
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Buy Now'}
          </button>
        </div>
      </div>

      <div className="p-8 bg-blue-50 text-blue-900 rounded-[2.5rem] border border-blue-100 flex items-center space-x-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><BoltIcon /></div>
        <p className="text-sm font-medium">Airtime recharges are processed instantly and delivered to the recipient in seconds.</p>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Order"
        footer={
          <div className="flex gap-4 w-full">
            <button className="flex-1 bg-gray-100 text-gray-400 font-bold py-4 rounded-xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="flex-[2] bg-blue-600 hover:bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px] shadow-lg shadow-blue-100" onClick={startPinVerification} disabled={isPurchasing}>
              {isPurchasing ? <Spinner /> : `Confirm & Pay`}
            </button>
          </div>
        }
      >
        <div className="text-center py-4 space-y-6">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100">
              <img src={selectedOperator?.image} alt={selectedOperator?.name} className="w-12 h-12 object-contain" />
           </div>
           <p className="text-gray-500 font-medium text-lg">You are sending <span className="text-gray-900 font-bold">₦{numericAmount.toLocaleString()}</span> to:</p>
           <h3 className="text-4xl font-bold text-gray-900 tracking-tight">{phoneNumber}</h3>
           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full inline-block">{selectedOperator?.name} Network</p>
        </div>
      </Modal>
    </div>
  );
};

export default AirtimePage;