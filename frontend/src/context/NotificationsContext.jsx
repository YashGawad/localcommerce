/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCatalog } from './CatalogContext';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { currentStore } = useCatalog();
  const currentStoreId = currentStore?.id;
  const [notificationsMap, setNotificationsMap] = useState({});

  // Notifications belonging to the currently active store
  const notifications = useMemo(() => {
    if (!currentStoreId) return [];
    return notificationsMap[currentStoreId] || [];
  }, [notificationsMap, currentStoreId]);

  // Unread count strictly for the active store
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  /**
   * Mark a single notification as read
   */
  const markAsRead = (id) => {
    setNotificationsMap((prev) => {
      const storeList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: storeList.map((item) =>
          item.id === id ? { ...item, read: true } : item
        ),
      };
    });
  };

  /**
   * Mark all notifications in the active store as read
   */
  const markAllAsRead = () => {
    setNotificationsMap((prev) => {
      const storeList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: storeList.map((item) => ({ ...item, read: true })),
      };
    });
  };

  /**
   * Dismiss/delete a notification
   */
  const deleteNotification = (id) => {
    setNotificationsMap((prev) => {
      const storeList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: storeList.filter((item) => item.id !== id),
      };
    });
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
