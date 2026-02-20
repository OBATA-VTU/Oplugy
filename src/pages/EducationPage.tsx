import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { ShieldCheckIcon, GamingIcon } from '../components/Icons';

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
    
    // Payload mapped to Inlomax requirements: serviceID and quantity
    const response = await vtuService.purchaseEducation({
      type: String(selectedExam.id),
      quantity: Number(quantity),
      amount: totalAmount,
      name: selectedExam.name
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
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Payment"
        description={`Authorizing ₦${totalAmount.toLocaleString()} for ${quantity}x ${selectedExam?.name}`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Exam Pins</h2>
        <p className="text-gray-400 font-medium text-lg">Instant result checkers for major Nigerian examination bodies.</p>
      </div>

      <div className="bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl border border-gray-50">
         <div className="space-y-12">
            <div>
               <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-4">1. Choice Exam Type</label>
               <div className="grid grid-cols-1 gap-4">
                  {DEFAULT_EXAM_TYPES.map(exam => (
                    <button 
                     key={exam.id}
                     onClick={() => setSelectedExam(exam)}
                     className={`p-8 rounded-[2.5rem] border-4 text-left transition-all flex justify-between items-center group ${selectedExam?.id === exam.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                    >
                       <div>
                          <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{exam.name}</h4>
                          <p className="text-blue-600 font-black text-3xl tracking-tighter mt-1">₦{(exam.price + marginPerPin).toLocaleString()}</p>
                       </div>
                       {selectedExam?.id === exam.id ? (
                         <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 animate-in zoom-in-50">
                           <ShieldCheckIcon />
                         </div>
                       ) : (
                         <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-all opacity-40">
                            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                         </div>
                       )}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">2. Pin Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full p-8 bg-gray-50 border-4 border-transparent rounded-[2.5rem] font-black text-3xl tracking-tight outline-none focus:border-blue-600 focus:bg-white transition-all text-center" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                  />
               </div>
               <div className="bg-gray-900 p-8 rounded-[2.5rem] flex flex-col justify-center border-t-8 border-blue-600 shadow-2xl">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Due</p>
                  <p className="text-5xl font-black text-white tracking-tighter leading-none">₦{totalAmount.toLocaleString()}</p>
               </div>
            </div>

            <button 
              onClick={handlePrePurchase}
              disabled={!selectedExam || isPurchasing}
              className="w-full bg-blue-600 hover:bg-black text-white py-10 rounded-[3.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-blue-200 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
            >
               {isPurchasing ? <Spinner /> : <><GamingIcon /> <span>Execute Delivery</span></>}
            </button>
         </div>
      </div>

      <div className="p-10 bg-gray-900 text-white rounded-[3.5rem] relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/40"><ShieldCheckIcon /></div>
            <div>
               <h4 className="text-2xl font-black tracking-tight">Post-Payment Node</h4>
               <p className="text-white/40 text-sm font-medium">Exam pins are delivered instantly to your transaction history ledger. Copy and use on respective result portals.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default EducationPage;