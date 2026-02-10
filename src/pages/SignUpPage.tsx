
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

  const handleSignUpSubmit = async (email: string, password: string): Promise<boolean> => {
    setAuthError(undefined);
    const success = await signup(email, password);
    if (!success) {
      setAuthError("Registration failed. Please try again.");
    }
    return success;
  };

  const handleGoogleSignUp = async (): Promise<boolean> => {
    setAuthError(undefined);
    const success = await loginWithGoogle();
    return success;
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Right side: Visual (Swapped for variety) */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-bl from-indigo-700 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <div className="text-white text-center">
            <h2 className="text-5xl font-extrabold mb-8">Start Your Journey</h2>
            <p className="text-xl text-indigo-100 mb-12">Get the best rates on data and airtime. No hidden charges.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">99%</div>
                <div className="text-sm text-indigo-200">Success Rate</div>
              </div>
              <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">Instant</div>
                <div className="text-sm text-indigo-200">Delivery</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="mb-12">
          <Logo />
        </div>
        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Create Account</h1>
          <p className="text-gray-500 mb-10">Join Oplug today and start saving on your digital expenses.</p>
          
          <SignUpForm 
            onSubmit={handleSignUpSubmit} 
            onGoogleSignUp={handleGoogleSignUp} 
            isLoading={isLoading} 
            error={authError} 
          />
          
          <p className="mt-8 text-center lg:text-left text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Login to Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
