import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { CABLE_BILLERS, SUBSCRIPTION_TYPES } from '../constants.ts';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [cablePlans, setCablePlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [smartcardNo, setSmartcardNo] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<string>('RENEW');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingOperators, setIsFetchingOperators] = useState(true);
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [customerDueDate, setCustomerDueDate] = useState<string | null>(null);

  const fetchOperators = useCallback(async () => {
    setIsFetchingOperators(true);
    try {
      setOperators(CABLE_BILLERS);
    } catch (error: any) {
      addNotification(error.message || 'Error fetching operators.', 'error');
      console.error("Fetch Cable Operators Exception:", error);
    } finally {
      setIsFetchingOperators(false);
    }
  }, [addNotification]);

  const fetchPlans = useCallback(async (billerName: string) => {
    setIsFetchingPlans(true);
    setCablePlans([]);
    setSelectedPlan(null);
    try {
      const response = await vtuService.getCablePlans(billerName);
      if (response.status && response.data) {
        setCablePlans(response.data);
      } else {
        addNotification(response.message || 'Failed to fetch cable plans.', 'error');
        console.error("Fetch Cable Plans API Error:", { response, billerName });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error fetching cable plans.', 'error');
      console.error("Fetch Cable Plans Exception:", { error, billerName });
    } finally {
      setIsFetchingPlans(false);
    }
  }, [addNotification]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  useEffect(() => {
    if (selectedOperator) {
      fetchPlans(selectedOperator.id);
    }
  }, [selectedOperator, fetchPlans]);

  const handleVerifySmartcard = async () => {
    if (!selectedOperator || !smartcardNo || isVerifying) return;
    setIsVerifying(true);
    setCustomerName(null);
    setCustomerDueDate(null);

    if (smartcardNo.length < 5) {
      addNotification('Please enter a valid smartcard/IUC number.', 'warning');
      setIsVerifying(false);
      return;
    }
    
    const payload = {
        smartCardNumber: smartcardNo,
        biller: selectedOperator.id,
    };

    try {
      const response = await vtuService.verifyCableSmartcard(payload);
      if (response.status && response.data?.status) {
        setCustomerName(response.data.customerName || 'Verified Customer');
        setCustomerDueDate(response.data.dueDate || null);
        setShowConfirmModal(true);
        addNotification('Smartcard verified successfully.', 'success');
      } else {
        const errorMessage = response.data?.message || 'Failed to verify smartcard number.';
        addNotification(errorMessage, 'error');
        console.error("Smartcard Verification API Error:", { message: errorMessage, response, payload });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error verifying smartcard number.', 'error');
      console.error("Smartcard Verification Exception:", { error, payload });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOperator || !smartcardNo || !selectedPlan || !phoneNumber || isPurchasing) return;

    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      setShowConfirmModal(false);
      return;
    }
    if (phoneNumber.length !== 11 || !/^\d+$/.test(phoneNumber)) {
      addNotification('Please enter a valid 11-digit phone number for subscription.', 'warning');
      setShowConfirmModal(false);
      return;
    }

    setIsPurchasing(true);
    setShowConfirmModal(false);

    const payload = {
        smartCardNumber: smartcardNo,
        biller: selectedOperator.id,
        planCode: selectedPlan.id,
        subscriptionType: subscriptionType as 'RENEW' | 'CHANGE',
        phoneNumber: phoneNumber,
    };

    try {
      const response = await vtuService.purchaseCable(payload);

      if (response.status && response.data) {
        addNotification(`Cable subscription successful! Ref: ${response.data.reference}. Amount: ₦${response.data.amount}`, 'success');
        setSmartcardNo('');
        setPhoneNumber('');
        setSelectedOperator(null);
        setSelectedPlan(null);
        setCustomerName(null);
        setCustomerDueDate(null);
        await fetchWalletBalance();
      } else {
        const errorMessage = response.message || 'Cable subscription failed.';
        addNotification(errorMessage, 'error');
        console.error("Cable Subscription API Error:", { message: errorMessage, errors: response.errors, payload });
      }
    } catch (error: any) {
      addNotification(error.message || 'Error during cable subscription.', 'error');
      console.error("Cable Subscription Exception:", { error, payload });
    } finally {
      setIsPurchasing(false);
    }
  };

  const isFormValid = selectedOperator && selectedPlan && smartcardNo.length >= 5 && phoneNumber.length === 11;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Cable TV Subscription</h2>

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
                setSelectedPlan(null);
                setCustomerName(null);
                setCustomerDueDate(null);
              }}
              required
              disabled={isPurchasing || isVerifying}
            >
              <option value="">Choose Cable Provider</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="smartcardNo" className="block text-gray-700 text-sm font-semibold mb-2">
              Smartcard/IUC Number
            </label>
            <input
              type="text"
              id="smartcardNo"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., 1234567890"
              value={smartcardNo}
              onChange={(e) => setSmartcardNo(e.target.value)}
              required
              disabled={isPurchasing || isVerifying}
            />
          </div>

          <div>
            <label htmlFor="subscriptionType" className="block text-gray-700 text-sm font-semibold mb-2">
              Subscription Type
            </label>
            <select
              id="subscriptionType"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={subscriptionType}
              onChange={(e) => setSubscriptionType(e.target.value)}
              required
              disabled={isPurchasing || isVerifying}
            >
              {SUBSCRIPTION_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cablePlan" className="block text-gray-700 text-sm font-semibold mb-2">
              Select Subscription Plan
            </label>
            <select
              id="cablePlan"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedPlan?.id || ''}
              onChange={(e) => {
                const plan = cablePlans.find((p) => p.id === e.target.value);
                setSelectedPlan(plan || null);
              }}
              required
              disabled={!selectedOperator || isFetchingPlans || isPurchasing || isVerifying}
            >
              <option value="">
                {!selectedOperator ? 'Select Operator First' : (isFetchingPlans ? 'Loading Plans...' : 'Select Plan')}
              </option>
              {cablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ₦{plan.amount.toLocaleString()} ({plan.validity})
                </option>
              ))}
            </select>
            {isFetchingPlans && <div className="mt-2 text-sm text-gray-500">Loading cable plans...</div>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              Phone Number for Subscription
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
              disabled={isPurchasing || isVerifying}
            />
          </div>

          <button
            onClick={handleVerifySmartcard}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isVerifying || isPurchasing}
          >
            {isVerifying ? <Spinner /> : 'Verify Smartcard & Proceed'}
          </button>
        </div>
      )}

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Cable Subscription"
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
              {isPurchasing ? <Spinner /> : `Confirm Subscription (₦${selectedPlan?.amount.toLocaleString()})`}
            </button>
          </>
        }
      >
        <div className="text-gray-700">
          <p className="mb-2">
            You are about to subscribe to the{' '}
            <span className="font-semibold text-blue-600">{selectedPlan?.name}</span> (₦{selectedPlan?.amount.toLocaleString()}) for Smartcard/IUC{' '}
            <span className="font-semibold text-blue-600">{smartcardNo}</span> ({selectedOperator?.name}).
          </p>
          {customerName && <p className="mb-1">Customer Name: <span className="font-semibold">{customerName}</span></p>}
          {customerDueDate && <p className="mb-2">Due Date: <span className="font-semibold">{customerDueDate}</span></p>}
          <p className="mb-2">Subscription will be for phone number: <span className="font-semibold">{phoneNumber}</span></p>
          <p className="text-red-500 text-sm font-medium">Please confirm these details are correct.</p>
        </div>
      </Modal>
    </div>
  );
};

export default CablePage;
