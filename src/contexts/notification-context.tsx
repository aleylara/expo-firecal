/**
 * Notification Context
 *
 * Manages in-app toast notifications (not push notifications).
 *
 * Features:
 * - Four notification types: info, success, warning, error
 * - Auto-dismiss with configurable duration
 * - Persistent notifications (won't show again once dismissed)
 * - Acknowledgment tracking via SafeStorage
 *
 * Usage:
 * - useNotify() for simple notifications: notify.success('Title', 'Message')
 * - useNotifications() for full control over notification lifecycle
 */
import { SafeStorage } from '@/utils/safe-storage';
import React, { createContext, useCallback, useContext, useState } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistentId?: string; // If set, notification won't show again once dismissed
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
  clearAll: () => void;
  hasAcknowledged: (persistentId: string) => Promise<boolean>;
  resetAcknowledged: (persistentId?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const STORAGE_KEY = 'acknowledged_notifications';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const hasAcknowledged = useCallback(
    async (persistentId: string): Promise<boolean> => {
      try {
        const stored = await SafeStorage.getItem(STORAGE_KEY, 'other');
        return stored?.[persistentId] === true;
      } catch {
        return false;
      }
    },
    [],
  );

  const markAsAcknowledged = useCallback(async (persistentId: string) => {
    try {
      const stored = await SafeStorage.getItem(STORAGE_KEY, 'other');
      const updated = { ...stored, [persistentId]: true };
      await SafeStorage.setItem(STORAGE_KEY, updated, 'other');
    } catch (error) {
      console.warn('Failed to save acknowledged notification:', error);
    }
  }, []);

  const hideNotification = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === id);

        // Mark persistent notifications as acknowledged when dismissed
        if (notification?.persistentId) {
          markAsAcknowledged(notification.persistentId);
        }

        return prev.filter((n) => n.id !== id);
      });
    },
    [markAsAcknowledged],
  );

  const showNotification = useCallback(
    async (notification: Omit<Notification, 'id'>) => {
      // Check if this persistent notification was already acknowledged
      if (notification.persistentId) {
        const acknowledged = await hasAcknowledged(notification.persistentId);
        if (acknowledged) {
          return; // Don't show it again
        }
      }

      const id = `${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 3000,
      };

      setNotifications((prev) => [...prev, newNotification]);

      if (newNotification.duration && newNotification.duration > 0) {
        const timer = setTimeout(() => {
          hideNotification(id);
        }, newNotification.duration);

        // Store timer for cleanup
        return () => clearTimeout(timer);
      }
    },
    [hasAcknowledged, hideNotification],
  );

  const clearAll = useCallback(() => {
    setNotifications((prev) => {
      // Mark all persistent notifications as acknowledged
      prev.forEach((n) => {
        if (n.persistentId) {
          markAsAcknowledged(n.persistentId);
        }
      });
      return [];
    });
  }, [markAsAcknowledged]);

  const resetAcknowledged = useCallback(async (persistentId?: string) => {
    try {
      if (persistentId) {
        // Reset specific notification
        const stored = await SafeStorage.getItem(STORAGE_KEY, 'other');
        const updated = { ...stored };
        delete updated[persistentId];
        await SafeStorage.setItem(STORAGE_KEY, updated, 'other');
      } else {
        // Reset all
        await SafeStorage.setItem(STORAGE_KEY, {}, 'other');
      }
    } catch (error) {
      console.warn('Failed to reset acknowledged notifications:', error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        hideNotification,
        clearAll,
        hasAcknowledged,
        resetAcknowledged,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
}

// Quick helper for simple notifications
export function useNotify() {
  const { showNotification } = useNotifications();

  return {
    success: (title: string, message?: string) =>
      showNotification({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      showNotification({ type: 'error', title, message }),
    info: (title: string, message?: string) =>
      showNotification({ type: 'info', title, message }),
    warning: (title: string, message?: string) =>
      showNotification({ type: 'warning', title, message }),
  };
}
