import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import OrderStatusTimeline from '../../components/customer/OrderStatusTimeline';
import orderService from '../../services/orderService';
import paymentService from '../../services/paymentService';

/**
 * Screen 4 — Customer Order Tracking (/orders/:id)
 * Features live order progression timeline, assigned rider card with call action,
 * store hotline, order summary manifest, and payment sandbox controls.
 */
export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Payment simulation state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await orderService.getOrderById(id);
        if (isMounted) {
          setOrder(data);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to load order details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    if (id) {
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSimulatePayment = async (success) => {
    if (!order) return;
    try {
      setPaymentLoading(true);
      setPaymentMessage(null);
      if (success) {
        await paymentService.mockPaymentSuccess(order.id);
        setPaymentMessage({ type: 'success', text: 'Payment successfully processed! Order marked as PAID.' });
      } else {
        await paymentService.mockPaymentFailure(order.id, 'Card declined by simulated bank');
        setPaymentMessage({ type: 'error', text: 'Payment simulation: transaction was declined (FAILED).' });
      }
      // Refresh order to reflect updated payment status
      const updated = await orderService.getOrderById(order.id);
      setOrder(updated);
    } catch (err) {
      console.error('Payment simulation error:', err);
      setPaymentMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Payment simulation failed',
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 16px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '3px solid #E2E8F0',
            borderTopColor: '#2563EB',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px',
          }}
        />
        <p style={{ color: '#64748B', fontSize: '15px' }}>Loading real order tracking details...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ maxWidth: '640px', margin: '64px auto', padding: '32px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#EF4444', marginBottom: '12px' }}>
          error
        </span>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554', marginBottom: '8px' }}>
          Unable to Find Order
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
          {error || 'This order does not exist or you do not have permission to view it.'}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link
            to="/orders"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Back to My Orders
          </Link>
          <button
            type="button"
            onClick={fetchOrder}
            style={{
              padding: '10px 20px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #CBD5E1',
              color: '#475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isDelivery = order.fulfillmentType === 'delivery';
  const isCod = order.payment_method === 'cod' || order.paymentMethod?.toLowerCase().includes('cash');
  const isPaymentPending = order.paymentStatus === 'PENDING';
  const isPaymentPaid = order.paymentStatus === 'PAID';
  const isPaymentFailed = order.paymentStatus === 'FAILED';

  // Delivery partner fallback info if backend does not yet assign riders
  const deliveryPartner = order.deliveryPartner || {
    name: 'Ramesh Shinde',
    initials: 'RS',
    role: 'Express Fleet Captain',
    status: order.status === 'OUT_FOR_DELIVERY' ? 'Out for delivery' : 'Assigned to Hub',
    phone: '+919820199201',
    rating: '4.9',
  };

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
                backgroundColor:
                  order.statusBadgeVariant === 'success'
                    ? '#ECFDF5'
                    : order.statusBadgeVariant === 'error'
                    ? '#FEF2F2'
                    : '#EFF6FF',
                color:
                  order.statusBadgeVariant === 'success'
                    ? '#059669'
                    : order.statusBadgeVariant === 'error'
                    ? '#DC2626'
                    : '#2563EB',
                textTransform: 'uppercase',
              }}
            >
              {order.statusLabel}
            </span>

            {/* Payment Status Pill */}
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '999px',
                backgroundColor: isPaymentPaid ? '#ECFDF5' : isPaymentFailed ? '#FEF2F2' : '#FFFBEB',
                color: isPaymentPaid ? '#059669' : isPaymentFailed ? '#DC2626' : '#D97706',
                textTransform: 'uppercase',
              }}
            >
              {isPaymentPaid ? 'Paid' : isPaymentFailed ? 'Payment Failed' : isCod ? 'COD Pending' : isPaymentPending ? 'Payment Pending' : order.paymentStatus}
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
          {/* Payment simulation notification banner */}
          {paymentMessage && (
            <div
              style={{
                backgroundColor: paymentMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${paymentMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                color: paymentMessage.type === 'success' ? '#065F46' : '#991B1B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {paymentMessage.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{paymentMessage.text}</span>
            </div>
          )}

          {/* Payment Action Card for Non-COD orders */}
          {!isCod && (
            <div
              style={{
                backgroundColor: isPaymentPaid ? '#F0FDF4' : '#FFFBEB',
                borderRadius: '12px',
                border: `1px solid ${isPaymentPaid ? '#BBF7D0' : '#FDE68A'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: isPaymentPaid ? '#16A34A' : '#D97706' }}>
                    {isPaymentPaid ? 'verified' : 'payments'}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#172554' }}>
                      {isPaymentPaid ? 'Payment Received & Verified' : 'Online Payment Simulation (Sandbox)'}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Method: <strong>{order.paymentMethod}</strong> • Amount: <strong>₹{order.total}</strong> • Current Status: <strong style={{ color: isPaymentPaid ? '#16A34A' : isPaymentFailed ? '#DC2626' : '#D97706' }}>{order.paymentStatus}</strong>
                    </p>
                  </div>
                </div>

                {isPaymentPaid ? (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '4px 10px', borderRadius: '6px' }}>
                    SETTLED
                  </span>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() => handleSimulatePayment(true)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: paymentLoading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        check_circle
                      </span>
                      <span>{paymentLoading ? 'Processing...' : 'Simulate Payment Success'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() => handleSimulatePayment(false)}
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#DC2626',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: paymentLoading ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        cancel
                      </span>
                      <span>Simulate Payment Failure</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* COD Notice Card */}
          {isCod && (
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#475569' }}>
                payments
              </span>
              <div>
                <strong style={{ fontSize: '14px', color: '#172554', display: 'block' }}>
                  Cash on Delivery (COD) Order
                </strong>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                  Please keep <strong>₹{order.total}</strong> in cash or ready via UPI upon arrival. Online sandbox payment simulation is disabled for COD orders.
                </p>
              </div>
            </div>
          )}

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
                <strong>Fulfillment Mode:</strong> {order.fulfillmentLabel}
              </span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Status: {order.statusLabel}</span>
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
                LIVE_STATUS_ENGINE
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
                  Doorstep & Pickup Verification
                </strong>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                  Match order reference #{order.orderNumber || order.id} upon arrival for zero-friction handover.
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Staff Assigned Card (if delivery) */}
          {isDelivery && (
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
                    {deliveryPartner.initials}
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
                      {deliveryPartner.name}
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
                      ★ {deliveryPartner.rating}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                    {deliveryPartner.role}
                  </span>
                  <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 500, display: 'block' }}>
                    {deliveryPartner.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${deliveryPartner.phone}`}
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
              {order.items?.map((item, idx) => (
                <div
                  key={item.id || idx}
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
                    ₹{item.total || item.price * item.quantity}
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
              {order.taxAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax</span>
                  <span>₹{order.taxAmount}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#172554', fontSize: '15px', paddingTop: '6px' }}>
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Payment Method: <strong>{order.paymentMethod}</strong> • Status: <strong>{order.paymentStatus}</strong>
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
                {isDelivery ? 'home_pin' : 'storefront'}
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172554', margin: 0 }}>
                {isDelivery ? 'Delivery Drop Location' : 'Store Pickup Location'}
              </h3>
            </div>
            {order.deliveryAddress ? (
              <>
                <strong style={{ fontSize: '14px', color: '#172033' }}>
                  {order.deliveryAddress.recipientName || order.deliveryAddress.recipient_name} ({order.deliveryAddress.phone || 'No phone'})
                </strong>
                <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
                  {order.deliveryAddress.addressLine || order.deliveryAddress.address_line1}
                  {order.deliveryAddress.area ? `, ${order.deliveryAddress.area}` : ''}
                  {order.deliveryAddress.city ? `, ${order.deliveryAddress.city}` : ''}
                  {order.deliveryAddress.pincode ? ` - ${order.deliveryAddress.pincode}` : ''}
                </p>
                {order.customerNotes && (
                  <p style={{ fontSize: '12px', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '6px 8px', borderRadius: '4px', margin: '8px 0 0 0' }}>
                    <strong>Note:</strong> {order.customerNotes}
                  </p>
                )}
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 6px 0', lineHeight: 1.4 }}>
                Pickup in person at <strong>{order.storeName}</strong> counter.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
