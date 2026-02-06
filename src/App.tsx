import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import Layout from './components/Layout';
import Notification from './components/Notification';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // Import the new SignUpPage
import DashboardPage from './pages/DashboardPage';
import AirtimePage from './pages/AirtimePage';
import DataPage from './pages/DataPage';
import BillsPage from './pages/BillsPage';
import CablePage from './pages/CablePage';
import Spinner from './components/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-150px)]">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} /> {/* Add the new signup route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/airtime"
            element={
              <ProtectedRoute>
                <Layout>
                  <AirtimePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/data"
            element={
              <ProtectedRoute>
                <Layout>
                  <DataPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bills"
            element={
              <ProtectedRoute>
                <Layout>
                  <BillsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cable"
            element={
              <ProtectedRoute>
                <Layout>
                  <CablePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} onClose={removeNotification} />
      ))}
    </AuthProvider>
  );
};

export default App;