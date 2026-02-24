import React, { useState, useEffect } from 'react';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import Spinner from '../components/Spinner';
import ReceiptModal from '../components/ReceiptModal';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Receipt, Calendar, CreditCard, Smartphone, Zap, GraduationCap, Lightbulb, Tv, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'PENDING'>('all');
  
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
    link.setAttribute('download', `INLOMAX_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.source?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || tx.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-green-600 bg-green-50 border-green-100';
      case 'FAILED': return 'text-red-600 bg-red-50 border-red-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle2 className="w-4 h-4" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      case 'PENDING': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'airtime': return <Smartphone className="w-5 h-5" />;
      case 'data': return <Zap className="w-5 h-5" />;
      case 'cable': return <Tv className="w-5 h-5" />;
      case 'electricity': return <Lightbulb className="w-5 h-5" />;
      case 'education': return <GraduationCap className="w-5 h-5" />;
      case 'funding': return <CreditCard className="w-5 h-5" />;
      default: return <Receipt className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Receipt className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">History</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Track your spending and all your transactions here.</p>
      </div>

      <div className="bg-white p-8 lg:p-12 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 space-y-10">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="flex p-2 bg-gray-50 rounded-[2rem] border-2 border-transparent w-full lg:w-auto">
            {['all', 'SUCCESS', 'PENDING', 'FAILED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)} 
                className={`flex-1 lg:px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all ${filter === f ? 'bg-white text-blue-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <input 
                type="text" 
                placeholder="Search ID, type..." 
                className="w-full pl-14 pr-8 py-5 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-gray-900 outline-none focus:border-blue-600 focus:bg-white transition-all placeholder:text-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors w-5 h-5" />
            </div>
            
            {transactions.length > 0 && (
              <button 
                onClick={downloadCSV}
                className="p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all shadow-lg"
                title="Export CSV"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Spinner />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Loading History...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((tx, idx) => (
                  <motion.div 
                    key={tx.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => openReceipt(tx)}
                    className="group bg-white p-6 lg:p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer"
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${tx.type === 'FUNDING' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg">{tx.type}</h4>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-gray-400 font-medium text-sm">{tx.source}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end lg:space-x-12">
                      <div className="text-right lg:text-left space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</p>
                        <p className={`text-2xl font-black tracking-tighter ${tx.type === 'FUNDING' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'FUNDING' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</p>
                        <div className="flex items-center justify-end space-x-2 text-gray-400 font-bold text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {tx.date_created?.seconds 
                              ? new Date(tx.date_created.seconds * 1000).toLocaleDateString() 
                              : new Date(tx.date_created).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-32 space-y-6">
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-gray-200">
                <Search className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-gray-900 tracking-tight">No records found</h4>
                <p className="text-gray-400 font-medium">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;