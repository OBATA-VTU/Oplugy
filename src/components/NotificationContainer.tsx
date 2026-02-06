import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-0 right-0 z-[100] p-4 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
