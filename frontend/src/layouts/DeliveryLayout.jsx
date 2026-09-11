import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import { useAuth } from '../context/AuthContext';
import { useDeliveryStaff } from '../hooks/useDeliveryStaff';

export default function DeliveryLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currentStaff, staffStore } = useDeliveryStaff();
  const [onDuty, setOnDuty] = useState(true);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FF' }}>
      {/* Delivery Header */}
      <header
        style={{
          height: '60px',
          backgroundColor: '#172554',
          color: '#FFFFFF',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Logo variant="delivery" to="/delivery" />
          {staffStore && (
            <span
              style={{
                fontSize: '12px',
                color: '#93C5FD',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '3px 10px',
                borderRadius: '12px',
                fontWeight: 500,
              }}
              className="hidden sm:inline-block"
            >
              {staffStore.name}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
          {/* On Duty Toggle */}
          <button
            type="button"
            onClick={() => setOnDuty(!onDuty)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '16px',
              backgroundColor: onDuty ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${onDuty ? '#10B981' : '#EF4444'}`,
              color: onDuty ? '#A7F3D0' : '#FCA5A5',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Toggle Duty Status"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: onDuty ? '#10B981' : '#EF4444',
              }}
            />
            <span>{onDuty ? 'On Duty' : 'Off Duty'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentStaff?.avatar || 'VR'}
            </span>
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
              {currentStaff?.name || 'Vikram Rao'}
            </span>
            {currentStaff?.code && (
              <span style={{ color: '#94A3B8', fontSize: '11px' }}>
                ({currentStaff.code})
              </span>
            )}
          </div>

          <Link
            to="/"
            style={{ color: '#93C5FD', textDecoration: 'none', fontWeight: 500 }}
            className="hidden md:inline"
          >
            Storefront
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#FCA5A5',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 8px',
              borderRadius: '4px',
            }}
            title="Log Out"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              logout
            </span>
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Delivery View */}
      <main style={{ flex: 1, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '16px 20px',
          fontSize: '12px',
          color: '#64748B',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span>© 2026 LocalCommerce Logistics Partner Network. Hyperlocal dispatch.</span>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Support Hotline: 1800-LOCAL-OPS</span>
          <span>Dispatch Protocol v2.4</span>
        </div>
      </footer>
    </div>
  );
}
