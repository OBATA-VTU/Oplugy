import React, { useState, useEffect, ReactNode } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Smartphone, Wifi, Zap, Tv, 
  LogOut, Menu, History, Wallet,
  ShieldCheck, DollarSign, Users,
  Sun, Moon, Clock, ChevronRight, X, CreditCard
} from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center justify-between px-6 py-4 rounded-[1.25rem] transition-all duration-500 group relative overflow-hidden ${
        isActive
          ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20'
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
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-700 opacity-0 group-hover:opacity-0 transition-opacity"></div>
  </NavLink>
);

const Layout: React.FC = () => {
  const { user, walletBalance, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeProfile = () => setIsProfileOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileOpen && !target.closest('.profile-dropdown-container')) {
        closeProfile();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-[#022c22] text-gray-900 dark:text-white overflow-hidden border-r border-gray-100 dark:border-white/5 relative">
      <div className="p-12 mb-4 flex justify-between items-center">
        <Logo />
        <button 
          onClick={closeSidebar}
          className="lg:hidden w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-900 dark:text-white"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-grow px-8 space-y-1 overflow-y-auto no-scrollbar pb-10">
        <div className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-2">My Home</div>
        <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />} onClick={closeSidebar}>Dashboard</NavItem>
        
        <div className="px-6 py-4 mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-2">Buy Things</div>
        <NavItem to="/airtime" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<Wifi className="w-5 h-5" />} onClick={closeSidebar}>Data Bundle</NavItem>
        <NavItem to="/cable" icon={<Tv className="w-5 h-5" />} onClick={closeSidebar}>Cable TV</NavItem>
        <NavItem to="/bills" icon={<Zap className="w-5 h-5" />} onClick={closeSidebar}>Electricity</NavItem>
        <NavItem to="/education" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Education</NavItem>
        <NavItem to="/schedule" icon={<Clock className="w-5 h-5" />} onClick={closeSidebar}>Scheduler</NavItem>

        <div className="px-6 py-4 mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-2">My Wallet</div>
        <NavItem to="/funding" icon={<Wallet className="w-5 h-5" />} onClick={closeSidebar}>Fund Wallet</NavItem>
        <NavItem to="/referrals" icon={<Users className="w-5 h-5" />} onClick={closeSidebar}>Refer and Earn</NavItem>
        <NavItem to="/giftcards" icon={<CreditCard className="w-5 h-5" />} onClick={closeSidebar}>Gift Cards</NavItem>
        <NavItem to="/history" icon={<History className="w-5 h-5" />} onClick={closeSidebar}>History</NavItem>
        <NavItem to="/pricing" icon={<DollarSign className="w-5 h-5" />} onClick={closeSidebar}>Our Prices</NavItem>

        <div className="px-6 py-4 mt-10 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 dark:text-white/20 mb-2">Settings</div>
        <NavItem to="/profile" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Security</NavItem>
        <NavItem to="/api-docs" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Developer API</NavItem>
        <NavItem to="/support" icon={<Smartphone className="w-5 h-5" />} onClick={closeSidebar}>Support</NavItem>

        {user?.role === 'admin' && (
          <div className="pt-10 mt-10 border-t border-gray-100 dark:border-white/5">
            <div className="px-6 mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Admin Only</div>
            <NavItem to="/admin" icon={<ShieldCheck className="w-5 h-5" />} onClick={closeSidebar}>Admin Panel</NavItem>
          </div>
        )}
      </nav>

      <div className="p-10 border-t border-gray-100 dark:border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-6 py-5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-black text-[11px] uppercase tracking-widest group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#022c22] flex flex-col lg:flex-row font-sans transition-colors duration-700">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white dark:bg-[#022c22] flex-shrink-0 sticky top-0 h-screen z-50">
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
      <aside className={`fixed top-0 left-0 h-full w-80 z-[101] transform transition-transform duration-700 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-none'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/90 dark:bg-[#022c22]/90 backdrop-blur-3xl sticky top-0 z-40 flex items-center justify-between px-8 lg:px-20 py-8 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center space-x-8">
            <button className="lg:hidden text-gray-900 dark:text-white p-4 bg-gray-100 dark:bg-white/5 rounded-2xl active:scale-95 transition-all" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <h1 className="text-[11px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.5em] leading-none">Oplug <span className="text-emerald-600">v2.5.0</span></h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 lg:space-x-10">
             <div className="flex items-center space-x-4">
                <button 
                  onClick={toggleTheme}
                  className="p-4 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-500 dark:text-gray-400 hover:text-emerald-600 transition-all transform active:scale-90"
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
             </div>

             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-[0.4em] mb-2">Wallet Balance</p>
                <p className="text-gray-900 dark:text-white font-black text-3xl tracking-tighter leading-none">
                  ₦{walletBalance?.toLocaleString() || '0.00'}
                </p>
             </div>

             <div className="w-px h-12 bg-gray-100 dark:bg-white/5 hidden sm:block"></div>

             <div className="relative profile-dropdown-container">
                <button 
                  onClick={toggleProfile}
                  className={`w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-[#022c22] shadow-2xl overflow-hidden flex items-center justify-center text-emerald-600 font-black text-xl hover:scale-110 transition-all ${isProfileOpen ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-600 hover:text-white'}`}
                >
                   {user?.username?.charAt(0).toUpperCase() || 'U'}
                </button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-6 w-80 bg-white dark:bg-[#064e3b] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 z-50 p-8"
                    >
                       <div className="flex flex-col items-center text-center space-y-6 mb-8">
                          <div className="w-24 h-24 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 font-black text-4xl">
                             {user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter leading-none">{user?.fullName || 'User'}</h4>
                             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-3">{user?.role || 'User'} Package</p>
                          </div>
                       </div>
                       
                       <div className="space-y-3 pt-8 border-t border-gray-50 dark:border-white/5">
                          <button 
                            onClick={() => {
                              closeProfile();
                              navigate('/profile');
                            }}
                            className="w-full flex items-center space-x-4 p-5 rounded-2xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-[11px] font-black uppercase tracking-widest"
                          >
                             <ShieldCheck size={18} />
                             <span>Settings</span>
                          </button>
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-4 p-5 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-[11px] font-black uppercase tracking-widest"
                          >
                             <LogOut size={18} />
                             <span>Logout</span>
                          </button>
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </header>

        <main className="flex-1 p-8 lg:p-20 w-full max-w-[1800px] mx-auto relative no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
