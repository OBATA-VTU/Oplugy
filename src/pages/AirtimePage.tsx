
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { AIRTIME_NETWORKS } from '../constants';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators] = useState<Operator[]>(AIRTIME_NETWORKS);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const numericAmount = parseFloat(amount);

  const handlePrePurchaseCheck = () => {
    if (!selectedOperator || !phoneNumber || !numericAmount) {
      addNotification('Please fill all required fields.', 'warning');
      return;
    }
    if (phoneNumber.length !== 11 || !/^\d{11}$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }
    if (numericAmount < 50) {
      addNotification('Minimum airtime purchase is ₦50.', 'warning');
      return;
    }
    setShowConfirmModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !phoneNumber || !numericAmount || isPurchasing) return;

    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      setShowConfirmModal(false);
      return;
    }

    setIsPurchasing(true);
    setShowConfirmModal(false);

    const payload = {
      phone: phoneNumber,
      network: selectedOperator.id,
      amount: numericAmount,
    };

    const response = await vtuService.purchaseAirtime(payload);

    if (response.status && response.data) {
      addNotification(`Airtime purchase of ₦${numericAmount} for ${phoneNumber} was successful.`, 'success');
      setPhoneNumber('');
      setAmount('');
      setSelectedOperator(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Airtime purchase failed.', 'error');
    }
    setIsPurchasing(false);
  };

  const isFormValid = selectedOperator && phoneNumber.length === 11 && numericAmount > 0;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Buy Airtime</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Operator</label>
            <div className="grid grid-cols-4 gap-2">
              {operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => setSelectedOperator(op)}
                  className={`p-2 border rounded-lg transition-all duration-200 ${selectedOperator?.id === op.id ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-300'}`}
                >
                  <img src={op.image} alt={op.name} className="h-8 mx-auto" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              required
              disabled={isPurchasing}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-semibold mb-2">Amount (₦)</label>
            <input
              type="number"
              id="amount"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g., 1000"
              min="50"
              step="50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isPurchasing}
            />
          </div>

          <button
            onClick={handlePrePurchaseCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Purchase Airtime'}
          </button>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Airtime Purchase"
        footer={
          <>
            <button className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md mr-2" onClick={() => setShowConfirmModal(false)}>Cancel</button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center" onClick={handlePurchase} disabled={isPurchasing}>
              {isPurchasing ? <Spinner /> : `Confirm (₦${numericAmount.toLocaleString()})`}
            </button>
          </>
        }
      >
        <p>Please confirm you want to buy <span className="font-bold">₦{numericAmount.toLocaleString()}</span> airtime for <span className="font-bold">{phoneNumber}</span> ({selectedOperator?.name}).</p>
      </Modal>
    </div>
  );
};

export default AirtimePage;
