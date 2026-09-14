import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationsContext';
import { useCatalog } from '../context/CatalogContext';
import deliveryService from '../services/deliveryService';

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
  const { staffList, ordersMap, storeOrders, updateOrderStatus: updateMockOrderStatus } = useOperations();
  const { currentStore, stores } = useCatalog();

  const [liveAssignments, setLiveAssignments] = useState(null);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // 1. Fetch live assignments for delivery staff user
  const refreshAssignments = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'delivery_staff') return;
    try {
      setLoadingAssignments(true);
      const data = await deliveryService.getAssignments();
      if (Array.isArray(data)) {
        setLiveAssignments(data);
      }
    } catch (err) {
      console.warn('Could not load live delivery assignments:', err.message);
    } finally {
      setLoadingAssignments(false);
    }
  }, [currentUser]);

  useEffect(() => {
    let isMounted = true;
    if (currentUser?.role === 'delivery_staff') {
      deliveryService
        .getAssignments()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setLiveAssignments(data);
          }
        })
        .catch((err) => {
          console.warn('Could not load live delivery assignments:', err.message);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser]);


  // 2. Resolve Staff Member from Authenticated User
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
        vehicle: matched.vehicle || currentUser.vehicle || 'Two-wheeler EV',
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
      vehicle: currentUser.vehicle || 'Two-wheeler EV',
      avatar: (currentUser.name || 'DR').split(' ').filter(Boolean).map((p) => p[0]).join('').toUpperCase().slice(0, 2),
    };
  }, [currentUser, staffList, currentStore]);

  // 3. Resolve Assigned Store
  const staffStoreId = currentStaff?.storeId || currentStore?.id || 'store_01';
  const staffStore = useMemo(() => {
    return stores?.find((s) => s.id === staffStoreId) || currentStore;
  }, [stores, staffStoreId, currentStore]);

  // 4. Map Live Assignments to Order Shape
  const mappedLiveOrders = useMemo(() => {
    if (!liveAssignments) return null;
    return liveAssignments.map((a) => {
      const addressStr = a.delivery_address
        ? [a.delivery_address.line1, a.delivery_address.line2, a.delivery_address.city, a.delivery_address.state, a.delivery_address.postal_code].filter(Boolean).join(', ')
        : 'Local Address';

      const orderStatus = a.order_status || (a.status === 'out_for_delivery' ? 'OUT_FOR_DELIVERY' : a.status === 'delivered' ? 'DELIVERED' : 'READY');

      return {
        id: a.order_id,
        orderId: a.order_id,
        assignmentId: a.id,
        orderNumber: a.order_number ? (a.order_number.startsWith('#') ? a.order_number : `#${a.order_number}`) : `#LC-${a.order_id.slice(-6)}`,
        storeId: a.store_id,
        storeName: a.store?.name || staffStore?.name || 'Local Store',
        status: orderStatus,
        assignmentStatus: a.status,
        statusLabel: orderStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : orderStatus === 'DELIVERED' ? 'Delivered' : 'Ready for Dispatch',
        statusBadgeVariant: orderStatus === 'DELIVERED' ? 'success' : orderStatus === 'OUT_FOR_DELIVERY' ? 'warning' : 'primary',
        fulfillmentType: a.fulfillment_type || 'delivery',
        fulfillmentLabel: 'Store Delivery',
        total: Number(a.total_amount) || 0,
        subtotal: Number(a.total_amount) || 0,
        customer: {
          id: 'cust_live',
          name: a.delivery_recipient_name || 'Customer',
          phone: a.delivery_recipient_phone || '',
          address: addressStr,
          streetAddress: addressStr,
          landmark: '',
        },
        deliveryAddress: a.delivery_address,
        customerNotes: a.customer_notes || '',
        deliveryPartner: a.delivery_staff ? {
          id: a.delivery_staff.id,
          name: a.delivery_staff.name,
          code: `#DEL-${a.delivery_staff.id.slice(-2).toUpperCase()}`,
          phone: a.delivery_staff.phone,
          role: 'Store Delivery Partner',
          vehicle: 'Two-Wheeler EV',
          status: a.status === 'out_for_delivery' ? 'In-transit with thermal crate' : 'Active',
        } : {
          id: currentUser?.id,
          name: currentUser?.name || 'Delivery Partner',
          code: '#DEL-01',
          phone: currentUser?.phone,
        },
        store: a.store,
        items: [
          {
            id: 'item_assigned',
            productId: 'prod_assigned',
            title: 'Assigned Order Package',
            unit: 'Standard Pack',
            quantity: 1,
            price: Number(a.total_amount) || 0,
            total: Number(a.total_amount) || 0,
            handlingNote: 'Direct Handover',
          },
        ],
        placedAt: a.assigned_at ? new Date(a.assigned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
        estimatedDelivery: '20–30 mins',
        deliveredAt: a.delivered_at ? new Date(a.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
        timeline: [
          { step: 1, label: 'Order Assigned', time: 'Assigned', completed: true },
          { step: 2, label: 'Out for Delivery', time: 'In Transit', completed: ['out_for_delivery', 'delivered'].includes(a.status), current: a.status === 'out_for_delivery' },
          { step: 3, label: 'Delivered', time: 'Doorstep Handover', completed: a.status === 'delivered', current: a.status === 'delivered' },
        ],
        rawAssignment: a,
      };
    });
  }, [liveAssignments, staffStore, currentUser]);

  // 5. Fallback store orders for demo/mock mode
  const fallbackStoreOrders = useMemo(() => {
    return (ordersMap && ordersMap[staffStoreId]) || storeOrders || [];
  }, [ordersMap, staffStoreId, storeOrders]);

  const fallbackAssignedOrders = useMemo(() => {
    if (!currentStaff) return [];
    return fallbackStoreOrders.filter((order) => {
      if (order.fulfillmentType !== 'delivery') return false;

      const partner = order.deliveryPartner;
      if (!partner) {
        return order.status === 'READY';
      }

      const isAssigned =
        partner.id === currentStaff.id ||
        (partner.name && partner.name.toLowerCase() === currentStaff.name.toLowerCase()) ||
        (partner.code && partner.code === currentStaff.code) ||
        order.assignedStaffId === currentStaff.id;

      return isAssigned || (order.status === 'READY' && order.storeId === staffStoreId);
    });
  }, [fallbackStoreOrders, currentStaff, staffStoreId]);

  // Effective assigned orders: live if available, else fallback
  const assignedOrders = mappedLiveOrders !== null ? mappedLiveOrders : fallbackAssignedOrders;
  const storeAllOrders = mappedLiveOrders !== null ? mappedLiveOrders : fallbackStoreOrders;

  // 6. Live Active Run (currently OUT_FOR_DELIVERY)
  const activeOrder = useMemo(() => {
    return assignedOrders.find((o) => o.status === 'OUT_FOR_DELIVERY') || null;
  }, [assignedOrders]);

  // 7. Dynamic Delivery Metrics
  const metrics = useMemo(() => {
    const assigned = assignedOrders.filter(
      (o) => o.status === 'READY'
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
  }, [assignedOrders]);

  // 8. Order / Assignment status update
  const updateOrderStatus = async (orderId, nextStatus, extra = {}) => {
    const matchedAssignment = liveAssignments?.find(
      (a) => a.order_id === orderId || a.id === orderId
    );

    if (matchedAssignment) {
      let targetAssignmentStatus;
      if (nextStatus === 'OUT_FOR_DELIVERY') {
        targetAssignmentStatus = 'out_for_delivery';
      } else if (nextStatus === 'DELIVERED') {
        targetAssignmentStatus = 'delivered';
      } else if (nextStatus === 'CANCELLED' || nextStatus === 'failed') {
        targetAssignmentStatus = 'failed';
      }

      if (targetAssignmentStatus) {
        await deliveryService.updateAssignmentStatus(
          matchedAssignment.id,
          targetAssignmentStatus,
          extra.cancelReason || extra.failureReason
        );
        await refreshAssignments();
        return;
      }
    }

    return updateMockOrderStatus(orderId, nextStatus, extra);
  };

  return {
    currentUser,
    currentStaff,
    staffStore,
    staffStoreId,
    storeAllOrders,
    assignedOrders,
    activeOrder,
    metrics,
    loadingAssignments,
    refreshAssignments,
    updateOrderStatus,
  };

}

export default useDeliveryStaff;
