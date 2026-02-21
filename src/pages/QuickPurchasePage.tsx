import React from 'react';
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
  ChevronRight
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

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans selection:bg-blue-100">
      <nav className="px-6 py-6 lg:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <Logo />
           <button 
            onClick={() => navigate('/')} 
            className="group flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-all"
           >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
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
                Quick <br /><span className="text-blue-600">Purchase.</span>
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

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <ServiceCard 
                icon={<Phone className="w-6 h-6" />} 
                title="Airtime" 
                description="Recharge any network"
                onClick={() => navigate('/quick-purchase/airtime')} 
                color="blue"
              />
              <ServiceCard 
                icon={<Wifi className="w-6 h-6" />} 
                title="Data" 
                description="Cheap data bundles"
                onClick={() => navigate('/quick-purchase/data')} 
                color="purple"
              />
              <ServiceCard 
                icon={<Zap className="w-6 h-6" />} 
                title="Electricity" 
                description="Pay utility bills"
                onClick={() => navigate('/quick-purchase/electricity')} 
                color="orange"
              />
              <ServiceCard 
                icon={<Tv className="w-6 h-6" />} 
                title="Cable TV" 
                description="DStv, GOtv & more"
                onClick={() => navigate('/quick-purchase/cable')} 
                color="pink"
              />
            </motion.div>

            <div className="flex items-center justify-center space-x-8 pt-8 border-t border-gray-100">
               <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Payments</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
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
  color: 'blue' | 'purple' | 'orange' | 'pink';
}

const ServiceCard = ({ icon, title, description, onClick, color }: ServiceCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 hover:border-blue-200',
    purple: 'bg-purple-50 text-purple-600 hover:border-purple-200',
    orange: 'bg-orange-50 text-orange-600 hover:border-orange-200',
    pink: 'bg-pink-50 text-pink-600 hover:border-pink-200'
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
        color === 'blue' ? 'bg-blue-100' : color === 'purple' ? 'bg-purple-100' : color === 'orange' ? 'bg-orange-100' : 'bg-pink-100'
      )}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-sm font-medium text-gray-400 mt-1">{description}</p>
      </div>
      <div className="mt-auto flex justify-end">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

export default QuickPurchasePage;
