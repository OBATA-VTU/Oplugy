
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import ChatBubble from './ChatBubble';
import { 
  HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, 
  LogoutIcon, MenuIcon, HistoryIcon, WalletIcon,
  ShieldCheckIcon, CurrencyDollarIcon, UsersIcon, GamingIcon,
  ClockIcon
} from './Icons';

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110`}>{icon}</span>
    <span className="font-semibold text-sm tracking-tight">{children}</span>
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
    <div className="h-full flex flex-col bg-white text-gray-900 overflow-hidden border-r border-gray-100">
      <div className="p-8 mb-2">
        <Logo />
        <div className="mt-8 p-4 bg-blue-50 rounded-3xl border border-blue-100/50">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                 {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                 <p className="text-sm font-bold text-gray-900 truncate">{user?.username || 'User'}</p>
                 <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{user?.role || 'Member'}</p>
              </div>
           </div>
        </div>
      </div>
      
      <nav className="flex-grow px-4 space-y-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Main Menu</div>
        <NavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/funding" icon={<WalletIcon />} onClick={closeSidebar}>Add Funds</NavItem>
        <NavItem to="/schedule" icon={<ClockIcon />} onClick={closeSidebar}>Schedule Purchase</NavItem>
        <NavItem to="/history" icon={<HistoryIcon />} onClick={closeSidebar}>History</NavItem>
        
        <div className="px-4 py-3 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Services</div>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Buy Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Buy Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable TV</NavItem>
        <NavItem to="/education" icon={<GamingIcon />} onClick={closeSidebar}>Exam PINs</NavItem>

        <div className="px-4 py-3 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Account</div>
        <NavItem to="/referral" icon={<UsersIcon />} onClick={closeSidebar}>Refer & Earn</NavItem>
        <NavItem to="/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Price List</NavItem>
        <NavItem to="/profile" icon={<ShieldCheckIcon />} onClick={closeSidebar}>My Profile</NavItem>
        <NavItem to="/support" icon={<BoltIcon />} onClick={closeSidebar}>Support</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-6 mt-6 border-t border-gray-100">
            <div className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Admin Control</div>
            <NavItem to="/admin" icon={<ShieldCheckIcon />} onClick={closeSidebar}>Admin Panel</NavItem>
          </div>
        )}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm tracking-tight group"
        >
          <LogoutIcon />
          <span>Logout</span>
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
