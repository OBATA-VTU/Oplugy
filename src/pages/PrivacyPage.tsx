
import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="px-4 py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: February 20, 2025</p>
        
        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What we know about you</h2>
            <p>We only keep information that you give us, like your name, email, and phone number, so you can use the app.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How we use your info</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To make sure the app works for you.</li>
              <li>To process your data and airtime purchases.</li>
              <li>To send you important updates about your account.</li>
              <li>To answer your questions when you need help.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Safety</h2>
            <p>We use the best security to keep your information safe. We protect your data like it's our own.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing</h2>
            <p>We don't sell your information to anyone. We only share it with the networks (like MTN) so they can send you the data or airtime you bought.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Choice</h2>
            <p>You can change your information anytime in your profile settings. If you need help, just chat with us.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
