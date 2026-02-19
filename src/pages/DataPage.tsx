import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
import { SignalIcon } from '../components/Icons';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [operators] = useState<Operator[]>(DATA_NETWORKS);
  const [dataTypes, setDataTypes] = useState<{id: string, name: string}[]>(DATA_PLAN_TYPES);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Fetch real categories from Server 1
  useEffect(() => {
    const loadTypes = async () => {
      if (server === 'server1' && selectedOperator) {
        setIsFetchingTypes(true);
        setSelectedDataType('');
        setDataPlans([]);
        const res = await vtuService.getDataCategories(selectedOperator.id, 'server1');
        if (res.status && res.data) {
          setDataTypes(res.data.map(t => ({ id: t, name: t })));
        } else {
          // If Server 1 fetch fails, fallback to defaults or show error
          setDataTypes(DATA_PLAN_TYPES);
          addNotification('Using default categories. Server 1 might be offline.', 'info');
        }
        setIsFetchingTypes(false);
      } else {
        setDataTypes(DATA_PLAN_TYPES);
      }
    };
    loadTypes();
  }, [server, selectedOperator, addNotification]);

  const fetchPlans = useCallback(async (network: string, type: string, targetServer: 'server1' | 'server2') => {
    setIsFetchingPlans(true);
    setDataPlans([]);
    setSelectedPlan(null);
    const response = await vtuService.getDataPlans({ network, type, server: targetServer });
    if (response.status && response.data) {
      setDataPlans(response.data);
    } else {
      addNotification(response.message || 'Error loading bundles.', 'error');
    }
    setIsFetchingPlans(false);
  }, [addNotification]);

  useEffect(() => {
    if (selectedOperator && selectedDataType) {
      fetchPlans(selectedOperator.id, selectedDataType, server);
    }
  }, [selectedOperator, selectedDataType, server, fetchPlans]);

  const handlePrePurchaseCheck = () => {
    if (!selectedPlan || !phoneNumber) return;
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
    if (!selectedPlan || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);
    
    const response = await vtuService.purchaseData({ 
      phone_number: phoneNumber, 
      plan_id: selectedPlan.id,
      amount: selectedPlan.amount,
      network: selectedOperator!.id,
      plan_name: selectedPlan.name,
      server: server
    });

    if (response.status && response.data) {
      addNotification(`Success! ${selectedPlan.name} sent to ${phoneNumber}.`, 'success');
      setPhoneNumber('');
      setSelectedPlan(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Purchase failed. Try switching servers.', 'error');
    }
    setIsPurchasing(false);
  };
  
  const isFormValid = selectedOperator && selectedDataType && selectedPlan && phoneNumber.length === 11;

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`Authorizing ₦${selectedPlan?.amount?.toLocaleString()} for ${phoneNumber}`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Buy Data Plans</h2>
        <p className="text-gray-400 font-medium">Choose your network and preferred data bundle.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-gray-50">
        <div className="space-y-10">
          <div>
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Provider Route</label>
             <div className="flex p-2 bg-gray-100 rounded-3xl gap-2">
                <button 
                  onClick={() => setServer('server1')}
                  className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${server === 'server1' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   Main Route
                </button>
                <button 
                  onClick={() => setServer('server2')}
                  className={`flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${server === 'server2' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                   Backup Route
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Select Network</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedOperator?.id || ''} 
                onChange={(e) => {
                  setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                  setSelectedDataType('');
                  setDataPlans([]);
                }}
              >
                <option value="">Select Network</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Plan Type</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50" 
                value={selectedDataType} 
                onChange={(e) => setSelectedDataType(e.target.value)} 
                disabled={!selectedOperator || isFetchingTypes}
              >
                <option value="">{isFetchingTypes ? 'Fetching...' : 'Select Type'}</option>
                {dataTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Bundles</label>
            <select 
              className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none disabled:opacity-50" 
              value={selectedPlan?.id || ''} 
              onChange={(e) => setSelectedPlan(dataPlans.find(p => p.id === e.target.value) || null)} 
              disabled={isFetchingPlans || dataPlans.length === 0}
            >
              <option value="">{isFetchingPlans ? 'Searching Bundles...' : dataPlans.length === 0 ? 'Choose Type First' : 'Select a Bundle'}</option>
              {dataPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {`${plan.name} - ₦${plan.amount.toLocaleString()} (${plan.validity})`}
                </option>
              ))}
            </select>
            {isFetchingPlans && <div className="mt-4 flex justify-center"><Spinner /></div>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Recipient Phone</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-3xl font-black tracking-tight outline-none" 
              placeholder="080..." 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              required 
              disabled={isPurchasing} 
            />
          </div>

          <button 
            onClick={handlePrePurchaseCheck} 
            className="w-full bg-blue-600 hover:bg-black text-white font-black py-8 rounded-3xl shadow-2xl shadow-blue-100 transition-all duration-300 disabled:opacity-50 uppercase tracking-[0.2em] text-sm transform active:scale-95" 
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Complete Transaction'}
          </button>
        </div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Verify Order" footer={
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-gray-100 text-gray-500 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="flex-2 bg-blue-600 hover:bg-black text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px] shadow-lg" onClick={startPinVerification} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Buy Now`}
          </button>
        </div>
      }>
        <div className="text-center py-6 space-y-4">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <SignalIcon />
           </div>
           <p className="text-gray-500 font-medium">You are buying <span className="text-gray-900 font-black tracking-tight">{selectedPlan?.name}</span> for:</p>
           <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{phoneNumber}</h3>
        </div>
      </Modal>
    </div>
  );
};

export default DataPage;