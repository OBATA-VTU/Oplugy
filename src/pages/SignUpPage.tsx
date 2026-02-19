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
    // signup now correctly expects 4 arguments after AuthContext fix
    const success = await signup(payload.email, payload.password, payload.username, payload.referralCode);
    return success;
  };

  const handleGoogleSignUp = async (): Promise<boolean> => {
    setAuthError(undefined);
    return await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side: Visual branding */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="text-white text-center">
            <h2 className="text-6xl font-black mb-8 tracking-tighter">Join the Family.</h2>
            <p className="text-xl text-blue-100 mb-12 max-w-md mx-auto">
              Unlock Nigeria's most reliable digital utility gateway. Fast recharges, secure payments, and 24/7 automated delivery.
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-left max-w-sm mx-auto">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="font-bold">Instant Wallet Funding</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="font-bold">Automated 24/7 Node</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right side: Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="mb-12">
          <Logo />
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Create Account</h1>
          <p className="text-gray-500 mb-10">Start your journey with OBATA v2 today.</p>
          
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            onGoogleSignUp={handleGoogleSignUp} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <p className="mt-8 text-center lg:text-left text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;