
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import Modal from '../components/Modal';
import { CABLE_BILLERS } from '../constants';
import { TvIcon, ShieldCheckIcon, SignalIcon } from '../components/Icons';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [operators] = useState<Operator[]>(CABLE_BILLERS);
  const [cablePlans, setCablePlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [smartcardNo, setSmartcardNo] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const fetchPlans = useCallback(async (billerName: string) => {
    setIsFetchingPlans(true);
    setCablePlans([]);
    setSelectedPlan(null);
    const response = await vtuService.getCablePlans(billerName);
    if (response.status && response.data) {
      setCablePlans(response.data);
    } else {
      addNotification(response.message || 'Node sync failed.', 'error');
    }
    setIsFetchingPlans(false);
  }, [addNotification]);

  useEffect(() => {
    if (selectedOperator && customerName) {
      fetchPlans(selectedOperator.id);
    }
  }, [selectedOperator, customerName, fetchPlans, server]);
  
  const handleVerify = async () => {
    if (!selectedOperator || !smartcardNo) return;
    setIsVerifying(true);
    setCustomerName(null);
    const response = await vtuService.verifyCableSmartcard({ 
      biller: selectedOperator.id, 
      smartCardNumber: smartcardNo,
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Decoder verified successfully.', 'success');
      fetchPlans(selectedOperator.id);
    } else {
      addNotification(response.message || 'Validation failed. Terminal check error.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePrePurchase = () => {
    if (!selectedPlan || !smartcardNo || !phoneNumber) return;
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Wallet liquidity insufficient.', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const startPinVerification = () => {
    setShowConfirmModal(false);
    setShowPinModal(true);
  };
  
  const handlePurchase = async () => {
    if (!selectedPlan || !smartcardNo || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);

    const response = await vtuService.purchaseCable({
      biller: selectedOperator!.id,
      smartCardNumber: smartcardNo,
      planCode: selectedPlan.id,
      amount: selectedPlan.amount,
      plan_name: selectedPlan.name,
      server
    });

    if (response.status && response.data) {
      addNotification(`${selectedOperator?.name} active for ${smartcardNo}.`, 'success');
      setSmartcardNo('');
      setPhoneNumber('');
      setSelectedPlan(null);
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Fulfillment error.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Approve TV Bundle"
        description={`Authorizing ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Cable TV Hub</h2>
        <p className="text-gray-400 font-medium text-lg">Express renewals for DStv, GOtv, and Startimes.</p>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 space-y-12">
        <div className="space-y-10">
           {/* Server Selection */}
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">1. Choice Fulfillment Node</label>
              <div className="grid grid-cols-2 gap-4">
                 <button 
                   onClick={() => { setServer('server1'); setCustomerName(null); }}
                   className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server1' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                 >
                   <span className={`font-black text-lg ${server === 'server1' ? 'text-blue-600' : 'text-gray-400'}`}>Node 1</span>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Core Network</span>
                 </button>
                 <button 
                   onClick={() => { setServer('server2'); setCustomerName(null); }}
                   className={`p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server2' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                 >
                   <span className={`font-black text-lg ${server === 'server2' ? 'text-blue-600' : 'text-gray-400'}`}>Node 2</span>
                   <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Secondary Terminal</span>
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">2. Service Carrier</label>
                 <select 
                  className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                  value={selectedOperator?.id || ''} 
                  onChange={e => {
                    setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                    setCustomerName(null);
                    setCablePlans([]);
                  }}
                 >
                    <option value="">Select Carrier</option>
                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">3. Decoder No / IUC</label>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="flex-1 p-6 bg-gray-50 border-4 border-gray-100 rounded-[2.5rem] font-black text-2xl tracking-tighter outline-none focus:border-blue-600 transition-all text-center" 
                      placeholder="0000000000" 
                      value={smartcardNo} 
                      onChange={e => setSmartcardNo(e.target.value.replace(/\D/g, ''))} 
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || smartcardNo.length < 5 || !selectedOperator}
                      className="px-10 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isVerifying ? <Spinner /> : 'Validate'}
                    </button>
                 </div>
              </div>
           </div>

           {customerName && (
              <div className="p-8 bg-blue-50 rounded-[3rem] border-2 border-dashed border-blue-100 flex items-center space-x-6 animate-in zoom-in-95 duration-300">
                 <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-100"><TvIcon /></div>
                 <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Subscriber Identity</p>
                    <p className="font-black text-gray-900 text-2xl uppercase tracking-tight leading-none">{customerName}</p>
                 </div>
              </div>
           )}

           <div className={`space-y-10 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">4. Bouquet Selection</label>
                    <div className="relative">
                       <select 
                         className="w-full p-6 bg-gray-50 rounded-[2rem] font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50" 
                         value={selectedPlan?.id || ''} 
                         onChange={e => setSelectedPlan(cablePlans.find(p => String(p.id) === String(e.target.value)) || null)}
                         disabled={isFetchingPlans || cablePlans.length === 0}
                       >
                          <option value="">{isFetchingPlans ? 'Syncing Node...' : 'Select Plan'}</option>
                          {cablePlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} - ₦${plan.amount.toLocaleString()}`}</option>)}
                       </select>
                       {isFetchingPlans && <div className="absolute right-6 top-1/2 -translate-y-1/2 scale-75"><Spinner /></div>}
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-4">5. Delivery Mobile</label>
                    <input 
                      type="tel" 
                      className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-[2rem] text-3xl font-black tracking-tighter outline-none focus:border-blue-600 transition-all text-center" 
                      placeholder="080..." 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                      maxLength={11}
                    />
                 </div>
              </div>
              
              <button 
                onClick={handlePrePurchase}
                className="w-full bg-blue-600 hover:bg-black text-white font-black py-10 rounded-[3rem] shadow-2xl shadow-blue-200 transition-all duration-300 uppercase tracking-[0.4em] text-sm transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
                disabled={!customerName || !selectedPlan || phoneNumber.length !== 11 || isPurchasing}
              >
                {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Execute Renewal</span></>}
              </button>
           </div>
        </div>
      </div>

      <div className="p-10 bg-gray-900 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40"><SignalIcon /></div>
            <div>
               <h4 className="text-2xl font-black tracking-tight">Zero Latency Sync</h4>
               <p className="text-white/40 text-sm font-medium">Subscription updates are sent instantly to Multichoice/StarTimes nodes for rapid signal restoration.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Secure Checkout" footer={
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="flex-[2] bg-blue-600 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] flex items-center justify-center min-w-[150px] shadow-xl shadow-blue-500/20" onClick={startPinVerification} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Approve Payment`}
          </button>
        </div>
      }>
        <div className="text-center py-6 space-y-6">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
              <TvIcon />
           </div>
           <div className="space-y-2">
              <p className="text-gray-400 font-medium text-lg leading-tight">Authorizing <span className="text-gray-900 font-black tracking-tight">{selectedPlan?.name}</span> for:</p>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{customerName}</h3>
           </div>
           <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">IUC No: {smartcardNo}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Carrier: {selectedOperator?.name} ({server === 'server1' ? 'Node 1' : 'Node 2'})</p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default CablePage;
