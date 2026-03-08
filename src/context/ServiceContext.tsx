import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

interface ServicePrice {
  id: string;
  plan_name: string;
  user_price: number;
  network: string;
  type: string;
}

interface ServiceContextType {
  prices: ServicePrice[];
  isLoading: boolean;
  refreshPrices: () => Promise<void>;
  getPricesByService: (type: string, network?: string) => ServicePrice[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchPrices = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Simplified query: remove orderBy to avoid index requirements and potential permission issues
      const q = query(collection(db, 'manual_pricing'));
      const querySnapshot = await getDocs(q);
      const fetchedPrices: ServicePrice[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPrices.push({ id: doc.id, ...doc.data() } as ServicePrice);
      });
      
      // Sort in memory instead
      fetchedPrices.sort((a, b) => (a.plan_name || '').localeCompare(b.plan_name || ''));
      
      setPrices(fetchedPrices);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.warn('[ServiceContext] Firestore permissions denied for "manual_pricing" collection. Please ensure your Firestore security rules allow authenticated users to read this collection.');
      } else {
        console.error('Error fetching prices:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrices();
    }
  }, [isAuthenticated, fetchPrices]);

  const getPricesByService = (type: string, network?: string) => {
    return prices.filter(p => 
      p.type.toLowerCase() === type.toLowerCase() && 
      (!network || p.network.toLowerCase() === network.toLowerCase())
    );
  };

  return (
    <ServiceContext.Provider value={{ prices, isLoading, refreshPrices: fetchPrices, getPricesByService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
