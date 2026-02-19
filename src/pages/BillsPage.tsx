import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { BoltIcon } from '../components/Icons';

let operatorsCache: Operator[] = [];

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>(operatorsCache);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(operatorsCache.length === 0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const numericAmount = parseFloat(amount);

  const fetchOperators = useCallback(async () => {
    if (operatorsCache.length > 0) return;
    setIsFetchingOperators(true);
    const response = await vtuService.getElectricityOperators();
    if (response.status && response.data) {
      operatorsCache = response.data;
      setOperators(response.data);
    }
    setIsFetchingOperators(false);
  }, []);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleVerify = async () => {
    if (!selectedOperator || !meterNumber) return;
    setIsVerifying(true);
    setCustomerName(null);
    const response = await vtuService.verifyElectricityMeter({
      provider_id: selectedOperator.id,
      meter_number: meterNumber,
      meter_type: meterType,
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Account verified successfully.', 'success');
    } else {
      addNotification(response.message || 'Verification failed. Check your meter number.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePrePurchase = () => {
    if (!customerName || !numericAmount || !phoneNumber) return;
    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      return;
    }
    setShowPinModal(true);
  };

  const handlePurchase = async () => {
    if (!customerName || !numericAmount || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);

    const response = await vtuService.purchaseElectricity({
      provider_id: selectedOperator!.id,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: numericAmount,
      phone: phoneNumber,
      provider_name: selectedOperator!.name,
    });

    if (response.status && response.data) {
      addNotification(`Success! Token: ${response.data.token || 'Successful'}.`, 'success');
      setMeterNumber('');
      setAmount('');
      setPhoneNumber('');
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Payment failed. Please try again.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authorize Payment"
        description={`Paying ₦${numericAmount.toLocaleString()} for Electricity Bill`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Pay Bills</h2>
        <p className="text-gray-400 font-medium">Pay your electricity bills across all DISCOs instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] shadow-xl border border-gray-50">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Service Provider</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedOperator?.id || ''} 
                onChange={(e) => {
                  setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                  setCustomerName(null);
                }}
              >
                <option value="">Select Provider</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Meter Type</label>
              <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button onClick={() => setMeterType('prepaid')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${meterType === 'prepaid' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Prepaid</button>
                <button onClick={() => setMeterType('postpaid')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${meterType === 'postpaid' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Postpaid</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Meter Number</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                className="flex-1 p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl tracking-tight outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                placeholder="Enter meter number" 
                value={meterNumber} 
                onChange={(e) => setMeterNumber(e.target.value)} 
              />
              <button 
                onClick={handleVerify}
                disabled={isVerifying || meterNumber.length < 5 || !selectedOperator}
                className="px-8 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
              >
                {isVerifying ? <Spinner /> : 'Verify'}
              </button>
            </div>
          </div>

          {customerName && (
            <div className="p-6 bg-green-50 rounded-3xl border-2 border-green-100 flex items-center space-x-5 animate-in zoom-in-95 duration-300">
               <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0"><BoltIcon /></div>
               <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Customer Name</p>
                  <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{customerName}</p>
               </div>
            </div>
          )}

          <div className={`space-y-8 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Amount (₦)</label>
                   <input 
                    type="number" 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-black tracking-tight outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Alert Phone</label>
                   <input 
                    type="tel" 
                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-black tracking-tight outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                    placeholder="080..." 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    maxLength={11}
                   />
                </div>
             </div>
             
             <button 
              onClick={handlePrePurchase}
              className="w-full bg-blue-600 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all duration-300 uppercase tracking-[0.2em] text-sm"
              disabled={!customerName || !amount || !phoneNumber || isPurchasing}
             >
                {isPurchasing ? <Spinner /> : 'Pay Now'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;