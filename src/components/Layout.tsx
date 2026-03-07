import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Smartphone, Wifi, Zap, Tv, 
  LogOut, Menu, History, Wallet,
  ShieldCheck, DollarSign, Users, Gamepad2, ArrowLeftRight,
  Bell, Sun, Moon, Clock, ChevronRight, X, Search, CreditCard, Globe
} from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-hidden ${
        isActive
          ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
      }`
    }
  >
    <div className="flex items-center space-x-4 relative z-10">
      <span className={`shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>{icon}</span>
      <span className="font-bold text-[11px] uppercase tracking-widest">{children}</span>
    </div>
    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 relative z-10" />
    
    {/* Hover Effect Background */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-0 transition-opacity"></div>
  </NavLink>
);

const Layout: React.FC = () => {
  const { user, walletBalance, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#050505] text-gray-900 dark:text-white overflow-hidden border-r border-gray-100 dark:border-white/5 relative">
      <div className="p-10 mb-2 flex justify-between items-center">
        <Logo />
        <button 
          onClick={closeSidebar}
          className="lg:hidden w-10 h-10 bg-gray-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-900 dark:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-grow px-6 space-y-2 overflow-y-auto no-scrollbar pb-10">
        <div className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">Main</div>
        <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />} onClick={closeSidebar}>Dashboard</NavItem>
        
        <div className="px-6 py-4 mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">Services</div>
        <NavItem to="/airtime" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Buy Airtime</NavItem>
        <NavItem to="/data" icon={<Wifi className="w-5 h-5" />} onClick={closeSidebar}>Buy Data</NavItem>
        <NavItem to="/cable" icon={<Tv className="w-5 h-5" />} onClick={closeSidebar}>Cable Subscription</NavItem>
        <NavItem to="/bills" icon={<Zap className="w-5 h-5" />} onClick={closeSidebar}>Electricity Payment</NavItem>
        <NavItem to="/education" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Education Pins</NavItem>
        <NavItem to="/schedule" icon={<Clock className="w-5 h-5" />} onClick={closeSidebar}>Schedule Transaction</NavItem>

        <div className="px-6 py-4 mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">Payments</div>
        <NavItem to="/funding" icon={<Wallet className="w-5 h-5" />} onClick={closeSidebar}>Fund Wallet</NavItem>
        <NavItem to="/p2p" icon={<ArrowLeftRight className="w-5 h-5" />} onClick={closeSidebar}>P2P Transfer</NavItem>
        <NavItem to="/referrals" icon={<Users className="w-5 h-5" />} onClick={closeSidebar}>Refer and Earn</NavItem>
        <NavItem to="/giftcards" icon={<CreditCard className="w-5 h-5" />} onClick={closeSidebar}>Gift Card</NavItem>
        <NavItem to="/history" icon={<History className="w-5 h-5" />} onClick={closeSidebar}>History</NavItem>
        <NavItem to="/pricing" icon={<DollarSign className="w-5 h-5" />} onClick={closeSidebar}>Pricings</NavItem>

        <div className="px-6 py-4 mt-8 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-white/20">Account</div>
        <NavItem to="/profile" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Account Settings</NavItem>
        <NavItem to="/kyc" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>KYC Verification</NavItem>
        <NavItem to="/api-docs" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Developer's API</NavItem>
        <NavItem to="/support" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Support</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-8 mt-8 border-t border-gray-100 dark:border-white/5">
            <div className="px-6 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-red-500">Admin</div>
            <NavItem to="/admin" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Admin Terminal</NavItem>
          </div>
        )}
      </nav>

      <div className="p-8 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-6 py-4 rounded-[1.25rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-bold text-[11px] uppercase tracking-widest group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex flex-col lg:flex-row font-sans transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white dark:bg-[#050505] flex-shrink-0 sticky top-0 h-screen z-50">
        {sidebarContent}
      </aside>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl lg:hidden" 
            onClick={closeSidebar} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-80 z-[101] transform transition-transform duration-500 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl sticky top-0 z-40 flex items-center justify-between px-6 lg:px-16 py-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-6">
            <button className="lg:hidden text-gray-900 dark:text-white p-4 bg-gray-100 dark:bg-white/5 rounded-2xl active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <h1 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.5em] leading-none">Oplug App <span className="text-blue-600">v2.5.0</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-8">
             <div className="flex items-center space-x-3">
                <div className="hidden md:relative md:group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-gray-100 dark:bg-white/5 border-none rounded-2xl pl-12 pr-6 py-3.5 text-sm w-64 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none dark:text-white"
                  />
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all transform active:scale-90"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
                
                <button 
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`hidden md:p-4 rounded-2xl transition-all transform active:scale-90 ${notificationsEnabled ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' : 'bg-gray-100 text-gray-400 dark:bg-white/5'}`}
                  title="Toggle Notifications"
                >
                  <Bell className="w-5 h-5" />
                </button>
             </div>

             <div className="text-right hidden sm:block">
                <p className="text-[9px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.4em] mb-1">My Balance</p>
                <p className="text-gray-900 dark:text-white font-black text-2xl tracking-tighter leading-none flex items-center gap-2">
                  <CreditCard size={18} className="text-blue-500" />
                  ₦{walletBalance?.toLocaleString() || '0.00'}
                </p>
             </div>

             <div className="w-px h-10 bg-gray-100 dark:bg-white/5 hidden sm:block"></div>

             <div className="relative group">
                <button 
                  className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-[#050505] shadow-xl overflow-hidden flex items-center justify-center text-blue-600 font-black text-lg hover:scale-110 transition-all hover:bg-blue-600 hover:text-white"
                >
                   {user?.username?.charAt(0).toUpperCase() || 'U'}
                </button>
                
                {/* Profile Dropdown */}
                <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 p-6">
                   <div className="flex flex-col items-center text-center space-y-4 mb-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-blue-600 font-black text-3xl">
                         {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{user?.fullName || 'User'}</h4>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{user?.role || 'User'} Package</p>
                      </div>
                   </div>
                   
                   <div className="space-y-2 pt-6 border-t border-gray-50 dark:border-white/5">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center space-x-4 p-4 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-xs font-black uppercase tracking-widest"
                      >
                         <ShieldCheck size={18} />
                         <span>Settings</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-xs font-black uppercase tracking-widest"
                      >
                         <LogOut size={18} />
                         <span>Logout</span>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-16 w-full max-w-[1600px] mx-auto relative no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
