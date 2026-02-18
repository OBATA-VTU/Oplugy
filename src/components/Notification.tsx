
import React, { useEffect, useState } from 'react';
import { NotificationState } from '../types';

interface NotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 400);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const bgStyles = {
    success: 'bg-white border-green-500 text-green-700 shadow-green-100',
    error: 'bg-white border-red-500 text-red-700 shadow-red-100',
    info: 'bg-white border-blue-600 text-blue-700 shadow-blue-100',
    warning: 'bg-white border-yellow-500 text-yellow-700 shadow-yellow-100',
  };

  const iconColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-600',
    warning: 'bg-yellow-500',
  };

  return (
    <div
      className={`flex items-center p-5 rounded-[1.5rem] border-l-8 shadow-2xl transition-all duration-500 ease-out transform ${
        bgStyles[notification.type]
      } ${isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-12 scale-90'}`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg ${iconColors[notification.type]}`}>
        {icons[notification.type]}
      </div>
      <div className="flex-grow">
        <p className="text-[11px] font-black uppercase tracking-widest opacity-40 mb-0.5">{notification.type}</p>
        <p className="font-bold text-sm leading-tight text-gray-900">{notification.message}</p>
      </div>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 400); }} className="ml-4 p-2 text-gray-300 hover:text-gray-900 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
