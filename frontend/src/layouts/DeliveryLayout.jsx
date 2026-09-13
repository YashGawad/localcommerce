import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/shared/Logo';
import { useAuth } from '../context/AuthContext';
import { useDeliveryStaff } from '../hooks/useDeliveryStaff';
import { CatalogProvider } from '../context/CatalogContext';
import { OperationsProvider } from '../context/OperationsContext';
import styles from './DeliveryLayout.module.css';

function DeliveryLayoutInner() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { currentStaff, staffStore } = useDeliveryStaff();
  const [onDuty, setOnDuty] = useState(true);

  return (
    <div className={styles.container}>
      {/* Delivery Header */}
      <header className={styles.header}>
        <div className={styles.leftGroup}>
          <Logo variant="delivery" to="/delivery" />
          {staffStore && (
            <span className={styles.storeBadge}>
              {staffStore.name}
            </span>
          )}
        </div>

        <div className={styles.rightGroup}>
          {/* On Duty Toggle */}
          <button
            type="button"
            onClick={() => setOnDuty(!onDuty)}
            className={styles.dutyBtn}
            style={{
              backgroundColor: onDuty ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              border: `1px solid ${onDuty ? '#10B981' : '#EF4444'}`,
              color: onDuty ? '#A7F3D0' : '#FCA5A5',
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

          <div className={styles.staffContainer}>
            <span className={styles.staffAvatar}>
              {currentStaff?.avatar || 'VR'}
            </span>
            <span className={styles.staffName}>
              {currentStaff?.name || 'Vikram Rao'}
            </span>
          </div>

          <Link
            to="/"
            className={styles.storefrontLink}
          >
            Storefront
          </Link>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className={styles.exitBtn}
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

export default function DeliveryLayout() {
  return (
    <CatalogProvider>
      <OperationsProvider>
        <DeliveryLayoutInner />
      </OperationsProvider>
    </CatalogProvider>
  );
}
