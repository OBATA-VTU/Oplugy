
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
import QuickPurchasePage from './pages/QuickPurchasePage';
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
  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.status === 'suspended') return <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 text-center text-red-600 font-black text-2xl uppercase tracking-tighter">Access Revoked. Contact Support.</div>;
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
    } else {
      setError(true);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner /></div>;
  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (!isAuthorized) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
       <div className="bg-white p-12 rounded-[3rem] w-full max-w-md animate-in zoom-in-95">
          <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter text-center">Master Override</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
             <input type="password" placeholder="Matrix Key" className={`w-full p-6 bg-gray-50 border-2 rounded-3xl text-center text-2xl font-black tracking-widest ${error ? 'border-red-500' : 'border-gray-100'}`} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
             <button className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px]">Unlock System</button>
          </form>
       </div>
    </div>
  );
  return <AdminLayout>{children}</AdminLayout>;
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <NotificationContainer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quick-purchase" element={<QuickPurchasePage />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
