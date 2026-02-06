import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (email: string, password: string): Promise<boolean> => {
    setAuthError(undefined); // Clear previous errors
    const success = await login(email, password);
    if (!success) {
      setAuthError("Invalid credentials or an unexpected error occurred. Please try again.");
    }
    return success;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <AuthForm onSubmit={handleLoginSubmit} isLoading={isLoading} error={authError} />
    </div>
  );
};

export default LoginPage;