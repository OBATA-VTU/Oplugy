import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Wallet, CreditCard, Landmark, Copy, Zap, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

declare const PaystackPop: any;

const FundingPage: React.FC = () => {
  const { user, fetchWalletBalance, walletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundingMethod, setFundingMethod] = useState<'AUTO' | 'MANUAL'>('AUTO');

  const numAmount = parseFloat(amount) || 0;
  const serviceFee = numAmount * 0.02; // 2% service fee
  const totalCharge = numAmount + serviceFee;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification(`${label} copied to clipboard`, 'success');
  };

  const handlePaystack = () => {
    if (!amount || isNaN(numAmount) || numAmount < 100) {
      addNotification("Minimum funding amount is ₦100.", "warning");
      return;
    }

    setIsProcessing(true);
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      addNotification("Payment configuration missing. Contact admin.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: user?.email || 'user@obata.com',
        amount: Math.round(totalCharge * 100),
        currency: 'NGN',
        callback: async (response: any) => {
          addNotification('Payment successful! Syncing wallet...', 'success');
          await fetchWalletBalance();
          setAmount('');
          setIsProcessing(false);
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessing(false);
      addNotification("Payment service error. Please try again.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Wallet className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Fund Wallet</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Add liquidity to your account via automated or manual channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-gray-50 space-y-10">
            <div className="flex p-2 bg-gray-50 rounded-[2rem] border-2 border-transparent">
              <button 
                onClick={() => setFundingMethod('AUTO')} 
                className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 ${fundingMethod === 'AUTO' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
              >
                <Zap className="w-4 h-4" />
                <span>Automated</span>
              </button>
              <button 
                onClick={() => setFundingMethod('MANUAL')} 
                className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center space-x-2 ${fundingMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400'}`}
              >
                <Landmark className="w-4 h-4" />
                <span>Manual</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {fundingMethod === 'AUTO' ? (
                <motion.div 
                  key="auto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Deposit Amount (₦)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="w-full p-10 bg-gray-50 border-4 border-transparent rounded-[2.5rem] text-5xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all text-center placeholder:text-gray-200" 
                        placeholder="0.00" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                      />
                      <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl">₦</div>
                    </div>
                  </div>

                  {numAmount >= 100 && (
                    <div className="bg-gray-50 p-6 rounded-2xl space-y-3 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Amount</span>
                        <span className="font-black text-gray-900">₦{numAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fee (2%)</span>
                        <span className="font-black text-red-500">₦{serviceFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Total Charge</span>
                        <span className="font-black text-blue-600 text-2xl tracking-tight">₦{totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handlePaystack}
                    disabled={isProcessing || !amount || parseFloat(amount) < 100}
                    className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-4"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Initialize Payment</span>
                  </button>

                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    <p className="text-[11px] font-medium text-blue-800 leading-relaxed">Automated funding via Paystack attracts a 2% processing fee. Funds are credited instantly upon successful transaction.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bank Name</p>
                        <p className="text-xl font-black tracking-tight">Palmpay</p>
                      </div>
                      <Landmark className="text-blue-500 w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Number</p>
                      <div className="flex items-center justify-between">
                        <p className="text-4xl font-black tracking-tighter">8142452729</p>
                        <button onClick={() => handleCopy('8142452729', 'Account Number')} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Name</p>
                      <p className="text-lg font-bold tracking-tight">Boluwatife Oluwapelumi Ayuba</p>
                    </div>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start space-x-4">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-amber-900 uppercase tracking-widest">Manual Funding Notice</p>
                      <p className="text-[11px] font-medium text-amber-800 leading-relaxed">After transfer, send proof of payment to our WhatsApp support. Manual funding is processed within 5-30 minutes.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-gray-50 p-10 rounded-[3.5rem] border border-gray-100 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Virtual Accounts</h3>
              <div className="px-4 py-2 bg-green-100 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</div>
            </div>
            
            <p className="text-gray-400 font-medium text-sm">Transfer to any of these accounts to fund your wallet instantly. No manual verification needed.</p>

            <div className="space-y-4">
              {[
                { bank: 'Wema Bank', acc: '8234567890', name: 'INLOMAX - ' + (user?.full_name || 'User') },
                { bank: 'Moniepoint', acc: '5123456789', name: 'INLOMAX - ' + (user?.full_name || 'User') },
                { bank: 'Sterling Bank', acc: '0012345678', name: 'INLOMAX - ' + (user?.full_name || 'User') }
              ].map((acc, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-100/50 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{acc.bank}</p>
                    <p className="text-xl font-black text-gray-900 tracking-tighter">{acc.acc}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{acc.name}</p>
                  </div>
                  <button onClick={() => handleCopy(acc.acc, acc.bank)} className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 bg-blue-600 rounded-[3rem] text-white flex items-center space-x-8 shadow-2xl shadow-blue-200">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black tracking-tight">Secure Protocol</h4>
              <p className="text-white/60 text-xs font-medium leading-relaxed">All transactions are encrypted with 256-bit SSL security. Your financial data is never stored on our servers.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingPage;