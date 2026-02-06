import React, { useState, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
    end // Use 'end' for the dashboard link to prevent it from being active on other routes
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="h-full flex flex-col">
      <div className="p-4 mb-4">
        <Logo />
      </div>
      <nav className="flex-grow px-4 space-y-2">
        <NavItem to="/" icon={<HomeIcon />} onClick={closeSidebar}>Dashboard</NavItem>
        <NavItem to="/airtime" icon={<PhoneIcon />} onClick={closeSidebar}>Airtime</NavItem>
        <NavItem to="/data" icon={<SignalIcon />} onClick={closeSidebar}>Data</NavItem>
        <NavItem to="/bills" icon={<BoltIcon />} onClick={closeSidebar}>Bills</NavItem>
        <NavItem to="/cable" icon={<TvIcon />} onClick={closeSidebar}>Cable</NavItem>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-all duration-200"
        >
          <LogoutIcon />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white shadow-lg flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Overlay) */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? 'bg-black bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-md sticky top-0 z-30 flex items-center justify-between p-4 md:justify-end">
          {/* Hamburger Menu for Mobile */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Open sidebar"
          >
            <MenuIcon />
          </button>

          {/* User & Wallet Info */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                  <p className="text-xs text-gray-500">Welcome back</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm font-semibold flex items-center">
                  <span className="mr-1">₦</span>
                  {walletBalance !== null ? walletBalance.toLocaleString('en-US') : <Spinner />}
                </div>
              </>
            ) : isLoading ? (
              <Spinner />
            ) : (
              <p>Not logged in</p>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
