import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { vtuService } from '../services/vtuService';
import Spinner from '../components/Spinner';
import { UsersIcon, CurrencyDollarIcon, ShieldCheckIcon, BoltIcon } from '../components/Icons';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'indigo' | 'gray' | 'red';
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [balances, setBalances] = useState({ srv1: 0, srv2: 0 });
  const [loading, setLoading] = useState(true);

  const [srv2Status, setSrv2Status] = useState<'IDLE' | 'CHECKING' | 'ONLINE' | 'OFFLINE'>('IDLE');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [resStats, resBalances] = await Promise.all([
      adminService.getSystemStats(),
      adminService.getProviderBalances()
    ]);
    
    if (resStats.status) setStats(resStats.data);
    setBalances(resBalances);
    setLoading(false);
  }, []);

  const checkSrv2 = async () => {
    setSrv2Status('CHECKING');
    const res = await vtuService.checkServerStatus(2);
    setSrv2Status(res.status ? 'ONLINE' : 'OFFLINE');
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !stats) return (
    <div className="flex flex-col h-96 items-center justify-center space-y-4">
      <Spinner />
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading System Data...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Admin Control</h2>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter leading-none">System Overview</h1>
        </div>
        <button 
          onClick={() => fetchData()}
          className="flex items-center space-x-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:border-blue-100 transition-all"
        >
          {loading ? <Spinner /> : <span>Refresh Data</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 mb-12">
        <StatCard icon={<UsersIcon />} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
        <StatCard icon={<CurrencyDollarIcon />} label="User Balances" value={`₦${(stats?.totalBalance || 0).toLocaleString()}`} color="green" />
        <StatCard icon={<BoltIcon />} label="Server 1 Balance" value={`₦${balances.srv1.toLocaleString()}`} color="indigo" />
        <StatCard icon={<BoltIcon />} label="Server 2 Balance" value={`₦${balances.srv2.toLocaleString()}`} color="red" />
        <StatCard icon={<ShieldCheckIcon />} label="Admins" value={stats?.admins || 0} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">System Health</h3>
            <button 
              onClick={checkSrv2}
              disabled={srv2Status === 'CHECKING'}
              className="px-4 py-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
            >
              {srv2Status === 'CHECKING' ? 'Checking...' : 'Check Server 2'}
            </button>
          </div>
          <div className="space-y-6">
            <AlertItem type="success" message="Server 1 (Inlomax): Online & Working." time="Live" />
            <AlertItem 
              type={srv2Status === 'OFFLINE' ? 'error' : 'success'} 
              message={srv2Status === 'IDLE' ? 'Server 2 (CIP): Ready for check.' : srv2Status === 'ONLINE' ? 'Server 2 (CIP): Online & Connected.' : srv2Status === 'OFFLINE' ? 'Server 2 (CIP): Connection Failed.' : 'Checking Server 2...'} 
              time={srv2Status === 'IDLE' ? 'Ready' : 'Live'} 
            />
            <AlertItem type="info" message="Database is running smoothly." time="Active" />
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[3rem] text-white overflow-hidden relative group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Security Note</h3>
            <p className="text-white/40 mb-10 text-sm leading-relaxed max-w-sm">Admin access is restricted. Please make sure your provider accounts have enough funds to avoid service failure.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5">
                View Logs
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-600/30 transition-all"></div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    indigo: 'bg-indigo-600',
    red: 'bg-red-500',
    gray: 'bg-gray-900'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group">
      <div className={`w-12 h-12 ${colors[color]} text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-2xl xl:text-3xl font-black text-gray-900 tracking-tighter truncate">{value}</div>
    </div>
  );
};

const AlertItem = ({ type, message, time }: any) => (
  <div className="flex items-start space-x-4 p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
    <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 animate-pulse ${type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
    <div className="flex-1">
      <p className="text-sm font-bold text-gray-800 tracking-tight">{message}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{time}</p>
    </div>
  </div>
);

export default AdminDashboardPage;