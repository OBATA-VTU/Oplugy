import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import PinPromptModal from '../components/PinPromptModal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
import { SignalIcon, BoltIcon, ArrowIcon, ShieldCheckIcon } from '../components/Icons';

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

  // Deep reset on transition to prevent conflicts between server-specific data
  const handleServerTransition = (selected: 'server1' | 'server2') => {
    setServer(selected);
    setSelectedOperator(null);
    setSelectedDataType('');
    setSelectedPlan(null);
    setDataPlans([]);
    setStep('form');
  };

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
        }
        setIsFetchingTypes(false);
      } else {
        setDataTypes(DATA_PLAN_TYPES);
      }
    };
    loadTypes();
  }, [server, selectedOperator, step]);

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

    if (response.status) {
      addNotification(`Success! ${selectedPlan.name} sent to ${phoneNumber}.`, 'success');
      setPhoneNumber('');
      setSelectedPlan(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Purchase failed. Node error.', 'error');
    }
    setIsPurchasing(false);
  };

  if (step === 'selection') {
    return (
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
        <div className="text-center space-y-6">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.6em] mb-4">Network Gateway</h2>
          <h1 className="text-6xl lg:text-[120px] font-black text-gray-900 tracking-tighter leading-[0.8] mb-4">Choose <br />Your <span className="text-blue-600">Engine.</span></h1>
          <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto leading-relaxed">Select a data fulfillment node to view available plans and pricing.</p>
        </div>

        {/* HIGH-END PRICE NOTICE */}
        <div className="relative group">
           <div className="absolute inset-0 bg-red-600 rounded-[3rem] blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
           <div className="relative bg-white border-2 border-red-50 p-10 lg:p-14 rounded-[4rem] flex flex-col lg:flex-row items-center gap-10 shadow-2xl">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2.5rem] flex items-center justify-center shrink-0 animate-pulse shadow-inner">
                 <ShieldCheckIcon />
              </div>
              <div className="text-center lg:text-left flex-1">
                 <h3 className="text-red-600 font-black text-2xl uppercase tracking-tighter mb-2">Mandatory Price Disclosure</h3>
                 <p className="text-gray-500 font-bold text-lg leading-snug max-w-2xl">Prices on <span className="text-red-600 underline">Server 1</span> are different from <span className="text-red-600 underline">Server 2</span>. We provide two servers to ensure you always get the best prices and 100% uptime. <span className="text-gray-900">Always check both servers before buying.</span></p>
              </div>
              <div className="hidden lg:block w-px h-24 bg-gray-100 mx-4"></div>
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sync Status</span>
                 <span className="bg-green-50 text-green-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Nodes Active</span>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <ServerTile 
             id="server1"
             title="Main Data Node"
             desc="Server 1: Custom fulfillment node. Features SME Plus and Corporate gifting bundles."
             color="blue"
             onClick={() => handleServerTransition('server1')}
           />
           <ServerTile 
             id="server2"
             title="Hyper-Data Node"
             desc="Server 2: Hyper-speed node with automatic API synchronization and fixed profit margins."
             color="black"
             onClick={() => handleServerTransition('server2')}
           />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Authorize Order"
        description={`Authorizing ₦${selectedPlan?.amount?.toLocaleString()} for ${phoneNumber}`}
      />

      <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
         <button onClick={() => setStep('selection')} className="px-6 py-3 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-blue-600 transition-all flex items-center gap-2">
            <span className="rotate-180"><ArrowIcon /></span> Switch Engine
         </button>
         <div className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest ${server === 'server1' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-900 text-white shadow-lg'}`}>
            {server === 'server1' ? 'Node 1: MANUAL PRICING' : 'Node 2: AUTO PRICING'}
         </div>
      </div>

      <div className="bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl border border-gray-50 space-y-12">
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Network Provider</label>
              <select className="w-full p-6 bg-gray-50 rounded-2xl font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" value={selectedOperator?.id || ''} onChange={(e) => {
                setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
                setSelectedDataType('');
                setDataPlans([]);
              }}>
                <option value="">Choose Provider</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Bundle Type</label>
              <select className="w-full p-6 bg-gray-50 rounded-2xl font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50" value={selectedDataType} onChange={(e) => setSelectedDataType(e.target.value)} disabled={!selectedOperator || isFetchingTypes}>
                <option value="">{isFetchingTypes ? 'Loading Node...' : 'Select Type'}</option>
                {dataTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Available Plans</label>
            <select className="w-full p-6 bg-gray-50 rounded-2xl font-black text-xl border-4 border-transparent focus:border-blue-600 outline-none appearance-none disabled:opacity-50" value={selectedPlan?.id || ''} onChange={(e) => setSelectedPlan(dataPlans.find(p => p.id === e.target.value) || null)} disabled={isFetchingPlans || dataPlans.length === 0}>
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
            <label htmlFor="phoneNumber" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Recipient Phone</label>
            <input type="tel" id="phoneNumber" className="w-full p-8 bg-gray-50 border-4 border-gray-100 rounded-[2.5rem] focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-4xl font-black tracking-tight outline-none" placeholder="080..." value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} required disabled={isPurchasing} />
          </div>

          <button onClick={handlePrePurchaseCheck} className="w-full bg-blue-600 hover:bg-black text-white font-black py-10 rounded-[3rem] shadow-2xl shadow-blue-200 transition-all duration-300 disabled:opacity-50 uppercase tracking-[0.4em] text-sm transform active:scale-95" disabled={!selectedPlan || phoneNumber.length !== 11 || isPurchasing}>
            {isPurchasing ? <Spinner /> : 'Complete Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ServerTile = ({ id, title, desc, color, onClick }: any) => (
  <button onClick={onClick} className="bg-white p-12 lg:p-16 rounded-[4.5rem] border-4 border-gray-50 text-left hover:border-blue-600 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
     <div className="relative z-10">
        <div className={`w-20 h-20 ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-900'} rounded-3xl flex items-center justify-center mb-12 group-hover:scale-110 transition-transform shadow-sm`}>
           <BoltIcon />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4">{id.toUpperCase()} GATEWAY</p>
        <h3 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-6 group-hover:text-blue-600 transition-colors leading-none">{title}</h3>
        <p className="text-gray-400 font-medium text-lg leading-relaxed mb-16">{desc}</p>
        
        <div className="mt-auto flex items-center gap-4">
           <span className="text-[11px] font-black uppercase tracking-widest text-blue-600">Secure Link</span>
           <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:translate-x-3 transition-transform"><ArrowIcon /></span>
        </div>
     </div>
     <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
  </button>
);

export default DataPage;