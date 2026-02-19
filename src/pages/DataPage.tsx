import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS } from '../constants';
import { ShieldCheckIcon, SignalIcon } from '../components/Icons';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, walletBalance, updateWalletBalance } = useAuth();
  
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  
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

  const fetchPlans = useCallback(async (net: string, type: string, srv: 'server1' | 'server2') => {
    setIsFetchingPlans(true);
    setSelectedPlanId('');
    setDataPlans([]);
    setSelectedPlan(null);
    const res = await vtuService.getDataPlans({ 
      network: net, 
      type, 
      server: srv,
      userRole: user?.role || 'user'
    });
    if (res.status && res.data) {
      setDataPlans(res.data);
    } else {
      addNotification(res.message || 'Plan sync failed.', 'error');
    }
    setIsFetchingPlans(false);
  }, [user?.role, addNotification]);

  // Fetch Categories/Types based on server
  useEffect(() => {
    const fetchTypes = async () => {
      if (!selectedOperator) return;
      setIsFetchingTypes(true);
      setSelectedType('');
      setDataTypes([]);
      resetPlans();

      const res = await vtuService.getDataCategories(selectedOperator, server);
      if (res.status && res.data) {
        setDataTypes(res.data);
        // Server 1 might not have sub-categories for all networks
        if (server === 'server1' && res.data.length === 0) {
          fetchPlans(selectedOperator, '', 'server1');
        }
      } else {
        addNotification(res.message || 'Node unreachable.', 'error');
      }
      setIsFetchingTypes(false);
    };
    fetchTypes();
  }, [selectedOperator, server, addNotification, fetchPlans, resetPlans]);

  useEffect(() => {
    if (selectedType && selectedOperator) {
      fetchPlans(selectedOperator, selectedType, server);
    }
  }, [selectedType, selectedOperator, server, fetchPlans]);

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
      server,
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
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Approve Transaction"
        description={`Paying ₦${selectedPlan?.amount.toLocaleString()} for ${selectedPlan?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-4">Mobile Data</h2>
        <p className="text-gray-400 font-medium text-lg">Instant delivery across independent provider nodes.</p>
      </div>

      <div className="bg-white p-8 lg:p-16 rounded-[3.5rem] shadow-2xl border border-gray-50 space-y-12">
         <div className="space-y-10">
            {/* Server Selection */}
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">1. Choice Node (Redundancy Enabled)</label>
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setServer('server1'); resetAll(); }}
                    className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server1' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                  >
                    <span className={`font-black text-lg ${server === 'server1' ? 'text-blue-600' : 'text-gray-400'}`}>Node 1</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Stable Core</span>
                  </button>
                  <button 
                    onClick={() => { setServer('server2'); resetAll(); }}
                    className={`p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-2 ${server === 'server2' ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                  >
                    <span className={`font-black text-lg ${server === 'server2' ? 'text-blue-600' : 'text-gray-400'}`}>Node 2</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">CIP Terminal</span>
                  </button>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">2. Network Carrier</label>
                  <select 
                    value={selectedOperator} 
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-3xl font-black text-xl outline-none transition-all appearance-none"
                  >
                     <option value="">Select Network</option>
                     {DATA_NETWORKS.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">3. Data Tier</label>
                  <select 
                    value={selectedType} 
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={!selectedOperator || isFetchingTypes}
                    className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-3xl font-black text-xl outline-none transition-all appearance-none disabled:opacity-40"
                  >
                     <option value="">{isFetchingTypes ? 'Loading Node...' : 'Select Category'}</option>
                     {dataTypes.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                  </select>
               </div>
            </div>

            <div className="relative">
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">4. Package Selection</label>
               <select 
                 value={selectedPlanId} 
                 onChange={(e) => setSelectedPlanId(e.target.value)}
                 disabled={(!selectedType && server === 'server2') || isFetchingPlans}
                 className="w-full p-6 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-3xl font-black text-xl outline-none transition-all appearance-none disabled:opacity-40"
               >
                  <option value="">{isFetchingPlans ? 'Syncing Catalog...' : 'Select Plan'}</option>
                  {dataPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                       {`${plan.name} - ₦${plan.amount.toLocaleString()}`}
                    </option>
                  ))}
               </select>
               {isFetchingPlans && <div className="absolute right-10 top-1/2 mt-3"><Spinner /></div>}
            </div>

            {selectedPlan && (
               <div className="bg-blue-50/50 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-100 flex justify-between items-center animate-in zoom-in-95 duration-300">
                  <div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total Due</p>
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">₦{selectedPlan.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Plan Life</p>
                    <p className="font-bold text-gray-700">{selectedPlan.validity}</p>
                  </div>
               </div>
            )}

            <div className={`space-y-8 transition-opacity duration-500 ${selectedPlan ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">5. Delivery Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full p-8 bg-gray-50 border-4 border-gray-100 focus:border-blue-600 rounded-[2.5rem] text-3xl font-black tracking-tight text-center outline-none transition-all"
                    placeholder="08012345678"
                    maxLength={11}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  />
               </div>

               <button 
                 onClick={handlePrePurchase}
                 disabled={!selectedPlan || phoneNumber.length !== 11 || isPurchasing}
                 className="w-full bg-blue-600 hover:bg-black text-white py-10 rounded-[3rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-blue-200 transition-all flex items-center justify-center space-x-4 transform active:scale-95 disabled:opacity-50"
               >
                 {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Execute Delivery</span></>}
               </button>
            </div>
         </div>
      </div>

      <div className="p-10 bg-gray-900 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg"><SignalIcon /></div>
            <div>
               <h4 className="text-2xl font-black tracking-tight">Node Load Balancing</h4>
               <p className="text-white/40 text-sm font-medium">Multiple isolated gateways ensure your transactions never clash or fail during peak hours.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default DataPage;