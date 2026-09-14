/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { useCatalog } from './CatalogContext';
import orderService from '../services/orderService';
import staffService from '../services/staffService';
import deliveryService from '../services/deliveryService';

const OperationsContext = createContext(null);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

export function OperationsProvider({ children }) {
  const { currentStore } = useCatalog();

  // Multi-store orders state (keyed by storeId; loaded strictly from backend)
  const [ordersMap, setOrdersMap] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Store-specific customer relationship metadata (notes, tags)
  const [customerMeta, setCustomerMeta] = useState({});

  // Store staff list (loaded strictly from backend)
  const [staffList, setStaffList] = useState([]);

  const currentStoreId = currentStore?.id;

  // Fetch live store orders if current store is a backend UUID
  const refreshOrders = useCallback(async () => {
    if (!currentStoreId || !isUUID(currentStoreId)) return;
    try {
      const liveOrders = await orderService.getOrders({ store_id: currentStoreId });
      if (Array.isArray(liveOrders)) {
        setOrdersMap((prev) => ({
          ...prev,
          [currentStoreId]: liveOrders,
        }));
        setOrdersError(null);
      }
    } catch (err) {
      console.warn('Could not load live store orders:', err.message);
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  }, [currentStoreId]);

  // Fetch live store staff if current store is a backend UUID
  const refreshStaff = useCallback(async () => {
    if (!currentStoreId || !isUUID(currentStoreId)) return;
    try {
      const liveStaff = await staffService.getStoreStaff(currentStoreId);
      if (Array.isArray(liveStaff)) {
        const mapped = liveStaff.map((s) => ({
          id: s.id,
          userId: s.user_id,
          storeId: s.store_id,
          name: s.name,
          email: s.email,
          phone: s.phone || '',
          role: s.role === 'delivery_staff' ? 'Delivery Staff' : s.role === 'manager' ? 'Manager' : s.role === 'owner' ? 'Owner' : 'Staff',
          rawRole: s.role,
          roleLabel: s.role === 'delivery_staff' ? 'Delivery Associate' : s.role === 'manager' ? 'Store Manager' : s.role === 'owner' ? 'Store Owner' : 'Staff Associate',
          status: s.status === 'active' ? 'Active' : 'Inactive',
          scope: s.role === 'delivery_staff' ? 'Local Delivery Fleet & Order Dispatch' : s.role === 'manager' ? 'Catalog, Orders, Inventory, Staff' : 'Store Floor Operations',
          avatar: (s.name || 'S').split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2),
          joinedDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active',
          deliveriesCount: 0,
        }));
        setStaffList((prev) => {
          const others = prev.filter((item) => item.storeId !== currentStoreId);
          return [...mapped, ...others];
        });
      }
    } catch (err) {
      console.warn('Could not load live store staff:', err.message);
    }
  }, [currentStoreId]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!currentStoreId || !isUUID(currentStoreId)) return;
      try {
        const [liveOrders, liveStaff] = await Promise.all([
          orderService.getOrders({ store_id: currentStoreId }).catch((err) => {
            console.warn('Could not load live store orders:', err.message);
            return null;
          }),
          staffService.getStoreStaff(currentStoreId).catch((err) => {
            console.warn('Could not load live store staff:', err.message);
            return null;
          }),
        ]);

        if (isMounted) {
          if (Array.isArray(liveOrders)) {
            setOrdersMap((prev) => ({
              ...prev,
              [currentStoreId]: liveOrders,
            }));
            setOrdersError(null);
          }
          if (Array.isArray(liveStaff)) {
            const mapped = liveStaff.map((s) => ({
              id: s.id,
              userId: s.user_id,
              storeId: s.store_id,
              name: s.name,
              email: s.email,
              phone: s.phone || '',
              role: s.role === 'delivery_staff' ? 'Delivery Staff' : s.role === 'manager' ? 'Manager' : s.role === 'owner' ? 'Owner' : 'Staff',
              rawRole: s.role,
              roleLabel: s.role === 'delivery_staff' ? 'Delivery Associate' : s.role === 'manager' ? 'Store Manager' : s.role === 'owner' ? 'Store Owner' : 'Staff Associate',
              status: s.status === 'active' ? 'Active' : 'Inactive',
              scope: s.role === 'delivery_staff' ? 'Local Delivery Fleet & Order Dispatch' : s.role === 'manager' ? 'Catalog, Orders, Inventory, Staff' : 'Store Floor Operations',
              avatar: (s.name || 'S').split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2),
              joinedDate: s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Active',
              deliveriesCount: 0,
            }));
            setStaffList((prev) => {
              const others = prev.filter((item) => item.storeId !== currentStoreId);
              return [...mapped, ...others];
            });
          }
        }
      } finally {
        if (isMounted) setOrdersLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [currentStoreId]);

  // Active store's orders
  const storeOrders = useMemo(() => {
    if (!currentStoreId) return [];
    return ordersMap[currentStoreId] || [];
  }, [ordersMap, currentStoreId]);

  // Active store's staff
  const storeStaff = useMemo(() => {
    if (!currentStoreId) return [];
    return staffList.filter((s) => s.storeId === currentStoreId);
  }, [staffList, currentStoreId]);

  // Active store's customers (computed from customers who have orders in this store)
  const storeCustomers = useMemo(() => {
    const customerMap = new Map();

    storeOrders.forEach((order) => {
      const c = order.customer;
      if (!c) return;

      const existing = customerMap.get(c.id) || {
        id: c.id,
        name: c.name || 'Customer',
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || '',
        totalOrders: 0,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: order.placedAt || 'Recent',
        status: 'Active',
        tags: customerMeta[c.id]?.tags || ['Regular'],
        notes: customerMeta[c.id]?.notes || [],
        avatar: (c.name || 'CU')
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };

      existing.totalOrders += 1;
      existing.ordersCount += 1;
      if (order.status !== 'CANCELLED') {
        existing.totalSpent += Number(order.total) || 0;
      }
      existing.customerType = existing.totalSpent >= 2000 ? 'VIP' : existing.totalOrders <= 1 ? 'New' : 'Regular';
      customerMap.set(c.id, existing);
    });

    return Array.from(customerMap.values());
  }, [storeOrders, customerMeta]);

  /**
   * Transition order status forward
   */
  const updateOrderStatus = async (orderId, nextStatus, extra = {}, targetStoreId = null) => {
    // If order is a backend UUID, invoke real backend endpoint
    if (isUUID(orderId)) {
      try {
        const updated = await orderService.updateOrderStatus(orderId, nextStatus);
        setOrdersMap((prev) => {
          const resolvedStoreId = targetStoreId || currentStore.id;
          const storeList = prev[resolvedStoreId] || [];
          const updatedList = storeList.map((order) => {
            if (order.id === orderId) {
              return { ...order, ...updated, ...extra };
            }
            return order;
          });
          return {
            ...prev,
            [resolvedStoreId]: updatedList,
          };
        });
        return updated;
      } catch (err) {
        console.error('Failed to update status on server:', err);
        throw err;
      }
    }

    // In-memory transition for mock/demo orders
    setOrdersMap((prev) => {
      // Find the store that holds this order
      let resolvedStoreId = targetStoreId || currentStore.id;
      if (!prev[resolvedStoreId]?.some((o) => o.id === orderId)) {
        for (const [sKey, oList] of Object.entries(prev)) {
          if (oList.some((o) => o.id === orderId)) {
            resolvedStoreId = sKey;
            break;
          }
        }
      }

      const storeList = prev[resolvedStoreId] || [];
      const updatedList = storeList.map((order) => {
        if (order.id === orderId) {
          // Guard: Cannot transition backwards or change terminal statuses
          if (order.status === 'DELIVERED' || order.status === 'PICKED_UP') {
            console.warn(`Cannot change status of already completed order ${orderId} (${order.status})`);
            return order;
          }
          if (order.status === 'CANCELLED') {
            console.warn(`Cannot change status of cancelled order ${orderId}`);
            return order;
          }

          // Label and badge variant mapping
          let statusLabel = nextStatus;
          let statusBadgeVariant = 'info';

          if (nextStatus === 'CONFIRMED') {
            statusLabel = 'Confirmed';
            statusBadgeVariant = 'info';
          } else if (nextStatus === 'PREPARING') {
            statusLabel = 'Processing';
            statusBadgeVariant = 'info';
          } else if (nextStatus === 'READY') {
            statusLabel = 'Ready for Dispatch';
            statusBadgeVariant = 'primary';
          } else if (nextStatus === 'READY_FOR_PICKUP') {
            statusLabel = 'Ready for Pickup';
            statusBadgeVariant = 'primary';
          } else if (nextStatus === 'OUT_FOR_DELIVERY') {
            statusLabel = 'Out for Delivery';
            statusBadgeVariant = 'warning';
          } else if (nextStatus === 'DELIVERED') {
            statusLabel = 'Delivered';
            statusBadgeVariant = 'success';
          } else if (nextStatus === 'PICKED_UP') {
            statusLabel = 'Picked Up';
            statusBadgeVariant = 'success';
          } else if (nextStatus === 'CANCELLED') {
            statusLabel = 'Cancelled';
            statusBadgeVariant = 'error';
          }

          // Timeline progression
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newTimeline = (order.timeline || []).map((step) => {
            const stepLabelLower = step.label.toLowerCase();
            const nextStatusLower = nextStatus.toLowerCase();
            const isMatch =
              stepLabelLower.includes(nextStatusLower) ||
              (nextStatus === 'READY_FOR_PICKUP' && stepLabelLower.includes('pickup') && stepLabelLower.includes('ready')) ||
              (nextStatus === 'PICKED_UP' && stepLabelLower.includes('picked up')) ||
              (nextStatus === 'READY' && (stepLabelLower.includes('dispatch') || stepLabelLower.includes('ready'))) ||
              (nextStatus === 'DELIVERED' && (stepLabelLower.includes('handover') || stepLabelLower.includes('delivered')));
            if (isMatch) {
              return { ...step, completed: true, current: true, time: nowTime };
            }
            return step;
          });

          return {
            ...order,
            status: nextStatus,
            statusLabel,
            statusBadgeVariant,
            deliveredAt: nextStatus === 'DELIVERED' ? `Today, ${nowTime}` : order.deliveredAt,
            ...extra,
            timeline: newTimeline,
          };
        }
        return order;
      });

      return {
        ...prev,
        [resolvedStoreId]: updatedList,
      };
    });
  };

  /**
   * Assign Delivery Partner to an Order
   */
  const assignRider = async (orderId, riderData) => {
    if (isUUID(orderId)) {
      const riderUserId = riderData.userId || riderData.id;
      const res = await deliveryService.assignDeliveryStaff(orderId, riderUserId);
      await refreshOrders();
      return res;
    }

    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', {
      deliveryPartner: riderData,
    });
  };

  /**
   * Cancel an order with reason
   */
  const cancelOrder = async (orderId, reason) => {
    if (isUUID(orderId)) {
      try {
        const updated = await orderService.updateOrderStatus(orderId, 'CANCELLED');
        setOrdersMap((prev) => {
          const storeList = prev[currentStore.id] || [];
          const updatedList = storeList.map((order) => {
            if (order.id === orderId) {
              return { ...order, ...updated, cancelReason: reason };
            }
            return order;
          });
          return {
            ...prev,
            [currentStore.id]: updatedList,
          };
        });
        return updated;
      } catch (err) {
        console.error('Failed to cancel order on server:', err);
        throw err;
      }
    }

    setOrdersMap((prev) => {
      const storeList = prev[currentStore.id] || [];
      const updatedList = storeList.map((order) => {
        if (order.id === orderId) {
          const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...order,
            status: 'CANCELLED',
            statusLabel: 'Cancelled',
            statusBadgeVariant: 'error',
            cancelReason: reason,
            timeline: [
              ...(order.timeline || []),
              {
                step: (order.timeline?.length || 0) + 1,
                label: `Cancelled by Store (${reason})`,
                time: nowTime,
                completed: true,
                current: true,
              },
            ],
          };
        }
        return order;
      });

      return {
        ...prev,
        [currentStore.id]: updatedList,
      };
    });
  };

  /**
   * Customer Notes & Tags
   */
  const addCustomerNote = (customerId, noteText) => {
    const newNote = {
      id: `note_${Date.now()}`,
      text: noteText,
      author: 'Store Staff',
      date: 'Today',
    };

    setCustomerMeta((prev) => {
      const existing = prev[customerId] || { notes: [], tags: [] };
      return {
        ...prev,
        [customerId]: {
          ...existing,
          notes: [newNote, ...existing.notes],
        },
      };
    });
  };

  const addCustomerTag = (customerId, tag) => {
    setCustomerMeta((prev) => {
      const existing = prev[customerId] || { notes: [], tags: [] };
      if (existing.tags.includes(tag)) return prev;
      return {
        ...prev,
        [customerId]: {
          ...existing,
          tags: [...existing.tags, tag],
        },
      };
    });
  };

  /**
   * Staff Operations (Add, Update, Toggle, Remove)
   */
  const addStaff = async (staffData) => {
    if (currentStoreId && isUUID(currentStoreId)) {
      const roleMapping =
        staffData.role === 'Delivery Staff' || staffData.role === 'delivery_staff'
          ? 'delivery_staff'
          : staffData.role === 'Manager' || staffData.role === 'manager'
          ? 'manager'
          : 'staff';

      const payload = {
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone || '',
        role: roleMapping,
        password: staffData.password,
      };

      const res = await staffService.addStoreStaff(currentStoreId, payload);
      await refreshStaff();
      return res;
    }

    const newStaff = {
      id: `staff_${Date.now()}`,
      storeId: currentStore?.id,
      name: staffData.name,
      email: staffData.email,
      phone: staffData.phone,
      role: staffData.role || 'Staff',
      roleLabel: staffData.roleLabel || `${staffData.role} Associate`,
      roleBadgeVariant:
        staffData.role === 'Owner'
          ? 'primary'
          : staffData.role === 'Manager'
          ? 'info'
          : staffData.role === 'Delivery Staff'
          ? 'warning'
          : 'neutral',
      scope: staffData.scope || 'Store Floor Operations',
      status: 'Active',
      avatar: staffData.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      joinedDate: 'Today',
      lastActive: 'Just now',
      deliveriesCount: 0,
    };

    setStaffList((prev) => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaff = (staffId, updates) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, ...updates } : s))
    );
  };

  const toggleStaffStatus = (staffId) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const removeStaff = (staffId) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
  };

  const value = {
    ordersMap,
    ordersLoading,
    ordersError,
    refreshOrders,
    staffList,
    storeOrders,
    updateOrderStatus,
    assignRider,
    cancelOrder,
    storeCustomers,
    addCustomerNote,
    addCustomerTag,
    storeStaff,
    refreshStaff,
    addStaff,
    updateStaff,
    toggleStaffStatus,
    removeStaff,
  };

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
}
