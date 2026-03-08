import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
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

  const fetchPrices = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'manual_pricing'), orderBy('plan_name', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedPrices: ServicePrice[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPrices.push({ id: doc.id, ...doc.data() } as ServicePrice);
      });
      setPrices(fetchedPrices);
    } catch (error) {
      console.error('Error fetching prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPrices();
    }
  }, [isAuthenticated]);

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
