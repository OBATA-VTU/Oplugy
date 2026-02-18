
import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';

interface MarginInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const AdminSettingsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [apiMode, setApiMode] = useState<'LIVE' | 'TEST'>('LIVE');
  const [pricing, setPricing] = useState({ user_margin: 10, reseller_margin: 5, api_margin: 2 });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getGlobalSettings();
    if (res.status && res.data) {
      setAnnouncement(res.data.announcement || '');
      setMaintenance(res.data.maintenance || false);
      setApiMode(res.data.apiMode || 'LIVE');
      if (res.data.pricing) setPricing(res.data.pricing);
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
      maintenance, 
      apiMode,
      pricing
    });
    if (res.status) {
      addNotification("System node settings updated.", "success");
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
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Global Config</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="space-y-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">System Controls</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                     <div>
                        <p className="font-black text-gray-900 tracking-tight">Maintenance Mode</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Lock</p>
                     </div>
                     <button 
                       onClick={() => setMaintenance(!maintenance)}
                       className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${maintenance ? 'bg-red-500' : 'bg-gray-300'}`}
                     >
                       <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${maintenance ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                     <div>
                        <p className="font-black text-gray-900 tracking-tight">API Gateway Mode</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Environment Path</p>
                     </div>
                     <div className="flex p-1 bg-white rounded-xl">
                        <button onClick={() => setApiMode('TEST')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${apiMode === 'TEST' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>Test</button>
                        <button onClick={() => setApiMode('LIVE')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${apiMode === 'LIVE' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}>Live</button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Tier Margins (₦)</h3>
               <p className="text-gray-400 text-xs font-medium mb-8">Profit added automatically to every transaction based on account level.</p>
               <div className="space-y-6">
                  <MarginInput label="Standard User Profit" value={pricing.user_margin} onChange={(val: number) => setPricing({...pricing, user_margin: val})} />
                  <MarginInput label="Reseller Profit" value={pricing.reseller_margin} onChange={(val: number) => setPricing({...pricing, reseller_margin: val})} />
                  <MarginInput label="API Merchant Profit" value={pricing.api_margin} onChange={(val: number) => setPricing({...pricing, api_margin: val})} />
               </div>
            </div>
         </div>

         <div className="bg-white p-10 lg:p-12 rounded-[3rem] shadow-xl border border-gray-50 h-fit">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Broadcast Center</h3>
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Dashboard Announcement</label>
                  <textarea 
                    className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl font-bold min-h-[200px] focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                    placeholder="Enter message for the main terminal..."
                    value={announcement}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnnouncement(e.target.value)}
                  />
               </div>
               <button 
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center"
               >
                  {isUpdating ? <Spinner /> : 'Synchronize Node Settings'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const MarginInput: React.FC<MarginInputProps> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    <input 
      type="number" 
      className="w-24 p-3 bg-white border border-gray-100 rounded-xl text-center font-black text-gray-900 outline-none focus:border-blue-600 transition-all"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
    />
  </div>
);

export default AdminSettingsPage;
