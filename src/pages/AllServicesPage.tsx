import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Zap, Tv, 
  ArrowLeft, Search, GraduationCap, 
  Bitcoin, LayoutGrid, CreditCard,
  Users, MessageSquare, ShieldCheck,
  Globe, ShoppingBag, Gift
} from 'lucide-react';

const AllServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { id: 'airtime', icon: <Smartphone />, label: "Airtime Topup", to: "/airtime", color: "bg-emerald-600", desc: "Recharge your phone instantly" },
    { id: 'data', icon: <Wifi />, label: "Data Bundle", to: "/data", color: "bg-emerald-500", desc: "Cheap data for all networks" },
    { id: 'cable', icon: <Tv />, label: "Cable TV", to: "/cable", color: "bg-emerald-400", desc: "DStv, GOtv & Startimes" },
    { id: 'electricity', icon: <Zap />, label: "Electricity", to: "/bills", color: "bg-emerald-600", desc: "Pay utility bills easily" },
    { id: 'education', icon: <GraduationCap />, label: "Education", to: "/education", color: "bg-emerald-500", desc: "WAEC & NECO Result Pins" },
    { id: 'crypto', icon: <Bitcoin />, label: "Crypto", to: "/crypto", color: "bg-emerald-700", desc: "Buy and sell cryptocurrencies" },
    { id: 'giftcards', icon: <CreditCard />, label: "Gift Cards", to: "/giftcards", color: "bg-emerald-600", desc: "Trade gift cards at best rates" },
    { id: 'smm', icon: <Users />, label: "SMM Panel", to: "/smm", color: "bg-emerald-500", desc: "Social media marketing services" },
    { id: 'referrals', icon: <Users />, label: "Referrals", to: "/referrals", color: "bg-emerald-400", desc: "Earn by inviting friends" },
    { id: 'funding', icon: <Search />, label: "Wallet Funding", to: "/funding", color: "bg-emerald-600", desc: "Add money to your wallet" },
    { id: 'history', icon: <LayoutGrid />, label: "History", to: "/history", color: "bg-emerald-500", desc: "View your transactions" },
    { id: 'support', icon: <MessageSquare />, label: "Support", to: "/support", color: "bg-emerald-700", desc: "Get help from our team" },
  ];

  const filteredServices = services.filter(service => 
    service.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32 px-4">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-600 dark:text-gray-400"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Services</h1>
        <div className="w-10"></div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for a service (e.g. data, airtime...)"
          className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-emerald-950/20 border border-gray-100 dark:border-emerald-900/30 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(service.to)}
              className="p-6 bg-white dark:bg-emerald-950/20 rounded-3xl border border-gray-100 dark:border-emerald-900/30 flex items-center gap-6 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className={`w-14 h-14 ${service.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                {React.cloneElement(service.icon as React.ReactElement, { size: 24 })}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{service.label}</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{service.desc}</p>
              </div>
              <LayoutGrid size={16} className="text-gray-300" />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Search size={32} />
            </div>
            <p className="text-gray-500 font-medium">No services found for "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-emerald-600 font-bold text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Categories / Quick Links */}
      <div className="pt-8 space-y-6">
        <h3 className="text-sm font-bold">Popular Categories</h3>
        <div className="grid grid-cols-3 gap-4">
          <CategoryItem icon={<Smartphone />} label="Telecom" color="text-emerald-600" />
          <CategoryItem icon={<Zap />} label="Utilities" color="text-yellow-600" />
          <CategoryItem icon={<Tv />} label="Entertainment" color="text-blue-600" />
        </div>
      </div>
    </div>
  );
};

const CategoryItem = ({ icon, label, color }: any) => (
  <div className="p-4 bg-white dark:bg-emerald-950/20 rounded-2xl border border-gray-100 dark:border-emerald-900/30 flex flex-col items-center gap-2">
    <div className={color}>
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <span className="text-[10px] font-bold">{label}</span>
  </div>
);

export default AllServicesPage;
