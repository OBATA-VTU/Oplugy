
import React from 'react';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <nav className="p-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: February 20, 2025</p>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using Oplug ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please refrain from using our platform.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p>Oplug provides Virtual Top-Up (VTU) services, including airtime purchase, data subscriptions, bill payments, and cable TV renewals. We act as an intermediary between users and service providers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. All activities under your account are your sole responsibility. You must provide accurate information during registration.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Wallet and Payments</h2>
            <p>Users can fund their Oplug wallet to perform transactions. Funds added to the wallet are non-refundable but can be used for any service on the platform. We are not responsible for transactions made to wrong numbers or meter accounts provided by the user.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Service Availability</h2>
            <p>While we strive for 99.9% uptime, services may occasionally be unavailable due to provider downtime or maintenance. Oplug is not liable for losses resulting from such interruptions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <p>You may not use Oplug for any fraudulent or illegal activities. Any suspicious activity may lead to immediate account suspension and reporting to relevant authorities.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;
