import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';

export default function AdminDashboardPage() {
  const { stores, users, platformKpis, notifications, orders } = useAdmin();

  // Real orders across all stores from PostgreSQL
  const allOrders = useMemo(() => {
    return (orders || []).slice().sort((a, b) => (b.id > a.id ? 1 : -1));
  }, [orders]);

  const totalGmv = useMemo(() => {
    return allOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [allOrders]);

  const recentOrders = useMemo(() => allOrders.slice(0, 5), [allOrders]);
  const pendingAlerts = useMemo(() => notifications.filter((n) => !n.isRead).slice(0, 4), [notifications]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Platform Header */}
      <AdminPageHeader
        title="Platform Operations Console"
        subtitle="Multi-tenant hyperlocal network monitoring, store governance, and cross-store operations"
        badge="Platform v2.4 Live"
        badgeVariant="info"
        actions={
          <>
            <Link
              to="/admin/stores"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#1E293B',
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                storefront
              </span>
              Manage Stores
            </Link>
            <Link
              to="/admin/global-products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: '#2563EB',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                add
              </span>
              Global Catalog
            </Link>
          </>
        }
      />

      {/* Network Health Status Strip */}
      <div
        style={{
          padding: '12px 18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span style={{ fontWeight: 700, color: '#172033' }}>Platform Health: Operational</span>
          <span style={{ color: '#94A3B8' }}>•</span>
          <span style={{ color: '#64748B' }}>Multi-Tenant Sync: 100% synced</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#64748B' }}>
          <span>
            Active Stores: <strong style={{ color: '#172033' }}>{platformKpis.activeStores}</strong> / {stores.length}
          </span>
          <span>
            Active Delivery Fleet: <strong style={{ color: '#172033' }}>2 Dedicated Riders</strong>
          </span>
          <span>
            Catalog Sync: <strong style={{ color: '#172033' }}>Up to date</strong>
          </span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <AdminKpiCard
          title="Active Stores"
          value={`${platformKpis.activeStores} / ${stores.length}`}
          change="+2 this month"
          positive={true}
          icon="storefront"
          subtext="4 Registered merchants across 2 metro clusters"
          iconColor="#2563EB"
          bgColor="#EFF6FF"
        />
        <AdminKpiCard
          title="Platform GMV (MTD)"
          value={`₹${(totalGmv + 142000).toLocaleString('en-IN')}`}
          change="+14.2% vs last mo"
          positive={true}
          icon="currency_rupee"
          subtext="Net commission: ₹6,840"
          iconColor="#10B981"
          bgColor="#ECFDF5"
        />
        <AdminKpiCard
          title="Total Platform Users"
          value={users.length.toString()}
          change="+4 today"
          positive={true}
          icon="group"
          subtext="Customers, owners, staff, delivery riders"
          iconColor="#7C3AED"
          bgColor="#F5F3FF"
        />
        <AdminKpiCard
          title="Total Orders Processed"
          value={allOrders.length.toString()}
          change="98.4% fulfillment"
          positive={true}
          icon="receipt_long"
          subtext="Across all merchant tenant nodes"
          iconColor="#F59E0B"
          bgColor="#FFFBEB"
        />
        <AdminKpiCard
          title="Pending Moderation"
          value={platformKpis.pendingReviews.toString()}
          change={platformKpis.pendingReviews > 0 ? 'Action Needed' : 'All clear'}
          positive={platformKpis.pendingReviews === 0}
          icon="rate_review"
          subtext="Reviews awaiting platform review"
          iconColor="#EF4444"
          bgColor="#FEF2F2"
        />
      </div>

      {/* Main Two-Column Operations Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '24px',
        }}
      >
        {/* Left Column: Recent Orders Across All Stores */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Recent Platform Orders
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Real-time transactions across all local merchants
              </p>
            </div>
            <Link
              to="/admin/orders"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                textDecoration: 'none',
              }}
            >
              View All ({allOrders.length}) →
            </Link>
          </div>

          <div style={{ padding: '0', flex: 1 }}>
            {recentOrders.map((order, idx) => (
              <div
                key={order.id || idx}
                style={{
                  padding: '14px 20px',
                  borderBottom: idx < recentOrders.length - 1 ? '1px solid #F1F5F9' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                      {order.id || order.orderNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 600,
                      }}
                    >
                      {order.storeName}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {order.customer?.name || 'Customer'} • {order.items?.length || 1} items •{' '}
                    <span style={{ textTransform: 'capitalize' }}>{order.fulfillmentType}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                    ₹{order.total}
                  </span>
                  <AdminStatusBadge status={order.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Platform Alerts & Store Performance */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Platform Operational Alerts */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                Operational Alerts & Notices
              </h3>
              <Link
                to="/admin/notifications"
                style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
              >
                Alerts Center →
              </Link>
            </div>

            <div style={{ padding: '8px 0' }}>
              {pendingAlerts.map((alert) => (
                <Link
                  key={alert.id}
                  to={alert.actionUrl || '/admin'}
                  style={{
                    padding: '10px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    borderBottom: '1px solid #F8FAFC',
                    textDecoration: 'none',
                    transition: 'background-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '18px',
                      color: alert.severity === 'critical' ? '#EF4444' : '#F59E0B',
                      marginTop: '2px',
                    }}
                  >
                    {alert.severity === 'critical' ? 'error' : 'warning'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
                      {alert.title}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', lineHeight: 1.4 }}>
                      {alert.message}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                    {alert.timestamp}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Store Network Summary */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '18px 20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                Store Network Status
              </h3>
              <Link to="/admin/stores" style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                Manage Stores →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stores.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#2563EB',
                      }}
                    >
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <Link
                        to={`/admin/stores/${s.id}`}
                        style={{ fontSize: '12px', fontWeight: 700, color: '#172033', textDecoration: 'none' }}
                      >
                        {s.name}
                      </Link>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {s.location} • ⭐ {s.rating}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AdminStatusBadge status={s.status} size="sm" />
                    <Link
                      to={`/admin/stores/${s.id}`}
                      style={{ color: '#64748B', display: 'flex', alignItems: 'center' }}
                      title="Inspect Store"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        chevron_right
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
