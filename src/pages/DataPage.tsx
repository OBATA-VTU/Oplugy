
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';
// Import SignalIcon to fix the missing component error
import { SignalIcon } from '../components/Icons';

const DataPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators] = useState<Operator[]>(DATA_NETWORKS);
  const [dataTypes] = useState(DATA_PLAN_TYPES);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchPlans = useCallback(async (network: string, type: string) => {
    setIsFetchingPlans(true);
    setDataPlans([]);
    setSelectedPlan(null);
    const response = await vtuService.getDataPlans({ network, type });
    if (response.status && response.data) {
      setDataPlans(response.data);
    } else {
      addNotification(response.message || 'Connecting to global data hub...', 'info');
    }
    setIsFetchingPlans(false);
  }, [addNotification]);

  useEffect(() => {
    if (selectedOperator && selectedDataType) {
      fetchPlans(selectedOperator.id, selectedDataType);
    }
  }, [selectedOperator, selectedDataType, fetchPlans]);

  const handlePurchase = async () => {
    if (!selectedPlan || !phoneNumber || isPurchasing) return;
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      setShowConfirmModal(false);
      return;
    }
    setIsPurchasing(true);
    setShowConfirmModal(false);
    
    const response = await vtuService.purchaseData({ 
      phone_number: phoneNumber, 
      plan_id: selectedPlan.id,
      amount: selectedPlan.amount,
      network: selectedOperator!.id,
      plan_name: selectedPlan.name
    });

    if (response.status && response.data) {
      addNotification(`Data fulfillment successful for ${phoneNumber}.`, 'success');
      setPhoneNumber('');
      setSelectedPlan(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Transaction failed. Node error.', 'error');
    }
    setIsPurchasing(false);
  };
  
  const isFormValid = selectedOperator && selectedDataType && selectedPlan && phoneNumber.length === 11;

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">High-Speed Data</h2>
        <p className="text-gray-400 font-medium">Independent delivery node for all mobile networks.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] shadow-xl border border-gray-50">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Mobile Network</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedOperator?.id || ''} 
                onChange={(e) => setSelectedOperator(operators.find(o => o.id === e.target.value) || null)}
              >
                <option value="">Select Operator</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Bundle Category</label>
              <select 
                className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none" 
                value={selectedDataType} 
                onChange={(e) => setSelectedDataType(e.target.value)} 
                disabled={!selectedOperator}
              >
                <option value="">Select Category</option>
                {dataTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Available Plans</label>
            <select 
              className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none disabled:opacity-50" 
              value={selectedPlan?.id || ''} 
              onChange={(e) => setSelectedPlan(dataPlans.find(p => p.id === e.target.value) || null)} 
              disabled={isFetchingPlans || dataPlans.length === 0}
            >
              <option value="">{isFetchingPlans ? 'Searching plans...' : dataPlans.length === 0 ? 'Pick Network/Category First' : 'Choose Data Plan'}</option>
              {dataPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {`${plan.name} - ₦${plan.amount.toLocaleString()} [${plan.validity}]`}
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
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-2xl font-black tracking-tight outline-none" 
              placeholder="08012345678" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
              maxLength={11} 
              required 
              disabled={isPurchasing} 
            />
          </div>

          <button 
            onClick={() => setShowConfirmModal(true)} 
            className="w-full bg-blue-600 hover:bg-black text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all duration-300 disabled:opacity-50 uppercase tracking-[0.2em] text-sm" 
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Initiate Delivery'}
          </button>
        </div>
      </div>

      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Verify Order" footer={
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px]" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="flex-2 bg-blue-600 hover:bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center min-w-[150px]" onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Confirm ₦${selectedPlan?.amount.toLocaleString()}`}
          </button>
        </div>
      }>
        <div className="text-center py-6 space-y-4">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <SignalIcon />
           </div>
           <p className="text-gray-500 font-medium">You are about to activate <span className="text-gray-900 font-black tracking-tight">{selectedPlan?.name}</span> on:</p>
           <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{phoneNumber}</h3>
           <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Validity: {selectedPlan?.validity}</p>
        </div>
      </Modal>
    </div>
  );
};

export default DataPage;
