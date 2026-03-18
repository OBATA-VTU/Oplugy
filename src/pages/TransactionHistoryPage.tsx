import React, { useState, useEffect } from 'react';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import Spinner from '../components/Spinner';
import ReceiptModal from '../components/ReceiptModal';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Receipt, Calendar, CreditCard, Smartphone, Zap, GraduationCap, Lightbulb, Tv, Download, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase/config';

const TransactionHistoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'PENDING'>('all');
  
  const [selectedTx, setSelectedTx] = useState<TransactionResponse | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Real-time listener for transactions
    // We use 'uid' or 'userId' - let's check both or standardize. 
    // vtuService uses 'userId', but Dashboard used 'uid'. 
    // I'll use a query that handles both if possible, or just 'uid' if I standardize.
    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TransactionResponse));
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      // Fallback to non-ordered if index is missing
      const fallbackQ = query(
        collection(db, "transactions"),
        where("uid", "==", user.uid),
        limit(100)
      );
      onSnapshot(fallbackQ, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TransactionResponse)).sort((a, b) => {
          const da = a.date_created?.seconds || 0;
          const dbVal = b.date_created?.seconds || 0;
          return dbVal - da;
        });
        setTransactions(txs);
        setLoading(false);
      });
    });

    return () => unsubscribe();
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
    link.setAttribute('download', `UBLOG_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tx.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || tx.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'FAILED': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
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
      case 'funding': return <Wallet className="w-5 h-5" />;
      case 'crypto': return <ArrowUpRight className="w-5 h-5" />;
      default: return <Receipt className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-4 lg:px-0">
      <ReceiptModal 
        isOpen={isReceiptOpen} 
        onClose={() => setIsReceiptOpen(false)} 
        transaction={selectedTx} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-12"
      >
        <div className="inline-flex p-5 bg-emerald-100 text-emerald-600 rounded-[2.5rem] mb-2 shadow-xl shadow-emerald-200/50">
          <Clock className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter">Activity</h2>
          <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto">Real-time tracking of all your transactions and spending.</p>
        </div>
      </motion.div>

      <div className="bg-white p-6 lg:p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
        {/* Filters & Search */}
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
          <div className="flex p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 w-full lg:w-auto overflow-x-auto">
            {['all', 'SUCCESS', 'PENDING', 'FAILED'].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f as any)} 
                className={`flex-1 lg:px-8 py-4 px-6 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${filter === f ? 'bg-white text-emerald-600 shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80 group">
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full pl-14 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-[2.5rem] font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
            </div>
            
            {transactions.length > 0 && (
              <button 
                onClick={downloadCSV}
                className="p-5 bg-slate-900 text-white rounded-[2rem] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200"
                title="Export CSV"
              >
                <Download className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <Spinner />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Syncing History...</p>
            </div>
          ) : filteredTransactions.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((tx, idx) => (
                  <motion.div 
                    key={tx.id || idx}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => openReceipt(tx)}
                    className="group bg-white p-6 lg:p-10 rounded-[3rem] border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center space-x-8">
                      <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform ${tx.type === 'FUNDING' || tx.type === 'CRYPTO' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <h4 className="font-black text-slate-900 uppercase tracking-tight text-xl">{tx.type}</h4>
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${getStatusColor(tx.status)}`}>
                            {getStatusIcon(tx.status)}
                            {tx.status}
                          </span>
                        </div>
                        <p className="text-slate-400 font-medium text-base line-clamp-1">{tx.source || tx.remarks}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end lg:space-x-16">
                      <div className="text-right lg:text-left space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                        <p className={`text-3xl font-black tracking-tighter ${tx.type === 'FUNDING' || (tx.type === 'CRYPTO' && (tx.remarks || '').includes('Fund')) ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {tx.type === 'FUNDING' || (tx.type === 'CRYPTO' && (tx.remarks || '').includes('Fund')) ? '+' : '-'}₦{(tx.netAmount || tx.amount).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                        <div className="flex items-center justify-end space-x-3 text-slate-400 font-bold text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {tx.date_created?.seconds 
                              ? new Date(tx.date_created.seconds * 1000).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) 
                              : new Date(tx.date_created).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-40 space-y-8">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto text-slate-200">
                <Search className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h4 className="text-3xl font-black text-slate-900 tracking-tight">No activity found</h4>
                <p className="text-slate-400 font-medium text-lg">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;
