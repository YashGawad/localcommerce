import React, { useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDeliveryStaff } from '../../hooks/useDeliveryStaff';

export default function DeliveryDetailsPage() {
  const { id } = useParams();
  const {
    currentStaff,
    staffStore,
    storeAllOrders,
    updateOrderStatus,
  } = useDeliveryStaff();

  // Find order by ID
  const order = useMemo(() => {
    return (
      storeAllOrders?.find(
        (o) =>
          o.id.toLowerCase() === id?.toLowerCase() ||
          o.orderNumber?.toLowerCase() === `#${id?.toLowerCase()}` ||
          o.id.replace(/[^0-9]/g, '') === id?.replace(/[^0-9]/g, '')
      ) || storeAllOrders?.[0]
    );
  }, [storeAllOrders, id]);

  // Local interaction state
  const [otp, setOtp] = useState(['', '', '', '']);
  const [photoAttached, setPhotoAttached] = useState(false);
  const [riderRemarks, setRiderRemarks] = useState('');
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureReason, setFailureReason] = useState('Customer Unavailable / Door Locked / Unreachable');
  const [failureNotes, setFailureNotes] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // OTP input refs for auto-focus
  const otpRef1 = useRef(null);
  const otpRef2 = useRef(null);
  const otpRef3 = useRef(null);
  const otpRef4 = useRef(null);
  const otpRefs = [otpRef1, otpRef2, otpRef3, otpRef4];

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  // Complete delivery
  const handleCompleteDelivery = (e) => {
    e.preventDefault();
    if (!order) return;

    const enteredOtp = otp.join('') || '4021';
    updateOrderStatus(order.id, 'DELIVERED', {
      handoverOtp: enteredOtp,
      handoverPhotoAttached: photoAttached,
      riderRemarks: riderRemarks || 'Handed directly to customer at door',
      deliveredAt: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    });

    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4500);
  };

  // Handle failure submission
  const handleSubmitFailure = (e) => {
    e.preventDefault();
    if (!order) return;

    updateOrderStatus(order.id, 'CANCELLED', {
      cancelReason: `Delivery Failed: ${failureReason}`,
      failureNotes,
      statusLabel: 'Delivery Failed',
      statusBadgeVariant: 'error',
    });

    setShowFailureModal(false);
    alert(`Delivery marked as failed. Return thermal crate to ${staffStore?.name || 'store'} hub counter.`);
  };

  if (!order) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', color: '#0B1C30' }}>Order #{id} Not Found</h2>
        <p style={{ color: '#64748B', marginTop: '8px' }}>
          This order might not be assigned to your fleet run or belongs to another store branch.
        </p>
        <Link
          to="/delivery"
          style={{
            display: 'inline-block',
            marginTop: '16px',
            padding: '8px 18px',
            backgroundColor: '#0051D5',
            color: '#FFFFFF',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Back to Deliveries
        </Link>
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED';
  const isCOD = order.paymentMethod?.toLowerCase().includes('cash');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Top Context & Sticky Action Anchor */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <Link
              to="/delivery"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#0051D5',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                arrow_back
              </span>
              <span>Back to Deliveries</span>
            </Link>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B' }}>{staffStore?.name}</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <strong style={{ color: '#000F3F' }}>Delivery #{order.id}</strong>
          </div>

          {/* Multi-Tenant Scope Identifier Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#EFF4FF',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#0B1C30',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0051D5' }}>
              storefront
            </span>
            <span>
              Store Branch: {staffStore?.name} (#{staffStore?.id === 'store_01' ? '0102' : '0204'})
            </span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#316BF3' }} />
          </div>
        </div>
      </div>

      {/* 2. Operational Header Block */}
      <div
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.02)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Identification & Active Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#000F3F', margin: 0 }}>
                Delivery Details
              </h1>

              {/* Status Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: isDelivered ? '#DCFCE7' : '#DBE1FF',
                  color: isDelivered ? '#16A34A' : '#00174B',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {!isDelivered && (
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0051D5' }} />
                )}
                {isDelivered && (
                  <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                    check_circle
                  </span>
                )}
                <span>{order.statusLabel || order.status}</span>
              </div>

              {/* Vehicle Pill */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  backgroundColor: '#EFF4FF',
                  color: '#45464F',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  two_wheeler
                </span>
                <span>{order.fulfillmentLabel || 'Express Run'}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', flexWrap: 'wrap' }}>
              <strong style={{ color: '#0B1C30' }}>Order #{order.id}</strong>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0051D5' }}>
                  person_pin
                </span>
                Assigned to <strong style={{ color: '#0B1C30' }}>{currentStaff?.name || 'Vikram Rao'}</strong> (Rider ID: {currentStaff?.code || '#DEL-04'})
              </span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                  schedule
                </span>
                Est. Arrival: <strong style={{ color: '#0B1C30' }}>{order.estimatedDelivery || '10:52 AM (In 4 mins)'}</strong>
              </span>
            </div>
          </div>

          {/* Action Cluster */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {!isDelivered && (
              <button
                type="button"
                onClick={() => setShowFailureModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF4FF',
                  color: '#BA1A1A',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  report_problem
                </span>
                <span>Report Issue / Failed</span>
              </button>
            )}

            {!isDelivered && order.status === 'READY' && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
                    alert(`Order #${order.orderNumber || order.id} is now Out for Delivery!`);
                  } catch (err) {
                    alert(err.response?.data?.message || err.message || 'Failed to start delivery');
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  local_shipping
                </span>
                <span>Start Delivery</span>
              </button>
            )}

            {!isDelivered ? (
              <button
                type="button"
                onClick={() => {
                  document.getElementById('handover-section')?.scrollIntoView({ behavior: 'smooth' });
                  otpRef1.current?.focus();
                }}

                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  backgroundColor: '#0051D5',
                  color: '#FFFFFF',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 81, 213, 0.25)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  task_alt
                </span>
                <span>Mark as Delivered</span>
              </button>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  check_circle
                </span>
                <span>Completed & Closed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Grid (Two Columns: 7 cols left, 5 cols right) */}
      <div style={{ width: '100%', padding: '24px 20px 60px' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN (Col 1-7) */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            className="lg:col-span-7"
          >
            {/* A. Realtime Logistics Timeline Stepper */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  borderBottom: '1px solid #EFF4FF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#0051D5' }}>
                    route
                  </span>
                  <strong style={{ fontSize: '16px', color: '#000F3F' }}>
                    Delivery Lifecycle Progress
                  </strong>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#64748B',
                    backgroundColor: '#EFF4FF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Live GPS Tracker Active
                </span>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '8px' }}>
                {/* Connector line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '23px',
                    top: '12px',
                    bottom: '12px',
                    width: '2px',
                    backgroundColor: '#E2E8F0',
                  }}
                />

                {[
                  {
                    step: 1,
                    title: '1. Order Ready & Packed',
                    time: '10:15 AM',
                    note: `Packed at Counter Rack B-2. Verified items into sealed thermal crate.`,
                    completed: true,
                  },
                  {
                    step: 2,
                    title: '2. Dispatched via Express Rider',
                    time: '10:30 AM',
                    note: `Handed over to ${currentStaff?.name || 'Vikram Rao'} (${currentStaff?.vehicle || 'Two-wheeler'}). Cold chain locked at 4°C.`,
                    completed: true,
                  },
                  {
                    step: 3,
                    title: '3. Out for Delivery (In Transit)',
                    time: order.assignedTime || '10:42 AM',
                    note: 'Rider navigating 17th Main Road, Koramangala 4th Block (~350m from gate).',
                    completed: isDelivered || order.status === 'OUT_FOR_DELIVERY',
                    active: order.status === 'OUT_FOR_DELIVERY',
                  },
                  {
                    step: 4,
                    title: '4. Completed Handover',
                    time: isDelivered ? (order.deliveredAt || '10:55 AM') : 'Pending OTP Verification',
                    note: isDelivered
                      ? 'Customer PIN verified. Contactless doorstep drop validated.'
                      : 'Awaiting 4-digit recipient PIN or signed proof-of-delivery.',
                    completed: isDelivered,
                    pending: !isDelivered,
                  },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: item.completed
                          ? (item.active ? '#000F3F' : '#0051D5')
                          : '#EFF4FF',
                        color: item.completed ? '#FFFFFF' : '#64748B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: item.active ? '3px solid #DBE1FF' : 'none',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {item.completed ? (item.active ? 'local_shipping' : 'check') : 'inventory_2'}
                      </span>
                    </div>

                    <div
                      style={{
                        flex: 1,
                        backgroundColor: item.active ? '#EFF4FF' : 'transparent',
                        padding: item.active ? '12px' : '0',
                        borderRadius: item.active ? '8px' : '0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '13px', color: item.active ? '#000F3F' : '#0B1C30' }}>
                          {item.title}
                        </strong>
                        <span style={{ fontSize: '12px', color: item.active ? '#0051D5' : '#64748B', fontWeight: item.active ? 700 : 400 }}>
                          {item.time}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#45464F', margin: '4px 0 0', lineHeight: 1.4 }}>
                        {item.note}
                      </p>

                      {/* Mini Telemetry Progress Bar */}
                      {item.active && (
                        <div
                          style={{
                            marginTop: '8px',
                            width: '100%',
                            height: '5px',
                            backgroundColor: '#CBD5E1',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div style={{ width: '80%', height: '100%', backgroundColor: '#0051D5', borderRadius: '3px' }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* B. Recipient & Drop-off Destination Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                  borderBottom: '1px solid #EFF4FF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#0051D5' }}>
                    pin_drop
                  </span>
                  <strong style={{ fontSize: '16px', color: '#000F3F' }}>
                    Recipient & Drop-off Destination
                  </strong>
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#0B1C30',
                    backgroundColor: '#EFF4FF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#0051D5' }}>
                    navigation
                  </span>
                  {order.distance || '1.2 km'} from Store
                </span>
              </div>

              {/* Customer Info Row */}
              <div
                style={{
                  backgroundColor: '#EFF4FF',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#000F3F',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  >
                    {order.customer?.name ? order.customer.name.slice(0, 2).toUpperCase() : 'RS'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ fontSize: '15px', color: '#0B1C30' }}>
                        {order.customer?.name || 'Rahul Sharma'}
                      </strong>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#FFDDB8',
                          color: '#2A1700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                          stars
                        </span>
                        {order.customer?.tier || 'Gold Tier'}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      {order.customer?.pastOrdersCount || 42} lifetime store orders • Koramangala Resident
                    </span>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={`tel:${order.customer?.phone || '+919876543210'}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#FFFFFF',
                      color: '#000F3F',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0051D5' }}>
                      call
                    </span>
                    <span>Call Customer</span>
                  </a>

                  <a
                    href={`https://wa.me/${(order.customer?.phone || '919876543210').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      backgroundColor: '#FFFFFF',
                      color: '#000F3F',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#316BF3' }}>
                      chat
                    </span>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Address & Navigation */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
                      Detailed Street Address
                    </span>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#0B1C30', margin: '4px 0 0', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {order.customer?.streetAddress || order.customer?.address}
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#EFF4FF', padding: '10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                      Prominent Landmark
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0B1C30', fontSize: '13px', marginTop: '2px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#0051D5' }}>
                        flag
                      </span>
                      <span>{order.customer?.landmark || 'Opposite Koramangala Club Gate 2'}</span>
                    </div>
                  </div>

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(order.customer?.address || 'Koramangala, Bangalore')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      backgroundColor: '#000F3F',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      directions
                    </span>
                    <span>Open in Google Maps Navigation</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      open_in_new
                    </span>
                  </a>
                </div>

                {/* Visual Route Preview Container */}
                <div
                  style={{
                    height: '180px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAc-FXqHinilNpyE5i9tb3ZYMdGuSaNDsTW599IZ0Mxc_hme-gLagiWV9qd43_0yrtdP4bNdGcvFmMh6shT5JybnweWYgfGOxNMOW9d7hNWLt_zwdF5K7lo4DjK5AKXYiKhmpQ_U0lArgwzdMJQx0D-6YCvRoXsflB6HlQmBcz0ed4JnS3V_ncXFfe93XEOwEZaPkpUJsdpszMtfo_lr9xPbwZyDqh66GNXl1pXiOhwOwpuqW2BOiI')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'flex-end',
                    padding: '10px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(4px)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#0B1C30' }}>Route: 17th Main</span>
                    <strong style={{ color: '#0051D5' }}>6 mins traffic</strong>
                  </div>
                </div>
              </div>

              {/* Customer Note Callout */}
              {order.customer?.customerNote && (
                <div
                  style={{
                    backgroundColor: '#EFF4FF',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0051D5', marginTop: '2px' }}>
                    speaker_notes
                  </span>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0B1C30', textTransform: 'uppercase' }}>
                      Customer Gate & Delivery Instructions
                    </span>
                    <p style={{ fontSize: '13px', color: '#0B1C30', fontStyle: 'italic', margin: '2px 0 0' }}>
                      “{order.customer.customerNote}”
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* C. Packed Line Items Verification Table */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '14px',
                  marginBottom: '14px',
                  borderBottom: '1px solid #EFF4FF',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#0051D5' }}>
                    receipt_long
                  </span>
                  <strong style={{ fontSize: '16px', color: '#000F3F' }}>
                    Manifest Items Breakdown ({order.items?.length || 4} Items)
                  </strong>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    color: '#0B1C30',
                    backgroundColor: '#EFF4FF',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 600,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#0051D5' }}>
                    verified
                  </span>
                  Thermal Crate #4 Sealed
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#EFF4FF', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 600 }}>SKU & Product Details</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>Handling Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.items || []).map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #EFF4FF' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: '#0B1C30', display: 'block' }}>{item.title}</strong>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{item.unit || 'Standard Pack'}</span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                          {item.quantity} units
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#0B1C30' }}>
                          ₹{(item.total || item.price || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#DBE1FF',
                              color: '#00174B',
                              fontWeight: 600,
                            }}
                          >
                            {item.handlingNote || 'Chilled 4°C'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  backgroundColor: '#EFF4FF',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#45464F',
                }}
              >
                <span>Thermal Insulation Check: <strong>{order.thermalSeal || 'Pass (Seal #402-V)'}</strong></span>
                <span>Total Item Weight: <strong>{order.totalWeight || '~2.85 kg'}</strong></span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Col 8-12) */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            className="lg:col-span-5"
          >
            {/* A. Payment & Cash Collection Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px' }}>
                <strong style={{ fontSize: '16px', color: '#000F3F' }}>
                  Payment & Collection Status
                </strong>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '12px',
                    backgroundColor: isCOD ? '#FEF3C7' : '#DCFCE7',
                    color: isCOD ? '#C88000' : '#16A34A',
                  }}
                >
                  {isCOD ? 'COLLECT COD' : 'PAID IN FULL'}
                </span>
              </div>

              {/* Amount to collect card */}
              <div
                style={{
                  backgroundColor: '#EFF4FF',
                  padding: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  margin: '8px 0 16px',
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                    Amount to Collect at Door
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0B1C30' }}>
                    ₹{isCOD ? (order.total || 0).toFixed(2) : '0.00'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {isCOD ? 'Collect cash before handover' : 'No cash or UPI collection required'}
                  </span>
                </div>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0051D5',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                    payments
                  </span>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#64748B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Channel</span>
                  <strong style={{ color: '#0B1C30' }}>{order.paymentDetails || order.paymentMethod || 'Razorpay UPI'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Items Subtotal</span>
                  <span style={{ color: '#0B1C30' }}>₹{(order.subtotal || 323).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0051D5' }}>
                  <span>Promotional Discount</span>
                  <span>-₹{(order.discount || 20).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Express Delivery Fee</span>
                  <span style={{ color: '#0B1C30' }}>₹{(order.deliveryFee || 25).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Taxes & GST</span>
                  <span style={{ color: '#0B1C30' }}>₹{(order.taxes || 12).toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid #E2E8F0',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#000F3F',
                  }}
                >
                  <span>Total Transaction Value</span>
                  <span>₹{(order.total || 340).toFixed(2)}</span>
                </div>
              </div>

              {/* COD Fallback Notice */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#64748B',
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ color: '#0B1C30' }}>Operational Protocol: </strong>
                Verify sealed crate state prior to customer handover. In case of UPI payment at doorstep, dynamic rider QR is accessible in staff companion.
              </div>
            </div>

            {/* B. Recipient Handover Verification Console */}
            <div
              id="handover-section"
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#0051D5' }}>
                  fingerprint
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#000F3F', margin: 0 }}>
                  Recipient Handover Verification
                </h2>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px', lineHeight: 1.4 }}>
                Execute proof-of-delivery handover sequence. Obtain customer 4-digit SMS OTP code or record physical signature.
              </p>

              <form onSubmit={handleCompleteDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 4-Digit OTP Box */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#0B1C30' }}>
                      Customer Delivery OTP (4 Digits)
                    </label>
                    <button
                      type="button"
                      onClick={() => alert(`OTP resent to customer: ${order.customer?.phone || '+91 98765-43210'}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '12px',
                        color: '#0051D5',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        placeholder="•"
                        disabled={isDelivered}
                        style={{
                          width: '52px',
                          height: '52px',
                          textAlign: 'center',
                          fontSize: '22px',
                          fontWeight: 700,
                          backgroundColor: '#EFF4FF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          outline: 'none',
                          color: '#000F3F',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Proof of Drop Photo */}
                <div
                  style={{
                    backgroundColor: '#EFF4FF',
                    padding: '12px',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748B',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        photo_camera
                      </span>
                    </div>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0B1C30', display: 'block' }}>
                        Proof-of-Drop Photo
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        Recommended for contactless doorsteps
                      </span>
                    </div>
                  </div>

                  <label
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#000F3F',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{photoAttached ? 'Retake' : 'Upload / Snap'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={() => setPhotoAttached(true)}
                    />
                  </label>
                </div>

                {photoAttached && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0051D5' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      check_circle
                    </span>
                    <span>Photo attached (doorstep_drop_402.jpg)</span>
                  </div>
                )}

                {/* Remarks Input */}
                <div>
                  <label htmlFor="rider-remarks" style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Rider Delivery Remarks (Optional)
                  </label>
                  <input
                    id="rider-remarks"
                    type="text"
                    value={riderRemarks}
                    onChange={(e) => setRiderRemarks(e.target.value)}
                    placeholder="e.g. Handed directly to customer at door"
                    disabled={isDelivered}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: '13px',
                      backgroundColor: '#EFF4FF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      outline: 'none',
                      color: '#0B1C30',
                    }}
                  />
                </div>

                {/* Submit Confirmation Button */}
                <button
                  type="submit"
                  disabled={isDelivered}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isDelivered ? '#CBD5E1' : '#0051D5',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: isDelivered ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isDelivered ? 'none' : '0 4px 10px rgba(0, 81, 213, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    verified
                  </span>
                  <span>{isDelivered ? 'Delivery Completed' : 'Confirm Delivery & Complete Task'}</span>
                </button>
              </form>

              {/* Inline Success Feedback */}
              {showSuccessToast && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '14px',
                    backgroundColor: '#0051D5',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 12px rgba(0, 81, 213, 0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    task_alt
                  </span>
                  <div>
                    <strong style={{ fontSize: '13px', display: 'block' }}>Task Completed Successfully</strong>
                    <span style={{ fontSize: '12px' }}>
                      Order #{order.id} marked as delivered. Crate returned to inventory logs.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* C. Operations Dispatch Log */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ fontSize: '15px', color: '#000F3F' }}>Dispatch & Security Logs</strong>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Immutable Audit</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <strong style={{ color: '#0B1C30', minWidth: '64px' }}>10:42 AM</strong>
                  <span>Rider {currentStaff?.name || 'Vikram Rao'} started GPS navigation from Store Hub.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <strong style={{ color: '#0B1C30', minWidth: '64px' }}>10:30 AM</strong>
                  <span>Assigned by automated routing algorithm to batch route #{staffStore?.name?.slice(0, 3).toUpperCase() || 'HUB'}-04.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <strong style={{ color: '#0B1C30', minWidth: '64px' }}>10:15 AM</strong>
                  <span>Counter manager verified insulated thermal bag seal QR.</span>
                </div>
              </div>
            </div>

            {/* D. Multi-Tenant Isolation Callout */}
            <div
              style={{
                backgroundColor: '#EFF4FF',
                padding: '14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                border: '1px solid #E2E8F0',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B', marginTop: '2px' }}>
                shield
              </span>
              <p style={{ fontSize: '11px', color: '#45464F', margin: 0, lineHeight: 1.5 }}>
                <strong>Multi-Tenant Dispatch Security:</strong> Transaction data and customer records are isolated strictly to {staffStore?.name} (#{staffStore?.id === 'store_01' ? '0102' : '0204'}). Access limited to authorized delivery personnel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Delivery Failure Drawer / Modal */}
      {showFailureModal && (
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
              maxWidth: '520px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#EFF4FF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#BA1A1A' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  warning
                </span>
                <strong style={{ fontSize: '16px' }}>Report Delivery Failure</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowFailureModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  close
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmitFailure} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Select the reason this delivery could not be fulfilled for Order #{order.id}. The items will be slated for reverse logistics back to {staffStore?.name}.
              </p>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#0B1C30', display: 'block', marginBottom: '8px' }}>
                  Failure Reason
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    'Customer Unavailable / Door Locked / Unreachable',
                    'Inaccurate Address / Gate Refused Entry',
                    'Customer Refused Package / Order Cancelled',
                    'Damaged in Transit / Cold Chain Leakage',
                  ].map((reason) => (
                    <label
                      key={reason}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        backgroundColor: failureReason === reason ? '#EFF4FF' : '#F8FAFC',
                        border: `1px solid ${failureReason === reason ? '#0051D5' : '#E2E8F0'}`,
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#0B1C30',
                      }}
                    >
                      <input
                        type="radio"
                        name="fail_reason"
                        value={reason}
                        checked={failureReason === reason}
                        onChange={(e) => setFailureReason(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="failure-notes" style={{ fontSize: '12px', fontWeight: 600, color: '#0B1C30', display: 'block', marginBottom: '4px' }}>
                  Operator Clarification Notes
                </label>
                <textarea
                  id="failure-notes"
                  rows={3}
                  value={failureNotes}
                  onChange={(e) => setFailureNotes(e.target.value)}
                  placeholder="Describe customer interaction or building security remarks..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    backgroundColor: '#EFF4FF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    outline: 'none',
                    color: '#0B1C30',
                    resize: 'none',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: '#FFDAD6',
                  color: '#93000A',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  keyboard_return
                </span>
                <span>Rider must return thermal crate #4 to {staffStore?.name} counter immediately.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowFailureModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#EFF4FF',
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
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    backgroundColor: '#BA1A1A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Submit Failure & Slated Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
