import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminHeader() {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Breadcrumbs & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1, maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>domain</span>
          <span style={{ fontWeight: 600, color: '#172033' }}>Console</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span>Operations</span>
        </div>

        <div style={{ position: 'relative', width: '100%' }}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748B',
              fontSize: '17px',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search stores, users, orders, SKUs..."
            style={{
              width: '100%',
              height: '34px',
              padding: '0 12px 0 32px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#172033',
            }}
          />
        </div>
      </div>

      {/* Right: Environment status, alerts, Admin switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#172033',
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          Production MMR
        </div>

        <Link
          to="/admin/notifications"
          style={{
            padding: '6px',
            borderRadius: '6px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
          title="Platform Alerts"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#EF4444',
            }}
          />
        </Link>

        <Link
          to="/"
          style={{
            fontSize: '12px',
            color: '#2563EB',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: '#EFF6FF',
          }}
          title="Return to Customer Storefront"
        >
          Customer Storefront →
        </Link>
      </div>
    </header>
  );
}
