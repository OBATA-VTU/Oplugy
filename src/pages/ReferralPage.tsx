
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UsersIcon } from '../components/Icons';
import { motion } from 'motion/react';
import { Copy, Check, Share2, TrendingUp, Wallet, Gift, ArrowRight } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Affiliate Program</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">Refer <br />& <span className="text-blue-600">Earn.</span></h1>
          <p className="mt-6 text-gray-400 font-medium text-xl max-w-xl leading-relaxed">Get rewarded for every friend you bring to the OBATA v2 ecosystem. Passive income starts here.</p>
        </div>
        <div className="flex items-center space-x-4 px-8 py-4 bg-blue-50 text-blue-600 rounded-full border border-blue-100 h-fit">
           <TrendingUp className="w-5 h-5" />
           <span className="text-[11px] font-black uppercase tracking-widest">Growth Phase Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="lg:col-span-7 bg-blue-600 rounded-[4rem] p-12 lg:p-16 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group"
         >
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div>
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                     <Share2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-black mb-8 tracking-tighter">Your Referral Link</h3>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] mb-12 group-hover:bg-white/15 transition-all">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-4">Sharable URL</p>
                     <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <p className="font-bold text-lg truncate flex-1 w-full text-center sm:text-left">{referralLink}</p>
                        <div className="px-6 py-3 bg-white/20 rounded-2xl font-black text-sm tracking-widest border border-white/10">{displayCode}</div>
                     </div>
                  </div>
               </div>
               <button 
                 onClick={copyLink}
                 className={`w-full py-8 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-2xl transform active:scale-95 flex items-center justify-center space-x-4 ${copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600 hover:bg-gray-950 hover:text-white'}`}
               >
                  {copied ? <><Check className="w-5 h-5" /> <span>Successfully Copied</span></> : <><Copy className="w-5 h-5" /> <span>Copy Referral Link</span></>}
               </button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[120px] group-hover:bg-white/10 transition-all duration-1000"></div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="lg:col-span-5 bg-white border border-gray-50 p-12 lg:p-16 rounded-[4rem] shadow-2xl flex flex-col justify-between"
         >
            <div>
               <h3 className="text-4xl font-black text-gray-900 mb-12 tracking-tighter">Performance</h3>
               <div className="space-y-8">
                  <div className="flex justify-between items-center p-10 bg-gray-50 rounded-[2.5rem] group hover:bg-blue-50 transition-all">
                     <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><UsersIcon /></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Referrals</p>
                           <p className="text-3xl font-black text-gray-900 tracking-tighter mt-1">{user?.referralCount || 0}</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex justify-between items-center p-10 bg-gray-50 rounded-[2.5rem] group hover:bg-emerald-50 transition-all">
                     <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                           <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Earnings</p>
                           <p className="text-3xl font-black text-emerald-600 tracking-tighter mt-1">₦{(user?.referralEarnings || 0).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="mt-12 p-8 bg-blue-50 rounded-3xl border border-blue-100 flex items-center space-x-4">
               <Gift className="w-6 h-6 text-blue-600" />
               <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">Rewards are credited instantly to your wallet.</p>
            </div>
         </motion.div>
      </div>

      <div className="bg-gray-950 text-white p-16 lg:p-24 rounded-[5rem] relative overflow-hidden group">
         <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-12">
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <ArrowRight className="w-6 h-6" />
               </div>
               <h3 className="text-4xl font-black tracking-tighter">How it works</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
               <div className="space-y-6">
                  <div className="text-blue-600 font-black text-6xl tracking-tighter">01</div>
                  <h4 className="text-2xl font-black tracking-tight">Share Link</h4>
                  <p className="font-medium text-lg text-white/40 leading-relaxed">Share your unique link with friends, family, and colleagues across all social platforms.</p>
               </div>
               <div className="space-y-6">
                  <div className="text-blue-600 font-black text-6xl tracking-tighter">02</div>
                  <h4 className="text-2xl font-black tracking-tight">They Join</h4>
                  <p className="font-medium text-lg text-white/40 leading-relaxed">They sign up and complete their first wallet funding on the OBATA v2 ecosystem.</p>
               </div>
               <div className="space-y-6">
                  <div className="text-blue-600 font-black text-6xl tracking-tighter">03</div>
                  <h4 className="text-2xl font-black tracking-tight">Earn Cash</h4>
                  <p className="font-medium text-lg text-white/40 leading-relaxed">You earn a commission instantly credited to your referral wallet for every successful funding.</p>
               </div>
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-600/10 rounded-full blur-[150px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
      </div>
    </div>
  );
};

export default ReferralPage;
