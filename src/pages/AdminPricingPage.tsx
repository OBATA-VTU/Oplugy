import React, { useState, useEffect, useCallback } from 'react';
import { cipApiClient } from '../services/cipApiClient';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';

interface ServicePlan {
  id: string;
  name: string;
  base_price: number;
  network: string;
  type: string;
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
    // Fetch Server 1 plans from Inlomax API via Proxy
    const res = await cipApiClient<any>('services', { method: 'GET', data: { server: 'server1' } });
    if (res.status && res.data?.dataPlans) {
      const formatted = (res.data.dataPlans as any[]).map(p => ({
        id: String(p.serviceID),
        name: `${p.dataPlan} ${p.dataType}`,
        base_price: Number(String(p.amount).replace(/,/g, '')),
        network: p.network,
        type: p.dataType
      }));
      setPlans(formatted);
    } else {
      addNotification("Could not fetch plan list from Node 1 Gateway.", "error");
    }
    setLoading(false);
  }, [addNotification]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEdit = (plan: ServicePlan) => {
    setEditingPlan(plan);
    setPrices({ user: '', reseller: '', api: '' });
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
      
      addNotification(`Static prices saved for ${editingPlan.name}`, "success");
      setEditingPlan(null);
    } catch (e) {
      addNotification("Error saving manual price node to database.", "error");
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
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Pricing Engine</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Market Tariffs</h1>
        <p className="text-gray-400 font-medium text-lg mt-4 italic">*Manually override prices for Node 1 bundles across different account tiers.</p>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-xl mb-12">
        <input 
          type="text" 
          placeholder="Search by bundle name or carrier..." 
          className="w-full p-6 bg-gray-50 rounded-2xl font-black text-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center"><Spinner /><p className="text-[10px] font-black text-gray-300 mt-6 uppercase tracking-widest animate-pulse">Syncing Node 1 Ledger...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredPlans.map(plan => (
             <div key={plan.id} className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start mb-8">
                   <div>
                      <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100">{plan.network}</span>
                      <h4 className="text-2xl font-black text-gray-900 mt-4 tracking-tighter leading-none">{plan.name}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Base Cost</p>
                      <p className="font-black text-gray-900 text-lg">₦{plan.base_price}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleEdit(plan)}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  Configure Rates
                </button>
             </div>
           ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-10 lg:p-16 shadow-2xl animate-in zoom-in-95 duration-200 border-8 border-gray-50">
              <div className="text-center mb-12">
                <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Configure Tariff</h3>
                <p className="text-gray-400 font-medium text-sm">Managing manual rates for <span className="text-blue-600 font-bold">{editingPlan.name}</span></p>
              </div>
              
              <div className="space-y-8">
                 <PriceInput label="User Rate (Retail)" value={prices.user} onChange={(v: string) => setPrices({...prices, user: v})} base={editingPlan.base_price} />
                 <PriceInput label="Reseller Rate" value={prices.reseller} onChange={(v: string) => setPrices({...prices, reseller: v})} base={editingPlan.base_price} />
                 <PriceInput label="API Merchant Rate" value={prices.api} onChange={(v: string) => setPrices({...prices, api: v})} base={editingPlan.base_price} />
                 
                 <div className="pt-10 flex gap-6">
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !prices.user}
                      className="flex-[2] py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-2xl shadow-blue-200 hover:bg-black transition-all transform active:scale-95"
                    >
                      {isSaving ? <Spinner /> : 'Lock Tariff Node'}
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
     <div className="flex justify-between items-center mb-4">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{label}</label>
        {value && <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${Number(value) >= base ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          Margin: ₦{(Number(value) - base).toFixed(2)}
        </span>}
     </div>
     <div className="relative">
        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xl">₦</span>
        <input 
          type="number" 
          className="w-full p-7 pl-14 bg-gray-50 border-4 border-transparent rounded-[2rem] text-3xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
          placeholder="0.00"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        />
     </div>
  </div>
);

export default AdminPricingPage;