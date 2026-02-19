import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
import { ArrowIcon, ShieldCheckIcon } from '../components/Icons';

type PageStep = 'selection' | 'form';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, updateWalletBalance } = useAuth();
  
  const [step, setStep] = useState<PageStep>('selection');
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [operators] = useState<Operator[]>(DATA_NETWORKS);
  const [dataTypes, setDataTypes] = useState<{id: string, name: string}[]>(DATA_PLAN_TYPES);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const resetSelections = () => {
    setSelectedType(null);
    setDataPlans([]);
    setSelectedPlan(null);
  };

  const fetchTypes = useCallback(async () => {
    if (!selectedOperator || server !== 'server1') return;
    setIsFetchingTypes(true);
    resetSelections();
    const res = await vtuService.getDataCategories(selectedOperator.id, 'server1');
    if (res.status && res.data) {
      setDataTypes(res.data.map(d => ({ id: d, name: d })));
    } else {
      setDataTypes(DATA_PLAN_TYPES);
    }
    setIsFetchingTypes(false);
  }, [selectedOperator, server]);

  const fetchPlans = useCallback(async () => {
    if (!selectedOperator || (server === 'server1' && !selectedType)) return;
    setIsFetchingPlans(true);
    setSelectedPlan(null);
    const payload = { network: selectedOperator.id, type: selectedType || '', server };
    const res = await vtuService.getDataPlans(payload);
    if (res.status && res.data) {
      setDataPlans(res.data);
    } else {
      addNotification(res.message || 'Error loading plans.', 'error');
      setDataPlans([]);
    }
    setIsFetchingPlans(false);
  }, [selectedOperator, selectedType, server, addNotification]);

  useEffect(() => {
    if (server === 'server1') {
      fetchTypes();
    } else {
      resetSelections();
      setDataTypes([]);
      if (selectedOperator) fetchPlans();
    }
  }, [selectedOperator, server, fetchTypes, fetchPlans]);
  
  useEffect(() => {
    if (selectedType && server === 'server1') fetchPlans();
  }, [selectedType, server, fetchPlans]);

  const handlePrePurchase = () => {
    if (!selectedPlan || !/^\d{11}$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient funds.', 'error');
      return;
    }
    setShowPinModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber || isPurchasing) return;
    
    setIsPurchasing(true);
    setShowPinModal(false);

    const payload = {
      plan_id: selectedPlan.id,
      phone_number: phoneNumber,
      amount: selectedPlan.amount,
      network: selectedOperator!.id,
      plan_name: selectedPlan.name,
      server,
    };

    const res = await vtuService.purchaseData(payload);
    
    if (res.status) {
      addNotification(`Data sent to ${phoneNumber}.`, 'success');
      updateWalletBalance((walletBalance || 0) - selectedPlan.amount);
      setPhoneNumber('');
      setSelectedPlan(null);
    } else {
      addNotification(res.message || 'Purchase failed.', 'error');
    }
    setIsPurchasing(false);
  };
  
  const handleStartPurchase = (op: Operator) => {
    setSelectedOperator(op);
    setStep('form');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Your PIN"
        description={`You are paying ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Buy Data</h2>
        <p className="text-gray-400 font-medium">Enjoy cheap and fast data for all networks.</p>
      </div>

      {step === 'selection' && (
        <div className="space-y-12">
           <div className="flex p-2 bg-white rounded-3xl border border-gray-100 shadow-xl w-full max-w-lg mx-auto">
              <ServerBtn label="Omega Server" desc="Faster & Cheaper" active={server === 'server1'} onClick={() => setServer('server1')} />
              <ServerBtn label="Boom Server" desc="More Reliable" active={server === 'server2'} onClick={() => setServer('server2')} />
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {operators.map(op => (
                <button 
                  key={op.id} 
                  onClick={() => handleStartPurchase(op)}
                  className="p-8 border-4 border-transparent rounded-[3rem] flex flex-col items-center gap-6 bg-white shadow-xl hover:border-blue-600 transition-all group"
                >
                   <img src={op.image} alt={op.name} className="h-20 w-20 object-contain transition-transform group-hover:scale-110" />
                   <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{op.name}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      {step === 'form' && selectedOperator && (
         <div className="space-y-10">
            <button onClick={() => setStep('selection')} className="flex items-center space-x-3 text-sm font-black text-gray-400 hover:text-blue-600 transition-all group">
               <span className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-all"><ArrowIcon /></span>
               <span>Go Back & Choose Network</span>
            </button>
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 space-y-10">
               <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-6">
                     <img src={selectedOperator.image} alt={selectedOperator.name} className="h-16 w-16" />
                     <div>
                        <p className="text-3xl font-black text-gray-900 tracking-tight">{selectedOperator.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{server === 'server1' ? 'Omega Server' : 'Boom Server'}</p>
                     </div>
                  </div>
               </div>

               {server === 'server1' && (
                 <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                   {isFetchingTypes ? <Spinner /> : dataTypes.map(dt => (
                     <button key={dt.id} onClick={() => setSelectedType(dt.id)} className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === dt.id ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>
                       {dt.name}
                     </button>
                   ))}
                 </div>
               )}
               
               {isFetchingPlans ? (
                 <div className="h-64 flex items-center justify-center"><Spinner /></div>
               ) : dataPlans.length > 0 ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                   {dataPlans.map(plan => (
                     <button key={plan.id} onClick={() => setSelectedPlan(plan)} className={`p-6 border-4 rounded-3xl text-center transition-all ${selectedPlan?.id === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                       <p className="font-black text-gray-900 text-lg leading-tight">{plan.name}</p>
                       <p className="font-black text-blue-600 text-2xl tracking-tighter mt-2">₦{plan.amount}</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">{plan.validity}</p>
                     </button>
                   ))}
                 </div>
               ) : (server === 'server1' && selectedType) || (server === 'server2' && selectedOperator) ? (
                 <div className="text-center py-12 text-gray-400 font-medium">No plans available for this category.</div>
               ) : null}

               <div className={`space-y-8 transition-opacity duration-500 ${selectedPlan ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 <input type="tel" className="w-full p-6 bg-gray-50 border-4 border-gray-100 rounded-3xl text-2xl font-black tracking-tighter text-center outline-none focus:border-blue-600 focus:bg-white transition-all" placeholder="Enter Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} />
                 <button onClick={handlePrePurchase} disabled={isPurchasing || !selectedPlan || phoneNumber.length !== 11} className="w-full bg-blue-600 text-white font-black py-8 rounded-[2.5rem] shadow-2xl uppercase tracking-[0.3em] flex items-center justify-center space-x-4 hover:bg-black transition-all transform active:scale-95 disabled:opacity-50">
                    {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /><span>Buy Data Now</span></>}
                 </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const ServerBtn = ({ label, desc, active, onClick }: any) => (
  <button onClick={onClick} className={`flex-1 py-5 rounded-[2rem] text-center transition-all duration-300 transform ${active ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}>
     <span className="font-black text-sm uppercase tracking-widest">{label}</span>
     <span className={`block text-[9px] font-bold uppercase tracking-wider transition-all ${active ? 'text-blue-200' : 'text-gray-300'}`}>{desc}</span>
  </button>
);

export default DataPage;