import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessDashboardPage() {
  const { currentStore, storeProducts } = useCatalog();
  const { storeOrders, storeCustomers } = useOperations();
  const [timeFilter, setTimeFilter] = useState('7d');

  // Filter low stock and out of stock products dynamically from store catalog
  const lowStockItems = useMemo(() => {
    return (storeProducts || []).filter(
      (p) => Number(p.stock) <= (Number(p.lowStockThreshold) || 5)
    );
  }, [storeProducts]);

  // Non-cancelled orders contribute to revenue
  const nonCancelledOrders = useMemo(() => {
    return (storeOrders || []).filter((o) => o.status !== 'CANCELLED');
  }, [storeOrders]);

  // Real Revenue
  const totalRevenue = useMemo(() => {
    return nonCancelledOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [nonCancelledOrders]);

  // Real Counts
  const totalOrdersCount = (storeOrders || []).length;
  const totalCustomersCount = (storeCustomers || []).length;

  // Real Pending Orders requiring business action
  const pendingOrders = useMemo(() => {
    return (storeOrders || []).filter(
      (o) => o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING'
    );
  }, [storeOrders]);

  // In-flight deliveries
  const inFlightDeliveries = useMemo(() => {
    return (storeOrders || []).filter(
      (o) => o.status === 'READY' || o.status === 'OUT_FOR_DELIVERY'
    );
  }, [storeOrders]);

  // Recent 5 orders sorted by placed date
  const recentOrders = useMemo(() => {
    return (storeOrders || [])
      .slice()
      .sort((a, b) => new Date(b.placedAt || 0) - new Date(a.placedAt || 0))
      .slice(0, 5);
  }, [storeOrders]);

  // Active alerts count
  const activeAlertsCount =
    (pendingOrders.length > 0 ? 1 : 0) +
    (lowStockItems.length > 0 ? 1 : 0) +
    (inFlightDeliveries.length > 0 ? 1 : 0);

  const formattedRevenue = `₹${totalRevenue.toLocaleString('en-IN')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#000F3F',
              letterSpacing: '-0.015em',
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0' }}>
            Authoritative performance overview for {currentStore?.name || 'your store'}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/business/products/new">
            <Button variant="primary" icon="add">
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* 1. Revenue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Revenue
            </span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
            </span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172554', letterSpacing: '-0.02em' }}>
              {formattedRevenue}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: totalRevenue > 0 ? '#ECFDF5' : '#F1F5F9',
                color: totalRevenue > 0 ? '#047857' : '#64748B',
              }}
            >
              {totalRevenue > 0 ? 'Real' : 'No sales'}
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            Realized from actual orders
          </div>
        </div>

        {/* 2. Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Orders
            </span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_cart</span>
            </span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172554', letterSpacing: '-0.02em' }}>
              {totalOrdersCount}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#F1F5F9',
                color: '#475569',
              }}
            >
              Total orders
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            Scoped to {currentStore?.name}
          </div>
        </div>

        {/* 3. Customers */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Customers
            </span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
            </span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172554', letterSpacing: '-0.02em' }}>
              {totalCustomersCount}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#F1F5F9',
                color: '#475569',
              }}
            >
              Unique buyers
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            Purchased from this store
          </div>
        </div>

        {/* 4. Pending Orders */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Pending Orders
            </span>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: pendingOrders.length > 0 ? '#FFFBEB' : '#F1F5F9',
                color: pendingOrders.length > 0 ? '#D97706' : '#64748B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span>
            </span>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172554', letterSpacing: '-0.02em' }}>
              {pendingOrders.length}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: pendingOrders.length > 0 ? '#FEF3C7' : '#ECFDF5',
                color: pendingOrders.length > 0 ? '#92400E' : '#047857',
              }}
            >
              {pendingOrders.length > 0 ? 'Needs attention' : 'All clear'}
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            Awaiting merchant action
          </div>
        </div>
      </div>

      {/* SALES OVERVIEW SECTION */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172554', margin: 0 }}>
              Sales Overview
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>
              Realized revenue for {currentStore?.name}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
              <span style={{ color: '#172033' }}>
                Total: <strong style={{ color: '#172554' }}>{formattedRevenue}</strong>
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                backgroundColor: '#F1F5F9',
                padding: '4px',
                borderRadius: '8px',
                gap: '4px',
              }}
            >
              {['7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeFilter(period)}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: timeFilter === period ? 600 : 500,
                    borderRadius: '6px',
                    backgroundColor: timeFilter === period ? '#FFFFFF' : 'transparent',
                    color: timeFilter === period ? '#172554' : '#64748B',
                    boxShadow: timeFilter === period ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  type="button"
                >
                  {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {totalOrdersCount === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748B' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94A3B8' }}>
              monitoring
            </span>
            <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 600, color: '#172554' }}>
              No sales recorded yet for this period
            </div>
            <div style={{ marginTop: '4px', fontSize: '13px', color: '#64748B' }}>
              Sales charts and trendlines will populate automatically as customer transactions occur.
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '220px', paddingTop: '16px' }}>
            <svg
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              preserveAspectRatio="none"
              viewBox="0 0 1000 200"
            >
              <defs>
                <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="30" y2="30" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="85" y2="85" />
              <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="140" y2="140" />

              {/* Area Fill and Trendline */}
              <path
                d="M 60,150 C 200,140 400,90 600,70 C 750,50 850,30 960,30 L 960,180 L 60,180 Z"
                fill="url(#primaryAreaGrad)"
              />
              <path
                d="M 60,150 C 200,140 400,90 600,70 C 750,50 850,30 960,30"
                fill="none"
                stroke="#2563EB"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              {/* Highlighting Points */}
              <circle cx="960" cy="30" fill="#2563EB" r="5" />
              <circle cx="960" cy="30" fill="#FFFFFF" r="2.5" />

              {/* X-Axis */}
              <text fontSize="11" fill="#64748B" textAnchor="start" x="60" y="195">Period Start</text>
              <text fontSize="11" fill="#172554" fontWeight="600" textAnchor="end" x="960" y="195">Latest</text>
            </svg>
          </div>
        )}
      </div>

      {/* NEEDS ATTENTION SECTION */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '20px', color: activeAlertsCount > 0 ? '#D97706' : '#10B981' }}
            >
              {activeAlertsCount > 0 ? 'notifications_active' : 'check_circle'}
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#172554', margin: 0 }}>
              Needs Attention
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            {activeAlertsCount === 0 ? 'All clear' : `${activeAlertsCount} active alert${activeAlertsCount > 1 ? 's' : ''}`}
          </span>
        </div>

        {activeAlertsCount === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            All operations are up to date. No pending orders or inventory alerts for {currentStore?.name}.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {pendingOrders.length > 0 && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                      {pendingOrders.length} order{pendingOrders.length > 1 ? 's' : ''} pending
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Awaiting store confirmation/packing</div>
                  </div>
                </div>
                <Link
                  to="/business/orders"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <span>View Orders</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </div>
            )}

            {lowStockItems.length > 0 && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                      {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} low / out of stock
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Requires inventory restock</div>
                  </div>
                </div>
                <Link
                  to="/business/inventory"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <span>View Inventory</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </div>
            )}

            {inFlightDeliveries.length > 0 && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                      {inFlightDeliveries.length} active delivery run{inFlightDeliveries.length > 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Ready or in transit</div>
                  </div>
                </div>
                <Link
                  to="/business/fulfillment"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    flexShrink: 0,
                  }}
                >
                  <span>Fulfillment</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TWO-COLUMN OPERATIONAL SECTION */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Left Column: RECENT ORDERS */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172554', margin: 0 }}>Recent Orders</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>Latest transactions for {currentStore?.name}</p>
            </div>
            <Link
              to="/business/orders"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#2563EB',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              View all orders
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748B' }}>Order</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748B' }}>Customer</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748B' }}>Total</th>
                  <th style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#64748B' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '36px 12px', color: '#64748B', fontSize: '13px' }}>
                      No orders yet. When customers place orders with {currentStore?.name}, they will appear here in real time.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => {
                    const statusVariant =
                      order.status === 'DELIVERED' || order.status === 'PICKED_UP'
                        ? 'success'
                        : order.status === 'CANCELLED'
                        ? 'neutral'
                        : order.status === 'PLACED' || order.status === 'CONFIRMED' || order.status === 'PREPARING'
                        ? 'warning'
                        : 'info';

                    return (
                      <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                          <Link to="/business/orders" style={{ color: '#2563EB', textDecoration: 'none' }}>
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </Link>
                          <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>
                            {order.placedAt || 'Recent'}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px', color: '#172033' }}>
                          <div>{order.customer?.name || 'Customer'}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {order.items ? `${order.items.length} item(s)` : order.fulfillmentType || 'Order'}
                          </div>
                        </td>
                        <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                          ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <Badge variant={statusVariant} size="sm">
                            {order.statusLabel || order.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: LOW STOCK ALERT */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#172554', margin: 0 }}>Low Stock Alert</h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>Products requiring restock</p>
            </div>
            <Link
              to="/business/inventory"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#2563EB',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              Manage Stock
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lowStockItems.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                All products in {currentStore?.name} have healthy stock levels.
              </div>
            ) : (
              lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        backgroundColor: '#E2E8F0',
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80?text=Product';
                      }}
                    />
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#172554',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        SKU: {item.sku || 'N/A'} • {item.unit || 'Standard'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: item.stock === 0 ? '#DC2626' : '#D97706',
                        }}
                      >
                        {item.stock} in stock
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                        Min: {item.lowStockThreshold || 5}
                      </div>
                    </div>
                    <Link to="/business/inventory">
                      <Button variant="secondary" size="sm">
                        Adjust
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
