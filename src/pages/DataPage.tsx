import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
import { ArrowIcon, ShieldCheckIcon, BoltIcon, SignalIcon } from '../components/Icons';

type PageStep = 'serverSelection' | 'networkSelection' | 'form';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, updateWalletBalance } = useAuth();
  
  const [step, setStep] = useState<PageStep>('serverSelection');
  const [server, setServer] = useState<'server1' | 'server2' | null>(null);
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
    setPhoneNumber('');
  };

  const handleServerSelect = (selectedServer: 'server1' | 'server2') => {
    setServer(selectedServer);
    setStep('networkSelection');
  };
  
  const handleNetworkSelect = (op: Operator) => {
    setSelectedOperator(op);
    setStep('form');
  };
  
  const goBackToServerSelection = () => {
    setStep('serverSelection');
    setServer(null);
    setSelectedOperator(null);
    resetSelections();
  };
  
  const goBackToNetworkSelection = () => {
    setStep('networkSelection');
    setSelectedOperator(null);
    resetSelections();
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
    if (!selectedOperator || !server || (server === 'server1' && !selectedType)) return;
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
    if (!selectedPlan || !phoneNumber || isPurchasing || !server) return;
    
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

      {step === 'serverSelection' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 p-6 rounded-3xl flex items-start space-x-5">
            <div className="w-10 h-10 bg-yellow-500 text-white rounded-xl flex items-center justify-center shrink-0">
              <BoltIcon />
            </div>
            <div>
              <h4 className="font-black text-yellow-900">Please Note</h4>
              <p className="text-yellow-700 text-sm font-medium mt-1">Data plan prices vary between servers. Once a purchase is made, it is final and non-refundable. Please proceed with your chosen server.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ServerCard 
              title="Omega Server" 
              description="A wide range of data plans available." 
              onClick={() => handleServerSelect('server1')} 
            />
            <ServerCard 
              title="Boom Server" 
              description="Alternative data plans for all networks." 
              onClick={() => handleServerSelect('server2')} 
            />
          </div>
        </div>
      )}

      {step === 'networkSelection' && server && (
        <div className="space-y-10 animate-in fade-in duration-500">
           <button onClick={goBackToServerSelection} className="flex items-center space-x-3 text-sm font-black text-gray-400 hover:text-blue-600 transition-all group">
               <span className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-50 transition-all"><ArrowIcon /></span>
               <span>Go Back & Choose Server</span>
            </button>
           
           <div className="text-center">
              <p className="text-sm font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-5 py-2 rounded-full inline-block shadow-sm">
                 Using {server === 'server1' ? 'Omega' : 'Boom'} Server
              </p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {operators.map(op => (
                <button 
                  key={op.id} 
                  onClick={() => handleNetworkSelect(op)}
                  className="p-8 border-4 border-transparent rounded-[3rem] flex flex-col items-center gap-6 bg-white shadow-xl hover:border-blue-600 transition-all group"
                >
                   <img src={op.image} alt={op.name} className="h-20 w-20 object-contain transition-transform group-hover:scale-110" />
                   <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{op.name}</span>
                </button>
              ))}
           </div>
        </div>
      )}

      {step === 'form' && selectedOperator && server && (
         <div className="space-y-10 animate-in fade-in duration-500">
            <button onClick={goBackToNetworkSelection} className="flex items-center space-x-3 text-sm font-black text-gray-400 hover:text-blue-600 transition-all group">
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

interface ServerCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ServerCard: React.FC<ServerCardProps> = ({ title, description, onClick }) => (
  <button 
    onClick={onClick} 
    className="p-10 bg-white rounded-[3rem] border-4 border-transparent hover:border-blue-600 hover:bg-blue-50/50 transition-all group shadow-xl flex flex-col items-center text-center transform active:scale-95"
  >
    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg group-hover:scale-110">
      <SignalIcon />
    </div>
    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
    <p className="text-gray-400 font-medium text-sm mt-2">{description}</p>
    <div className="mt-8 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
       <span>Proceed with Server</span>
       <ArrowIcon />
    </div>
  </button>
);

export default DataPage;
