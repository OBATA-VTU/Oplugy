import React, { useState, useEffect } from 'react';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import Spinner from '../components/Spinner';
import ReceiptModal from '../components/ReceiptModal';
import { HistoryIcon } from '../components/Icons';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const res = await vtuService.getTransactionHistory();
      if (res.status && res.data) {
        setTransactions(res.data);
      } else {
        setTransactions([]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const openReceipt = (tx: TransactionResponse) => {
    setSelectedTx(tx);
    setIsReceiptOpen(true);
  };

  const downloadCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Transaction ID', 'Type', 'Source', 'Amount (Naira)', 'Status', 'Date', 'Time'];
    const rows = transactions.map(txn => {
      const dateObj = new Date(txn.date_created?.seconds ? txn.date_created.seconds * 1000 : txn.date_created);
      return [
        txn.id,
        txn.type,
        txn.source,
        txn.amount.toString(),
        txn.status,
        dateObj.toLocaleDateString(),
        dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      ].map(field => `"${field}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `OBATA_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading your history...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Activity History</h2>
          <p className="text-gray-500 font-medium text-lg mt-2">Track all your payments and recharges in one place.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {transactions.length > 0 && (
            <button 
              onClick={downloadCSV}
              className="bg-gray-900 hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center space-x-2 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6">Transaction</th>
                <th className="px-10 py-6 text-center">Type</th>
                <th className="px-10 py-6 text-right">Amount</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length > 0 ? transactions.map((txn) => (
                <tr key={txn.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${txn.status === 'SUCCESS' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}>
                        {txn.type.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 tracking-tight">{txn.source}</div>
                        <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                          {txn.date_created?.seconds 
                            ? new Date(txn.date_created.seconds * 1000).toLocaleDateString() 
                            : new Date(txn.date_created).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg">
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="font-bold text-gray-900 text-lg tracking-tight">₦{txn.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-10 py-7 text-center">
                    <span className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button 
                      onClick={() => openReceipt(txn)}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-xl transition-all border border-blue-600"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 shadow-inner">
                        <HistoryIcon />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-900 font-bold text-2xl tracking-tight">No activity yet</p>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto">Your recent transactions will appear here.</p>
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