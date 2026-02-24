
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="px-4 py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: February 20, 2025</p>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement</h2>
            <p>By using Obata App, you agree to follow these rules. If you don't agree, please don't use the app.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. What we do</h2>
            <p>Obata App helps you buy data, airtime, and pay bills easily. We connect you to the service providers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Your Account</h2>
            <p>You are responsible for keeping your account safe. Make sure you use a strong password and don't share it with anyone.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Money & Payments</h2>
            <p>You can add money to your wallet to buy things. Once you add money, you can't take it back, but you can use it to buy anything on the app. Be careful when typing phone numbers or meter numbers.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. App Availability</h2>
            <p>We try to make sure the app is always working, but sometimes there might be small breaks for maintenance.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Rules</h2>
            <p>Don't use the app for anything illegal or fraudulent. If we see anything bad, we will close your account.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
