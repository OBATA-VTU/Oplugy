import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS } from '../constants';
import { ArrowIcon, ShieldCheckIcon, BoltIcon, SignalIcon } from '../components/Icons';

type PageStep = 'serverSelection' | 'networkSelection' | 'form';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, updateWalletBalance } = useAuth();
  
  const [step, setStep] = useState<PageStep>('serverSelection');
  const [server, setServer] = useState<'server1' | 'server2' | null>(null);
  const [operators] = useState<Operator[]>(DATA_NETWORKS);
  const [dataTypes, setDataTypes] = useState<{id: string, name: string}[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasCategories, setHasCategories] = useState(true);

  const availableOperators = server === 'server2' 
    ? operators.filter(op => op.id.toUpperCase() !== 'VITEL') 
    : operators;

  useEffect(() => {
    setSelectedPlan(dataPlans.find(p => p.id === selectedPlanId) || null);
  }, [selectedPlanId, dataPlans]);

  const resetSelections = () => {
    setSelectedType(null);
    setDataPlans([]);
    setSelectedPlanId('');
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

  const fetchPlans = useCallback(async (netId: string, typeId: string, srv: 'server1' | 'server2') => {
    setIsFetchingPlans(true);
    const res = await vtuService.getDataPlans({ network: netId, type: typeId, server: srv });
    if (res.status && res.data) {
        setDataPlans(res.data);
    } else {
        addNotification(res.message || 'Error loading plans.', 'error');
        setDataPlans([]);
    }
    setIsFetchingPlans(false);
  }, [addNotification]);

  const fetchTypes = useCallback(async () => {
    if (!selectedOperator || !server) return;
    setIsFetchingTypes(true);
    resetSelections();
    setDataTypes([]);

    const res = await vtuService.getDataCategories(selectedOperator.id, server);

    if (res.status && res.data && res.data.length > 0) {
        setDataTypes(res.data.map(d => ({ id: d, name: d })));
        setHasCategories(true);
    } else {
        setHasCategories(false);
        // If no categories, fetch plans directly for Server 1 if applicable
        if (server === 'server1') {
           fetchPlans(selectedOperator.id, '', server);
        }
    }
    setIsFetchingTypes(false);
  }, [selectedOperator, server, fetchPlans]);

  useEffect(() => {
    if (selectedOperator && server) {
      fetchTypes();
    }
  }, [selectedOperator, server, fetchTypes]);

  useEffect(() => {
    if (selectedOperator && server && selectedType) {
      fetchPlans(selectedOperator.id, selectedType, server);
    }
  }, [selectedType, selectedOperator, server, fetchPlans]);

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
      setSelectedPlanId('');
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
              <p className="text-yellow-700 text-sm font-medium mt-1">Data plan prices are different for each server. Please choose your preferred server carefully.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ServerCard 
              title="Omega Server" 
              description="Standard data plans with high reliability." 
              onClick={() => handleServerSelect('server1')} 
            />
            <ServerCard 
              title="Boom Server" 
              description="Alternative cheap data bundles." 
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
              {availableOperators.map(op => (
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
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 space-y-8">
               <div className="flex items-center space-x-6">
                  <img src={selectedOperator.image} alt={selectedOperator.name} className="h-16 w-16" />
                  <div>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">{selectedOperator.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">{server === 'server1' ? 'Omega Server' : 'Boom Server'}</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {isFetchingTypes ? <Spinner /> : hasCategories && (
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Data Category</label>
                       <select value={selectedType || ''} onChange={(e) => setSelectedType(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none">
                          <option value="">Select Category</option>
                          {dataTypes.map(dt => <option key={dt.id} value={dt.id}>{dt.name}</option>)}
                       </select>
                    </div>
                  )}

                  {isFetchingPlans ? <div className="h-16 flex items-center justify-center md:col-span-2"><Spinner /></div> : dataPlans.length > 0 ? (
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Data Plan</label>
                       <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none">
                          <option value="">Select Plan</option>
                          {dataPlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} (${plan.validity}) - ₦${plan.amount}`}</option>)}
                       </select>
                    </div>
                  ) : selectedType && !isFetchingPlans && (
                    <div className="md:col-span-2 py-8 text-center bg-red-50 rounded-2xl border border-red-100">
                       <p className="text-red-500 font-black text-xs uppercase tracking-widest">No plans found for this category.</p>
                    </div>
                  )}
               </div>
               
               <div className={`space-y-8 transition-opacity duration-500 ${selectedPlan ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                 {selectedPlan && (
                    <div className="bg-gray-50 rounded-3xl p-6 flex justify-between items-center text-center border border-gray-100">
                      <div className="w-1/3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Plan</p>
                        <p className="font-bold text-lg text-gray-900 leading-tight">{selectedPlan.name}</p>
                      </div>
                      <div className="w-1/3 border-x border-gray-200">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Validity</p>
                        <p className="font-bold text-lg text-gray-900">{selectedPlan.validity}</p>
                      </div>
                      <div className="w-1/3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Price</p>
                        <p className="font-black text-2xl text-blue-600">₦{selectedPlan.amount}</p>
                      </div>
                    </div>
                 )}
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