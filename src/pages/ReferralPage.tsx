
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UsersIcon } from '../components/Icons';

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Fallback to a safe string if referralCode is somehow missing during the transition
  const displayCode = user?.referralCode || 'JOIN-OBATA';
  const referralLink = `${window.location.origin}/#/signup?ref=${displayCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Affiliate Program</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Refer & Earn</h1>
        <p className="mt-6 text-gray-400 font-medium text-lg max-w-xl mx-auto">Get rewarded for every friend you bring to the OBATA v2 ecosystem. Passive income starts here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-blue-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200 relative overflow-hidden">
            <h3 className="text-2xl font-black mb-6 tracking-tight">Your Referral Link</h3>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-3xl mb-8">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Sharable URL</p>
               <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-sm truncate flex-1">{referralLink}</p>
                  <div className="px-3 py-1 bg-white/20 rounded-lg font-black text-xs">{displayCode}</div>
               </div>
            </div>
            <button 
              onClick={copyLink}
              className={`w-full py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl ${copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
            >
               {copied ? 'Successfully Copied' : 'Copy Referral Link'}
            </button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
         </div>

         <div className="bg-white border border-gray-100 p-12 rounded-[3rem] shadow-xl">
            <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Program Performance</h3>
            <div className="space-y-6">
               <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><UsersIcon /></div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Referrals</span>
                  </div>
                  <span className="text-2xl font-black text-gray-900 tracking-tighter">{user?.referralCount || 0}</span>
               </div>
               <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     </div>
                     <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Earnings</span>
                  </div>
                  <span className="text-2xl font-black text-green-600 tracking-tighter">₦{(user?.referralEarnings || 0).toLocaleString()}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-gray-900 text-white p-12 rounded-[3rem] relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tight mb-6">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               <div>
                  <div className="text-blue-500 font-black text-4xl mb-4">01</div>
                  <p className="font-bold text-sm text-white/60 leading-relaxed uppercase tracking-widest">Share your unique link with friends, family, and colleagues.</p>
               </div>
               <div>
                  <div className="text-blue-500 font-black text-4xl mb-4">02</div>
                  <p className="font-bold text-sm text-white/60 leading-relaxed uppercase tracking-widest">They sign up and complete their first wallet funding on OBATA v2.</p>
               </div>
               <div>
                  <div className="text-blue-500 font-black text-4xl mb-4">03</div>
                  <p className="font-bold text-sm text-white/60 leading-relaxed uppercase tracking-widest">You earn a commission instantly credited to your referral wallet.</p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
};

export default ReferralPage;
