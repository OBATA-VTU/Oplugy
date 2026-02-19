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
import EducationPage from './pages/EducationPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import LandingPage from './pages/LandingPage';
import QuickPurchasePage from './pages/QuickPurchasePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminPricingPage from './pages/AdminPricingPage';
import PricingPage from './pages/PricingPage';
import ReferralPage from './pages/ReferralPage';
import SupportPage from './pages/SupportPage';
import ApiDocsPage from './pages/ApiDocsPage';
import FundingPage from './pages/FundingPage';
import ProfilePage from './pages/ProfilePage';
import Spinner from './components/Spinner';
import ScrollToTop from './components/ScrollToTop';

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
  
  if (isAuthenticated && user?.role === 'admin') {
    if (!isAuthorized) return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
         <div className="bg-white p-12 lg:p-16 rounded-[4rem] w-full max-w-md animate-in zoom-in-95 duration-500 shadow-2xl">
            <div className="text-center mb-10">
               <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
               </div>
               <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Master Hub</h2>
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">Administrative Verification Required</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-8">
               <input type="password" placeholder="Matrix Key" className={`w-full p-6 bg-gray-50 border-4 rounded-[2rem] text-center text-2xl font-black tracking-widest outline-none transition-all ${error ? 'border-red-500 animate-pulse' : 'border-gray-100 focus:border-blue-600'}`} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
               <button className="w-full bg-gray-900 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-blue-600 transition-all transform active:scale-95">Open Node</button>
            </form>
         </div>
      </div>
    );
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <NotificationContainer />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/quick-purchase" element={<QuickPurchasePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/airtime" element={<ProtectedRoute><AirtimePage /></ProtectedRoute>} />
            <Route path="/data" element={<ProtectedRoute><DataPage /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
            <Route path="/cable" element={<ProtectedRoute><CablePage /></ProtectedRoute>} />
            <Route path="/education" element={<ProtectedRoute><EducationPage /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
            <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/api-docs" element={<ProtectedRoute><ApiDocsPage /></ProtectedRoute>} />
            <Route path="/funding" element={<ProtectedRoute><FundingPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
            <Route path="/admin/pricing" element={<AdminRoute><AdminPricingPage /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;