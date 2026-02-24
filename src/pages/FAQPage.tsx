
import React, { useState } from 'react';

const FAQPage: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    { q: "What is OBATA?", a: "OBATA is an app that lets you buy cheap data, airtime, and pay bills instantly." },
    { q: "How long does delivery take?", a: "It takes about 2 seconds. Everything is automatic and happens immediately." },
    { q: "Is my money safe?", a: "Yes. We use the best security to protect your money and your account." },
    { q: "Can I use OBATA for business?", a: "Yes. We have special accounts for people who want to sell data and airtime to others." },
    { q: "What if my transaction fails?", a: "If something goes wrong, our system will automatically refund your money to your wallet immediately." }
  ];

  const proNumber = "+2348142452729";
  const whatsappUrl = `https://wa.me/${proNumber.replace(/\D/g, '')}?text=Hello%20OBATA%20PRO,%20I%20need%20assistance%20with%20my%20account.`;

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <div className="text-center mb-20">
        <h2 className="text-blue-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Help Center</h2>
        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">Questions & Answers</h1>
      </div>

      <div className="space-y-4 mb-24">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-100 rounded-[2rem] overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
                className="w-full p-8 text-left flex justify-between items-center group hover:bg-gray-50 transition-colors"
              >
                <span className="font-black text-gray-900 text-lg tracking-tight">{faq.q}</span>
                <span className={`text-blue-600 transition-transform duration-300 ${activeIndex === idx ? 'rotate-45' : ''}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                </span>
              </button>
              {activeIndex === idx && (
                <div className="px-8 pb-8 text-gray-400 font-medium leading-relaxed animate-in slide-in-from-top-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden text-center shadow-2xl">
           <div className="relative z-10">
              <h3 className="text-3xl lg:text-5xl font-black mb-6 tracking-tighter">Need Help?</h3>
              <p className="text-white/40 text-lg lg:text-xl font-medium mb-12 max-w-xl mx-auto">Chat with us on WhatsApp if you have any questions or need support.</p>
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center space-x-4 bg-green-500 hover:bg-green-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all transform hover:-translate-y-1 shadow-xl shadow-green-500/20"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.017-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                <span>Chat on WhatsApp</span>
              </a>
           </div>
           <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>
      </div>
  );
};

export default FAQPage;
