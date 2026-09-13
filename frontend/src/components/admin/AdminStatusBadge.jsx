import React from 'react';

export default function AdminStatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const getStyle = (s) => {
    const norm = String(s).trim().toLowerCase();
    switch (norm) {
      case 'active':
      case 'published':
      case 'in stock':
      case 'delivered':
      case 'picked_up':
      case 'paid':
      case 'verified':
      case 'true':
      case 'online':
        return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0', icon: 'check_circle' };

      case 'low stock':
      case 'pending':
      case 'pending review':
      case 'preparing':
      case 'confirmed':
      case 'ready':
      case 'ready_for_pickup':
      case 'placed':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A', icon: 'schedule' };

      case 'out_for_delivery':
      case 'out for delivery':
        return { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE', icon: 'local_shipping' };

      case 'suspended':
      case 'flagged':
      case 'out of stock':
      case 'cancelled':
      case 'removed':
      case 'past due':
      case 'critical':
      case 'false':
      case 'offline':
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA', icon: 'error' };

      case 'admin':
        return { bg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE', icon: 'shield_person' };

      case 'business_owner':
      case 'owner':
        return { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE', icon: 'store' };

      case 'staff':
        return { bg: '#F1F5F9', text: '#334155', border: '#E2E8F0', icon: 'badge' };

      case 'delivery_staff':
        return { bg: '#F0FDF4', text: '#166534', border: '#DCFCE7', icon: 'two_wheeler' };

      case 'customer':
        return { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0', icon: 'person' };

      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', icon: 'info' };
    }
  };

  const style = getStyle(status);
  const isSm = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '3px' : '4px',
        padding: isSm ? '2px 6px' : '3px 9px',
        borderRadius: '9999px',
        fontSize: isSm ? '10px' : '11px',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: isSm ? '11px' : '13px', lineHeight: 1 }}
      >
        {style.icon}
      </span>
      {status}
    </span>
  );
}
