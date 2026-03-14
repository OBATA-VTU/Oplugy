import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Phone, 
  Wifi, 
  Zap, 
  Tv, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight,
  Search
} from 'lucide-react';
import Logo from '../components/Logo';
import Footer from '../components/Footer';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QuickPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { 
      id: 'airtime',
      icon: <Phone className="w-6 h-6" />, 
      title: "Airtime", 
      description: "Recharge any network",
      onClick: () => navigate('/quick-purchase/airtime'), 
      color: "emerald" as const
    },
    { 
      id: 'data',
      icon: <Wifi className="w-6 h-6" />, 
      title: "Data", 
      description: "Cheap data bundles",
      onClick: () => navigate('/quick-purchase/data'), 
      color: "green" as const
    },
    { 
      id: 'electricity',
      icon: <Zap className="w-6 h-6" />, 
      title: "Electricity", 
      description: "Pay utility bills",
      onClick: () => navigate('/quick-purchase/electricity'), 
      color: "orange" as const
    },
    { 
      id: 'cable',
      icon: <Tv className="w-6 h-6" />, 
      title: "Cable TV", 
      description: "DStv, GOtv & more",
      onClick: () => navigate('/quick-purchase/cable'), 
      color: "teal" as const
    }
  ];

  const filteredServices = services.filter(service => 
    service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-emerald-100">
      <nav className="px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button 
            onClick={() => navigate('/')} 
            className="group flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-emerald-600 transition-all"
           >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span>Home</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-12">
         <div className="w-full max-w-4xl space-y-12">
            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[0.9]"
              >
                Quick <br /><span className="text-emerald-600">Purchase.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-500 text-xl font-medium max-w-lg mx-auto"
              >
                Select a service to get started. No account required for instant top-ups.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="max-w-md mx-auto relative"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for a service..."
                className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <ServiceCard 
                    key={service.id}
                    icon={service.icon} 
                    title={service.title} 
                    description={service.description}
                    onClick={service.onClick} 
                    color={service.color}
                  />
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-400 font-medium">No services found for "{searchQuery}"</p>
                </div>
              )}
            </motion.div>

            <div className="flex items-center justify-center space-x-8 pt-8 border-t border-gray-100">
               <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Payments</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Instant Delivery</span>
               </div>
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  color: 'emerald' | 'green' | 'orange' | 'teal';
}

const ServiceCard = ({ icon, title, description, onClick, color }: ServiceCardProps) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 hover:border-emerald-200',
    green: 'bg-green-50 text-green-600 hover:border-green-200',
    orange: 'bg-orange-50 text-orange-600 hover:border-orange-200',
    teal: 'bg-teal-50 text-teal-600 hover:border-teal-200'
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-8 rounded-[2.5rem] border-2 border-transparent transition-all text-left flex flex-col gap-6 group bg-white shadow-sm hover:shadow-xl hover:-translate-y-1",
        colors[color]
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
        color === 'emerald' ? 'bg-emerald-100' : color === 'green' ? 'bg-green-100' : color === 'orange' ? 'bg-orange-100' : 'bg-teal-100'
      )}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-sm font-medium text-gray-400 mt-1">{description}</p>
      </div>
      <div className="mt-auto flex justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

export default QuickPurchasePage;
