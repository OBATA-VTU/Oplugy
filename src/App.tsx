import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import NotificationContainer from './components/NotificationContainer';
import TerminalLayout from './components/TerminalLayout';
import OverviewTest from './pages/tests/OverviewTest';
import VtuTest from './pages/tests/VtuTest';
import PaymentTest from './pages/tests/PaymentTest';
import MediaTest from './pages/tests/MediaTest';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <NotificationContainer />
          <Routes>
            {/* TERMINAL SUITE */}
            <Route path="/terminal" element={<TerminalLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<OverviewTest />} />
              <Route path="vtu" element={<VtuTest />} />
              <Route path="payments" element={<PaymentTest />} />
              <Route path="media" element={<MediaTest />} />
            </Route>
            
            {/* GLOBAL REDIRECT */}
            <Route path="*" element={<Navigate to="/terminal/overview" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;