
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useNotifications } from '../hooks/useNotifications';

// --- Hardcoded Credentials ---
const MOCK_EMAIL = 'user@oplug.com';
const MOCK_PASSWORD = 'P@ssword123!';
const MOCK_USER: User = { id: 'mock-user-123', email: MOCK_EMAIL };
const MOCK_TOKEN = 'mock-auth-token-for-session-management';
const MOCK_WALLET_BALANCE = 50000;

interface AuthContextType {
  user: User | null;
  token: string | null;
  walletBalance: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchWalletBalance: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addNotification } = useNotifications();

  const isAuthenticated = !!token && !!user;

  // Check for existing session on initial app load
  useEffect(() => {
    const checkUserSession = () => {
      setIsLoading(true);
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();

      if (storedToken === MOCK_TOKEN && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        setWalletBalance(MOCK_WALLET_BALANCE); // Restore balance on session load
      }
      setIsLoading(false);
    };
    checkUserSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(res => setTimeout(res, 500));

    if (email.toLowerCase() === MOCK_EMAIL && password === MOCK_PASSWORD) {
      setUser(MOCK_USER);
      setToken(MOCK_TOKEN);
      setWalletBalance(MOCK_WALLET_BALANCE);
      authService.saveSession(MOCK_TOKEN, MOCK_USER);
      addNotification('Login successful!', 'success');
      setIsLoading(false);
      return true;
    } else {
      addNotification('Invalid credentials.', 'error');
      setIsLoading(false);
      return false;
    }
  }, [addNotification]);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 500));
    addNotification('Sign up is disabled in this version.', 'info');
    setIsLoading(false);
    return false;
  }, [addNotification]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setWalletBalance(null);
    addNotification('You have been logged out.', 'info');
  }, [addNotification]);
  
  const fetchWalletBalance = useCallback(async () => {
    // In this mock version, we just ensure the balance is set if authenticated.
    if (isAuthenticated) {
      setWalletBalance(MOCK_WALLET_BALANCE);
    }
  }, [isAuthenticated]);

  const updateWalletBalance = useCallback((newBalance: number) => {
    // This allows services to optimistically update the balance after a purchase
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
