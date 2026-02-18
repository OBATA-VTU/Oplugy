
import React, { useState, useEffect, useCallback } from 'react';
import { vtuService } from '../services/vtuService';
import { DataPlan } from '../types';
import Spinner from '../components/Spinner';

const PricingPage: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [plans, setPlans] = useState<DataPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeNetwork, setActiveNetwork] = useState('MTN');

  const fetchLivePricing = useCallback(async (network: string) => {
    setLoading(true);
    // Fetch common data types to show in the pricing list
    const [sme, gifting] = await Promise.all([
      vtuService.getDataPlans({ network, type: 'SME' }),
      vtuService.getDataPlans({ network, type: 'GIFTING' })
    ]);

    const combined = [
      ...(sme.status && sme.data ? sme.data : []),
      ...(gifting.status && gifting.data ? gifting.data : [])
    ];

    setPlans(combined);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLivePricing(activeNetwork);
  }, [activeNetwork, fetchLivePricing]);

  const filteredData = plans.filter(item => 
    item.name.toLowerCase().includes(filter.toLowerCase()) || 
    item.type?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Live Tariffs</h2>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">Dynamic Price List</h1>
          <p className="text-gray-400 font-medium text-sm mt-2 italic">*Prices include automated ₦10 Oplug profit margin.</p>
        </div>

        <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm">
           {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
             <button 
               key={net} 
               onClick={() => setActiveNetwork(net)}
               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeNetwork === net ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}
             >
               {net}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8">
        <input 
          type="text" 
          placeholder="Search live plans..." 
          className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
           <Spinner />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing with Provider Nodes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                 <tr>
                    <th className="px-10 py-6">Plan Name</th>
                    <th className="px-10 py-6">Type</th>
                    <th className="px-10 py-6 text-right">Selling Price</th>
                    <th className="px-10 py-6 text-right">Validity</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {filteredData.length > 0 ? filteredData.map((item, idx) => (
                   <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-10 py-6">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center font-black text-blue-600 text-xs">{activeNetwork.charAt(0)}</div>
                            <span className="font-black text-gray-900">{item.name}</span>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                         <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-md text-blue-600">{item.type || 'SME'}</span>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-gray-900 tracking-tighter text-lg">₦{item.amount.toLocaleString()}</td>
                      <td className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">{item.validity || '30 Days'}</td>
                   </tr>
                 )) : (
                   <tr>
                      <td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-medium">No plans found for this selection.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
