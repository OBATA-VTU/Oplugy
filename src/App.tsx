
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import NotificationContainer from './components/NotificationContainer';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import AirtimePage from './pages/AirtimePage';
import DataPage from './pages/DataPage';
import BillsPage from './pages/BillsPage';
import CablePage from './pages/CablePage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import LandingPage from './pages/LandingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ComingSoonPage from './pages/ComingSoonPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import PricingPage from './pages/PricingPage';
import ReferralPage from './pages/ReferralPage';
import SupportPage from './pages/SupportPage';
import ApiDocsPage from './pages/ApiDocsPage';
import Spinner from './components/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect suspended users
  if (user?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-red-50 text-center">
        <div className="max-w-md">
           <h1 className="text-4xl font-black text-red-600 mb-4">Account Suspended</h1>
           <p className="text-gray-600 font-medium">Your access to OBATA v2 has been restricted. Please contact support@obata.com for clarification.</p>
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
};

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(() => sessionStorage.getItem('admin_master_auth') === 'true');
  const [error, setError] = useState(false);

  const MASTER_PASSWORD = 'OBATAISBACKBYOBA';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      sessionStorage.setItem('admin_master_auth', 'true');
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
           <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
              </div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Admin Lockdown</h1>
              <p className="text-gray-400 font-medium mt-2">Authorized Personnel Only</p>
           </div>

           <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                 <input 
                   type="password" 
                   autoFocus
                   placeholder="Enter Master Password" 
                   className={`w-full p-6 bg-gray-50 border-2 rounded-3xl text-center text-xl font-black tracking-widest focus:ring-4 focus:ring-blue-100 transition-all ${error ? 'border-red-500 animate-shake' : 'border-gray-100'}`}
                   value={password}
                   onChange={(e) => { setPassword(e.target.value); setError(false); }}
                 />
                 {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 text-center">Incorrect Credentials</p>}
              </div>
              <button className="w-full bg-gray-900 hover:bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gray-200 transition-all">
                 Unlock System
              </button>
           </form>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const AppContent: React.FC = () => {
  return (
      <Router>
        <NotificationContainer />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/airtime" element={<ProtectedRoute><AirtimePage /></ProtectedRoute>} />
          <Route path="/data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
          <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
          <Route path="/cable" element={<ProtectedRoute><CablePage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
          <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
          <Route path="/api-docs" element={<ProtectedRoute><ApiDocsPage /></ProtectedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
          
          <Route path="/gaming" element={<ProtectedRoute><ComingSoonPage title="Gaming Topup" description="Gaming credits are currently being integrated." /></ProtectedRoute>} />
          <Route path="/giftcards" element={<ProtectedRoute><ComingSoonPage title="Gift Cards" description="Global gift cards will be available soon." /></ProtectedRoute>} />
          <Route path="/airtime-to-cash" element={<ProtectedRoute><ComingSoonPage title="Airtime to Cash" description="Convert excess airtime to cash soon." /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
