import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function DeliveryLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FF' }}>
      {/* Delivery Header */}
      <header
        style={{
          height: '60px',
          backgroundColor: '#172554',
          color: '#FFFFFF',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Logo variant="delivery" to="/delivery" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10B981',
              color: '#A7F3D0',
              fontWeight: 600,
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            On Duty
          </div>
          <Link to="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>
            Storefront
          </Link>
        </div>
      </header>

      {/* Main Delivery View */}
      <main style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        <Outlet />
      </main>
    </div>
  );
}
