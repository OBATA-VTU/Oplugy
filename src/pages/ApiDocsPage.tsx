
import React from 'react';
import { motion } from 'motion/react';
import { Terminal, ShieldCheck, Zap, Code2, Globe, Lock, Cpu } from 'lucide-react';

const ApiDocsPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center space-x-3 px-6 py-2 bg-blue-50 rounded-full border border-blue-100 mb-4"
        >
          <Cpu className="w-4 h-4 text-blue-600" />
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Protocol v2.1.0</span>
        </motion.div>
        <h1 className="text-6xl lg:text-[100px] font-black text-gray-900 tracking-tighter leading-[0.85]">Developer <br /><span className="text-blue-600">Gateway.</span></h1>
        <p className="mt-8 text-gray-400 font-medium text-xl max-w-3xl mx-auto leading-relaxed">Connect your infrastructure to the Obata high-velocity digital utility network. Our RESTful API provides low-latency access to airtime, data, and utility fulfillment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="p-10 bg-gray-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
                <Globe className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Base Endpoint</p>
              <p className="font-mono text-sm break-all">https://obata.com/api/v1</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
         </div>
         <div className="p-10 bg-blue-600 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Authentication</p>
              <p className="font-mono text-sm">Authorization: Bearer sk_...</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
         </div>
         <div className="p-10 bg-white border border-gray-100 rounded-[3rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Performance</p>
              <p className="font-black text-gray-900 text-xl tracking-tight">~150ms Fulfillment</p>
            </div>
         </div>
      </div>

      <div className="space-y-16">
         <DocSection title="Authentication" icon={<ShieldCheck className="w-8 h-8" />}>
            <p className="mb-8 text-lg">All requests must be authenticated using your secret API key. Include it in the `Authorization` header as a Bearer token. Never expose this key in client-side code.</p>
            <CodeBlock 
              title="Authentication Header"
              code={`curl -X GET "https://obata.com/api/v1/user/balance" \\ \n -H "Authorization: Bearer {YOUR_SECRET_KEY}"`} 
            />
         </DocSection>

         <DocSection title="Data Fulfillment" icon={<Zap className="w-8 h-8" />}>
            <p className="mb-8 text-lg">Post a fulfillment request to the data endpoint. Our system will automatically route it to the fastest available node.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Request Payload</h4>
                <CodeBlock 
                  title="POST /data/purchase"
                  code={`{ \n  "network": "MTN", \n  "plan_id": "1001", \n  "phone": "08142452729", \n  "webhook_url": "https://yoursite.com/cb" \n}`} 
                />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-gray-900">Success Response</h4>
                <CodeBlock 
                  title="HTTP 200 OK"
                  code={`{ \n  "status": "success", \n  "transaction_id": "OBT_9921X", \n  "message": "Fulfillment initiated" \n}`} 
                />
              </div>
            </div>
         </DocSection>

         <DocSection title="Webhooks" icon={<Globe className="w-8 h-8" />}>
            <p className="mb-8 text-lg">Obata uses webhooks to notify your application when a transaction's status changes. We will send a POST request with a JSON payload to your configured URL.</p>
            <CodeBlock 
              title="Webhook Payload"
              code={`{ \n  "event": "transaction.updated", \n  "data": { \n    "id": "OBT_9921X", \n    "status": "COMPLETED", \n    "amount": 500, \n    "recipient": "08142452729" \n  } \n}`} 
            />
         </DocSection>
      </div>

      <div className="p-16 bg-blue-600 rounded-[4rem] text-white text-center space-y-8 shadow-2xl shadow-blue-200">
         <h3 className="text-4xl lg:text-5xl font-black tracking-tight">Ready to integrate?</h3>
         <p className="text-white/70 text-xl font-medium max-w-2xl mx-auto leading-relaxed">Get your API keys from your profile settings and start building high-velocity digital solutions today.</p>
         <div className="pt-4">
            <button className="px-12 py-6 bg-white text-blue-600 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all transform active:scale-95 shadow-xl">Go to Dashboard</button>
         </div>
      </div>
    </div>
  );
};

const DocSection = ({ title, icon, children }: any) => (
  <div className="bg-white p-12 lg:p-20 rounded-[4rem] border border-gray-100 shadow-sm relative overflow-hidden group">
     <div className="flex items-center space-x-6 mb-10">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all">
          {icon}
        </div>
        <h3 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">{title}</h3>
     </div>
     <div className="text-gray-500 font-medium leading-relaxed relative z-10">
        {children}
     </div>
     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
  </div>
);

const CodeBlock = ({ title, code }: { title: string, code: string }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between px-6 py-3 bg-gray-900 rounded-t-2xl border-b border-white/5">
       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{title}</span>
       <div className="flex space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
          <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
       </div>
    </div>
    <div className="bg-gray-950 p-8 rounded-b-2xl font-mono text-sm text-blue-400 border border-gray-900 overflow-x-auto whitespace-pre shadow-inner">
       {code}
    </div>
  </div>
);

export default ApiDocsPage;
