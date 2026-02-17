
import React, { useState } from 'react';

const AdminSettingsPage: React.FC = () => {
  const [maintenance, setMaintenance] = useState(false);
  const [apiMode, setApiMode] = useState<'LIVE' | 'TEST'>('LIVE');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Infrastructure</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Config</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Service Controls</h3>
            <div className="space-y-8">
               <div className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl">
                  <div>
                     <p className="font-black text-gray-900 tracking-tight">Maintenance Mode</p>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Shutdown</p>
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
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CIP Topup Integration</p>
                  </div>
                  <div className="flex p-1 bg-white rounded-xl">
                     <button onClick={() => setApiMode('TEST')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${apiMode === 'TEST' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>Test</button>
                     <button onClick={() => setApiMode('LIVE')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${apiMode === 'LIVE' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400'}`}>Live</button>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-50">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Contact Information</h3>
            <div className="space-y-6">
               <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Support Email</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" defaultValue="support@obata.com" />
               </div>
               <div>
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp Hotline</label>
                  <input type="text" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold" defaultValue="+2348142452729" />
               </div>
               <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                  Update System Meta
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
