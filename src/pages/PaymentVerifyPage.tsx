
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

const PaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchWalletBalance } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('error');
        return;
      }

      try {
        // We wait a bit for the webhook to potentially process
        await new Promise(resolve => setTimeout(resolve, 3000));
        await fetchWalletBalance();
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    verify();
  }, [reference, fetchWalletBalance]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-gray-50 text-center space-y-8"
      >
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Verifying Payment...</h2>
            <p className="text-gray-400 font-medium">Please wait while we confirm your transaction with Paystack.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Payment Successful!</h2>
            <p className="text-gray-400 font-medium">Your wallet has been funded successfully. Reference: <span className="text-gray-900 font-bold">{reference}</span></p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-black transition-all flex items-center justify-center space-x-3"
            >
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner">
                <XCircle className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Verification Failed</h2>
            <p className="text-gray-400 font-medium">We couldn't verify your payment. If you were debited, please contact support.</p>
            <button 
              onClick={() => navigate('/funding')}
              className="w-full py-6 bg-gray-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentVerifyPage;
