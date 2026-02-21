import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { BoltIcon, ShieldCheckIcon } from '../components/Icons';

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [meterNumber, setMeterNumber] = useState('');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const numericAmount = parseFloat(amount);

  const fetchOperators = useCallback(async () => {
    setOperators([]);
    setSelectedOperator(null);
    setCustomerName(null);
    const response = await vtuService.getElectricityOperators();
    if (response.status && response.data) {
      setOperators(response.data);
    }
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
      addNotification('Meter verified successfully.', 'success');
    } else {
      addNotification(response.message || 'Verification failed. Please check the meter number.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePrePurchase = () => {
    if (!customerName || !numericAmount || !phoneNumber) return;
    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Wallet balance insufficient.', 'error');
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
      provider_name: selectedOperator!.name
    });

    if (response.status && response.data) {
      addNotification(`Bill paid! Token: ${response.data.token || 'Successful'}.`, 'success');
      setMeterNumber('');
      setAmount('');
      setPhoneNumber('');
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Fulfillment node error.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Payment"
        description={`You are about to pay ₦${numericAmount.toLocaleString()} for electricity.`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Pay Electricity</h2>
        <p className="text-gray-500 font-medium text-lg">Pay your electricity bills and get tokens instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 space-y-10">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">1. Select Provider</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedOperator?.id || ''} 
                onChange={(e) => {
                  setSelectedOperator(operators.find(o => String(o.id) === String(e.target.value)) || null);
                  setCustomerName(null);
                }}
              >
                <option value="">Choose Disco</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">2. Meter Type</label>
              <div className="flex p-1.5 bg-gray-50 rounded-2xl border-2 border-transparent">
                <button onClick={() => { setMeterType('prepaid'); setCustomerName(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${meterType === 'prepaid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Prepaid</button>
                <button onClick={() => { setMeterType('postpaid'); setCustomerName(null); }} className={`flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${meterType === 'postpaid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>Postpaid</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">3. Meter Number</label>
            <div className="flex gap-3">
              <input 
                type="text" 
                className="flex-1 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-xl tracking-tight outline-none focus:border-blue-600 transition-all text-center" 
                placeholder="00000000000" 
                value={meterNumber} 
                onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))} 
              />
              <button 
                onClick={handleVerify}
                disabled={isVerifying || meterNumber.length < 5 || !selectedOperator}
                className="px-8 bg-gray-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
              >
                {isVerifying ? <Spinner /> : 'Verify'}
              </button>
            </div>
          </div>

          {customerName && (
            <div className="p-6 bg-green-50 rounded-[2rem] border-2 border-dashed border-green-200 flex items-center space-x-5 animate-in zoom-in-95 duration-300">
               <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><BoltIcon /></div>
               <div>
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Customer Name</p>
                  <p className="font-bold text-gray-900 text-xl uppercase tracking-tight leading-none">{customerName}</p>
               </div>
            </div>
          )}

          <div className={`space-y-8 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">4. Amount (₦)</label>
                   <input 
                    type="number" 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-bold tracking-tight outline-none focus:border-blue-600 transition-all text-center" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                   />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">5. Phone Number</label>
                   <input 
                    type="tel" 
                    className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-bold tracking-tight outline-none focus:border-blue-600 transition-all text-center" 
                    placeholder="080..." 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                    maxLength={11}
                   />
                </div>
             </div>
             
             <button 
              onClick={handlePrePurchase}
              className="w-full bg-blue-600 hover:bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all duration-300 uppercase tracking-widest text-sm transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
              disabled={!customerName || !amount || phoneNumber.length !== 11 || isPurchasing}
             >
                {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Pay Now</span></>}
             </button>
          </div>
        </div>
      </div>

      <div className="p-8 bg-blue-50 text-blue-900 rounded-[2.5rem] border border-blue-100 flex items-center space-x-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><BoltIcon /></div>
        <p className="text-sm font-medium">Electricity tokens are generated instantly after payment. You will also receive a copy via SMS.</p>
      </div>
    </div>
  );
};

export default BillsPage;
