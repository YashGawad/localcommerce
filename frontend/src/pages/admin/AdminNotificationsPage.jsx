import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminNotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification,
    broadcastNotification,
  } = useAdmin();

  // Filters
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('system');
  const [broadcastSeverity, setBroadcastSeverity] = useState('info');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    broadcastNotification({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: broadcastType,
      severity: broadcastSeverity,
    });

    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    showToast('Broadcast alert posted to platform operators');
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (selectedTypeFilter !== 'ALL' && n.type !== selectedTypeFilter) return false;
      if (showUnreadOnly && n.isRead) return false;
      return true;
    });
  }, [notifications, selectedTypeFilter, showUnreadOnly]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 999,
          }}
        >
          {toastMessage}
        </div>
      )}

      <AdminPageHeader
        title="Platform Alert & Notification Feed"
        subtitle="Security events, merchant onboarding escalations, review moderation alerts, and network telemetry notices"
        badge={unreadCount > 0 ? `${unreadCount} Unread Alerts` : 'All Alerts Read'}
        badgeVariant={unreadCount > 0 ? 'warning' : 'success'}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={markAllNotificationsRead}
              style={{
                padding: '8px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                done_all
              </span>
              Mark All Read
            </button>

            <button
              type="button"
              onClick={() => setShowBroadcastModal(true)}
              style={{
                padding: '8px 14px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                campaign
              </span>
              Post Broadcast
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {[
            { key: 'ALL', label: 'All Channels' },
            { key: 'security', label: 'Security' },
            { key: 'merchant', label: 'Merchants' },
            { key: 'compliance', label: 'Compliance' },
            { key: 'operations', label: 'Operations' },
            { key: 'system', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTypeFilter(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedTypeFilter === tab.key ? '#FFFFFF' : 'transparent',
                color: selectedTypeFilter === tab.key ? '#172033' : '#64748B',
                boxShadow: selectedTypeFilter === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => setShowUnreadOnly(e.target.checked)}
          />
          Show unread alerts only
        </label>
      </div>

      {/* Notifications List */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        {filteredNotifications.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#CBD5E1' }}>
              notifications_off
            </span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginTop: '8px' }}>
              No notifications in this channel
            </div>
            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
              Platform operational alerts will appear here in real-time
            </div>
          </div>
        ) : (
          filteredNotifications.map((ntf) => (
            <div
              key={ntf.id}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                backgroundColor: ntf.isRead ? '#FFFFFF' : '#F8FAFC',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor:
                    ntf.severity === 'critical'
                      ? '#FEF2F2'
                      : ntf.severity === 'warning'
                      ? '#FFFBEB'
                      : '#EFF6FF',
                  color:
                    ntf.severity === 'critical'
                      ? '#EF4444'
                      : ntf.severity === 'warning'
                      ? '#D97706'
                      : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {ntf.type === 'security'
                    ? 'shield'
                    : ntf.type === 'merchant'
                    ? 'storefront'
                    : ntf.type === 'compliance'
                    ? 'gavel'
                    : 'info'}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                    {ntf.title}
                  </span>
                  {!ntf.isRead && (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#2563EB',
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 700,
                    }}
                  >
                    {ntf.type}
                  </span>
                </div>

                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>
                  {ntf.message}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11px' }}>
                  <span style={{ color: '#94A3B8' }}>{ntf.timestamp}</span>

                  {ntf.actionUrl && (
                    <Link
                      to={ntf.actionUrl}
                      onClick={() => markNotificationRead(ntf.id)}
                      style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
                    >
                      View in Console →
                    </Link>
                  )}

                  {!ntf.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(ntf.id)}
                      style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Mark as Read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => dismissNotification(ntf.id)}
                    style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      <AdminModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Post Platform Broadcast Notice"
        subtitle="Publish a high-priority advisory to platform operators"
      >
        <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Broadcast Title *
            </label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Scheduled Network Gateway Maintenance"
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Channel
              </label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              >
                <option value="system">System Advisory</option>
                <option value="security">Security Alert</option>
                <option value="operations">Operations Notice</option>
                <option value="compliance">Compliance Update</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Severity
              </label>
              <select
                value={broadcastSeverity}
                onChange={(e) => setBroadcastSeverity(e.target.value)}
                style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
              >
                <option value="info">Info (Standard)</option>
                <option value="warning">Warning (Priority)</option>
                <option value="critical">Critical (Immediate Attention)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Message Content *
            </label>
            <textarea
              rows={3}
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Detailed explanation of the announcement or system state..."
              style={{ width: '100%', padding: '8px 10px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowBroadcastModal(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Publish Alert
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
