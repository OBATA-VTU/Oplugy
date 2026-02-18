
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';

// Local cache for operators to prevent re-fetching on every mount
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
      addNotification('Account identity confirmed.', 'success');
    } else {
      addNotification(response.message || 'Verification rejected by node.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePurchase = async () => {
    if (!customerName || !numericAmount || !phoneNumber || isPurchasing) return;
    if (walletBalance !== null && numericAmount > walletBalance) {
      addNotification('Insufficient wallet liquidity.', 'error');
      return;
    }
    setIsPurchasing(true);
    const response = await vtuService.purchaseElectricity({
      provider_id: selectedOperator!.id,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: numericAmount,
      phone: phoneNumber,
      provider_name: selectedOperator!.name,
    });
    if (response.status && response.data) {
      addNotification(`Fulfillment success. Token: ${response.data.token || 'Pending'}.`, 'success');
      setMeterNumber('');
      setAmount('');
      setPhoneNumber('');
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Node connection error.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Power Hub</h2>
        <p className="text-gray-400 font-medium">Verified utility fulfillment terminal.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50">
        {isFetchingOperators ? <div className="py-20 flex flex-col items-center"><Spinner /><p className="mt-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Syncing with DISCO Nodes...</p></div> : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Utility Provider</label>
                <select className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none" value={selectedOperator?.id || ''} onChange={e => setSelectedOperator(operators.find(o => o.id === e.target.value) || null)}>
                  <option value="">Choose Provider</option>
                  {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Account Type</label>
                <select className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none" value={meterType} onChange={e => setMeterType(e.target.value as any)}>
                  <option value="prepaid">Prepaid Meter</option>
                  <option value="postpaid">Postpaid Account</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="meterNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Meter/Account ID</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" id="meterNumber" className="flex-1 p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl outline-none" placeholder="Enter meter number" value={meterNumber} onChange={e => setMeterNumber(e.target.value)} />
                <button onClick={handleVerify} className="px-10 py-5 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center min-w-[150px]" disabled={isVerifying || !selectedOperator || meterNumber.length < 6}>
                  {isVerifying ? <Spinner /> : 'Identify Account'}
                </button>
              </div>
            </div>

            {customerName && (
              <div className="bg-green-50 text-green-700 p-8 rounded-[2rem] border border-green-100 text-center animate-in zoom-in-95">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Verified Identity</p>
                <p className="text-2xl font-black tracking-tight">{customerName}</p>
              </div>
            )}

            <div className={`space-y-6 transition-opacity ${!customerName ? 'opacity-30 pointer-events-none' : ''}`}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="amount" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Amount (₦)</label>
                    <input type="number" id="amount" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl outline-none" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} disabled={!customerName} />
                  </div>
                  <div>
                    <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Alert Phone</label>
                    <input type="tel" id="phoneNumber" className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl outline-none" placeholder="08012345678" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} disabled={!customerName} />
                  </div>
               </div>
            </div>

            <button onClick={handlePurchase} className="w-full bg-blue-600 hover:bg-black text-white font-black py-6 rounded-3xl shadow-2xl transition-all uppercase tracking-widest text-[11px] disabled:opacity-50" disabled={!customerName || !numericAmount || phoneNumber.length !== 11 || isPurchasing}>
              {isPurchasing ? <Spinner /> : 'Execute Renewal'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsPage;
