import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import Spinner from '../components/Spinner';
import { Calendar, Clock, ShieldCheck, Smartphone, Wifi, Zap, Tv } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SchedulePurchasePage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { user, walletBalance } = useAuth();
  
  const [service, setService] = useState<'airtime' | 'data' | 'power' | 'tv'>('airtime');
  const [details, setDetails] = useState({
    network: '',
    type: '',
    planId: '',
    recipient: '',
    amount: '',
    date: '',
    time: ''
  });

  const [networks, setNetworks] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [dataPlans, setDataPlans] = useState<DataPlan[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNetworks = useCallback(async () => {
    setLoading(true);
    const res = await vtuService.getDataNetworks(1);
    if (res.status) setNetworks(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNetworks();
  }, [fetchNetworks]);

  useEffect(() => {
    if (service === 'data' && details.network) {
      const fetchCats = async () => {
        const res = await vtuService.getDataCategories(details.network, 1);
        if (res.status) setDataTypes(res.data || []);
      };
      fetchCats();
    }
  }, [details.network, service]);

  useEffect(() => {
    if (service === 'data' && details.network && (details.type || dataTypes.length === 0)) {
      const fetchPlans = async () => {
        const res = await vtuService.getDataPlans({ network: details.network, type: details.type, server: 1 });
        if (res.status) setDataPlans(res.data || []);
      };
      fetchPlans();
    }
  }, [details.network, details.type, service, dataTypes.length]);

  const handleSchedule = async () => {
    if (!user) return;
    if (!details.recipient || !details.date || !details.time || !details.amount) {
      addNotification("Please fill all required fields.", "warning");
      return;
    }

    const scheduledTime = new Date(`${details.date}T${details.time}`);
    if (scheduledTime <= new Date()) {
      addNotification("Scheduled time must be in the future.", "error");
      return;
    }

    setIsScheduling(true);
    try {
      await addDoc(collection(db, "scheduled_transactions"), {
        userId: user.uid,
        userEmail: user.email,
        service,
        ...details,
        amount: Number(details.amount),
        scheduledTime,
        status: 'PENDING',
        createdAt: serverTimestamp()
      });
      addNotification("Transaction scheduled successfully!", "success");
      setDetails({ network: '', type: '', planId: '', recipient: '', amount: '', date: '', time: '' });
    } catch (e) {
      addNotification("Failed to schedule transaction.", "error");
    }
    setIsScheduling(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.4em]">Automation</h2>
        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none">Schedule <br /><span className="text-blue-600">Purchase.</span></h1>
        <p className="text-gray-500 font-medium text-lg max-w-xl mx-auto">Set it and forget it. Automate your bills and recharges for any future date.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 space-y-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">1. Select Service</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { id: 'airtime', icon: <Smartphone />, label: 'Airtime', color: 'blue' },
                { id: 'data', icon: <Wifi />, label: 'Data', color: 'purple' },
                { id: 'power', icon: <Zap />, label: 'Power', color: 'orange' },
                { id: 'tv', icon: <Tv />, label: 'Cable', color: 'pink' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setService(s.id as any)}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                    service === s.id ? "border-blue-600 bg-blue-50" : "border-gray-50 bg-gray-50 hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 shadow-sm",
                    service === s.id ? "bg-white text-blue-600" : "bg-white text-gray-400"
                  )}>
                    {s.icon}
                  </div>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", service === s.id ? "text-blue-600" : "text-gray-400")}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">2. Network / Provider</label>
                <select 
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg border-2 border-transparent focus:border-blue-600 outline-none transition-all appearance-none"
                  value={details.network}
                  onChange={(e) => setDetails({...details, network: e.target.value})}
                >
                  <option value="">Choose Provider</option>
                  {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">3. Recipient Details</label>
                <input 
                  type="text" 
                  className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-xl outline-none focus:border-blue-600 focus:bg-white transition-all tracking-tight" 
                  placeholder={service === 'tv' ? 'IUC Number' : service === 'power' ? 'Meter Number' : 'Phone Number'}
                  value={details.recipient}
                  onChange={(e) => setDetails({...details, recipient: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">4. Amount (₦)</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">5. Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="date" 
                      className="w-full p-5 pl-14 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                      value={details.date}
                      onChange={(e) => setDetails({...details, date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-2">6. Time</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="time" 
                      className="w-full p-5 pl-14 bg-gray-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:border-blue-600 focus:bg-white transition-all"
                      value={details.time}
                      onChange={(e) => setDetails({...details, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSchedule}
            disabled={isScheduling}
            className="w-full py-6 bg-blue-600 hover:bg-gray-900 text-white rounded-[2rem] font-bold uppercase tracking-[0.2em] text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-3 transform active:scale-95 disabled:opacity-50"
          >
            {isScheduling ? <Spinner /> : <><ShieldCheck className="w-5 h-5" /> <span>Schedule Transaction</span></>}
          </button>
        </div>
      </div>

      <div className="p-10 bg-gray-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 flex items-center space-x-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
              <Clock className="w-8 h-8" />
            </div>
            <div>
               <h4 className="text-2xl font-bold tracking-tight">Precision Automation</h4>
               <p className="text-white/50 font-medium mt-2">Scheduled transactions are executed exactly at the specified time. Ensure you have sufficient balance in your wallet at the time of execution.</p>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default SchedulePurchasePage;
