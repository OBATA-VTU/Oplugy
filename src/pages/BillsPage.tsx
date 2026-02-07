
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const numericAmount = parseFloat(amount);

  const fetchOperators = useCallback(async () => {
    setIsFetchingOperators(true);
    const response = await vtuService.getElectricityOperators();
    if (response.status && response.data) setOperators(response.data);
    else addNotification(response.message || 'Failed to fetch operators.', 'error');
    setIsFetchingOperators(false);
  }, [addNotification]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleVerify = async () => {
    if (!selectedOperator || !meterNumber) {
      addNotification('Please select an operator and enter a meter number.', 'warning');
      return;
    }
    setIsVerifying(true);
    setCustomerName(null);
    const response = await vtuService.verifyElectricityMeter({
      provider_id: selectedOperator.id,
      meter_number: meterNumber,
      meter_type: meterType,
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Meter verified successfully.', 'success');
    } else {
      addNotification(response.message || 'Meter verification failed.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePurchase = async () => {
    if (!customerName || !numericAmount || !phoneNumber || isPurchasing) return;
    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      return;
    }
    setIsPurchasing(true);
    const response = await vtuService.purchaseElectricity({
      provider_id: selectedOperator!.id,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: numericAmount,
      phone: phoneNumber,
    });
    if (response.status && response.data) {
      addNotification(`Payment of ₦${numericAmount} for ${meterNumber} was successful. Token: ${response.data.token || 'N/A'}.`, 'success');
      setMeterNumber('');
      setAmount('');
      setPhoneNumber('');
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Payment failed.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Pay Electricity Bills</h2>
      {isFetchingOperators ? <Spinner /> : (
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Provider</label>
            <select className="w-full p-3 border rounded-md" value={selectedOperator?.id || ''} onChange={e => setSelectedOperator(operators.find(o => o.id === e.target.value) || null)}>
              <option value="">Select Provider</option>
              {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Meter Type</label>
            <select className="w-full p-3 border rounded-md" value={meterType} onChange={e => setMeterType(e.target.value as any)}>
              <option value="prepaid">Prepaid</option>
              <option value="postpaid">Postpaid</option>
            </select>
          </div>
          <div>
            <label htmlFor="meterNumber" className="block text-gray-700 text-sm font-semibold mb-2">Meter Number</label>
            <div className="flex">
              <input type="text" id="meterNumber" className="w-full p-3 border rounded-l-md" placeholder="Enter meter number" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} />
              <button onClick={handleVerify} className="bg-gray-200 text-gray-800 font-bold p-3 rounded-r-md" disabled={isVerifying || !selectedOperator || meterNumber.length < 6}>{isVerifying ? <Spinner /> : 'Verify'}</button>
            </div>
          </div>
          {customerName && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md text-center">
              Verified: <span className="font-bold">{customerName}</span>
            </div>
          )}
          <div className={!customerName ? 'opacity-50' : ''}>
            <label htmlFor="amount" className="block text-gray-700 text-sm font-semibold mb-2">Amount (₦)</label>
            <input type="number" id="amount" className="w-full p-3 border rounded-md" placeholder="e.g., 5000" value={amount} onChange={e => setAmount(e.target.value)} disabled={!customerName} />
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2 mt-4">Phone Number (for token)</label>
            <input type="tel" id="phoneNumber" className="w-full p-3 border rounded-md" placeholder="08012345678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} disabled={!customerName} />
          </div>
          <button onClick={handlePurchase} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md" disabled={!customerName || !numericAmount || phoneNumber.length !== 11 || isPurchasing}>
            {isPurchasing ? <Spinner /> : 'Pay Bill'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BillsPage;
