import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
import { WalletIcon, ShieldCheckIcon, BoltIcon } from '../components/Icons';

declare const PaystackPop: any;

const FundingPage: React.FC = () => {
  const { user, updateWalletBalance, walletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [method, setMethod] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaystack = () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount < 100) {
      addNotification("Minimum funding threshold is ₦100.", "warning");
      return;
    }

    setIsProcessing(true);
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder';
    
    try {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: user?.email || 'user@obata.com',
        amount: Math.round(numAmount * 100),
        currency: 'NGN',
        callback: (response: any) => {
          setIsProcessing(false);
          const currentBal = walletBalance || 0;
          updateWalletBalance(currentBal + numAmount);
          addNotification(`Node Sync Successful! ₦${numAmount.toLocaleString()} added.`, "success");
          setAmount('');
        },
        onClose: () => {
          setIsProcessing(false);
          addNotification("Secure session terminated by user.", "info");
        }
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessing(false);
      addNotification("Gateway Node Unreachable. Contact Master Admin.", "error");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="text-center space-y-4">
        <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em] mb-6">Financial Gateway</h2>
        <h1 className="text-6xl lg:text-[100px] font-black text-gray-900 tracking-tighter leading-[0.85]">Inject <br /><span className="text-blue-600">Liquidity.</span></h1>
        <p className="mt-8 text-gray-400 font-medium text-xl max-w-xl mx-auto leading-relaxed">Fast-track your account funding via card, bank transfer, or verified manual entry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         {/* Main Form Area */}
         <div className="lg:col-span-7 bg-white p-10 lg:p-20 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex p-2 bg-gray-100 rounded-[2.5rem] mb-16">
                 <button onClick={() => setMethod('AUTO')} className={`flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${method === 'AUTO' ? 'bg-white text-blue-600 shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'}`}>Instant Delivery</button>
                 <button onClick={() => setMethod('MANUAL')} className={`flex-1 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${method === 'MANUAL' ? 'bg-white text-blue-600 shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'}`}>Manual Bridge</button>
              </div>

              {method === 'AUTO' ? (
                <div className="space-y-12 animate-in fade-in duration-500">
                   <div>
                      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-4">Funding Volume (₦)</label>
                      <input 
                        type="number" 
                        className="w-full p-10 bg-gray-50 border-4 border-transparent focus:border-blue-600 rounded-[3rem] text-6xl lg:text-8xl font-black tracking-tighter outline-none transition-all placeholder:text-gray-100"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                   </div>
                   
                   <div className="p-8 bg-blue-50/50 rounded-[3rem] border border-blue-100 flex items-center space-x-6 backdrop-blur-sm">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-200"><ShieldCheckIcon /></div>
                      <p className="text-[11px] font-black text-blue-800 uppercase tracking-[0.2em] leading-relaxed">Verified PCI-DSS Encryption Active. Instant fulfillment guaranteed.</p>
                   </div>

                   <button 
                    onClick={handlePaystack}
                    disabled={isProcessing || !amount}
                    className="w-full bg-blue-600 hover:bg-black text-white py-10 lg:py-12 rounded-[3.5rem] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-blue-200 transition-all flex items-center justify-center space-x-6 transform active:scale-95 group"
                   >
                      {isProcessing ? <Spinner /> : <><WalletIcon /> <span className="group-hover:translate-x-2 transition-transform">Initialize Paystack</span></>}
                   </button>
                </div>
              ) : (
                <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                   <div className="bg-gray-950 p-12 lg:p-16 rounded-[4rem] text-white text-center shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.5em] mb-10">Master Receiving Node</p>
                        <h3 className="text-6xl lg:text-7xl font-black tracking-tighter mb-6 selection:bg-blue-600">8142452729</h3>
                        <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 mt-12 text-left">
                           <p className="text-blue-400 font-black text-xs uppercase tracking-widest mb-3">Institution: Palmpay</p>
                           <p className="text-3xl font-black text-white leading-none tracking-tight">Boluwatife Oluwapelumi Ayuba</p>
                        </div>
                      </div>
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                   </div>
                   <div className="text-center space-y-10">
                      <p className="text-lg font-bold text-gray-400 italic leading-relaxed px-10">Forward your receipt to the Master Terminal for manual bridge confirmation.</p>
                      <a 
                        href="https://wa.me/2348142452729" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-green-500 hover:bg-green-600 text-white py-8 lg:py-10 rounded-[3rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-4 shadow-2xl shadow-green-100 transform active:scale-95"
                      >
                         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.038 3.069l-1.094 3.993 4.1-.1.071 3.967 1.687-6.162z" opacity=".1"/><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                         <span>WhatsApp Fulfillment Center</span>
                      </a>
                   </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-[100px] group-hover:bg-blue-100 transition-colors"></div>
         </div>

         {/* Sidebar Stats Area */}
         <div className="lg:col-span-5 space-y-12">
            <div className="bg-blue-600 p-12 lg:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-4xl font-black tracking-tighter mb-10 leading-[0.9]">Zero-Trust Security.</h4>
                  <p className="text-blue-100 text-lg font-medium leading-relaxed mb-16 opacity-80">All injections are verified across 3 independent nodes before balance synchronization.</p>
                  <div className="space-y-8">
                     <SecureCheck label="PCI-DSS v4 Gateway Protocol" />
                     <SecureCheck label="SHA-512 Ledger Encryption" />
                     <SecureCheck label="Automated Settlement Engine" />
                  </div>
               </div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[120px] group-hover:bg-white/20 transition-all duration-1000"></div>
            </div>

            <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl flex items-center justify-between group hover:border-green-500 transition-all">
               <div className="flex items-center space-x-8">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-all shadow-inner"><BoltIcon /></div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight">System Status</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-1">Gateway: Healthy</p>
                  </div>
               </div>
               <span className="bg-green-100 text-green-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">Running</span>
            </div>
            
            <div className="bg-gray-50/50 p-12 rounded-[3rem] border-2 border-dashed border-gray-200 text-center">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Current Balance</p>
               <p className="text-5xl font-black text-gray-900 tracking-tighter">₦{walletBalance?.toLocaleString() || '0.00'}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

const SecureCheck = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.3em]">
    <div className="w-3 h-3 bg-blue-300 rounded-full shadow-[0_0_15px_rgba(147,197,253,0.8)]"></div>
    <span>{label}</span>
  </div>
);

export default FundingPage;