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

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    // Fetch Server 1 plans as baseline
    const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
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
      addNotification("Matrix sync failed for Node 1 Ledger.", "error");
    }
    setLoading(false);
  }, [addNotification]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEdit = (plan: ServicePlan) => {
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
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Pricing Control</h2>
        <h1 className="text-4xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-none">Tariff Matrix</h1>
        <p className="text-gray-400 font-medium text-xl mt-6 italic max-w-3xl">Force manual price overrides across different account tiers to maximize node profitability.</p>
      </div>

      <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-xl mb-16 sticky top-24 z-20">
        <input 
          type="text" 
          placeholder="Filter bundles by name, network or code..." 
          className="w-full p-8 bg-gray-50 rounded-[2rem] font-black text-2xl focus:ring-8 focus:ring-blue-50 transition-all outline-none border-4 border-transparent focus:border-blue-600"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center space-y-8">
           <Spinner />
           <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse">Syncing Master Ledger Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {filteredPlans.map(plan => (
             <div key={plan.id} className={`bg-white p-10 rounded-[3.5rem] border-4 transition-all group relative overflow-hidden ${plan.manual_prices ? 'border-blue-100 bg-blue-50/20' : 'border-gray-50'}`}>
                <div className="flex justify-between items-start mb-10 relative z-10">
                   <div>
                      <span className="bg-gray-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">{plan.network}</span>
                      <h4 className="text-3xl font-black text-gray-900 mt-6 tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Node ID: {plan.id}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Node Cost</p>
                      <p className="font-black text-gray-900 text-2xl tracking-tighter">₦{plan.base_price}</p>
                   </div>
                </div>

                <div className="space-y-4 mb-10 relative z-10">
                   <div className="flex justify-between items-center text-sm">
                      <span className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Active Markup</span>
                      <span className={`font-black tracking-tighter ${plan.manual_prices ? 'text-green-600' : 'text-orange-500'}`}>
                        {plan.manual_prices ? `+₦${(plan.manual_prices.user_price - plan.base_price).toFixed(2)}` : 'System Default'}
                      </span>
                   </div>
                   <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${plan.manual_prices ? 'bg-green-500 w-full' : 'bg-orange-500 w-1/3'}`}></div>
                   </div>
                </div>

                <button 
                  onClick={() => handleEdit(plan)}
                  className="w-full bg-white border-4 border-gray-100 text-gray-900 py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-xl active:scale-95 relative z-10"
                >
                  Configure Nodes
                </button>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl"></div>
             </div>
           ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-2xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-2xl rounded-[4.5rem] p-12 lg:p-20 shadow-2xl animate-in zoom-in-95 duration-200 border-[12px] border-gray-50">
              <div className="text-center mb-16">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><ShieldCheckIcon /></div>
                <h3 className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-4">Set Overrides</h3>
                <p className="text-gray-400 font-medium text-lg leading-relaxed">Configuring manual overrides for <span className="text-blue-600 font-black tracking-tight">{editingPlan.name}</span></p>
              </div>
              
              <div className="space-y-10">
                 <PriceInput label="Retail Terminal (User)" value={prices.user} onChange={(v: string) => setPrices({...prices, user: v})} base={editingPlan.base_price} />
                 <PriceInput label="Reseller Terminal" value={prices.reseller} onChange={(v: string) => setPrices({...prices, reseller: v})} base={editingPlan.base_price} />
                 <PriceInput label="API Infrastructure (Merchant)" value={prices.api} onChange={(v: string) => setPrices({...prices, api: v})} base={editingPlan.base_price} />
                 
                 <div className="pt-12 flex gap-8">
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all shadow-sm">Cancel</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !prices.user}
                      className="flex-[2] py-8 rounded-[2.5rem] font-black text-[11px] uppercase tracking-widest bg-blue-600 text-white shadow-2xl shadow-blue-500/30 hover:bg-black transition-all transform active:scale-95 flex items-center justify-center"
                    >
                      {isSaving ? <Spinner /> : 'Apply Static Pricing'}
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