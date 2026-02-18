
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignUpForm from '../components/SignUpForm';
import Logo from '../components/Logo';

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
    const success = await signup(payload.email, payload.password, payload.fullName, payload.username, payload.referralCode);
    if (!success) {
      setAuthError("Registration failed. Please ensure username is unique.");
    }
    return success;
  };

  const handleGoogleSignUp = async (): Promise<boolean> => {
    setAuthError(undefined);
    return await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-1/2 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="text-white text-center">
            <h2 className="text-6xl font-black mb-8 tracking-tighter">Become a Plug.</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-md mx-auto">Access the best data rates and a secure wallet for all your daily subscriptions.</p>
            <div className="bg-white/10 p-10 rounded-[3rem] border border-white/20 backdrop-blur-xl">
               <div className="text-sm font-black uppercase tracking-widest mb-4">Total Value Delivered</div>
               <div className="text-5xl font-black">₦1.2 Billion+</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        <div className="mb-12"><Logo /></div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Create Account</h1>
          <p className="text-gray-500 mb-10">Start your journey with OBATA v2 and enjoy automated delivery.</p>
          
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            onGoogleSignUp={handleGoogleSignUp} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <p className="mt-8 text-center lg:text-left text-sm text-gray-600">
            Already a member?{' '}
            <Link to="/login" className="font-black text-blue-600 hover:underline transition-colors">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
