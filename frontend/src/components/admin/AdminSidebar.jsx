import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const navGroups = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: 'dashboard', end: true },
      ],
    },
    {
      group: 'Platform',
      items: [
        { label: 'Stores', path: '/admin/stores', icon: 'storefront' },
        { label: 'Users', path: '/admin/users', icon: 'group' },
        { label: 'Global Products', path: '/admin/global-products', icon: 'inventory_2' },
        { label: 'Store Listings', path: '/admin/store-listings', icon: 'list_alt' },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Orders', path: '/admin/orders', icon: 'receipt_long' },
        { label: 'Reviews & Moderation', path: '/admin/reviews', icon: 'rate_review' },
      ],
    },
    {
      group: 'Business',
      items: [
        { label: 'Analytics', path: '/admin/analytics', icon: 'monitoring' },
        { label: 'Subscriptions', path: '/admin/subscriptions', icon: 'card_membership' },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Notifications', path: '/admin/notifications', icon: 'notifications' },
        { label: 'Settings', path: '/admin/settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 30,
      }}
    >
      {/* Admin Branding Header */}
      <div
        style={{
          height: '64px',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
        }}
      >
        <Logo variant="admin" to="/admin" />
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 5px',
            borderRadius: '4px',
            backgroundColor: '#E5EEFF',
            color: '#172554',
            letterSpacing: '0.02em',
          }}
        >
          ROOT
        </span>
      </div>

      {/* Navigation Sections */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {navGroups.map((group) => (
          <div key={group.group}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#64748B',
                padding: '2px 8px',
                marginBottom: '4px',
              }}
            >
              {group.group}
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : '#475569',
                    backgroundColor: isActive ? '#172554' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: '17px',
                          color: isActive ? '#FFFFFF' : '#64748B',
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

      {/* Admin Sidebar Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            Platform v2.4 Live
          </span>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
            title="Log out"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              logout
            </span>
            <span>Exit</span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 8px',
            backgroundColor: '#FFFFFF',
            borderRadius: '6px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#172554',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px',
              flexShrink: 0,
            }}
          >
            {currentUser?.avatar || 'VM'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#172033', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {currentUser?.name || 'Vikram Malhotra'}
            </span>
            <span style={{ fontSize: '10px', color: '#64748B' }}>
              {currentUser?.title || 'Super Admin'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
