
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import Logo from './Logo';
import Modal from './Modal';
import ChatBubble from './ChatBubble';
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
      `flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-[1.02]'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <span className="shrink-0 transition-transform group-hover:scale-110">{icon}</span>
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="p-10 mb-6">
        <Logo />
      </div>
      <nav className="flex-grow px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Core Engine</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Terminal</NavItem>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>History</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Tariffs</NavItem>
        
        <div className="px-4 mt-8 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Assets</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Data Bundles</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable TV</NavItem>

        <div className="px-4 mt-8 mb-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Governance</div>
        <NavItem to="/referral" icon={<UsersIcon />} onClick={closeSidebar}>Refer and Earn</NavItem>
        <NavItem to="/support" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Help Center</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-8 mt-8 border-t border-gray-100">
            <div className="px-4 mb-2 text-[8px] font-black uppercase tracking-[0.3em] text-red-500">Master Control</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Admin Hub</NavItem>
          </div>
        )}
      </nav>
      <div className="p-8">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-2xl text-red-500 bg-red-50/50 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
        >
          <LogoutIcon />
          <span>Exit Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col lg:flex-row">
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-100 flex-shrink-0 sticky top-0 h-screen shadow-sm z-50">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-[100] transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-80 z-[101] transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-12 py-5 lg:py-6 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <button className="lg:hidden text-gray-900 p-3 bg-gray-100 rounded-xl active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className="hidden sm:block">
               <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none">Identity: <span className="text-gray-900">{user?.fullName || 'User Node'}</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-6">
             {/* Notif & Dark Mode Placeholders as requested */}
             <div className="flex items-center space-x-2 mr-2">
                <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
                <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                   <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                </button>
             </div>

            <div className="flex items-center space-x-4 pl-4 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Portfolio</p>
                  <p className="text-gray-900 font-black text-sm tracking-tighter">₦{walletBalance?.toLocaleString() || '0.00'}</p>
               </div>
               <button 
                onClick={() => navigate('/profile')}
                className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gray-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-blue-600 font-black text-xs hover:scale-105 transition-all active:scale-95"
               >
                  {user?.fullName?.charAt(0) || 'U'}
               </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-14 overflow-y-auto w-full max-w-7xl mx-auto custom-scrollbar relative">
          {children}
          {location.pathname !== '/admin' && <ChatBubble />}
        </main>
      </div>

      <Modal 
        isOpen={isFundModalOpen} 
        onClose={() => setIsFundModalOpen(false)} 
        title="Liquidate Node"
        footer={
          <div className="flex space-x-4 w-full">
            <button className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-500" onClick={() => setIsFundModalOpen(false)}>Abort</button>
            {fundMethod === 'AUTO' && (
              <button 
                className="flex-2 bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-blue-100"
                onClick={() => { 
                   // Logic for Paystack will be handled in a dedicated component or service
                  addNotification("Initializing secure Paystack node...", "info");
                  setIsFundModalOpen(false); 
                }}
              >
                Start Verification
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${fundMethod === 'AUTO' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('AUTO')}>Paystack Auto</button>
            <button className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${fundMethod === 'MANUAL' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFundMethod('MANUAL')}>Bank Transfer</button>
          </div>

          {fundMethod === 'AUTO' ? (
            <div className="animate-in fade-in slide-in-from-bottom-2">
              <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Funding Amount (₦)</label>
              <input type="number" className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-2xl font-black tracking-tighter focus:ring-4 focus:ring-blue-50 transition-all outline-none" placeholder="0.00" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} />
              <p className="mt-4 text-[10px] font-bold text-gray-400 italic">Credits reflect instantly on the OBATA Master Ledger.</p>
            </div>
          ) : (
            <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Master Node Bank</p>
              <h3 className="text-3xl font-black tracking-tighter">8142452729</h3>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <p className="text-blue-500 font-black text-sm mb-1 uppercase tracking-widest">OBATA Palmpay Terminal</p>
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
