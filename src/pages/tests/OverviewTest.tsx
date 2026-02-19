import React, { useContext, useEffect, useState, useCallback } from 'react';
import { TerminalContext } from '../../components/TerminalLayout';
import { adminService } from '../../services/adminService';
import Spinner from '../../components/Spinner';

const OverviewTest: React.FC = () => {
  const { addLog } = useContext(TerminalContext);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const runSystemAudit = useCallback(async () => {
    setLoading(true);
    addLog("INITIATING GLOBAL SYSTEM AUDIT", 'cmd');
    try {
      addLog("Probing Firestore Cluster...");
      const res = await adminService.getSystemStats();
      if (res.status) {
        addLog("Database sync successful", 'success');
        setStats(res.data);
      }
      
      addLog("Scanning Provider Node Balances...");
      const balances = await adminService.getProviderBalances();
      addLog("Balance audit complete", 'success', balances);
    } catch (e: any) {
      addLog(`AUDIT FAILED: ${e.message}`, 'error');
    }
    setLoading(false);
  }, [addLog]);

  useEffect(() => { 
    runSystemAudit(); 
  }, [runSystemAudit]);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Active Users" value={stats?.totalUsers || '...'} />
        <StatBox label="System Liquidity" value={`₦${(stats?.totalBalance || 0).toLocaleString()}`} />
        <StatBox label="Auth Tier" value="ADMIN_LEVEL_0" />
        <StatBox label="Uptime" value="99.98%" />
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl">
         <h3 className="text-white text-lg font-black uppercase tracking-tighter mb-4">Diagnostics Console</h3>
         <p className="text-zinc-500 text-xs mb-8">This terminal allows low-level dissecting of the Oplug v2 framework. Use the sidebar to test specific nodes.</p>
         <button 
           onClick={runSystemAudit}
           disabled={loading}
           className="px-8 py-4 bg-green-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50 flex items-center gap-3"
         >
           {loading ? <Spinner /> : 'RERUN GLOBAL AUDIT'}
         </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: any) => (
  <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl">
    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest mb-2">{label}</p>
    <div className="text-2xl text-white font-black tracking-tighter">{value}</div>
  </div>
);

export default OverviewTest;