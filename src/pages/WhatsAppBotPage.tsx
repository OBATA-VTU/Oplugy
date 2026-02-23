import React, { useState } from 'react';
import { MessageSquare, Copy, Check, Terminal, Settings, Bot } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const WhatsAppBotPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState<string | null>(null);

  const webhookUrl = `${window.location.origin}/api/whatsapp/webhook`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    addNotification(`${id} copied to clipboard!`, "success");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-32">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex p-5 bg-green-50 text-green-600 rounded-[2.5rem] mb-4 shadow-inner">
          <Bot className="w-12 h-12" />
        </div>
        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">WhatsApp <br /><span className="text-green-600">Plug Bot.</span></h1>
        <p className="text-gray-400 font-medium text-xl max-w-2xl mx-auto leading-relaxed">Connect your website to WhatsApp. Let your users purchase data, airtime, and check balance directly from their favorite chat app.</p>
      </div>

      {/* Setup Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl shadow-green-100/50 border border-gray-50 space-y-10">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-green-600 text-white rounded-3xl flex items-center justify-center font-black text-xl shadow-lg">1</div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Configure Webhook</h3>
            </div>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">Copy this URL and paste it into your WhatsApp API provider (e.g., Twilio or Meta) as the "Incoming Message" webhook URL.</p>
            
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 group relative">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-4 ml-4">Your Webhook URL</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-white border border-gray-200 p-5 rounded-2xl font-mono text-sm tracking-tight overflow-hidden text-ellipsis">
                  {webhookUrl}
                </div>
                <button 
                  onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
                  className={`p-5 rounded-2xl transition-all shadow-xl active:scale-90 ${copied === "Webhook URL" ? 'bg-green-500 text-white' : 'bg-gray-950 text-white hover:bg-green-600'}`}
                >
                  {copied === "Webhook URL" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 lg:p-14 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 space-y-10">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-black text-xl shadow-lg">2</div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Environment Setup</h3>
            </div>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">To allow the bot to verify users, you must add your Firebase Service Account JSON to your environment variables.</p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-3xl border border-blue-100">
                <Terminal className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Variable Name</p>
                  <code className="text-lg font-black text-gray-900">FIREBASE_SERVICE_ACCOUNT</code>
                </div>
              </div>
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Paste the entire JSON content from your Firebase console.</p>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-gray-950 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-green-600 rounded-3xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black tracking-tight">Bot Commands</h4>
                <p className="text-white/40 font-medium text-lg leading-relaxed">Users can use these commands in WhatsApp:</p>
              </div>
              <div className="space-y-4 pt-4">
                {[
                  { cmd: 'BALANCE', desc: 'Check wallet balance' },
                  { cmd: 'DATA', desc: 'Buy data plans' },
                  { cmd: 'AIRTIME', desc: 'Buy airtime' },
                  { cmd: 'HELP', desc: 'Show menu' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <code className="text-green-400 font-black tracking-widest">{item.cmd}</code>
                    <span className="text-white/40 text-sm font-medium">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-[100px]"></div>
          </div>

          <div className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-xl space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Settings className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black text-gray-900 tracking-tight">Manual Steps</h4>
            </div>
            <ul className="space-y-6">
              {[
                "Create a Twilio account and get a WhatsApp Sandbox number.",
                "Go to Twilio Console > Messaging > Try it Out > WhatsApp Sandbox.",
                "Set the Sandbox Webhook URL to your Webhook URL above.",
                "Invite users to message your WhatsApp number to start."
              ].map((step, i) => (
                <li key={i} className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-gray-50 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 border border-gray-100 mt-1 shrink-0">{i+1}</div>
                  <p className="text-gray-500 font-medium text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppBotPage;
