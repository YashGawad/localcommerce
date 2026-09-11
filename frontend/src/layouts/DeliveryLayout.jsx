import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import { useAuth } from '../context/AuthContext';

export default function DeliveryLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

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

          <span style={{ color: '#E2E8F0', fontWeight: 600 }}>
            {currentUser?.name || 'Ramesh Patil'}
          </span>

          <Link to="/" style={{ color: '#93C5FD', textDecoration: 'none' }}>
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
            }}
            title="Log Out"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              logout
            </span>
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Delivery View */}
      <main style={{ flex: 1, maxWidth: '900px', width: '100%', margin: '0 auto', padding: '20px 16px' }}>
        <Outlet />
      </main>
    </div>
  );
}
