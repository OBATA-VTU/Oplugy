import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
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
    // Fetch Server 1 plans from Inlomax API
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
      addNotification("Could not fetch plan list from Node 1.", "error");
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
      
      addNotification(`Prices saved for ${editingPlan.name}`, "success");
      setEditingPlan(null);
    } catch (e) {
      addNotification("Error saving manual price node.", "error");
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
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">Price Management</h1>
        <p className="text-gray-400 font-medium text-lg mt-4 italic">*Manually override prices for Node 1 services.</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-10">
        <input 
          type="text" 
          placeholder="Search plans by name or network..." 
          className="w-full p-6 bg-gray-50 rounded-2xl font-black text-lg focus:ring-4 focus:ring-blue-50 transition-all outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center"><Spinner /><p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest">Scanning Node 1 Manifest...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredPlans.map(plan => (
             <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{plan.network}</span>
                      <h4 className="text-xl font-black text-gray-900 mt-2 tracking-tight">{plan.name}</h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Base Cost</p>
                      <p className="font-black text-gray-900">₦{plan.base_price}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleEdit(plan)}
                  className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                  Set Custom Prices
                </button>
             </div>
           ))}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[4rem] p-10 lg:p-14 shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Price Override</h3>
              <p className="text-gray-400 font-medium text-sm mb-10">Configure manual prices for <span className="text-blue-600">{editingPlan.name}</span></p>
              
              <div className="space-y-6">
                 <PriceInput label="User Price (Retail)" value={prices.user} onChange={(v) => setPrices({...prices, user: v})} base={editingPlan.base_price} />
                 <PriceInput label="Reseller Price" value={prices.reseller} onChange={(v) => setPrices({...prices, reseller: v})} base={editingPlan.base_price} />
                 <PriceInput label="API Merchant Price" value={prices.api} onChange={(v) => setPrices({...prices, api: v})} base={editingPlan.base_price} />
                 
                 <div className="pt-8 flex gap-4">
                    <button onClick={() => setEditingPlan(null)} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !prices.user}
                      className="flex-[2] py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-xl shadow-blue-100 hover:bg-black transition-all"
                    >
                      {isSaving ? <Spinner /> : 'Save Price Node'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const PriceInput = ({ label, value, onChange, base }: any) => (
  <div>
     <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</label>
        {value && <span className={`text-[9px] font-black uppercase ${Number(value) > base ? 'text-green-600' : 'text-red-600'}`}>
          Profit: ₦{(Number(value) - base).toFixed(2)}
        </span>}
     </div>
     <div className="relative">
        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">₦</span>
        <input 
          type="number" 
          className="w-full p-5 pl-12 bg-gray-50 border-4 border-gray-100 rounded-3xl text-xl font-black tracking-tight outline-none focus:border-blue-600 transition-all"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
     </div>
  </div>
);

export default AdminPricingPage;