
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { BoltIcon, ShieldCheckIcon, SignalIcon } from '../components/Icons';

const BillsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
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
  }, [fetchOperators, server]);

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
      addNotification(response.message || 'Verification failed. Terminal check error.', 'error');
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
      provider_name: selectedOperator!.name,
      server
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
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Approve Utility Bill"
        description={`Authorizing ₦${numericAmount.toLocaleString()} for Electricity Token`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Electricity</h2>
        <p className="text-gray-400 font-medium text-lg">Instant token generation across all Nigerian Discos.</p>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 space-y-12">
        <div className="space-y-10">
          {/* Server Selection */}
          <div>
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">1. Network Gateway</label>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => { setServer('server1'); setCustomerName(null); }}
                  className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server1' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                >
                  <span className={`font-black text-lg ${server === 'server1' ? 'text-blue-600' : 'text-gray-400'}`}>Node 1</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Main API</span>
                </button>
                <button 
                  onClick={() => { setServer('server2'); setCustomerName(null); }}
                  className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server2' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                >
                  <span className={`font-black text-lg ${server === 'server2' ? 'text-blue-600' : 'text-gray-400'}`}>Node 2</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Backup Core</span>
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">2. Distribution Company</label>
              <select 
                className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedOperator?.id || ''} 
                onChange={(e) => {
                  setSelectedOperator(operators.find(o => String(o.id) === String(e.target.value)) || null);
                  setCustomerName(null);
                }}
              >
                <option value="">Select Disco</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">3. Meter Type</label>
              <div className="flex p-2 bg-gray-50 rounded-[2rem] border-4 border-transparent">
                <button onClick={() => { setMeterType('prepaid'); setCustomerName(null); }} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${meterType === 'prepaid' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}>Prepaid</button>
                <button onClick={() => { setMeterType('postpaid'); setCustomerName(null); }} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${meterType === 'postpaid' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}>Postpaid</button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">4. Meter Identification</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                className="flex-1 p-6 bg-gray-50 border-4 border-gray-100 rounded-[2.5rem] font-black text-2xl tracking-tighter outline-none focus:border-blue-600 transition-all text-center" 
                placeholder="00000000000" 
                value={meterNumber} 
                onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))} 
              />
              <button 
                onClick={handleVerify}
                disabled={isVerifying || meterNumber.length < 5 || !selectedOperator}
                className="px-10 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
              >
                {isVerifying ? <Spinner /> : 'Verify'}
              </button>
            </div>
          </div>

          {customerName && (
            <div className="p-8 bg-green-50 rounded-[3rem] border-2 border-dashed border-green-200 flex items-center space-x-6 animate-in zoom-in-95 duration-300">
               <div className="w-16 h-16 bg-green-600 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-green-100"><BoltIcon /></div>
               <div>
                  <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Authenticated Holder</p>
                  <p className="font-black text-gray-900 text-2xl uppercase tracking-tight leading-none">{customerName}</p>
               </div>
            </div>
          )}

          <div className={`space-y-10 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">5. Value (₦)</label>
                   <input 
                    type="number" 
                    className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-[2rem] text-3xl font-black tracking-tighter outline-none focus:border-blue-600 transition-all text-center" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">6. Alert Phone</label>
                   <input 
                    type="tel" 
                    className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-[2rem] text-3xl font-black tracking-tighter outline-none focus:border-blue-600 transition-all text-center" 
                    placeholder="080..." 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                    maxLength={11}
                   />
                </div>
             </div>
             
             <button 
              onClick={handlePrePurchase}
              className="w-full bg-blue-600 hover:bg-black text-white font-black py-10 rounded-[3rem] shadow-2xl shadow-blue-200 transition-all duration-300 uppercase tracking-[0.4em] text-sm transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
              disabled={!customerName || !amount || phoneNumber.length !== 11 || isPurchasing}
             >
                {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Confirm & Generate Token</span></>}
             </button>
          </div>
        </div>
      </div>

      <div className="p-10 bg-gray-900 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40"><SignalIcon /></div>
            <div>
               <h4 className="text-2xl font-black tracking-tight">Real-time Validation</h4>
               <p className="text-white/40 text-sm font-medium">Meter numbers are validated directly against Disco databases for guaranteed token delivery.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default BillsPage;
