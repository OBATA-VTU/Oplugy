
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from './Spinner';
import Logo from './Logo';
import Modal from './Modal';
import { 
  HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  LogoutIcon, MenuIcon, HistoryIcon, WalletIcon,
  ShieldCheckIcon, CurrencyDollarIcon, UsersIcon
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
      `flex items-center space-x-3.5 p-4 rounded-2xl transition-all duration-300 ${
        isActive
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-100'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <span className="shrink-0">{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-[0.2em]">{children}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, walletBalance, logout } = useAuth();
  const { addNotification } = useNotifications();
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
    '/history': 'Transactions',
    '/pricing': 'Service Rates',
    '/admin': 'Master Terminal',
    '/referral': 'Referral Program',
    '/support': 'Support',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-8 mb-4">
        <Logo />
      </div>
      <nav className="flex-grow px-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {user?.role === 'admin' && (
          <div className="mb-6">
            <div className="px-4 mb-2 text-[8px] font-black uppercase tracking-[0.3em] text-blue-600">Matrix Control</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Master Hub</NavItem>
          </div>
        )}

        <div className="px-4 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Main</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Overview</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Live Tariffs</NavItem>
        
        <div className="px-4 mt-8 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Goods</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Data Plans</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Utility Bills</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>TV Renewals</NavItem>

        <div className="px-4 mt-8 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Account</div>
        <NavItem to="/referral" icon={<UsersIcon />} onClick={closeSidebar}>Affiliates</NavItem>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>Ledger</NavItem>
        <NavItem to="/support" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Help Center</NavItem>
      </nav>
      <div className="p-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogoutIcon />
          <span>Secure Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-100 flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-40 transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between p-4 lg:p-6 px-6 lg:px-10 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-500 p-2 bg-gray-50 rounded-xl" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter hidden sm:block">{pageTitles[location.pathname] || 'OBATA'}</h1>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-8">
            <div className="hidden sm:block text-right">
              <span className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Portfolio Balance</span>
              <div className="text-gray-900 font-black text-lg tracking-tighter leading-none">
                ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}
              </div>
            </div>
            <button 
              onClick={() => setIsFundModalOpen(true)}
              className="bg-blue-600 hover:bg-black text-white px-5 lg:px-7 py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-100 flex items-center space-x-2"
            >
              <WalletIcon />
              <span>Fund</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 lg:p-12 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar">
          {children}
        </main>
      </div>

      <Modal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        title="Fund Portfolio"
        footer={
          <div className="flex space-x-4 w-full">
            <button className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500" onClick={() => setIsFundModalOpen(false)}>Close</button>
            {fundMethod === 'AUTO' && (
              <button 
                className="flex-2 bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-blue-100"
                onClick={() => { 
                  addNotification("Initializing payment node...", "info");
                  setIsFundModalOpen(false); 
                }}
              >
                Proceed to Gateway
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${fundMethod === 'AUTO' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('AUTO')}>Paystack (Auto)</button>
            <button className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${fundMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('MANUAL')}>Transfer</button>
          </div>

          {fundMethod === 'AUTO' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Funding Amount (₦)</label>
              <input type="number" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-2xl font-black tracking-tighter focus:ring-4 focus:ring-blue-50 transition-all outline-none" placeholder="0.00" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} />
              <p className="mt-4 text-[10px] font-bold text-gray-400 italic">Credits reflect instantly on the OBATA Master Ledger.</p>
            </div>
          ) : (
            <div className="bg-gray-900 text-white p-8 lg:p-10 rounded-[2.5rem] space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Bank Details</p>
              <h3 className="text-3xl font-black tracking-tighter">8142452729</h3>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <p className="text-blue-500 font-black text-sm mb-1 uppercase tracking-widest">OBATA Palmpay Node</p>
                <p className="text-xs font-bold text-white/80">Boluwatife Oluwapelumi Ayuba</p>
              </div>
              <p className="text-[10px] text-white/30 italic leading-relaxed">Send screenshot to OBATA Support for manual node verification.</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Layout;
