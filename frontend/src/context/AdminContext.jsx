/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storeService } from '../services/storeService';
import { productService } from '../services/productService';
import { adminService } from '../services/adminService';
import { reviewService } from '../services/reviewService';

import { orderService } from '../services/orderService';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // 1. Platform Stores State
  const [stores, setStores] = useState([]);

  // 2. Users Management State
  const [users, setUsers] = useState([]);

  // 3. Global Products Catalog State
  const [globalProducts, setGlobalProducts] = useState([]);

  // 4. Reviews & Moderation State
  const [reviews, setReviews] = useState([]);

  // 5. Subscriptions State
  const [subscriptions, setSubscriptions] = useState([]);

  // 6. Admin Notifications State
  const [notifications, setNotifications] = useState([]);

  // 7. Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({});

  // 8. Platform Orders State
  const [orders, setOrders] = useState([]);

  // Reload admin data from real backend endpoints
  const refreshAdminData = useCallback(async () => {
    try {
      const [storesData, globalProdsData] = await Promise.all([
        storeService.getAllStores().catch(() => []),
        productService.getGlobalProducts().catch(() => []),
      ]);

      if (Array.isArray(storesData)) {
        setStores(
          storesData.map((s) => ({
            ...s,
            status: s.isOpen ? 'Active' : 'Inactive',
            verified: true,
            kycStatus: 'Verified',
            commissionRate: 5.0,
            joinedDate: s.created_at
              ? new Date(s.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
              : 'Recent',
            totalRevenue: '₹0',
            platformNotes: 'Verified platform merchant.',
          }))
        );
      }

      if (Array.isArray(globalProdsData)) {
        setGlobalProducts(globalProdsData);
      }

      if (isAdmin) {
        const [ordersData, usersData, reviewsData, subsData, settingsData, notifsData] = await Promise.all([
          orderService.getOrders().catch(() => []),
          adminService.getUsers().catch(() => []),
          reviewService.getReviews().catch(() => []),
          adminService.getSubscriptions().catch(() => []),
          adminService.getPlatformSettings().catch(() => ({})),
          adminService.getNotifications().catch(() => []),
        ]);

        if (Array.isArray(ordersData)) {
          setOrders(
            ordersData.map((o) => ({
              id: o.order_number || o.id,
              rawId: o.id,
              storeId: o.store_id,
              storeName: o.store_name || 'Store',
              date: o.created_at
                ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              placedAt: o.created_at
                ? new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                : 'Recent',
              status: o.status,
              fulfillmentType: (o.fulfillment_type || 'delivery').toLowerCase(),
              total: parseFloat(o.total_amount || 0).toFixed(2),
              paymentStatus: o.payment_status || 'PENDING',
              paymentMethod: o.payment_method || 'UPI',
              customer: {
                name: o.delivery_recipient_name || 'Customer',
                phone: o.delivery_recipient_phone || 'N/A',
              },
              items: o.items || [],
            }))
          );
        }
        if (Array.isArray(usersData)) setUsers(usersData);
        if (Array.isArray(reviewsData)) setReviews(reviewsData);
        if (Array.isArray(subsData)) setSubscriptions(subsData);
        if (settingsData && typeof settingsData === 'object') setPlatformSettings(settingsData);
        if (Array.isArray(notifsData)) setNotifications(notifsData);
      }
    } catch (err) {
      console.warn('Admin refreshAdminData error:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        await refreshAdminData();
      } catch (err) {
        if (isMounted) {
          console.warn('Admin load error:', err);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [refreshAdminData]);

  const updateStoreStatus = (storeId, newStatus) => {
    setStores((prev) =>
      prev.map((st) => (st.id === storeId ? { ...st, status: newStatus } : st))
    );
  };

  const toggleStoreVerification = (storeId) => {
    setStores((prev) =>
      prev.map((st) => {
        if (st.id === storeId) {
          const nextVerified = !st.verified;
          return {
            ...st,
            verified: nextVerified,
            kycStatus: nextVerified ? 'Verified' : 'Pending Review',
          };
        }
        return st;
      })
    );
  };

  const updateStorePlatformNotes = (storeId, notes) => {
    setStores((prev) =>
      prev.map((st) => (st.id === storeId ? { ...st, platformNotes: notes } : st))
    );
  };

  const updateUserStatus = (userId, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  const updateUserRole = (userId, newRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const addUser = (userData) => {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 99999 00000',
      role: userData.role || 'customer',
      status: 'Active',
      joinedDate: 'Today',
      lastActive: 'Just now',
      avatar: (userData.name || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      ...userData,
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const addGlobalProduct = (productData) => {
    const newProd = {
      id: `prod_${Date.now()}`,
      sku: productData.sku || `GLB-${Date.now().toString().slice(-6)}`,
      title: productData.title,
      brand: productData.brand,
      unit: productData.unit || '1 Unit',
      category: productData.category || 'groceries',
      categoryName: productData.categoryName || 'Groceries & Staples',
      description: productData.description || '',
      image: productData.image || '',
      mrp: Number(productData.mrp) || 0,
      rating: 5.0,
      reviewsCount: 0,
      nutrition: productData.nutrition || {},
      variants: productData.variants || [{ name: productData.unit || 'Standard', priceOffset: 0, default: true }],
      status: 'Active',
    };
    setGlobalProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const updateGlobalProduct = (productId, updates) => {
    setGlobalProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...updates } : p))
    );
  };

  const archiveGlobalProduct = (productId) => {
    setGlobalProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: 'Archived' } : p))
    );
  };

  const updateReviewStatus = (reviewId, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );
  };

  const addModeratorNote = (reviewId, note) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              moderatorNotes: [...(r.moderatorNotes || []), { text: note, date: 'Today' }],
            }
          : r
      )
    );
  };

  const changeStorePlan = (storeId, planId, billingCycle = 'Monthly') => {
    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.storeId === storeId
          ? {
              ...sub,
              planId,
              billingCycle,
              status: 'Active',
            }
          : sub
      )
    );
  };

  const updateSubscriptionStatus = (storeId, status) => {
    setSubscriptions((prev) =>
      prev.map((sub) => (sub.storeId === storeId ? { ...sub, status } : sub))
    );
  };

  const markNotificationRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const dismissNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const broadcastNotification = (data) => {
    const newAlert = {
      id: `ntf_adm_${Date.now()}`,
      type: data.type || 'system',
      severity: data.severity || 'info',
      title: data.title,
      message: data.message,
      timestamp: 'Just now',
      isRead: false,
      actionUrl: data.actionUrl || '/admin',
    };
    setNotifications((prev) => [newAlert, ...prev]);
    return newAlert;
  };

  const updatePlatformSettings = async (newSettings) => {
    setPlatformSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Computed Platform KPIs from actual backend records
  const platformKpis = useMemo(() => {
    const activeStores = stores.filter((s) => s.status === 'Active' || s.isOpen).length;
    const suspendedStores = stores.filter((s) => s.status === 'Suspended').length;
    const pendingReviews = reviews.filter((r) => r.status === 'Pending Review' || r.status === 'pending' || r.status === 'Flagged').length;
    const unreadAlerts = notifications.filter((n) => !n.isRead).length;

    const totalOrders = orders.length;
    const totalGmv = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return {
      totalStores: stores.length,
      activeStores,
      suspendedStores,
      totalUsers: users.length,
      totalGlobalProducts: globalProducts.length,
      totalListings: globalProducts.length,
      pendingReviews,
      unreadAlerts,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'Active' || s.status === 'active').length,
      totalOrders,
      totalGmv,
    };
  }, [stores, reviews, users, globalProducts, notifications, subscriptions, orders]);

  const value = {
    stores,
    updateStoreStatus,
    toggleStoreVerification,
    updateStorePlatformNotes,
    users,
    updateUserStatus,
    updateUserRole,
    addUser,
    globalProducts,
    addGlobalProduct,
    updateGlobalProduct,
    archiveGlobalProduct,
    reviews,
    updateReviewStatus,
    addModeratorNote,
    subscriptions,
    plans: [],
    changeStorePlan,
    updateSubscriptionStatus,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    broadcastNotification,
    platformSettings,
    updatePlatformSettings,
    orders,
    platformKpis,
    refreshAdminData,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
