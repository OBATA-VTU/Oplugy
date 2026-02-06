import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, walletBalance, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md py-4 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between sticky top-0 z-40">
        <Link to="/" className="text-3xl font-bold text-blue-700 mb-4 md:mb-0">
          Oplug
        </Link>
        {isAuthenticated && (
          <nav className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-gray-700 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <Link to="/airtime" className="hover:text-blue-600 transition-colors">
              Airtime
            </Link>
            <Link to="/data" className="hover:text-blue-600 transition-colors">
              Data
            </Link>
            <Link to="/bills" className="hover:text-blue-600 transition-colors">
              Bills
            </Link>
            <Link to="/cable" className="hover:text-blue-600 transition-colors">
              Cable
            </Link>
          </nav>
        )}
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {isLoading ? (
                 <Spinner />
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-800 hidden sm:inline">
                    Hello, {user?.email || 'User'}
                  </span>
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <span className="mr-1">₦</span>
                    {walletBalance !== null ? walletBalance.toLocaleString() : <Spinner />}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>

      <footer className="bg-gray-800 text-white py-6 px-4 md:px-10 text-center">
        <p>&copy; {new Date().getFullYear()} Oplug. All rights reserved.</p>
        <p className="text-sm mt-2">Powered by Cyberbeats VTU API.</p>
      </footer>
    </div>
  );
};

export default Layout;