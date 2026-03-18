import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bitcoin, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  RefreshCw, 
  ShieldCheck,
  Zap,
  History,
  ArrowRight,
  Copy,
  Info
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { doc, updateDoc, increment, addDoc, collection, serverTimestamp, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Link } from 'react-router-dom';

const CryptoPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>(['BTC', 'ETH', 'USDT (TRC20)', 'SOL', 'LTC', 'DOGE', 'TRX']);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [cryptoRate, setCryptoRate] = useState(1500);
  const [adminWallets, setAdminWallets] = useState<any>({});
  const [marketPrices, setMarketPrices] = useState<any>({
    btc: 64231.50,
    eth: 3452.20,
    usdt: 1.00,
    sol: 145.30
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices((prev: any) => ({
        btc: prev.btc + (Math.random() - 0.5) * 10,
        eth: prev.eth + (Math.random() - 0.5) * 5,
        usdt: 1.00,
        sol: prev.sol + (Math.random() - 0.5) * 2
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Real-time crypto rate and admin wallets listener
    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCryptoRate(data.cryptoRate || 1500);
        setAdminWallets(data.adminWallets || {
          'BTC': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
          'ETH': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          'USDT (TRC20)': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
        });
      }
    });

    // Real-time transactions listener
    if (user?.id) {
      const q = query(
        collection(db, "transactions"),
        where("uid", "==", user.id),
        where("type", "in", ["crypto_purchase", "crypto_sell"]),
        orderBy("createdAt", "desc"),
        limit(5)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentTransactions(txs);
      });

      return () => {
        unsubscribe();
        settingsUnsubscribe();
      };
    }
    return () => settingsUnsubscribe();
  }, [user?.id]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      addNotification("Please enter a valid amount", "error");
      return;
    }

    if (activeTab === 'buy' && !recipientAddress) {
      addNotification("Please enter your wallet address to receive crypto", "error");
      return;
    }

    setLoading(true);
    try {
      const usdAmount = parseFloat(amount);
      const nairaAmount = usdAmount * cryptoRate;

      if (usdAmount < 5) {
        addNotification("Minimum crypto transaction is $5", "error");
        setLoading(false);
        return;
      }

      if (activeTab === 'sell') {
        // User sends crypto to Admin
        const orderId = `SELL_${Date.now()}`;
        
        await addDoc(collection(db, 'transactions'), {
          uid: user?.id,
          userEmail: user?.email,
          type: 'crypto_sell',
          amount: usdAmount,
          nairaAmount: nairaAmount,
          currency: 'USD',
          crypto_currency: selectedCurrency,
          status: 'PENDING',
          order_id: orderId,
          remarks: `Manual crypto sale request. User to send ${selectedCurrency} to Admin.`,
          createdAt: serverTimestamp()
        });

        addNotification("Sale request submitted! Please send the crypto to the provided address.", "success");
        setAmount('');
      } else if (activeTab === 'buy') {
        // User pays NGN balance to get crypto
        if (user!.walletBalance < nairaAmount) {
          addNotification("Insufficient wallet balance", "error");
          setLoading(false);
          return;
        }

        const orderId = `BUY_${Date.now()}`;
        
        // Debit user
        const userRef = doc(db, 'users', user!.id);
        await updateDoc(userRef, {
          walletBalance: increment(-nairaAmount)
        });

        await addDoc(collection(db, 'transactions'), {
          uid: user?.id,
          userEmail: user?.email,
          type: 'crypto_purchase',
          amount: usdAmount,
          nairaAmount: nairaAmount,
          currency: 'USD',
          crypto_currency: selectedCurrency,
          status: 'PENDING',
          order_id: orderId,
          address: recipientAddress,
          remarks: `Manual crypto purchase request. Admin to send ${selectedCurrency} to ${recipientAddress}.`,
          createdAt: serverTimestamp()
        });
        
        addNotification("Purchase request submitted! Admin will process it shortly.", "success");
        setAmount('');
        setRecipientAddress('');
      }
    } catch (error: any) {
      addNotification(error.message || "Failed to process request", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    addNotification("Address copied to clipboard!", "success");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Bitcoin size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Crypto Hub</h2>
            <p className="text-[10px] text-gray-500">Trade & Fund with Crypto</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1.5 rounded-full">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Market Live</span>
        </div>
      </motion.div>

      {/* Portfolio Card */}
      <div className="bg-orange-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium opacity-80">Portfolio Overview</span>
            <ShieldCheck size={18} className="opacity-80" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">
              ₦{user?.walletBalance?.toLocaleString() || '0.00'}
            </h1>
            <p className="text-[10px] opacity-70">Available Balance for Trading</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button onClick={() => setActiveTab('buy')} className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'buy' ? 'bg-white text-orange-600 shadow-lg' : 'bg-orange-700 text-white border border-orange-500'}`}>
              <ArrowDownLeft size={18} />
              Buy Crypto
            </button>
            <button onClick={() => setActiveTab('sell')} className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'sell' ? 'bg-white text-orange-600 shadow-lg' : 'bg-orange-700 text-white border border-orange-500'}`}>
              <ArrowUpRight size={18} />
              Sell Crypto
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <Bitcoin className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
      </div>

      {/* Market Ticker */}
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {Object.entries(marketPrices).map(([coin, price]: [string, any]) => (
          <div key={coin} className="bg-white dark:bg-emerald-950/20 p-4 rounded-2xl border border-gray-100 dark:border-emerald-900/30 flex items-center gap-3 min-w-[140px]">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${coin === 'btc' ? 'bg-orange-100 text-orange-600' : coin === 'eth' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {coin === 'btc' ? <Bitcoin size={16} /> : <Zap size={16} />}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase">{coin}</p>
              <p className="text-xs font-black">${price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Action Card */}
      <div className="bg-white dark:bg-emerald-950/20 rounded-[2.5rem] border border-gray-100 dark:border-emerald-900/30 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 dark:border-emerald-900/30">
          {(['buy', 'sell'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
              }}
              className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 border-b-2 border-orange-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8 space-y-8">
          {activeTab === 'sell' && (
            <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-3xl space-y-4 border border-orange-100 dark:border-orange-900/30">
              <div className="flex items-center gap-3 text-orange-600">
                <Info size={20} />
                <span className="font-black uppercase tracking-widest text-[10px]">How to Sell</span>
              </div>
              <p className="text-[10px] text-gray-600 dark:text-gray-400 leading-relaxed">
                To sell crypto, send the exact amount to the address below. Once sent, submit the form with your transaction details. Admin will verify and credit your wallet manually.
              </p>
              
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Our {selectedCurrency} Address</p>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-orange-200 dark:border-orange-900/50">
                  <code className="text-[10px] font-bold break-all">{adminWallets[selectedCurrency] || 'Address not set'}</code>
                  <button 
                    onClick={() => copyToClipboard(adminWallets[selectedCurrency])}
                    className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg text-orange-600 transition-all"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Amount (USD)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">$</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Min $5.00"
                  className="w-full pl-10 pr-4 py-5 bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-all"
                />
              </div>
              <div className="flex justify-between items-center">
                {amount ? (
                  <p className="text-[10px] font-bold text-emerald-600">
                    ≈ ₦{(parseFloat(amount) * cryptoRate).toLocaleString()} (Rate: ₦{cryptoRate.toLocaleString()}/$)
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-400">Minimum transaction: $5.00</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Select Asset</label>
              <div className="grid grid-cols-4 gap-3">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => setSelectedCurrency(curr)}
                    className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                      selectedCurrency === curr 
                        ? 'bg-orange-600 text-white border-orange-600 shadow-lg' 
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 border-transparent hover:border-orange-200'
                    }`}
                  >
                    {curr.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'buy' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Wallet Address (To Receive)</label>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter your external wallet address"
                    className="w-full px-5 py-5 bg-gray-50 dark:bg-white/5 border border-transparent rounded-2xl font-bold text-gray-900 dark:text-white outline-none focus:border-orange-500 transition-all"
                  />
                  <Wallet className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <p className="text-[8px] text-gray-400 font-medium">Double check your address. Admin will send crypto here.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-orange-200 dark:shadow-none hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <>
                  {activeTab === 'buy' && <ArrowUpRight size={20} />}
                  {activeTab === 'sell' && <ArrowDownLeft size={20} />}
                  {activeTab === 'buy' ? 'Submit Purchase Request' : 'Submit Sale Request'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold">Recent Crypto Activity</h3>
          <Link to="/history" className="text-[10px] font-bold text-orange-600">View All</Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-gray-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'crypto_purchase' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    {tx.type === 'crypto_sell' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold capitalize">{tx.type.replace('crypto_', ' ')}</h4>
                    <p className="text-[10px] text-gray-500">{tx.crypto_currency?.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className={`text-xs font-bold ${tx.type === 'crypto_sell' ? 'text-orange-600' : 'text-emerald-600'}`}>
                    {tx.type === 'crypto_sell' ? '-' : '+'}${tx.amount?.toLocaleString()}
                  </h4>
                  <span className={`text-[8px] font-bold uppercase tracking-widest ${tx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-orange-500'}`}>{tx.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-orange-500" />
            <h4 className="text-lg font-bold">Manual Verification</h4>
          </div>
          <p className="text-xs text-white/70 leading-relaxed max-w-md">
            All crypto transactions are now processed manually by our administrators for maximum security. Please allow up to 30 minutes for verification and processing.
          </p>
        </div>
        <Zap className="absolute -right-8 -bottom-8 w-48 h-48 opacity-5" />
      </div>
    </div>
  );
};

export default CryptoPage;
