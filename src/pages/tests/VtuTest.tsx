import React, { useContext, useState, useEffect, useCallback } from 'react';
import { TerminalContext } from '../../components/TerminalLayout';
import { vtuService } from '../../services/vtuService';
import Spinner from '../../components/Spinner';
import { DATA_NETWORKS } from '../../constants';

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION';

const VtuTest: React.FC = () => {
  const { addLog } = useContext(TerminalContext);
  const [activeService, setActiveService] = useState<ServiceType>('DATA');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Form States
  const [phone, setPhone] = useState('08030000000');
  const [network, setNetwork] = useState('MTN');
  const [dataType, setDataType] = useState('');
  const [dataTypes, setDataTypes] = useState<string[]>([]);
  const [networks, setNetworks] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  
  const [cableBiller, setCableBiller] = useState('');
  const [cableBillers, setCableBillers] = useState<any[]>([]);
  const [iuc, setIuc] = useState('4622342448');
  const [customerName, setCustomerName] = useState<string | null>(null);
  const [cablePlans, setCablePlans] = useState<any[]>([]);
  const [selectedCablePlan, setSelectedCablePlan] = useState('');

  const [disco, setDisco] = useState('');
  const [discos, setDiscos] = useState<any[]>([]);
  const [meterNo, setMeterNo] = useState('7027914329');
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');

  const [eduType, setEduType] = useState('');
  const [eduPlans, setEduPlans] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedServer, setSelectedServer] = useState<1 | 2>(1);

  const [airtimeOperators, setAirtimeOperators] = useState<any[]>([]);

  const fetchNetworks = useCallback(async () => {
    addLog(`SYNC_NETWORKS: [Server: ${selectedServer}]`, 'cmd');
    const res = await vtuService.getDataNetworks(selectedServer);
    if (res.status) {
      setNetworks(res.data || []);
      if (res.data && res.data.length > 0 && !res.data.find((n: any) => n.id === network)) {
        setNetwork(res.data[0].id);
      }
      addLog("NETWORKS_LOADED", 'success', res.data);
    }
  }, [addLog, selectedServer, network]);

  const fetchDataTypes = useCallback(async () => {
    addLog(`FETCH_DATA_TYPES for ${network} [Server: ${selectedServer}]`, 'cmd');
    const res = await vtuService.getDataCategories(network, selectedServer);
    if (res.status) {
      setDataTypes(res.data || []);
      addLog("TYPES_LOADED", 'success', res.data);
    }
  }, [addLog, network, selectedServer]);

  const fetchDiscos = useCallback(async () => {
    addLog("SYNC_DISCO_NODES", 'cmd');
    const res = await vtuService.getElectricityOperators();
    if (res.status) {
      setDiscos(res.data || []);
      addLog("DISCO_SYNC_OK", 'success');
    }
  }, [addLog]);

  const fetchCableProviders = useCallback(async () => {
    addLog("SYNC_CABLE_BILLERS", 'cmd');
    const res = await vtuService.getCableProviders();
    if (res.status) {
      setCableBillers(res.data || []);
      addLog("BILLER_SYNC_OK", 'success');
    }
  }, [addLog]);

  const fetchAirtimeOperators = useCallback(async () => {
    addLog("SYNC_AIRTIME_OPERATORS", 'cmd');
    const res = await vtuService.getAirtimeOperators();
    if (res.status) {
      setAirtimeOperators(res.data || []);
      addLog("AIRTIME_SYNC_OK", 'success');
    }
  }, [addLog]);

  const fetchEducationPlans = useCallback(async () => {
    addLog("SYNC_EDUCATION_PLANS", 'cmd');
    const res = await vtuService.getEducationPlans();
    if (res.status) {
      setEduPlans(res.data || []);
      addLog("EDUCATION_SYNC_OK", 'success');
    }
  }, [addLog]);

  // Load dependency data on service switch
  useEffect(() => {
    if (activeService === 'DATA') {
      fetchNetworks();
      fetchDataTypes();
    } else if (activeService === 'ELECTRICITY') {
      fetchDiscos();
    } else if (activeService === 'CABLE') {
      fetchCableProviders();
    } else if (activeService === 'AIRTIME') {
      fetchAirtimeOperators();
    } else if (activeService === 'EDUCATION') {
      fetchEducationPlans();
    }
  }, [activeService, fetchDataTypes, fetchDiscos, fetchCableProviders, fetchNetworks, fetchAirtimeOperators, fetchEducationPlans]);

  const fetchPlans = async (type: string) => {
    addLog(`SYNC_PLAN_CATALOG: [${network}] [${type}] [Server: ${selectedServer}]`, 'cmd');
    setLoading(true);
    const res = await vtuService.getDataPlans({ network, type, server: selectedServer });
    if (res.status) {
      setPlans(res.data || []);
      addLog(`CATALOG_SYNC_OK: Found ${res.data?.length} plans`, 'success');
    }
    setLoading(false);
  };

  const handleValidateCable = async () => {
    if (!cableBiller) return;
    setVerifying(true);
    addLog(`VALIDATE_IUC: [${cableBiller}] [${iuc}]`, 'cmd');
    const res = await vtuService.verifyCableSmartcard({ biller: cableBiller, smartCardNumber: iuc });
    if (res.status && res.data) {
      setCustomerName(res.data.customerName);
      addLog(`VAL_OK: Holder resolved to ${res.data.customerName}`, 'success');
      
      addLog(`SYNC_BOUQUETS: [${cableBiller}]`, 'cmd');
      const plansRes = await vtuService.getCablePlans(cableBiller);
      if (plansRes.status) {
        setCablePlans(plansRes.data || []);
        addLog("BOUQUET_SYNC_OK", 'success');
      }
    } else {
      addLog(`VAL_FAIL: ${res.message}`, 'error');
    }
    setVerifying(false);
  };

  const handleValidateMeter = async () => {
    setVerifying(true);
    addLog(`VALIDATE_METER: [${disco}] [${meterNo}]`, 'cmd');
    const res = await vtuService.verifyElectricityMeter({ provider_id: disco, meter_number: meterNo, meter_type: meterType });
    if (res.status && res.data) {
      setCustomerName(res.data.customerName);
      addLog(`VAL_OK: Holder resolved to ${res.data.customerName}`, 'success');
    } else {
      addLog(`VAL_FAIL: ${res.message}`, 'error');
    }
    setVerifying(false);
  };

  const executePurchase = async () => {
    setLoading(true);
    addLog(`INIT_PURCHASE_SEQUENCE: [${activeService}]`, 'cmd');
    
    try {
      if (activeService === 'DATA') {
        const plan = plans.find(p => p.id === selectedPlanId);
        addLog(`DATA_PAYLOAD_READY: ${plan?.name} for ${phone} [Server: ${selectedServer}]`);
        const res = await vtuService.purchaseData({
          plan_id: selectedPlanId,
          phone_number: phone,
          amount: plan?.amount || 0,
          network: network,
          plan_name: plan?.name || 'Bundle',
          server: selectedServer
        });
        if (res.status) addLog("TX_EXECUTION_SUCCESS", 'success', res.data);
        else addLog(`TX_ABORTED: ${res.message}`, 'error');
      } 
      else if (activeService === 'CABLE') {
        const plan = cablePlans.find(p => p.id === selectedCablePlan);
        const res = await vtuService.purchaseCable({
          planCode: selectedCablePlan,
          smartCardNumber: iuc,
          amount: plan?.amount || 0,
          plan_name: plan?.name || 'Bouquet',
          biller: cableBiller
        });
        if (res.status) addLog("TX_EXECUTION_SUCCESS", 'success', res.data);
        else addLog(`TX_ABORTED: ${res.message}`, 'error');
      }
      else if (activeService === 'ELECTRICITY') {
        const res = await vtuService.purchaseElectricity({
          meter_number: meterNo,
          provider_id: disco,
          meter_type: meterType,
          phone: phone,
          amount: 1000,
          provider_name: 'Utility Node'
        });
        if (res.status) addLog("TX_EXECUTION_SUCCESS", 'success', res.data);
        else addLog(`TX_ABORTED: ${res.message}`, 'error');
      }
      else if (activeService === 'AIRTIME') {
        addLog(`AIRTIME_PAYLOAD: [${network}] [${phone}] [100]`);
        const res = await vtuService.purchaseAirtime({ network, phone, amount: 100 });
        if (res.status) addLog("TX_EXECUTION_SUCCESS", 'success', res.data);
        else addLog(`TX_ABORTED: ${res.message}`, 'error');
      }
      else if (activeService === 'EDUCATION') {
        const plan = eduPlans.find(p => p.id === eduType);
        addLog(`EDU_PIN_INIT: [ID: ${eduType}] [Qty: ${quantity}]`);
        const res = await vtuService.purchaseEducation({
          type: eduType,
          quantity: quantity,
          amount: (plan?.price || 0) * quantity,
          name: plan?.name || 'Education PIN'
        });
        if (res.status) addLog("TX_EXECUTION_SUCCESS", 'success', res.data);
        else addLog(`TX_ABORTED: ${res.message}`, 'error');
      }
    } catch (e: any) {
      addLog(`ENGINE_CRASH: ${e.message}`, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Service Selector */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          {(['DATA', 'CABLE', 'ELECTRICITY', 'AIRTIME', 'EDUCATION'] as ServiceType[]).map(service => (
            <button 
              key={service}
              onClick={() => {
                setActiveService(service);
                setCustomerName(null);
                addLog(`TARGET_NODE_SWITCH: ${service}`, 'info');
              }}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${activeService === service ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-black text-zinc-500 border-zinc-800 hover:text-white'}`}
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Frame */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden">
         <div className="p-4 bg-zinc-800/30 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-4">Fulfillment Simulation Node</span>
            <div className="flex gap-1.5 mr-4">
               <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
               <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
               <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
         </div>

         <div className="p-10 space-y-10">
            {activeService === 'DATA' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Network Node</label>
                       <select value={network} onChange={(e) => { setNetwork(e.target.value); setDataType(''); setPlans([]); }} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Select Network</option>
                          {networks.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Data Type</label>
                       <select value={dataType} onChange={(e) => { setDataType(e.target.value); fetchPlans(e.target.value); }} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Select Type</option>
                          {dataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>
                 </div>
                  <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Plan Catalog</label>
                       <select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Select Plan</option>
                          {plans.map(p => <option key={p.id} value={p.id}>{p.name} - ₦{p.amount}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Target Address (Phone)</label>
                       <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Fulfillment Node (Server)</label>
                       <div className="flex gap-2">
                          <button onClick={() => { setSelectedServer(1); setPlans([]); setSelectedPlanId(''); }} className={`flex-1 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${selectedServer === 1 ? 'bg-green-500 text-black border-green-400' : 'bg-black text-zinc-500 border-zinc-800'}`}>Server 1 (Inlomax)</button>
                          <button onClick={() => { setSelectedServer(2); setPlans([]); setSelectedPlanId(''); }} className={`flex-1 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${selectedServer === 2 ? 'bg-green-500 text-black border-green-400' : 'bg-black text-zinc-500 border-zinc-800'}`}>Server 2 (Ciptopup)</button>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeService === 'CABLE' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Biller Node</label>
                       <select value={cableBiller} onChange={(e) => { setCableBiller(e.target.value); setCustomerName(null); setCablePlans([]); }} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Choose Provider</option>
                          {cableBillers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">IUC / Smartcard</label>
                       <div className="flex gap-2">
                          <input type="text" value={iuc} onChange={(e) => setIuc(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all" />
                          <button onClick={handleValidateCable} disabled={verifying || !cableBiller} className="px-6 bg-zinc-100 text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50">
                             {verifying ? 'SYNC' : 'VALIDATE'}
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    {customerName && (
                       <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-xl">
                          <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Resolved Holder</p>
                          <p className="text-white font-bold text-sm tracking-tight">{customerName}</p>
                       </div>
                    )}
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Available Bouquets</label>
                       <select value={selectedCablePlan} onChange={(e) => setSelectedCablePlan(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 disabled:opacity-30 transition-all" disabled={!customerName}>
                          <option value="">Select Plan</option>
                          {cablePlans.map(p => <option key={p.id} value={p.id}>{p.name} - ₦{p.amount}</option>)}
                       </select>
                    </div>
                 </div>
              </div>
            )}

            {activeService === 'ELECTRICITY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Distribution Node (Disco)</label>
                       <select value={disco} onChange={(e) => { setDisco(e.target.value); setCustomerName(null); }} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Choose Disco</option>
                          {discos.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Meter Identification</label>
                       <div className="flex gap-2">
                          <input type="text" value={meterNo} onChange={(e) => setMeterNo(e.target.value)} className="flex-1 bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all" />
                          <button onClick={handleValidateMeter} disabled={verifying || !disco} className="px-6 bg-zinc-100 text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50">
                             {verifying ? 'SYNC' : 'VALIDATE'}
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    {customerName && (
                       <div className="p-4 bg-green-900/10 border border-green-900/30 rounded-xl">
                          <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1">Resolved Holder</p>
                          <p className="text-white font-bold text-sm tracking-tight">{customerName}</p>
                       </div>
                    )}
                    <div className="flex gap-4">
                       <button onClick={() => setMeterType('prepaid')} className={`flex-1 py-4 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${meterType === 'prepaid' ? 'bg-green-500 text-black border-green-400' : 'bg-black text-zinc-600 border-zinc-800'}`}>Prepaid</button>
                       <button onClick={() => setMeterType('postpaid')} className={`flex-1 py-4 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${meterType === 'postpaid' ? 'bg-green-500 text-black border-green-400' : 'bg-black text-zinc-600 border-zinc-800'}`}>Postpaid</button>
                    </div>
                 </div>
              </div>
            )}

            {activeService === 'AIRTIME' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Network Node</label>
                       <select value={network} onChange={(e) => setNetwork(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Select Operator</option>
                          {airtimeOperators.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Target Address (Phone)</label>
                       <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all" />
                    </div>
                 </div>
              </div>
            )}

            {activeService === 'EDUCATION' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">PIN Node (ServiceID)</label>
                       <select value={eduType} onChange={(e) => setEduType(e.target.value)} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all">
                          <option value="">Select PIN Type</option>
                          {eduPlans.map(p => (
                            <option key={p.id} value={p.id}>{p.name} - ₦{p.price}</option>
                          ))}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div>
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Quantity</label>
                       <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono outline-none focus:border-green-500 transition-all" />
                    </div>
                 </div>
              </div>
            )}

            {/* Shared Trigger Button */}
            <div className="pt-10 border-t border-zinc-800">
               <button 
                 onClick={executePurchase}
                 disabled={loading || verifying}
                 className="w-full py-6 bg-green-500 text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 rounded-2xl"
               >
                  {loading ? <Spinner /> : `EXECUTE SIMULATED ${activeService} FULFILLMENT`}
               </button>
            </div>
         </div>
      </div>

      <div className="p-8 bg-black/40 border border-zinc-800 rounded-2xl flex items-start gap-6">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-zinc-800 text-zinc-500">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Protocol Note</p>
           <p className="text-zinc-600 text-[11px] leading-relaxed italic">Simulated recharges still trigger real API hits. Ensure the environment node (INLOMAX) has sufficient liquidity for tests.</p>
        </div>
      </div>
    </div>
  );
};

export default VtuTest;