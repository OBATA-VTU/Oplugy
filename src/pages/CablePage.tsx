import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import Modal from '../components/Modal';
import { CABLE_BILLERS } from '../constants';
import { TvIcon } from '../components/Icons';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [operators] = useState<Operator[]>(CABLE_BILLERS);
  const [cablePlans, setCablePlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [smartcardNo, setSmartcardNo] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<'RENEW' | 'CHANGE'>('RENEW');
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
    const response = await vtuService.getCablePlans(billerName, server);
    if (response.status && response.data) {
      setCablePlans(response.data);
    } else {
      addNotification(response.message || 'Error loading packages.', 'error');
    }
    setIsFetchingPlans(false);
  }, [addNotification, server]);

  useEffect(() => {
    if (selectedOperator && customerName) {
      fetchPlans(selectedOperator.id);
    }
  }, [server, selectedOperator, customerName, fetchPlans]);
  
  const handleVerify = async () => {
    if (!selectedOperator || !smartcardNo) return;
    setIsVerifying(true);
    setCustomerName(null);
    const response = await vtuService.verifyCableSmartcard({ 
      biller: selectedOperator.id, 
      smartCardNumber: smartcardNo,
      server 
    });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Smartcard verified.', 'success');
      fetchPlans(selectedOperator.id);
    } else {
      addNotification(response.message || 'Verification failed.', 'error');
    }
    setIsVerifying(false);
  };

  const handlePrePurchase = () => {
    if (!selectedPlan || !smartcardNo || !phoneNumber) return;
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
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
      subscriptionType: subscriptionType,
      phoneNumber: phoneNumber,
      amount: selectedPlan.amount,
      plan_name: selectedPlan.name,
      server
    });

    if (response.status && response.data) {
      addNotification(`Cable TV subscription active for ${smartcardNo}.`, 'success');
      setSmartcardNo('');
      setPhoneNumber('');
      setSelectedPlan(null);
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Subscription failed.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Payment"
        description={`Paying for ${selectedPlan?.name} on ${selectedOperator?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Renew TV Subscription</h2>
        <p className="text-gray-400 font-medium">Pay for DStv, GOtv, and Startimes, sharp sharp.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] shadow-xl border border-gray-50">
        <div className="space-y-8">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Fulfillment Hub</label>
              <select 
                value={server} 
                onChange={(e) => {
                  setServer(e.target.value as any);
                  setCustomerName(null);
                  setCablePlans([]);
                }}
                className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-black text-lg outline-none transition-all appearance-none"
              >
                 <option value="server1">Terminal 1 (Inlomax)</option>
                 <option value="server2">Terminal 2 (CIP)</option>
              </select>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Select TV</label>
                 <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                  value={selectedOperator?.id || ''} 
                  onChange={e => {
                    setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                    setCustomerName(null);
                    setCablePlans([]);
                  }}
                 >
                    <option value="">Select Provider</option>
                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Smartcard / IUC Number</label>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="flex-1 p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl tracking-tight outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                      placeholder="Enter number" 
                      value={smartcardNo} 
                      onChange={e => setSmartcardNo(e.target.value)} 
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || smartcardNo.length < 5 || !selectedOperator}
                      className="px-6 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                    >
                      {isVerifying ? <Spinner /> : 'Check'}
                    </button>
                 </div>
              </div>
           </div>

           {customerName && (
              <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 flex items-center space-x-5 animate-in zoom-in-95 duration-300">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200"><TvIcon /></div>
                 <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Subscriber Name</p>
                    <p className="font-black text-gray-900 text-lg uppercase tracking-tight">{customerName}</p>
                 </div>
              </div>
           )}

           <div className={`space-y-8 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Renewal Plan</label>
                    <select 
                      className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                      value={selectedPlan?.id || ''} 
                      onChange={e => setSelectedPlan(cablePlans.find(p => String(p.id) === String(e.target.value)) || null)}
                      disabled={isFetchingPlans || cablePlans.length === 0}
                    >
                       <option value="">{isFetchingPlans ? 'Loading...' : 'Select Plan'}</option>
                       {cablePlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} - ₦${plan.amount.toLocaleString()}`}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Alert Phone</label>
                    <input 
                      type="tel" 
                      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-xl font-black tracking-tight outline-none focus:ring-4 focus:ring-blue-50 transition-all" 
                      placeholder="080..." 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                      maxLength={11}
                    />
                 </div>
              </div>

              <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button onClick={() => setSubscriptionType('RENEW')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subscriptionType === 'RENEW' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Renew Current</button>
                <button onClick={() => setSubscriptionType('CHANGE')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subscriptionType === 'CHANGE' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Change Package</button>
              </div>
              
              <button 
                onClick={handlePrePurchase}
                className="w-full bg-blue-600 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all duration-300 uppercase tracking-[0.2em] text-sm"
                disabled={!customerName || !selectedPlan || phoneNumber.length !== 11 || isPurchasing}
              >
                {isPurchasing ? <Spinner /> : 'Pay Now'}
              </button>
           </div>
        </div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Payment" footer={
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="flex-2 bg-blue-600 hover:bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px]" onClick={startPinVerification} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Confirm`}
          </button>
        </div>
      }>
        <div className="text-center py-6 space-y-4">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <TvIcon />
           </div>
           <p className="text-gray-500 font-medium">You are renewing <span className="text-gray-900 font-black tracking-tight">{selectedPlan?.name}</span> for:</p>
           <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{customerName}</h3>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Card No: {smartcardNo}</p>
        </div>
      </Modal>
    </div>
  );
};

export default CablePage;