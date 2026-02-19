import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
import { SignalIcon, BoltIcon, ArrowIcon } from '../components/Icons';

type PageStep = 'selection' | 'form';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  
  const [step, setStep] = useState<PageStep>('selection');
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

  // Fetch real categories from Server 1 when on form step
  useEffect(() => {
    const loadTypes = async () => {
      if (step === 'form' && server === 'server1' && selectedOperator) {
        setIsFetchingTypes(true);
        setSelectedDataType('');
        setDataPlans([]);
        const res = await vtuService.getDataCategories(selectedOperator.id, 'server1');
        if (res.status && res.data) {
          setDataTypes(res.data.map(t => ({ id: t, name: t })));
        } else {
          setDataTypes(DATA_PLAN_TYPES);
          addNotification('Using standard categories for now.', 'info');
        }
        setIsFetchingTypes(false);
      } else {
        setDataTypes(DATA_PLAN_TYPES);
      }
    };
    loadTypes();
  }, [server, selectedOperator, step, addNotification]);

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
    if (step === 'form' && selectedOperator && selectedDataType) {
      fetchPlans(selectedOperator.id, selectedDataType, server);
    }
  }, [selectedOperator, selectedDataType, server, step, fetchPlans]);

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

  const selectServer = (s: 'server1' | 'server2') => {
    setServer(s);
    setStep('form');
    // CONFLICT PREVENTION: Reset selection to ensure data doesn't mix between servers
    setSelectedOperator(null);
    setSelectedDataType('');
    setDataPlans([]);
  };
  
  const isFormValid = selectedOperator && selectedDataType && selectedPlan && phoneNumber.length === 11;

  if (step === 'selection') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
        <div className="text-center">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-6">Network Selection</h2>
          <h1 className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-none mb-6">Select a <br /><span className="text-blue-600">Server.</span></h1>
          <p className="text-gray-400 font-medium text-lg max-w-xl mx-auto">Our servers use different routes. If one is slow, use the other.</p>
        </div>

        {/* PRICE NOTICE BANNER */}
        <div className="bg-red-50 border-2 border-red-100 p-10 rounded-[3rem] text-center shadow-2xl shadow-red-50 relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-red-600 font-black text-xl uppercase tracking-tighter mb-2">Important Price Notice</h3>
              <p className="text-red-500 font-bold text-lg leading-tight">Data plan prices on <span className="underline">Server 1</span> are different from <span className="underline">Server 2</span>. <br /> We recommend checking both servers to find the best price for your purchase.</p>
           </div>
           <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/50 rounded-full blur-2xl -mr-10 -mt-10"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <ServerCard 
            title="Main Data Route" 
            desc="Server 1: Primary route for all networks. Includes exclusive SME+ bundles."
            server="SRV-1"
            color="blue"
            onClick={() => selectServer('server1')}
           />
           <ServerCard 
            title="Backup Data Route" 
            desc="Server 2: High-speed backup route. Always active for all networks."
            server="SRV-2"
            color="black"
            onClick={() => selectServer('server2')}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`Authorizing ₦${selectedPlan?.amount?.toLocaleString()} for ${phoneNumber}`}
      />

      <div className="flex justify-between items-center mb-6">
         <button 
          onClick={() => setStep('selection')}
          className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2"
         >
            <span className="rotate-180"><ArrowIcon /></span> Change Server
         </button>
         <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${server === 'server1' ? 'bg-blue-100 text-blue-600' : 'bg-gray-900 text-white'}`}>
            {server === 'server1' ? 'Main Route' : 'Backup Route'} ACTIVE
         </div>
      </div>

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Purchase Plan</h2>
        <p className="text-gray-400 font-medium">Processing via {server === 'server1' ? 'Main Engine' : 'Backup Engine'}.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-gray-50">
        <div className="space-y-10">
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
                <option value="">{isFetchingTypes ? 'Loading Types...' : 'Select Type'}</option>
                {dataTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Available Plans</label>
            <select 
              className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none disabled:opacity-50" 
              value={selectedPlan?.id || ''} 
              onChange={(e) => setSelectedPlan(dataPlans.find(p => p.id === e.target.value) || null)} 
              disabled={isFetchingPlans || dataPlans.length === 0}
            >
              <option value="">{isFetchingPlans ? 'Fetching Prices...' : dataPlans.length === 0 ? 'Pick Network & Type' : 'Choose a Plan'}</option>
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
            {isPurchasing ? <Spinner /> : 'Complete Order'}
          </button>
        </div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Order" footer={
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
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Price: ₦{selectedPlan?.amount?.toLocaleString()}</p>
        </div>
      </Modal>
    </div>
  );
};

const ServerCard = ({ title, desc, server, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className="bg-white p-12 rounded-[4rem] border-4 border-gray-50 text-left hover:border-blue-600 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
  >
     <div className="relative z-10">
        <div className={`w-16 h-16 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-900'} rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform`}>
           <BoltIcon />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{server}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-4 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-gray-400 font-medium leading-relaxed">{desc}</p>
        
        <div className="mt-12 flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Connect Now</span>
           <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:translate-x-2 transition-transform"><ArrowIcon /></span>
        </div>
     </div>
     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </button>
);

export default DataPage;