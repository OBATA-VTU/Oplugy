import React, { useState, useEffect, useCallback } from 'react';
import { vtuService } from '../services/vtuService';
import { Operator } from '../types';
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
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">Price List</h2>
        <p className="text-gray-500 font-medium text-lg">View current prices for all our services.</p>
        <p className="text-blue-600 font-bold text-xs mt-4 uppercase tracking-wider">*Prices are inclusive of all charges.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
         <div className="flex p-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
            {['DATA', 'ELECTRICITY', 'CABLE', 'EDUCATION'].map((tab: any) => (
              <button 
                key={tab} 
                onClick={() => { setActiveTab(tab); setFilter(''); }}
                className={`flex-1 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
              >
                {tab === 'DATA' ? 'Mobile Data' : tab === 'ELECTRICITY' ? 'Electricity' : tab === 'CABLE' ? 'Cable TV' : 'Exam PINs'}
              </button>
            ))}
         </div>

         {activeTab === 'DATA' && (
           <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto w-full lg:w-auto no-scrollbar">
              {['MTN', 'AIRTEL', 'GLO', '9MOBILE'].map(net => (
                <button key={net} onClick={() => setActiveNetwork(net)} className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeNetwork === net ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}>{net}</button>
              ))}
           </div>
         )}

         {activeTab === 'CABLE' && (
           <div className="flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm w-full lg:w-auto overflow-x-auto no-scrollbar">
              {['DSTV', 'GOTV', 'STARTIMES'].map(net => (
                <button key={net} onClick={() => setActiveCable(net)} className={`px-5 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeCable === net ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-900'}`}>{net}</button>
              ))}
           </div>
         )}
      </div>

      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <input type="text" placeholder={`Search ${activeTab.toLowerCase()} prices...`} className="w-full p-4 lg:p-5 bg-gray-50 rounded-xl focus:ring-4 focus:ring-blue-50 transition-all font-bold text-lg outline-none" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-6">
           <Spinner />
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Updating prices...</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
           {activeTab === 'DATA' || activeTab === 'CABLE' || activeTab === 'EDUCATION' ? (
             <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                    <tr>
                        <th className="px-8 py-5">Service Plan</th>
                        <th className="px-8 py-5 text-right">Price</th>
                        <th className="px-8 py-5 text-right">Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredData.length > 0 ? filteredData.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                  {activeTab === 'DATA' ? activeNetwork.charAt(0) : activeTab === 'CABLE' ? activeCable.charAt(0) : 'E'}
                                </div>
                                <span className="font-bold text-gray-900">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right font-bold text-gray-900 tracking-tight text-lg">
                            ₦{(Number(item.amount || item.price || 0)).toLocaleString()}
                          </td>
                          <td className="px-8 py-6 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.validity || (activeTab === 'EDUCATION' ? 'Instant' : '30 Days')}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="px-8 py-20 text-center text-gray-400 font-medium">No plans found.</td></tr>
                    )}
                  </tbody>
              </table>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
                {operators.map(op => (
                  <div key={op.id} className="p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all shadow-sm group">
                     <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <img src={op.image || 'https://via.placeholder.com/100'} alt={op.name} className="h-8 w-8 object-contain" />
                     </div>
                     <h4 className="text-lg font-bold text-gray-900 mb-1">{op.name}</h4>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Available</p>
                  </div>
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
    </div>
  );
};

export default PricingPage;
