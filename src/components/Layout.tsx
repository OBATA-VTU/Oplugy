
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import ChatBubble from './ChatBubble';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Smartphone, Wifi, Zap, Tv, 
  LogOut, Menu, History, Wallet,
  ShieldCheck, DollarSign, Users, Gamepad2,
  Bell, Sun, Moon, Clock, ChevronRight
} from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-between px-6 py-4 rounded-[1.5rem] transition-all duration-500 group ${
        isActive
          ? 'bg-blue-600 text-white shadow-2xl shadow-blue-200 dark:shadow-blue-900/20'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
      }`
    }
  >
    <div className="flex items-center space-x-4">
      <span className={`shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>{icon}</span>
      <span className="font-black text-[11px] uppercase tracking-widest">{children}</span>
    </div>
    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
  </NavLink>
);

const Layout: React.FC = () => {
  const { user, walletBalance, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-hidden border-r border-gray-100 dark:border-gray-900">
      <div className="p-10 mb-2">
        <Logo />
        <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-950/30 rounded-[2.5rem] border border-blue-100/50 dark:border-blue-900/30 group cursor-pointer hover:scale-[1.02] transition-all" onClick={() => { navigate('/profile'); closeSidebar(); }}>
           <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-blue-200 dark:shadow-none group-hover:rotate-6 transition-all">
                 {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                 <p className="text-lg font-black text-gray-900 dark:text-white tracking-tighter leading-none mb-1 truncate">{user?.username || 'User'}</p>
                 <p className="text-[9px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-[0.2em]">{user?.role || 'Member'}</p>
              </div>
           </div>
        </div>
      </div>
      
      <nav className="flex-grow px-6 space-y-2 overflow-y-auto no-scrollbar pb-10">
        <div className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600">Main Menu</div>
        <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/funding" icon={<Wallet className="w-5 h-5" />} onClick={closeSidebar}>Add Funds</NavItem>
        <NavItem to="/schedule" icon={<Clock className="w-5 h-5" />} onClick={closeSidebar}>Schedule</NavItem>
        <NavItem to="/history" icon={<History className="w-5 h-5" />} onClick={closeSidebar}>Transactions</NavItem>
        
        <div className="px-6 py-4 mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600">Services</div>
        <NavItem to="/airtime" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<Wifi className="w-5 h-5" />} onClick={closeSidebar}>Data</NavItem>
        <NavItem to="/bills" icon={<Zap className="w-5 h-5" />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/cable" icon={<Tv className="w-5 h-5" />} onClick={closeSidebar}>Cable TV</NavItem>
        <NavItem to="/education" icon={<Gamepad2 className="w-5 h-5" />} onClick={closeSidebar}>Education</NavItem>

        <div className="px-6 py-4 mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600">Account</div>
        <NavItem to="/referrals" icon={<Users className="w-5 h-5" />} onClick={closeSidebar}>Referrals</NavItem>
        <NavItem to="/pricing" icon={<DollarSign className="w-5 h-5" />} onClick={closeSidebar}>Pricing</NavItem>
        <NavItem to="/profile" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Profile</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-gray-900">
            <div className="px-6 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-red-500">Admin</div>
            <NavItem to="/admin" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Admin Panel</NavItem>
          </div>
        )}
      </nav>

      <div className="p-8 border-t border-gray-100 dark:border-gray-900">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-6 py-4 rounded-[1.5rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-black text-[11px] uppercase tracking-widest group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col lg:flex-row font-sans transition-colors duration-500">
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white dark:bg-gray-950 flex-shrink-0 sticky top-0 h-screen z-50">
        {sidebarContent}
      </aside>
      
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl lg:hidden" 
            onClick={closeSidebar} 
          />
        )}
      </AnimatePresence>

      <aside className={`fixed top-0 left-0 h-full w-80 z-[101] transform transition-transform duration-500 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-3xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-16 py-6 border-b border-gray-100 dark:border-gray-900">
          <div className="flex items-center space-x-6">
            <button className="lg:hidden text-gray-900 dark:text-white p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <h1 className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.5em] leading-none">Obata App <span className="text-blue-600">v2.1.0</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-8">
             <div className="hidden md:flex items-center space-x-2">
                <button 
                  onClick={toggleTheme}
                  className="p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all transform active:scale-90"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`p-4 rounded-2xl transition-all transform active:scale-90 ${notificationsEnabled ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30' : 'bg-gray-100 text-gray-400 dark:bg-gray-900'}`}
                  title="Toggle Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
             </div>

             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.4em] mb-1">Balance</p>
                <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tighter leading-none">₦{walletBalance?.toLocaleString() || '0.00'}</p>
             </div>

             <div className="w-px h-10 bg-gray-100 dark:bg-gray-900 hidden sm:block"></div>

             <button 
              onClick={() => navigate('/profile')}
              className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-900 border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center text-blue-600 font-black text-lg hover:scale-110 transition-all hover:bg-blue-600 hover:text-white"
             >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
             </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-16 w-full max-w-[1600px] mx-auto relative no-scrollbar">
          <Outlet />
          {location.pathname !== '/admin' && <ChatBubble />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
