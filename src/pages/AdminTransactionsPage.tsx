
import React, { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import { adminService } from '../services/adminService';
import { TransactionResponse } from '../types';
import { useNotifications } from '../hooks/useNotifications';

const AdminTransactionsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    const res = await adminService.getSystemTransactions();
    if (res.status && res.data) {
      setTransactions(res.data);
    } else {
      addNotification(res.message || "Failed to fetch system transactions", "error");
    }
    setLoading(false);
  }, [addNotification]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  if (loading && transactions.length === 0) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Global Ledger</h2>
            <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Traffic</h1>
          </div>
          <button onClick={fetchLedger} className="p-4 bg-white border rounded-2xl shadow-sm text-gray-400 hover:text-blue-600 transition-all">
             <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
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
               {transactions.length > 0 ? transactions.map((t) => (
                 <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-10 py-7">
                       <div className="font-black text-gray-900">{t.id}</div>
                       <div className="text-[10px] font-bold text-gray-400 lowercase tracking-widest">{t.userEmail}</div>
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
                    <td className="px-10 py-7 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                       {new Date(t.date_created).toLocaleDateString()}
                    </td>
                 </tr>
               )) : (
                 <tr>
                    <td colSpan={5} className="px-10 py-20 text-center text-gray-400 font-medium">No system-wide logs found.</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
