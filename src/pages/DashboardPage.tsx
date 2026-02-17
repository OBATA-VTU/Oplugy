
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/Spinner';
import PinSetupModal from '../components/PinSetupModal';
import { adminService } from '../services/adminService';
import { authService } from '../services/authService';
import { vtuService } from '../services/vtuService';
import { TransactionResponse } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  WalletIcon, HistoryIcon, ArrowIcon
} from '../components/Icons';

const DashboardPage: React.FC = () => {
  const { fetchWalletBalance, isLoading, isAuthenticated, user, walletBalance } = useAuth();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (isAuthenticated) {
      fetchWalletBalance();
      setIsHistoryLoading(true);
      
      const [settingsRes, historyRes] = await Promise.all([
        adminService.getGlobalSettings(),
        vtuService.getTransactionHistory()
      ]);

      if (settingsRes.status && settingsRes.data?.announcement) {
        setAnnouncement(settingsRes.data.announcement);
      }
      
      if (historyRes.status && historyRes.data) {
        setRecentTransactions(historyRes.data.slice(0, 5));
      }
      setIsHistoryLoading(false);
    }
  }, [isAuthenticated, fetchWalletBalance]);

  useEffect(() => {
    fetchDashboardData();
    if (user && !user.isPinSet) {
      setShowPinModal(true);
    }
  }, [fetchDashboardData, user]);

  const handlePinSuccess = async (pin: string) => {
    const res = await authService.setTransactionPin(user.id, pin);
    if (res.status) {
      setShowPinModal(false);
    } else {
      throw new Error(res.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-orange-50 text-orange-600 border-orange-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Spinner />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Establishing Secure Session...</p>
      </div>
    );
  }

  return (
    <>
      {showPinModal && <PinSetupModal onSuccess={handlePinSuccess} />}
      
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12 pb-20">
        
        {/* User Greeting & Announcement */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Welcome Back</h2>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Hello, {user?.fullName?.split(' ')[0] || 'User'}</h1>
          </div>
          {announcement && (
            <div className="flex items-center space-x-3 bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 max-w-sm">
              <BoltIcon />
              <p className="text-[11px] font-bold text-blue-700 truncate">{announcement}</p>
            </div>
          )}
        </div>

        {/* PROMINENT BALANCE HERO CARD */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[3rem] p-10 lg:p-14 text-white shadow-2xl shadow-blue-100/20 group">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Available Balance</p>
              <div className="text-6xl lg:text-8xl font-black tracking-tighter leading-none">
                ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="flex items-center space-x-2 text-green-400 text-[10px] font-black uppercase tracking-widest bg-green-400/10 px-4 py-1.5 rounded-full w-fit">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span>Active Vault Node</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/dashboard')} // In real app, this would open funding modal or page
                className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-white hover:text-blue-600 text-white p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-blue-600/30 group/btn"
              >
                <WalletIcon />
                <span>Fund Wallet</span>
                <ArrowIcon />
              </button>
              <button 
                onClick={() => navigate('/airtime')}
                className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white hover:text-gray-900 text-white p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border border-white/10"
              >
                <PhoneIcon />
                <span>Buy Airtime</span>
              </button>
              <button 
                onClick={() => navigate('/data')}
                className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white hover:text-gray-900 text-white p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border border-white/10"
              >
                <SignalIcon />
                <span>Get Data Bundle</span>
              </button>
              <Link 
                to="/pricing"
                className="flex items-center justify-center space-x-3 bg-white/5 hover:bg-white/10 text-white/60 p-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border border-white/5"
              >
                <ArrowIcon />
                <span>View All Pricing</span>
              </Link>
            </div>
          </div>
          
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[120px] -z-0 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/5 rounded-full blur-[80px] -z-0 pointer-events-none"></div>
        </div>

        {/* VTU SERVICES VISUAL GALLERY */}
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-2">Our Ecosystem</h3>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Premium Services</h2>
            </div>
            <Link to="/pricing" className="text-[11px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Explorer All</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceVisualCard 
              to="/data"
              title="Mobile Data"
              description="SME, Gifting & Corporate plans"
              img="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800"
              tag="Best Rates"
            />
            <ServiceVisualCard 
              to="/bills"
              title="Electricity"
              description="Pay utility bills instantly"
              img="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&q=80&w=800"
              tag="Instant Token"
            />
            <ServiceVisualCard 
              to="/cable"
              title="Cable TV"
              description="DStv, GOtv & Startimes"
              img="https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&q=80&w=800"
              tag="Automated"
            />
          </div>
        </div>

        {/* RECENT TRANSACTION HISTORY */}
        <div className="bg-white rounded-[3rem] p-10 lg:p-14 shadow-xl border border-gray-50 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Transaction Ledger</h3>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">Your recent financial activity</p>
            </div>
            <Link to="/history" className="flex items-center space-x-2 bg-gray-50 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-all">
              <span>Full History</span>
              <HistoryIcon />
            </Link>
          </div>

          {isHistoryLoading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100 group">
                  <div className="flex items-center space-x-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      {tx.type.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 tracking-tight text-lg">{tx.source}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(tx.date_created).toLocaleDateString()} • {new Date(tx.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-gray-900 tracking-tighter">₦{tx.amount.toLocaleString()}</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200">
                <HistoryIcon />
              </div>
              <div>
                <p className="text-gray-900 font-black text-xl tracking-tighter">No Activity Found</p>
                <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm mt-2">Start using OBATA v2 to see your transaction history here.</p>
              </div>
              <button onClick={() => navigate('/airtime')} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-100">Make First Purchase</button>
            </div>
          )}
        </div>

      </div>
    </>
  );
};

const ServiceVisualCard = ({ to, title, description, img, tag }: any) => (
  <Link to={to} className="relative h-72 rounded-[3rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
    <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-10">
      <span className="bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3">{tag}</span>
      <h4 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{title}</h4>
      <p className="text-white/60 text-sm font-medium">{description}</p>
    </div>
  </Link>
);

export default DashboardPage;
