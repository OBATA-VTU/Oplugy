
import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { Operator, DataPlan } from '../types';
import Spinner from '../components/Spinner';
import { CABLE_BILLERS, SUBSCRIPTION_TYPES } from '../constants';

const CablePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { fetchWalletBalance, walletBalance } = useAuth();
  const [operators] = useState<Operator[]>(CABLE_BILLERS);
  const [cablePlans, setCablePlans] = useState<DataPlan[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [smartcardNo, setSmartcardNo] = useState('');
  const [subscriptionType, setSubscriptionType] = useState<'RENEW' | 'CHANGE'>('RENEW');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingPlans, setIsFetchingPlans] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerName, setCustomerName] = useState<string | null>(null);

  const fetchPlans = useCallback(async (billerName: string) => {
    setIsFetchingPlans(true);
    setCablePlans([]);
    setSelectedPlan(null);
    const response = await vtuService.getCablePlans(billerName);
    if (response.status && response.data) {
      setCablePlans(response.data);
    } else {
      addNotification(response.message || 'Failed to fetch cable plans.', 'error');
    }
    setIsFetchingPlans(false);
  }, [addNotification]);
  
  const handleVerify = async () => {
    if (!selectedOperator || !smartcardNo) return;
    setIsVerifying(true);
    setCustomerName(null);
    const response = await vtuService.verifyCableSmartcard({ biller: selectedOperator.id, smartCardNumber: smartcardNo });
    if (response.status && response.data?.customerName) {
      setCustomerName(response.data.customerName);
      addNotification('Smartcard verified successfully.', 'success');
      fetchPlans(selectedOperator.id);
    } else {
      addNotification(response.message || 'Verification failed.', 'error');
    }
    setIsVerifying(false);
  };
  
  const handlePurchase = async () => {
    if (!selectedPlan || !smartcardNo || !phoneNumber || isPurchasing) return;
    if (walletBalance !== null && selectedPlan.amount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      return;
    }
    setIsPurchasing(true);
    const response = await vtuService.purchaseCable({
      biller: selectedOperator!.id,
      smartCardNumber: smartcardNo,
      planCode: selectedPlan.id,
      subscriptionType: subscriptionType,
      phoneNumber: phoneNumber,
    });
    if (response.status && response.data) {
      addNotification(`Subscription for ${smartcardNo} was successful.`, 'success');
      setSmartcardNo('');
      setPhoneNumber('');
      setSelectedPlan(null);
      setCustomerName(null);
      await fetchWalletBalance();
    } else {
      addNotification(response.message || 'Subscription failed.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Cable TV Subscription</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold">Provider</label>
          <select className="w-full p-3 border rounded-md" value={selectedOperator?.id || ''} onChange={e => {
            setSelectedOperator(operators.find(o => o.id === e.target.value) || null);
            setCustomerName(null);
            setCablePlans([]);
          }}>
            <option value="">Select Provider</option>
            {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="smartcardNo" className="block text-sm font-semibold">Smartcard/IUC</label>
          <div className="flex">
            <input type="text" id="smartcardNo" className="w-full p-3 border rounded-l-md" value={smartcardNo} onChange={e => setSmartcardNo(e.target.value)} />
            <button onClick={handleVerify} className="bg-gray-200 p-3 rounded-r-md" disabled={isVerifying || !selectedOperator || smartcardNo.length < 5}>{isVerifying ? <Spinner /> : 'Verify'}</button>
          </div>
        </div>
        {customerName && (
          <div className="bg-green-100 text-green-800 p-3 rounded-md text-center">Verified: <span className="font-bold">{customerName}</span></div>
        )}
        <div className={!customerName ? 'opacity-50 pointer-events-none' : ''}>
          <label className="block text-sm font-semibold">Subscription Type</label>
          <select className="w-full p-3 border rounded-md" value={subscriptionType} onChange={e => setSubscriptionType(e.target.value as any)}>
            {SUBSCRIPTION_TYPES.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
          </select>
          <label className="block text-sm font-semibold mt-4">Plan</label>
          <select className="w-full p-3 border rounded-md" value={selectedPlan?.id || ''} onChange={e => setSelectedPlan(cablePlans.find(p => p.id === e.target.value) || null)} disabled={isFetchingPlans || cablePlans.length === 0}>
            <option value="">{isFetchingPlans ? 'Loading...' : 'Select Plan'}</option>
            {cablePlans.map(plan => <option key={plan.id} value={plan.id}>{`${plan.name} - ₦${plan.amount.toLocaleString()}`}</option>)}
          </select>
          <label htmlFor="phoneNumber" className="block text-sm font-semibold mt-4">Phone Number</label>
          <input type="tel" id="phoneNumber" className="w-full p-3 border rounded-md" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} maxLength={11} />
        </div>
        <button onClick={handlePurchase} className="w-full bg-blue-600 text-white font-bold py-3 rounded-md" disabled={!customerName || !selectedPlan || phoneNumber.length !== 11 || isPurchasing}>
          {isPurchasing ? <Spinner /> : 'Subscribe'}
        </button>
      </div>
    </div>
  );
};

export default CablePage;
