
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';
import Logo from '../components/Logo';

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
    <div className="min-h-screen flex bg-white">
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="mb-12">
          <Logo />
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-gray-500 mb-10">Enter your credentials to access your OBATA v2 dashboard.</p>
          
          <AuthForm 
            onSubmit={handleLoginSubmit} 
            onGoogleLogin={handleGoogleLogin} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <p className="mt-8 text-center lg:text-left text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign Up for Free
            </Link>
          </p>
        </div>
      </div>

      {/* Right side: Visual */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="text-white text-center">
            <h2 className="text-5xl font-extrabold mb-8">Fastest VTU in Nigeria</h2>
            <p className="text-xl text-blue-100 mb-12">Join 100,000+ users who trust OBATA for their daily digital needs.</p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
               <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Transaction Successful</div>
                    <div className="text-sm text-blue-200">MTN 2GB Data - 2s ago</div>
                  </div>
               </div>
               <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <div className="text-left">
                    <div className="font-bold">Wallet Funded</div>
                    <div className="text-sm text-blue-200">₦10,000.00 - Just now</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default LoginPage;
