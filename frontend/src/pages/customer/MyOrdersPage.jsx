import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

/**
 * Screen 5 — Customer My Orders (/orders)
 * Shows authenticated customer order history across stores.
 * Supports status tabs (All, Active Delivery, Delivered, Cancelled) and detailed order cards.
 */
export default function MyOrdersPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadOrders() {
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const orders = await orderService.getOrders();
        if (isMounted) {
          setAllOrders(orders);
          setError(null);
        }
      } catch (err) {
        console.error('Failed to load customer orders:', err);
        if (isMounted) setError(err.message || 'Failed to retrieve orders.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'active') {
      return allOrders.filter(
        (o) =>
          o.status === 'PLACED' ||
          o.status === 'CONFIRMED' ||
          o.status === 'PREPARING' ||
          o.status === 'READY' ||
          o.status === 'READY_FOR_PICKUP' ||
          o.status === 'OUT_FOR_DELIVERY'
      );
    }
    if (activeTab === 'delivered') {
      return allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP');
    }
    if (activeTab === 'cancelled') {
      return allOrders.filter((o) => o.status === 'CANCELLED');
    }
    return allOrders;
  }, [allOrders, activeTab]);

  const activeCount = allOrders.filter(
    (o) =>
      o.status === 'PLACED' ||
      o.status === 'CONFIRMED' ||
      o.status === 'PREPARING' ||
      o.status === 'READY' ||
      o.status === 'READY_FOR_PICKUP' ||
      o.status === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredCount = allOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP').length;
  const cancelledCount = allOrders.filter((o) => o.status === 'CANCELLED').length;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 64px 16px' }}>
      {/* Top Breadcrumb & Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748B',
            marginBottom: '8px',
          }}
        >
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: '#172033', fontWeight: 600 }}>My Orders</span>
        </nav>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#172554', margin: 0, letterSpacing: '-0.02em' }}>
              My Orders &amp; Receipts
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
              Platform-wide purchase history from verified local neighborhood stores.
            </p>
          </div>

          <Link
            to="/"
            style={{
              padding: '10px 18px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              storefront
            </span>
            <span>Discover Local Stores</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'all' ? '#172554' : '#F1F5F9',
            color: activeTab === 'all' ? '#FFFFFF' : '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>All Orders</span>
          <span style={{ opacity: 0.85, fontSize: '11px' }}>({allOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('active')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'active' ? '#172554' : '#F1F5F9',
            color: activeTab === 'active' ? '#FFFFFF' : '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          <span>Active Delivery</span>
          <span style={{ opacity: 0.85, fontSize: '11px' }}>({activeCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('delivered')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'delivered' ? '#172554' : '#F1F5F9',
            color: activeTab === 'delivered' ? '#FFFFFF' : '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Delivered / Picked Up</span>
          <span style={{ opacity: 0.85, fontSize: '11px' }}>({deliveredCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'cancelled' ? '#172554' : '#F1F5F9',
            color: activeTab === 'cancelled' ? '#FFFFFF' : '#475569',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>Cancelled</span>
          <span style={{ opacity: 0.85, fontSize: '11px' }}>({cancelledCount})</span>
        </button>
      </div>

      {/* Orders List / Loading / Error / Empty State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#64748B' }}>
          <p style={{ fontSize: '15px' }}>Loading your orders...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: '#DC2626', backgroundColor: '#FEF2F2', borderRadius: '8px', marginBottom: '24px' }}>
          <p>{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '40px auto',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
              receipt_long
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: '0 0 6px 0' }}>
            No orders found
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
            You haven't placed any orders in this category yet.
          </p>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '13px',
            }}
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map((order) => {
            const isActive =
              order.status === 'OUT_FOR_DELIVERY' || order.status === 'ASSIGNED' || order.status === 'READY';
            const isDelivered = order.status === 'DELIVERED';

            return (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: isActive ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                {/* Card Header Strip */}
                <div
                  style={{
                    padding: '12px 20px',
                    backgroundColor: isActive ? '#EFF6FF' : '#F8FAFC',
                    borderBottom: '1px solid #E2E8F0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <strong style={{ color: '#172554', fontWeight: 700 }}>
                      {order.orderNumber}
                    </strong>
                    <span style={{ color: '#94A3B8' }}>•</span>
                    <span style={{ color: '#64748B' }}>{order.date}</span>
                    <span style={{ color: '#94A3B8' }}>•</span>
                    <span style={{ color: '#64748B' }}>{order.fulfillmentLabel || 'Store Delivery'}</span>
                  </div>
                  <div style={{ fontWeight: 700, color: '#172554', fontSize: '15px' }}>
                    ₹{order.total} Total
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Store info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '8px',
                          backgroundColor: '#F1F5F9',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                          storefront
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                            {order.storeName}
                          </h3>
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748B', display: 'block', marginTop: '2px' }}>
                          {order.items?.length || 0} items delivered to {order.deliveryAddress?.area || 'Panch Pakhadi, Thane'}
                        </span>
                        {order.estimatedDelivery && (
                          <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 500, display: 'block', marginTop: '2px' }}>
                            {order.estimatedDelivery}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: isActive ? '#DBEAFE' : isDelivered ? '#ECFDF5' : '#FEE2E2',
                          color: isActive ? '#1D4ED8' : isDelivered ? '#059669' : '#DC2626',
                          textTransform: 'uppercase',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#1D4ED8' : isDelivered ? '#059669' : '#DC2626',
                          }}
                        />
                        <span>{order.statusLabel}</span>
                      </span>
                    </div>
                  </div>

                  {/* Active delivery mini telemetry banner */}
                  {isActive && (
                    <div
                      style={{
                        backgroundColor: '#F8FAFC',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                          two_wheeler
                        </span>
                        <span style={{ fontSize: '13px', color: '#172033', fontWeight: 500 }}>
                          Rider {order.deliveryPartner?.name || 'Rahul S.'} is en route to your drop location
                        </span>
                      </div>
                      <a
                        href={`tel:${order.storePhone || '+912225428891'}`}
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#2563EB',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                          phone
                        </span>
                        <span>Call Store</span>
                      </a>
                    </div>
                  )}

                  {/* Items Summary Strip */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      backgroundColor: '#F8FAFC',
                      padding: '10px 14px',
                      borderRadius: '8px',
                    }}
                  >
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          color: '#334155',
                          backgroundColor: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                        <span style={{ fontWeight: 500 }}>{item.title || item.name}</span>
                        <span style={{ color: '#64748B' }}>({item.quantity}x)</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Footer Actions */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '8px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Paid via {order.paymentMethod} {order.invoiceNumber && `• Invoice ${order.invoiceNumber}`}
                    </span>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Link
                        to={`/orders/${order.id}`}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isActive ? '#2563EB' : '#F1F5F9',
                          color: isActive ? '#FFFFFF' : '#172033',
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
                          {isActive ? 'navigation' : 'info'}
                        </span>
                        <span>{isActive ? 'Track Live Order' : 'Order Details'}</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
