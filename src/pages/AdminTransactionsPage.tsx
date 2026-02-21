
import React, { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import { adminService } from '../services/adminService';
import { TransactionResponse } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { Search, RefreshCw, Filter, Download, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';

const AdminTransactionsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && transactions.length === 0) return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-6">
      <Spinner />
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Syncing Global Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Global Ledger</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">System <br /><span className="text-blue-600">Traffic.</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-6">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by ID or user..." 
              className="w-full p-6 pl-16 bg-white border border-gray-100 rounded-[2rem] shadow-2xl focus:ring-8 focus:ring-blue-50 transition-all font-black text-lg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchLedger}
            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-xl text-gray-400 hover:text-blue-600 transition-all transform active:scale-95"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-50 overflow-hidden relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100">
                <th className="px-12 py-8">Transaction ID & Node</th>
                <th className="px-12 py-8">Service Protocol</th>
                <th className="px-12 py-8 text-right">Volume</th>
                <th className="px-12 py-8 text-center">Fulfillment</th>
                <th className="px-12 py-8 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredTransactions.length > 0 ? filteredTransactions.map((t) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={t.id} 
                    className="group hover:bg-blue-50/30 transition-all duration-500"
                  >
                    <td className="px-12 py-8">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'} shadow-inner`}>
                          {t.type === 'CREDIT' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 tracking-tighter text-lg leading-none mb-2">{t.id}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <div className="text-sm font-black text-gray-900 tracking-tight mb-1">{t.source}</div>
                      <div className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">{t.type}</span>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <div className="font-black text-gray-900 text-2xl tracking-tighter leading-none">₦{t.amount.toLocaleString()}</div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Gross Volume</p>
                    </td>
                    <td className="px-12 py-8 text-center">
                       <span className={`inline-flex px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                         t.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                       }`}>
                          {t.status}
                       </span>
                    </td>
                    <td className="px-12 py-8 text-right">
                       <div className="text-sm font-black text-gray-900 tracking-tight">{new Date(t.date_created).toLocaleDateString()}</div>
                       <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{new Date(t.date_created).toLocaleTimeString()}</div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-12 py-32 text-center">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                          <Activity className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-gray-900 text-3xl font-black tracking-tighter">No Traffic Detected</p>
                           <p className="text-gray-400 font-medium text-lg">The system ledger is currently clear of matching records.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionsPage;
