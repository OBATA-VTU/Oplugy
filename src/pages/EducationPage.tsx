import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { ShieldCheckIcon } from '../components/Icons';

// Default types based on Inlomax Service IDs
const DEFAULT_EXAM_TYPES = [
  { id: '1', name: 'WAEC Result Checker', price: 3370 },
  { id: '2', name: 'NECO Result Checker', price: 1100 },
  { id: '3', name: 'NABTEB Result Checker', price: 950 }
];

const EducationPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, fetchWalletBalance } = useAuth();
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  // Apply Profit Margin of 10 Naira for Server 1 Education Pins
  const marginPerPin = 10;
  const totalAmount = (selectedExam ? (selectedExam.price + marginPerPin) : 0) * quantity;

  const handlePrePurchase = () => {
    if (!selectedExam) {
      addNotification('Please select an exam type.', 'warning');
      return;
    }
    if (walletBalance !== null && totalAmount > walletBalance) {
      addNotification('Insufficient wallet balance.', 'error');
      return;
    }
    setShowPinModal(true);
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setShowPinModal(false);
    
    const response = await vtuService.purchaseEducation({
      type: selectedExam.id,
      quantity,
      amount: totalAmount
    });

    if (response.status) {
      addNotification(`Successfully generated ${quantity} ${selectedExam.name}(s). Check history for pins.`, 'success');
      await fetchWalletBalance();
      setSelectedExam(null);
      setQuantity(1);
    } else {
      addNotification(response.message || 'Transaction failed. Node synchronization interrupted.', 'error');
    }
    setIsPurchasing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Payment"
        description={`Authorizing ₦${totalAmount.toLocaleString()} for ${quantity}x ${selectedExam?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 uppercase">Buy Exam Pin</h2>
        <p className="text-gray-400 font-medium">Get pins to check WAEC, NECO, and NABTEB results.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl border border-gray-50">
         <div className="space-y-10">
            <div className="grid grid-cols-1 gap-4">
               {DEFAULT_EXAM_TYPES.map(exam => (
                 <button 
                  key={exam.id}
                  onClick={() => setSelectedExam(exam)}
                  className={`p-6 rounded-3xl border-4 text-left transition-all flex justify-between items-center group ${selectedExam?.id === exam.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                 >
                    <div>
                       <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{exam.name}</h4>
                       <p className="text-blue-600 font-black text-2xl tracking-tighter mt-1">₦{(exam.price + marginPerPin).toLocaleString()}</p>
                    </div>
                    {selectedExam?.id === exam.id ? (
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-blue-200">
                        <ShieldCheckIcon />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-white rounded-full border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-all opacity-40">
                         <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    )}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Pin Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl font-black text-2xl tracking-tight outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                  />
               </div>
               <div className="bg-gray-900 p-6 rounded-3xl flex flex-col justify-center border-t-4 border-blue-600 shadow-2xl shadow-blue-50">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-white tracking-tighter">₦{totalAmount.toLocaleString()}</p>
               </div>
            </div>

            <button 
              onClick={handlePrePurchase}
              disabled={!selectedExam || isPurchasing}
              className="w-full bg-blue-600 hover:bg-black text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-blue-100 transition-all transform active:scale-95 disabled:opacity-50"
            >
               {isPurchasing ? <Spinner /> : 'Buy Pins'}
            </button>
         </div>
      </div>

      <div className="p-8 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100 flex items-start space-x-6">
         <div className="text-blue-600 shrink-0 mt-1"><ShieldCheckIcon /></div>
         <p className="text-[11px] font-bold text-blue-900 uppercase tracking-widest leading-relaxed">After payment, you will find your pin(s) in your Transaction History.</p>
      </div>
    </div>
  );
};

export default EducationPage;