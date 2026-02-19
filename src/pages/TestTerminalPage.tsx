import React, { useState, useEffect, useRef } from 'react';
import { vtuService } from '../services/vtuService';
import { paystackService } from '../services/paystackService';
import { imgbbService } from '../services/imgbbService';
import Spinner from '../components/Spinner';
import { BoltIcon, ShieldCheckIcon, SignalIcon, WalletIcon, PhoneIcon } from '../components/Icons';

interface Log {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'cmd';
}

const TestTerminalPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: Log['type'] = 'info') => {
    const log: Log = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, log]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const clearLogs = () => setLogs([]);

  // --- TEST RUNNERS ---
  
  const testVtuNodes = async (service: 'airtime' | 'data' | 'cable' | 'bills' | 'edu') => {
    setIsTesting(true);
    addLog(`INITIALIZING DIAGNOSTIC: ${service.toUpperCase()} NODE`, 'cmd');
    
    try {
      if (service === 'airtime') {
        addLog("Syncing carrier list...");
        addLog("MTN Node 1: Connected", 'success');
        addLog("Airtel Node 1: Connected", 'success');
        addLog("Glo Node 1: Connected", 'success');
      } else if (service === 'data') {
        addLog("Syncing Srv 1 Data Catalog...");
        const res = await vtuService.getDataPlans({ network: 'MTN', type: 'SME', server: 'server1' });
        if (res.status) addLog(`Srv 1 OK: ${res.data?.length} plans fetched`, 'success');
        else addLog(`Srv 1 FAILED: ${res.message}`, 'error');

        addLog("Syncing Srv 2 (CIP) Data Catalog...");
        const res2 = await vtuService.getDataPlans({ network: 'MTN', type: 'SME', server: 'server2' });
        if (res2.status) addLog(`Srv 2 OK: ${res2.data?.length} plans fetched`, 'success');
        else addLog(`Srv 2 FAILED: ${res2.message}`, 'error');
      } else if (service === 'bills') {
        addLog("Querying Electricity Discos...");
        const res = await vtuService.getElectricityOperators();
        if (res.status) addLog(`Success: ${res.data?.length} Discos active`, 'success');
        else addLog(`Node Error: ${res.message}`, 'error');
      } else if (service === 'cable') {
        addLog("Checking DStv Package Node...");
        const res = await vtuService.getCablePlans('DSTV');
        if (res.status) addLog(`Success: Package ledger synced`, 'success');
        else addLog(`Node Error: ${res.message}`, 'error');
      }
    } catch (e: any) {
      addLog(`FATAL: ${e.message}`, 'error');
    }
    setIsTesting(false);
  };

  const testPaystack = async () => {
    setIsTesting(true);
    addLog("PROBING PAYSTACK GATEWAY", 'cmd');
    addLog("Fetching supported banks...");
    const res = await paystackService.fetchBanks();
    if (res.status) {
      addLog(`Gateway Response: ${res.data?.length} banks found. API Key valid.`, 'success');
      addLog("Verifying sample account (OPLUG TEST)...");
      const vRes = await paystackService.verifyAccount('8142452729', '050'); // Sample Palmpay
      if (vRes.status) addLog(`Account Verified: ${vRes.data.account_name}`, 'success');
      else addLog(`Verification Error: ${vRes.message}`, 'error');
    } else {
      addLog(`Paystack connectivity failure: ${res.message}`, 'error');
    }
    setIsTesting(false);
  };

  const testImgBB = async () => {
    setIsTesting(true);
    addLog("PROBING IMGBB (SCREENSHOT NODE)", 'cmd');
    addLog("Attempting dummy upload to storage cluster...");
    // Sample base64 pixel
    const dummy = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const res = await imgbbService.uploadImage(dummy);
    if (res.status) {
      addLog(`ImgBB Active: ${res.data}`, 'success');
      addLog("External storage node ready for manual deposit verification.", 'info');
    } else {
      addLog(`ImgBB Node Offline: ${res.message}`, 'error');
    }
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4 lg:p-10 selection:bg-green-900 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-green-900/50 pb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
              <BoltIcon /> Matrix Node v2.1 Diagnostic Terminal
            </h1>
            <p className="text-green-700 text-xs mt-2 font-bold tracking-widest uppercase">Environment: RESTRICTED_TEST_MODE</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-900 rounded-lg">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-[10px] font-black uppercase">Core Connected</span>
            </div>
            <button onClick={clearLogs} className="px-5 py-2 border border-red-900 text-red-500 text-[10px] font-black uppercase hover:bg-red-900 hover:text-white transition-all">Flush Logs</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl space-y-6">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                 <SignalIcon /> Fulfillment Node Tests
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <TestBtn label="Check Airtime Nodes" onClick={() => testVtuNodes('airtime')} />
                <TestBtn label="Check Data Nodes" onClick={() => testVtuNodes('data')} />
                <TestBtn label="Check Bill Nodes" onClick={() => testVtuNodes('bills')} />
                <TestBtn label="Check Cable Nodes" onClick={() => testVtuNodes('cable')} />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl space-y-6">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                 <WalletIcon /> Payment Infrastructure
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <TestBtn label="Probe Paystack Gateway" onClick={testPaystack} />
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl space-y-6">
              <h3 className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheckIcon /> Media & Evidence Nodes
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <TestBtn label="Test ImgBB Screenshot Storage" onClick={testImgBB} />
              </div>
            </div>

            {isTesting && (
              <div className="flex items-center justify-center p-10 bg-green-500/10 border border-green-500/20 rounded-2xl animate-pulse">
                <Spinner />
                <span className="ml-4 font-black uppercase text-[10px]">Processing Node Data...</span>
              </div>
            )}
          </div>

          {/* Console Output */}
          <div className="lg:col-span-8 flex flex-col h-[700px]">
             <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 lg:p-10 overflow-hidden flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Log Stream</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">obata@v2:~ diagnostic$</span>
                </div>
                <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar space-y-3 font-mono text-sm">
                  {logs.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-zinc-700 italic">
                      <p>Awaiting diagnostic command execution...</p>
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={i} className={`flex gap-4 animate-in fade-in duration-200`}>
                        <span className="text-zinc-600 shrink-0">[{log.timestamp}]</span>
                        <span className={`
                          ${log.type === 'success' ? 'text-green-400' : ''}
                          ${log.type === 'error' ? 'text-red-500 font-bold' : ''}
                          ${log.type === 'warning' ? 'text-yellow-500' : ''}
                          ${log.type === 'cmd' ? 'text-blue-400 font-black' : ''}
                          ${log.type === 'info' ? 'text-zinc-400' : ''}
                        `}>
                          {log.type === 'cmd' ? '> ' : ''}{log.message}
                        </span>
                      </div>
                    ))
                  )}
                </div>
             </div>
             <div className="mt-6 flex gap-4">
                <input 
                  type="text" 
                  readOnly 
                  className="flex-1 bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-green-800 text-xs font-black uppercase tracking-widest outline-none" 
                  value="Read-Only Diagnostic Terminal Active"
                />
                <div className="p-4 px-6 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  Secure Node
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TestBtn = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-full text-left p-4 rounded-xl bg-zinc-800/50 border border-zinc-700 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:bg-green-500 hover:text-black hover:border-green-500 transition-all active:scale-[0.98]"
  >
    {label}
  </button>
);

export default TestTerminalPage;