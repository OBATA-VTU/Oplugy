
import React, { useState } from 'react';
import { PRICING_DATA } from '../constants';

const PricingPage: React.FC = () => {
  const [filter, setFilter] = useState('');

  const filteredData = PRICING_DATA.filter(item => 
    item.network.toLowerCase().includes(filter.toLowerCase()) || 
    item.type.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Transparency</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Service Tariffs</h1>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-10">
        <input 
          type="text" 
          placeholder="Filter by network or plan type..." 
          className="w-full p-4 bg-gray-50 rounded-2xl focus:ring-4 focus:ring-blue-50 transition-all font-medium text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
               <tr>
                  <th className="px-10 py-6">Operator</th>
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6">Bundle Size</th>
                  <th className="px-10 py-6 text-right">Unit Price</th>
                  <th className="px-10 py-6 text-right">Validity</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {filteredData.map((item, idx) => (
                 <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-6">
                       <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center font-black text-blue-600 text-xs">{item.network.charAt(0)}</div>
                          <span className="font-black text-gray-900">{item.network}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-md text-gray-500">{item.type}</span>
                    </td>
                    <td className="px-10 py-6 font-bold text-gray-900">{item.size}</td>
                    <td className="px-10 py-6 text-right font-black text-blue-600 tracking-tight">₦{item.price}</td>
                    <td className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">{item.validity}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default PricingPage;
