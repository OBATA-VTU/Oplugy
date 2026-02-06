import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications'; // Fix: Import useNotifications
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
// Fix: Import DATA_NETWORKS and DATA_PLAN_TYPES from constants.ts
import { DATA_NETWORKS, DATA_PLAN_TYPES } from '../constants.ts';

const DataPage: React.FC = () => {
  // Fix: Destructure addNotification from useNotifications hook
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [dataTypes, setDataTypes] = useState<{ id: string; name: string }[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>(''); // e.g., AWOOF, GIFTING, SME
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null); // For display in modal

  const fetchOperators = useCallback(async () => {
    setIsFetchingOperators(true);
    try {
      // CIP API does not have an endpoint for this, so we use a hardcoded list
      setOperators(DATA_NETWORKS);
      setDataTypes(DATA_PLAN_TYPES); // Set data types as well
      addNotification('Data operators and types loaded.', 'info');
    } catch (error: any) {
      addNotification(error.message || 'Error fetching data operators.', 'error');
    } finally {
      setIsFetchingOperators(false);
    }
  }, [addNotification]);

  // Fix: Define fetchPlans using useCallback to make it a stable function
  const fetchPlans = useCallback(async (network: string, type: string) => {
    setIsFetchingPlans(true);
    setDataPlans([]); // Clear previous plans
    setSelectedPlan(null); // Clear selected plan
    try {
      const response = await vtuService.getDataPlans({ network, type });
      if (response.status && response.data) {
        setDataPlans(response.data);
      } else {
        addNotification(response.message || 'Failed to fetch data plans.', 'error');
      }
    } catch (error: any) {
      addNotification(error.message || 'Error fetching data plans.', 'error');
    } finally {
      setIsFetchingPlans(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    if (selectedOperator && selectedDataType) {
      fetchPlans(selectedOperator.id, selectedDataType);
    }
  }, [selectedOperator, selectedDataType, fetchPlans]);

  // Handle "verification" as part of the purchase flow, similar to airtime
  const handlePrePurchaseCheck = () => {
    if (!selectedOperator || !selectedDataType || !selectedPlan || !phoneNumber) {
      addNotification('Please fill all required fields.', 'warning');
      return;
    }
    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number.', 'warning');
      return;
    }

    // CIP API doesn't have explicit data number verification.
    // Assuming for dev, any valid number will proceed to purchase.
    setCustomerName('Verified Customer'); // Generic name for display
    setShowConfirmModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !phoneNumber || !selectedPlan || isPurchasing) return;

    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      setShowConfirmModal(false);
      return;
    }

    setIsPurchasing(true);
    setShowConfirmModal(false);

    try {
      const response = await vtuService.purchaseData({
        phone_number: phoneNumber,
        plan_id: selectedPlan.id, // CIP expects plan_id string
      });

      if (response.status && response.data) {
        addNotification(`Data purchase successful! Ref: ${response.data.reference}. Amount: ₦${response.data.amount}`, 'success');
        setPhoneNumber('');
        setSelectedOperator(null);
        setSelectedDataType('');
        setSelectedPlan(null);
        await fetchWalletBalance(); // Refresh wallet balance
      } else {
        addNotification(response.message || 'Data purchase failed.', 'error');
      }
    } catch (error: any) {
      addNotification(error.message || 'Error during data purchase.', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFormValid = selectedOperator && selectedDataType && selectedPlan && phoneNumber.length === 11;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Buy Data</h2>

      {isFetchingOperators ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div>
            <label htmlFor="operator" className="block text-gray-700 text-sm font-semibold mb-2">
              Select Operator
            </label>
            <select
              id="operator"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedOperator?.id || ''}
              onChange={(e) => {
                const op = operators.find((o) => o.id === e.target.value);
                setSelectedOperator(op || null);
                setSelectedDataType(''); // Reset data type when operator changes
                setCustomerName(null);
              }}
              required
              disabled={isPurchasing}
            >
              <option value="">Choose Network</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataType" className="block text-gray-700 text-sm font-semibold mb-2">
              Select Data Type
            </label>
            <select
              id="dataType"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedDataType}
              onChange={(e) => {
                setSelectedDataType(e.target.value);
                setSelectedPlan(null); // Reset plan when data type changes
              }}
              required
              disabled={!selectedOperator || isPurchasing}
            >
              <option value="">
                {selectedOperator ? 'Select Data Type' : 'Select Operator First'}
              </option>
              {dataTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dataPlan" className="block text-gray-700 text-sm font-semibold mb-2">
              Select Data Plan
            </label>
            <select
              id="dataPlan"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = dataPlans.find((p) => p.id === e.target.value);
                setSelectedPlan(plan || null);
              }}
              required
              disabled={!selectedOperator || !selectedDataType || isFetchingPlans || isPurchasing}
            >
              <option value="">
                {!selectedOperator || !selectedDataType ? 'Select Operator and Type First' : (isFetchingPlans ? 'Loading Plans...' : 'Select Plan')}
              </option>
              {dataPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₦{plan.amount.toLocaleString()} ({plan.validity})
                </option>
              ))}
            </select>
            {isFetchingPlans && <div className="mt-2 text-sm text-gray-500">Loading data plans...</div>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              pattern="[0-9]{11}"
              maxLength={11}
              required
              disabled={isPurchasing}
            />
          </div>

          <button
            onClick={handlePrePurchaseCheck}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isPurchasing}
          >
            {isPurchasing ? <Spinner /> : 'Proceed to Purchase'}
          </button>
        </div>
      )}

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Data Purchase"
        footer={
          <>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md mr-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setShowConfirmModal(false)}
              disabled={isPurchasing}
            >
              Cancel
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? <Spinner /> : `Confirm Purchase (₦${selectedPlan?.amount.toLocaleString()})`}
            </button>
          </>
        }
      >
        <div className="text-gray-700">
          <p className="mb-2">
            You are about to purchase{' '}
            <span className="font-semibold text-blue-600">{selectedPlan?.name}</span> (₦{selectedPlan?.amount.toLocaleString()}) for{' '}
            <span className="font-semibold text-blue-600">{phoneNumber}</span> ({selectedOperator?.name}).
          </p>
          {customerName && <p className="mb-2">Customer Name: <span className="font-semibold">{customerName}</span></p>}
          <p className="text-red-500 text-sm font-medium">Please confirm these details are correct.</p>
        </div>
      </Modal>
    </div>
  );
};

export default DataPage;