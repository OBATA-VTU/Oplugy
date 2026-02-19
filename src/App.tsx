import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import NotificationContainer from './components/NotificationContainer';
import TestTerminalPage from './pages/TestTerminalPage';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <NotificationContainer />
          <Routes>
            {/* TEMPORARY TEST TERMINAL MODE: ALL ROUTES REDIRECT HERE */}
            <Route path="/test-terminal" element={<TestTerminalPage />} />
            <Route path="*" element={<Navigate to="/test-terminal" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;