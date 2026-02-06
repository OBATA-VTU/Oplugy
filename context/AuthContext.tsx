import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Wallet, AuthResponse } from '../types';
import { authService } from '../services/authService';
import { LOCAL_STORAGE_TOKEN_KEY, LOCAL_STORAGE_USER_KEY } from '../constants.ts';
import { useNotifications } from '../hooks/useNotifications';

interface AuthContextType {
  user: User | null;
  token: string | null;
  walletBalance: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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

  // Moved fetchWalletBalance definition before its usage in useEffect
  const fetchWalletBalance = useCallback(async () => {
    if (!token) return;
    try {
      const response = await authService.getWalletBalance();
      if (response.status && response.data) {
        setWalletBalance(response.data.balance);
      } else {
        // If the token is invalid or expired, log out the user
        if (response.message === 'Unauthorized' || response.message === 'Token expired') {
          addNotification('Session expired. Please log in again.', 'error');
          authService.logout();
          setToken(null);
          setUser(null);
          setWalletBalance(null);
        } else {
          addNotification(response.message || 'Failed to fetch wallet balance', 'error');
        }
      }
    } catch (error: any) {
      addNotification(error.message || 'Error fetching wallet balance', 'error');
    }
  }, [token, addNotification]);

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
    const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletBalance();
    } else {
      setWalletBalance(null);
    }
  }, [isAuthenticated, fetchWalletBalance]);


  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.status && response.data) {
        setToken(response.data.token);
        setUser(response.data.user);
        addNotification('Login successful!', 'success');
        return true;
      } else {
        addNotification(response.message || 'Login failed', 'error');
        return false;
      }
    } catch (error: any) {
      addNotification(error.message || 'An error occurred during login', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    setWalletBalance(null);
    addNotification('Logged out successfully.', 'info');
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
    logout,
    fetchWalletBalance,
    updateWalletBalance,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};