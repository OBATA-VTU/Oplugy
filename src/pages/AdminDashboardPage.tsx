
import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import Spinner from '../components/Spinner';
import { UsersIcon, CurrencyDollarIcon, ShieldCheckIcon, SignalIcon } from '../components/Icons';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await adminService.getSystemStats();
      if (res.status) setStats(res.data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Spinner /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Total Control</h2>
        <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">System Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatCard icon={<UsersIcon />} label="Total Users" value={stats?.totalUsers || 0} color="blue" />
        <StatCard icon={<CurrencyDollarIcon />} label="Float in System" value={`₦${stats?.totalBalance?.toLocaleString() || 0}`} color="green" />
        <StatCard icon={<SignalIcon />} label="Resellers" value={stats?.resellers || 0} color="indigo" />
        <StatCard icon={<ShieldCheckIcon />} label="Admins" value={stats?.admins || 0} color="gray" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50">
          <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Recent System Alerts</h3>
          <div className="space-y-6">
            <AlertItem type="info" message="Database cluster optimization completed." time="2h ago" />
            <AlertItem type="warning" message="Manual funding request detected from user @ayuba." time="4h ago" />
            <AlertItem type="success" message="Global API key refresh successful." time="1d ago" />
          </div>
        </div>

        <div className="bg-gray-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 tracking-tight">Master Keys</h3>
            <p className="text-white/40 mb-10 text-sm leading-relaxed">System-wide encryption and administrative overrides are currently locked for your security.</p>
            <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Initialize Protocol
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
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
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500">
      <div className={`w-12 h-12 ${colors[color]} text-white rounded-xl flex items-center justify-center mb-6`}>
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
    <div className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dots[type]}`}></div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-800 tracking-tight">{message}</p>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{time}</p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
