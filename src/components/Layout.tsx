import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import Logo from './Logo';
import Modal from './Modal';
import { HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, LogoutIcon, MenuIcon, HistoryIcon, WalletIcon } from './Icons';

interface LayoutProps {
  children: ReactNode;
}

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="font-bold text-sm tracking-tight">{children}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { walletBalance, isAuthenticated, logout, isLoading } = useAuth();
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
    '/data': 'Data Subscriptions',
    '/bills': 'Electricity Bills',
    '/cable': 'Cable TV',
    '/history': 'Transaction History'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleFundWallet = () => {
    if (fundMethod === 'AUTO') {
      // Mock Paystack integration
      alert(`Connecting to Paystack for ₦${fundAmount}. This is a demo integration.`);
      setIsFundModalOpen(false);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 mb-4">
        <Logo />
      </div>
      <nav className="flex-grow px-4 space-y-1.5">
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Buy Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Buy Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable TV</NavItem>
        <div className="pt-4 pb-2">
          <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Activity</div>
          <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>Transactions</NavItem>
        </div>
      </nav>
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-100 flex-shrink-0">
        {sidebarContent}
      </aside>
      
      {/* Sidebar Mobile */}
      <div className={`fixed inset-0 z-40 transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between p-4 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-500 hover:text-blue-600 transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{pageTitles[location.pathname] || 'Oplug'}</h1>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-5">
            {isAuthenticated && (
              <>
                <button 
                  onClick={() => setIsFundModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-4 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all shadow-xl shadow-blue-100 flex items-center space-x-2"
                >
                  <WalletIcon />
                  <span className="hidden sm:inline">Fund Wallet</span>
                </button>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Balance</span>
                  <div className="text-gray-900 font-black text-sm sm:text-base tracking-tighter">
                    ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '...'}
                  </div>
                </div>
              </>
            )}
            {isLoading && <Spinner />}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Fund Wallet Modal */}
      <Modal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        title="Fund Oplug Wallet"
        footer={
          <div className="flex space-x-3 w-full">
            <button className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-200 transition-colors" onClick={() => setIsFundModalOpen(false)}>Close</button>
            {fundMethod === 'AUTO' && (
              <button 
                className="flex-1 bg-blue-600 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                onClick={handleFundWallet}
                disabled={!fundAmount || parseFloat(fundAmount) < 100}
              >
                Pay Now
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button 
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${fundMethod === 'AUTO' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setFundMethod('AUTO')}
            >
              Paystack
            </button>
            <button 
              className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${fundMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => setFundMethod('MANUAL')}
            >
              Manual
            </button>
          </div>

          {fundMethod === 'AUTO' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Amount to fund (₦)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
                <input 
                  type="number" 
                  className="w-full p-5 pl-10 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white focus:border-blue-200 transition-all text-xl font-black tracking-tighter"
                  placeholder="0.00"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                />
              </div>
              <div className="mt-4 flex items-center space-x-3 bg-blue-50 p-4 rounded-2xl text-blue-600">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                <p className="text-xs font-bold leading-relaxed">Secure automatic funding via Paystack. Funds reflect instantly.</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-white border-2 border-dashed border-blue-100 p-8 rounded-[2rem] text-center space-y-6">
                <div>
                  <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Account details</p>
                  <p className="text-blue-600 font-black text-3xl tracking-tighter">8142452729</p>
                  <p className="text-gray-900 font-black text-lg">Palmpay</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Name</p>
                   <p className="text-sm font-bold text-gray-800">Boluwatife Oluwapelumi Ayuba</p>
                </div>
                <p className="text-xs text-gray-500 font-medium italic">Send proof of payment to support@oplug.com or WhatsApp +234 814 245 2729 for instant credit.</p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Layout;