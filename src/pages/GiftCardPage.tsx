import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import PinPromptModal from '../components/PinPromptModal';
import InsufficientBalanceModal from '../components/InsufficientBalanceModal';
import LoadingScreen from '../components/LoadingScreen';
import { Gift, CheckCircle2, Zap, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const GiftCardPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const { walletBalance, fetchWalletBalance, user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'GENERATE' | 'REDEEM'>('GENERATE');
  const [amount, setAmount] = useState('');
  const [redeemCode, setRedeemCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showInsufficientModal, setShowInsufficientModal] = useState(false);

  const handleGenerate = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      addNotification("Please enter a valid amount.", "warning");
      return;
    }

    const numAmount = Number(amount);
    if (walletBalance !== null && numAmount > walletBalance) {
      setShowInsufficientModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const executeGenerate = async () => {
    setShowPinModal(false);
    setIsLoading(true);
    setLoadingMessage('Generating Gift Card...');
    
    try {
      const response = await axios.post('/api/giftcards/generate', {
        amount: Number(amount),
        userId: user?.id
      });

      if (response.data.status) {
        setGeneratedCode(response.data.code);
        addNotification("Gift card generated successfully!", "success");
        await fetchWalletBalance();
      } else {
        addNotification(response.data.message || "Failed to generate gift card", "error");
      }
    } catch (error: any) {
      addNotification(error.response?.data?.message || "An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode) {
      addNotification("Please enter a gift card code.", "warning");
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Redeeming Gift Card...');
    
    try {
      const response = await axios.post('/api/giftcards/redeem', {
        code: redeemCode.trim().toUpperCase(),
        userId: user?.id
      });

      if (response.data.status) {
        addNotification(response.data.message, "success");
        setRedeemCode('');
        await fetchWalletBalance();
      } else {
        addNotification(response.data.message || "Failed to redeem gift card", "error");
      }
    } catch (error: any) {
      addNotification(error.response?.data?.message || "An error occurred", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addNotification("Code copied to clipboard!", "success");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 px-4">
      {isLoading && <LoadingScreen message={loadingMessage} />}
      
      <PinPromptModal 
        isOpen={showPinModal} 
        onClose={() => setShowPinModal(false)} 
        onSuccess={executeGenerate}
        title="Confirm Generation"
        description={`Authorize ₦${Number(amount).toLocaleString()} to generate a gift card code.`}
      />

      <InsufficientBalanceModal 
        isOpen={showInsufficientModal}
        onClose={() => setShowInsufficientModal(false)}
        currentBalance={walletBalance || 0}
        requiredAmount={Number(amount)}
        onPayRemaining={() => navigate('/funding')}
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-[2rem] mb-4 shadow-inner">
          <Gift className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Gift Cards</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Generate and redeem gift codes within the Oplug network.</p>
      </div>

      <div className="flex bg-gray-100 p-2 rounded-[2.5rem] max-w-md mx-auto border border-gray-200 shadow-inner">
        <button 
          onClick={() => { setActiveTab('GENERATE'); setGeneratedCode(null); }}
          className={`flex-1 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'GENERATE' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Generate
        </button>
        <button 
          onClick={() => { setActiveTab('REDEEM'); setGeneratedCode(null); }}
          className={`flex-1 py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'REDEEM' ? 'bg-white text-gray-900 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Redeem
        </button>
      </div>

      <div className="bg-white p-10 lg:p-16 rounded-[4rem] shadow-2xl shadow-purple-100/50 border border-gray-50 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'GENERATE' ? (
            <motion.div 
              key="generate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {!generatedCode ? (
                <>
                  <div className="space-y-6">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Enter Amount to Gift</label>
                    <div className="relative">
                      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-4xl font-black text-gray-300">₦</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-gray-50 border-2 border-gray-50 p-10 pl-20 rounded-[3rem] text-5xl font-black tracking-tighter focus:bg-white focus:border-purple-600 outline-none transition-all"
                      />
                    </div>
                    <p className="text-center text-gray-400 text-sm font-medium">A 0.5% fee will be deducted from the receiver upon redemption.</p>
                  </div>

                  <button 
                    onClick={handleGenerate}
                    className="w-full py-8 bg-purple-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-purple-100 hover:bg-gray-950 transition-all transform active:scale-95"
                  >
                    Generate Code
                  </button>
                </>
              ) : (
                <div className="text-center space-y-10 py-10">
                  <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Code Generated!</h3>
                    <p className="text-gray-400 font-medium text-lg">Share this code with the lucky recipient.</p>
                  </div>
                  
                  <div className="bg-gray-900 p-10 rounded-[3rem] relative group cursor-pointer" onClick={copyCode}>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">Gift Card Code</p>
                    <p className="text-6xl font-black text-white tracking-[0.2em]">{generatedCode}</p>
                    <div className="absolute top-6 right-6 text-white/20 group-hover:text-white transition-colors">
                      {copied ? <Check size={24} /> : <Copy size={24} />}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setGeneratedCode(null); setAmount(''); }}
                    className="w-full py-6 text-purple-600 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-all"
                  >
                    Generate Another
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="redeem"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <form onSubmit={handleRedeem} className="space-y-10">
                <div className="space-y-6">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4">Enter Gift Code</label>
                  <input 
                    type="text" 
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="w-full bg-gray-50 border-2 border-gray-50 p-10 rounded-[3rem] text-5xl font-black tracking-[0.2em] text-center focus:bg-white focus:border-purple-600 outline-none transition-all uppercase"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-8 bg-purple-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-purple-100 hover:bg-gray-950 transition-all transform active:scale-95"
                >
                  Redeem Now
                </button>
              </form>

              <div className="p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex items-center space-x-6">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-purple-600">
                  <Zap size={24} />
                </div>
                <p className="text-[10px] font-black text-purple-900/40 uppercase tracking-widest leading-relaxed">
                  A 0.5% network charge applies to all gift card redemptions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-10 bg-gray-950 rounded-[3rem] text-white relative overflow-hidden flex items-center justify-between shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-[60%]">
          <h2 className="text-3xl font-black tracking-tighter italic">Instant Gifting.</h2>
          <p className="text-sm font-medium opacity-60 leading-tight">
            Send money to anyone on Oplug instantly with zero charges on generation.
          </p>
        </div>
        <div className="w-24 h-24 bg-purple-600/20 rounded-full blur-3xl absolute -right-10 -top-10"></div>
      </div>
    </div>
  );
};

export default GiftCardPage;
