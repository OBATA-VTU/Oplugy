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
  loginWithGoogle: () => Promise<boolean>;
  // Updated signup signature to match authService.signup requirements
  signup: (email: string, password: string, fullName: string, username: string, referralCode?: string) => Promise<boolean>;
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        
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

  const loginWithGoogle = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.loginWithGoogle();
    setIsLoading(false);
    
    if (result.status) {
      addNotification('Google login successful', 'success');
      return true;
    } else {
      addNotification(result.message || 'Google login failed', 'error');
      return false;
    }
  }, [addNotification]);

  // Updated signup to pass required fullName and username fields
  const signup = useCallback(async (email: string, password: string, fullName: string, username: string, referralCode?: string): Promise<boolean> => {
    setIsLoading(true);
    const result = await authService.signup({ email, password, fullName, username, referralCode });
    setIsLoading(false);
    
    if (result.status) {
      addNotification('Registration successful!', 'success');
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

  const fetchWalletBalance = useCallback(async () => {}, []);

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
    loginWithGoogle,
    signup,
    logout,
    fetchWalletBalance,
    updateWalletBalance,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};