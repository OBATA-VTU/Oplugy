import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { AIRTIME_NETWORKS } from '../constants.ts';

const AirtimePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null); // For display in modal

  const numericAmount = parseFloat(amount);

  const fetchOperators = useCallback(async () => {
    setIsFetchingOperators(true);
    try {
      // CIP API doesn't have an endpoint for this, so we use a hardcoded list
      setOperators(AIRTIME_NETWORKS);
    } catch (error: any) {
      console.error("Error fetching operators:", error);
      addNotification(error.message || 'Error fetching operators.', 'error');
    } finally {
      setIsFetchingOperators(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handlePrePurchaseCheck = () => {
    if (!selectedOperator || !phoneNumber || !numericAmount) {
      addNotification('Please fill all required fields.', 'warning');
      return;
    }
    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }
    if (numericAmount <= 0) {
      addNotification('Amount must be greater than zero.', 'warning');
      return;
    }

    if (phoneNumber === '201000000000' && selectedOperator.id === '9MOBILE') {
      setCustomerName('CIP Test User');
    } else {
      setCustomerName(null);
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

    try {
      const response = await vtuService.purchaseAirtime(payload);

      if (response.status && response.data) {
        addNotification(`Airtime purchase successful! Ref: ${response.data.reference}. Amount: ₦${response.data.amount}`, 'success');
        setPhoneNumber('');
        setAmount('');
        setSelectedOperator(null);
        await fetchWalletBalance();
      } else {
        const errorMessage = response.message || 'Airtime purchase failed.';
        addNotification(errorMessage, 'error');
        console.error('Airtime Purchase API Error:', {
          message: errorMessage,
          errors: response.errors,
          payload
        });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error during airtime purchase.', 'error');
      console.error('Airtime Purchase Exception:', {
        error,
        payload
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFormValid = selectedOperator && phoneNumber.length === 11 && numericAmount > 0;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Buy Airtime</h2>

      {isFetchingOperators ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div>
            <label htmlFor="operator" className="block text-gray-700 text-sm font-semibold mb-2">
              Select Operator
            </label>
            <select
              id="operator"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedOperator?.id || ''}
              onChange={(e) => {
                const op = operators.find((o) => o.id === e.target.value);
                setSelectedOperator(op || null);
                setCustomerName(null);
              }}
              required
              disabled={isPurchasing}
            >
              <option value="">Choose Network</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]{11}"
              maxLength={11}
              required
              disabled={isPurchasing}
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-semibold mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              id="amount"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 1000"
              min="50"
              step="1"
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
            {isPurchasing ? <Spinner /> : 'Proceed to Purchase'}
          </button>
        </div>
      )}

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Airtime Purchase"
        footer={
          <>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowConfirmModal(false)}
              disabled={isPurchasing}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? <Spinner /> : `Confirm Purchase (₦${numericAmount.toLocaleString()})`}
            </button>
          </>
        }
      >
        <div className="text-gray-700">
          <p className="mb-2">
            You are about to purchase{' '}
            <span className="font-semibold text-blue-600">₦{numericAmount.toLocaleString()}</span> airtime for{' '}
            <span className="font-semibold text-blue-600">{phoneNumber}</span> ({selectedOperator?.name}).
          </p>
          {customerName && <p className="mb-2">Customer Name: <span className="font-semibold">{customerName}</span></p>}
          <p className="text-red-500 text-sm font-medium">Please confirm these details are correct.</p>
        </div>
      </Modal>
    </div>
  );
};

export default AirtimePage;
