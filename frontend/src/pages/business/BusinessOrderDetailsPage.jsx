import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessOrderDetailsPage() {
  const { id } = useParams();
  const { currentStore } = useCatalog();
  const { storeOrders, updateOrderStatus, assignRider, cancelOrder, storeStaff } = useOperations();

  // Find target order in current store
  const order = useMemo(() => {
    return storeOrders.find(
      (o) => o.id === id || o.orderNumber === id || o.orderNumber === `#${id}`
    );
  }, [storeOrders, id]);

  // Dispatch Rider Modal State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Cancel Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Out of stock');
  const [customReason, setCustomReason] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Available delivery riders for this store
  const availableRiders = useMemo(() => {
    return storeStaff.filter((s) => s.role === 'Delivery Staff' && s.status === 'Active');
  }, [storeStaff]);

  // If order not found in current store
  if (!order) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '540px',
          margin: '40px auto',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#F1F5F9',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>
          Order Not Found
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          Order &quot;{id}&quot; does not belong to {currentStore.name} or does not exist.
        </p>
        <Link
          to="/business/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#172554',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Return to Orders
        </Link>
      </div>
    );
  }

  // Handle Lifecycle State Advances
  const handleAdvanceStatus = (targetStatus) => {
    updateOrderStatus(order.id, targetStatus);
    showToast(`Order updated to ${targetStatus}`);
  };

  const handleConfirmDispatch = () => {
    const rider = availableRiders.find((r) => r.id === selectedRiderId) || availableRiders[0];
    if (!rider) {
      showToast('No active delivery staff selected');
      return;
    }
    assignRider(order.id, {
      name: rider.name,
      initials: rider.avatar || 'DR',
      phone: rider.phone,
      role: 'Store Delivery Partner',
      vehicle: 'Two-Wheeler EV',
      status: 'En route for delivery',
      dispatchNotes: dispatchNotes || undefined,
    });
    setIsDispatchModalOpen(false);
    showToast(`Rider ${rider.name} dispatched with order`);
  };

  const handleConfirmCancel = () => {
    const reason = cancelReason === 'Other' ? customReason || 'Merchant cancelled' : cancelReason;
    cancelOrder(order.id, reason);
    setIsCancelModalOpen(false);
    showToast('Order has been cancelled');
  };

  const handlePrint = () => {
    window.print();
  };

  // Status Badge Colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', label: 'Pending Confirmation' };
      case 'CONFIRMED':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'Confirmed' };
      case 'PREPARING':
        return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', label: 'In Kitchen / Prep' };
      case 'READY':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', label: 'Ready for Dispatch' };
      case 'READY_FOR_PICKUP':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', label: 'Ready for Pickup' };
      case 'OUT_FOR_DELIVERY':
        return { bg: '#F0F9FF', color: '#0369A1', border: '#BAE6FD', label: 'Out for Delivery' };
      case 'DELIVERED':
        return { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Delivered' };
      case 'PICKED_UP':
        return { bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', label: 'Picked Up' };
      case 'CANCELLED':
        return { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA', label: 'Cancelled' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', label: status };
    }
  };

  const badge = getStatusBadge(order.status);
  const isDelivery = order.fulfillmentType === 'delivery';

  // Standard Lifecycle sequence
  const lifecycleSteps = isDelivery
    ? [
        { key: 'PLACED', label: 'Order Placed' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PREPARING', label: 'Preparing' },
        { key: 'READY', label: 'Ready for Dispatch' },
        { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
        { key: 'DELIVERED', label: 'Delivered' },
      ]
    : [
        { key: 'PLACED', label: 'Order Placed' },
        { key: 'CONFIRMED', label: 'Confirmed' },
        { key: 'PREPARING', label: 'Preparing' },
        { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
        { key: 'PICKED_UP', label: 'Picked Up' },
      ];

  const currentStepIndex = lifecycleSteps.findIndex((s) => s.key === order.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumb & Actions Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/business/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#64748B',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Orders
          </Link>

          <span style={{ color: '#CBD5E1' }}>|</span>

          <span
            style={{
              fontSize: '12px',
              color: '#065F46',
              backgroundColor: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: '9999px',
              fontWeight: '600',
            }}
          >
            {currentStore.name}
          </span>
        </div>

        {/* Print / Export Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePrint}
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
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print Receipt
          </button>
        </div>
      </div>

      {/* Main Order Header Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Order {order.orderNumber}
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                backgroundColor: badge.bg,
                color: badge.color,
                border: `1px solid ${badge.border}`,
              }}
            >
              {badge.label}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: isDelivery ? '#EFF6FF' : '#F1F5F9',
                color: isDelivery ? '#1E40AF' : '#475569',
              }}
            >
              {isDelivery ? 'Local Delivery' : 'Store Pickup'}
            </span>
          </div>

          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
            Placed on <strong style={{ color: '#0F172A' }}>{order.placedAt}</strong> · Est. Fulfillment:{' '}
            <span style={{ color: '#0F172A' }}>{order.estimatedDelivery}</span>
          </div>
        </div>

        {/* Operational Workflow Transition Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {order.status === 'PLACED' && (
            <button
              onClick={() => handleAdvanceStatus('CONFIRMED')}
              style={{
                padding: '9px 18px',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Accept & Confirm Order
            </button>
          )}

          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => handleAdvanceStatus('PREPARING')}
              style={{
                padding: '9px 18px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Start Kitchen / Packing Prep
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              onClick={() => handleAdvanceStatus(isDelivery ? 'READY' : 'READY_FOR_PICKUP')}
              style={{
                padding: '9px 18px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {isDelivery ? 'Mark Ready for Dispatch' : 'Mark Ready for Pickup'}
            </button>
          )}

          {order.status === 'READY' && isDelivery && (
            <button
              onClick={() => setIsDispatchModalOpen(true)}
              style={{
                padding: '9px 18px',
                backgroundColor: '#0284C7',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Assign Rider & Dispatch
            </button>
          )}

          {order.status === 'READY_FOR_PICKUP' && !isDelivery && (
            <button
              onClick={() => handleAdvanceStatus('PICKED_UP')}
              style={{
                padding: '9px 18px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Hand Over to Customer (Picked Up)
            </button>
          )}

          {order.status === 'OUT_FOR_DELIVERY' && (
            <button
              onClick={() => handleAdvanceStatus('DELIVERED')}
              style={{
                padding: '9px 18px',
                backgroundColor: '#15803D',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Confirm Delivered
            </button>
          )}

          {order.status !== 'DELIVERED' && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => setIsCancelModalOpen(true)}
              style={{
                padding: '9px 14px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* LEFT COLUMN: Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Order Lifecycle Progress Tracker */}
          {order.status !== 'CANCELLED' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 16px 0' }}>
                Fulfillment Progress
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflowX: 'auto',
                  paddingBottom: '6px',
                }}
              >
                {lifecycleSteps.map((step, idx) => {
                  const isDone = currentStepIndex >= idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.key}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px',
                        zIndex: 2,
                        minWidth: '70px',
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isDone ? '#10B981' : '#F1F5F9',
                          color: isDone ? '#FFFFFF' : '#94A3B8',
                          fontSize: '12px',
                          fontWeight: '700',
                          boxShadow: isCurrent ? '0 0 0 4px #DCFCE7' : 'none',
                        }}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: isCurrent ? '700' : '500',
                          color: isCurrent ? '#0F172A' : isDone ? '#047857' : '#94A3B8',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancellation Notice if Cancelled */}
          {order.status === 'CANCELLED' && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                borderRadius: '8px',
                border: '1px solid #FECACA',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ✕
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#991B1B' }}>
                  This order was cancelled
                </div>
                <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                  Reason: {order.cancelReason || 'Merchant cancelled'}
                </div>
              </div>
            </div>
          )}

          {/* Order Items Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                Order Items ({order.items?.length || 0})
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                All items packaged at store location
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Unit Price</th>
                    <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '10px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '6px',
                              backgroundColor: '#F1F5F9',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <span style={{ fontSize: '11px', color: '#64748B' }}>SKU</span>
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {item.unit} · SKU: {item.productId || 'SKU-ITEM'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{item.price}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#0F172A', fontWeight: '600', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                        {item.quantity}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '700', color: '#0F172A', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{item.total || item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Totals Calculation Box */}
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '13px', color: '#64748B' }}>
                <span>Subtotal ({order.items?.length || 0} items)</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '13px', color: '#64748B' }}>
                <span>Fulfillment Fee</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {order.deliveryFee ? `₹${order.deliveryFee}` : 'FREE / Store Pickup'}
                </span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '260px', fontSize: '13px', color: '#059669' }}>
                  <span>Discount</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>-₹{order.discount}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '260px',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#0F172A',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '8px',
                  marginTop: '4px',
                }}
              >
                <span>Total Amount</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: '#172554' }}>
                  ₹{order.total}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Handling Instructions */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>
              {isDelivery ? 'Delivery Destination & Notes' : 'Store Pickup Station'}
            </h3>

            {isDelivery ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                  {order.customer?.address || 'Standard Address on Record'}
                </div>
                {order.customer?.landmark && (
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Landmark: {order.customer.landmark}
                  </div>
                )}
                {order.customer?.customerNote && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      backgroundColor: '#FEF3C7',
                      border: '1px solid #FDE68A',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#92400E',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>Instruction: {order.customer.customerNote}</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#475569' }}>
                Customer has opted for self-pickup at <strong>{currentStore.name}</strong> counter.
                Items should be packed and placed at the designated Express Pickup shelf.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Customer, Payment & Rider Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Profile Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                Customer
              </h3>
              {order.customer?.id && (
                <Link
                  to={`/business/customers/${order.customer.id}`}
                  style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', textDecoration: 'none' }}
                >
                  View History →
                </Link>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                }}
              >
                {order.customer?.name
                  ? order.customer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                  : 'CU'}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                  {order.customer?.name || 'Walk-in Customer'}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {order.customer?.pastOrdersCount || 0} past orders at this store
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{order.customer?.phone || 'No phone'}</span>
              </div>
              {order.customer?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>{order.customer.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 14px 0' }}>
              Payment Information
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Payment Method</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                {order.paymentMethod || 'UPI'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Payment Status</span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: order.paymentStatus === 'PAID' ? '#DCFCE7' : '#FEF3C7',
                  color: order.paymentStatus === 'PAID' ? '#166534' : '#92400E',
                }}
              >
                {order.paymentStatus}
              </span>
            </div>

            {order.paymentDetails && (
              <div style={{ fontSize: '12px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '8px 10px', borderRadius: '4px' }}>
                Ref: {order.paymentDetails}
              </div>
            )}

            {order.invoiceNumber && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748B' }}>
                Invoice: <span style={{ fontWeight: '600', color: '#0F172A' }}>{order.invoiceNumber}</span>
              </div>
            )}
          </div>

          {/* Delivery Logistics / Rider Assignment Card */}
          {isDelivery && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                  Assigned Delivery Rider
                </h3>
                {order.deliveryPartner && (
                  <button
                    onClick={() => setIsDispatchModalOpen(true)}
                    style={{
                      fontSize: '12px',
                      color: '#2563EB',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Change Rider
                  </button>
                )}
              </div>

              {order.deliveryPartner ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '700',
                      }}
                    >
                      {order.deliveryPartner.initials || 'DR'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>
                        {order.deliveryPartner.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {order.deliveryPartner.phone}
                      </div>
                    </div>
                  </div>

                  {order.deliveryPartner.vehicle && (
                    <div style={{ fontSize: '12px', color: '#64748B', backgroundColor: '#F8FAFC', padding: '6px 10px', borderRadius: '4px' }}>
                      Vehicle: {order.deliveryPartner.vehicle}
                    </div>
                  )}

                  <div style={{ fontSize: '12px', color: '#047857', fontWeight: '500' }}>
                    Status: {order.deliveryPartner.status || 'Assigned'}
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 14px 0' }}>
                    No delivery rider assigned yet for this home delivery.
                  </p>
                  <button
                    onClick={() => setIsDispatchModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#172554',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Assign Delivery Rider
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dispatch Rider Modal */}
      {isDispatchModalOpen && (
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
          onClick={() => setIsDispatchModalOpen(false)}
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
              Assign Delivery Driver
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
              Select an available on-shift rider from {currentStore.name} to dispatch order {order.orderNumber}.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {availableRiders.length === 0 ? (
                <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '6px', fontSize: '13px', color: '#DC2626' }}>
                  No on-shift delivery riders available in your team directory. Please add or activate a delivery partner in the Staff section.
                </div>
              ) : (
                availableRiders.map((rider) => (
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
                        name="riderSelect"
                        value={rider.id}
                        checked={selectedRiderId === rider.id || (!selectedRiderId && availableRiders[0]?.id === rider.id)}
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
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}
                    >
                      On Shift
                    </span>
                  </label>
                ))
              )}

              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Dispatch Notes for Rider (Optional)
                </label>
                <textarea
                  placeholder="e.g. Handle eggs carefully, customer at flat 302..."
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
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
                disabled={availableRiders.length === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: availableRiders.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: availableRiders.length === 0 ? 0.6 : 1,
                }}
              >
                Dispatch with Rider
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
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
          onClick={() => setIsCancelModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '700', color: '#DC2626' }}>
              Cancel Order {order.orderNumber}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to cancel this order? This cannot be reversed.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {[
                'Out of stock',
                'Customer requested cancellation',
                'Store closed / prep delay',
                'Delivery partner unavailable',
                'Other',
              ].map((reason) => (
                <label key={reason} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                  />
                  {reason}
                </label>
              ))}

              {cancelReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    marginTop: '4px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsCancelModalOpen(false)}
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
                Keep Order
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
