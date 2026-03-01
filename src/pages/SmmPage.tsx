import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { smmService } from '../services/smmService';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import PinPromptModal from '../components/PinPromptModal';
import { Globe, Users, Heart, MessageCircle, Share2, ChevronRight, Info, Search, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SmmService {
  service: string;
  name: string;
  type: string;
  category: string;
  rate: string;
  min: string;
  max: string;
  refill: boolean;
  cancel: boolean;
  manual_prices?: {
    user_price?: number;
    reseller_price?: number;
    api_price?: number;
  };
}

const SmmPage: React.FC = () => {
  const { user, walletBalance, updateWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  
  const [services, setServices] = useState<SmmService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredServices, setFilteredServices] = useState<SmmService[]>([]);
  const [selectedService, setSelectedService] = useState<SmmService | null>(null);
  
  const [details, setDetails] = useState({
    link: '',
    quantity: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    const res = await smmService.getServices();
    if (Array.isArray(res)) {
      setServices(res);
      const cats = Array.from(new Set(res.map((s: any) => s.category)));
      setCategories(cats);
    } else {
      addNotification("Failed to load social media services.", "error");
    }
    setIsLoading(false);
  }, [addNotification]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    if (selectedCategory) {
      let filtered = services.filter(s => s.category === selectedCategory);
      if (searchTerm) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [selectedCategory, services, searchTerm]);

  const calculatePrice = () => {
    if (!selectedService || !details.quantity) return 0;
    
    let rate = parseFloat(selectedService.rate);
    
    // Check for manual pricing based on role
    if (selectedService.manual_prices) {
      const role = user?.role || 'CUSTOMER';
      if (role === 'ADMIN' || role === 'CUSTOMER') {
        rate = selectedService.manual_prices.user_price || rate;
      } else if (role === 'AGENT') {
        rate = selectedService.manual_prices.reseller_price || rate;
      } else if (role === 'API') {
        rate = selectedService.manual_prices.api_price || rate;
      }
    }
    
    const qty = parseInt(details.quantity);
    // Rate is per 1000
    return (rate / 1000) * qty;
  };

  const handleOrder = async () => {
    if (!user || !selectedService) return;
    
    const price = calculatePrice();
    if ((walletBalance || 0) < price) {
      addNotification("Insufficient balance.", "error");
      return;
    }

    const qty = parseInt(details.quantity);
    if (qty < parseInt(selectedService.min) || qty > parseInt(selectedService.max)) {
      addNotification(`Quantity must be between ${selectedService.min} and ${selectedService.max}`, "warning");
      return;
    }

    if (!details.link) {
      addNotification("Please provide a valid link.", "warning");
      return;
    }

    setShowPinPrompt(true);
  };

  const executeOrder = async () => {
    setIsSubmitting(true);
    const price = calculatePrice();
    
    try {
      const res = await smmService.addOrder({
        service: selectedService!.service,
        link: details.link,
        quantity: parseInt(details.quantity)
      });

      if (res.order) {
        // Deduct balance
        await updateWalletBalance((walletBalance || 0) - price);
        
        // Record transaction
        await vtuService.recordTransaction({
          userId: user!.id,
          userEmail: user!.email,
          type: 'DEBIT',
          source: `SMM: ${selectedService!.name}`,
          amount: price,
          status: 'SUCCESS',
          reference: `SMM-${res.order}`,
          remarks: `Social Media Boost for ${details.link}`
        });

        addNotification("Order placed successfully!", "success");
        setDetails({ link: '', quantity: '' });
        setSelectedService(null);
      } else {
        addNotification(res.error || "Failed to place order.", "error");
      }
    } catch (error) {
      addNotification("An error occurred.", "error");
    }
    setIsSubmitting(false);
    setShowPinPrompt(false);
  };

  if (isLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-32">
      <PinPromptModal 
        isOpen={showPinPrompt} 
        onClose={() => setShowPinPrompt(false)} 
        onSuccess={executeOrder}
        title="Confirm Order"
        description={`You are about to pay ₦${calculatePrice().toLocaleString()} for ${selectedService?.name}.`}
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-purple-50 text-purple-600 rounded-[2rem] mb-4 shadow-inner">
          <Globe className="w-10 h-10" />
        </div>
        <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter">Social Boost</h2>
        <p className="text-gray-400 font-medium text-xl max-w-xl mx-auto">Grow your social media presence instantly. Followers, Likes, Views and more.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Selection */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl shadow-purple-100/50 border border-gray-50 space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] ml-4">1. Select Category</label>
              <div className="relative">
                <select 
                  className="w-full p-6 bg-gray-50 rounded-[2rem] font-bold text-lg border-2 border-transparent focus:border-purple-600 focus:bg-white outline-none transition-all appearance-none"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedService(null);
                  }}
                >
                  <option value="">Choose a platform...</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedCategory && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between px-4">
                    <label className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em]">2. Choose Service</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search services..." 
                        className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    {filteredServices.map(s => (
                      <button
                        key={s.service}
                        onClick={() => setSelectedService(s)}
                        className={`p-6 rounded-[2rem] border-2 text-left transition-all flex items-center justify-between group ${selectedService?.service === s.service ? "border-purple-600 bg-purple-50 shadow-lg shadow-purple-50" : "border-gray-50 bg-gray-50 hover:border-gray-200"}`}
                      >
                        <div className="flex items-center space-x-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${selectedService?.service === s.service ? "bg-white text-purple-600" : "bg-white text-gray-400"}`}>
                              {s.name.toLowerCase().includes('follower') ? <Users size={20} /> : 
                               s.name.toLowerCase().includes('like') ? <Heart size={20} /> :
                               s.name.toLowerCase().includes('comment') ? <MessageCircle size={20} /> :
                               <Share2 size={20} />}
                           </div>
                           <div>
                              <p className={`font-bold text-sm ${selectedService?.service === s.service ? "text-purple-900" : "text-gray-700"}`}>{s.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                ₦{(() => {
                                  let rate = parseFloat(s.rate);
                                  if (s.manual_prices) {
                                    const role = user?.role || 'CUSTOMER';
                                    if (role === 'ADMIN' || role === 'CUSTOMER') rate = s.manual_prices.user_price || rate;
                                    else if (role === 'AGENT') rate = s.manual_prices.reseller_price || rate;
                                    else if (role === 'API') rate = s.manual_prices.api_price || rate;
                                  }
                                  return rate.toLocaleString();
                                })()} per 1k
                              </p>
                           </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-transform ${selectedService?.service === s.service ? "text-purple-600 translate-x-0" : "text-gray-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Order Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-8 lg:p-12 rounded-[3.5rem] shadow-2xl shadow-purple-100/50 border border-gray-50 space-y-10">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">3. Link to Profile/Post</label>
                <input 
                  type="text" 
                  className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-lg outline-none focus:border-purple-600 focus:bg-white transition-all tracking-tight" 
                  placeholder="https://instagram.com/p/..."
                  value={details.link}
                  onChange={(e) => setDetails({...details, link: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">4. Quantity</label>
                <div className="relative">
                  <input 
                    type="number" 
                    className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[2rem] font-bold text-2xl outline-none focus:border-purple-600 focus:bg-white transition-all tracking-tight" 
                    placeholder="Min: 100" 
                    value={details.quantity}
                    onChange={(e) => setDetails({...details, quantity: e.target.value})}
                  />
                  {selectedService && (
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                      Max: {selectedService.max}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8 bg-purple-50 rounded-[2.5rem] border-2 border-purple-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total Price</span>
                  <span className="text-3xl font-black text-purple-900 tracking-tighter">₦{calculatePrice().toLocaleString()}</span>
                </div>
                <div className="h-px bg-purple-200 w-full"></div>
                <div className="flex items-center space-x-3 text-purple-600">
                  <Zap size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Instant Start Delivery</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleOrder}
              disabled={isSubmitting || !selectedService}
              className="w-full py-8 bg-purple-600 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-purple-100 hover:bg-gray-950 transition-all flex items-center justify-center space-x-4 transform active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <Spinner /> : <><ShieldCheck className="w-5 h-5" /> <span>Boost Now</span></>}
            </button>
          </div>

          <div className="bg-gray-950 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 flex items-center space-x-6">
                <div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <Info className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                   <h4 className="text-xl font-black tracking-tight">How it works</h4>
                   <p className="text-white/40 font-medium text-sm leading-relaxed">Orders usually start within 0-60 minutes.</p>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmmPage;
