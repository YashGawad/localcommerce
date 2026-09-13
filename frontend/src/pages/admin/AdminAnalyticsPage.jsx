import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminKpiCard from '../../components/admin/AdminKpiCard';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  // Platform Analytics Datasets based on selected time range
  const metrics = {
    '7d': {
      gmv: '₹3,42,800',
      revenue: '₹16,450',
      orders: '1,124',
      aov: '₹304',
      gmvGrowth: '+12.4%',
      orderGrowth: '+8.1%',
    },
    '30d': {
      gmv: '₹14,24,600',
      revenue: '₹68,400',
      orders: '4,892',
      aov: '₹291',
      gmvGrowth: '+18.2%',
      orderGrowth: '+14.6%',
    },
    '90d': {
      gmv: '₹42,80,000',
      revenue: '₹2,05,400',
      orders: '14,680',
      aov: '₹291',
      gmvGrowth: '+22.0%',
      orderGrowth: '+19.4%',
    },
    '1y': {
      gmv: '₹1.42 Cr',
      revenue: '₹6,84,000',
      orders: '48,920',
      aov: '₹290',
      gmvGrowth: '+34.5%',
      orderGrowth: '+28.2%',
    },
  }[timeRange];

  // Store performance breakdown
  const storeShares = [
    { name: 'Sharma Supermarket', gmv: '₹5,84,000', orders: 1940, pct: 41, rating: 4.8, color: '#2563EB' },
    { name: 'Shree Kirana & General Store', gmv: '₹4,92,000', orders: 1820, pct: 35, rating: 4.9, color: '#7C3AED' },
    { name: 'Sharma Artisanal Bakery', gmv: '₹2,48,000', orders: 860, pct: 17, rating: 4.7, color: '#0D9488' },
    { name: 'Fresh Greens Organics', gmv: '₹1,00,600', orders: 272, pct: 7, rating: 4.6, color: '#F59E0B' },
  ];

  // Category shares
  const categories = [
    { name: 'Bakery & Dairy', pct: 42, color: '#2563EB' },
    { name: 'Groceries & Staples', pct: 36, color: '#10B981' },
    { name: 'Beverages & Drinks', pct: 14, color: '#F59E0B' },
    { name: 'Household & Personal Care', pct: 8, color: '#64748B' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <AdminPageHeader
        title="Platform Operations & Commercial Analytics"
        subtitle="Network-wide transaction volume, merchant share benchmarks, and fulfillment telemetry across all local clusters"
        badge="Live Telemetry"
        badgeVariant="info"
        actions={
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFFFF', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '90d', label: '90 Days' },
              { id: '1y', label: 'Full Year' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: timeRange === t.id ? '#2563EB' : 'transparent',
                  color: timeRange === t.id ? '#FFFFFF' : '#475569',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Primary KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <AdminKpiCard
          title="Platform Gross Merchandise (GMV)"
          value={metrics.gmv}
          change={metrics.gmvGrowth}
          positive={true}
          icon="payments"
          subtext="Total order volume across all tenants"
          iconColor="#2563EB"
          bgColor="#EFF6FF"
        />
        <AdminKpiCard
          title="Platform Net Commission"
          value={metrics.revenue}
          change="+16.4%"
          positive={true}
          icon="account_balance"
          subtext="Blended take-rate ~4.8%"
          iconColor="#10B981"
          bgColor="#ECFDF5"
        />
        <AdminKpiCard
          title="Network Order Count"
          value={metrics.orders}
          change={metrics.orderGrowth}
          positive={true}
          icon="shopping_cart"
          subtext="Completed deliveries & pickups"
          iconColor="#7C3AED"
          bgColor="#F5F3FF"
        />
        <AdminKpiCard
          title="Average Order Value (AOV)"
          value={metrics.aov}
          change="+₹14 vs prev"
          positive={true}
          icon="shopping_basket"
          subtext="Basket size per customer run"
          iconColor="#F59E0B"
          bgColor="#FFFBEB"
        />
      </div>

      {/* Two-Column Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
        {/* Store Contribution Matrix */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Store GMV Distribution
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Contribution by individual merchant nodes to platform volume
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {storeShares.map((s) => (
              <div key={s.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#172033' }}>{s.name}</span>
                  <span style={{ fontWeight: 700, color: '#172033' }}>
                    {s.gmv} ({s.pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${s.pct}%`,
                      height: '100%',
                      backgroundColor: s.color,
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', marginTop: '3px' }}>
                  <span>{s.orders} fulfilled orders</span>
                  <span>⭐ {s.rating} avg rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share & Fulfillment SLAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category Share */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
              Category Volume Share
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B' }}>
              High-velocity FMCG and grocery categories
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categories.map((c) => (
                <div key={c.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{c.name}</span>
                    <span style={{ fontWeight: 700, color: '#172033' }}>{c.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${c.pct}%`,
                        height: '100%',
                        backgroundColor: c.color,
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fulfillment Telemetry */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
              Network Operational Telemetry
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Avg Doorstep Time</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#172033', marginTop: '2px' }}>
                  24.6 min
                </div>
                <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>Target: &lt; 30 min</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>On-Time Dispatch</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#172033', marginTop: '2px' }}>
                  98.4%
                </div>
                <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>+0.6% this wk</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Cancellation Rate</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#172033', marginTop: '2px' }}>
                  1.2%
                </div>
                <div style={{ fontSize: '10px', color: '#10B981', marginTop: '2px' }}>Industry best &lt; 2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
