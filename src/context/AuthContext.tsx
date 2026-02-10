
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { useNotifications } from '../hooks/useNotifications';

interface AuthContextType {
  user: any | null;
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
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addNotification } = useNotifications();

  const isAuthenticated = !!token && !!user;

  // Initialize session from storage
  useEffect(() => {
    const initSession = () => {
      const storedToken = authService.getToken();
      const storedUser = authService.getUser();
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        // Balance is stored with the user object for quick access
        if ((storedUser as any).walletBalance !== undefined) {
          setWalletBalance((storedUser as any).walletBalance);
        }
      }
      setIsLoading(false);
    };
    initSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.login(email, password);
    
    if (result.status && result.data) {
      setToken(result.data.token);
      setUser(result.data.user);
      setWalletBalance(result.data.user.walletBalance);
      addNotification(result.message || 'Login successful', 'success');
      setIsLoading(false);
      return true;
    } else {
      addNotification(result.message || 'Login failed', 'error');
      setIsLoading(false);
      return false;
    }
  }, [addNotification]);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.signup({ email, password });
    
    if (result.status) {
      addNotification(result.message || 'Account created!', 'success');
      setIsLoading(false);
      return true;
    } else {
      addNotification(result.message || 'Signup failed', 'error');
      setIsLoading(false);
      return false;
    }
  }, [addNotification]);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setWalletBalance(null);
    addNotification('Logged out successfully', 'info');
  }, [addNotification]);

  const fetchWalletBalance = useCallback(async () => {
    // This will eventually call /api/auth/me to get fresh data
    if (user) {
      // For now, use the value from our current user state
      // This is populated during login
    }
  }, [user]);

  const updateWalletBalance = useCallback((newBalance: number) => {
    setWalletBalance(newBalance);
    if (user) {
      const updatedUser = { ...user, walletBalance: newBalance };
      setUser(updatedUser);
      authService.saveSession(token!, updatedUser);
    }
  }, [user, token]);

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
