import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import NotificationContainer from './components/NotificationContainer';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import AirtimePage from './pages/AirtimePage';
import DataPage from './pages/DataPage';
import BillsPage from './pages/BillsPage';
import CablePage from './pages/CablePage';
import EducationPage from './pages/EducationPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import FundingPage from './pages/FundingPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import ReferralPage from './pages/ReferralPage';
import SchedulePurchasePage from './pages/SchedulePurchasePage';
import WhatsAppBotPage from './pages/WhatsAppBotPage';
import QuickPurchasePage from './pages/QuickPurchasePage';
import QuickBuyAirtime from './pages/quick-buy/QuickBuyAirtime';
import QuickBuyData from './pages/quick-buy/QuickBuyData';
import QuickBuyElectricity from './pages/quick-buy/QuickBuyElectricity';
import QuickBuyCable from './pages/quick-buy/QuickBuyCable';
import QuickBuyCheckout from './pages/quick-buy/QuickBuyCheckout';
import ApiDocsPage from './pages/ApiDocsPage';
import SupportPage from './pages/SupportPage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminPricingPage from './pages/AdminPricingPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import TerminalLayout from './components/TerminalLayout';
import OverviewTest from './pages/tests/OverviewTest';
import VtuTest from './pages/tests/VtuTest';
import PaymentTest from './pages/tests/PaymentTest';
import MediaTest from './pages/tests/MediaTest';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <NotificationContainer />
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/quick-purchase" element={<QuickPurchasePage />} />
              <Route path="/quick-purchase/airtime" element={<QuickBuyAirtime />} />
              <Route path="/quick-purchase/data" element={<QuickBuyData />} />
              <Route path="/quick-purchase/electricity" element={<QuickBuyElectricity />} />
              <Route path="/quick-purchase/cable" element={<QuickBuyCable />} />
              <Route path="/quick-purchase/checkout" element={<QuickBuyCheckout />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />

              {/* PROTECTED USER ROUTES */}
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/airtime" element={<AirtimePage />} />
                <Route path="/data" element={<DataPage />} />
                <Route path="/bills" element={<BillsPage />} />
                <Route path="/cable" element={<CablePage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/funding" element={<FundingPage />} />
                <Route path="/history" element={<TransactionHistoryPage />} />
                <Route path="/referrals" element={<ReferralPage />} />
                <Route path="/schedule" element={<SchedulePurchasePage />} />
                <Route path="/whatsapp-bot" element={<WhatsAppBotPage />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="pricing" element={<AdminPricingPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                
                {/* TERMINAL SUITE (NESTED IN ADMIN) */}
                <Route path="terminal" element={<TerminalLayout />}>
                  <Route index element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<OverviewTest />} />
                  <Route path="vtu" element={<VtuTest />} />
                  <Route path="payments" element={<PaymentTest />} />
                  <Route path="media" element={<MediaTest />} />
                </Route>
              </Route>
              
              {/* GLOBAL REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
