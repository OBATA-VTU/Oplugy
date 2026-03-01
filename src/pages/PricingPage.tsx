import React, { useState, useEffect, useCallback } from 'react';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
import Spinner from '../components/Spinner';
import { getNetworkLogo } from '../constants';
import { Search, Globe, Tv, Zap, BookOpen, Smartphone } from 'lucide-react';

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
        const [sme1, gifting1, sme2, gifting2] = await Promise.all([
          vtuService.getDataPlans({ network: activeNetwork, type: 'SME', server: 1 }),
          vtuService.getDataPlans({ network: activeNetwork, type: 'GIFTING', server: 1 }),
          vtuService.getDataPlans({ network: activeNetwork, type: 'SME', server: 2 }),
          vtuService.getDataPlans({ network: activeNetwork, type: 'GIFTING', server: 2 })
        ]);

        const server1Plans = [
          ...(sme1.status && sme1.data ? sme1.data.map((p: any) => ({ ...p, server: 1 })) : []),
          ...(gifting1.status && gifting1.data ? gifting1.data.map((p: any) => ({ ...p, server: 1 })) : [])
        ];

        const server2Plans = [
          ...(sme2.status && sme2.data ? sme2.data.map((p: any) => ({ ...p, server: 2 })) : []),
          ...(gifting2.status && gifting2.data ? gifting2.data.map((p: any) => ({ ...p, server: 2 })) : [])
        ];

        setPlans([...server1Plans, ...server2Plans]);
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
    <div className="max-w-[1400px] mx-auto space-y-12 pb-32 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-gray-100 pb-12">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Network Rates</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase">
            Service <br />
            <span className="text-gray-200">Pricing.</span>
          </h1>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 shadow-inner overflow-x-auto no-scrollbar">
           {(['DATA', 'ELECTRICITY', 'CABLE', 'EDUCATION'] as const).map((tab) => (
             <button 
               key={tab} 
               onClick={() => { setActiveTab(tab); setFilter(''); }}
               className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center space-x-3 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
             >
                {tab === 'DATA' && <Smartphone size={14} />}
                {tab === 'ELECTRICITY' && <Zap size={14} />}
                {tab === 'CABLE' && <Tv size={14} />}
                {tab === 'EDUCATION' && <BookOpen size={14} />}
                <span>{tab === 'DATA' ? 'Data' : tab === 'ELECTRICITY' ? 'Power' : tab === 'CABLE' ? 'Cable' : 'Exam'}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'DATA' && (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">Select Network</p>
              <div className="space-y-2">
                {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                  <button 
                    key={net} 
                    onClick={() => setActiveNetwork(net)} 
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeNetwork === net ? 'bg-gray-950 text-white shadow-xl' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-lg bg-white p-1.5 flex items-center justify-center border border-gray-100 overflow-hidden">
                        <img src={getNetworkLogo(net)} alt={net} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <span className="font-black text-[11px] uppercase tracking-widest">{net}</span>
                    </div>
                    {activeNetwork === net && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'CABLE' && (
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-xl shadow-gray-100/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">Select Provider</p>
              <div className="space-y-2">
                {['DSTV', 'GOTV', 'STARTIMES'].map(net => (
                  <button 
                    key={net} 
                    onClick={() => setActiveCable(net)} 
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeCable === net ? 'bg-gray-950 text-white shadow-xl' : 'hover:bg-gray-50 text-gray-500'}`}
                  >
                    <span className="font-black text-[11px] uppercase tracking-widest ml-2">{net}</span>
                    {activeCable === net && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
             <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                   <Globe size={20} />
                </div>
                <h4 className="text-sm font-black tracking-tight uppercase">Live Updates</h4>
             </div>
             <p className="text-[11px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest">
                Our rates are synchronized with provider APIs in real-time to ensure maximum precision.
             </p>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-8">
          <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center">
            <div className="pl-8 pr-4 text-gray-300">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder={`Filter ${activeTab.toLowerCase()} plans...`} 
              className="flex-1 py-6 bg-transparent rounded-xl font-black text-lg tracking-tight outline-none" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
            />
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-8 bg-white border border-gray-100 rounded-[3rem] shadow-xl shadow-gray-100/50">
               <Spinner />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Rates...</p>
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100/50 border border-gray-50 overflow-hidden">
               {activeTab === 'DATA' || activeTab === 'CABLE' || activeTab === 'EDUCATION' ? (
                 <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50/50 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                        <tr>
                            <th className="px-10 py-6">Service Plan</th>
                            <th className="px-10 py-6 text-center">Protocol</th>
                            <th className="px-10 py-6 text-right">Execution Rate</th>
                            <th className="px-10 py-6 text-right">Validity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredData.length > 0 ? filteredData.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-gray-50/50 transition-all duration-300">
                              <td className="px-10 py-8">
                                <div className="flex items-center space-x-6">
                                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden">
                                      {activeTab === 'DATA' ? (
                                        <img src={getNetworkLogo(activeNetwork)} alt={activeNetwork} className="w-full h-full object-contain p-2" referrerPolicy="no-referrer" />
                                      ) : (
                                        <div className="font-black text-blue-600 text-xs">
                                          {activeTab === 'CABLE' ? activeCable.charAt(0) : 'E'}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="font-black text-gray-900 tracking-tight text-lg block">{item.name}</span>
                                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{activeTab} • {item.id || 'N/A'}</span>
                                    </div>
                                </div>
                              </td>
                              <td className="px-10 py-8 text-center">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.server === 2 ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                  {item.server ? `S${item.server}` : 'STD'}
                                </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <span className="font-black text-gray-950 tracking-tighter text-2xl">₦{(Number(item.amount || item.price || 0)).toLocaleString()}</span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                  {item.validity || (activeTab === 'EDUCATION' ? 'INSTANT' : '30 DAYS')}
                                </span>
                              </td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="px-10 py-32 text-center">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                <Search size={24} />
                              </div>
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No matching plans found</p>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                  </table>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-12">
                    {operators.map(op => (
                      <div key={op.id} className="p-10 bg-gray-50 rounded-[3rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm group relative overflow-hidden">
                         <div className="relative z-10 flex items-center space-x-8">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-xl border border-gray-100 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                               <img src={op.image || 'https://via.placeholder.com/100'} alt={op.name} className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                               <h4 className="text-2xl font-black text-gray-900 tracking-tighter mb-1 uppercase">{op.name}</h4>
                               <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active Protocol</p>
                            </div>
                         </div>
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
