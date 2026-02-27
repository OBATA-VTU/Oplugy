import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
import { motion } from 'motion/react';
import { Bell, DollarSign, Server, Save, Shield, Info, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

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
  const [networkLogos, setNetworkLogos] = useState<Record<string, string>>({});
  const [newNetwork, setNewNetwork] = useState({ name: '', url: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const [settingsRes, logosRes] = await Promise.all([
      adminService.getGlobalSettings(),
      adminService.getNetworkLogos()
    ]);
    
    if (settingsRes.status && settingsRes.data) {
      setAnnouncement(settingsRes.data.announcement || '');
      if (settingsRes.data.pricing) setPricing(prev => ({ ...prev, ...settingsRes.data.pricing }));
    }
    
    if (logosRes.status && logosRes.data) {
      setNetworkLogos(logosRes.data);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const [settingsRes, logosRes] = await Promise.all([
      adminService.updateGlobalSettings({ 
        announcement, 
        pricing
      }),
      adminService.updateNetworkLogos(networkLogos)
    ]);

    if (settingsRes.status && logosRes.status) {
      addNotification("System node settings synchronized.", "success");
    } else {
      addNotification("Failed to save some settings.", "error");
    }
    setIsUpdating(false);
  };

  const addNetworkLogo = () => {
    if (!newNetwork.name || !newNetwork.url) return;
    setNetworkLogos(prev => ({ ...prev, [newNetwork.name.toUpperCase()]: newNetwork.url }));
    setNewNetwork({ name: '', url: '' });
  };

  const removeNetworkLogo = (name: string) => {
    const updated = { ...networkLogos };
    delete updated[name];
    setNetworkLogos(updated);
  };

  if (loading) return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-6">
      <Spinner />
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Loading Settings...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">System Settings</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">System <br /><span className="text-blue-600">Config.</span></h1>
        </div>
        <button 
          onClick={handleUpdate} 
          disabled={isUpdating}
          className="flex items-center space-x-4 bg-gray-950 text-white px-10 py-6 rounded-[2rem] shadow-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all transform active:scale-95 group"
        >
          {isUpdating ? <Spinner /> : <><Save className="w-4 h-4 group-hover:scale-110 transition-transform" /> <span>Save All Settings</span></>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-7 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 relative overflow-hidden"
            >
               <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-12">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <DollarSign className="w-6 h-6" />
                     </div>
                     <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Profit Margins</h3>
                  </div>
                  <div className="space-y-6">
                     <MarginInput label="Standard User Profit" value={pricing.user_margin} onChange={(val: number) => setPricing({...pricing, user_margin: val})} />
                     <MarginInput label="Reseller Profit" value={pricing.reseller_margin} onChange={(val: number) => setPricing({...pricing, reseller_margin: val})} />
                     <MarginInput label="API Merchant Profit" value={pricing.api_margin} onChange={(val: number) => setPricing({...pricing, api_margin: val})} />
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50"
            >
               <div className="flex items-center space-x-4 mb-12">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                     <Bell className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">System Notice</h3>
               </div>
               <div className="space-y-6">
                  <textarea 
                    className="w-full p-10 bg-gray-50 border-2 border-transparent rounded-[3rem] font-bold text-lg min-h-[200px] focus:ring-8 focus:ring-blue-50 focus:bg-white focus:border-blue-100 transition-all outline-none" 
                    placeholder="Enter message for all users..." 
                    value={announcement} 
                    onChange={(e) => setAnnouncement(e.target.value)} 
                  />
                  <div className="flex items-center space-x-3 text-gray-400 px-6">
                     <Info className="w-4 h-4" />
                     <p className="text-[10px] font-black uppercase tracking-widest">This message will be shown to all users on their dashboard.</p>
                  </div>
               </div>
            </motion.div>
         </div>

         <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-950 p-12 lg:p-16 rounded-[4rem] shadow-2xl text-white h-full relative overflow-hidden group"
            >
               <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-12">
                     <div className="w-12 h-12 bg-white/10 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                        <Server className="w-6 h-6" />
                     </div>
                     <h3 className="text-4xl font-black mb-2 tracking-tighter">Server Settings</h3>
                  </div>
                  
                  <div className="space-y-12">
                     <div className="space-y-8">
                       <div className="flex items-center justify-between">
                          <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Primary Server: INLOMAX</p>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                       </div>
                       <div className="space-y-6">
                          <MarginInput dark label="Data Profit" value={pricing.server1.data_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, data_margin: v}})} />
                          <MarginInput dark label="Cable TV Profit" value={pricing.server1.cable_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, cable_margin: v}})} />
                          <MarginInput dark label="Electricity Profit" value={pricing.server1.electricity_margin} onChange={(v: number) => setPricing({...pricing, server1: {...pricing.server1, electricity_margin: v}})} />
                       </div>
                     </div>

                     <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10">
                        <div className="flex items-center space-x-4 mb-4">
                           <Shield className="w-5 h-5 text-blue-500" />
                           <h4 className="text-[11px] font-black uppercase tracking-widest">Security Note</h4>
                        </div>
                        <p className="text-white/40 text-sm leading-relaxed font-medium">These settings apply to all services. Be careful when changing these during busy hours.</p>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-12 lg:p-16 rounded-[4rem] shadow-2xl border border-gray-50 mt-10"
            >
               <div className="flex items-center space-x-4 mb-12">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                     <ImageIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Network Logos</h3>
               </div>

               <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Network Name (e.g. MTN)</label>
                        <input 
                          type="text" 
                          className="w-full p-6 bg-white border border-gray-100 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                          value={newNetwork.name}
                          onChange={(e) => setNewNetwork({...newNetwork, name: e.target.value})}
                          placeholder="MTN"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Logo URL</label>
                        <div className="flex gap-4">
                           <input 
                             type="text" 
                             className="flex-1 p-6 bg-white border border-gray-100 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all"
                             value={newNetwork.url}
                             onChange={(e) => setNewNetwork({...newNetwork, url: e.target.value})}
                             placeholder="https://..."
                           />
                           <button 
                             onClick={addNetworkLogo}
                             className="p-6 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
                           >
                              <Plus className="w-6 h-6" />
                           </button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {Object.entries(networkLogos).map(([name, url]) => (
                        <div key={name} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group">
                           <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                                 <img src={url} alt={name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                              </div>
                              <div>
                                 <p className="font-black text-gray-900 tracking-tight">{name}</p>
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest truncate max-w-[150px]">{url}</p>
                              </div>
                           </div>
                           <button 
                             onClick={() => removeNetworkLogo(name)}
                             className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                           >
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
            </motion.div>
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
  <div className={`flex items-center justify-between p-8 rounded-[2.5rem] transition-all group ${dark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-gray-50 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-xl'}`}>
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${dark ? 'text-white/60 group-hover:text-white' : 'text-gray-500 group-hover:text-blue-600'}`}>{label}</span>
    <div className="flex items-center gap-4">
       <span className={`text-2xl font-black ${dark ? 'text-white/20' : 'text-gray-200'}`}>₦</span>
       <input 
         type="number" 
         className={`w-32 p-5 rounded-2xl text-center font-black text-xl outline-none transition-all ${dark ? 'bg-white/10 text-white border border-white/10 focus:border-blue-500 focus:bg-white/20' : 'bg-white border border-gray-100 text-gray-900 focus:border-blue-600 shadow-inner'}`} 
         value={value} 
         onChange={(e) => onChange(parseFloat(e.target.value) || 0)} 
       />
    </div>
  </div>
);

export default AdminSettingsPage;