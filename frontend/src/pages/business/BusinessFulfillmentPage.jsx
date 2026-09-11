import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessFulfillmentPage() {
  const navigate = useNavigate();
  const { currentStore } = useCatalog();
  const { storeOrders, updateOrderStatus, assignRider, storeStaff, toggleStaffStatus } = useOperations();

  const [activeTab, setActiveTab] = useState('DELIVERY'); // 'DELIVERY' | 'PICKUP' | 'FLEET'

  // Dispatch Modal
  const [dispatchOrder, setDispatchOrder] = useState(null);
  const [selectedRiderId, setSelectedRiderId] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Delivery riders
  const deliveryRiders = useMemo(() => {
    return storeStaff.filter((s) => s.role === 'Delivery Staff');
  }, [storeStaff]);

  const activeRiders = useMemo(() => {
    return deliveryRiders.filter((s) => s.status === 'Active');
  }, [deliveryRiders]);

  // Delivery Orders Queue
  const deliveryOrders = useMemo(() => {
    return storeOrders.filter((o) => o.fulfillmentType === 'delivery');
  }, [storeOrders]);

  // Pickup Orders Queue
  const pickupOrders = useMemo(() => {
    return storeOrders.filter((o) => o.fulfillmentType === 'pickup');
  }, [storeOrders]);

  // Metrics
  const metrics = useMemo(() => {
    const activeDeliveries = deliveryOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length;
    const readyPickup = pickupOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
    const unassignedDeliveries = deliveryOrders.filter(
      (o) => (o.status === 'READY' || o.status === 'PREPARING') && !o.deliveryPartner
    ).length;
    const fleetActive = activeRiders.length;

    return { activeDeliveries, readyPickup, unassignedDeliveries, fleetActive };
  }, [deliveryOrders, pickupOrders, activeRiders]);

  const handleOpenDispatch = (order) => {
    setDispatchOrder(order);
    setSelectedRiderId(activeRiders[0]?.id || '');
  };

  const handleConfirmDispatch = () => {
    if (!dispatchOrder) return;
    const rider = activeRiders.find((r) => r.id === selectedRiderId) || activeRiders[0];
    if (!rider) {
      showToast('No active delivery staff available');
      return;
    }
    assignRider(dispatchOrder.id, {
      name: rider.name,
      initials: rider.avatar || 'DR',
      phone: rider.phone,
      role: 'Store Delivery Partner',
      vehicle: 'Two-Wheeler EV',
      status: 'En route for delivery',
    });
    showToast(`Dispatched ${dispatchOrder.orderNumber} with ${rider.name}`);
    setDispatchOrder(null);
  };

  const handleMarkDelivered = (order) => {
    updateOrderStatus(order.id, 'DELIVERED');
    showToast(`Order ${order.orderNumber} marked Delivered`);
  };

  const handleMarkPickedUp = (order) => {
    updateOrderStatus(order.id, 'PICKED_UP');
    showToast(`Order ${order.orderNumber} marked Picked Up by customer`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Fulfillment & Logistics
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              {currentStore.name} Hub
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage delivery rider assignments, active deliveries, and customer pickup counter.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link
            to="/business/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#0F172A',
              textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            All Orders Stream
          </Link>
          <Link
            to="/business/staff"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#172554',
              border: '1px solid #172554',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              textDecoration: 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Manage Delivery Fleet
          </Link>
        </div>
      </div>

      {/* 4 Logistics Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active In-Flight Deliveries
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.activeDeliveries}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Ready for Pickup Counter
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#047857', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.readyPickup}
          </div>
        </div>

        <div
          style={{
            backgroundColor: metrics.unassignedDeliveries > 0 ? '#FFFBEB' : '#FFFFFF',
            border: metrics.unassignedDeliveries > 0 ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Unassigned Delivery Orders
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#B45309', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.unassignedDeliveries}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Fleet On Shift
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.fleetActive} <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>/ {deliveryRiders.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs Control */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #CBD5E1',
          paddingBottom: '0',
        }}
      >
        <button
          onClick={() => setActiveTab('DELIVERY')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'DELIVERY' ? '#172554' : '#64748B',
            borderBottom: activeTab === 'DELIVERY' ? '2.5px solid #172554' : '2.5px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Delivery Queue</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'DELIVERY' ? '#EFF6FF' : '#F1F5F9',
              color: activeTab === 'DELIVERY' ? '#1D4ED8' : '#64748B',
              fontWeight: '700',
            }}
          >
            {deliveryOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PICKUP')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'PICKUP' ? '#172554' : '#64748B',
            borderBottom: activeTab === 'PICKUP' ? '2.5px solid #172554' : '2.5px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Store Pickup Counter</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'PICKUP' ? '#EFF6FF' : '#F1F5F9',
              color: activeTab === 'PICKUP' ? '#1D4ED8' : '#64748B',
              fontWeight: '700',
            }}
          >
            {pickupOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('FLEET')}
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: '600',
            color: activeTab === 'FLEET' ? '#172554' : '#64748B',
            borderBottom: activeTab === 'FLEET' ? '2.5px solid #172554' : '2.5px solid transparent',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>Delivery Fleet / Riders</span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '9999px',
              backgroundColor: activeTab === 'FLEET' ? '#EFF6FF' : '#F1F5F9',
              color: activeTab === 'FLEET' ? '#1D4ED8' : '#64748B',
              fontWeight: '700',
            }}
          >
            {deliveryRiders.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: DELIVERY QUEUE */}
      {activeTab === 'DELIVERY' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '880px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Order</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Destination</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Customer Note</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Rider Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Logistics Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                        No delivery orders recorded for this store.
                      </td>
                    </tr>
                  ) : (
                    deliveryOrders.map((order) => {
                      const hasRider = !!order.deliveryPartner;
                      const isOut = order.status === 'OUT_FOR_DELIVERY';
                      const isDelivered = order.status === 'DELIVERED';

                      return (
                        <tr
                          key={order.id}
                          style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '14px 16px' }}>
                            <Link
                              to={`/business/orders/${order.id}`}
                              style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}
                            >
                              {order.orderNumber}
                            </Link>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              ₹{order.total} · {order.items?.length} items
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', maxWidth: '280px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                              {order.customer?.name} ({order.customer?.phone})
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {order.customer?.address || 'Koramangala, Bangalore'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', maxWidth: '220px' }}>
                            <div style={{ fontSize: '12px', color: order.customer?.customerNote ? '#B45309' : '#94A3B8' }}>
                              {order.customer?.customerNote || 'No special notes'}
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            {hasRider ? (
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                                  {order.deliveryPartner.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#047857' }}>
                                  {order.deliveryPartner.vehicle || 'Assigned Driver'}
                                </div>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  padding: '2px 8px',
                                  backgroundColor: '#FEF3C7',
                                  color: '#B45309',
                                  borderRadius: '4px',
                                  border: '1px solid #FDE68A',
                                }}
                              >
                                Unassigned
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: isDelivered ? '#DCFCE7' : isOut ? '#EFF6FF' : '#F1F5F9',
                                color: isDelivered ? '#166534' : isOut ? '#1E40AF' : '#475569',
                              }}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              {!isDelivered && order.status !== 'CANCELLED' && (
                                <>
                                  {!hasRider || order.status === 'READY' ? (
                                    <button
                                      onClick={() => handleOpenDispatch(order)}
                                      style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#172554',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Dispatch Rider
                                    </button>
                                  ) : isOut ? (
                                    <button
                                      onClick={() => handleMarkDelivered(order)}
                                      style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#15803D',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Confirm Delivered
                                    </button>
                                  ) : null}
                                </>
                              )}

                              <button
                                onClick={() => navigate(`/business/orders/${order.id}`)}
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: '#F1F5F9',
                                  color: '#334155',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                }}
                              >
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PICKUP COUNTER */}
      {activeTab === 'PICKUP' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Order Number</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Customer</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Items & Staging Shelf</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Counter Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pickupOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                        No store pickup orders recorded for this store.
                      </td>
                    </tr>
                  ) : (
                    pickupOrders.map((order) => {
                      const isPickedUp = order.status === 'PICKED_UP';
                      const isReadyForPickup = order.status === 'READY_FOR_PICKUP';
                      const isPreparing = order.status === 'PREPARING' || order.status === 'CONFIRMED';

                      return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <Link
                              to={`/business/orders/${order.id}`}
                              style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', textDecoration: 'none' }}
                            >
                              {order.orderNumber}
                            </Link>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>{order.placedAt}</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                              {order.customer?.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {order.customer?.phone}
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ fontSize: '13px', color: '#0F172A' }}>
                              {order.items?.length} items ({order.items?.map((i) => i.title).slice(0, 2).join(', ')}...)
                            </div>
                            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                              Counter Shelf: Bay A-2
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{order.total}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: isPickedUp
                                  ? '#DCFCE7'
                                  : isReadyForPickup
                                  ? '#ECFDF5'
                                  : '#EFF6FF',
                                color: isPickedUp
                                  ? '#166534'
                                  : isReadyForPickup
                                  ? '#047857'
                                  : '#1D4ED8',
                                border: `1px solid ${
                                  isPickedUp
                                    ? '#BBF7D0'
                                    : isReadyForPickup
                                    ? '#A7F3D0'
                                    : '#BFDBFE'
                                }`,
                              }}
                            >
                              {isPickedUp
                                ? 'Picked Up'
                                : isReadyForPickup
                                ? 'Ready for Pickup'
                                : order.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            {isReadyForPickup ? (
                              <button
                                onClick={() => handleMarkPickedUp(order)}
                                style={{
                                  padding: '6px 14px',
                                  backgroundColor: '#15803D',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Hand Over (Picked Up)
                              </button>
                            ) : isPreparing ? (
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.id, 'READY_FOR_PICKUP');
                                  showToast(`Order ${order.orderNumber} staged & marked Ready for Pickup`);
                                }}
                                style={{
                                  padding: '6px 14px',
                                  backgroundColor: '#059669',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Ready for Pickup
                              </button>
                            ) : isPickedUp ? (
                              <span style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>
                                Picked Up
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                {order.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FLEET RIDERS */}
      {activeTab === 'FLEET' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Rider Name</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Phone</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Shift Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Active Runs</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Shift Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryRiders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                        No delivery partners found. Add delivery riders from the Staff tab.
                      </td>
                    </tr>
                  ) : (
                    deliveryRiders.map((rider) => {
                      const isActive = rider.status === 'Active';
                      const assignedOrdersCount = deliveryOrders.filter(
                        (o) => o.deliveryPartner?.name === rider.name && o.status === 'OUT_FOR_DELIVERY'
                      ).length;

                      return (
                        <tr key={rider.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '34px',
                                  height: '34px',
                                  borderRadius: '50%',
                                  backgroundColor: '#172554',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                }}
                              >
                                {rider.avatar}
                              </div>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                                  {rider.name}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B' }}>
                                  {rider.scope}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                            {rider.phone}
                          </td>

                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: isActive ? '#DCFCE7' : '#F1F5F9',
                                color: isActive ? '#166534' : '#64748B',
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isActive ? '#16A34A' : '#94A3B8' }} />
                              {isActive ? 'On Shift' : 'Off Shift'}
                            </span>
                          </td>

                          <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: assignedOrdersCount > 0 ? '#1D4ED8' : '#64748B' }}>
                            {assignedOrdersCount} in delivery
                          </td>

                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => {
                                toggleStaffStatus(rider.id);
                                showToast(`Toggled ${rider.name} status`);
                              }}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#0F172A',
                                cursor: 'pointer',
                              }}
                            >
                              {isActive ? 'Set Off Shift' : 'Set On Shift'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Logistics Configuration Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Local Delivery Zone
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '4px' }}>
              Active
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', margin: '0 0 12px 0' }}>
            Direct store dispatch within 5.0 km radius. Standard delivery SLA is 45 mins.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#334155' }}>
            <div>Max Radius: <strong>5 km</strong></div>
            <div>Min Order: <strong>₹199</strong></div>
            <div>Delivery Fee: <strong>₹25</strong></div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Express Pickup Counter
            </h3>
            <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '4px' }}>
              Enabled
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.5', margin: '0 0 12px 0' }}>
            Customers can collect orders directly from front counter shelf Bay A-2 upon verification.
          </p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#334155' }}>
            <div>Hold Window: <strong>4 Hours</strong></div>
            <div>Verification: <strong>Phone / Order ID</strong></div>
          </div>
        </div>
      </div>

      {/* Quick Dispatch Modal */}
      {dispatchOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setDispatchOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              Dispatch Order {dispatchOrder.orderNumber}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
              Select a delivery rider from {currentStore.name} to deliver to {dispatchOrder.customer?.name}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {activeRiders.map((rider) => (
                <label
                  key={rider.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    border: selectedRiderId === rider.id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    borderRadius: '6px',
                    backgroundColor: selectedRiderId === rider.id ? '#EFF6FF' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="dispatchRider"
                      value={rider.id}
                      checked={selectedRiderId === rider.id || (!selectedRiderId && activeRiders[0]?.id === rider.id)}
                      onChange={() => setSelectedRiderId(rider.id)}
                    />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                        {rider.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {rider.phone}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '4px', fontWeight: '600' }}>
                    On Shift
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDispatchOrder(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={activeRiders.length === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: activeRiders.length === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                Assign & Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
