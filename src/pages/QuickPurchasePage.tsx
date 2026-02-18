
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, ArrowIcon } from '../components/Icons';

const QuickPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [service, setService] = useState('');
  const [details, setDetails] = useState({ phone: '', network: '', amount: '', plan: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateCharges = (amount: number) => {
    if (amount < 2500) return amount * 0.02; // 2% charge
    return amount * 0.10; // 10% charge
  };

  const totalAmount = parseFloat(details.amount || '0') + calculateCharges(parseFloat(details.amount || '0'));

  const handlePaystack = async () => {
    setIsProcessing(true);
    // In a production environment, you'd call a backend to initialize a Paystack transaction.
    // For this prototype, we simulate the redirect to the funding gateway.
    alert(`Redirecting to Paystack Gateway...\nAmount: ₦${totalAmount.toLocaleString()}\n(Fees included)`);
    // Simulated success redirect after 2s
    setTimeout(() => {
       alert("Simulated: Payment Confirmed. Transaction sent to Provider API.");
       navigate('/');
    }, 2000);
  };

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
               <p className="text-gray-400 font-medium mt-2">Buy digital services instantly without an account.</p>
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
                     <div className="flex justify-between font-bold text-sm"><span>Subtotal:</span><span>₦{parseFloat(details.amount || '0').toLocaleString()}</span></div>
                     <div className="flex justify-between font-bold text-sm text-blue-600"><span>Convenience Fee:</span><span>₦{calculateCharges(parseFloat(details.amount || '0')).toLocaleString()}</span></div>
                     <div className="h-px bg-blue-100"></div>
                     <div className="flex justify-between font-black text-xl tracking-tighter"><span>Total to Pay:</span><span>₦{totalAmount.toLocaleString()}</span></div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-50">Back</button>
                     <button onClick={handlePaystack} className="flex-[2] py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100" disabled={!details.amount || !details.phone || isProcessing}>
                        {isProcessing ? <Spinner /> : 'Pay with Paystack'}
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
