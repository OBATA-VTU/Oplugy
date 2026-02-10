
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
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
  updateWalletBalance: (newBalance: number) => Promise<void>;
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

  const isAuthenticated = !!user;

  // Real-time listener for Auth and Firestore User data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        
        // Subscribe to Firestore changes for real-time wallet balance
        const unsubscribeDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({ ...data, id: firebaseUser.uid });
            setWalletBalance(data.walletBalance || 0);
          }
          setIsLoading(false);
        });

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setToken(null);
        setWalletBalance(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.login(email, password);
    setIsLoading(false);
    
    if (result.status) {
      addNotification('Login successful', 'success');
      return true;
    } else {
      addNotification(result.message || 'Login failed', 'error');
      return false;
    }
  }, [addNotification]);

  const signup = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.signup({ email, password });
    setIsLoading(false);
    
    if (result.status) {
      addNotification('Registration successful! Please login.', 'success');
      return true;
    } else {
      addNotification(result.message || 'Signup failed', 'error');
      return false;
    }
  }, [addNotification]);

  const logout = useCallback(async () => {
    await authService.logout();
    addNotification('Logged out', 'info');
  }, [addNotification]);

  const fetchWalletBalance = useCallback(async () => {
    // Already handled by real-time onSnapshot in useEffect
  }, []);

  const updateWalletBalance = useCallback(async (newBalance: number) => {
    if (user?.id) {
      try {
        await updateDoc(doc(db, "users", user.id), {
          walletBalance: newBalance
        });
      } catch (error) {
        console.error("Error updating balance:", error);
        addNotification('Failed to update balance in cloud.', 'error');
      }
    }
  }, [user, addNotification]);

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
