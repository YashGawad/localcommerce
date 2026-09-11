import React from 'react';

/**
 * LocalCommerce Status Badge / Chip
 * Variants: 'success', 'warning', 'danger', 'info', 'neutral'
 */
export default function Badge({
  children,
  variant = 'neutral',
  dot = false,
  size = 'md',
  style = {},
}) {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', dot: '#10B981' };
      case 'warning':
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', dot: '#F59E0B' };
      case 'danger':
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', dot: '#EF4444' };
      case 'info':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', dot: '#2563EB' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: '#334155', border: '#CBD5E1', dot: '#64748B' };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'sm' ? '1px 6px' : '2px 8px',
        fontSize: size === 'sm' ? '11px' : '12px',
        fontWeight: 600,
        borderRadius: '4px',
        backgroundColor: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.dot,
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  );
}
