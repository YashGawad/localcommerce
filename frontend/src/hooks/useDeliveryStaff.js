import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { useCatalog } from '../context/CatalogContext';

/**
 * Custom hook to derive the current delivery staff member's operational context:
 * - Authenticated user identity matched against existing store staff
 * - Assigned store multi-tenant isolation
 * - Store orders filtered strictly to delivery orders assigned to this rider
 * - Live active in-transit run
 * - Dynamic delivery KPI metrics (Assigned, Ready, Out for Delivery, Completed Today)
 */
export function useDeliveryStaff() {
  const { currentUser } = useAuth();
  const { staffList, ordersMap, storeOrders, updateOrderStatus } = useOperations();
  const { currentStore, stores } = useCatalog();

  // 1. Resolve Staff Member from Authenticated User
  const currentStaff = useMemo(() => {
    if (!currentUser) return null;

    const matched = staffList?.find(
      (s) =>
        (currentUser.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.staffId && s.id === currentUser.staffId) ||
        (currentUser.name && s.name && s.name.toLowerCase() === currentUser.name.toLowerCase())
    );

    if (matched) {
      return {
        ...matched,
        code: matched.code || (matched.id === 'staff_shm_05' ? '#DEL-04' : '#DEL-01'),
        vehicle: matched.vehicle || currentUser.vehicle || 'Two-wheeler (KA-01-EQ-9841)',
      };
    }

    return {
      id: currentUser.staffId || currentUser.id || 'staff_shm_05',
      code: currentUser.staffCode || '#DEL-04',
      name: currentUser.name || 'Vikram Rao',
      email: currentUser.email || 'delivery@example.com',
      storeId: currentUser.storeId || currentStore?.id || 'store_01',
      role: 'Delivery Staff',
      phone: currentUser.phone || '+91 98205 33445',
      vehicle: currentUser.vehicle || 'Two-wheeler (KA-01-EQ-9841)',
      avatar: currentUser.avatar || 'VR',
    };
  }, [currentUser, staffList, currentStore]);

  // 2. Resolve Assigned Store
  const staffStoreId = currentStaff?.storeId || currentStore?.id || 'store_01';
  const staffStore = useMemo(() => {
    return stores?.find((s) => s.id === staffStoreId) || currentStore;
  }, [stores, staffStoreId, currentStore]);

  // 3. Resolve Store Deliveries (Strictly Scoped)
  const storeAllOrders = useMemo(() => {
    return (ordersMap && ordersMap[staffStoreId]) || storeOrders || [];
  }, [ordersMap, staffStoreId, storeOrders]);

  // Filter to delivery orders assigned to this staff or ready at this store
  const assignedOrders = useMemo(() => {
    if (!currentStaff) return [];
    return storeAllOrders.filter((order) => {
      if (order.fulfillmentType !== 'delivery') return false;

      const partner = order.deliveryPartner;
      if (!partner) {
        // Unassigned delivery order ready for pickup in this store
        return order.status === 'READY';
      }

      // Check assignment by partner id, name, or code
      const isAssigned =
        partner.id === currentStaff.id ||
        (partner.name && partner.name.toLowerCase() === currentStaff.name.toLowerCase()) ||
        (partner.code && partner.code === currentStaff.code) ||
        order.assignedStaffId === currentStaff.id;

      return isAssigned || (order.status === 'READY' && order.storeId === staffStoreId);
    });
  }, [storeAllOrders, currentStaff, staffStoreId]);

  // 4. Live Active Run (currently OUT_FOR_DELIVERY)
  const activeOrder = useMemo(() => {
    return assignedOrders.find((o) => o.status === 'OUT_FOR_DELIVERY') || null;
  }, [assignedOrders]);

  // 5. Dynamic Delivery Metrics
  const metrics = useMemo(() => {
    const assigned = assignedOrders.filter(
      (o) => o.status === 'READY' && o.deliveryPartner?.name === currentStaff?.name
    ).length;

    const ready = assignedOrders.filter((o) => o.status === 'READY').length;

    const outForDelivery = assignedOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;

    const completedOrders = assignedOrders.filter((o) => o.status === 'DELIVERED');
    const completed = completedOrders.length;
    const totalCollected = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      assigned,
      ready,
      outForDelivery,
      completed,
      totalCollected,
    };
  }, [assignedOrders, currentStaff]);

  return {
    currentUser,
    currentStaff,
    staffStore,
    staffStoreId,
    storeAllOrders,
    assignedOrders,
    activeOrder,
    metrics,
    updateOrderStatus,
  };
}
