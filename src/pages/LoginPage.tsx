import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <AuthForm 
        onSubmit={handleLoginSubmit} 
        onGoogleLogin={handleGoogleLogin} 
        isLoading={isLoading} 
        error={authError} 
      />
      <p className="mt-6 text-center text-sm text-white">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-200 hover:text-white transition-colors">
          Sign Up
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;