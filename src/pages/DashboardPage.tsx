import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import PhoneSetupModal from '../components/PhoneSetupModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useServices } from '../context/ServiceContext';
import { 
  Smartphone, Wifi, Zap, Tv, 
  Eye, EyeOff,
  ArrowLeftRight, GraduationCap,
  ShieldCheck, Plus,
  Bell, ChevronRight,
  Bitcoin, Lightbulb, LayoutGrid, Search,
  ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, user } = useAuth();
  const { refreshPrices } = useServices();
  const { addNotification } = useNotifications();
  const [showPinModal, setShowPinModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const banners = [
    {
      title: "Crypto Trading Live",
      desc: "Buy and sell Bitcoin, Ethereum & more at the best rates.",
      image: "https://picsum.photos/seed/crypto-trading/800/400",
      cta: "Trade Now",
      color: "bg-orange-600",
      link: "/crypto"
    },
    {
      title: "Airtime Discounts",
      desc: "Get up to 5% off on all airtime purchases today!",
      image: "https://picsum.photos/seed/happy/800/400",
      cta: "Buy Now",
      color: "bg-emerald-600",
      link: "/airtime"
    },
    {
      title: "Data Bundle Deals",
      desc: "Cheap data for all networks. MTN, Airtel, Glo & 9mobile.",
      image: "https://picsum.photos/seed/tech/800/400",
      cta: "Explore",
      color: "bg-emerald-700",
      link: "/data"
    }
  ];

  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.id),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentTransactions(txs);
    }, (error) => {
      console.error("Transactions Sync Error:", error);
    });

    return () => unsubscribe();
  }, [user?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchWalletBalance(),
        refreshPrices(),
        adminService.getGlobalSettings()
      ]);
      addNotification("Data synchronized successfully!", "success");
    } catch (error) {
      addNotification("Failed to sync data.", "error");
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (user) {
      fetchWalletBalance();
      await Promise.all([
        adminService.getGlobalSettings(),
        vtuService.getTransactionHistory()
      ]);
    }
  }, [user, fetchWalletBalance]);

  useEffect(() => {
    fetchDashboardData();
    if (user) {
      if (!user.isPinSet) setShowPinModal(true);
      if (!user.phone) setShowPhoneModal(true);
    }
  }, [fetchDashboardData, user]);

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user!.id, pin);
    if (res.status) {
      addNotification("Your Security PIN has been saved.", "success");
      setShowPinModal(false);
    }
  };

  const handlePhoneSuccess = async (phone: string) => {
    try {
      const userRef = doc(db, "users", user!.id);
      await updateDoc(userRef, { phone: phone.trim() });
      addNotification("Phone number saved successfully!", "success");
      setShowPhoneModal(false);
    } catch (error) {
      throw new Error("Failed to save phone number.");
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      {showPhoneModal && <PhoneSetupModal onSuccess={handlePhoneSuccess} />}
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header / Top Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <span className="font-bold">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Hello, {user?.username}</h2>
              <p className="text-[10px] text-gray-500">Welcome back!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-gray-100 dark:bg-white/5 rounded-full relative">
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#022c22]"></span>
            </button>
          </div>
        </div>

        {/* Wallet Overview Card */}
        <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium opacity-80">Wallet Balance</span>
              <button onClick={() => setShowBalance(!showBalance)} className="opacity-80">
                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">
                {showBalance ? `₦${user?.walletBalance?.toLocaleString() || '0.00'}` : '₦ • • • • •'}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link to="/funding" className="flex items-center justify-center gap-2 bg-white text-emerald-900 py-4 rounded-2xl font-bold text-sm shadow-lg">
                <Plus size={18} />
                Fund Wallet
              </Link>
              <button className="flex items-center justify-center gap-2 bg-emerald-800 text-white py-4 rounded-2xl font-bold text-sm border border-emerald-700">
                <ArrowLeftRight size={18} />
                Send Money
              </button>
            </div>

            {/* Verification Alert */}
            {!user?.phone && (
              <div className="flex items-center justify-between bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/50">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span className="text-[10px] font-medium">Account not verified</span>
                </div>
                <button onClick={() => setShowPhoneModal(true)} className="text-[10px] font-bold underline">Verify Account</button>
              </div>
            )}
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Search Bar */}
        <Link to="/services" className="block relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className="w-full pl-14 pr-4 py-5 bg-white dark:bg-emerald-950/20 border border-gray-100 dark:border-emerald-900/30 rounded-[2rem] text-sm font-bold text-gray-400 flex items-center shadow-sm group-hover:border-emerald-500 transition-all">
            Search for a service...
          </div>
        </Link>

        {/* Profile Completion Section */}
        <div className="bg-white dark:bg-emerald-950/20 rounded-3xl p-6 border border-gray-100 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100 dark:text-emerald-900/50" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - 0.75)} className="text-emerald-500" />
              </svg>
              <span className="absolute text-[10px] font-bold">75%</span>
            </div>
            <div>
              <h3 className="text-sm font-bold">Complete your setup</h3>
              <p className="text-[10px] text-gray-500">Just a few more steps to go</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Quick Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/crypto" className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-3xl border border-orange-100 dark:border-orange-900/30 space-y-4 group transition-all active:scale-95">
            <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Bitcoin size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Crypto</h4>
              <p className="text-[10px] text-gray-500">Buy & Sell</p>
            </div>
          </Link>
          <Link to="/bills" className="bg-yellow-50 dark:bg-yellow-950/20 p-6 rounded-3xl border border-yellow-100 dark:border-yellow-900/30 space-y-4 group transition-all active:scale-95">
            <div className="w-12 h-12 bg-yellow-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Lightbulb size={24} />
            </div>
            <div>
              <h4 className="text-sm font-bold">Electricity</h4>
              <p className="text-[10px] text-gray-500">Pay Bills</p>
            </div>
          </Link>
        </div>

        {/* Reseller Dashboard Section */}
        {user?.role === 'reseller' && (
          <div className="bg-white dark:bg-emerald-950/20 rounded-[2.5rem] p-8 border border-gray-100 dark:border-emerald-900/30 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-sm font-bold">Reseller Dashboard</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Accumulated Profit</p>
                <h4 className="text-lg font-bold text-blue-600">₦{user?.accumulatedProfit?.toLocaleString() || '0.00'}</h4>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold">Price Preference</h4>
                  <p className="text-[10px] text-gray-500">Choose how you want to receive your reseller benefits</p>
                </div>
                <select 
                  value={user?.resellerPricePreference || 'DISCOUNT'}
                  onChange={async (e) => {
                    const pref = e.target.value;
                    try {
                      const userRef = doc(db, "users", user!.id);
                      await updateDoc(userRef, { resellerPricePreference: pref });
                      addNotification(`Price preference updated to ${pref.replace('_', ' ')}`, "success");
                    } catch (err) {
                      addNotification("Failed to update preference", "error");
                    }
                  }}
                  className="bg-white dark:bg-[#050505] border border-blue-200 dark:border-blue-900/50 rounded-xl px-4 py-2 text-[10px] font-bold outline-none"
                >
                  <option value="DISCOUNT">Direct Discount</option>
                  <option value="PROFIT_ACCUMULATION">Profit Accumulation</option>
                </select>
              </div>
              
              <div className="text-[10px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                {user?.resellerPricePreference === 'PROFIT_ACCUMULATION' 
                  ? "You are currently paying Smart User prices. The difference between Smart and Reseller prices is being saved to your profit dashboard."
                  : "You are currently paying discounted Reseller prices directly from your wallet."}
              </div>
            </div>
          </div>
        )}

        {/* Favorite Services */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Favorite Services</h3>
            <button className="text-[10px] font-bold text-emerald-600">Edit</button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            <FavoriteItem icon={<Smartphone />} label="Airtime" to="/airtime" color="bg-emerald-600" />
            <FavoriteItem icon={<Wifi />} label="Data" to="/data" color="bg-emerald-500" />
            <FavoriteItem icon={<Tv />} label="Cable" to="/cable" color="bg-emerald-400" />
            <FavoriteItem icon={<Plus />} label="Add" to="#" color="bg-gray-100 dark:bg-white/5" isPlaceholder />
            <FavoriteItem icon={<Plus />} label="Add" to="#" color="bg-gray-100 dark:bg-white/5" isPlaceholder />
          </div>
        </div>

        {/* Promotional Banner Slider */}
        <div className="relative h-48 rounded-[2.5rem] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`absolute inset-0 ${banners[currentBanner].color} p-8 flex items-center justify-between`}
            >
              <div className="space-y-3 max-w-[60%] z-10">
                <h4 className="text-xl font-bold text-white leading-tight">{banners[currentBanner].title}</h4>
                <p className="text-white/80 text-[10px]">{banners[currentBanner].desc}</p>
                <button className="px-6 py-2 bg-white text-gray-900 rounded-full text-[10px] font-bold">{banners[currentBanner].cta}</button>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/2">
                <img src={banners[currentBanner].image} alt="Promo" className="w-full h-full object-cover mix-blend-overlay opacity-60" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentBanner ? 'bg-white w-4' : 'bg-white/40'}`}></div>
            ))}
          </div>
        </div>

        {/* Pay Bills Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold">Pay Bills</h3>
          <div className="grid grid-cols-4 gap-4">
            <BillItem icon={<Smartphone />} label="Airtime" to="/airtime" color="text-emerald-600" />
            <BillItem icon={<Wifi />} label="Data" to="/data" color="text-emerald-500" />
            <BillItem icon={<Tv />} label="Cable TV" to="/cable" color="text-emerald-400" />
            <BillItem icon={<Lightbulb />} label="Electricity" to="/bills" color="text-emerald-600" />
            <BillItem icon={<GraduationCap />} label="Education" to="/education" color="text-emerald-500" />
            <BillItem icon={<Bitcoin />} label="Crypto" to="/crypto" color="text-emerald-700" />
            <BillItem icon={<LayoutGrid />} label="More" to="/services" color="text-gray-500" />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold">Recent Transactions</h3>
            <Link to="/history" className="text-[10px] font-bold text-emerald-600">See All</Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <TransactionItem 
                  key={tx.id}
                  title={tx.type === 'funding' ? 'Wallet Funding' : tx.service || tx.type} 
                  amount={`${tx.type === 'funding' ? '+' : '-'}₦${tx.amount?.toLocaleString()}`} 
                  date={tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleString() : 'Just now'} 
                  status={tx.status || 'PENDING'} 
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 text-xs">No transactions found</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const FavoriteItem = ({ icon, label, to, color, isPlaceholder }: any) => (
  <Link to={to} className="flex flex-col items-center gap-2 flex-shrink-0">
    <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center ${isPlaceholder ? 'text-gray-400 border-2 border-dashed border-gray-200 dark:border-white/10' : 'text-white shadow-lg'}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
  </Link>
);

const BillItem = ({ icon, label, to, color }: any) => (
  <Link to={to} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-gray-100 dark:border-emerald-900/30 transition-all active:scale-95">
    <div className={`${color}`}>
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
    </div>
    <span className="text-[9px] font-bold text-center leading-tight">{label}</span>
  </Link>
);

const TransactionItem = ({ title, amount, date, status }: any) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-gray-100 dark:border-emerald-900/30">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${amount.startsWith('+') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
        {amount.startsWith('+') ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
      </div>
      <div>
        <h4 className="text-xs font-bold capitalize">{title.replace(/_/g, ' ')}</h4>
        <p className="text-[10px] text-gray-500">{date}</p>
      </div>
    </div>
    <div className="text-right">
      <h4 className={`text-xs font-bold ${amount.startsWith('+') ? 'text-emerald-600' : 'text-gray-900 dark:text-white'}`}>{amount}</h4>
      <span className={`text-[8px] font-bold uppercase tracking-widest ${status === 'SUCCESS' ? 'text-emerald-500' : 'text-orange-500'}`}>{status}</span>
    </div>
  </div>
);

const Minus = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default DashboardPage;
