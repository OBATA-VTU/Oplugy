import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { CreditCard, Landmark, Copy, Zap, ShieldCheck, Info, ArrowRight, Upload, CheckCircle2 } from 'lucide-react';
import { uploadToImgBB } from '../services/imgbbService';
import { vtuService } from '../services/vtuService';
import { billstackService } from '../services/billstackService';
import { useSearchParams } from 'react-router-dom';

declare const PaystackPop: any;

const FundingPage: React.FC = () => {
  const { user, fetchWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState(searchParams.get('amount') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundingMethod, setFundingMethod] = useState<'AUTO' | 'MANUAL' | 'VIRTUAL' | null>(null);
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
        email: user?.email || 'user@obata.com',
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
        lastName: 'Oplug',
        phone: user.phone || '',
        reference: `REF-${user.id}-${Date.now()}`
      });

      if (res.status && res.data) {
        const account = res.data.account[0];
        await vtuService.recordTransaction({
          userId: user.id,
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
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter uppercase">Fund Wallet</h2>
        <p className="text-gray-400 font-medium text-lg">Choose your preferred method to add funds.</p>
      </div>

      {/* Charges Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
          <Info size={20} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest">Transaction Charges</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
            <p className="text-blue-800 text-xs font-medium">0.7% – Virtual Account (9PSB & PalmPay transfers)</p>
            <p className="text-blue-800 text-xs font-medium">2% – Paystack payments</p>
          </div>
        </div>
      </div>

      {/* Virtual Account Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Landmark size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Virtual Account</h3>
            <p className="text-gray-400 text-xs font-medium">Automated funding via bank transfer.</p>
          </div>
        </div>

        {user?.virtualAccount ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bank Name</p>
                <p className="text-lg font-black text-gray-900">{user.virtualAccount.bank_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-black text-blue-600 tracking-tighter">{user.virtualAccount.account_number}</p>
                  <button onClick={() => handleCopy(user.virtualAccount!.account_number, 'Account Number')} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Account Name</p>
                <p className="text-sm font-bold text-gray-700">{user.virtualAccount.account_name}</p>
              </div>
            </div>
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col justify-center items-center text-center space-y-4">
              <CheckCircle2 className="text-emerald-600 w-12 h-12" />
              <p className="text-emerald-900 text-xs font-bold leading-relaxed">
                Funds sent to this account will be credited to your wallet instantly after 0.7% fee deduction.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
              <Zap className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-gray-900 tracking-tight">No Virtual Account Found</h4>
              <p className="text-gray-400 text-sm font-medium">Generate a dedicated account number to fund your wallet instantly via bank transfer.</p>
            </div>
            <button 
              onClick={handleGenerateVirtualAccount}
              disabled={isProcessing}
              className="px-10 py-4 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-950 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              {isProcessing ? 'Generating...' : 'Generate Account Now'}
            </button>
          </div>
        )}
      </div>

      {/* Paystack Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Paystack (Card/Transfer)</h3>
            <p className="text-gray-400 text-xs font-medium">Instant funding via Paystack secure gateway.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Enter Amount (₦)</label>
            <div className="relative">
              <input 
                type="number" 
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-2xl text-2xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">₦</div>
            </div>
          </div>

          {numAmount > 0 && (
            <div className="bg-gray-50 p-6 rounded-2xl space-y-3 border border-gray-100">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-widest">Gateway Fee (2%)</span>
                <span className="font-black text-red-500">₦{(numAmount * 0.02).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-black text-gray-900 uppercase tracking-widest text-xs">Total to Pay</span>
                <span className="font-black text-blue-600 text-2xl tracking-tight">₦{(numAmount * 1.02).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}

          <button 
            onClick={handlePaystack}
            disabled={isProcessing || numAmount < 100}
            className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-gray-950 transition-all disabled:opacity-30 flex items-center justify-center space-x-3"
          >
            <CreditCard size={18} />
            <span>{isProcessing ? 'Processing...' : 'Pay with Paystack'}</span>
          </button>
        </div>
      </div>

      {/* Manual Payment Section */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center">
            <ArrowRight size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Manual Payment</h3>
            <p className="text-gray-400 text-xs font-medium">No fees. Requires manual verification by admin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 rounded-2xl p-8 text-white space-y-6 relative overflow-hidden">
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Bank Name</p>
              <p className="text-lg font-black tracking-tight">Palmpay</p>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-black tracking-tighter">8142452729</p>
                <button onClick={() => handleCopy('8142452729', 'Account Number')} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Account Name</p>
              <p className="text-sm font-bold">Boluwatife Oluwapelumi Ayuba</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Upload Proof of Payment</label>
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
                  className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-gray-100 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                  {receiptPreview ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                      <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white font-black text-[10px] uppercase tracking-widest">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mb-2 group-hover:text-blue-600 transition-colors" />
                      <p className="text-gray-900 font-bold text-xs tracking-tight">Click to upload screenshot</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <button 
              onClick={handleManualSubmit}
              disabled={isProcessing || !receiptFile || numAmount < 100}
              className="w-full py-5 bg-gray-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-30 flex items-center justify-center space-x-3"
            >
              <CheckCircle2 size={16} />
              <span>{isProcessing ? 'Submitting...' : 'Submit Proof'}</span>
            </button>
          </div>
        </div>
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
