
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
      `flex items-center space-x-4 p-5 rounded-[1.75rem] transition-all duration-300 group relative ${
        isActive
          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-500/30 scale-[1.02]'
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'
      }`
    }
  >
    <span className="shrink-0 transition-transform group-hover:scale-110 z-10">{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-[0.25em] z-10">{children}</span>
    <div className={`absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.75rem] pointer-events-none`} />
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
    <div className="h-full flex flex-col bg-white overflow-hidden border-r border-gray-100">
      <div className="p-10 mb-4">
        <Logo />
      </div>
      <nav className="flex-grow px-8 space-y-2 overflow-y-auto no-scrollbar pb-10">
        <div className="px-5 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-300">Hub Overview</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/funding" icon={<WalletIcon />} onClick={closeSidebar}>Add Money</NavItem>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>History</NavItem>
        
        <div className="px-5 mt-10 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-300">Terminal Services</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Mobile Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable TV</NavItem>
        <NavItem to="/education" icon={<GamingIcon />} onClick={closeSidebar}>Exam Pins</NavItem>

        <div className="px-5 mt-10 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-300">Account Nodes</div>
        <NavItem to="/referral" icon={<UsersIcon />} onClick={closeSidebar}>Refer & Earn</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Price List</NavItem>
        <NavItem to="/profile" icon={<ShieldCheckIcon />} onClick={closeSidebar}>My Profile</NavItem>
        <NavItem to="/support" icon={<BoltIcon />} onClick={closeSidebar}>Help Center</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-10 mt-10 border-t border-gray-50">
            <div className="px-5 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-red-500">Master Terminal</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Admin Panel</NavItem>
          </div>
        )}
      </nav>
      <div className="p-10 bg-gray-50/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 p-5 rounded-[1.5rem] text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 group"
        >
          <LogoutIcon />
          <span className="group-hover:translate-x-1 transition-transform">Exit Session</span>
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
