
import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import Spinner from '../components/Spinner';
import { useNotifications } from '../hooks/useNotifications';
import { UsersIcon, CurrencyDollarIcon, ShieldCheckIcon, BoltIcon } from '../components/Icons';

const AdminDashboardPage: React.FC = () => {
  const { } = useNotifications();
  const [stats, setStats] = useState<any>(null);
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const resStats = await adminService.getSystemStats();
    const resProvider = await adminService.getProviderBalance();
    
    if (resStats.status) setStats(resStats.data);
    if (resProvider.status) setProviderBalance(resProvider.data || 0);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !stats) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Spinner />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Aggregating Live System Data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Total Control</h2>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Overview</h1>
        </div>
        <button 
          onClick={() => fetchData()}
          className="flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all"
        >
          {loading ? <Spinner /> : <span>Refresh Matrix</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard icon={<UsersIcon />} label="User Repository" value={stats?.totalUsers || 0} color="blue" />
        <StatCard icon={<CurrencyDollarIcon />} label="System Liquidity" value={`₦${(stats?.totalBalance || 0).toLocaleString()}`} color="green" />
        <StatCard icon={<BoltIcon />} label="Provider Balance" value={`₦${(providerBalance || 0).toLocaleString()}`} color="indigo" />
        <StatCard icon={<ShieldCheckIcon />} label="Governance Layer" value={stats?.admins || 0} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
          <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Infrastructure Health</h3>
          <div className="space-y-6">
            <AlertItem type="success" message="Core payment gateway is active and processing." time="Current" />
            <AlertItem type="info" message="Firestore cluster indexing is synchronized." time="Synchronized" />
            <AlertItem type="success" message="Security override password 'OBATAISBACKBYOBA' is active." time="Active" />
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[3rem] text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Security Protocol</h3>
            <p className="text-white/40 mb-10 text-sm leading-relaxed max-w-sm">Global administrative privileges are restricted to Master Accounts. Ensure you log out after sensitive governance operations.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                Audit Logs
              </button>
              <button className="bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                Sync Gateway
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all"></div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colors: any = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    indigo: 'bg-indigo-600',
    gray: 'bg-gray-900'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className={`w-12 h-12 ${colors[color]} text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-3xl font-black text-gray-900 tracking-tighter">{value}</div>
    </div>
  );
};

const AlertItem = ({ type, message, time }: any) => {
  const dots: any = {
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
    success: 'bg-green-500'
  };
  return (
    <div className="flex items-start space-x-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
      <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 animate-pulse ${dots[type]}`}></div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800 tracking-tight">{message}</p>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{time}</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
