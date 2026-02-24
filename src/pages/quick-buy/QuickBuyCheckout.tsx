import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, CheckCircle2, ArrowLeft, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import Logo from '../../components/Logo';
import Footer from '../../components/Footer';
import Spinner from '../../components/Spinner';
import LoadingScreen from '../../components/LoadingScreen';

declare const PaystackPop: any;

const QuickBuyCheckout: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('quick_buy_checkout');
    if (!data) {
      navigate('/quick-purchase');
      return;
    }
    setCheckoutData(JSON.parse(data));
  }, [navigate]);

  if (!checkoutData) return null;

  const amount = Number(checkoutData.amount);
  const fee = amount * 0.02; // 2% service fee
  const total = amount + fee;

  const handlePayment = () => {
    setIsProcessing(true);
    const publicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      addNotification("Gateway config error.", "error");
      setIsProcessing(false);
      return;
    }

    const handler = PaystackPop.setup({
      key: publicKey,
      email: 'guest@obata.com',
      amount: Math.round(total * 100),
      currency: 'NGN',
      callback: (response: any) => {
        addNotification("Payment Successful! Processing your order...", "success");
        // In a real app, we would call the backend here to fulfill the order
        // For quick purchase, we simulate the fulfillment
        setTimeout(() => {
          setIsProcessing(false);
          addNotification("Order fulfilled successfully!", "success");
          sessionStorage.removeItem('quick_buy_checkout');
          navigate('/');
        }, 3000);
      },
      onClose: () => {
        setIsProcessing(false);
        addNotification("Payment cancelled.", "info");
      }
    });

    handler.openIframe();
  };

  if (isProcessing) return <LoadingScreen message="Fulfilling Order via Secure Node..." />;

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans">
      <nav className="px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-12">
        <div className="w-full max-w-xl bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-gray-50 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Checkout.</h1>
            <p className="text-gray-500 font-medium">Review and complete your payment.</p>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-400">Service</span>
                <span className="text-sm font-bold text-gray-900">{checkoutData.label}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-400">Network / Provider</span>
                <span className="text-sm font-bold text-gray-900 uppercase">{checkoutData.providerName || checkoutData.network}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-400">Recipient</span>
                <span className="text-sm font-bold text-gray-900">{checkoutData.recipient}</span>
              </div>
              {checkoutData.customerName && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-400">Customer</span>
                  <span className="text-sm font-bold text-gray-900">{checkoutData.customerName}</span>
                </div>
              )}
              {checkoutData.planName && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-400">Plan</span>
                  <span className="text-sm font-bold text-gray-900">{checkoutData.planName}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-400">Amount</span>
                <span className="text-sm font-bold text-gray-900">₦{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-gray-400">Service Fee</span>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-gray-300 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      A 2% convenience fee is applied to all guest purchases.
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">₦{fee.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Payable</span>
                <span className="text-3xl font-black text-blue-600 tracking-tight">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handlePayment} 
              disabled={isProcessing}
              className="w-full py-6 bg-blue-600 hover:bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-blue-100 transition-all flex items-center justify-center space-x-3 transform active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <Spinner /> : <><ShieldCheck className="w-5 h-5" /> <span>Pay ₦{total.toLocaleString()}</span></>}
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              <span>Secured by Paystack</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickBuyCheckout;
