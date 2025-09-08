import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification, StatusType } from '@/types';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationContextType {
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };

      setNotifications(prev => [...prev, newNotification]);

      // Auto-remove notification after duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, notification.duration || 5000);
      }
    },
    [removeNotification]
  );

  const getStatusIcon = (type: StatusType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-info-600" />;
      default:
        return <Info className="w-5 h-5 text-tech-600" />;
    }
  };

  const getStatusClasses = (type: StatusType) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-800';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-800';
      case 'warning':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'info':
        return 'bg-info-50 border-info-200 text-info-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <NotificationContext.Provider
      value={{ addNotification, removeNotification }}
    >
      {children}

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out ${getStatusClasses(notification.type)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium">{notification.title}</h4>
              {notification.message && (
                <p className="text-sm mt-1 opacity-90">
                  {notification.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
