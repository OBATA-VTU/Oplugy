
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Users, Gift, Copy, Share2, Award, ArrowRight, Zap, ShieldCheck, TrendingUp, Wallet, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ReferralPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);

  const displayCode = user?.referralCode || 'JOIN-INLOMAX';
  const referralLink = `${window.location.origin}/#/signup?ref=${displayCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    addNotification('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Inlomax VTU',
          text: 'Get cheap data and airtime on Inlomax. Join now!',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Gift className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Refer & Earn</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Invite your friends and earn commissions on every transaction they make.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Referral Link Card */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 lg:p-12 rounded-[4rem] shadow-2xl shadow-blue-100/50 border border-gray-50 space-y-10 relative overflow-hidden">
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Your Unique Link</p>
                <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-between group">
                  <p className="text-gray-400 font-bold truncate mr-4">{referralLink}</p>
                  <button onClick={handleCopy} className={`p-4 rounded-2xl shadow-sm transition-all shrink-0 ${copied ? 'bg-green-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white'}`}>
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleShare}
                  className="flex-1 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all flex items-center justify-center space-x-3"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
                <div className="flex-1 py-6 bg-gray-50 text-gray-900 rounded-[2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-3 border border-gray-100">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>{user?.referralCount || 0} Referrals</span>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <StatCard icon={<Wallet className="w-6 h-6" />} label="Total Earned" value={`₦${(user?.referralEarnings || 0).toLocaleString()}`} color="blue" />
            <StatCard icon={<Award className="w-6 h-6" />} label="Rank" value="Ambassador" color="amber" />
          </div>
        </div>

        {/* Right: How it works */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-gray-900 p-10 rounded-[3.5rem] text-white space-y-10 shadow-2xl">
            <h3 className="text-2xl font-black tracking-tight">How it works</h3>
            
            <div className="space-y-8">
              <Step icon="1" title="Share Link" desc="Copy your unique link and share it with your network." />
              <Step icon="2" title="They Register" desc="Your friends join Inlomax using your referral link." />
              <Step icon="3" title="You Earn" desc="Get instant commissions whenever they fund or buy." />
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium text-white/60 leading-relaxed">Commissions are credited to your referral wallet instantly and can be moved to your main wallet anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'blue' | 'amber' }) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 space-y-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tighter">{value}</p>
    </div>
  </div>
);

const Step = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex items-start space-x-6">
    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-blue-400 shrink-0">{icon}</div>
    <div className="space-y-1">
      <h4 className="font-black tracking-tight">{title}</h4>
      <p className="text-xs text-white/40 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default ReferralPage;
