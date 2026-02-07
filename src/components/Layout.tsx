
import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';
import Logo from './Logo';
import { HomeIcon, PhoneIcon, SignalIcon, BoltIcon, TvIcon, LogoutIcon, MenuIcon } from './Icons';

interface LayoutProps {
  children: ReactNode;
}

const NavItem: React.FC<{ to: string; icon: ReactNode; children: ReactNode; onClick?: () => void }> = ({ to, icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === '/'}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`
    }
  >
    {icon}
    <span className="font-medium">{children}</span>
  </NavLink>
);

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, walletBalance, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pageTitles: { [key: string]: string } = {
    '/': 'Dashboard',
    '/airtime': 'Buy Airtime',
    '/data': 'Buy Data',
    '/bills': 'Pay Bills',
    '/cable': 'Cable TV',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 mb-4 border-b">
        <Logo />
      </div>
      <nav className="flex-grow px-4 space-y-2">
        <NavItem to="/" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Bills</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable TV</NavItem>
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-all"
        >
          <LogoutIcon />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-md flex-shrink-0">
        {sidebarContent}
      </aside>
      
      <div className={`fixed inset-0 z-40 transition-opacity md:hidden ${isSidebarOpen ? 'bg-black bg-opacity-50' : 'pointer-events-none opacity-0'}`} onClick={closeSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-64 z-50 transform transition-transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm sticky top-0 z-30 flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-gray-600" onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
              <MenuIcon />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{pageTitles[location.pathname] || 'Oplug'}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                  <p className="text-xs text-gray-500">Welcome</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-semibold">
                  ₦{walletBalance !== null ? walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : <Spinner />}
                </div>
              </>
            )}
            {isLoading && <Spinner />}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
