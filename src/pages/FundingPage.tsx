import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { Wallet, CreditCard, Landmark, Copy, Zap, ShieldCheck, Info, ArrowRight, Upload, CheckCircle2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { uploadToImgBB } from '../services/imgbbService';
import { vtuService } from '../services/vtuService';
import { useSearchParams } from 'react-router-dom';

declare const PaystackPop: any;

const FundingPage: React.FC = () => {
  const { user, fetchWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundingMethod, setFundingMethod] = useState<'AUTO' | 'MANUAL' | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const serviceFee = fundingMethod === 'AUTO' ? numAmount * 0.02 : 0; // 2% fee only for auto
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
        setStep(1);
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
        email: user?.email || 'user@obata.com',
        amount: Math.round(totalCharge * 100),
        currency: 'NGN',
        callback: async (response: any) => {
          addNotification('Payment successful! Syncing wallet...', 'success');
          await fetchWalletBalance();
          setAmount('');
          setStep(1);
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

  const nextStep = () => {
    if (step === 1) {
      if (!amount || numAmount < 100) {
        addNotification("Minimum funding amount is ₦100.", "warning");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!fundingMethod) {
        addNotification("Please select a funding method.", "warning");
        return;
      }
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as any);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-[2rem] mb-4 shadow-inner">
          <Wallet className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Fund Wallet</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Add money to your wallet to start buying services.</p>
      </div>

      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-blue-100/50 border border-gray-50 relative overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-100">
          <motion.div 
            className="h-full bg-blue-600"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ type: 'spring', stiffness: 50 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 pt-6"
            >
              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">How much do you want to fund? (₦)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full p-10 bg-gray-50 border-4 border-transparent rounded-[2.5rem] text-5xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all text-center placeholder:text-gray-200" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                  />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl">₦</div>
                </div>
                <p className="text-center text-gray-400 text-sm font-medium">Minimum funding amount is ₦100</p>
              </div>

              <button 
                onClick={nextStep}
                className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 flex items-center justify-center space-x-4"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 pt-6"
            >
              <div className="flex items-center justify-between">
                <button onClick={prevStep} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-blue-600 transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Select Payment Method</h3>
                <div className="w-14" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setFundingMethod('AUTO')}
                  className={`p-8 rounded-[2.5rem] border-4 transition-all text-left space-y-4 ${fundingMethod === 'AUTO' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50 hover:border-blue-200'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${fundingMethod === 'AUTO' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Automated Payment</h4>
                    <p className="text-gray-400 text-sm font-medium">Instant funding. 2% service fee applies.</p>
                  </div>
                </button>

                <button 
                  onClick={() => setFundingMethod('MANUAL')}
                  className={`p-8 rounded-[2.5rem] border-4 transition-all text-left space-y-4 ${fundingMethod === 'MANUAL' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-50 bg-gray-50 hover:border-blue-200'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${fundingMethod === 'MANUAL' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 shadow-sm'}`}>
                    <Landmark className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-gray-900 tracking-tight">Manual Transfer</h4>
                    <p className="text-gray-400 text-sm font-medium">No fees. Requires admin approval (5-30 mins).</p>
                  </div>
                </button>
              </div>

              <button 
                onClick={nextStep}
                className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 flex items-center justify-center space-x-4"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10 pt-6"
            >
              <div className="flex items-center justify-between">
                <button onClick={prevStep} className="p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-blue-600 transition-all">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {fundingMethod === 'AUTO' ? 'Complete Payment' : 'Transfer Details'}
                </h3>
                <div className="w-14" />
              </div>

              {fundingMethod === 'AUTO' ? (
                <div className="space-y-8">
                  <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-4 border border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Funding Amount</span>
                      <span className="font-black text-gray-900 text-xl">₦{numAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Fee (2%)</span>
                      <span className="font-black text-red-500">₦{serviceFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Total to Pay</span>
                      <span className="font-black text-blue-600 text-3xl tracking-tight">₦{totalCharge.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handlePaystack}
                    disabled={isProcessing}
                    className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-4"
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>{isProcessing ? 'Processing...' : 'Pay with Paystack'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bank Name</p>
                        <p className="text-xl font-black tracking-tight">Palmpay</p>
                      </div>
                      <Landmark className="text-blue-500 w-8 h-8" />
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Number</p>
                      <div className="flex items-center justify-between">
                        <p className="text-4xl font-black tracking-tighter">8142452729</p>
                        <button onClick={() => handleCopy('8142452729', 'Account Number')} className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Name</p>
                      <p className="text-lg font-bold tracking-tight">Boluwatife Oluwapelumi Ayuba</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Upload Payment Receipt</label>
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
                        className="flex flex-col items-center justify-center w-full p-10 border-4 border-dashed border-gray-100 rounded-[2.5rem] hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer group"
                      >
                        {receiptPreview ? (
                          <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                            <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-black text-xs uppercase tracking-widest">Change Image</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <Upload className="w-8 h-8" />
                            </div>
                            <p className="text-gray-900 font-black text-sm tracking-tight">Click to upload screenshot</p>
                            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest mt-2">JPG, PNG up to 5MB</p>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleManualSubmit}
                    disabled={isProcessing || !receiptFile}
                    className="w-full py-8 bg-blue-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center space-x-4"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isProcessing ? 'Submitting...' : 'Submit Proof'}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h4 className="font-black text-gray-900 tracking-tight">Secure Payment</h4>
          <p className="text-gray-400 text-xs font-medium leading-relaxed">Your transaction is encrypted and secured by industry leaders.</p>
        </div>
        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="font-black text-gray-900 tracking-tight">Instant Funding</h4>
          <p className="text-gray-400 text-xs font-medium leading-relaxed">Automated payments are processed instantly to your wallet.</p>
        </div>
        <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="font-black text-gray-900 tracking-tight">24/7 Support</h4>
          <p className="text-gray-400 text-xs font-medium leading-relaxed">Need help? Our support team is always available to assist you.</p>
        </div>
      </div>
    </div>
  );
};

export default FundingPage;
