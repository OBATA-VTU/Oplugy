
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, ArrowIcon } from '../components/Icons';
import { DATA_NETWORKS, AIRTIME_NETWORKS } from '../constants';

const QuickPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [details, setDetails] = useState({ phone: '', network: '', amount: '', plan: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateCharges = (amount: number) => {
    if (!amount) return 0;
    if (amount < 2500) return amount * 0.02; // 2% charge
    return amount * 0.10; // 10% charge
  };

  const amountValue = parseFloat(details.amount || '0');
  const feeValue = calculateCharges(amountValue);
  const totalAmount = amountValue + feeValue;

  const handlePaystack = async () => {
    if (!details.phone || amountValue < 50) {
      alert("Please enter a valid phone number and amount (min ₦50)");
      return;
    }
    setIsProcessing(true);
    // Simulation of Paystack hand-off
    // In a real environment, you'd initialize with a backend secret or public key
    console.log("Initializing Paystack for amount:", totalAmount);
    
    // Create a unique reference
    const ref = 'GUEST_' + Math.random().toString(36).substring(7).toUpperCase();
    
    alert(`Redirecting to Paystack Secure Gateway...\n\nTransaction: ${service.toUpperCase()}\nTotal: ₦${totalAmount.toLocaleString()}\nReference: ${ref}`);
    
    // After 2 seconds, simulate success
    setTimeout(() => {
       alert("Success! Your payment was verified.\nTransaction is now processing with our provider.");
       navigate('/');
    }, 3000);
  };

  const networks = service === 'data' ? DATA_NETWORKS : AIRTIME_NETWORKS;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="p-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all flex items-center space-x-2">
              <ArrowIcon /><span className="rotate-180">Back</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
         <div className="w-full max-w-2xl bg-white rounded-[3rem] p-10 lg:p-16 shadow-2xl animate-in zoom-in-95">
            <div className="text-center mb-12">
               <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Quick Purchase</h2>
               <p className="text-gray-400 font-medium mt-2 text-lg">Instant digital utility for guests.</p>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-bottom-4">
                 <ServiceBtn icon={<PhoneIcon />} label="Airtime" active={service === 'airtime'} onClick={() => { setService('airtime'); setStep(2); }} />
                 <ServiceBtn icon={<SignalIcon />} label="Data" active={service === 'data'} onClick={() => { setService('data'); setStep(2); }} />
                 <ServiceBtn icon={<BoltIcon />} label="Power" active={service === 'power'} onClick={() => { setService('power'); setStep(2); }} />
                 <ServiceBtn icon={<TvIcon />} label="Cable TV" active={service === 'tv'} onClick={() => { setService('tv'); setStep(2); }} />
              </div>
            )}

            {step === 2 && (
               <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="col-span-1 md:col-span-2">
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Network/Provider</label>
                        <select 
                           className="w-full p-5 bg-gray-50 rounded-2xl font-black text-lg"
                           value={details.network}
                           onChange={(e) => setDetails({...details, network: e.target.value})}
                        >
                           <option value="">Select Provider</option>
                           {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Recipient Identity</label>
                        <input type="text" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xl tracking-tight" placeholder="Phone or Meter No" value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Purchase Amount (₦)</label>
                        <input type="number" className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xl tracking-tight" placeholder="0.00" value={details.amount} onChange={(e) => setDetails({...details, amount: e.target.value})} />
                     </div>
                  </div>
                  
                  <div className="bg-blue-50 p-8 rounded-3xl space-y-4">
                     <div className="flex justify-between font-bold text-sm text-gray-600"><span>Subtotal:</span><span>₦{amountValue.toLocaleString()}</span></div>
                     <div className="flex justify-between font-bold text-sm text-blue-600">
                        <span>Convenience Fee ({amountValue < 2500 ? '2%' : '10%'}):</span>
                        <span>₦{feeValue.toLocaleString()}</span>
                     </div>
                     <div className="h-px bg-blue-100"></div>
                     <div className="flex justify-between font-black text-2xl tracking-tighter text-gray-900">
                        <span>Total Payable:</span>
                        <span>₦{totalAmount.toLocaleString()}</span>
                     </div>
                     <p className="text-[10px] text-blue-400 italic">Funding for guests includes automated payment processing fees.</p>
                  </div>
                  
                  <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-50 transition-all hover:bg-gray-100">Back</button>
                     <button onClick={handlePaystack} className="flex-[2] py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100 transition-all hover:bg-black disabled:opacity-50" disabled={!details.amount || !details.phone || !details.network || isProcessing}>
                        {isProcessing ? <Spinner /> : 'Proceed to Paystack'}
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
     <div className="w-14 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all">{icon}</div>
     <span className="font-black text-[10px] uppercase tracking-widest text-gray-900">{label}</span>
  </button>
);

export default QuickPurchasePage;
