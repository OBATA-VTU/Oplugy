import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import Modal from '../components/Modal';
import { CABLE_BILLERS } from '../constants';
import { TvIcon, ShieldCheckIcon } from '../components/Icons';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
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
  }, [selectedOperator, customerName, fetchPlans]);
  
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
      addNotification(response.message || 'Validation failed. Please check the IUC number.', 'error');
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
      plan_name: selectedPlan.name
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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Subscription"
        description={`You are about to pay ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Cable TV</h2>
        <p className="text-gray-500 font-medium text-lg">Renew your DStv, GOtv, and StarTimes subscriptions instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 space-y-10">
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">1. Select Provider</label>
                 <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                  value={selectedOperator?.id || ''} 
                  onChange={e => {
                    setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                    setCustomerName(null);
                    setCablePlans([]);
                  }}
                 >
                    <option value="">Choose Provider</option>
                    {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">2. IUC / Smartcard Number</label>
                 <div className="flex gap-3">
                    <input 
                      type="text" 
                      className="flex-1 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-xl tracking-tight outline-none focus:border-blue-600 transition-all text-center" 
                      placeholder="0000000000" 
                      value={smartcardNo} 
                      onChange={e => setSmartcardNo(e.target.value.replace(/\D/g, ''))} 
                    />
                    <button 
                      onClick={handleVerify}
                      disabled={isVerifying || smartcardNo.length < 5 || !selectedOperator}
                      className="px-8 bg-gray-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50"
                    >
                      {isVerifying ? <Spinner /> : 'Verify'}
                    </button>
                 </div>
              </div>
           </div>

           {customerName && (
              <div className="p-6 bg-blue-50 rounded-[2rem] border-2 border-dashed border-blue-100 flex items-center space-x-5 animate-in zoom-in-95 duration-300">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><TvIcon /></div>
                 <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Customer Name</p>
                    <p className="font-bold text-gray-900 text-xl uppercase tracking-tight leading-none">{customerName}</p>
                 </div>
              </div>
           )}

           <div className={`space-y-8 transition-opacity duration-500 ${customerName ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">3. Select Package</label>
                    <div className="relative">
                       <select 
                         className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50" 
                         value={selectedPlan?.id || ''} 
                         onChange={e => setSelectedPlan(cablePlans.find(p => String(p.id) === String(e.target.value)) || null)}
                         disabled={isFetchingPlans || cablePlans.length === 0}
                       >
                          <option value="">{isFetchingPlans ? 'Loading packages...' : 'Choose package'}</option>
                          {cablePlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} - ₦${plan.amount.toLocaleString()}`}</option>)}
                       </select>
                       {isFetchingPlans && <div className="absolute right-6 top-1/2 -translate-y-1/2 scale-75"><Spinner /></div>}
                    </div>
                 </div>
                 <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">4. Phone Number</label>
                    <input 
                      type="tel" 
                      className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl text-2xl font-bold tracking-tight outline-none focus:border-blue-600 transition-all text-center" 
                      placeholder="080..." 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                      maxLength={11}
                    />
                 </div>
              </div>
              
              <button 
                onClick={handlePrePurchase}
                className="w-full bg-blue-600 hover:bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all duration-300 uppercase tracking-widest text-sm transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
                disabled={!customerName || !selectedPlan || phoneNumber.length !== 11 || isPurchasing}
              >
                {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Renew Now</span></>}
              </button>
           </div>
        </div>
      </div>

      <div className="p-8 bg-blue-50 text-blue-900 rounded-[2.5rem] border border-blue-100 flex items-center space-x-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><TvIcon /></div>
        <p className="text-sm font-medium">Cable TV renewals are processed instantly. Your signal will be restored within minutes of payment.</p>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Order" footer={
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 rounded-xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="flex-[2] bg-blue-600 hover:bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[11px] flex items-center justify-center min-w-[150px] shadow-lg shadow-blue-100" onClick={startPinVerification} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Confirm & Pay`}
          </button>
        </div>
      }>
        <div className="text-center py-4 space-y-6">
           <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
              <TvIcon />
           </div>
           <div className="space-y-2">
              <p className="text-gray-500 font-medium text-lg">You are renewing <span className="text-gray-900 font-bold">{selectedPlan?.name}</span> for:</p>
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{customerName}</h3>
           </div>
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">IUC No: {smartcardNo}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Provider: {selectedOperator?.name}</p>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default CablePage;