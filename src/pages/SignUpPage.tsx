import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignUpForm from '../components/SignUpForm';

const SignUpPage: React.FC = () => {
  const { signup, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <SignUpForm 
        onSubmit={handleSignUpSubmit} 
        onGoogleSignUp={handleGoogleSignUp} 
        isLoading={isLoading} 
        error={authError} 
      />
      <p className="mt-6 text-center text-sm text-white">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-200 hover:text-white transition-colors">
          Login
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;