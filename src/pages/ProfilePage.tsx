import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { authService } from '../services/authService';
import Spinner from '../components/Spinner';
import { ShieldCheckIcon, UsersIcon, ExchangeIcon, BoltIcon, SignalIcon } from '../components/Icons';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'SECURITY' | 'DEVELOPER'>('ACCOUNT');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || '');
  const [apiKey] = useState(user?.apiKey || `sk_obata_v2_${Math.random().toString(36).substring(7).toUpperCase()}`);

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinForm.newPin.length !== 5) {
      addNotification("PIN must be exactly 5 digits.", "warning");
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      addNotification("New PINs do not match.", "error");
      return;
    }
    setIsUpdating(true);
    const res = await authService.setTransactionPin(user.id, pinForm.newPin);
    if (res.status) {
      addNotification("Security Key Synchronization Successful.", "success");
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } else {
      addNotification("Synchronization Failed. Contact Master Admin.", "error");
    }
    setIsUpdating(false);
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    addNotification(msg, "success");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Identity Control</h2>
          <h1 className="text-5xl lg:text-[80px] font-black text-gray-900 tracking-tighter leading-[0.85]">Matrix <br /><span className="text-blue-600">Protocol.</span></h1>
        </div>
        <div className="flex p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
           {['ACCOUNT', 'SECURITY', 'DEVELOPER'].map((tab: any) => (
             <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'}`}
             >
                {tab === 'DEVELOPER' ? 'Dev Hub' : tab}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         <div className="lg:col-span-4 space-y-10">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 text-center relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="w-40 h-40 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-7xl font-black shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">@{user?.username}</h3>
                  <p className="text-gray-400 text-[11px] font-black mt-2 uppercase tracking-[0.3em] bg-gray-50 inline-block px-6 py-2 rounded-full border border-gray-100">{user?.role} ACCESS LEVEL</p>
                  
                  <div className="mt-16 pt-12 border-t border-gray-50 space-y-8">
                    <ProfileMetric label="Available Liquidity" value={`₦${user?.walletBalance?.toLocaleString()}`} />
                    <ProfileMetric label="Network Connectivity" value={`${user?.referralCount || 0} Nodes`} />
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            </div>
            
            <div className="bg-gray-950 p-12 lg:p-14 rounded-[4.5rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="font-black text-3xl mb-6 tracking-tight">Accelerate Tier</h4>
                  <p className="text-white/40 text-lg leading-relaxed mb-12 font-medium">Inject a reseller upgrade to unlock 2.5% reduction on all gateway traffic.</p>
                  <button className="w-full py-6 bg-white text-gray-950 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-xl shadow-white/5">Initiate Upgrade</button>
               </div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
            </div>
         </div>

         <div className="lg:col-span-8">
            <div className="bg-white p-12 lg:p-20 rounded-[4.5rem] shadow-2xl border border-gray-100 min-h-[650px] relative">
               {activeTab === 'ACCOUNT' && (
                 <div className="animate-in fade-in duration-700 space-y-16">
                    <div>
                       <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Master Profile</h3>
                       <p className="text-gray-400 font-medium text-lg">Core identity credentials registered in the OBATA matrix.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <ReadOnlyField label="Full Identity" value={user?.fullName || 'Anonymous User'} />
                       <ReadOnlyField label="Unique Node ID" value={`@${user?.username}`} />
                       <ReadOnlyField label="Encrypted Email" value={user?.email} />
                       <ReadOnlyField label="Affiliate Key" value={user?.referralCode} isCopyable onCopy={() => copyToClipboard(user?.referralCode, "Affiliate Key Copied.")} />
                    </div>
                    <div className="p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 flex items-center space-x-8 backdrop-blur-sm">
                       <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg text-gray-400"><ShieldCheckIcon /></div>
                       <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed">Identity Lock: Administrative clearance is required to modify registered email or identity names.</p>
                    </div>
                 </div>
               )}

               {activeTab === 'SECURITY' && (
                 <div className="animate-in slide-in-from-right-8 duration-700 space-y-16">
                    <div>
                       <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Security Node</h3>
                       <p className="text-gray-400 font-medium text-lg">Configure your 5-digit security key to authorize liquidity deductions.</p>
                    </div>
                    <form onSubmit={handleUpdatePin} className="space-y-10 max-w-lg">
                       <InputGroup label="Current PIN (Required)" type="password" value={pinForm.oldPin} onChange={(v) => setPinForm({...pinForm, oldPin: v})} />
                       <div className="grid grid-cols-2 gap-8">
                          <InputGroup label="New 5-Digit PIN" type="password" maxLength={5} value={pinForm.newPin} onChange={(v) => setPinForm({...pinForm, newPin: v})} />
                          <InputGroup label="Verify PIN" type="password" maxLength={5} value={pinForm.confirmPin} onChange={(v) => setPinForm({...pinForm, confirmPin: v})} />
                       </div>
                       <button 
                        disabled={isUpdating || pinForm.newPin.length !== 5}
                        className="w-full bg-blue-600 text-white py-8 lg:py-10 rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-black transition-all transform active:scale-95 disabled:opacity-50"
                       >
                          {isUpdating ? <Spinner /> : 'Synchronize Security Key'}
                       </button>
                    </form>
                 </div>
               )}

               {activeTab === 'DEVELOPER' && (
                 <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-16">
                    <div>
                       <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Integration Hub</h3>
                       <p className="text-gray-400 font-medium text-lg leading-relaxed">Interface your independent nodes with the OBATA digital infrastructure.</p>
                    </div>
                    
                    <div className="space-y-12">
                       <div className="bg-gray-50 p-12 rounded-[3.5rem] border border-gray-100 group relative">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Merchant Secret Key</label>
                          <div className="flex items-center gap-6">
                             <input type="password" value={apiKey} readOnly className="flex-1 bg-white border border-gray-200 p-6 rounded-2xl font-mono text-sm tracking-widest outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                             <button onClick={() => copyToClipboard(apiKey, "Merchant Key Synchronized.")} className="p-6 bg-gray-950 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-2xl transform active:scale-90"><ExchangeIcon /></button>
                          </div>
                          <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center italic">Treat this key as a root password. It grants direct access to account liquidity.</p>
                       </div>

                       <div className="space-y-6">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 ml-4">Fulfillment Webhook URL</label>
                          <input 
                            type="url" 
                            className="w-full p-6 lg:p-8 bg-white border border-gray-200 rounded-3xl text-lg font-black tracking-tight focus:ring-8 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none" 
                            placeholder="https://your-node.com/api/callback" 
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                          />
                          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Automated transaction status will be pushed to this endpoint.</p>
                       </div>
                       
                       <button className="bg-gray-100 hover:bg-gray-900 hover:text-white px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-sm">Save Infrastructure Config</button>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const ProfileMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center px-6">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{label}</span>
    <span className="font-black text-gray-900 tracking-tighter text-3xl">{value}</span>
  </div>
);

const ReadOnlyField = ({ label, value, isCopyable, onCopy }: any) => (
  <div className="space-y-4 group">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">{label}</label>
    <div className="flex items-center gap-4">
       <div className="flex-1 bg-gray-50 p-6 rounded-2xl font-black text-gray-900 tracking-tight overflow-hidden text-ellipsis border border-transparent group-hover:border-gray-100 transition-all">
         {value}
       </div>
       {isCopyable && (
         <button onClick={onCopy} className="p-6 bg-white border border-gray-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-90"><ExchangeIcon /></button>
       )}
    </div>
  </div>
);

const InputGroup = ({ label, type = "text", value, onChange, maxLength }: any) => (
  <div className="space-y-4">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">{label}</label>
    <input 
      type={type} 
      className="w-full p-6 lg:p-8 bg-gray-50 border border-gray-100 rounded-3xl font-black text-2xl tracking-tight focus:ring-8 focus:ring-blue-50 focus:bg-white transition-all outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      maxLength={maxLength}
    />
  </div>
);

export default ProfilePage;