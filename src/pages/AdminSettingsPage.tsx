import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';

const AdminSettingsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [pricing, setPricing] = useState({ 
    user_margin: 10, 
    reseller_margin: 5, 
    api_margin: 2,
    server1: { data_margin: 10, cable_margin: 100, electricity_margin: 50 }
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getGlobalSettings();
    if (res.status && res.data) {
      setAnnouncement(res.data.announcement || '');
      if (res.data.pricing) setPricing(prev => ({ ...prev, ...res.data.pricing }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await adminService.updateGlobalSettings({ 
      announcement, 
      pricing
    });
    if (res.status) {
      addNotification("System node settings synchronized.", "success");
    } else {
      addNotification("Failed to save settings.", "error");
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Infrastructure</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Config</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Add-on Prices (₦)</h3>
               <div className="space-y-6">
                  <MarginInput label="Normal User Add-on" value={pricing.user_margin} onChange={(val: number) => setPricing({...pricing, user_margin: val})} />
                  <MarginInput label="Reseller Add-on" value={pricing.reseller_margin} onChange={(val: number) => setPricing({...pricing, reseller_margin: val})} />
                  <MarginInput label="API Merchant Add-on" value={pricing.api_margin} onChange={(val: number) => setPricing({...pricing, api_margin: val})} />
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 h-fit">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Notification Node</h3>
               <textarea className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl font-bold min-h-[100px] focus:ring-4 focus:ring-blue-50 transition-all outline-none" placeholder="Announcement..." value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
               <button onClick={handleUpdate} disabled={isUpdating} className="w-full mt-6 bg-blue-600 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center">
                  {isUpdating ? <Spinner /> : 'Synchronize Settings'}
               </button>
            </div>
         </div>

         <div className="space-y-10">
            <div className="bg-gray-900 p-10 rounded-[3rem] shadow-xl text-white">
               <h3 className="text-2xl font-black mb-8 tracking-tight">Provider Architecture</h3>
               <div className="space-y-12">
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active Node: INLOMAX</p>
                    <MarginInput dark label="Data Add-on" value={pricing.server1.data_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, data_margin: v}})} />
                    <MarginInput dark label="Cable Add-on" value={pricing.server1.cable_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, cable_margin: v}})} />
                    <MarginInput dark label="Electricity Add-on" value={pricing.server1.electricity_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, electricity_margin: v}})} />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

interface MarginInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  dark?: boolean;
}

const MarginInput = ({ label, value, onChange, dark }: MarginInputProps) => (
  <div className={`flex items-center justify-between p-4 rounded-2xl ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-transparent'}`}>
    <span className={`text-[10px] font-black uppercase tracking-widest ${dark ? 'text-white/60' : 'text-gray-500'}`}>{label}</span>
    <div className="flex items-center gap-2">
       <span className={dark ? 'text-white/40' : 'text-gray-300'}>₦</span>
       <input type="number" className={`w-24 p-3 rounded-xl text-center font-black outline-none transition-all ${dark ? 'bg-white/10 text-white border-white/20 focus:border-blue-500' : 'bg-white border-gray-100 text-gray-900 focus:border-blue-600'}`} value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} />
    </div>
  </div>
);

export default AdminSettingsPage;