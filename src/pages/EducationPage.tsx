import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { ShieldCheckIcon, GamingIcon } from '../components/Icons';

const EducationPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, fetchWalletBalance } = useAuth();
  const [examTypes, setExamTypes] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  React.useEffect(() => {
    const fetchPlans = async () => {
      setIsLoadingPlans(true);
      const res = await vtuService.getEducationPlans();
      if (res.status && res.data) {
        setExamTypes(res.data);
      }
      setIsLoadingPlans(false);
    };
    fetchPlans();
  }, []);

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
    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={handlePurchase}
        title="Confirm Purchase"
        description={`You are about to pay ₦${totalAmount.toLocaleString()} for ${quantity}x ${selectedExam?.name} pins.`}
      />

      <div className="text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Exam PINs</h2>
        <p className="text-gray-500 font-medium text-lg">Get WAEC, NECO, and NABTEB result checker pins instantly.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50">
         <div className="space-y-10">
            <div>
               <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-6 ml-2">1. Select Exam Type</label>
               <div className="grid grid-cols-1 gap-4">
                  {isLoadingPlans ? (
                    <div className="flex justify-center py-10">
                      <Spinner />
                    </div>
                  ) : examTypes.map(exam => (
                    <button 
                     key={exam.id}
                     onClick={() => setSelectedExam(exam)}
                     className={`p-6 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${selectedExam?.id === exam.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50 hover:border-gray-100'}`}
                    >
                       <div>
                          <h4 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{exam.name}</h4>
                          <p className="text-blue-600 font-bold text-2xl tracking-tight mt-1">₦{(exam.price + marginPerPin).toLocaleString()}</p>
                       </div>
                       {selectedExam?.id === exam.id ? (
                         <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 animate-in zoom-in-50">
                           <ShieldCheckIcon />
                         </div>
                       ) : (
                         <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center group-hover:scale-110 transition-all opacity-40">
                            <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                         </div>
                       )}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
               <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 ml-2">2. Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-2xl tracking-tight outline-none focus:border-blue-600 focus:bg-white transition-all text-center" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} 
                  />
               </div>
               <div className="bg-gray-900 p-6 rounded-2xl flex flex-col justify-center border-t-4 border-blue-600 shadow-xl">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-white tracking-tight leading-none">₦{totalAmount.toLocaleString()}</p>
               </div>
            </div>

            <button 
              onClick={handlePrePurchase}
              disabled={!selectedExam || isPurchasing}
              className="w-full bg-blue-600 hover:bg-gray-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
            >
               {isPurchasing ? <Spinner /> : <><ShieldCheckIcon /> <span>Buy Now</span></>}
            </button>
         </div>
      </div>

      <div className="p-8 bg-blue-50 text-blue-900 rounded-[2.5rem] border border-blue-100 flex items-center space-x-6">
        <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg"><ShieldCheckIcon /></div>
        <p className="text-sm font-medium">Exam PINs are delivered instantly. You can find them in your transaction history after purchase.</p>
      </div>
    </div>
  );
};

export default EducationPage;
