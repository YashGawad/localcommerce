import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function AdminDashboardPage() {
  const metrics = [
    { title: 'Active Stores', value: '248', change: '+14 this wk', positive: true, icon: 'storefront' },
    { title: 'Total Users', value: '18,642', change: '+312 today', positive: true, icon: 'group' },
    { title: 'Orders Today', value: '426', change: '₹4.82L GMV', positive: true, icon: 'receipt_long' },
    { title: 'Platform GMV (MTD)', value: '₹1.42 Cr', change: '+8.4%', positive: true, icon: 'currency_rupee' },
    { title: 'Pending Reviews', value: '37', change: 'Action Required', positive: false, icon: 'rate_review' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172033', letterSpacing: '-0.015em' }}>
            Platform Admin Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Multi-tenant network monitoring, stores, global catalogs, and moderation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/stores">
            <Button variant="secondary" size="sm" icon="storefront">Manage Stores</Button>
          </Link>
          <Link to="/admin/global-products">
            <Button variant="primary" size="sm" icon="inventory_2">Global Catalog</Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px' }}>
        {metrics.map((m) => (
          <div
            key={m.title}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                {m.title}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                {m.icon}
              </span>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '22px', fontWeight: 800, color: '#172033' }}>{m.value}</span>
              <Badge variant={m.positive ? 'success' : 'warning'} size="sm">{m.change}</Badge>
            </div>
          </div>
        ))}
      </div>

      {/* Architecture Verification Card */}
      <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#172033', marginBottom: '6px' }}>
          Permanent Compact Admin Sidebar Verified
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
          Admin architecture uses a persistent side navigation bar for high-density platform management across Stores, Users, Global Products, Store Listings, Orders, Reviews, and Subscriptions. Full detailed dashboards and data tables will be implemented in <strong>Batch 13–18</strong>.
        </p>
      </div>
    </div>
  );
}
