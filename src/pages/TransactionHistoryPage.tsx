import React, { useState, useEffect } from 'react';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import Spinner from '../components/Spinner';
// Added missing HistoryIcon import
import { HistoryIcon } from '../components/Icons';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const res = await vtuService.getTransactionHistory();
      if (res.status && res.data) {
        setTransactions(res.data);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Spinner />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Fetching your history...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Your Activity</h2>
          <p className="text-gray-400 font-medium">Tracking all your transactions on Oplug.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
          <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all">All</button>
          <button className="px-5 py-2.5 rounded-xl text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-900 transition-all">Recent</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6">Transaction Detail</th>
                <th className="px-10 py-6 text-center">Type</th>
                <th className="px-10 py-6 text-right">Amount</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length > 0 ? transactions.map((txn) => (
                <tr key={txn.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${txn.status === 'SUCCESS' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {txn.type.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 tracking-tight">{txn.source}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{txn.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="font-black text-gray-900 text-lg tracking-tighter">₦{txn.amount.toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Final Price</div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${getStatusStyle(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="font-black text-gray-800 text-sm tracking-tight">{new Date(txn.date_created).toLocaleDateString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(txn.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                        <HistoryIcon />
                      </div>
                      <div>
                        <p className="text-gray-900 font-black text-xl tracking-tight">Empty Workspace</p>
                        <p className="text-gray-400 font-medium">You haven't performed any transactions yet.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;