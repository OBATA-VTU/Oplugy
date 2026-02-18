import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, ShieldCheckIcon } from '../components/Icons';
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
    
    // Check for Paystack public key
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    if (!publicKey) {
       console.warn("Paystack Public Key not found in Environment Variables.");
    }

    const reference = 'OBATA_GST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    // Simulate real-time interaction
    setTimeout(() => {
       alert(`[GATEWAY OPENED]\nTotal: ₦${totalAmount.toLocaleString()}\nRef: ${reference}\n\nOnce you pay on the actual popup (integrated with Vercel variables), the service will deliver instantly.`);
       setIsProcessing(false);
       navigate('/');
    }, 2000);
  };

  const networks = service === 'data' ? DATA_NETWORKS : AIRTIME_NETWORKS;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <nav className="p-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all">Back</button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 lg:py-10">
         <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl animate-in zoom-in-95">
            
            <div className="text-center mb-12">
               <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                  {step === 1 ? 'Select Service' : 'Details & Payment'}
               </h2>
               <p className="text-gray-400 font-medium mt-2">No account needed. Just pay and receive.</p>
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
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Operator</label>
                        <select 
                           className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg border-2 border-transparent focus:border-blue-600 outline-none"
                           value={details.network}
                           onChange={(e) => setDetails({...details, network: e.target.value})}
                        >
                           <option value="">Select Provider</option>
                           {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Identifier (Phone/Meter)</label>
                           <input type="text" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xl outline-none" placeholder="0812345..." value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Amount (₦)</label>
                           <input type="number" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xl outline-none" placeholder="0.00" value={details.amount} onChange={(e) => setDetails({...details, amount: e.target.value})} />
                        </div>
                     </div>
                  </div>
                  
                  <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden">
                     <div className="relative z-10 space-y-4">
                        <div className="flex justify-between text-sm">
                           <span className="text-white/40">Convenience Fee ({amountValue < 2500 ? '2%' : '10%'})</span>
                           <span className="font-bold">+₦{feeValue.toLocaleString()}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                           <p className="text-xs font-black uppercase tracking-widest">Total Payable</p>
                           <p className="text-4xl font-black tracking-tighter text-blue-400">₦{totalAmount.toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                     <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
                        <ShieldCheckIcon />
                     </div>
                     <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest">Secured by Paystack. No login required.</p>
                  </div>

                  <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50">Back</button>
                     <button onClick={handlePaystack} className="flex-[2] py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100 flex items-center justify-center space-x-3" disabled={isProcessing || !details.amount || !details.phone}>
                        {isProcessing ? <Spinner /> : <span>Proceed to Paystack</span>}
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
  <button onClick={onClick} className="p-8 bg-gray-50 border-2 border-transparent rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-blue-600 hover:bg-white transition-all group">
     <div className="w-16 h-16 bg-white text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all text-2xl">{icon}</div>
     <span className="font-black text-[10px] uppercase tracking-widest text-gray-900">{label}</span>
  </button>
);

export default QuickPurchasePage;