import React, { useState, useEffect, useCallback } from 'react';
import { cipApiClient } from '../services/cipApiClient';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
// Add missing import for ShieldCheckIcon
import { ShieldCheckIcon } from '../components/Icons';

interface ServicePlan {
  id: string;
  name: string;
  base_price: number;
  network: string;
  type: string;
  manual_prices?: any;
}

const AdminPricingPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [prices, setPrices] = useState({ user: '', reseller: '', api: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const [server2Margin, setServer2Margin] = useState<string>('0');
  const [isSavingMargin, setIsSavingMargin] = useState(false);

  const fetchServer2Margin = useCallback(async () => {
    const marginDoc = await getDoc(doc(db, "settings", "server2_config"));
    if (marginDoc.exists()) {
      setServer2Margin(marginDoc.data().general_margin?.toString() || '0');
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    if (activeServer === 1) {
      const res = await cipApiClient<any>('services', { method: 'GET', server: 1 });
      if (res.status && res.data?.dataPlans) {
        const formatted = await Promise.all((res.data.dataPlans as any[]).map(async (p) => {
          const manualDoc = await getDoc(doc(db, "manual_pricing", String(p.serviceID)));
          return {
            id: String(p.serviceID),
            name: `${p.dataPlan} ${p.dataType}`,
            base_price: Number(String(p.amount).replace(/,/g, '')),
            network: p.network,
            type: p.dataType,
            manual_prices: manualDoc.exists() ? manualDoc.data() : null
          };
        }));
        setPlans(formatted);
      } else {
        addNotification("System update failed for Server 1.", "error");
      }
    } else {
      // Server 2
      const res = await cipApiClient<any>('data/plans', { method: 'GET', server: 2 });
      if (res.status && Array.isArray(res.data)) {
        setPlans(res.data.map((p: any) => {
          const rawPrice = Number(p.price || p.amount || 0);
          const priceInNaira = rawPrice > 10000 ? (rawPrice / 100) : rawPrice;
          
          return {
            id: String(p.id || p.plan_id || p.serviceID),
            name: String(p.name || p.plan_name || 'Data Plan'),
            base_price: priceInNaira,
            network: String(p.network || p.network_name || 'Unknown'),
            type: String(p.type || p.dataType || 'Unknown')
          };
        }));
        await fetchServer2Margin();
      } else {
        addNotification("System update failed for Server 2.", "error");
      }
    }
    setLoading(false);
  }, [addNotification, activeServer, fetchServer2Margin]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSaveMargin = async () => {
    setIsSavingMargin(true);
    try {
      await setDoc(doc(db, "settings", "server2_config"), {
        general_margin: Number(server2Margin),
        updatedAt: serverTimestamp()
      }, { merge: true });
      addNotification("General margin for Server 2 updated.", "success");
    } catch (e) {
      addNotification("Failed to update margin.", "error");
    }
    setIsSavingMargin(false);
  };

  const handleEdit = (plan: ServicePlan) => {
    if (activeServer === 2) {
      addNotification("Individual overrides are only available for Server 1. Use general margin for Server 2.", "info");
      return;
    }
    setEditingPlan(plan);
    setPrices({ 
      user: plan.manual_prices?.user_price?.toString() || '', 
      reseller: plan.manual_prices?.reseller_price?.toString() || '', 
      api: plan.manual_prices?.api_price?.toString() || '' 
    });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "manual_pricing", editingPlan.id), {
        planId: editingPlan.id,
        user_price: Number(prices.user),
        reseller_price: Number(prices.reseller),
        api_price: Number(prices.api),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      addNotification(`Static rates locked for ${editingPlan.name}`, "success");
      setEditingPlan(null);
      fetchPlans();
    } catch (e) {
      addNotification("Error uploading manual tariff to database.", "error");
    }
    setIsSaving(false);
  };

  const filteredPlans = plans.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.network.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="mb-10">
        <h2 className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.3em] mb-3">Management</h2>
        <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">Pricing Control</h1>
        <p className="text-gray-500 font-medium text-lg mt-3 max-w-2xl">Manage service prices and profit margins across different user roles.</p>
      </div>

      <div className="flex gap-3 mb-10 p-1.5 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm">
        <button 
          onClick={() => setActiveServer(1)} 
          className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeServer === 1 ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Standard Server
        </button>
        <button 
          onClick={() => setActiveServer(2)} 
          className={`px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${activeServer === 2 ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Premium Server
        </button>
      </div>

      {activeServer === 2 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl mb-10 animate-in slide-in-from-top-4">
           <div className="flex flex-col md:flex-row items-end gap-6">
              <div className="flex-1 w-full">
                 <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">Global Profit Margin (₦)</label>
                 <input 
                   type="number" 
                   value={server2Margin} 
                   onChange={(e) => setServer2Margin(e.target.value)}
                   className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 rounded-2xl font-bold text-xl outline-none transition-all"
                   placeholder="e.g. 50"
                 />
              </div>
              <button 
                onClick={handleSaveMargin}
                disabled={isSavingMargin}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-wider text-[11px] shadow-lg shadow-blue-100 hover:bg-gray-900 transition-all disabled:opacity-50 h-[60px]"
              >
                {isSavingMargin ? <Spinner /> : 'Save Global Margin'}
              </button>
           </div>
           <p className="text-[11px] font-medium text-gray-400 mt-4 italic">* This margin will be added to the base cost of all Premium Server data plans.</p>
        </div>
      )}

      <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-lg mb-12 sticky top-24 z-20">
        <input 
          type="text" 
          placeholder="Search plans by name or network..." 
          className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none border-2 border-transparent focus:border-blue-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-6">
           <Spinner />
           <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading pricing data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredPlans.map(plan => (
             <div key={plan.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all group relative overflow-hidden ${plan.manual_prices ? 'border-blue-100 bg-blue-50/20' : 'border-gray-50'}`}>
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div>
                      <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-md">{plan.network}</span>
                      <h4 className="text-2xl font-bold text-gray-900 mt-4 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2">ID: {plan.id}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                         {activeServer === 1 ? 'Base Cost' : 'Final Price'}
                      </p>
                      <p className="font-bold text-gray-900 text-xl tracking-tight">
                         ₦{activeServer === 1 ? plan.base_price : (plan.base_price + Number(server2Margin))}
                      </p>
                   </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                   <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded-xl">
                         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">User</p>
                         <p className={`text-[11px] font-bold ${plan.manual_prices ? 'text-blue-600' : 'text-gray-300'}`}>
                            {plan.manual_prices ? `₦${plan.manual_prices.user_price}` : '—'}
                         </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-xl">
                         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">Reseller</p>
                         <p className={`text-[11px] font-bold ${plan.manual_prices ? 'text-indigo-600' : 'text-gray-300'}`}>
                            {plan.manual_prices ? `₦${plan.manual_prices.reseller_price}` : '—'}
                         </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-xl">
                         <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider mb-1">API</p>
                         <p className={`text-[11px] font-bold ${plan.manual_prices ? 'text-emerald-600' : 'text-gray-300'}`}>
                            {plan.manual_prices ? `₦${plan.manual_prices.api_price}` : '—'}
                         </p>
                      </div>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-400 uppercase tracking-wider">Retail Margin</span>
                      <span className={`font-bold tracking-tight ${plan.manual_prices ? 'text-green-600' : 'text-orange-500'}`}>
                        {plan.manual_prices ? `+₦${(plan.manual_prices.user_price - plan.base_price).toFixed(2)}` : 'Default'}
                      </span>
                   </div>
                   <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${plan.manual_prices ? 'bg-green-500 w-full' : 'bg-orange-500 w-1/3'}`}></div>
                   </div>
                </div>

                <button 
                  onClick={() => handleEdit(plan)}
                  className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all relative z-10 ${activeServer === 2 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-50 text-gray-900 hover:bg-blue-600 hover:text-white shadow-sm hover:shadow-lg'}`}
                >
                  {activeServer === 2 ? 'Global Margin Active' : 'Edit Prices'}
                </button>
             </div>
           ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 lg:p-12 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"><ShieldCheckIcon /></div>
                <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Edit Prices</h3>
                <p className="text-gray-500 font-medium text-base">Setting custom prices for <span className="text-blue-600 font-bold">{editingPlan.name}</span></p>
              </div>
              
              <div className="space-y-6">
                 <PriceInput label="Retail Price (User)" value={prices.user} onChange={(v: string) => setPrices({...prices, user: v})} base={editingPlan.base_price} />
                 <PriceInput label="Reseller Price" value={prices.reseller} onChange={(v: string) => setPrices({...prices, reseller: v})} base={editingPlan.base_price} />
                 <PriceInput label="API Price (Merchant)" value={prices.api} onChange={(v: string) => setPrices({...prices, api: v})} base={editingPlan.base_price} />
                 
                 <div className="pt-8 flex gap-4">
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !prices.user}
                      className="flex-[2] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-gray-900 transition-all transform active:scale-95 flex items-center justify-center"
                    >
                      {isSaving ? <Spinner /> : 'Save Changes'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

interface PriceInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  base: number;
}

const PriceInput: React.FC<PriceInputProps> = ({ label, value, onChange, base }) => (
  <div className="group">
     <div className="flex justify-between items-center mb-4 px-4">
        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        {value && <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-xl border-2 ${Number(value) >= base ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
          Margin: ₦{(Number(value) - base).toFixed(2)}
        </span>}
     </div>
     <div className="relative">
        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-300 font-black text-3xl">₦</span>
        <input 
          type="number" 
          className="w-full p-10 pl-20 bg-gray-50 border-4 border-transparent rounded-[3rem] text-5xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:text-gray-200"
          placeholder="0.00"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
     </div>
  </div>
);

export default AdminPricingPage;