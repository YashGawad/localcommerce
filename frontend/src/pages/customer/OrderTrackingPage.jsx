import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_ORDERS } from '../../data/orders';
import OrderStatusTimeline from '../../components/customer/OrderStatusTimeline';

/**
 * Screen 4 — Customer Order Tracking (/orders/:id)
 * Features live order progression timeline, assigned rider card with call action,
 * store hotline, and order summary manifest.
 */
export default function OrderTrackingPage() {
  const { id } = useParams();

  // Find order from localStorage or MOCK_ORDERS
  const order = useMemo(() => {
    try {
      const local = JSON.parse(localStorage.getItem('localcommerce_orders') || '[]');
      const foundLocal = local.find(
        (o) => o.id === id || o.id === `LC-${id}` || o.orderNumber === `#LC-${id}` || o.orderNumber === id
      );
      if (foundLocal) return foundLocal;
    } catch {
      // Ignore
    }

    const foundMock = MOCK_ORDERS.find(
      (o) => o.id === id || o.id === `LC-${id}` || o.orderNumber === `#LC-${id}` || o.orderNumber === id
    );
    return foundMock || MOCK_ORDERS[0];
  }, [id]);

  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 64px 16px' }}>
      {/* Top Breadcrumbs */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '16px',
        }}
      >
        <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
          Home
        </Link>
        <span>/</span>
        <Link to="/orders" style={{ color: '#64748B', textDecoration: 'none' }}>
          My Orders
        </Link>
        <span>/</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>Tracking {order.orderNumber}</span>
      </nav>

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '28px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#172554', margin: 0, letterSpacing: '-0.02em' }}>
              Order Tracking {order.orderNumber}
            </h1>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: order.statusBadgeVariant === 'success' ? '#ECFDF5' : '#EFF6FF',
                color: order.statusBadgeVariant === 'success' ? '#059669' : '#2563EB',
                textTransform: 'uppercase',
              }}
            >
              {order.statusLabel}
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '6px 0 0 0' }}>
            {order.storeName} • {isDelivery ? `Estimated delivery: ${order.estimatedDelivery || '20–35 mins'}` : 'Counter pickup'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => window.print()}
            style={{
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              receipt_long
            </span>
            <span>Receipt</span>
          </button>
          <a
            href={`tel:${order.storePhone || '+912225428891'}`}
            style={{
              padding: '8px 14px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              call
            </span>
            <span>Contact Store</span>
          </a>
        </div>
      </div>

      {/* Main Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Tracking & Staff Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 2, minWidth: 0 }}>
          {/* Telemetry banner */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '10px',
              border: '1px solid #BFDBFE',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#1E40AF',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                near_me
              </span>
              <span>
                <strong>Transit Route:</strong> Hariniwas Circle → Panch Pakhadi
              </span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Avg Pace: 18 km/h</span>
          </div>

          {/* Fulfillment Progression Timeline Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#172554', margin: 0 }}>
                Fulfillment Progression
              </h2>
              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                LOCAL_EXPRESS_v2
              </span>
            </div>

            <OrderStatusTimeline timeline={order.timeline} fulfillmentType={order.fulfillmentType} />

            {/* Doorstep Verification Notice */}
            <div
              style={{
                marginTop: '24px',
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                verified_user
              </span>
              <div>
                <strong style={{ fontSize: '13px', color: '#172554', display: 'block' }}>
                  Streamlined Doorstep Verification
                </strong>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  No OTP required. Your rider matches package ID #{order.id} upon arrival for zero-friction handover.
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Staff Assigned Card (if delivery) */}
          {isDelivery && order.deliveryPartner && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      backgroundColor: '#172554',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}
                  >
                    {order.deliveryPartner.initials || 'RS'}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      border: '2px solid #FFFFFF',
                    }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172033', margin: 0 }}>
                      {order.deliveryPartner.name}
                    </h3>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#D97706',
                        backgroundColor: '#FEF3C7',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      ★ {order.deliveryPartner.rating}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    {order.deliveryPartner.role}
                  </span>
                  <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 500, display: 'block' }}>
                    {order.deliveryPartner.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${order.deliveryPartner.phone}`}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    call
                  </span>
                  <span>Call Rider</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Info & Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, minWidth: '300px' }}>
          {/* Order Details Manifest Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '0 0 14px 0' }}>
              Order Manifest
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '10px',
                    borderBottom: '1px solid #F1F5F9',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '6px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94A3B8' }}>
                          inventory_2
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#172033', margin: 0 }}>
                        {item.title || item.name}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        Qty: {item.quantity} × ₹{item.price}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#64748B' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Fee</span>
                <span>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#172554', fontSize: '15px', paddingTop: '6px' }}>
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Paid via {order.paymentMethod} • {order.paymentDetails || 'Direct Settlement'}
              </div>
            </div>
          </div>

          {/* Delivery Drop Location Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                home_pin
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>
                {isDelivery ? 'Drop Location' : 'Store Pickup Location'}
              </h3>
            </div>
            <strong style={{ fontSize: '14px', color: '#172033' }}>
              {order.deliveryAddress?.recipientName} ({order.deliveryAddress?.type})
            </strong>
            <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
              {order.deliveryAddress?.addressLine}, {order.deliveryAddress?.area}, {order.deliveryAddress?.city}
            </p>
            {order.deliveryAddress?.landmark && (
              <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                Landmark: {order.deliveryAddress.landmark}
              </span>
            )}
            {order.deliveryAddress?.deliveryNote && (
              <p style={{ fontSize: '12px', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '6px 8px', borderRadius: '4px', margin: '8px 0 0 0' }}>
                <strong>Note:</strong> {order.deliveryAddress.deliveryNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
