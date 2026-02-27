import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { User, UserRole, UserStatus } from '../types';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { useNotifications } from '../hooks/useNotifications';
import { 
  UsersIcon, 
  ShieldCheckIcon, 
  BanIcon,
  SignalIcon
} from '../components/Icons';
import { Search, RefreshCw, Shield, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoleButtonProps {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

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

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await adminService.getAllUsers();
    if (res.status && res.data) {
      setUsers(res.data);
    } else {
      addNotification(res.message || "Failed to load user data", "error");
    }
    setLoading(false);
  }, [addNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setIsProcessing(true);
    const res = await adminService.updateUserRole(userId, newRole);
    if (res.status) {
      addNotification(res.message || "Account tier updated", "success");
      fetchUsers(true);
      setIsManageModalOpen(false);
    } else {
      addNotification(res.message || "Failed to update tier", "error");
    }
    setIsProcessing(false);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    setIsProcessing(true);
    const res = await adminService.updateUserStatus(userId, newStatus);
    if (res.status) {
      addNotification(res.message || "Account status updated", "success");
      fetchUsers(true);
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
    
    if (finType === 'DEBIT' && amount > (selectedUser.walletBalance || 0)) {
      addNotification("Insufficient user balance for this debit.", "warning");
      setIsProcessing(false);
      return;
    }

    const res = finType === 'CREDIT' 
      ? await adminService.creditUser(selectedUser.id, amount)
      : await adminService.debitUser(selectedUser.id, amount);
    
    if (res.status) {
      addNotification(res.message || "Financial update successful", "success");
      fetchUsers(true);
      setIsFinModalOpen(false);
      setFinAmount('');
    } else {
      addNotification(res.message || "Financial update failed", "error");
    }
    setIsProcessing(false);
  };

  const filteredUsers = users.filter(u => 
    (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && users.length === 0) return (
    <div className="flex flex-col h-[60vh] items-center justify-center space-y-6">
      <Spinner />
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.5em] animate-pulse">Scanning Node Repository...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-24">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10">
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Governance Layer</h2>
          <h1 className="text-5xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.85]">Node <br /><span className="text-blue-600">Repository.</span></h1>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto items-center gap-6">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by identity..." 
              className="w-full p-6 pl-16 bg-white border border-gray-100 rounded-[2rem] shadow-2xl focus:ring-8 focus:ring-blue-50 transition-all font-black text-lg outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => fetchUsers()}
            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-xl text-gray-400 hover:text-blue-600 transition-all transform active:scale-95"
            title="Refresh Matrix"
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-50 overflow-hidden relative">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border-b border-gray-100">
                <th className="px-12 py-8">Identity</th>
                <th className="px-12 py-8">Node Tier</th>
                <th className="px-12 py-8">Status</th>
                <th className="px-12 py-8 text-right">Liquidity</th>
                <th className="px-12 py-8 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={u.id} 
                    className="group hover:bg-blue-50/30 transition-all duration-500"
                  >
                    <td className="px-12 py-8">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                          {u.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-black text-gray-900 tracking-tighter text-xl leading-none mb-2">{u.fullName || 'Anonymous Node'}</div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                             <span>{u.email}</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="text-blue-600">@{u.username}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <span className={`inline-flex px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                        u.role === 'admin' ? 'bg-gray-900 text-white' : 
                        u.role === 'reseller' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-12 py-8">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${u.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          u.status === 'suspended' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {u.status || 'active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <div className="font-black text-gray-900 text-2xl tracking-tighter leading-none">₦{u.walletBalance?.toLocaleString() || '0'}</div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">Available Credits</p>
                    </td>
                    <td className="px-12 py-8 text-right">
                      <div className="flex justify-end space-x-4">
                        <button 
                          onClick={() => { setSelectedUser(u); setIsFinModalOpen(true); }}
                          className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-green-100 transform active:scale-90"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => { setSelectedUser(u); setIsManageModalOpen(true); }}
                          className="p-4 bg-gray-950 text-white rounded-2xl hover:bg-blue-600 transition-all shadow-xl transform active:scale-90"
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-12 py-32 text-center">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-300">
                          <UsersIcon />
                        </div>
                        <div className="space-y-2">
                           <p className="text-gray-900 text-3xl font-black tracking-tighter">No Nodes Found</p>
                           <p className="text-gray-400 font-medium text-lg">The matrix is empty. Adjust your search parameters.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Modal */}
      <Modal 
        isOpen={isFinModalOpen} 
        onClose={() => setIsFinModalOpen(false)} 
        title="Liquidity Adjustment"
        footer={
          <button 
            onClick={handleFinancialAction}
            className={`w-full py-6 rounded-3xl font-black text-[12px] uppercase tracking-widest text-white transition-all shadow-2xl transform active:scale-95 ${finType === 'CREDIT' ? 'bg-green-600 hover:bg-gray-950 shadow-green-100' : 'bg-red-600 hover:bg-gray-950 shadow-red-100'}`}
            disabled={isProcessing || !finAmount}
          >
            {isProcessing ? <Spinner /> : `Execute ${finType} Protocol`}
          </button>
        }
      >
        <div className="space-y-10 py-4">
          <div className="flex p-2 bg-gray-100 rounded-3xl">
            <button className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${finType === 'CREDIT' ? 'bg-white text-green-600 shadow-xl' : 'text-gray-400'}`} onClick={() => setFinType('CREDIT')}>Credit Node</button>
            <button className={`flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${finType === 'DEBIT' ? 'bg-white text-red-600 shadow-xl' : 'text-gray-400'}`} onClick={() => setFinType('DEBIT')}>Debit Node</button>
          </div>
          <div className="space-y-6">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-4">Adjustment Amount (₦)</label>
            <div className="relative">
               <span className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-4xl">₦</span>
               <input 
                 type="number" 
                 className="w-full p-10 pl-20 bg-gray-50 border-2 border-transparent rounded-[3rem] text-5xl font-black tracking-tighter focus:ring-8 focus:ring-blue-50 focus:bg-white transition-all outline-none"
                 placeholder="0.00"
                 value={finAmount}
                 onChange={(e) => setFinAmount(e.target.value)}
               />
            </div>
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-center space-x-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><UsersIcon /></div>
               <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">Targeting: {selectedUser?.fullName}</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Governance Modal */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="Node Governance"
      >
        <div className="space-y-12 py-6">
           <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Access Tier Protocol</label>
              <div className="grid grid-cols-3 gap-6">
                 <RoleButton label="Standard" icon={<UsersIcon />} active={selectedUser?.role === 'user'} onClick={() => handleRoleChange(selectedUser!.id, 'user')} />
                 <RoleButton label="Reseller" icon={<SignalIcon />} active={selectedUser?.role === 'reseller'} onClick={() => handleRoleChange(selectedUser!.id, 'reseller')} />
                 <RoleButton label="Admin" icon={<ShieldCheckIcon />} active={selectedUser?.role === 'admin'} onClick={() => handleRoleChange(selectedUser!.id, 'admin')} />
              </div>
           </div>

           <div className="pt-10 border-t border-gray-100">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 ml-4">Override Status</label>
              {selectedUser?.status === 'suspended' ? (
                <button 
                  onClick={() => handleStatusChange(selectedUser!.id, 'active')}
                  className="w-full bg-green-50 text-green-600 p-8 rounded-[2.5rem] font-black flex items-center justify-center space-x-4 hover:bg-green-600 hover:text-white transition-all shadow-xl shadow-green-100 group"
                >
                  <Shield className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span className="uppercase tracking-widest text-[11px]">Restore Full Access</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleStatusChange(selectedUser!.id, 'suspended')}
                  className="w-full bg-red-50 text-red-600 p-8 rounded-[2.5rem] font-black flex items-center justify-center space-x-4 hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-100 group"
                >
                  <BanIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="uppercase tracking-widest text-[11px]">Suspend Node Access</span>
                </button>
              )}
           </div>
        </div>
      </Modal>
    </div>
  );
};

const RoleButton: React.FC<RoleButtonProps> = ({ label, icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-8 border-2 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all transform active:scale-95 ${
      active ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-2xl shadow-blue-100' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
    }`}
  >
    <div className="text-2xl">{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default AdminUsersPage;