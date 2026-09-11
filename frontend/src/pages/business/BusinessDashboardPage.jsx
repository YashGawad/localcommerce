import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';
import { useCatalog } from '../../context/CatalogContext';

export default function BusinessDashboardPage() {
  const { currentStore, storeProducts } = useCatalog();
  const [timeFilter, setTimeFilter] = useState('7d');

  // Filter low stock and out of stock products dynamically from store catalog
  const lowStockItems = storeProducts.filter(
    (p) => p.stock <= p.lowStockThreshold
  );

  // Mock recent orders matching Stitch design
  const recentOrders = [
    {
      id: '#ORD-1084',
      customer: 'Rahul Verma',
      items: '3 items (Milk, Bread, Eggs)',
      total: '₹285.00',
      status: 'Pending',
      statusVariant: 'warning',
      time: '12 mins ago',
    },
    {
      id: '#ORD-1083',
      customer: 'Priya Sharma',
      items: '5 items (Atta, Oil, Salt)',
      total: '₹640.00',
      status: 'Processing',
      statusVariant: 'info',
      time: '28 mins ago',
    },
    {
      id: '#ORD-1082',
      customer: 'Ankit Patel',
      items: '2 items (Cola, Biscuits)',
      total: '₹125.00',
      status: 'Ready',
      statusVariant: 'success',
      time: '45 mins ago',
    },
    {
      id: '#ORD-1081',
      customer: 'Sneha Gupta',
      items: '4 items (Dairy & Produce)',
      total: '₹410.00',
      status: 'Delivered',
      statusVariant: 'neutral',
      time: '1 hour ago',
    },
  ];

  // Dynamic values depending on selected time filter
  const salesStats = {
    '7d': { current: '₹84,250', previous: '₹74,890', growth: '+12.5%' },
    '30d': { current: '₹3,42,800', previous: '₹3,10,200', growth: '+10.5%' },
    '90d': { current: '₹9,86,450', previous: '₹8,92,100', growth: '+10.6%' },
  }[timeFilter];

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
            Overview of {currentStore?.name || 'your store'}'s performance and daily operations.
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
              ₹84,250
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
                backgroundColor: '#ECFDF5',
                color: '#047857',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
              12.5%
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            vs previous 7 days
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
              126
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
                backgroundColor: '#ECFDF5',
                color: '#047857',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
              8.2%
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            vs previous 7 days
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
              84
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
                backgroundColor: '#ECFDF5',
                color: '#047857',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
              5.4%
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            vs previous 7 days
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
                backgroundColor: '#FFFBEB',
                color: '#D97706',
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
              8
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
                backgroundColor: '#FEF3C7',
                color: '#92400E',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#D97706',
                  display: 'inline-block',
                }}
              />
              Needs attention
            </span>
          </div>
          <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748B' }}>
            Awaiting store action
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
              Revenue over time
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {/* Indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                <span style={{ color: '#172033' }}>
                  Current period: <strong style={{ color: '#172554' }}>{salesStats.current}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: '#94A3B8' }} />
                <span style={{ color: '#64748B' }}>
                  Previous period: <strong>{salesStats.previous}</strong>
                </span>
              </div>
            </div>

            {/* Filter Buttons */}
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

        {/* Lightweight SVG Comparison Chart */}
        <div style={{ position: 'relative', width: '100%', height: '240px', paddingTop: '16px' }}>
          <svg
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
            preserveAspectRatio="none"
            viewBox="0 0 1000 220"
          >
            <defs>
              <linearGradient id="primaryAreaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="20" y2="20" />
            <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="75" y2="75" />
            <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="130" y2="130" />
            <line stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" x1="45" x2="980" y1="185" y2="185" />

            {/* Y-Axis Ticks */}
            <text fontSize="11" fill="#94A3B8" x="5" y="24">₹16k</text>
            <text fontSize="11" fill="#94A3B8" x="5" y="79">₹12k</text>
            <text fontSize="11" fill="#94A3B8" x="5" y="134">₹8k</text>
            <text fontSize="11" fill="#94A3B8" x="5" y="189">₹4k</text>

            {/* Previous Period Dashed Trendline */}
            <path
              d="M 60,140 Q 210,125 360,110 T 660,95 T 960,65"
              fill="none"
              opacity="0.6"
              stroke="#94A3B8"
              strokeDasharray="4 4"
              strokeWidth="2"
            />

            {/* Current Period Area Fill */}
            <path
              d="M 60,150 C 130,135 180,120 230,120 C 310,120 340,95 400,95 C 470,95 500,45 570,45 C 640,45 690,80 750,80 C 820,80 870,40 960,30 L 960,205 L 60,205 Z"
              fill="url(#primaryAreaGrad)"
            />

            {/* Current Period Solid Trendline */}
            <path
              d="M 60,150 C 130,135 180,120 230,120 C 310,120 340,95 400,95 C 470,95 500,45 570,45 C 640,45 690,80 750,80 C 820,80 870,40 960,30"
              fill="none"
              stroke="#2563EB"
              strokeLinecap="round"
              strokeWidth="2.5"
            />

            {/* Interactive Highlight Point */}
            <g transform="translate(570, 45)">
              <line opacity="0.5" stroke="#2563EB" strokeDasharray="3 3" strokeWidth="1.5" x1="0" x2="0" y1="0" y2="160" />
              <circle cx="0" cy="0" fill="#2563EB" r="6" />
              <circle cx="0" cy="0" fill="#FFFFFF" r="3" />
            </g>

            {/* X-Axis Labels */}
            <text fontSize="11" fill="#64748B" textAnchor="middle" x="60" y="215">Day 1</text>
            <text fontSize="11" fill="#64748B" textAnchor="middle" x="210" y="215">Day 2</text>
            <text fontSize="11" fill="#64748B" textAnchor="middle" x="360" y="215">Day 3</text>
            <text fontSize="11" fill="#172554" fontWeight="600" textAnchor="middle" x="570" y="215">Peak Day</text>
            <text fontSize="11" fill="#64748B" textAnchor="middle" x="710" y="215">Day 5</text>
            <text fontSize="11" fill="#64748B" textAnchor="middle" x="830" y="215">Day 6</text>
            <text fontSize="11" fill="#64748B" textAnchor="end" x="980" y="215">Today</text>
          </svg>

          {/* Tooltip Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '57%',
              transform: 'translateX(-50%)',
              backgroundColor: '#172554',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              borderRadius: '6px',
              padding: '6px 12px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Peak Volume</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>₹14,200</span>
              <span style={{ color: '#6EE7B7', fontSize: '11px', fontWeight: 400 }}>(+14%)</span>
            </div>
          </div>
        </div>
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
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#D97706' }}>
              notifications_active
            </span>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#172554', margin: 0 }}>
              Needs Attention
            </h2>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            3 active alerts
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {/* Action 1 */}
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
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>8 orders pending</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Awaiting store confirmation</div>
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

          {/* Action 2 */}
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
                  {lowStockItems.length} items low / out of stock
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Requires immediate restocking</div>
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

          {/* Action 3 */}
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
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#64748B', flexShrink: 0 }} />
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#172554' }}>2 delivery assignments</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Rider pending pickup</div>
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
              <span>View Fulfillment</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </Link>
          </div>
        </div>
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
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>Latest customer transactions</p>
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
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#172554' }}>
                      {order.id}
                      <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 400 }}>{order.time}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#172033' }}>
                      <div>{order.customer}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{order.items}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      {order.total}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <Badge variant={order.statusVariant} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
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
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0' }}>Products requiring attention</p>
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
                        SKU: {item.sku} • {item.unit}
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
                        Min: {item.lowStockThreshold}
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
