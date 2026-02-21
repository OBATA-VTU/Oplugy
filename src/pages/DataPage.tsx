import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { ShieldCheckIcon, SignalIcon } from '../components/Icons';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedServer, setSelectedServer] = useState<1 | 2>(1);

  const [networks, setNetworks] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  
  const [isFetchingNetworks, setIsFetchingNetworks] = useState(false);
  const [isFetchingTypes, setIsFetchingTypes] = useState(false);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  const resetPlans = useCallback(() => {
    setSelectedPlanId('');
    setDataPlans([]);
    setSelectedPlan(null);
  }, []);

  const resetAll = useCallback(() => {
    setSelectedOperator('');
    setSelectedType('');
    setDataTypes([]);
    resetPlans();
  }, [resetPlans]);

  const fetchNetworks = useCallback(async () => {
    setIsFetchingNetworks(true);
    const res = await vtuService.getDataNetworks(selectedServer);
    if (res.status) {
      setNetworks(res.data || []);
    }
    setIsFetchingNetworks(false);
  }, [selectedServer]);

  const fetchPlans = useCallback(async (net: string, type: string) => {
    setIsFetchingPlans(true);
    setSelectedPlanId('');
    setDataPlans([]);
    setSelectedPlan(null);
    const res = await vtuService.getDataPlans({ 
      network: net, 
      type, 
      userRole: user?.role || 'user',
      server: selectedServer
    });
    if (res.status && res.data) {
      setDataPlans(res.data);
    } else {
      addNotification(res.message || 'Plan sync failed.', 'error');
    }
    setIsFetchingPlans(false);
  }, [user?.role, addNotification, selectedServer]);

  useEffect(() => {
    fetchNetworks();
    resetAll();
  }, [selectedServer, fetchNetworks, resetAll]);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!selectedOperator) return;
      setIsFetchingTypes(true);
      setSelectedType('');
      setDataTypes([]);
      resetPlans();

      const res = await vtuService.getDataCategories(selectedOperator, selectedServer);
      if (res.status && res.data) {
        setDataTypes(res.data);
        if (res.data.length === 0) {
          fetchPlans(selectedOperator, '');
        }
      } else {
        addNotification(res.message || 'Node unreachable.', 'error');
      }
      setIsFetchingTypes(false);
    };
    fetchTypes();
  }, [selectedOperator, addNotification, fetchPlans, resetPlans, selectedServer]);

  useEffect(() => {
    if (selectedType && selectedOperator) {
      fetchPlans(selectedOperator, selectedType);
    }
  }, [selectedType, selectedOperator, fetchPlans]);

  useEffect(() => {
    setSelectedPlan(dataPlans.find(p => p.id === selectedPlanId) || null);
  }, [selectedPlanId, dataPlans]);

  const handlePrePurchase = () => {
    if (!selectedPlan || phoneNumber.length !== 11) {
      addNotification('Please select a plan and enter a valid phone number.', 'warning');
      return;
    }
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient balance.', 'error');
      return;
    }
    setShowPinModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || isPurchasing) return;
    setIsPurchasing(true);
    setShowPinModal(false);

    const res = await vtuService.purchaseData({
      plan_id: selectedPlan.id,
      phone_number: phoneNumber,
      amount: selectedPlan.amount,
      network: selectedOperator,
      plan_name: selectedPlan.name,
      server: selectedServer
    });
    
    if (res.status) {
      addNotification(`Data bundle active on ${phoneNumber}.`, 'success');
      updateWalletBalance((walletBalance || 0) - selectedPlan.amount);
      setPhoneNumber('');
      setSelectedPlanId('');
    } else {
      addNotification(res.message || 'Fulfillment error.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`You are about to pay ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Buy Data</h2>
        <p className="text-gray-500 font-medium text-lg">Get instant data bundles delivered to any phone number.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 space-y-10">
         <div className="space-y-8">
            <div className="flex gap-3 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
               <button 
                 onClick={() => setSelectedServer(1)} 
                 className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedServer === 1 ? 'bg-white text-blue-600 shadow-sm border border-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Standard Server
               </button>
               <button 
                 onClick={() => setSelectedServer(2)} 
                 className={`flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${selectedServer === 2 ? 'bg-white text-blue-600 shadow-sm border border-blue-50' : 'text-gray-400 hover:text-gray-600'}`}
               >
                 Premium Server
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">1. Select Network</label>
                  <select 
                    value={selectedOperator} 
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    disabled={isFetchingNetworks}
                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-lg outline-none transition-all appearance-none disabled:opacity-40"
                  >
                     <option value="">{isFetchingNetworks ? 'Loading networks...' : 'Choose a network'}</option>
                     {networks.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">2. Select Type</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={!selectedOperator || isFetchingTypes}
                    className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-lg outline-none transition-all appearance-none disabled:opacity-40"
                  >
                     <option value="">{isFetchingTypes ? 'Loading types...' : 'Choose data type'}</option>
                     {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                  </select>
               </div>
            </div>

            <div className="relative">
               <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">3. Select Plan</label>
               <select 
                 value={selectedPlanId} 
                 onChange={(e) => setSelectedPlanId(e.target.value)}
                 disabled={isFetchingPlans}
                 className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-lg outline-none transition-all appearance-none disabled:opacity-40"
               >
                  <option value="">{isFetchingPlans ? 'Loading plans...' : 'Choose a data plan'}</option>
                  {dataPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                       {`${plan.name} - ₦${plan.amount.toLocaleString()}`}
                    </option>
                  ))}
               </select>
               {isFetchingPlans && <div className="absolute right-8 top-1/2 mt-2"><Spinner /></div>}
            </div>

            {selectedPlan && (
               <div className="bg-blue-50/50 p-6 rounded-3xl border-2 border-dashed border-blue-100 flex justify-between items-center animate-in zoom-in-95 duration-300">
                  <div>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Price</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tight">₦{selectedPlan.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Validity</p>
                    <p className="font-bold text-gray-700">{selectedPlan.validity}</p>
                  </div>
               </div>
            )}

            <div className={`space-y-6 transition-opacity duration-500 ${selectedPlan ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
               <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">4. Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 focus:border-blue-600 rounded-2xl text-2xl font-bold tracking-tight text-center outline-none transition-all"
                    placeholder="08012345678"
                    maxLength={11}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  />
               </div>

               <button 
                 onClick={handlePrePurchase}
                 disabled={!selectedPlan || phoneNumber.length !== 11 || isPurchasing}
                 className="w-full bg-blue-600 hover:bg-gray-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-3 transform active:scale-95 disabled:opacity-50"
               >
                 {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Buy Now</span></>}
               </button>
            </div>
         </div>
      </div>

      <div className="p-8 bg-gray-900 text-white rounded-[2.5rem] relative overflow-hidden shadow-xl">
         <div className="relative z-10 flex items-center space-x-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg"><SignalIcon /></div>
            <div>
               <h4 className="text-xl font-bold tracking-tight">Instant Delivery</h4>
               <p className="text-white/50 text-sm font-medium">Your data bundle will be activated immediately after payment is confirmed.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]"></div>
      </div>
    </div>
  );
};

export default DataPage;