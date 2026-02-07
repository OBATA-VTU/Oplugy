
import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { NotificationState } from '../types';

interface NotificationContextType {
  notifications: NotificationState[];
  addNotification: (message: string, type?: NotificationState['type']) => void;
  removeNotification: (id: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = useCallback((message: string, type: NotificationState['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
  };

  return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};
