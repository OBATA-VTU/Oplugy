import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Shield, LogOut, Copy, Check, User, Lock, Terminal, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../services/authService';
import Spinner from '../components/Spinner';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'ACCOUNT' | 'SECURITY' | 'DEVELOPER'>('ACCOUNT');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || '');
  const [apiKey] = useState(user?.apiKey || `sk_inlomax_${Math.random().toString(36).substring(7).toUpperCase()}`);

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
    const res = await authService.setTransactionPin(user?.uid || user?.id, pinForm.newPin);
    if (res.status) {
      addNotification("Transaction PIN updated successfully.", "success");
      setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
    } else {
      addNotification("Update failed. Please try again.", "error");
    }
    setIsUpdating(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    addNotification(`${id} copied!`, "success");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Identity Protocol</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none">
            User <span className="text-gray-400">Profile.</span>
          </h1>
        </div>
        <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
           {(['ACCOUNT', 'SECURITY', 'DEVELOPER'] as const).map((tab) => (
             <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-gray-950 text-white shadow-xl' : 'text-gray-400 hover:text-gray-950'}`}
             >
                {tab === 'DEVELOPER' ? 'API' : tab === 'SECURITY' ? 'Security' : 'Account'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
            <div className="relative z-10 text-center space-y-8">
              <div className="w-32 h-32 bg-gray-50 text-gray-900 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl font-black shadow-inner group-hover:scale-105 transition-transform duration-500">
                {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter">@{user?.username}</h3>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">{user?.role || 'CUSTOMER'} ACCESS</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-50">
                <MetricCard label="Balance" value={`₦${user?.walletBalance?.toLocaleString() || '0.00'}`} />
                <MetricCard label="Referrals" value={`${user?.referralCount || 0}`} />
              </div>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-6 bg-red-50 text-red-600 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-red-600 hover:text-white transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Terminate Session</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 lg:p-16 shadow-xl min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'ACCOUNT' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <SectionHeader title="Account Details" desc="Your primary identification data within the Oplug network." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DataField label="Full Name" value={user?.fullName || 'Not set'} icon={<User size={16} />} />
                    <DataField label="Username" value={`@${user?.username}`} icon={<Terminal size={16} />} />
                    <DataField label="Email Address" value={user?.email} icon={<Lock size={16} />} />
                    <DataField 
                      label="Referral Code" 
                      value={user?.referralCode} 
                      icon={<CreditCard size={16} />}
                      isCopyable 
                      onCopy={() => copyToClipboard(user?.referralCode, "Referral Code")} 
                      copied={copied === "Referral Code"}
                    />
                  </div>
                  <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-6">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600">
                      <Shield size={24} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                      For sensitive data modifications, please contact our administrative protocol.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'SECURITY' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <SectionHeader title="Security Protocol" desc="Manage your 5-digit transaction authorization PIN." />
                  <form onSubmit={handleUpdatePin} className="space-y-8 max-w-md">
                    <InputField 
                      label="Current PIN" 
                      type="password" 
                      value={pinForm.oldPin} 
                      onChange={(v: string) => setPinForm({...pinForm, oldPin: v})} 
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <InputField 
                        label="New PIN" 
                        type="password" 
                        maxLength={5} 
                        value={pinForm.newPin} 
                        onChange={(v: string) => setPinForm({...pinForm, newPin: v})} 
                      />
                      <InputField 
                        label="Verify PIN" 
                        type="password" 
                        maxLength={5} 
                        value={pinForm.confirmPin} 
                        onChange={(v: string) => setPinForm({...pinForm, confirmPin: v})} 
                      />
                    </div>
                    <button 
                      disabled={isUpdating || pinForm.newPin.length !== 5}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isUpdating ? <Spinner /> : 'Update PIN'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'DEVELOPER' && (
                <motion.div 
                  key="developer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <SectionHeader title="API Infrastructure" desc="Integrate our digital services into your external systems." />
                  
                  <div className="space-y-10">
                    <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">API Secret Key</label>
                      <div className="flex items-center gap-4">
                        <input type="password" value={apiKey} readOnly className="flex-1 bg-white border border-gray-200 p-4 rounded-xl font-mono text-xs tracking-widest outline-none" />
                        <button onClick={() => copyToClipboard(apiKey, "API Key")} className={`p-4 rounded-xl transition-all shadow-sm ${copied === "API Key" ? 'bg-emerald-500 text-white' : 'bg-gray-950 text-white hover:bg-blue-600'}`}>
                          {copied === "API Key" ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                      <p className="mt-6 text-[9px] font-black text-orange-500 uppercase tracking-widest text-center">Warning: Unauthorized access to this key compromises your wallet.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Webhook Endpoint</label>
                      <input 
                        type="url" 
                        className="w-full p-5 bg-white border border-gray-200 rounded-2xl text-sm font-black tracking-tight focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                        placeholder="https://api.yourdomain.com/v1/callback" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                    </div>
                    
                    <button className="bg-gray-950 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg">Save Configuration</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, desc }: { title: string, desc: string }) => (
  <div>
    <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">{title}</h3>
    <p className="text-gray-400 font-medium">{desc}</p>
  </div>
);

const MetricCard = ({ label, value }: { label: string, value: string }) => (
  <div className="text-center">
    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black tracking-tighter">{value}</p>
  </div>
);

const DataField = ({ label, value, icon, isCopyable, onCopy, copied }: any) => (
  <div className="space-y-3">
    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="flex items-center gap-3">
       <div className="flex-1 bg-gray-50 p-4 rounded-xl flex items-center space-x-4 border border-transparent hover:border-gray-100 transition-all">
         <div className="text-gray-400">{icon}</div>
         <span className="font-black text-gray-900 tracking-tight text-sm truncate">{value}</span>
       </div>
       {isCopyable && (
         <button onClick={onCopy} className={`p-4 rounded-xl transition-all shadow-sm ${copied ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-100 hover:bg-blue-600 hover:text-white'}`}>
           {copied ? <Check size={16} /> : <Copy size={16} />}
         </button>
       )}
    </div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, maxLength }: any) => (
  <div className="space-y-3">
    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
    <input 
      type={type} 
      className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl tracking-tight focus:ring-4 focus:ring-blue-50 focus:bg-white transition-all outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      maxLength={maxLength}
    />
  </div>
);

export default ProfilePage;
