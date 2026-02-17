
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import Logo from './Logo';
import { 
  HomeIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  LogoutIcon, 
  MenuIcon,
  BoltIcon
} from './Icons';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminNavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/admin'}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 ${
        isActive
          ? 'bg-gray-900 text-white shadow-xl scale-[1.02]'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="font-black text-[11px] uppercase tracking-widest">{children}</span>
  </NavLink>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-8 mb-6 bg-gray-50/50">
        <Logo />
        <div className="mt-4 inline-flex items-center space-x-2 bg-black text-white px-3 py-1 rounded-full">
           <ShieldCheckIcon />
           <span className="text-[9px] font-black uppercase tracking-widest">Master Admin</span>
        </div>
      </div>
      
      <nav className="flex-grow px-5 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="px-4 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Governance</div>
        <AdminNavItem to="/admin" icon={<HomeIcon />} onClick={closeSidebar}>Admin Hub</AdminNavItem>
        <AdminNavItem to="/admin/users" icon={<UsersIcon />} onClick={closeSidebar}>User Management</AdminNavItem>
        
        <div className="px-4 mt-8 mb-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">System</div>
        <AdminNavItem to="/dashboard" icon={<BoltIcon />} onClick={closeSidebar}>Go to User App</AdminNavItem>
      </nav>

      <div className="p-6 border-t border-gray-50">
        <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Signed in as</p>
          <p className="text-gray-900 font-black truncate">{user?.fullName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-black text-[11px] uppercase tracking-widest"
        >
          <LogoutIcon />
          <span>Exit Panel</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-80 bg-white border-r border-gray-100 flex-shrink-0">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-40 transition-opacity lg:hidden ${isSidebarOpen ? 'bg-black/80 backdrop-blur-sm' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between p-5 px-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="lg:hidden text-gray-500 p-2" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <h1 className="text-xl font-black text-gray-900 tracking-tighter">
              {location.pathname === '/admin' ? 'Administrative Dashboard' : 'User Governance'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading && <Spinner />}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">System Online</span>
              <span className="text-[8px] font-bold text-gray-400">{new Date().toDateString()}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
