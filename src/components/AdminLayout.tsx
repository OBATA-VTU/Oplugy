import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import Logo from './Logo';
import { 
  HomeIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  LogoutIcon, 
  MenuIcon,
  BoltIcon,
  HistoryIcon,
  ExchangeIcon,
  CurrencyDollarIcon
} from './Icons';

const AdminNavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/admin'}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
        isActive
          ? 'bg-gray-900 text-white shadow-xl'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    <span className="shrink-0">{icon}</span>
    <span className="font-bold text-xs tracking-tight">{children}</span>
  </NavLink>
);

const AdminLayout: React.FC = () => {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-8 mb-4 border-b border-gray-50">
        <Logo />
        <div className="mt-6 flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl border border-blue-100/50">
           <ShieldCheckIcon />
           <span className="text-[10px] font-bold uppercase tracking-wider">Admin Dashboard</span>
        </div>
      </div>
      
      <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Management</div>
        <AdminNavItem to="/admin" icon={<HomeIcon />} onClick={closeSidebar}>Overview</AdminNavItem>
        <AdminNavItem to="/admin/users" icon={<UsersIcon />} onClick={closeSidebar}>Users</AdminNavItem>
        <AdminNavItem to="/admin/transactions" icon={<HistoryIcon />} onClick={closeSidebar}>Transactions</AdminNavItem>
        <AdminNavItem to="/admin/pricing" icon={<CurrencyDollarIcon />} onClick={closeSidebar}>Pricing Control</AdminNavItem>
        
        <div className="px-4 py-3 mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">System</div>
        <AdminNavItem to="/admin/terminal" icon={<BoltIcon />} onClick={closeSidebar}>Terminal Suite</AdminNavItem>
        <AdminNavItem to="/admin/settings" icon={<ExchangeIcon />} onClick={closeSidebar}>Settings</AdminNavItem>
        <div className="pt-4 mt-4 border-t border-gray-50">
          <AdminNavItem to="/dashboard" icon={<HomeIcon />} onClick={closeSidebar}>User Dashboard</AdminNavItem>
        </div>
      </nav>

      <div className="p-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-xs tracking-tight"
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-white border-r border-gray-100 flex-shrink-0">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-40 transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between p-4 px-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-500 p-2" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Admin Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading && <Spinner />}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">System Online</span>
              <span className="text-[9px] font-medium text-gray-400">Version 2.5.0</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;