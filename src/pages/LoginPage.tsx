
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';
import Logo from '../components/Logo';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Globe, Users } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (email: string, password: string): Promise<boolean> => {
    setAuthError(undefined);
    const success = await login(email, password);
    if (!success) {
      setAuthError("Invalid credentials. Please try again.");
    }
    return success;
  };

  const handleGoogleLogin = async (): Promise<boolean> => {
    setAuthError(undefined);
    const success = await loginWithGoogle();
    return success;
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left side: Form */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white relative z-10"
      >
        <div className="mb-16">
          <Logo />
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="space-y-4 mb-12">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Authentication</h2>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.85]">Welcome <br />Back.</h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">Access your OBATA v2 dashboard to manage your digital assets.</p>
          </div>
          
          <AuthForm 
            onSubmit={handleLoginSubmit} 
            onGoogleLogin={handleGoogleLogin} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <div className="mt-12 pt-8 border-t border-gray-50">
            <p className="text-center lg:text-left text-sm text-gray-500 font-medium">
              New to the platform?{' '}
              <Link to="/signup" className="font-black text-blue-600 hover:text-gray-900 transition-all underline underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right side: Visual */}
      <div className="hidden lg:block lg:w-[55%] bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent_70%)]"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-white">
          <div className="max-w-2xl space-y-16 relative z-10">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-blue-400"
              >
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Hyper-Fast Fulfillment</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl xl:text-8xl font-black tracking-tighter leading-[0.85]"
              >
                The Future of <br /><span className="text-blue-600">VTU is Here.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/40 font-medium leading-relaxed"
              >
                Join over 100,000+ users who trust OBATA for their daily digital needs. Secure, automated, and lightning fast.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Military Grade" desc="End-to-end encryption" />
               <FeatureCard icon={<Globe className="w-6 h-6" />} title="Global API" desc="Connect from anywhere" />
               <FeatureCard icon={<Users className="w-6 h-6" />} title="Reseller Tier" desc="Built for business" />
               <FeatureCard icon={<Zap className="w-6 h-6" />} title="Instant" desc="Sub-second delivery" />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
           <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all group"
  >
    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg shadow-blue-600/20">
      {icon}
    </div>
    <h4 className="text-lg font-black tracking-tight mb-1">{title}</h4>
    <p className="text-sm text-white/40 font-medium">{desc}</p>
  </motion.div>
);

export default LoginPage;
