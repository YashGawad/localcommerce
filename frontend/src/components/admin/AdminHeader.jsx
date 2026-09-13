import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export default function AdminHeader({ onToggleSidebar }) {
  const { notifications } = useAdmin();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '540px' }}>
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '6px',
              color: '#334155',
              cursor: 'pointer',
            }}
            title="Toggle Menu"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              menu
            </span>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
            admin_panel_settings
          </span>
          <span style={{ fontWeight: 700, color: '#172033' }}>Platform Operations</span>
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
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          <span>Network Live</span>
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
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '3px',
                right: '3px',
                minWidth: '14px',
                height: '14px',
                borderRadius: '9999px',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 2px',
              }}
            >
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/"
          style={{
            fontSize: '12px',
            color: '#2563EB',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: '6px',
            backgroundColor: '#EFF6FF',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Return to Customer Storefront"
        >
          <span>Storefront</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            arrow_forward
          </span>
        </Link>
      </div>
    </header>
  );
}
