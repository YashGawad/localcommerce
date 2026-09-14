import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OrderStatusTimeline from '../../components/customer/OrderStatusTimeline';
import orderService, { normalizeOrder } from '../../services/orderService';

/**
 * Screen 3 — Customer Order Confirmation (/order-confirmation)
 * Displays immediate order success, human-readable real order number,
 * live progression timeline, item manifest, store hotline, and "Track Live Order" CTA.
 */
export default function OrderConfirmationPage() {
  const location = useLocation();

  const [order, setOrder] = useState(() => {
    return location.state?.order ? normalizeOrder(location.state.order) : null;
  });
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order) return;

    let isMounted = true;
    async function loadLatestOrder() {
      try {
        setLoading(true);
        const orders = await orderService.getOrders();
        if (isMounted && orders.length > 0) {
          setOrder(orders[0]);
        }
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLatestOrder();
    return () => {
      isMounted = false;
    };
  }, [order]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '60px auto', padding: '0 16px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '16px', fontSize: '15px', fontWeight: 600 }}>Loading Order Confirmation...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', padding: '32px 16px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>
          receipt_long
        </span>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554', marginTop: '12px' }}>
          No Recent Order Found
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
          You have not placed an order in this session.
        </p>
        <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
          <button
            type="button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Explore Stores
          </button>
        </Link>
      </div>
    );
  }

  const timelineToUse = order.timeline || [];

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '85vh', paddingBottom: '64px' }}>
      {/* Top Banner Section */}
      <section
        style={{
          backgroundColor: '#EFF6FF',
          borderBottom: '1px solid #DBEAFE',
          padding: '36px 16px',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Breadcrumb & Live status tag */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
              <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
                Home
              </Link>
              <span>/</span>
              <span style={{ color: '#172033', fontWeight: 600 }}>Order Confirmation</span>
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '999px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#2563EB',
                }}
              />
              <span>Live Merchant Dispatch Active</span>
            </div>
          </div>

          {/* Success Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                    check_circle
                  </span>
                </div>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      verified
                    </span>
                    <span>Order Confirmed • Merchant Terminal Notified</span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#172554', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                    Order Placed Successfully!
                  </h1>
                  <p style={{ fontSize: '15px', color: '#475569', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                    Thank you, <strong>{order.deliveryAddress?.recipientName || 'Amit'}</strong>!{' '}
                    <strong>{order.storeName}</strong> has accepted your order and their store partner is actively packing your items.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  to={`/orders/${order.id}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    near_me
                  </span>
                  <span>Track Live Order</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    arrow_forward
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#172033',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    receipt_long
                  </span>
                  <span>Invoice Receipt</span>
                </button>
              </div>
            </div>

            {/* Order Meta Strips */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #F1F5F9',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '20px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Order Reference
                </span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#172554' }}>
                  {order.orderNumber}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Placed At
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                  {order.placedAt || 'Today, Just now'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Estimated Delivery
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600, fontSize: '14px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    schedule
                  </span>
                  <span>{order.estimatedDelivery || '20–35 mins'}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                  Total Amount Paid
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#172554' }}>
                    ₹{order.total}
                  </span>
                  <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '4px', fontWeight: 600 }}>
                    {order.paymentMethod || 'UPI'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Grid */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '32px auto 0 auto',
          padding: '0 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Fulfillment Pipeline & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 2, minWidth: 0 }}>
          {/* Order Progression Timeline Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  Order Progression
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Real-time sync with {order.storeName} counter terminal
                </p>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  padding: '3px 8px',
                  borderRadius: '4px',
                }}
              >
                In Progress
              </span>
            </div>

            <OrderStatusTimeline timeline={timelineToUse} fulfillmentType={order.fulfillmentType} />
          </div>

          {/* Items Manifest Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 16px 0' }}>
              Ordered Items ({order.items?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #F1F5F9',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94A3B8' }}>
                          inventory_2
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#172554', margin: 0 }}>
                        {item.title || item.name}
                      </h4>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {item.variant} • Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown summary */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#172554', fontSize: '15px', paddingTop: '6px' }}>
                <span>Total Paid</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Store Details & Drop Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: '300px' }}>
          {/* Store Info Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB' }}>
                storefront
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>
                Merchant Details
              </h3>
            </div>
            <strong style={{ fontSize: '14px', color: '#172033', display: 'block' }}>
              {order.storeName}
            </strong>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 12px 0', lineHeight: 1.4 }}>
              {order.storeAddress || 'Hariniwas Circle, Panch Pakhadi, Thane West'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#2563EB', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                call
              </span>
              <span>Hotline: {order.storePhone || '+91 22 2542 8891'}</span>
            </div>
          </div>

          {/* Delivery Address Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB' }}>
                location_on
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>
                {order.fulfillmentType === 'pickup' ? 'Pickup Location' : 'Delivery Address'}
              </h3>
            </div>
            <strong style={{ fontSize: '14px', color: '#172033', display: 'block' }}>
              {order.deliveryAddress?.recipientName} ({order.deliveryAddress?.type})
            </strong>
            <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
              {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.area}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
            </p>
            {order.deliveryAddress?.phone && (
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                Phone: {order.deliveryAddress.phone}
              </span>
            )}
          </div>

          {/* Continue Shopping Link */}
          <div style={{ textAlign: 'center' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563EB',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              <span>Back to Home Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
