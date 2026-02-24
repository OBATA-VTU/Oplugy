
import React from 'react';
import { PhoneIcon, ShieldCheckIcon, BoltIcon } from '../components/Icons';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Support</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Need Help?</h1>
        <p className="mt-6 text-gray-400 font-medium text-lg max-w-xl mx-auto">Are you having any problems? We are here to help you anytime.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <SupportCard 
           icon={<PhoneIcon />} 
           title="Chat on WhatsApp" 
           value="+234 814 245 2729" 
           link="https://wa.me/2348142452729" 
         />
         <SupportCard 
           icon={<ShieldCheckIcon />} 
           title="Send an Email" 
           value="support@obata.com" 
           link="mailto:support@obata.com" 
         />
         <SupportCard 
           icon={<BoltIcon />} 
           title="Join Telegram" 
           value="@obata_v2" 
           link="https://t.me/obata_v2" 
         />
      </div>

      <div className="bg-white border border-gray-100 p-12 rounded-[3rem] shadow-xl">
         <h3 className="text-3xl font-black text-gray-900 mb-10 tracking-tight">Common Questions</h3>
         <div className="space-y-10">
            <FAQItem 
              q="How long to add money?" 
              a="Adding money with your card is immediate. If you transfer, it takes 5-10 minutes." 
            />
            <FAQItem 
              q="What if my transaction fails?" 
              a="If it fails, your money comes back to your wallet immediately. If not, just chat with us." 
            />
            <FAQItem 
              q="How to become a reseller?" 
              a="You can do this in your profile or just chat with us." 
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
