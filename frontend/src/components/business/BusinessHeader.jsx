import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { useNotifications } from '../../context/NotificationsContext';
import styles from './BusinessHeader.module.css';

export default function BusinessHeader({ onOpenNav }) {
  const {
    currentStore: selectedStore,
    setCurrentStore: setSelectedStore,
    availableStores,
    isOnline,
    setIsOnline,
  } = useCatalog();
  const [isStoreSwitcherOpen, setIsStoreSwitcherOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Left: Hamburger + Logo + Store Switcher */}
        <div className={styles.leftGroup}>
          {/* Hamburger button for COMPLETE business navigation */}
          <button
            onClick={onOpenNav}
            className={styles.hamburgerBtn}
            title="Open Application Navigation"
            aria-label="Open Navigation Drawer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              menu
            </span>
          </button>

          <div className={styles.brandWrapper}>
            <Logo variant="business" to="/business" />
          </div>

          {/* Store Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setIsStoreSwitcherOpen(!isStoreSwitcherOpen);
                setIsStatusMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className={styles.storeSwitcherBtn}
              title="Switch active store"
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className={styles.storeNameText}>
                  {selectedStore.name}
                </span>
                <span className={styles.storeLocationText}>
                  {selectedStore.location}
                </span>
              </div>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>
                expand_more
              </span>
            </button>

            {/* Store Switcher Dropdown */}
            {isStoreSwitcherOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '6px',
                  width: '260px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
                  border: '1px solid #E2E8F0',
                  padding: '6px 0',
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Switch Active Store
                </div>
                {(availableStores || []).map((store) => (
                  <button
                    key={store.id}
                    onClick={() => {
                      setSelectedStore(store);
                      setIsStoreSwitcherOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      backgroundColor: store.id === selectedStore.id ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>{store.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{store.city || store.address || ''}</div>
                    </div>
                    {store.id === selectedStore.id && (
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                        check
                      </span>
                    )}
                  </button>
                ))}

                <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={() => {
                      setIsStoreSwitcherOpen(false);
                      navigate('/business/create-store');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      textAlign: 'left',
                      backgroundColor: 'transparent',
                      color: '#2563EB',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      add_circle
                    </span>
                    <span>Create New Store</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Global Search */}
        <div className={styles.searchContainer}>
          <span
            className="material-symbols-outlined"
            style={{
              position: 'absolute',
              left: '10px',
              color: '#64748B',
              fontSize: '18px',
              pointerEvents: 'none',
            }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className={styles.searchInput}
          />
          <span
            style={{
              position: 'absolute',
              right: '8px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#64748B',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '4px',
              padding: '1px 4px',
            }}
          >
            ⌘K
          </span>
        </div>

        {/* Right: Store Status + Notifications + Owner Profile */}
        <div className={styles.rightGroup}>
          {/* Online/Offline Status Toggle */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setIsStatusMenuOpen(!isStatusMenuOpen);
                setIsStoreSwitcherOpen(false);
                setIsProfileMenuOpen(false);
              }}
              className={styles.statusToggleBtn}
              style={{
                backgroundColor: isOnline ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${isOnline ? '#A7F3D0' : '#FECACA'}`,
                color: isOnline ? '#065F46' : '#991B1B',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isOnline ? '#10B981' : '#EF4444',
                }}
              />
              <span className={styles.statusLabelFull}>{isOnline ? 'Store Online' : 'Store Offline'}</span>
              <span className={styles.statusLabelShort}>{isOnline ? 'Online' : 'Offline'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                expand_more
              </span>
            </button>

            {isStatusMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '200px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #E2E8F0',
                  padding: '6px',
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Store Availability
                </div>
                <button
                  onClick={() => {
                    setIsOnline(true);
                    setIsStatusMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    backgroundColor: isOnline ? '#ECFDF5' : 'transparent',
                    color: isOnline ? '#065F46' : '#172033',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                  Online (Accepting orders)
                </button>
                <button
                  onClick={() => {
                    setIsOnline(false);
                    setIsStatusMenuOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    backgroundColor: !isOnline ? '#FEF2F2' : 'transparent',
                    color: !isOnline ? '#991B1B' : '#172033',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  Offline (Store closed)
                </button>
              </div>
            )}
          </div>

          {/* Notifications button */}
          <Link
            to="/business/notifications"
            style={{
              position: 'relative',
              padding: '6px',
              borderRadius: '6px',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Notifications"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  minWidth: '15px',
                  height: '15px',
                  borderRadius: '10px',
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* Owner Profile Avatar (Strictly for account options) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => {
                setIsProfileMenuOpen(!isProfileMenuOpen);
                setIsStoreSwitcherOpen(false);
                setIsStatusMenuOpen(false);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '12px',
              }}
              title="Account Options"
            >
              {currentUser?.avatar || 'SS'}
            </button>

            {isProfileMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '200px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #E2E8F0',
                  padding: '6px 0',
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                    {currentUser?.name || 'Suresh Sharma'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {currentUser?.role === 'staff' ? 'Staff Member' : 'Store Owner'}
                  </div>
                </div>
                <Link
                  to="/business/settings"
                  onClick={() => setIsProfileMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 12px', fontSize: '12px', color: '#172033', textDecoration: 'none' }}
                >
                  Account Settings
                </Link>
                <Link
                  to="/"
                  onClick={() => setIsProfileMenuOpen(false)}
                  style={{ display: 'block', padding: '8px 12px', fontSize: '12px', color: '#2563EB', textDecoration: 'none' }}
                >
                  Switch to Customer App
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    textAlign: 'left',
                    fontSize: '12px',
                    color: '#EF4444',
                    borderTop: '1px solid #F1F5F9',
                    backgroundColor: 'transparent',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
