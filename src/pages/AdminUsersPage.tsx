
import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { User, UserRole, UserStatus } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
// Added SignalIcon to the imports below to fix the "Cannot find name 'SignalIcon'" error
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  BanIcon,
  ExchangeIcon,
  SignalIcon
} from '../components/Icons';

const AdminUsersPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [finAmount, setFinAmount] = useState('');
  const [finType, setFinType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await adminService.getAllUsers();
    if (res.status && res.data) setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsProcessing(true);
    const res = await adminService.updateUserRole(userId, newRole);
    if (res.status) {
      addNotification(res.message || "Role updated", "success");
      fetchUsers();
      setIsManageModalOpen(false);
    } else {
      addNotification(res.message || "Failed to update role", "error");
    }
    setIsProcessing(false);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setIsProcessing(true);
    const res = await adminService.updateUserStatus(userId, newStatus);
    if (res.status) {
      addNotification(res.message || "Status updated", "success");
      fetchUsers();
      setIsManageModalOpen(false);
    } else {
      addNotification(res.message || "Failed to update status", "error");
    }
    setIsProcessing(false);
  };

  const handleFinancialAction = async () => {
    if (!selectedUser || !finAmount || isProcessing) return;
    setIsProcessing(true);
    const amount = parseFloat(finAmount);
    const res = finType === 'CREDIT' 
      ? await adminService.creditUser(selectedUser.id, amount)
      : await adminService.debitUser(selectedUser.id, amount);
    
    if (res.status) {
      addNotification(res.message || "Transaction successful", "success");
      fetchUsers();
      setIsFinModalOpen(false);
      setFinAmount('');
    } else {
      addNotification(res.message || "Transaction failed", "error");
    }
    setIsProcessing(false);
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) return <div className="flex h-96 items-center justify-center"><Spinner /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4">Governance</h2>
          <h1 className="text-4xl lg:text-6xl font-black text-gray-900 tracking-tighter">User Repository</h1>
        </div>
        <div className="w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
              <tr>
                <th className="px-10 py-6">User Identity</th>
                <th className="px-10 py-6">Tier</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Wallet Balance</th>
                <th className="px-10 py-6 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 tracking-tight">{u.fullName}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-black text-white' : 
                      u.role === 'reseller' ? 'bg-indigo-100 text-indigo-700' :
                      u.role === 'api' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      u.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {u.status || 'active'}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="font-black text-gray-900 text-lg tracking-tighter">₦{u.walletBalance?.toLocaleString()}</div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex justify-end space-x-3">
                      <button 
                        onClick={() => { setSelectedUser(u); setIsFinModalOpen(true); }}
                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Finance"
                      >
                        <CurrencyDollarIcon />
                      </button>
                      <button 
                        onClick={() => { setSelectedUser(u); setIsManageModalOpen(true); }}
                        className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                        title="Manage"
                      >
                        <ShieldCheckIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Modal */}
      <Modal 
        isOpen={isFinModalOpen} 
        onClose={() => setIsFinModalOpen(false)} 
        title="Wallet Adjustment"
        footer={
          <button 
            onClick={handleFinancialAction}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all ${finType === 'CREDIT' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            disabled={isProcessing || !finAmount}
          >
            {isProcessing ? <Spinner /> : `Execute ${finType}`}
          </button>
        }
      >
        <div className="space-y-8">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl">
            <button className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${finType === 'CREDIT' ? 'bg-white text-green-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFinType('CREDIT')}>Credit</button>
            <button className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${finType === 'DEBIT' ? 'bg-white text-red-600 shadow-md' : 'text-gray-400'}`} onClick={() => setFinType('DEBIT')}>Debit</button>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Adjustment Amount (₦)</label>
            <input 
              type="number" 
              className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl text-2xl font-black tracking-tighter"
              placeholder="0.00"
              value={finAmount}
              onChange={(e) => setFinAmount(e.target.value)}
            />
            <p className="mt-4 text-[11px] text-gray-500 font-medium italic">Target: {selectedUser?.fullName} ({selectedUser?.email})</p>
          </div>
        </div>
      </Modal>

      {/* Governance Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Account Governance"
      >
        <div className="space-y-10 py-4">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Promote/Change Tier</label>
              <div className="grid grid-cols-2 gap-4">
                 <RoleButton label="Normal User" icon={<UsersIcon />} active={selectedUser?.role === 'user'} onClick={() => handleRoleChange(selectedUser!.id, 'user')} />
                 <RoleButton label="Reseller" icon={<SignalIcon />} active={selectedUser?.role === 'reseller'} onClick={() => handleRoleChange(selectedUser!.id, 'reseller')} />
                 <RoleButton label="API Merchant" icon={<ExchangeIcon />} active={selectedUser?.role === 'api'} onClick={() => handleRoleChange(selectedUser!.id, 'api')} />
                 <RoleButton label="Admin" icon={<ShieldCheckIcon />} active={selectedUser?.role === 'admin'} onClick={() => handleRoleChange(selectedUser!.id, 'admin')} />
              </div>
           </div>

           <div className="pt-8 border-t border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Master Override</label>
              {selectedUser?.status === 'suspended' ? (
                <button 
                  onClick={() => handleStatusChange(selectedUser!.id, 'active')}
                  className="w-full bg-green-50 text-green-600 p-6 rounded-3xl font-black flex items-center justify-center space-x-3 hover:bg-green-600 hover:text-white transition-all"
                >
                  <ShieldCheckIcon />
                  <span>Unban Account</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusChange(selectedUser!.id, 'suspended')}
                  className="w-full bg-red-50 text-red-600 p-6 rounded-3xl font-black flex items-center justify-center space-x-3 hover:bg-red-600 hover:text-white transition-all"
                >
                  <BanIcon />
                  <span>Suspend Account</span>
                </button>
              )}
           </div>
        </div>
      </Modal>
    </div>
  );
};

const RoleButton = ({ label, icon, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 border-2 rounded-3xl flex flex-col items-center gap-3 transition-all ${
      active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
    }`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AdminUsersPage;
