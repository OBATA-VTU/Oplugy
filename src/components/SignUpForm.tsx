import React, { useState } from 'react';
import Spinner from './Spinner';

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  error?: string;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError(undefined);
    await onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
      <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Create Your Oplug Account</h2>
      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
      {passwordError && <p className="text-red-600 text-center mb-4">{passwordError}</p>}
      
      <div className="mb-6">
        <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          placeholder="your@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="mb-8">
        <label htmlFor="confirm-password" aria-label="Confirm Password" className="block text-gray-700 text-sm font-semibold mb-2">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirm-password"
          className={`shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${passwordError ? 'border-red-500 focus:ring-red-400' : 'focus:ring-blue-400'}`}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignUpForm;