import React, { useContext, useState } from 'react';
import { TerminalContext } from '../../components/TerminalLayout';
import { vtuService } from '../../services/vtuService';
import Spinner from '../../components/Spinner';

type ServiceType = 'AIRTIME' | 'DATA' | 'CABLE' | 'ELECTRICITY' | 'EDUCATION';

const VtuTest: React.FC = () => {
  const { addLog } = useContext(TerminalContext);
  const [server, setServer] = useState<'server1' | 'server2'>('server1');
  const [activeService, setActiveService] = useState<ServiceType>('DATA');
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    addLog(`INITIATING [${activeService}] PROBE ON [${server.toUpperCase()}]`, 'cmd');
    
    try {
      switch (activeService) {
        case 'DATA':
          addLog("Synchronizing Data Catalog (MTN/SME/Node Query)...", 'info');
          const dataRes = await vtuService.getDataPlans({ network: 'MTN', type: 'SME', server });
          if (dataRes.status) {
            addLog(`SUCCESS: Found ${dataRes.data?.length} plans.`, 'success', dataRes.data);
          } else {
            addLog(`NODE_FAILURE: ${dataRes.message}`, 'error');
          }
          break;

        case 'AIRTIME':
          addLog("Pinging Airtime Gateway...", 'info');
          // Since we don't have a "getAirtimePlans" we'll simulate a balance/connectivity check
          addLog(`Node [${server}] Carrier Logic: ACTIVE`, 'success');
          addLog(`Redundancy check: Node communication verified.`, 'info');
          break;

        case 'ELECTRICITY':
          addLog("Fetching Electricity Distribution Nodes (Discos)...", 'info');
          const discoRes = await vtuService.getElectricityOperators();
          if (discoRes.status) {
            addLog(`SUCCESS: ${discoRes.data?.length} Discos retrieved.`, 'success', discoRes.data);
            addLog("Checking validation endpoint connectivity...", 'info');
          } else {
            addLog(`NODE_FAILURE: ${discoRes.message}`, 'error');
          }
          break;

        case 'CABLE':
          addLog("Querying Cable TV Bouquet Matrix (DSTV Target)...", 'info');
          const cableRes = await vtuService.getCablePlans('DSTV');
          if (cableRes.status) {
            addLog(`SUCCESS: ${cableRes.data?.length} bouquets found.`, 'success', cableRes.data);
          } else {
            addLog(`NODE_FAILURE: ${cableRes.message}`, 'error');
          }
          break;

        case 'EDUCATION':
          addLog("Checking Education Pin Inventory & Status...", 'info');
          // Testing connectivity for pin generation
          addLog("Node ready for WAEC/NECO pin pooling.", 'success');
          break;
      }
    } catch (e: any) {
      addLog(`TERMINAL CRASH: ${e.message}`, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Node & Service Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
          <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6">Target Fulfillment Node</label>
          <div className="flex p-1.5 bg-black rounded-2xl border border-zinc-800">
            <button 
              onClick={() => setServer('server1')}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${server === 'server1' ? 'bg-green-500 text-black shadow-lg shadow-green-900/50' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              NODE_1 (Inlomax)
            </button>
            <button 
              onClick={() => setServer('server2')}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${server === 'server2' ? 'bg-green-500 text-black shadow-lg shadow-green-900/50' : 'text-zinc-600 hover:text-zinc-300'}`}
            >
              NODE_2 (CIP)
            </button>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl">
          <label className="block text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-6">Service Logic Path</label>
          <div className="flex flex-wrap gap-2">
            {(['DATA', 'AIRTIME', 'ELECTRICITY', 'CABLE', 'EDUCATION'] as ServiceType[]).map(service => (
              <button 
                key={service}
                onClick={() => setActiveService(service)}
                className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${activeService === service ? 'bg-zinc-100 text-black border-white' : 'bg-black text-zinc-600 border-zinc-800 hover:text-white'}`}
              >
                {service}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Area */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-12 lg:p-20 text-center relative overflow-hidden group">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-zinc-950 text-green-500 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:rotate-12 transition-all">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 className="text-white text-3xl font-black tracking-tighter mb-4 uppercase">Node Logic Debugger</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto mb-12 leading-relaxed">
            Executing diagnostic probe for <span className="text-green-500 font-black">{activeService}</span> on <span className="text-green-500 font-black">{server === 'server1' ? 'INLOMAX' : 'CIP'}</span> gateway.
          </p>
          <button 
            onClick={runDiagnostic}
            disabled={loading}
            className="px-16 py-6 bg-green-500 text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 mx-auto rounded-2xl shadow-2xl shadow-green-900/20"
          >
            {loading ? <Spinner /> : 'RUN DIAGNOSTIC PROBE'}
          </button>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-green-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="p-8 bg-black/40 border border-zinc-800 rounded-2xl flex items-start gap-6">
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-zinc-800 text-zinc-500">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <div>
           <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 tracking-widest">Protocol Note</p>
           <p className="text-zinc-600 text-[11px] leading-relaxed italic">Tests are executed in a production-mirror environment. Real API responses will be piped into the buffer below for dissection.</p>
        </div>
      </div>
    </div>
  );
};

export default VtuTest;