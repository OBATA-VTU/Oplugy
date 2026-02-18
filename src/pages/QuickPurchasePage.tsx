
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, ArrowIcon, ShieldCheckIcon } from '../components/Icons';
import { DATA_NETWORKS, AIRTIME_NETWORKS } from '../constants';

const QuickPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [details, setDetails] = useState({ phone: '', network: '', amount: '', plan: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateCharges = (amount: number) => {
    if (!amount || isNaN(amount)) return 0;
    if (amount < 2500) return amount * 0.02; // 2% charge
    return amount * 0.10; // 10% charge
  };

  const amountValue = parseFloat(details.amount || '0');
  const feeValue = calculateCharges(amountValue);
  const totalAmount = amountValue + feeValue;

  const handlePaystack = () => {
    if (!details.phone || amountValue < 100) {
      alert("Minimum purchase amount for guest mode is ₦100");
      return;
    }
    
    setIsProcessing(true);
    
    // In production, you would call window.PaystackPop.setup({...})
    // For this environment, we simulate the secure hand-off
    const reference = 'OBATA_GST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    console.log(`[PAYSTACK] Initiating transaction: ${reference} for ${totalAmount}`);
    
    setTimeout(() => {
       alert(`[PAYSTACK SIMULATION]\nTotal to Pay: ₦${totalAmount.toLocaleString()}\nReference: ${reference}\n\nProceeding to verify payment...`);
       setTimeout(() => {
          setIsProcessing(false);
          alert("Success! Payment verified. Your service is being delivered.");
          navigate('/');
       }, 2000);
    }, 1500);
  };

  const networks = service === 'data' ? DATA_NETWORKS : AIRTIME_NETWORKS;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="p-8 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all flex items-center space-x-2 group">
              <ArrowIcon /><span className="rotate-180 group-hover:-translate-x-1 transition-transform">Back to Home</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 lg:py-20">
         <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl animate-in zoom-in-95 duration-500">
            
            {/* PROGRESS TRACKER */}
            <div className="flex items-center justify-between mb-16 px-10">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= i ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                       {i}
                    </div>
                    {i < 3 && <div className={`w-20 h-1 mx-2 rounded-full ${step > i ? 'bg-blue-600' : 'bg-gray-100'}`}></div>}
                 </div>
               ))}
            </div>

            <div className="text-center mb-12">
               <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                  {step === 1 ? 'Select Service' : step === 2 ? 'Transaction Details' : 'Verify & Pay'}
               </h2>
               <p className="text-gray-400 font-medium mt-2 text-lg italic">The express gateway for non-members.</p>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                 <ServiceBtn icon={<PhoneIcon />} label="Airtime" onClick={() => { setService('airtime'); setStep(2); }} />
                 <ServiceBtn icon={<SignalIcon />} label="Data" onClick={() => { setService('data'); setStep(2); }} />
                 <ServiceBtn icon={<BoltIcon />} label="Power" onClick={() => { setService('power'); setStep(2); }} />
                 <ServiceBtn icon={<TvIcon />} label="Cable TV" onClick={() => { setService('tv'); setStep(2); }} />
              </div>
            )}

            {step === 2 && (
               <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="space-y-6">
                     <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Choose Network/Provider</label>
                        <select 
                           className="w-full p-6 bg-gray-50 rounded-3xl font-black text-xl border-2 border-transparent focus:border-blue-600 outline-none appearance-none"
                           value={details.network}
                           onChange={(e) => setDetails({...details, network: e.target.value})}
                        >
                           <option value="">Select Operator</option>
                           {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Identity (Phone/Meter)</label>
                           <input type="text" className="w-full p-6 bg-gray-50 rounded-3xl font-black text-xl outline-none focus:ring-4 focus:ring-blue-50" placeholder="0812345..." value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Amount (₦)</label>
                           <input type="number" className="w-full p-6 bg-gray-50 rounded-3xl font-black text-xl outline-none focus:ring-4 focus:ring-blue-50" placeholder="0.00" value={details.amount} onChange={(e) => setDetails({...details, amount: e.target.value})} />
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="flex-1 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-50">Change Service</button>
                     <button onClick={() => setStep(3)} className="flex-[2] py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100 disabled:opacity-50" disabled={!details.amount || !details.phone || !details.network}>Review & Pay</button>
                  </div>
               </div>
            )}

            {step === 3 && (
               <div className="space-y-10 animate-in slide-in-from-bottom-4">
                  <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-6">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Transaction Subtotal</p>
                           <p className="text-3xl font-black tracking-tighter">₦{amountValue.toLocaleString()}</p>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between text-sm">
                              <span className="text-white/40">Gateway Charge ({amountValue < 2500 ? '2%' : '10%'})</span>
                              <span className="font-bold text-blue-400">+₦{feeValue.toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between text-sm">
                              <span className="text-white/40">Network Provider</span>
                              <span className="font-bold uppercase">{details.network}</span>
                           </div>
                        </div>
                        <div className="pt-6 border-t border-white/20 flex justify-between items-center">
                           <p className="text-xs font-black uppercase tracking-widest">Total Payable</p>
                           <p className="text-5xl font-black tracking-tighter text-blue-400">₦{totalAmount.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
                  </div>

                  <div className="flex items-center space-x-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                     <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
                        <ShieldCheckIcon />
                     </div>
                     <p className="text-xs font-bold text-blue-800 leading-relaxed uppercase tracking-widest">Secured by Paystack Standard Encryption. Your financial data is never stored locally.</p>
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setStep(2)} className="flex-1 py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-50">Modify Details</button>
                     <button onClick={handlePaystack} className="flex-[2] py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100 flex items-center justify-center space-x-3" disabled={isProcessing}>
                        {isProcessing ? <Spinner /> : (
                          <>
                             <span>Proceed to Paystack</span>
                             <ArrowIcon />
                          </>
                        )}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </main>
    </div>
  );
};

const ServiceBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="p-10 bg-gray-50 border-2 border-transparent rounded-[3rem] flex flex-col items-center gap-6 hover:border-blue-600 hover:bg-white transition-all group hover:shadow-2xl hover:-translate-y-2">
     <div className="w-20 h-20 bg-white text-gray-400 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all text-3xl">{icon}</div>
     <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-900">{label}</span>
  </button>
);

export default QuickPurchasePage;
