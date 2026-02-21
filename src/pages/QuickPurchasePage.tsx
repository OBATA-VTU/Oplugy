import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import Footer from '../components/Footer';
import { PhoneIcon, SignalIcon, BoltIcon, TvIcon, ArrowIcon } from '../components/Icons';

declare const PaystackPop: any;

const QuickPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [step, setStep] = useState(1);
  const [service, setService] = useState<'airtime' | 'data' | 'power' | 'tv' | ''>('');
  const [details, setDetails] = useState({ 
    phone: '', 
    network: '', 
    amount: '', 
    plan: '', 
    meterType: 'prepaid',
    smartcard: '' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [networks, setNetworks] = useState<any[]>([]);
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (step === 2 && (service === 'data' || service === 'airtime')) {
      const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
          if (service === 'data' || service === 'airtime') {
            const res = await vtuService.getDataNetworks(1); // Server 1 ONLY
            if (res.status) setNetworks(res.data || []);
          }
        } catch (e) {
          addNotification("Failed to sync with fulfillment node.", "error");
        }
        setLoadingOptions(false);
      };
      fetchOptions();
    }
  }, [step, service, addNotification]);

  useEffect(() => {
    if (service === 'data' && details.network) {
      const fetchPlans = async () => {
        setLoadingOptions(true);
        try {
          const res = await vtuService.getDataPlans({ network: details.network, type: '', server: 1 });
          if (res.status) setDataPlans(res.data || []);
        } catch (e) {
          addNotification("Catalog sync failed.", "error");
        }
        setLoadingOptions(false);
      };
      fetchPlans();
    }
  }, [details.network, service, addNotification]);

  const calculateCharges = (amount: number) => {
    if (!amount || isNaN(amount)) return 0;
    return (amount * 0.02) + 20; 
  };

  const amountValue = parseFloat(details.amount || '0');
  const feeValue = calculateCharges(amountValue);
  const totalAmount = amountValue + feeValue;

  const handlePaystack = () => {
    if (!details.amount || (!details.phone && !details.smartcard)) {
      addNotification("Please fill in the receiver's details.", "warning");
      return;
    }
    
    setIsProcessing(true);
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      addNotification("Gateway config error.", "error");
      setIsProcessing(false);
      return;
    }

    const handler = PaystackPop.setup({
      key: publicKey,
      email: 'guest@obata.com',
      amount: Math.round(totalAmount * 100),
      currency: 'NGN',
      callback: (response: any) => {
        addNotification("Payment Successful! Sending your order now...", "success");
        setTimeout(() => {
          setIsProcessing(false);
          addNotification("Successful! Everything has been sent.", "success");
          navigate('/');
        }, 3000);
      },
      onClose: () => {
        setIsProcessing(false);
        addNotification("Payment cancelled.", "info");
      }
    });

    handler.openIframe();
  };

  const handleServiceSelect = (selected: 'airtime' | 'data' | 'power' | 'tv') => {
    setService(selected);
    setDetails({ phone: '', network: '', amount: '', plan: '', meterType: 'prepaid', smartcard: '' });
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-blue-100">
      <nav className="px-6 py-8 lg:px-12 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate(-1)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all flex items-center space-x-2">
              <span className="rotate-180"><ArrowIcon /></span>
              <span>Go Back</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6 lg:py-24">
         <div className="w-full max-w-3xl bg-white rounded-[4rem] p-10 lg:p-20 shadow-2xl animate-in zoom-in-95 duration-500 border border-gray-50">
            
            <div className="text-center mb-12">
               <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  {step === 1 ? 'Quick Buy' : `Buy ${service?.charAt(0).toUpperCase()}${service?.slice(1)}`}
               </h2>
               <p className="text-gray-500 font-medium mt-3 text-lg">Purchase services instantly without an account.</p>
            </div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-6 lg:gap-10 animate-in slide-in-from-bottom-6">
                 <ServiceBtn icon={<PhoneIcon />} label="Airtime" onClick={() => handleServiceSelect('airtime')} />
                 <ServiceBtn icon={<SignalIcon />} label="Data" onClick={() => handleServiceSelect('data')} />
                 <ServiceBtn icon={<BoltIcon />} label="Electricity" onClick={() => handleServiceSelect('power')} />
                 <ServiceBtn icon={<TvIcon />} label="Cable TV" onClick={() => handleServiceSelect('tv')} />
              </div>
            )}

            {step === 2 && (
               <div className="space-y-8 animate-in slide-in-from-bottom-6">
                  <div className="grid grid-cols-1 gap-6">
                     {(service === 'data' || service === 'airtime') && (
                       <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Select Network</label>
                          <div className="relative">
                            <select 
                               className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                               value={details.network}
                               onChange={(e) => setDetails({...details, network: e.target.value})}
                               disabled={loadingOptions}
                            >
                               <option value="">{loadingOptions ? 'Loading...' : 'Choose network'}</option>
                               {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                            </select>
                            {loadingOptions && <div className="absolute right-6 top-1/2 -translate-y-1/2"><Spinner /></div>}
                          </div>
                       </div>
                     )}

                     {service === 'power' && (
                       <div>
                          <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Account Type</label>
                          <select 
                             className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all"
                             value={details.meterType}
                             onChange={(e) => setDetails({...details, meterType: e.target.value as any})}
                          >
                             <option value="prepaid">Prepaid Meter</option>
                             <option value="postpaid">Postpaid Account</option>
                          </select>
                       </div>
                     )}

                     <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
                          {service === 'power' ? 'Meter Number' : service === 'tv' ? 'IUC / Smartcard' : 'Phone Number'}
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-xl outline-none focus:border-blue-600 transition-all tracking-tight" 
                          placeholder={service === 'tv' ? 'Enter smartcard number' : 'Enter phone number'} 
                          value={service === 'tv' ? details.smartcard : details.phone} 
                          onChange={(e) => setDetails({...details, [service === 'tv' ? 'smartcard' : 'phone']: e.target.value})} 
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {service === 'data' ? (
                        <div>
                           <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Select Data Plan</label>
                           <div className="relative">
                            <select 
                              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                              value={details.plan}
                              onChange={(e) => {
                                const [id, price] = e.target.value.split('|');
                                setDetails({...details, plan: id, amount: price});
                              }}
                              disabled={!details.network || loadingOptions}
                            >
                               <option value="">{loadingOptions ? 'Loading plans...' : 'Choose a plan'}</option>
                               {dataPlans.map(p => (
                                 <option key={p.id} value={`${p.id}|${p.amount}`}>{p.name} - ₦{p.amount}</option>
                               ))}
                            </select>
                            {loadingOptions && details.network && <div className="absolute right-6 top-1/2 -translate-y-1/2"><Spinner /></div>}
                           </div>
                        </div>
                     ) : (
                        <div>
                           <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Amount (₦)</label>
                           <input type="number" className="w-full p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl font-bold text-2xl outline-none focus:border-blue-600 transition-all tracking-tight" placeholder="0.00" value={details.amount} onChange={(e) => setDetails({...details, amount: e.target.value})} />
                        </div>
                     )}
                  </div>
                  
                  <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                     <div className="relative z-10 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-white/40 font-bold uppercase tracking-wider">Fee</span>
                           <span className="font-bold tracking-tight text-white">₦{feeValue.toFixed(2)}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                           <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Total</p>
                           <div className="text-right">
                              <p className="text-4xl font-black tracking-tight text-white">₦{totalAmount.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                     <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px]"></div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button onClick={() => {setStep(1); setService('');}} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                     <button 
                        onClick={handlePaystack} 
                        className="flex-[2] py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-100 flex items-center justify-center space-x-3 transition-all hover:bg-gray-900 transform active:scale-95" 
                        disabled={isProcessing || !details.amount}
                     >
                        {isProcessing ? <Spinner /> : <><ShieldCheckIcon /> <span>Pay Now</span></>}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </main>
      <Footer />
    </div>
  );
};

const ServiceBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="p-8 bg-gray-50 border-2 border-transparent rounded-3xl flex flex-col items-center gap-4 hover:border-blue-600 hover:bg-white transition-all group hover:shadow-xl transform active:scale-95">
     <div className="w-14 h-14 bg-white text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all text-xl transform group-hover:scale-110">
        {icon}
     </div>
     <span className="font-bold text-[11px] uppercase tracking-wider text-gray-900">{label}</span>
  </button>
);

export default QuickPurchasePage;
