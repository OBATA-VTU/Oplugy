import React, { useState } from 'react';
import { Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Spinner from './Spinner';

interface PhoneSetupModalProps {
  onSuccess: (phone: string) => Promise<void>;
}

const PhoneSetupModal: React.FC<PhoneSetupModalProps> = ({ onSuccess }) => {
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11) {
      setError('Please enter a valid phone number.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await onSuccess(phone);
    } catch (err: any) {
      setError(err.message || 'Failed to save phone number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-xl animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[3.5rem] p-10 lg:p-12 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center space-y-6 relative z-10">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Smartphone className="w-10 h-10" />
          </div>
          <h3 className="text-3xl font-black text-gray-900 tracking-tighter leading-none">WhatsApp <br />Verification.</h3>
          <p className="text-gray-400 font-medium text-lg leading-relaxed">To use our WhatsApp Bot and secure your account, please provide your WhatsApp phone number.</p>
          
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-left">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Phone Number</label>
              <input 
                type="tel" 
                required
                className="w-full py-5 px-8 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl tracking-tighter focus:bg-white focus:border-green-500 transition-all outline-none"
                placeholder="08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || phone.length < 11}
              className="w-full py-6 bg-green-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-green-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-4"
            >
              {isSubmitting ? <Spinner /> : <><CheckCircle2 className="w-5 h-5" /> <span>Save & Continue</span></>}
            </button>
          </form>
        </div>
        
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-50"></div>
      </motion.div>
    </div>
  );
};

export default PhoneSetupModal;
