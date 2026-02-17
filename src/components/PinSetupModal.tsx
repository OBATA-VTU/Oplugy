
import React, { useState } from 'react';
import Spinner from './Spinner';
import { ShieldCheckIcon } from './Icons';

interface PinSetupModalProps {
  onSuccess: (pin: string) => Promise<void>;
}

const PinSetupModal: React.FC<PinSetupModalProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 5) {
      setError('PIN must be exactly 5 digits.');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }

    setLoading(true);
    try {
      await onSuccess(pin);
    } catch (err: any) {
      setError(err.message || 'Failed to save PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <ShieldCheckIcon />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Security Protocol</h2>
          <p className="text-gray-400 font-medium mt-3 text-sm">Configure your 5-digit Transaction PIN to authenticate all wallet operations.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center mb-8 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">New PIN</label>
              <input 
                type="password" 
                inputMode="numeric"
                maxLength={5}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl font-black tracking-[0.8em] focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all outline-none"
                placeholder="•••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Confirm PIN</label>
              <input 
                type="password" 
                inputMode="numeric"
                maxLength={5}
                className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl text-center text-2xl font-black tracking-[0.8em] focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all outline-none"
                placeholder="•••••"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || pin.length !== 5}
            className="w-full bg-blue-600 hover:bg-black text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-100 transition-all disabled:opacity-50"
          >
            {loading ? <Spinner /> : 'Secure My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PinSetupModal;
