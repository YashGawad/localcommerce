import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F6F5F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      {/* Centered Brand Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Logo size="large" to="/" />
      </div>

      {/* Main Authentication Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
          padding: '32px 28px',
        }}
      >
        <Outlet />
      </div>

      {/* Footer Navigation */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748B' }}>
        <Link to="/" style={{ color: '#2563EB', fontWeight: 500 }}>
          ← Return to Marketplace
        </Link>
      </div>
    </div>
  );
}
