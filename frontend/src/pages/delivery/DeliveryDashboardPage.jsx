import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDeliveryStaff } from '../../hooks/useDeliveryStaff';

export default function DeliveryDashboardPage() {
  const {
    currentStaff,
    staffStore,
    assignedOrders,
    activeOrder,
    metrics,
    updateOrderStatus,
  } = useDeliveryStaff();

  // Local UI State
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('urgency');
  const [onDuty, setOnDuty] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State for "Update Delivery"
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [updateStep, setUpdateStep] = useState('delivered');
  const [otpCode, setOtpCode] = useState('');

  // Trigger brief toast notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Deliveries synced with store dispatch hub');
    }, 500);
  };

  // Start Delivery transition
  const handleStartDelivery = (orderId) => {
    updateOrderStatus(orderId, 'OUT_FOR_DELIVERY', {
      deliveryPartner: {
        id: currentStaff?.id,
        name: currentStaff?.name,
        code: currentStaff?.code,
        phone: currentStaff?.phone,
        vehicle: currentStaff?.vehicle,
        status: 'In-transit with thermal crate',
      },
    });
    showToast(`Order #${orderId} marked Out for Delivery`);
  };

  // Open update modal
  const openUpdateModal = (order) => {
    setSelectedOrderForUpdate(order);
    setUpdateStep('delivered');
    setOtpCode('');
  };

  // Submit modal status update
  const handleConfirmStatusUpdate = () => {
    if (!selectedOrderForUpdate) return;

    if (updateStep === 'delivered') {
      updateOrderStatus(selectedOrderForUpdate.id, 'DELIVERED', {
        handoverOtp: otpCode || '4021',
        deliveredAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
      showToast(`Order #${selectedOrderForUpdate.id} successfully marked as Delivered`);
    } else if (updateStep === 'arrived') {
      showToast(`Doorstep arrival recorded for Order #${selectedOrderForUpdate.id}`);
    } else if (updateStep === 'issue') {
      showToast(`Delivery issue flagged to ${staffStore?.name || 'store'} coordinator`);
    }

    setSelectedOrderForUpdate(null);
  };

  // Filter & Search & Sort orders
  const filteredOrders = useMemo(() => {
    return assignedOrders
      .filter((order) => {
        // Tab filtering
        if (activeTab === 'assigned') {
          return order.status === 'READY' && order.deliveryPartner?.name === currentStaff?.name;
        }
        if (activeTab === 'ready') {
          return order.status === 'READY';
        }
        if (activeTab === 'out') {
          return order.status === 'OUT_FOR_DELIVERY';
        }
        if (activeTab === 'completed') {
          return order.status === 'DELIVERED';
        }
        return true; // 'all'
      })
      .filter((order) => {
        // Search filtering
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const idMatch = order.id.toLowerCase().includes(q) || (order.orderNumber && order.orderNumber.toLowerCase().includes(q));
        const custMatch = order.customer?.name?.toLowerCase().includes(q);
        const addrMatch = order.customer?.address?.toLowerCase().includes(q);
        return idMatch || custMatch || addrMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          const distA = parseFloat(a.distance) || 0;
          const distB = parseFloat(b.distance) || 0;
          return distA - distB;
        }
        if (sortBy === 'value') {
          return (b.total || 0) - (a.total || 0);
        }
        // default 'urgency' - put OUT_FOR_DELIVERY first, then READY, then DELIVERED
        const priority = { OUT_FOR_DELIVERY: 1, READY: 2, PREPARING: 3, DELIVERED: 4, CANCELLED: 5 };
        return (priority[a.status] || 99) - (priority[b.status] || 99);
      });
  }, [assignedOrders, activeTab, searchQuery, sortBy, currentStaff]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Active Run Floating Operational Banner */}
      {activeOrder && (
        <div
          style={{
            width: '100%',
            backgroundColor: '#000F3F',
            color: '#FFFFFF',
            padding: '12px 24px',
            boxShadow: '0 4px 12px rgba(0, 15, 63, 0.15)',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#316BF3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#FFFFFF' }}>
                  electric_moped
                </span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#DBE1FF',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 700,
                    }}
                  >
                    In-Transit Live Run
                  </span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#316BF3' }} />
                  <strong style={{ fontSize: '13px', color: '#FFFFFF' }}>#{activeOrder.id}</strong>
                </div>
                <div style={{ fontSize: '13px', color: '#EFF4FF', marginTop: '2px' }}>
                  {activeOrder.customer?.name} • {activeOrder.customer?.address?.split(',')[0]} ({activeOrder.distance || '1.2 km'})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#DBE1FF' }}>Est. Arrival</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>8 mins</div>
              </div>

              <button
                type="button"
                onClick={() => openUpdateModal(activeOrder)}
                style={{
                  backgroundColor: '#0051D5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0, 81, 213, 0.3)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  navigation
                </span>
                <span>Update Delivery</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px 20px 48px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* 2. Breadcrumb & Store Scope Tracker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: '#64748B',
            }}
          >
            <span style={{ color: '#000F3F', fontWeight: 600 }}>{staffStore?.name || 'Store Hub'}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              chevron_right
            </span>
            <span>Logistics</span>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              chevron_right
            </span>
            <span style={{ color: '#0B1C30', fontWeight: 600 }}>Delivery Staff Dispatch</span>
          </nav>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: '#EFF4FF',
              color: '#0B1C30',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0051D5' }}>
              verified_user
            </span>
            <span>
              Assigned Fleet • {staffStore?.name || 'Local Store'} (#{staffStore?.id === 'store_01' ? '0102' : '0204'})
            </span>
          </div>
        </div>

        {/* 3. Header Section */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#000F3F', margin: 0 }}>
                Delivery
              </h1>

              {/* Staff Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#EFF4FF',
                  color: '#45464F',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#000F3F' }}>
                  badge
                </span>
                <span>
                  {currentStaff?.name || 'Delivery Partner'} (Staff ID: {currentStaff?.code || '#DEL-04'})
                </span>
              </div>

              {/* Duty Toggle */}
              <div
                onClick={() => setOnDuty(!onDuty)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: onDuty ? '#EFF4FF' : '#FEE2E2',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: onDuty ? '#0B1C30' : '#DC2626',
                  userSelect: 'none',
                }}
                title="Click to toggle active duty status"
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: onDuty ? '#10B981' : '#EF4444',
                  }}
                />
                <span>{onDuty ? 'Active & On Duty' : 'Off Duty'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                  sync_alt
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              View and manage your assigned deliveries in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                backgroundColor: '#EFF4FF',
                color: '#0B1C30',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: '16px',
                  transform: isRefreshing ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.4s ease',
                }}
              >
                refresh
              </span>
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh Deliveries'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              style={{
                backgroundColor: '#000F3F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                map
              </span>
              <span>Navigation Map</span>
            </button>
          </div>
        </div>

        {/* 4. Operational KPI Summary Bar (4 Cards) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Assigned */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0051D5' }}>
                inbox
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0B1C30' }}>
                {metrics.assigned}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>orders queued</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#0051D5',
                backgroundColor: '#EFF4FF',
                padding: '2px 8px',
                borderRadius: '4px',
                width: 'fit-content',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                schedule
              </span>
              <span>Awaiting accept</span>
            </div>
          </div>

          {/* Ready for Pickup */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ready for Pickup
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#C88000' }}>
                storefront
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0B1C30' }}>
                {metrics.ready}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>at dispatch dock</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#C88000',
                backgroundColor: '#FEF3C7',
                padding: '2px 8px',
                borderRadius: '4px',
                width: 'fit-content',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                done_outline
              </span>
              <span>Packed & Billed</span>
            </div>
          </div>

          {/* Out for Delivery */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Out for Delivery
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#316BF3' }}>
                route
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#0051D5' }}>
                {metrics.outForDelivery}
              </span>
              <span style={{ fontSize: '13px', color: '#316BF3', fontWeight: 600 }}>active rider run</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#FFFFFF',
                backgroundColor: '#316BF3',
                padding: '2px 8px',
                borderRadius: '4px',
                width: 'fit-content',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                speed
              </span>
              <span>SLA on track</span>
            </div>
          </div>

          {/* Completed Today */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completed Today
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#16A34A' }}>
                task_alt
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700, color: '#000F3F' }}>
                {metrics.completed}
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>delivered</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: '#000F3F',
                backgroundColor: '#EFF4FF',
                padding: '2px 8px',
                borderRadius: '4px',
                width: 'fit-content',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                payments
              </span>
              <span>₹{metrics.totalCollected.toFixed(2)} collected</span>
            </div>
          </div>
        </div>

        {/* 5. Live Fleet Route Navigation Panel */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#0051D5' }}>
                explore
              </span>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0B1C30', margin: 0 }}>
                  Live Fleet Route Navigation
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Route optimization configured for {staffStore?.name} (Hub: #{staffStore?.id === 'store_01' ? '0102' : '0204'})
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0051D5' }}>
                near_me
              </span>
              <span>Next Dropoff: Koramangala 4th Block (ETA: 11:15 AM)</span>
            </div>
          </div>

          {/* Styled Route Map Visual */}
          <div
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCL4JTljZqoe5G0TqOd9CQQZmJdR7nYti6OZSew2MJ-uIKIR0v4VhuCe-uIxZc7qpQoxBcXnci9cfMkfUIJR5ALC3oHxQoBAxJwvW8P8CIf3VQ9tn9-XtdEbbjegQrnUI8e0NN1MqjcKs152Fs_8WZlAUrBEB9o7jGOsakWwqRYmKyNP89MHYPD8WezgdhtS3JUz9apdwFnCO7QDBxdewp7m7NM085GWJ09FvjjOcFCB5a1q2KOcHA')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '16px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(4px)',
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0051D5' }} />
                <strong style={{ color: '#0B1C30' }}>{staffStore?.name} Hub</strong>
              </div>
              <span style={{ color: '#94A3B8' }}>•</span>
              <span style={{ color: '#45464F' }}>3 Stops Remaining</span>
              <span style={{ color: '#94A3B8' }}>•</span>
              <span style={{ color: '#0051D5', fontWeight: 700 }}>Total Distance: 4.8 km</span>
            </div>
          </div>
        </div>

        {/* 6. Filter & Queue Management */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Tabs Row */}
          <div
            style={{
              display: 'flex',
              overflowX: 'auto',
              backgroundColor: '#EFF4FF',
              padding: '6px 12px 0',
              gap: '4px',
            }}
          >
            {[
              { id: 'all', label: `All (${assignedOrders.length})` },
              { id: 'assigned', label: `Assigned (${metrics.assigned})` },
              { id: 'ready', label: `Ready (${metrics.ready})` },
              { id: 'out', label: `Out for Delivery (${metrics.outForDelivery})` },
              { id: 'completed', label: `Completed (${metrics.completed} Today)` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  color: activeTab === tab.id ? '#000F3F' : '#64748B',
                  backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Sort Shelf */}
          <div
            style={{
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B',
                  fontSize: '18px',
                }}
              >
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, customer, address..."
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 38px',
                  fontSize: '13px',
                  backgroundColor: '#EFF4FF',
                  border: '1px solid transparent',
                  borderRadius: '6px',
                  outline: 'none',
                  color: '#0B1C30',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label htmlFor="sort-select" style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>
                Sort by:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  backgroundColor: '#EFF4FF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  color: '#0B1C30',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="urgency">Urgency / Promised SLA</option>
                <option value="distance">Distance (Nearest first)</option>
                <option value="value">Order Value (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Deliveries Table */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#EFF4FF', color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>Order ID</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>Customer Details</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>Delivery Address & Sector</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>Items & Payment</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>SLA / Timing</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>Primary Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                      No delivery orders found matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
                    const isReady = order.status === 'READY';
                    const isDelivered = order.status === 'DELIVERED';

                    return (
                      <tr
                        key={order.id}
                        style={{
                          borderTop: '1px solid #E2E8F0',
                          backgroundColor: '#FFFFFF',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Order ID */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '14px', color: '#000F3F' }}>#{order.id}</strong>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              {order.fulfillmentLabel || 'Standard Delivery'}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: '#0B1C30' }}>
                              {order.customer?.name}
                            </span>
                            {order.customer?.phone && (
                              <a
                                href={`tel:${order.customer.phone}`}
                                style={{
                                  color: '#0051D5',
                                  textDecoration: 'none',
                                  fontSize: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  marginTop: '2px',
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                                  call
                                </span>
                                <span>{order.customer.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Address & Sector */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle', maxWidth: '280px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span
                              style={{
                                color: '#0B1C30',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              title={order.customer?.address}
                            >
                              {order.customer?.address?.split(',')[0]}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: '#64748B',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                marginTop: '2px',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#0051D5' }}>
                                pin_drop
                              </span>
                              <span>{order.sector || order.distance || 'Koramangala'}</span>
                            </span>
                          </div>
                        </td>

                        {/* Items & Payment */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ fontSize: '13px', color: '#0B1C30' }}>
                              ₹{(order.total || 0).toFixed(2)}
                            </strong>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                width: 'fit-content',
                                backgroundColor:
                                  order.paymentMethod?.toLowerCase().includes('cash')
                                    ? '#FEF3C7'
                                    : '#EFF4FF',
                                color:
                                  order.paymentMethod?.toLowerCase().includes('cash')
                                    ? '#C88000'
                                    : '#000F3F',
                              }}
                            >
                              {order.paymentMethod?.toLowerCase().includes('cash') ? 'Cash on Delivery' : 'Pre-paid UPI'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              {order.items?.length || 2} items
                            </span>
                          </div>
                        </td>

                        {/* SLA / Timing */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {isDelivered ? (
                              <>
                                <strong style={{ color: '#16A34A', fontSize: '12px' }}>
                                  {order.deliveredTime || 'Delivered'}
                                </strong>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  {order.deliveredNote || 'Completed'}
                                </span>
                              </>
                            ) : (
                              <>
                                <strong
                                  style={{
                                    color: isOutForDelivery ? '#DC2626' : '#0B1C30',
                                    fontSize: '12px',
                                  }}
                                >
                                  {order.promisedTime ? `Promised ${order.promisedTime}` : 'Est. 45m SLA'}
                                </strong>
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  {order.assignedTime ? `Assigned ${order.assignedTime}` : order.placedAt}
                                </span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                          {isOutForDelivery && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#0051D5',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
                              OUT FOR DELIVERY
                            </span>
                          )}
                          {isReady && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#EFF4FF',
                                color: '#C88000',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#C88000' }} />
                              READY
                            </span>
                          )}
                          {isDelivered && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                backgroundColor: '#DCFCE7',
                                color: '#16A34A',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                                check_circle
                              </span>
                              DELIVERED
                            </span>
                          )}
                        </td>

                        {/* Primary Action Button */}
                        <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                          {isReady && (
                            <button
                              type="button"
                              onClick={() => handleStartDelivery(order.id)}
                              style={{
                                backgroundColor: '#000F3F',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                moped
                              </span>
                              <span>Start Delivery</span>
                            </button>
                          )}

                          {isOutForDelivery && (
                            <button
                              type="button"
                              onClick={() => openUpdateModal(order)}
                              style={{
                                backgroundColor: '#0051D5',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                edit_location_alt
                              </span>
                              <span>Update Delivery</span>
                            </button>
                          )}

                          {isDelivered && (
                            <Link
                              to={`/delivery/orders/${order.id}`}
                              style={{
                                backgroundColor: '#EFF4FF',
                                color: '#0B1C30',
                                textDecoration: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                                visibility
                              </span>
                              <span>View Details</span>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Queue Meta */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#EFF4FF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              fontSize: '12px',
              color: '#64748B',
              borderTop: '1px solid #E2E8F0',
            }}
          >
            <span>
              Showing {filteredOrders.length} queue deliveries for {currentStaff?.name || 'Rider'} ({currentStaff?.code || '#DEL-04'})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#0051D5' }}>
                  wifi
                </span>
                Sync Interval: 30s
              </span>
              <span>Last refreshed: Just now</span>
            </div>
          </div>
        </div>

        {/* 7. Data Boundary Notice Panel */}
        <div
          style={{
            backgroundColor: '#EFF4FF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#000F3F', marginTop: '2px' }}>
            security
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#000F3F', margin: 0 }}>
              Delivery Personnel Privacy & Data Boundary Policy
            </h3>
            <p style={{ fontSize: '12px', color: '#45464F', margin: 0, lineHeight: 1.5 }}>
              Access is strictly scoped to assigned orders for {staffStore?.name || 'Assigned Store'}. Store analytics,
              sales ledgers, customer payment profiles, and catalog administrative settings are restricted. Personal
              rider GPS telemetry is simulated and recorded during active dispatch shifts for operational audit verification.
            </p>
          </div>
        </div>
      </div>

      {/* 8. Update Delivery Modal */}
      {selectedOrderForUpdate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 15, 63, 0.45)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: '480px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#000F3F',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  local_shipping
                </span>
                <strong style={{ fontSize: '15px' }}>Update Order Status</strong>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForUpdate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Order Reference Card */}
              <div
                style={{
                  backgroundColor: '#EFF4FF',
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Order Reference:</span>
                  <strong style={{ color: '#000F3F' }}>#{selectedOrderForUpdate.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Customer:</span>
                  <span style={{ fontWeight: 600, color: '#0B1C30' }}>{selectedOrderForUpdate.customer?.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Address:</span>
                  <span style={{ color: '#0B1C30', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOrderForUpdate.customer?.address}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748B' }}>Payable Due:</span>
                  <strong style={{ color: '#0051D5' }}>
                    ₹{(selectedOrderForUpdate.total || 0).toFixed(2)} (
                    {selectedOrderForUpdate.paymentMethod?.toLowerCase().includes('cash') ? 'Cash on Delivery' : 'Pre-paid UPI'}
                    )
                  </strong>
                </div>
              </div>

              {/* Step Radios */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0B1C30' }}>
                  Select Fulfillment Action
                </label>
                {[
                  {
                    id: 'arrived',
                    title: 'Arrived at Doorstep',
                    desc: 'Customer notification triggered via SMS/App',
                  },
                  {
                    id: 'delivered',
                    title: 'Confirm Handover & Collect OTP',
                    desc: 'Complete delivery and return crate to logs',
                  },
                  {
                    id: 'issue',
                    title: 'Customer Unavailable / Address Issue',
                    desc: 'Flag issue to store dispatch coordinator',
                  },
                ].map((step) => (
                  <label
                    key={step.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: updateStep === step.id ? '#EFF4FF' : '#F8FAFC',
                      border: `1px solid ${updateStep === step.id ? '#0051D5' : '#E2E8F0'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery_step"
                      value={step.id}
                      checked={updateStep === step.id}
                      onChange={() => setUpdateStep(step.id)}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px', color: '#0B1C30' }}>{step.title}</strong>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>{step.desc}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* OTP Field if delivered */}
              {updateStep === 'delivered' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="otp-input" style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Customer Verification OTP (4 Digits)
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 4-digit code (e.g. 4021)"
                    style={{
                      padding: '10px 14px',
                      fontSize: '14px',
                      letterSpacing: '0.2em',
                      fontWeight: 700,
                      backgroundColor: '#EFF4FF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      color: '#000F3F',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Default demo PIN is <strong>4021</strong> or customer SMS code.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div
              style={{
                padding: '12px 20px',
                backgroundColor: '#EFF4FF',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedOrderForUpdate(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FFFFFF',
                  color: '#0B1C30',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmStatusUpdate}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#0051D5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 81, 213, 0.25)',
                }}
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Navigation Map Modal / Drawer */}
      {showMapModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 15, 63, 0.5)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '680px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#000F3F',
                color: '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  map
                </span>
                <strong style={{ fontSize: '15px' }}>Fleet Route Navigation Map</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  width: '100%',
                  height: '260px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCL4JTljZqoe5G0TqOd9CQQZmJdR7nYti6OZSew2MJ-uIKIR0v4VhuCe-uIxZc7qpQoxBcXnci9cfMkfUIJR5ALC3oHxQoBAxJwvW8P8CIf3VQ9tn9-XtdEbbjegQrnUI8e0NN1MqjcKs152Fs_8WZlAUrBEB9o7jGOsakWwqRYmKyNP89MHYPD8WezgdhtS3JUz9apdwFnCO7QDBxdewp7m7NM085GWJ09FvjjOcFCB5a1q2KOcHA')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#0B1C30',
                    fontWeight: 600,
                  }}
                >
                  📍 Active Batch Route: {staffStore?.name} Hub (3 Stops • 4.8 km)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <strong style={{ color: '#0B1C30' }}>Stop Sequence:</strong>
                {assignedOrders.slice(0, 3).map((order, idx) => (
                  <div
                    key={order.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: '#EFF4FF',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#0051D5' : '#64748B',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span style={{ fontWeight: 600, color: '#0B1C30' }}>#{order.id}</span>
                      <span style={{ color: '#64748B' }}>{order.customer?.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#0051D5', fontWeight: 600 }}>
                      {order.distance || '1.2 km'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: '12px 20px',
                backgroundColor: '#EFF4FF',
                display: 'flex',
                justifyContent: 'flex-end',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#000F3F',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 10. Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 60,
            backgroundColor: '#000F3F',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#60A5FA' }}>
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
