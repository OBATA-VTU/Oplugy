import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignUpForm from '../components/SignUpForm';
import Logo from '../components/Logo';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, Globe, Users } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const { signup, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignUpSubmit = async (payload: any): Promise<boolean> => {
    setAuthError(undefined);
    const success = await signup({
      email: payload.email,
      password: payload.password,
      username: payload.username,
      firstName: payload.firstName,
      lastName: payload.lastName,
      referralCode: payload.referralCode,
      phone: payload.phoneNumber
    });
    return success;
  };

  const handleGoogleSignUp = async (): Promise<boolean> => {
    setAuthError(undefined);
    return await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left side: Visual */}
      <div className="hidden lg:block lg:w-[55%] bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-24 text-white">
          <div className="max-w-2xl space-y-16 relative z-10">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center space-x-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white"
              >
                <Users className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Join 100K+ Users</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-6xl xl:text-8xl font-black tracking-tighter leading-[0.85]"
              >
                Start Your <br /><span className="text-gray-950">Journey Now.</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-white/70 font-medium leading-relaxed"
              >
                Unlock Nigeria's most reliable digital utility gateway. Fast recharges, secure payments, and 24/7 automated delivery.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <FeatureCard icon={<ShieldCheck className="w-6 h-6" />} title="Secure" desc="End-to-end encryption" />
               <FeatureCard icon={<Globe className="w-6 h-6" />} title="Reliable" desc="99.9% Uptime SLA" />
               <FeatureCard icon={<Users className="w-6 h-6" />} title="Reseller" desc="Built for growth" />
               <FeatureCard icon={<Zap className="w-6 h-6" />} title="Instant" desc="Sub-second delivery" />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
           <div className="absolute top-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-gray-950/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Right side: Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-12 lg:px-24 xl:px-32 bg-white relative z-10 overflow-y-auto no-scrollbar py-20"
      >
        <div className="mb-16">
          <Logo />
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="space-y-4 mb-12">
            <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.5em]">Registration</h2>
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[0.85]">Create <br />Account.</h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">Join Oplug v2 today and experience the future of digital payments.</p>
          </div>
          
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            onGoogleSignUp={handleGoogleSignUp} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <div className="mt-12 pt-8 border-t border-gray-50">
            <p className="text-center lg:text-left text-sm text-gray-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-blue-600 hover:text-gray-900 transition-all underline underline-offset-4">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
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
    <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-lg">
      {icon}
    </div>
    <h4 className="text-lg font-black tracking-tight mb-1">{title}</h4>
    <p className="text-sm text-white/60 font-medium">{desc}</p>
  </motion.div>
);

export default SignUpPage;