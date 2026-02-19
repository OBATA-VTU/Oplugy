import React, { useState } from 'react';
import Spinner from './Spinner';
import { ShieldCheckIcon } from './Icons';
import { useAuth } from '../hooks/useAuth';

interface PinPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

const PinPromptModal: React.FC<PinPromptModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = "Enter PIN to Continue", 
  description = "Enter your 5-digit PIN to approve this payment." 
}) => {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (pin.length !== 5) {
      setError('Enter your 5-digit security PIN.');
      return;
    }

    setIsVerifying(true);
    // In production, PIN verification should be done via backend. 
    // Here we check against the user object for demo logic.
    if (user && user.transactionPin === pin) {
      setTimeout(() => {
        setIsVerifying(false);
        onSuccess();
        setPin('');
      }, 500);
    } else {
      setIsVerifying(false);
      setError('Incorrect Security PIN.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheckIcon />
           </div>
           <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{title}</h3>
           <p className="text-gray-400 text-xs font-medium mt-2">{description}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            inputMode="numeric"
            maxLength={5}
            autoFocus
            className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-3xl font-black tracking-[0.8em] focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all outline-none"
            placeholder="•••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />

          <div className="flex gap-4">
             <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
             <button 
              type="submit" 
              disabled={isVerifying || pin.length !== 5}
              className="flex-2 bg-blue-600 hover:bg-black text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 transition-all disabled:opacity-50"
             >
                {isVerifying ? <Spinner /> : 'Approve'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinPromptModal;