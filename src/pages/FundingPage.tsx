import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { CreditCard, Landmark, Copy, Zap, ShieldCheck, Info, ArrowRight, Upload, CheckCircle2, Bitcoin, Wallet, ArrowUpRight } from 'lucide-react';
import { uploadToImgBB } from '../services/imgbbService';
import { vtuService } from '../services/vtuService';
import { billstackService } from '../services/billstackService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

declare const PaystackPop: any;

const FundingPage: React.FC = () => {
  const { user, fetchWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundingMethod, setFundingMethod] = useState<'AUTO' | 'MANUAL' | 'VIRTUAL' | 'CRYPTO' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const serviceFee = fundingMethod === 'AUTO' ? numAmount * 0.02 : 0; // 2% fee for Paystack
  const totalCharge = numAmount + serviceFee;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addNotification(`${label} copied to clipboard`, 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification("File size too large. Max 5MB.", "warning");
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = async () => {
    if (!receiptFile) {
      addNotification("Please upload a proof of payment.", "warning");
      return;
    }

    setIsProcessing(true);
    try {
      const receiptUrl = await uploadToImgBB(receiptFile);
      const res = await vtuService.submitManualFundingRequest({
        amount: numAmount,
        receiptUrl
      });

      if (res.status) {
        addNotification(res.message || 'Request submitted successfully', 'success');
        setAmount('');
        setReceiptFile(null);
        setReceiptPreview(null);
        setFundingMethod(null);
      } else {
        addNotification(res.message || 'Failed to submit request', 'error');
      }
    } catch (err: any) {
      addNotification(err.message || "Failed to submit request.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaystack = () => {
    if (!amount || isNaN(numAmount) || numAmount < 100) {
      addNotification("Minimum funding amount is ₦100.", "warning");
      return;
    }

    setIsProcessing(true);
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      addNotification("Payment configuration missing. Contact admin.", "error");
      setIsProcessing(false);
      return;
    }

    try {
      const handler = PaystackPop.setup({
        key: publicKey,
        email: user?.email || 'user@ublog.com',
        amount: Math.round(totalCharge * 100),
        currency: 'NGN',
        callback: async (response: any) => {
          addNotification('Payment successful! Syncing wallet...', 'success');
          await fetchWalletBalance();
          setAmount('');
          setIsProcessing(false);
        },
        onClose: () => {
          setIsProcessing(false);
        }
      });
      handler.openIframe();
    } catch (err) {
      setIsProcessing(false);
      addNotification("Payment service error. Please try again.", "error");
    }
  };

  const handleGenerateVirtualAccount = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const res = await billstackService.generateVirtualAccount({
        email: user.email,
        firstName: user.username,
        lastName: 'Ublog',
        phone: user.phone || '',
        reference: `REF-${user.id}-${Date.now()}`
      });

      if (res.status && res.data) {
        const account = res.data.account[0];
        await vtuService.recordTransaction({
          uid: user.id,
          userEmail: user.email,
          type: 'SYSTEM',
          amount: 0,
          source: 'Virtual Account Generation',
          remarks: `Generated ${account.bank_name} account: ${account.account_number}`,
          status: 'SUCCESS'
        });
        
        // Update user doc with virtual account info
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');
        await updateDoc(doc(db, "users", user.id), {
          virtualAccount: {
            account_number: account.account_number,
            account_name: account.account_name,
            bank_name: account.bank_name,
            bank_id: account.bank_id,
            reference: res.data.reference
          }
        });

        addNotification("Virtual account generated successfully!", "success");
      } else {
        addNotification(res.message || "Failed to generate virtual account.", "error");
      }
    } catch (err: any) {
      addNotification(err.message || "An error occurred.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32 px-4 lg:px-0">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 pt-12"
      >
        <div className="inline-flex p-5 bg-emerald-100 text-emerald-600 rounded-[2.5rem] mb-2 shadow-xl shadow-emerald-200/50">
          <Wallet className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter">Add Funds</h2>
          <p className="text-slate-400 font-medium text-xl max-w-xl mx-auto">Choose your preferred method to top up your wallet instantly.</p>
        </div>
      </motion.div>

      {/* Charges Notice */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex items-start space-x-6 shadow-lg shadow-emerald-100/50"
      >
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-lg">
          <Info size={28} />
        </div>
        <div className="space-y-2">
          <h4 className="text-lg font-black text-emerald-900 uppercase tracking-widest">Transaction Charges</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2">
            <p className="text-emerald-800 text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              0.7% – Virtual Account (9PSB & PalmPay)
            </p>
            <p className="text-emerald-800 text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              2% – Paystack Card/Transfer
            </p>
            <p className="text-emerald-800 text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              0% – Manual Bank Transfer
            </p>
            <p className="text-emerald-800 text-sm font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              0% – Crypto Funding (NOWPayments)
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Virtual Account Section */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8 flex flex-col"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <Landmark size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Virtual Account</h3>
              <p className="text-slate-400 text-sm font-medium">Automated funding via dedicated bank transfer.</p>
            </div>
          </div>

          {user?.virtualAccount ? (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Name</p>
                  <p className="text-2xl font-black text-slate-900">{user.virtualAccount.bank_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Number</p>
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-black text-emerald-600 tracking-tighter">{user.virtualAccount.account_number}</p>
                    <button onClick={() => handleCopy(user.virtualAccount!.account_number, 'Account Number')} className="p-3 bg-white hover:bg-emerald-50 text-emerald-600 rounded-2xl transition-all shadow-sm">
                      <Copy size={24} />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Name</p>
                  <p className="text-lg font-bold text-slate-700">{user.virtualAccount.account_name}</p>
                </div>
              </div>
              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center space-x-4">
                <CheckCircle2 className="text-emerald-600 w-10 h-10 flex-shrink-0" />
                <p className="text-emerald-900 text-xs font-bold leading-relaxed">
                  Funds sent to this account will be credited to your wallet instantly after 0.7% fee deduction.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] p-12 text-center space-y-8 flex-1 flex flex-col justify-center items-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-emerald-100">
                <Zap className="w-12 h-12" />
              </div>
              <div className="space-y-3">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">No Virtual Account</h4>
                <p className="text-slate-400 text-base font-medium max-w-xs mx-auto">Generate a dedicated account number to fund your wallet instantly via bank transfer.</p>
              </div>
              <button 
                onClick={handleGenerateVirtualAccount}
                disabled={isProcessing}
                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50 shadow-xl shadow-emerald-200"
              >
                {isProcessing ? 'Generating...' : 'Generate Account Now'}
              </button>
            </div>
          )}
        </motion.div>

        {/* Crypto Funding Section */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-900/20 border border-slate-800 space-y-8 flex flex-col relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <Bitcoin size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Crypto Funding</h3>
              <p className="text-slate-400 text-sm font-medium">Fund your wallet using BTC, ETH, USDT & more.</p>
            </div>
          </div>

          <div className="space-y-8 flex-1 flex flex-col justify-center relative z-10">
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 text-center space-y-6">
              <div className="flex justify-center -space-x-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-xl">
                  <Bitcoin className="text-white w-8 h-8" />
                </div>
                <div className="w-16 h-16 bg-blue-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-xl">
                  <Zap className="text-white w-8 h-8" />
                </div>
                <div className="w-16 h-16 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center shadow-xl">
                  <Landmark className="text-white w-8 h-8" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-white tracking-tight">Zero Fees</h4>
                <p className="text-slate-400 text-sm font-medium">Enjoy 0% fees when you fund your wallet using any supported cryptocurrency.</p>
              </div>
            </div>

            <button 
              onClick={() => navigate('/crypto')}
              className="w-full py-6 bg-emerald-500 text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <span>Go to Crypto Page</span>
              <ArrowUpRight size={20} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Paystack Section */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <CreditCard size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Paystack</h3>
              <p className="text-slate-400 text-sm font-medium">Instant funding via Card, USSD or Bank Transfer.</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Enter Amount (₦)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="w-full p-8 bg-slate-50 border-2 border-transparent rounded-[2.5rem] text-4xl font-black tracking-tighter outline-none focus:border-emerald-500 focus:bg-white transition-all" 
                  placeholder="0.00" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                />
                <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-2xl">₦</div>
              </div>
            </div>

            <AnimatePresence>
              {numAmount > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border border-slate-100"
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-widest">Gateway Fee (2%)</span>
                    <span className="font-black text-rose-500">₦{(numAmount * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Total to Pay</span>
                    <span className="font-black text-emerald-600 text-3xl tracking-tight">₦{(numAmount * 1.02).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={handlePaystack}
              disabled={isProcessing || numAmount < 100}
              className="w-full py-8 bg-emerald-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-200 hover:bg-slate-900 transition-all disabled:opacity-30 flex items-center justify-center space-x-4"
            >
              <CreditCard size={24} />
              <span>{isProcessing ? 'Processing...' : 'Pay with Paystack'}</span>
            </button>
          </div>
        </motion.div>

        {/* Manual Payment Section */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10"
        >
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
              <ArrowRight size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Manual Transfer</h3>
              <p className="text-slate-400 text-sm font-medium">No fees. Requires admin verification (1-10 mins).</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bank Name</p>
                <p className="text-2xl font-black tracking-tight">Palmpay</p>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-black tracking-tighter text-emerald-400">8142452729</p>
                  <button onClick={() => handleCopy('8142452729', 'Account Number')} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                    <Copy size={24} />
                  </button>
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Name</p>
                <p className="text-lg font-bold">Boluwatife Oluwapelumi Ayuba</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Upload Proof of Payment</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden" 
                    id="receipt-upload"
                  />
                  <label 
                    htmlFor="receipt-upload"
                    className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer group"
                  >
                    {receiptPreview ? (
                      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-xl">
                        <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white font-black text-xs uppercase tracking-widest">Change Receipt</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4 group-hover:text-emerald-500 group-hover:bg-white transition-all">
                          <Upload className="w-8 h-8" />
                        </div>
                        <p className="text-slate-900 font-black text-sm tracking-tight uppercase">Click to upload screenshot</p>
                        <p className="text-slate-400 text-xs mt-2">Max file size: 5MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <button 
                onClick={handleManualSubmit}
                disabled={isProcessing || !receiptFile || numAmount < 100}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 flex items-center justify-center space-x-4 shadow-xl shadow-slate-200"
              >
                <CheckCircle2 size={20} />
                <span>{isProcessing ? 'Submitting...' : 'Submit Proof'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Secure Payment</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Your transaction is encrypted and secured by industry leaders.</p>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner">
            <Zap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Instant Credit</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Automated payments are processed instantly to your wallet.</p>
          </div>
        </motion.div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-6"
        >
          <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 shadow-inner">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">24/7 Support</h4>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">Need help? Our support team is always available to assist you.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FundingPage;
