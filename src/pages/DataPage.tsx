import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants';

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
      addNotification(response.message || 'Failed to fetch data plans.', 'error');
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
    // Added missing amount, network, and plan_name fields to match vtuService.purchaseData requirements
    const response = await vtuService.purchaseData({ 
      phone_number: phoneNumber, 
      plan_id: selectedPlan.id,
      amount: selectedPlan.amount,
      network: selectedOperator!.id,
      plan_name: selectedPlan.name
    });
    if (response.status && response.data) {
      addNotification(`Data purchase successful for ${phoneNumber}.`, 'success');
      setPhoneNumber('');
      setSelectedPlan(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Data purchase failed.', 'error');
    }
    setIsPurchasing(false);
  };
  
  const isFormValid = selectedOperator && selectedDataType && selectedPlan && phoneNumber.length === 11;

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Buy Data</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Operator</label>
            <select className="w-full p-3 border border-gray-300 rounded-md" value={selectedOperator?.id || ''} onChange={(e) => setSelectedOperator(operators.find(o => o.id === e.target.value) || null)}>
              <option value="">Choose Network</option>
              {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Data Type</label>
            <select className="w-full p-3 border border-gray-300 rounded-md" value={selectedDataType} onChange={(e) => setSelectedDataType(e.target.value)} disabled={!selectedOperator}>
              <option value="">Select Type</option>
              {dataTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">Select Data Plan</label>
            <select className="w-full p-3 border border-gray-300 rounded-md" value={selectedPlan?.id || ''} onChange={(e) => setSelectedPlan(dataPlans.find(p => p.id === e.target.value) || null)} disabled={isFetchingPlans || dataPlans.length === 0}>
              <option value="">{isFetchingPlans ? 'Loading...' : 'Select Plan'}</option>
              {dataPlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} - ₦${plan.amount.toLocaleString()}`}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">Phone Number</label>
            <input type="tel" id="phoneNumber" className="w-full p-3 border border-gray-300 rounded-md" placeholder="08012345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} required disabled={isPurchasing} />
          </div>
          <button onClick={() => setShowConfirmModal(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md" disabled={!isFormValid || isPurchasing}>
            {isPurchasing ? <Spinner /> : 'Purchase Data'}
          </button>
        </div>
      </div>
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Data Purchase" footer={
        <>
          <button className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md mr-2" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md" onClick={handlePurchase} disabled={isPurchasing}>
            {isPurchasing ? <Spinner /> : `Confirm (₦${selectedPlan?.amount.toLocaleString()})`}
          </button>
        </>
      }>
        <p>Buy <span className="font-bold">{selectedPlan?.name}</span> for <span className="font-bold">{phoneNumber}</span>?</p>
      </Modal>
    </div>
  );
};

export default DataPage;