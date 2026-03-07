import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Shield, LogOut, Copy, Check, User, Lock, Terminal, CreditCard, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authService } from '../services/authService';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import Spinner from '../components/Spinner';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BANK' | 'PIN' | 'API' | 'PASSWORD'>('PERSONAL');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  
  const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(user?.apiKey || '');

  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    const res = await authService.updateProfile(user.id, personalInfo);
    if (res.status) {
      addNotification("Profile updated successfully.", "success");
    } else {
      addNotification(res.message || "Failed to update profile.", "error");
    }
    setIsUpdating(false);
  };

  const generateLongApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'op_live_';
    for (let i = 0; i < 48; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleRegenerateKey = async () => {
    if (!user) return;
    const newKey = generateLongApiKey();
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { apiKey: newKey });
      setApiKey(newKey);
      addNotification("New API Key generated and saved.", "success");
    } catch (e) {
      addNotification("Failed to regenerate API Key.", "error");
    }
    setIsUpdating(false);
  };

  const handleSaveConfig = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      if (webhookUrl && !/^https?:\/\/.+/.test(webhookUrl)) {
        addNotification("Please enter a valid URL (starting with http:// or https://).", "warning");
        setIsUpdating(false);
        return;
      }
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { webhookUrl });
      addNotification("Developer settings saved.", "success");
    } catch (e) {
      addNotification("Failed to save settings.", "error");
    }
    setIsUpdating(false);
  };

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
    <div className="max-w-7xl mx-auto space-y-12 pb-32">
      {/* Profile Header Banner */}
      <div className="relative h-80 rounded-[4rem] overflow-hidden bg-gray-200">
         <img 
           src="https://picsum.photos/seed/profile-bg/1920/500" 
           alt="Banner" 
           className="w-full h-full object-cover opacity-50"
           referrerPolicy="no-referrer"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#050505] to-transparent"></div>
         
         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-4">
            <div className="w-40 h-40 rounded-full bg-white dark:bg-[#0f172a] p-2 shadow-2xl">
               <div className="w-full h-full rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-300">
                  <User size={80} />
               </div>
            </div>
            <div className="text-center">
               <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">{user?.fullName || 'User'}</h1>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-2">{user?.role || 'Reseller'}</p>
            </div>
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap justify-center gap-4 pt-20">
         <TabButton active={activeTab === 'PERSONAL'} onClick={() => setActiveTab('PERSONAL')}>Personal Info</TabButton>
         <TabButton active={activeTab === 'BANK'} onClick={() => setActiveTab('BANK')}>Bank Settings</TabButton>
         <TabButton active={activeTab === 'PIN'} onClick={() => setActiveTab('PIN')}>Transaction Pin</TabButton>
         <TabButton active={activeTab === 'API'} onClick={() => setActiveTab('API')}>Api & Webhook</TabButton>
         <TabButton active={activeTab === 'PASSWORD'} onClick={() => setActiveTab('PASSWORD')}>Password</TabButton>
      </div>

      <div className="bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-white/5 rounded-[4rem] p-12 lg:p-20 shadow-2xl shadow-gray-100/50">
        <AnimatePresence mode="wait">
          {activeTab === 'PERSONAL' && (
            <motion.div 
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex items-center space-x-4 mb-10">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={24} />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Personal Info</h3>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ProfileInput label="Full Name" value={personalInfo.fullName} onChange={(v: string) => setPersonalInfo({...personalInfo, fullName: v})} />
                <ProfileInput label="User Name" value={personalInfo.username} onChange={(v: string) => setPersonalInfo({...personalInfo, username: v})} />
                <ProfileInput label="Account Type" value={user?.role || 'Reseller'} readOnly />
                <ProfileInput label="Email Address" value={personalInfo.email} onChange={(v: string) => setPersonalInfo({...personalInfo, email: v})} />
                <ProfileInput label="Phone Number" value={personalInfo.phone} onChange={(v: string) => setPersonalInfo({...personalInfo, phone: v})} />
                <ProfileInput label="NIN Status" value="Verified" readOnly />
                <ProfileInput label="BVN Status" value="Not verified" readOnly />
                
                <div className="md:col-span-2 pt-10">
                   <button 
                    disabled={isUpdating}
                    className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                   >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                   </button>
                </div>
              </form>
            </motion.div>
          )}

          {activeTab === 'PIN' && (
            <motion.div 
              key="pin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex items-center space-x-4 mb-10">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Lock size={24} />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">Transaction PIN</h3>
              </div>
              
              <form onSubmit={handleUpdatePin} className="max-w-md space-y-8">
                <ProfileInput label="Current PIN" type="password" value={pinForm.oldPin} onChange={(v: string) => setPinForm({...pinForm, oldPin: v})} />
                <ProfileInput label="New PIN" type="password" maxLength={5} value={pinForm.newPin} onChange={(v: string) => setPinForm({...pinForm, newPin: v})} />
                <ProfileInput label="Confirm PIN" type="password" maxLength={5} value={pinForm.confirmPin} onChange={(v: string) => setPinForm({...pinForm, confirmPin: v})} />
                
                <button 
                  disabled={isUpdating || pinForm.newPin.length !== 5}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update PIN'}
                </button>
              </form>
            </motion.div>
          )}

          {activeTab === 'API' && (
            <motion.div 
              key="api"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              <div className="flex items-center space-x-4 mb-10">
                 <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Terminal size={24} />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">API & Webhook</h3>
              </div>

              <div className="space-y-10">
                <div className="bg-gray-50 dark:bg-white/5 p-10 rounded-[3rem] border border-gray-100 dark:border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">API Secret Key</label>
                    <button 
                      onClick={handleRegenerateKey}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-gray-950 transition-colors flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        value={apiKey || 'No key generated'} 
                        readOnly 
                        className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/10 p-5 rounded-2xl font-mono text-sm tracking-widest outline-none" 
                      />
                      <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <button 
                      onClick={() => apiKey && copyToClipboard(apiKey, "API Key")}
                      className="p-5 bg-gray-950 text-white rounded-2xl hover:bg-blue-600 transition-all"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Webhook URL</label>
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://your-api.com/webhook"
                    className="w-full p-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] text-sm font-black tracking-tight focus:bg-white dark:focus:bg-[#050505] outline-none transition-all"
                  />
                </div>

                <button 
                  onClick={handleSaveConfig}
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-950 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Config'}
                </button>
              </div>
            </motion.div>
          )}

          {(activeTab === 'BANK' || activeTab === 'PASSWORD') && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
               <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Shield size={40} />
               </div>
               <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase">Coming Soon</h3>
                  <p className="text-gray-400 font-medium">This feature is currently being optimized for your security.</p>
               </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }: any) => (
  <button 
    onClick={onClick}
    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-gray-50 text-gray-400 hover:text-gray-900 dark:bg-white/5 dark:hover:text-white'}`}
  >
    {children}
  </button>
);

const ProfileInput = ({ label, value, onChange, readOnly, type = "text", maxLength }: any) => (
  <div className="space-y-4">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">{label}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      readOnly={readOnly}
      maxLength={maxLength}
      className={`w-full p-6 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-[2rem] text-sm font-black tracking-tight focus:bg-white dark:focus:bg-[#050505] outline-none transition-all ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
  </div>
);

const SectionHeader = ({ title, desc }: { title: string, desc: string }) => (
  <div>
    <h3 className="text-4xl font-black tracking-tighter uppercase mb-2">{title}</h3>
    <p className="text-gray-400 font-medium">{desc}</p>
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
