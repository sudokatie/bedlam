'use client';

import { memo } from 'react';
import { Notification } from '../game/types';

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const TYPE_COLORS = {
  success: 'bg-green-600 border-green-400',
  warning: 'bg-yellow-600 border-yellow-400',
  error: 'bg-red-600 border-red-400',
  info: 'bg-blue-600 border-blue-400',
};

function Notifications({ notifications, onDismiss }: NotificationsProps) {
  if (notifications.length === 0) return null;
  
  // Only show the most recent 5
  const visibleNotifications = notifications.slice(-5);
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          onClick={() => onDismiss(notification.id)}
          className={`
            px-4 py-2 rounded-lg border-l-4 text-white text-sm 
            cursor-pointer shadow-lg animate-slide-in
            ${TYPE_COLORS[notification.type]}
          `}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
}

export default memo(Notifications);
