import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  Wifi, 
  Zap, 
  Tv, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Smartphone
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import Footer from '../components/Footer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
          const res = await vtuService.getDataNetworks(1); // Server 1 ONLY
          if (res.status) setNetworks(res.data || []);
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

  const serviceLabels = {
    airtime: 'Airtime',
    data: 'Mobile Data',
    power: 'Electricity',
    tv: 'Cable TV'
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-blue-100">
      <nav className="px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button 
            onClick={() => step === 1 ? navigate('/') : setStep(1)} 
            className="group flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all"
           >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>{step === 1 ? 'Home' : 'Back'}</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-12">
         <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[0.9]"
                >
                  {step === 1 ? (
                    <>Quick <br /><span className="text-blue-600">Purchase.</span></>
                  ) : (
                    <>{serviceLabels[service as keyof typeof serviceLabels]} <br /><span className="text-blue-600">Top-up.</span></>
                  )}
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-gray-500 text-lg font-medium max-w-md"
                >
                  No account? No problem. Buy what you need in seconds with our express checkout.
                </motion.p>
              </div>

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <ServiceCard 
                      icon={<Phone className="w-6 h-6" />} 
                      title="Airtime" 
                      description="Recharge any network"
                      onClick={() => handleServiceSelect('airtime')} 
                      color="blue"
                    />
                    <ServiceCard 
                      icon={<Wifi className="w-6 h-6" />} 
                      title="Data" 
                      description="Cheap data bundles"
                      onClick={() => handleServiceSelect('data')} 
                      color="purple"
                    />
                    <ServiceCard 
                      icon={<Zap className="w-6 h-6" />} 
                      title="Electricity" 
                      description="Pay utility bills"
                      onClick={() => handleServiceSelect('power')} 
                      color="orange"
                    />
                    <ServiceCard 
                      icon={<Tv className="w-6 h-6" />} 
                      title="Cable TV" 
                      description="DStv, GOtv & more"
                      onClick={() => handleServiceSelect('tv')} 
                      color="pink"
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl border border-gray-50 space-y-8"
                  >
                    <div className="space-y-6">
                      {(service === 'data' || service === 'airtime') && (
                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">Select Network</label>
                          <div className="grid grid-cols-4 gap-3">
                            {networks.map(n => (
                              <button
                                key={n.id}
                                onClick={() => setDetails({...details, network: n.id})}
                                className={cn(
                                  "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                  details.network === n.id 
                                    ? "border-blue-600 bg-blue-50" 
                                    : "border-gray-50 bg-gray-50 hover:border-gray-200"
                                )}
                              >
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                  <Smartphone className={cn("w-5 h-5", details.network === n.id ? "text-blue-600" : "text-gray-400")} />
                                </div>
                                <span className={cn("text-[10px] font-bold uppercase", details.network === n.id ? "text-blue-600" : "text-gray-400")}>{n.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {service === 'power' && (
                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">Meter Type</label>
                          <div className="flex p-1.5 bg-gray-50 rounded-2xl">
                            <button 
                              onClick={() => setDetails({...details, meterType: 'prepaid'})}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                                details.meterType === 'prepaid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                              )}
                            >
                              Prepaid
                            </button>
                            <button 
                              onClick={() => setDetails({...details, meterType: 'postpaid'})}
                              className={cn(
                                "flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
                                details.meterType === 'postpaid' ? "bg-white text-blue-600 shadow-sm" : "text-gray-400"
                              )}
                            >
                              Postpaid
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">
                          {service === 'power' ? 'Meter Number' : service === 'tv' ? 'IUC / Smartcard' : 'Phone Number'}
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                          placeholder={service === 'tv' ? 'Enter smartcard number' : 'Enter phone number'} 
                          value={service === 'tv' ? details.smartcard : details.phone} 
                          onChange={(e) => setDetails({...details, [service === 'tv' ? 'smartcard' : 'phone']: e.target.value})} 
                        />
                      </div>

                      {service === 'data' ? (
                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">Select Plan</label>
                          <div className="relative">
                            <select 
                              className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none appearance-none transition-all disabled:opacity-50"
                              value={details.plan ? `${details.plan}|${details.amount}` : ''}
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
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronRight className="w-5 h-5 rotate-90" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-2">Amount (₦)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₦</span>
                            <input 
                              type="number" 
                              className="w-full p-5 pl-12 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-2xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                              placeholder="0.00" 
                              value={details.amount} 
                              onChange={(e) => setDetails({...details, amount: e.target.value})} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Summary & Payment */}
            <div className="lg:col-span-5">
              <div className="sticky top-32 space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-xl border border-gray-50 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                      <span className="text-sm font-medium text-gray-400">Service</span>
                      <span className="text-sm font-bold text-gray-900 capitalize">{service || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                      <span className="text-sm font-medium text-gray-400">Recipient</span>
                      <span className="text-sm font-bold text-gray-900">{details.phone || details.smartcard || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                      <span className="text-sm font-medium text-gray-400">Subtotal</span>
                      <span className="text-sm font-bold text-gray-900">₦{amountValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-gray-50">
                      <span className="text-sm font-medium text-gray-400">Service Fee</span>
                      <span className="text-sm font-bold text-gray-900">₦{feeValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-black text-blue-600 tracking-tight">₦{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePaystack} 
                    disabled={isProcessing || !details.amount || step === 1}
                    className={cn(
                      "w-full py-6 rounded-2xl font-bold text-sm uppercase tracking-widest text-white transition-all flex items-center justify-center space-x-3 transform active:scale-95 disabled:opacity-50",
                      step === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-gray-900 shadow-xl shadow-blue-100"
                    )}
                  >
                    {isProcessing ? <Spinner /> : <><ShieldCheck className="w-5 h-5" /> <span>Pay Now</span></>}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span>Secured by Paystack</span>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                      <BoltIcon />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg leading-none">Instant Delivery</h4>
                      <p className="text-blue-100 text-xs mt-1 opacity-80">Processed in under 2 seconds.</p>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-[40px]"></div>
                </div>
              </div>
            </div>

         </div>
      </main>
      <Footer />
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: 'blue' | 'purple' | 'orange' | 'pink';
}

const ServiceCard = ({ icon, title, description, onClick, color }: ServiceCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:border-blue-200',
    purple: 'bg-purple-50 text-purple-600 hover:border-purple-200',
    orange: 'bg-orange-50 text-orange-600 hover:border-orange-200',
    pink: 'bg-pink-50 text-pink-600 hover:border-pink-200'
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-8 rounded-[2.5rem] border-2 border-transparent transition-all text-left flex flex-col gap-6 group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1",
        colors[color]
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
        color === 'blue' ? 'bg-blue-100' : color === 'purple' ? 'bg-purple-100' : color === 'orange' ? 'bg-orange-100' : 'bg-pink-100'
      )}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm font-medium text-gray-400 mt-1">{description}</p>
      </div>
      <div className="mt-auto flex justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

const BoltIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default QuickPurchasePage;
