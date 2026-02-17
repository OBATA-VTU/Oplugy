
import React from 'react';
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          
          {/* Coming Soon Services */}
          <Route path="/gaming" element={<ProtectedRoute><ComingSoonPage title="Gaming Topup" description="Free Fire Diamonds, Call of Duty Points and more are currently being integrated. Stay tuned!" /></ProtectedRoute>} />
          <Route path="/giftcards" element={<ProtectedRoute><ComingSoonPage title="Gift Cards" description="Global gift cards from iTunes, Steam, and Amazon will be available soon for instant purchase." /></ProtectedRoute>} />
          <Route path="/airtime-to-cash" element={<ProtectedRoute><ComingSoonPage title="Airtime to Cash" description="Convert your excess airtime to instant bank credit. This feature is in active development." /></ProtectedRoute>} />
          
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
