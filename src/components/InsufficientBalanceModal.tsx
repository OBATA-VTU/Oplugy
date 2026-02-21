import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, CreditCard, ArrowRight } from 'lucide-react';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredAmount: number;
  currentBalance: number;
  onPayRemaining: () => void;
}

const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  isOpen,
  onClose,
  requiredAmount,
  currentBalance,
  onPayRemaining
}) => {
  const remaining = requiredAmount - currentBalance;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-6">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Insufficient Funds</h3>
                <p className="text-gray-500 font-medium">Your balance is too low for this transaction.</p>
              </div>

              <div className="bg-gray-50 p-8 rounded-[2rem] space-y-4 border border-gray-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Required</span>
                  <span className="font-black text-gray-900">₦{requiredAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Available</span>
                  <span className="font-black text-gray-900">₦{currentBalance.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Remaining</span>
                  <span className="font-black text-blue-600 text-2xl tracking-tighter">₦{remaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={onPayRemaining}
                  className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-100"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Remaining ₦{remaining.toLocaleString()}</span>
                </button>
                <button 
                  onClick={onClose}
                  className="w-full py-6 bg-gray-100 text-gray-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InsufficientBalanceModal;
