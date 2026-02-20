
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import ChatBubble from './ChatBubble';
import { 
  HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  LogoutIcon, MenuIcon, HistoryIcon, WalletIcon,
  ShieldCheckIcon, CurrencyDollarIcon, UsersIcon, GamingIcon
} from './Icons';

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 group relative border-b border-white/5 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`
    }
  >
    <span className="shrink-0 transition-transform group-hover:scale-110 z-10">{icon}</span>
    <span className="font-bold text-[11px] uppercase tracking-[0.15em] z-10">{children}</span>
  </NavLink>
);

const Layout: React.FC = () => {
  const { user, walletBalance, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-[#0A0A0B] text-white overflow-hidden">
      <div className="p-10 mb-4 border-b border-white/5">
        <Logo />
        <div className="mt-6 flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
           <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
           </div>
           <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-widest truncate">{user?.username || 'User'}</p>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Active Node</p>
           </div>
        </div>
      </div>
      
      <nav className="flex-grow px-6 space-y-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Core Systems</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Terminal Hub</NavItem>
        <NavItem to="/funding" icon={<WalletIcon />} onClick={closeSidebar}>Liquidity Influx</NavItem>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>System Ledger</NavItem>
        
        <div className="px-4 py-4 mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Service Nodes</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Voice Node</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Packet Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Power Grid</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Media Stream</NavItem>
        <NavItem to="/education" icon={<GamingIcon />} onClick={closeSidebar}>Auth Tokens</NavItem>

        <div className="px-4 py-4 mt-6 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">Account Config</div>
        <NavItem to="/referral" icon={<UsersIcon />} onClick={closeSidebar}>Node Expansion</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Tariff Matrix</NavItem>
        <NavItem to="/profile" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Security Vault</NavItem>
        <NavItem to="/support" icon={<BoltIcon />} onClick={closeSidebar}>Debug Center</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-6 mt-6 border-t border-white/5">
            <div className="px-4 mb-4 text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Master Control</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Admin Terminal</NavItem>
          </div>
        )}
      </nav>

      <div className="p-8 bg-black/40 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-black text-[10px] uppercase tracking-widest group"
        >
          <LogoutIcon />
          <span className="group-hover:translate-x-1 transition-transform">Terminate Session</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col lg:flex-row font-sans">
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white flex-shrink-0 sticky top-0 h-screen z-50">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-[100] transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/90 backdrop-blur-3xl' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-80 z-[101] transform transition-transform duration-500 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-3xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-16 py-6 border-b border-gray-100">
          <div className="flex items-center space-x-6">
            <button className="lg:hidden text-gray-900 p-4 bg-gray-100 rounded-2xl active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className="hidden sm:block">
               <h1 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] leading-none">Matrix Node <span className="text-blue-600">v2.1</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-5 lg:space-x-8">
             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">Total Liquidity</p>
                <p className="text-gray-900 font-black text-2xl tracking-tighter leading-none">₦{walletBalance?.toLocaleString() || '0.00'}</p>
             </div>
             <div className="w-1.5 h-12 bg-gray-100 rounded-full hidden sm:block"></div>
             <button 
              onClick={() => navigate('/profile')}
              className="w-14 h-14 rounded-2xl bg-gray-100 border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center text-blue-600 font-black text-lg hover:scale-110 transition-all hover:bg-blue-600 hover:text-white"
             >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
             </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-16 w-full max-w-[1400px] mx-auto relative no-scrollbar">
          <Outlet />
          {location.pathname !== '/admin' && <ChatBubble />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
