import React, { useState, useEffect, useCallback } from 'react';
import { vtuService } from '../services/vtuService';
import { DataPlan, Operator } from '../types';
import Spinner from '../components/Spinner';

const PricingPage: React.FC = () => {
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'DATA' | 'ELECTRICITY' | 'CABLE' | 'EDUCATION'>('DATA');
  const [activeNetwork, setActiveNetwork] = useState('MTN');
  const [activeCable, setActiveCable] = useState('DSTV');
  const [plans, setPlans] = useState<any[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'DATA') {
        const [sme, gifting] = await Promise.all([
          vtuService.getDataPlans({ network: activeNetwork, type: 'SME' }),
          vtuService.getDataPlans({ network: activeNetwork, type: 'GIFTING' })
        ]);
        setPlans([...(sme.status && sme.data ? sme.data : []), ...(gifting.status && gifting.data ? gifting.data : [])]);
      } else if (activeTab === 'ELECTRICITY') {
        const res = await vtuService.getElectricityOperators();
        if (res.status && res.data) setOperators(res.data);
      } else if (activeTab === 'CABLE') {
        const res = await vtuService.getCablePlans(activeCable);
        if (res.status && res.data) setPlans(res.data);
      } else if (activeTab === 'EDUCATION') {
        const res = await vtuService.getEducationPlans();
        if (res.status && res.data) setPlans(res.data);
      }
    } catch (e) {
      console.error("Price list fetch error");
    }
    setLoading(false);
  }, [activeTab, activeNetwork, activeCable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredData = plans.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10 pb-20">
      <div>
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Service Tariffs</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Price List</h1>
        <p className="text-gray-400 font-medium text-sm mt-4 italic">*All listed prices are final and inclusive of all charges.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
         <div className="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['DATA', 'ELECTRICITY', 'CABLE', 'EDUCATION'].map((tab: any) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setFilter(''); }}
                className={`flex-1 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {tab}
              </button>
            ))}
         </div>

         {activeTab === 'DATA' && (
           <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto w-full lg:w-auto no-scrollbar">
              {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                <button key={net} onClick={() => setActiveNetwork(net)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeNetwork === net ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}>{net}</button>
              ))}
           </div>
         )}

         {activeTab === 'CABLE' && (
           <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
              {['DSTV', 'GOTV', 'STARTIMES'].map(net => (
                <button key={net} onClick={() => setActiveCable(net)} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeCable === net ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}>{net}</button>
              ))}
           </div>
         )}
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <input type="text" placeholder={`Search ${activeTab.toLowerCase()} prices...`} className="w-full p-4 lg:p-6 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-black text-lg outline-none" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
           <Spinner />
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Syncing current prices with Master Node...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] lg:rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden">
           {activeTab === 'DATA' || activeTab === 'CABLE' || activeTab === 'EDUCATION' ? (
             <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                   <tr>
                      <th className="px-10 py-6">Service Plan</th>
                      <th className="px-10 py-6 text-right">Price</th>
                      <th className="px-10 py-6 text-right">Duration</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {filteredData.length > 0 ? filteredData.map((item, idx) => (
                     <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                        <td className="px-10 py-7">
                           <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">
                                {activeTab === 'DATA' ? activeNetwork.charAt(0) : activeTab === 'CABLE' ? activeCable.charAt(0) : 'E'}
                              </div>
                              <span className="font-black text-gray-900">{item.name}</span>
                           </div>
                        </td>
                        <td className="px-10 py-7 text-right font-black text-gray-900 tracking-tighter text-xl">
                          ₦{(item.amount || item.price || 0).toLocaleString()}
                        </td>
                        <td className="px-10 py-7 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">{item.validity || (activeTab === 'EDUCATION' ? 'Instant' : '30 Days')}</td>
                     </tr>
                   )) : (
                     <tr><td colSpan={3} className="px-10 py-20 text-center text-gray-400 font-medium">No plans found for this criteria.</td></tr>
                   )}
                </tbody>
             </table>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-10">
                {operators.map(op => (
                  <div key={op.id} className="p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <img src={op.image || 'https://via.placeholder.com/100'} alt={op.name} className="h-10 w-10 object-contain" />
                     </div>
                     <h4 className="text-xl font-black text-gray-900 mb-2">{op.name}</h4>
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Active Price node</p>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default PricingPage;
