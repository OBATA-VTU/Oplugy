
import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { useNotifications } from '../hooks/useNotifications';

interface AuthContextType {
  user: User | null;
  token: string | null;
  walletBalance: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>; // Added signup
  logout: () => void;
  fetchWalletBalance: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// --- TESTING SETUP: Authentication is bypassed ---
const MOCK_USER: User = { id: 'test-user-01', email: 'tester@oplug.com' };
const MOCK_TOKEN = 'test-auth-token';
const MOCK_BALANCE = 50000;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user] = useState<User | null>(MOCK_USER);
  const [token] = useState<string | null>(MOCK_TOKEN);
  const [walletBalance, setWalletBalance] = useState<number | null>(MOCK_BALANCE);
  const [isLoading] = useState<boolean>(false); // Start with loading false
  const { addNotification } = useNotifications();

  const isAuthenticated = !!token && !!user;

  // Mocked fetch wallet balance
  const fetchWalletBalance = useCallback(async () => {
    // In test mode, we just ensure the balance is set.
    if (walletBalance === null) {
        setWalletBalance(MOCK_BALANCE);
    }
    // No actual API call is needed for testing.
    return Promise.resolve();
  }, [walletBalance]);

  // The useEffect for loading from localStorage is removed to enforce the mock state.

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    addNotification('Login is disabled in testing mode.', 'info');
    return false;
  }, [addNotification]);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    addNotification('Signup is disabled in testing mode.', 'info');
    return false;
  }, [addNotification]);

  const logout = useCallback(() => {
    // Does nothing in testing mode to prevent being logged out.
    addNotification('Logout is disabled in testing mode.', 'info');
  }, [addNotification]);

  const updateWalletBalance = useCallback((newBalance: number) => {
    setWalletBalance(newBalance);
  }, []);

  const contextValue = {
    user,
    token,
    walletBalance,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    fetchWalletBalance,
    updateWalletBalance,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
