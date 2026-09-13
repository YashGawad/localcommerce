/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_STORES } from '../data/stores';
import { GLOBAL_PRODUCTS, STORE_LISTINGS } from '../data/products';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_REVIEWS,
  SAAS_PLANS,
  INITIAL_STORE_SUBSCRIPTIONS,
  INITIAL_ADMIN_NOTIFICATIONS,
  INITIAL_PLATFORM_SETTINGS,
} from '../data/adminMockData';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // 1. Platform Stores State
  const [stores, setStores] = useState(() =>
    MOCK_STORES.map((s) => ({
      ...s,
      status: s.isOpen ? 'Active' : (s.id === 'store_04' ? 'Suspended' : 'Inactive'),
      verified: s.id !== 'store_04',
      kycStatus: s.id === 'store_04' ? 'Pending Review' : 'Verified',
      commissionRate: s.id === 'store_01' ? 3.5 : 5.0,
      joinedDate: 'Jan 2024',
      totalRevenue: s.id === 'store_01' ? '₹4,82,400' : (s.id === 'store_02' ? '₹3,94,200' : '₹1,24,000'),
      platformNotes: s.id === 'store_04' ? 'Temporary operational suspension due to repeated delivery delay complaints.' : 'Standard compliant merchant.',
    }))
  );

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

  // 2. Users Management State
  const [users, setUsers] = useState(INITIAL_ADMIN_USERS);

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
      avatar: userData.name
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

  // 3. Global Products Catalog State
  const [globalProducts, setGlobalProducts] = useState(GLOBAL_PRODUCTS);

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
      image:
        productData.image ||
        'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
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

  // 4. Reviews & Moderation State
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);

  const updateReviewStatus = (reviewId, newStatus) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, status: newStatus } : r))
    );
  };

  const addModeratorNote = (reviewId, note) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, moderatorNote: note } : r))
    );
  };

  // 5. Subscriptions State
  const [subscriptions, setSubscriptions] = useState(INITIAL_STORE_SUBSCRIPTIONS);
  const plans = SAAS_PLANS;

  const changeStorePlan = (storeId, planId, billingCycle = 'Monthly') => {
    const selectedPlan = plans.find((p) => p.id === planId) || plans[0];
    const amount = billingCycle === 'Annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;

    setSubscriptions((prev) =>
      prev.map((sub) =>
        sub.storeId === storeId
          ? {
              ...sub,
              planId: selectedPlan.id,
              planName: selectedPlan.name,
              billingCycle,
              amount,
              status: 'Active',
              listingsLimit: selectedPlan.maxListings,
              renewalDate: '01 Oct 2026',
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

  // 6. Admin Notifications State
  const [notifications, setNotifications] = useState(INITIAL_ADMIN_NOTIFICATIONS);

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

  // 7. Platform Settings State
  const [platformSettings, setPlatformSettings] = useState(INITIAL_PLATFORM_SETTINGS);

  const updatePlatformSettings = (newSettings) => {
    setPlatformSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Computed Platform KPIs
  const platformKpis = useMemo(() => {
    const activeStores = stores.filter((s) => s.status === 'Active').length;
    const suspendedStores = stores.filter((s) => s.status === 'Suspended').length;
    const pendingReviews = reviews.filter((r) => r.status === 'Pending Review' || r.status === 'Flagged').length;
    const totalListings = Object.values(STORE_LISTINGS).reduce((sum, list) => sum + list.length, 0);
    const unreadAlerts = notifications.filter((n) => !n.isRead).length;

    return {
      totalStores: stores.length,
      activeStores,
      suspendedStores,
      totalUsers: users.length,
      totalGlobalProducts: globalProducts.length,
      totalListings,
      pendingReviews,
      unreadAlerts,
      activeSubscriptions: subscriptions.filter((s) => s.status === 'Active').length,
    };
  }, [stores, reviews, users, globalProducts, notifications, subscriptions]);

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
    plans,
    changeStorePlan,
    updateSubscriptionStatus,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    broadcastNotification,
    platformSettings,
    updatePlatformSettings,
    platformKpis,
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
