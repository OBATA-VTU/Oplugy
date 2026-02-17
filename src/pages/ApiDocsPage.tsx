
import React from 'react';

const ApiDocsPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Developer Tools</h2>
        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">Gateway API</h1>
        <p className="mt-6 text-gray-400 font-medium text-xl max-w-2xl">Integrate OBATA v2 into your website or application using our powerful JSON API.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-8 bg-gray-900 text-white rounded-[2.5rem]">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Endpoint</p>
            <p className="font-mono text-sm">https://obata.com/api/v1</p>
         </div>
         <div className="p-8 bg-blue-600 text-white rounded-[2.5rem]">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Auth Header</p>
            <p className="font-mono text-sm">Authorization: Bearer YOUR_KEY</p>
         </div>
         <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem]">
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Rate Limit</p>
            <p className="font-black text-gray-900">100 Requests/Min</p>
         </div>
      </div>

      <div className="space-y-10">
         <DocSection title="Authentication">
            <p className="mb-4">To authenticate your requests, include your secret API key in the `Authorization` header as a Bearer token. You can find your key in the API settings of your dashboard.</p>
            <CodeBlock code={`curl -X GET "https://obata.com/api/v1/user/balance" \\ \n -H "Authorization: Bearer {YOUR_API_KEY}"`} />
         </DocSection>

         <DocSection title="Airtime Purchase">
            <p className="mb-4">Post a JSON object to the airtime endpoint to top up a number instantly.</p>
            <CodeBlock code={`POST /airtime \n{ \n  "network": "MTN", \n  "phone": "08142452729", \n  "amount": 100 \n}`} />
         </DocSection>
      </div>
    </div>
  );
};

const DocSection = ({ title, children }: any) => (
  <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm">
     <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-8">{title}</h3>
     <div className="text-gray-500 font-medium leading-relaxed">
        {children}
     </div>
  </div>
);

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-gray-50 p-8 rounded-3xl font-mono text-sm text-gray-700 border border-gray-100 overflow-x-auto whitespace-pre">
     {code}
  </div>
);

export default ApiDocsPage;
