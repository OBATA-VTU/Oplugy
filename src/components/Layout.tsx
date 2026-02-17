
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import Logo from './Logo';
import Modal from './Modal';
import { 
  HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  LogoutIcon, MenuIcon, HistoryIcon, WalletIcon,
  GamingIcon, GiftIcon, ExchangeIcon, ShieldCheckIcon,
  CurrencyDollarIcon
} from './Icons';

interface LayoutProps {
  children: ReactNode;
}

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3.5 rounded-2xl transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-[1.02]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="font-black text-[11px] uppercase tracking-widest">{children}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, walletBalance, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundMethod, setFundMethod] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [fundAmount, setFundAmount] = useState('');

  const pageTitles: { [key: string]: string } = {
    '/': 'Dashboard',
    '/dashboard': 'Dashboard',
    '/airtime': 'Airtime Recharge',
    '/data': 'Data Bundle',
    '/bills': 'Utility Bills',
    '/cable': 'Cable TV',
    '/history': 'Activity Logs',
    '/pricing': 'Service Rates',
    '/gaming': 'Gaming Hub',
    '/giftcards': 'Digital Assets',
    '/airtime-to-cash': 'Liquidity Conversion',
    '/admin': 'Master Hub'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-8 mb-6">
        <Logo />
      </div>
      <nav className="flex-grow px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        {user?.role === 'admin' && (
          <>
            <div className="px-4 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600">Administration</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Admin Panel</NavItem>
            <div className="h-4"></div>
          </>
        )}

        <div className="px-4 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Core</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Price List</NavItem>
        
        <div className="px-4 mt-8 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Telephony</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Data Plans</NavItem>
        
        <div className="px-4 mt-8 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Subscription</div>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Power Bill</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>TV Subscription</NavItem>

        <div className="px-4 mt-8 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Value Added</div>
        <NavItem to="/gaming" icon={<GamingIcon />} onClick={closeSidebar}>Gaming</NavItem>
        <NavItem to="/giftcards" icon={<GiftIcon />} onClick={closeSidebar}>Gift Cards</NavItem>
        <NavItem to="/airtime-to-cash" icon={<ExchangeIcon />} onClick={closeSidebar}>Air-to-Cash</NavItem>

        <div className="px-4 mt-8 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Repository</div>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>Transactions</NavItem>
      </nav>
      <div className="p-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-[11px] uppercase tracking-widest"
        >
          <LogoutIcon />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-100 flex-shrink-0">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-40 transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/70 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between p-5 px-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-500 p-2" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter">{pageTitles[location.pathname] || 'OBATA'}</h1>
          </div>
          
          <div className="flex items-center space-x-6">
            {isAuthenticated && (
              <>
                <button 
                  onClick={() => setIsFundModalOpen(true)}
                  className="bg-blue-600 hover:bg-black text-white px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-100 flex items-center space-x-2"
                >
                  <WalletIcon />
                  <span className="hidden sm:inline">Fund Wallet</span>
                </button>
                <div className="text-right">
                  <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Portfolio</span>
                  <div className="text-gray-900 font-black text-lg tracking-tighter leading-none">
                    ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}
                  </div>
                </div>
              </>
            )}
            {isLoading && <Spinner />}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      <Modal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        title="Fund OBATA Wallet"
        footer={
          <div className="flex space-x-3 w-full">
            <button className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-gray-500" onClick={() => setIsFundModalOpen(false)}>Close</button>
            {fundMethod === 'AUTO' && (
              <button 
                className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-blue-100"
                onClick={() => { alert('Initializing Secure Payment Gateway...'); setIsFundModalOpen(false); }}
              >
                Continue
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${fundMethod === 'AUTO' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('AUTO')}>Paystack (Auto)</button>
            <button className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${fundMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('MANUAL')}>Manual Transfer</button>
          </div>

          {fundMethod === 'AUTO' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Amount to fund (₦)</label>
              <input type="number" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-2xl font-black tracking-tighter" placeholder="0.00" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} />
            </div>
          ) : (
            <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Bank Details</p>
              <h3 className="text-3xl font-black tracking-tighter">8142452729</h3>
              <div className="bg-white/5 p-4 rounded-2xl">
                <p className="text-blue-500 font-black text-sm">Palmpay</p>
                <p className="text-xs font-medium text-white/70">Boluwatife Oluwapelumi Ayuba</p>
              </div>
              <p className="text-[10px] text-white/30 italic leading-relaxed">Send payment proof to WhatsApp +2348142452729 for instant verification.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
