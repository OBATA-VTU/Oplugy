import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Mail, Phone, Shield, LogOut, Copy, Check } from 'lucide-react';
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
    addNotification(`${id} copied to clipboard!`, "success");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">My Account</h2>
          <h1 className="text-5xl lg:text-[80px] font-black text-gray-900 tracking-tighter leading-[0.85]">Your <br /><span className="text-blue-600">Profile.</span></h1>
        </div>
        <div className="flex p-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full lg:w-auto overflow-x-auto no-scrollbar">
           {(['ACCOUNT', 'SECURITY', 'DEVELOPER'] as const).map((tab) => (
             <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 lg:flex-none px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-900'}`}
             >
                {tab === 'DEVELOPER' ? 'API Access' : tab === 'SECURITY' ? 'Security' : 'My Info'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sidebar: Profile Card */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-gray-50 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-40 h-40 bg-blue-50 text-blue-600 rounded-[3rem] flex items-center justify-center mx-auto mb-10 text-7xl font-black shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">@{user?.username}</h3>
              <p className="text-gray-400 text-[11px] font-black mt-2 uppercase tracking-[0.3em] bg-gray-50 inline-block px-6 py-2 rounded-full border border-gray-100">{user?.role || 'CUSTOMER'} ACCOUNT</p>
              
              <div className="mt-16 pt-12 border-t border-gray-50 space-y-8">
                <ProfileMetric label="Wallet Balance" value={`₦${user?.walletBalance?.toLocaleString() || '0.00'}`} />
                <ProfileMetric label="Total Referrals" value={`${user?.referralCount || 0} People`} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>

          <button 
            onClick={logout}
            className="w-full p-8 bg-red-50 text-red-600 rounded-[3rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center space-x-4 hover:bg-red-600 hover:text-white transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out Account</span>
          </button>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white p-12 lg:p-20 rounded-[4.5rem] shadow-2xl border border-gray-100 min-h-[650px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'ACCOUNT' && (
                <motion.div 
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div>
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Your Details</h3>
                    <p className="text-gray-400 font-medium text-lg">This is your information registered with us.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <ReadOnlyField label="Full Name" value={user?.fullName || 'Not set'} />
                    <ReadOnlyField label="Username" value={`@${user?.username}`} />
                    <ReadOnlyField label="Email Address" value={user?.email} />
                    <ReadOnlyField 
                      label="Referral Code" 
                      value={user?.referralCode} 
                      isCopyable 
                      onCopy={() => copyToClipboard(user?.referralCode, "Referral Code")} 
                      copied={copied === "Referral Code"}
                    />
                  </div>
                  <div className="p-10 bg-gray-50/50 rounded-[3rem] border border-gray-100 flex items-center space-x-8 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-lg text-blue-600">
                      <Shield className="w-8 h-8" />
                    </div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] leading-relaxed">To change your name or email, please contact support for verification.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'SECURITY' && (
                <motion.div 
                  key="security"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div>
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Security PIN</h3>
                    <p className="text-gray-400 font-medium text-lg">Change your 5-digit PIN used to approve payments.</p>
                  </div>
                  <form onSubmit={handleUpdatePin} className="space-y-10 max-w-lg">
                    <InputGroup 
                      label="Current PIN (Required)" 
                      type="password" 
                      value={pinForm.oldPin} 
                      onChange={(v: string) => setPinForm({...pinForm, oldPin: v})} 
                    />
                    <div className="grid grid-cols-2 gap-8">
                      <InputGroup 
                        label="New 5-Digit PIN" 
                        type="password" 
                        maxLength={5} 
                        value={pinForm.newPin} 
                        onChange={(v: string) => setPinForm({...pinForm, newPin: v})} 
                      />
                      <InputGroup 
                        label="Verify PIN" 
                        type="password" 
                        maxLength={5} 
                        value={pinForm.confirmPin} 
                        onChange={(v: string) => setPinForm({...pinForm, confirmPin: v})} 
                      />
                    </div>
                    <button 
                      disabled={isUpdating || pinForm.newPin.length !== 5}
                      className="w-full bg-blue-600 text-white py-8 lg:py-10 rounded-3xl font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-black transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isUpdating ? <Spinner /> : 'Save PIN'}
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === 'DEVELOPER' && (
                <motion.div 
                  key="developer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-16"
                >
                  <div>
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter mb-4">Developer / API</h3>
                    <p className="text-gray-400 font-medium text-lg leading-relaxed">For developers who want to connect to our services.</p>
                  </div>
                  
                  <div className="space-y-12">
                    <div className="bg-gray-50 p-12 rounded-[3.5rem] border border-gray-100 group relative">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Your API Secret Key</label>
                      <div className="flex items-center gap-6">
                        <input type="password" value={apiKey} readOnly className="flex-1 bg-white border border-gray-200 p-6 rounded-2xl font-mono text-sm tracking-widest outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
                        <button onClick={() => copyToClipboard(apiKey, "API Key")} className={`p-6 rounded-2xl transition-all shadow-2xl transform active:scale-90 ${copied === "API Key" ? 'bg-green-500 text-white' : 'bg-gray-950 text-white hover:bg-blue-600'}`}>
                          {copied === "API Key" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="mt-8 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center italic">Keep this key secret. Anyone with this key can spend money from your wallet.</p>
                    </div>

                    <div className="space-y-6">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-2 ml-4">Webhook URL</label>
                      <input 
                        type="url" 
                        className="w-full p-6 lg:p-8 bg-white border border-gray-200 rounded-3xl text-lg font-black tracking-tight focus:ring-8 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none" 
                        placeholder="https://yourwebsite.com/api/callback" 
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">We will send transaction updates to this URL.</p>
                    </div>
                    
                    <button className="bg-gray-100 hover:bg-gray-900 hover:text-white px-12 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all transform active:scale-95 shadow-sm">Save API Settings</button>
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

const ProfileMetric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center px-6">
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{label}</span>
    <span className="font-black text-gray-900 tracking-tighter text-3xl">{value}</span>
  </div>
);

const ReadOnlyField = ({ label, value, isCopyable, onCopy, copied }: { label: string; value: string; isCopyable?: boolean; onCopy?: () => void; copied?: boolean }) => (
  <div className="space-y-4 group">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">{label}</label>
    <div className="flex items-center gap-4">
       <div className="flex-1 bg-gray-50 p-6 rounded-2xl font-black text-gray-900 tracking-tight overflow-hidden text-ellipsis border border-transparent group-hover:border-gray-100 transition-all">
         {value}
       </div>
       {isCopyable && onCopy && (
         <button onClick={onCopy} className={`p-6 rounded-2xl transition-all shadow-xl active:scale-90 ${copied ? 'bg-green-500 text-white' : 'bg-white border border-gray-100 hover:bg-blue-600 hover:text-white'}`}>
           {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
         </button>
       )}
    </div>
  </div>
);

const InputGroup = ({ label, type = "text", value, onChange, maxLength }: { label: string; type?: string; value: string; onChange: (v: string) => void; maxLength?: number }) => (
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