
import React, { useState } from 'react';
import Spinner from '../components/Spinner';

const AdminTransactionsPage: React.FC = () => {
  const [loading] = useState(false);
  
  // Mocking system-wide transactions for the ledger view
  const transactions = [
    { id: 'TX-89212', user: 'ayuba@obata.com', type: 'DATA', source: 'MTN 2.5GB', amount: 650, status: 'SUCCESS', date: 'Just Now' },
    { id: 'TX-89211', user: 'sarah@plug.ng', type: 'AIRTIME', source: 'AIRTEL VTU', amount: 5000, status: 'SUCCESS', date: '2m ago' },
    { id: 'TX-89210', user: 'dev@obata.com', type: 'FUNDING', source: 'PAYSTACK_AUTO', amount: 15000, status: 'SUCCESS', date: '10m ago' },
    { id: 'TX-89209', user: 'guest_user_1', type: 'DATA', source: 'GLO SME', amount: 250, status: 'FAILED', date: '15m ago' },
  ];

  if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Global Ledger</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Traffic</h1>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
               <tr>
                  <th className="px-10 py-6">Tx ID & User</th>
                  <th className="px-10 py-6">Service</th>
                  <th className="px-10 py-6 text-right">Volume</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-right">Time</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {transactions.map((t) => (
                 <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-7">
                       <div className="font-black text-gray-900">{t.id}</div>
                       <div className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">{t.user}</div>
                    </td>
                    <td className="px-10 py-7">
                       <div className="text-xs font-black text-gray-700">{t.source}</div>
                       <div className="text-[9px] font-black uppercase tracking-widest text-blue-500">{t.type}</div>
                    </td>
                    <td className="px-10 py-7 text-right font-black text-gray-900 tracking-tighter">₦{t.amount.toLocaleString()}</td>
                    <td className="px-10 py-7 text-center">
                       <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${t.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {t.status}
                       </span>
                    </td>
                    <td className="px-10 py-7 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.date}</td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
