import React, { useContext, useState } from 'react';
import { TerminalContext } from '../../components/TerminalLayout';
import { paystackService } from '../../services/paystackService';
import Spinner from '../../components/Spinner';

const PaymentTest: React.FC = () => {
  const { addLog } = useContext(TerminalContext);
  const [loading, setLoading] = useState(false);
  const [testAccount, setTestAccount] = useState('8142452729');
  const [testBank, setTestBank] = useState('050');

  const testBankFetch = async () => {
    setLoading(true);
    addLog("PROBING PAYSTACK INFRASTRUCTURE: BANK LIST", 'cmd');
    try {
      const res = await paystackService.fetchBanks();
      if (res.status) {
        addLog(`PAYSTACK_OK: Found ${res.data?.length} financial institutions.`, 'success', res.data?.slice(0, 5));
        addLog("API Integrity: VERIFIED", 'success');
      } else {
        addLog(`PAYSTACK_ERROR: ${res.message}`, 'error');
      }
    } catch (e: any) {
      addLog(`FATAL: ${e.message}`, 'error');
    }
    setLoading(false);
  };

  const testAccountResolution = async () => {
    setLoading(true);
    addLog(`TESTING ACCOUNT RESOLUTION: [${testAccount}] - BANK: [${testBank}]`, 'cmd');
    try {
      const res = await paystackService.verifyAccount(testAccount, testBank);
      if (res.status) {
        addLog(`RESOLVED: Account belongs to ${res.data.account_name}`, 'success', res.data);
      } else {
        addLog(`FAILED: ${res.message}`, 'error');
      }
    } catch (e: any) {
      addLog(`EXCEPTION: ${e.message}`, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl space-y-8">
            <h3 className="text-white font-black text-xl tracking-tighter uppercase">Gateway Health</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">Probe the base Paystack API to verify environment variable synchronization and connection speed.</p>
            <button 
              onClick={testBankFetch} 
              disabled={loading}
              className="w-full px-8 py-5 bg-zinc-100 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all rounded-2xl flex items-center justify-center gap-3"
            >
              {loading ? <Spinner /> : 'VERIFY PAYSTACK CONNECTIVITY'}
            </button>
         </div>

         <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl space-y-8">
            <h3 className="text-white font-black text-xl tracking-tighter uppercase">Resolution Debug</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Bank Code (Palmpay: 050, OPAY: 999992)</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono text-sm outline-none focus:border-green-500 transition-all" 
                    value={testBank}
                    onChange={(e) => setTestBank(e.target.value)}
                  />
               </div>
               <div>
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Account Number</label>
                  <input 
                    type="text" 
                    className="w-full bg-black border border-zinc-800 p-4 rounded-xl text-green-500 font-mono text-sm outline-none focus:border-green-500 transition-all" 
                    value={testAccount}
                    onChange={(e) => setTestAccount(e.target.value)}
                  />
               </div>
            </div>
            <button 
              onClick={testAccountResolution} 
              disabled={loading}
              className="w-full px-8 py-5 bg-green-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all rounded-2xl flex items-center justify-center gap-3"
            >
              {loading ? <Spinner /> : 'RUN RESOLUTION TEST'}
            </button>
         </div>
      </div>
      
      <div className="p-8 bg-zinc-950 border border-zinc-800 rounded-3xl text-center">
         <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em]">Note: Resolution tests require a valid secret key in the environment.</p>
      </div>
    </div>
  );
};

export default PaymentTest;