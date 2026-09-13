import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../shared/Logo';
import styles from './BusinessNavDrawer.module.css';

export default function BusinessNavDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  const navSections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/business', icon: 'dashboard', end: true },
      ],
    },
    {
      title: 'Catalog',
      items: [
        { label: 'Products', path: '/business/products', icon: 'inventory_2' },
        { label: 'Categories', path: '/business/categories', icon: 'category' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Orders', path: '/business/orders', icon: 'receipt_long' },
        { label: 'Inventory', path: '/business/inventory', icon: 'warehouse' },
        { label: 'Fulfillment', path: '/business/fulfillment', icon: 'local_shipping' },
      ],
    },
    {
      title: 'Customers',
      items: [
        { label: 'Customers', path: '/business/customers', icon: 'people' },
      ],
    },
    {
      title: 'Growth',
      items: [
        { label: 'Discounts', path: '/business/discounts', icon: 'sell' },
        { label: 'Analytics', path: '/business/analytics', icon: 'insights' },
      ],
    },
    {
      title: 'Team',
      items: [
        { label: 'Staff', path: '/business/staff', icon: 'badge' },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Notifications', path: '/business/notifications', icon: 'notifications' },
        { label: 'Settings', path: '/business/settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          zIndex: 50,
          transition: 'opacity 0.2s ease',
        }}
      />

      {/* Drawer */}
      <aside className={styles.drawer}>
        {/* Drawer Header */}
        <div className={styles.header}>
          <Logo variant="business" to="/business" />
          <button
            onClick={onClose}
            className={styles.closeBtn}
            title="Close menu"
            aria-label="Close navigation drawer"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
              close
            </span>
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {navSections.map((section) => (
            <div key={section.title}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748B',
                  padding: '4px 8px',
                  marginBottom: '4px',
                }}
              >
                {section.title}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={onClose}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#172554' : '#475569',
                      backgroundColor: isActive ? '#EFF4FF' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                    })}
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className="material-symbols-outlined"
                          style={{
                            fontSize: '18px',
                            color: isActive ? '#2563EB' : '#64748B',
                          }}
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Drawer Footer Owner Profile */}
        <div className={styles.footerProfile}>
          <div
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
              flexShrink: 0,
            }}
          >
            SS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              Suresh Sharma
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Store Owner
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
