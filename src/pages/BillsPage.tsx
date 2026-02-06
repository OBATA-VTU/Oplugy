import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ name: string; address: string } | null>(null);
  const [electricityToken, setElectricityToken] = useState<string | null>(null);

  const numericAmount = parseFloat(amount);

  const fetchOperators = useCallback(async () => {
    setIsFetchingOperators(true);
    try {
      const response = await vtuService.getElectricityOperators();
      if (response.status && response.data) {
        setOperators(response.data);
      } else {
        addNotification(response.message || 'Failed to fetch electricity operators.', 'error');
        console.error("Fetch Electricity Operators Error:", response);
      }
    } catch (error: any) {
      addNotification(error.message || 'Error fetching operators.', 'error');
      console.error("Fetch Electricity Operators Exception:", error);
    } finally {
      setIsFetchingOperators(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleVerifyMeter = async () => {
    if (!selectedOperator || !meterNumber || isVerifying) return;
    setIsVerifying(true);
    setCustomerInfo(null);
    setElectricityToken(null);

    if (meterNumber.length < 6) {
      addNotification('Please enter a valid meter number.', 'warning');
      setIsVerifying(false);
      return;
    }

    const payload = {
      meter_number: meterNumber,
      provider_id: selectedOperator.id,
      meter_type: meterType,
    };

    try {
      const response = await vtuService.verifyElectricityMeter(payload);
      if (response.status && response.data?.status) {
        setCustomerInfo({
          name: response.data.customerName || 'N/A',
          address: response.data.customerAddress || 'N/A',
        });
        setShowConfirmModal(true);
        addNotification('Meter verified successfully.', 'success');
      } else {
        const errorMessage = response.data?.message || 'Failed to verify meter number.';
        addNotification(errorMessage, 'error');
        console.error("Meter Verification API Error:", { message: errorMessage, response, payload });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error verifying meter number.', 'error');
      console.error("Meter Verification Exception:", { error, payload });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !meterNumber || !numericAmount || !phoneNumber || isPurchasing) return;

    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      setShowConfirmModal(false);
      return;
    }

    setIsPurchasing(true);
    setShowConfirmModal(false);

    const payload = {
      meter_number: meterNumber,
      provider_id: selectedOperator.id,
      amount: numericAmount,
      meter_type: meterType,
      phone: phoneNumber,
    };

    try {
      const response = await vtuService.purchaseElectricity(payload);

      if (response.status && response.data) {
        setElectricityToken(response.data.token || null);
        addNotification(`Electricity bill payment successful! Ref: ${response.data.reference}.`, 'success');
        setMeterNumber('');
        setAmount('');
        setPhoneNumber('');
        setSelectedOperator(null);
        setCustomerInfo(null);
        await fetchWalletBalance();
      } else {
        const errorMessage = response.message || 'Electricity bill payment failed.';
        addNotification(errorMessage, 'error');
        console.error("Electricity Purchase API Error:", { message: errorMessage, errors: response.errors, payload });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error during electricity bill payment.', 'error');
      console.error("Electricity Purchase Exception:", { error, payload });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFormValid = selectedOperator && meterNumber.length >= 6 && numericAmount > 0 && phoneNumber.length === 11;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Pay Electricity Bills</h2>

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
                setCustomerInfo(null);
                setElectricityToken(null);
              }}
              required
              disabled={isPurchasing || isVerifying}
            >
              <option value="">Choose Electricity Provider</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="meterNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              Meter Number
            </label>
            <input
              type="text"
              id="meterNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 1234567890"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              required
              disabled={isPurchasing || isVerifying}
            />
          </div>

          <div>
            <label htmlFor="meterType" className="block text-gray-700 text-sm font-semibold mb-2">
              Meter Type
            </label>
            <select
              id="meterType"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={meterType}
              onChange={(e) => setMeterType(e.target.value as 'prepaid' | 'postpaid')}
              required
              disabled={isPurchasing || isVerifying}
            >
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-semibold mb-2">
              Amount (₦)
            </label>
            <input
              type="number"
              id="amount"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 5000"
              min="100"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isPurchasing || isVerifying}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number for Token
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
              disabled={isPurchasing || isVerifying}
            />
          </div>

          <button
            onClick={handleVerifyMeter}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isVerifying || isPurchasing}
          >
            {isVerifying ? <Spinner /> : 'Verify Meter & Proceed'}
          </button>

          {electricityToken && (
            <div className="bg-blue-50 p-4 rounded-md text-blue-800 text-center font-medium">
              Electricity Token: <span className="font-bold">{electricityToken}</span>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Electricity Payment"
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
              {isPurchasing ? <Spinner /> : `Confirm Payment (₦${numericAmount.toLocaleString()})`}
            </button>
          </>
        }
      >
        <div className="text-gray-700">
          <p className="mb-2">
            You are about to pay{' '}
            <span className="font-semibold text-blue-600">₦{numericAmount.toLocaleString()}</span> for{' '}
            <span className="font-semibold text-blue-600">{meterType}</span> meter number{' '}
            <span className="font-semibold text-blue-600">{meterNumber}</span> ({selectedOperator?.name}).
          </p>
          {customerInfo && (
            <>
              <p className="mb-1">Customer Name: <span className="font-semibold">{customerInfo.name}</span></p>
              <p className="mb-2">Customer Address: <span className="font-semibold">{customerInfo.address}</span></p>
            </>
          )}
          <p className="mb-2">A token will be sent to: <span className="font-semibold">{phoneNumber}</span></p>
          <p className="text-red-500 text-sm font-medium">Please confirm these details are correct.</p>
        </div>
      </Modal>
    </div>
  );
};

export default BillsPage;
