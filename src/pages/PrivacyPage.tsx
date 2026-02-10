
import React from 'react';
import Logo from '../components/Logo';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <nav className="p-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Logo />
        </div>
      </nav>
      
      <main className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 20, 2025</p>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, including your name, email address, phone number, and transaction history.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service.</li>
              <li>To process transactions and send related information.</li>
              <li>To send technical notices, updates, and security alerts.</li>
              <li>To respond to your comments and questions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal data. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
            <p>We do not sell your personal data. We only share information with third-party service providers (like Telcos) necessary to complete your requested transactions.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting our support team.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPage;
