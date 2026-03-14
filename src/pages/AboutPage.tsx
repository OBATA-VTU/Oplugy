import React from 'react';
import { Globe, Shield, Zap, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="mb-32">
        <h1 className="text-7xl lg:text-[10vw] font-black tracking-tighter uppercase leading-[0.85] mb-12">
          Our <br />
          <span className="text-emerald-600">Mission.</span>
        </h1>
        <p className="text-3xl lg:text-5xl font-black tracking-tight leading-tight text-gray-500 dark:text-gray-400 max-w-4xl">
          We are building the infrastructure for digital payments in Nigeria. Fast, reliable, and accessible to everyone.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-24 items-center mb-48">
        <div className="space-y-12">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-600/20">
              <Zap size={32} />
            </div>
            <h2 className="text-4xl font-black tracking-tight uppercase">Speed First</h2>
          </div>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Oplug was born out of a simple frustration: why does it take so long to buy data? We've built a platform that processes transactions in milliseconds, not minutes.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-12">
             <div className="space-y-2">
                <p className="text-5xl font-black tracking-tighter">50K+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Users</p>
             </div>
             <div className="space-y-2">
                <p className="text-5xl font-black tracking-tighter">100K+</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Daily Orders</p>
             </div>
          </div>
        </div>
        <div className="aspect-square rounded-[4rem] overflow-hidden border border-gray-100 dark:border-white/5">
          <img 
            src="https://picsum.photos/seed/about/1000/1000" 
            alt="About Oplug" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <ValueCard 
          icon={<Shield className="w-8 h-8" />}
          title="Security"
          desc="Your data and funds are protected by enterprise-grade encryption and security protocols."
        />
        <ValueCard 
          icon={<Globe className="w-8 h-8" />}
          title="Accessibility"
          desc="We believe digital services should be available to everyone, regardless of their location or device."
        />
        <ValueCard 
          icon={<Users className="w-8 h-8" />}
          title="Community"
          desc="We're more than just a platform; we're a community of users and resellers building a better future."
        />
      </div>
    </div>
  );
};

const ValueCard = ({ icon, title, desc }: any) => (
  <div className="p-12 bg-gray-50 dark:bg-white/2 rounded-[3rem] border border-gray-100 dark:border-white/5 space-y-8 group hover:bg-emerald-600 transition-all duration-700">
    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-white group-hover:text-emerald-600 transition-all">
      {icon}
    </div>
    <h3 className="text-3xl font-black tracking-tight uppercase group-hover:text-white transition-colors">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed group-hover:text-white/70 transition-colors">{desc}</p>
  </div>
);

export default AboutPage;
