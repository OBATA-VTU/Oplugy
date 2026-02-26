import React, { useState, useEffect, useCallback } from 'react';
import { cipApiClient } from '../services/cipApiClient';
import { db } from '../firebase/config';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useNotifications } from '../hooks/useNotifications';
import Spinner from '../components/Spinner';
import { ShieldCheckIcon } from '../components/Icons';
import { vtuService } from '../services/vtuService';
import { Smartphone, Wifi, Zap, Tv, BookOpen, Search, Settings2, Percent } from 'lucide-react';

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
  const [activeService, setActiveService] = useState<'data' | 'airtime' | 'cable' | 'power' | 'education'>('data');
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<ServicePlan | null>(null);
  const [prices, setPrices] = useState({ user: '', reseller: '', api: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [filter, setFilter] = useState('');
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  
  // Percentage discounts for Airtime and Electricity
  const [discounts, setDiscounts] = useState({
    airtime: { user: 2, reseller: 3, api: 4 },
    power: { user: 0, reseller: 1, api: 2 }
  });
  const [isSavingDiscounts, setIsSavingDiscounts] = useState(false);

  const fetchDiscounts = useCallback(async () => {
    const docRef = doc(db, "settings", "service_discounts");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      setDiscounts(snap.data() as any);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      if (activeService === 'data') {
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
          }
        } else {
          const res = await cipApiClient<any>('data/plans', { method: 'GET', server: 2 });
          if (res.status && Array.isArray(res.data)) {
            setPlans(res.data.map((p: any) => ({
              id: String(p.id || p.plan_id || p.serviceID),
              name: String(p.name || p.plan_name || 'Data Plan'),
              base_price: Number(p.price || p.amount || 0) / 100,
              network: String(p.network || p.network_name || 'Unknown'),
              type: String(p.type || p.dataType || 'Unknown')
            })));
          }
        }
      } else if (activeService === 'cable') {
        const res = await vtuService.getCableProviders();
        if (res.status && res.data) {
          let allPlans: ServicePlan[] = [];
          for (const provider of res.data) {
            const plansRes = await vtuService.getCablePlans(provider.name);
            if (plansRes.status && plansRes.data) {
              const formatted = await Promise.all(plansRes.data.map(async (p) => {
                const manualDoc = await getDoc(doc(db, "manual_pricing", p.id));
                return {
                  id: p.id,
                  name: `${provider.name} - ${p.name}`,
                  base_price: p.amount,
                  network: provider.name,
                  manual_prices: manualDoc.exists() ? manualDoc.data() : null
                };
              }));
              allPlans = [...allPlans, ...formatted];
            }
          }
          setPlans(allPlans);
        }
      } else if (activeService === 'education') {
        const res = await vtuService.getEducationPlans();
        if (res.status && res.data) {
          const formatted = await Promise.all(res.data.map(async (p) => {
            const manualDoc = await getDoc(doc(db, "manual_pricing", p.id));
            return {
              id: p.id,
              name: p.name,
              base_price: p.price,
              manual_prices: manualDoc.exists() ? manualDoc.data() : null
            };
          }));
          setPlans(formatted);
        }
      } else if (activeService === 'airtime' || activeService === 'power') {
        await fetchDiscounts();
        setPlans([]); // No individual plans for these
      }
    } catch (e) {
      addNotification("Failed to load pricing data.", "error");
    }
    setLoading(false);
  }, [activeService, activeServer, addNotification, fetchDiscounts]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSaveDiscounts = async () => {
    setIsSavingDiscounts(true);
    try {
      await setDoc(doc(db, "settings", "service_discounts"), discounts, { merge: true });
      addNotification("Percentage discounts updated successfully.", "success");
    } catch (e) {
      addNotification("Failed to save discounts.", "error");
    }
    setIsSavingDiscounts(false);
  };

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
    (p.network && p.network.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Management</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">Pricing <br /><span className="text-blue-600">Control.</span></h1>
        </div>
        
        <div className="flex gap-2 p-2 bg-white rounded-[2rem] shadow-xl border border-gray-50 overflow-x-auto">
          {[
            { id: 'data', icon: <Wifi className="w-4 h-4" />, label: 'Data' },
            { id: 'airtime', icon: <Smartphone className="w-4 h-4" />, label: 'Airtime' },
            { id: 'cable', icon: <Tv className="w-4 h-4" />, label: 'Cable' },
            { id: 'power', icon: <Zap className="w-4 h-4" />, label: 'Power' },
            { id: 'education', icon: <BookOpen className="w-4 h-4" />, label: 'Education' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setActiveService(s.id as any)}
              className={`flex items-center space-x-3 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeService === s.id ? 'bg-gray-950 text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {s.icon}
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {(activeService === 'airtime' || activeService === 'power') ? (
        <div className="bg-white p-12 lg:p-20 rounded-[4rem] shadow-2xl border border-gray-50 space-y-16">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-inner">
              <Percent className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter">Percentage Discounts</h3>
              <p className="text-gray-400 font-medium text-lg">Set the commission percentage for {activeService} transactions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <DiscountInput 
              label="Standard User (%)" 
              value={discounts[activeService as 'airtime' | 'power'].user} 
              onChange={(v) => setDiscounts({...discounts, [activeService]: {...discounts[activeService as 'airtime' | 'power'], user: v}})} 
            />
            <DiscountInput 
              label="Reseller (%)" 
              value={discounts[activeService as 'airtime' | 'power'].reseller} 
              onChange={(v) => setDiscounts({...discounts, [activeService]: {...discounts[activeService as 'airtime' | 'power'], reseller: v}})} 
            />
            <DiscountInput 
              label="API Merchant (%)" 
              value={discounts[activeService as 'airtime' | 'power'].api} 
              onChange={(v) => setDiscounts({...discounts, [activeService]: {...discounts[activeService as 'airtime' | 'power'], api: v}})} 
            />
          </div>

          <button 
            onClick={handleSaveDiscounts}
            disabled={isSavingDiscounts}
            className="w-full py-8 bg-gray-950 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-600 transition-all flex items-center justify-center space-x-4 disabled:opacity-50"
          >
            {isSavingDiscounts ? <Spinner /> : <><Settings2 className="w-5 h-5" /> <span>Save {activeService.toUpperCase()} Discounts</span></>}
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 w-full relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
              <input 
                type="text" 
                placeholder={`Search ${activeService} plans...`} 
                className="w-full p-8 pl-20 bg-white border-2 border-gray-100 rounded-[2.5rem] font-bold text-xl outline-none focus:border-blue-600 focus:ring-8 focus:ring-blue-50 transition-all shadow-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {activeService === 'data' && (
              <div className="flex p-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <button onClick={() => setActiveServer(1)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeServer === 1 ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>Server 1</button>
                <button onClick={() => setActiveServer(2)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeServer === 2 ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}>Server 2</button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6">
              <Spinner />
              <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Synchronizing Plans...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlans.map(plan => (
                <div key={plan.id} className={`bg-white p-10 rounded-[3.5rem] border-2 transition-all group relative overflow-hidden ${plan.manual_prices ? 'border-blue-100 bg-blue-50/10' : 'border-gray-50 hover:border-blue-100 hover:shadow-2xl'}`}>
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-3">
                      {plan.network && <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest">{plan.network}</span>}
                      <h4 className="text-2xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors">{plan.name}</h4>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {plan.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Cost</p>
                      <p className="font-black text-gray-900 text-2xl tracking-tighter">₦{plan.base_price.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-10">
                    <PriceTag label="User" price={plan.manual_prices?.user_price} color="blue" />
                    <PriceTag label="Reseller" price={plan.manual_prices?.reseller_price} color="indigo" />
                    <PriceTag label="API" price={plan.manual_prices?.api_price} color="emerald" />
                  </div>

                  <button 
                    onClick={() => handleEdit(plan)}
                    className="w-full py-6 bg-gray-50 text-gray-900 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:shadow-xl"
                  >
                    Set Manual Rates
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 lg:p-16 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <ShieldCheckIcon />
              </div>
              <h3 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Set Manual Rates</h3>
              <p className="text-gray-400 font-medium text-lg">Configuring rates for <span className="text-blue-600 font-black">{editingPlan.name}</span></p>
            </div>
            
            <div className="space-y-8">
              <PriceField label="Standard User Price" value={prices.user} onChange={(v) => setPrices({...prices, user: v})} base={editingPlan.base_price} />
              <PriceField label="Reseller Price" value={prices.reseller} onChange={(v) => setPrices({...prices, reseller: v})} base={editingPlan.base_price} />
              <PriceField label="API Merchant Price" value={prices.api} onChange={(v) => setPrices({...prices, api: v})} base={editingPlan.base_price} />
              
              <div className="pt-10 flex gap-6">
                <button onClick={() => setEditingPlan(null)} className="flex-1 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all">Cancel</button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !prices.user}
                  className="flex-[2] py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white shadow-2xl shadow-blue-100 hover:bg-gray-950 transition-all transform active:scale-95 flex items-center justify-center"
                >
                  {isSaving ? <Spinner /> : 'Apply Rates'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DiscountInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
  <div className="space-y-4 p-8 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all group">
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{label}</label>
    <div className="relative">
      <span className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl">%</span>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full p-8 bg-white border-2 border-gray-100 rounded-[2rem] font-black text-4xl tracking-tighter outline-none focus:border-blue-600 transition-all"
      />
    </div>
  </div>
);

const PriceTag = ({ label, price, color }: { label: string; price?: number; color: string }) => {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  };
  return (
    <div className={`text-center p-4 rounded-2xl ${colors[color] || 'bg-gray-50 text-gray-400'}`}>
      <p className="text-[8px] font-black uppercase tracking-widest mb-1 opacity-60">{label}</p>
      <p className="text-sm font-black tracking-tight">{price ? `₦${price.toLocaleString()}` : '—'}</p>
    </div>
  );
};

const PriceField = ({ label, value, onChange, base }: { label: string; value: string; onChange: (v: string) => void; base: number }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center px-4">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      {value && <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-xl ${Number(value) >= base ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
        Margin: ₦{(Number(value) - base).toFixed(2)}
      </span>}
    </div>
    <div className="relative">
      <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl">₦</span>
      <input 
        type="number" 
        className="w-full p-8 pl-16 bg-gray-50 border-2 border-transparent rounded-[2.5rem] text-4xl font-black tracking-tighter outline-none focus:border-blue-600 focus:bg-white transition-all"
        placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

export default AdminPricingPage;
