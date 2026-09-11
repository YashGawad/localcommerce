import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

/**
 * Business Dashboard Shell (Batch 1 Foundation)
 * Full KPIs, charts, and recent activity will be implemented in Batch 7.
 */
export default function BusinessDashboardPage() {
  const kpis = [
    { title: 'Today\'s Revenue', value: '₹84,250', change: '+12.5%', positive: true, icon: 'payments' },
    { title: 'Active Orders', value: '126', change: '+8.2%', positive: true, icon: 'receipt_long' },
    { title: 'Customers', value: '84', change: '+5.4%', positive: true, icon: 'person' },
    { title: 'Pending Dispatch', value: '8', change: 'Needs Action', positive: false, icon: 'pending_actions' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172554', letterSpacing: '-0.015em' }}>
            Store Dashboard
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Sharma Supermarket (Koramangala, Bangalore) • Daily overview
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/business/products">
            <Button variant="primary" icon="add">Add Product</Button>
          </Link>
          <Link to="/business/orders">
            <Button variant="secondary" icon="receipt_long">View Orders</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.title}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                {kpi.title}
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                {kpi.icon}
              </span>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#172554', letterSpacing: '-0.02em' }}>
                {kpi.value}
              </span>
              <Badge variant={kpi.positive ? 'success' : 'warning'} size="sm">
                {kpi.change}
              </Badge>
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
              vs previous 7 days
            </div>
          </div>
        ))}
      </div>

      {/* Notice Banner */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="info" size="sm">Batch 1 Active</Badge>
          <strong style={{ fontSize: '14px', color: '#172033' }}>Top Navigation &amp; Hamburger Menu Architecture Verified</strong>
        </div>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
          Click the hamburger icon (<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu</span>) in the top bar to open the complete multi-department Business application navigation (Overview, Catalog, Operations, Customers, Growth, Team, System). Full Stitch charts and data tables will be populated in <strong>Batch 7</strong>.
        </p>
      </div>
    </div>
  );
}
