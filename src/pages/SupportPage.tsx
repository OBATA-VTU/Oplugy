
import React from 'react';
import { PhoneIcon, ShieldCheckIcon, BoltIcon } from '../components/Icons';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Customer Care</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Help Center</h1>
        <p className="mt-6 text-gray-400 font-medium text-lg max-w-xl mx-auto">Experiencing issues? Our dedicated support team is available 24/7 to resolve your concerns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <SupportCard 
           icon={<PhoneIcon />} 
           title="WhatsApp Hotline" 
           value="+234 814 245 2729" 
           link="https://wa.me/2348142452729" 
         />
         <SupportCard 
           icon={<ShieldCheckIcon />} 
           title="Email Support" 
           value="support@obata.com" 
           link="mailto:support@obata.com" 
         />
         <SupportCard 
           icon={<BoltIcon />} 
           title="Live Updates" 
           value="@obata_v2" 
           link="https://t.me/obata_v2" 
         />
      </div>

      <div className="bg-white border border-gray-100 p-12 rounded-[3rem] shadow-xl">
         <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Frequently Asked Questions</h3>
         <div className="space-y-10">
            <FAQItem 
              q="How long does it take to fund my wallet?" 
              a="Auto-funding via Paystack is instant. Manual transfers are verified within 5-10 minutes once you send the proof of payment." 
            />
            <FAQItem 
              q="What if my transaction fails?" 
              a="If a transaction fails, your wallet is automatically refunded immediately. If not, please contact support with your Transaction ID." 
            />
            <FAQItem 
              q="How can I upgrade to a Reseller account?" 
              a="You can apply for a reseller tier from your profile or contact an admin directly for faster approval." 
            />
         </div>
      </div>
    </div>
  );
};

const SupportCard = ({ icon, title, value, link }: any) => (
  <a href={link} target="_blank" rel="noopener noreferrer" className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
     </div>
     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{title}</p>
     <p className="font-black text-gray-900 tracking-tight text-lg">{value}</p>
  </a>
);

const FAQItem = ({ q, a }: any) => (
  <div>
     <h4 className="text-xl font-black text-gray-900 tracking-tight mb-3">{q}</h4>
     <p className="text-gray-400 font-medium leading-relaxed">{a}</p>
  </div>
);

export default SupportPage;
