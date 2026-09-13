import React from 'react';

export default function AdminPageHeader({
  title,
  subtitle,
  badge,
  badgeVariant = 'info',
  actions,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#172033',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            {title}
          </h1>
          {badge && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: badgeVariant === 'warning' ? '#FEF3C7' : (badgeVariant === 'success' ? '#D1FAE5' : '#E0E7FF'),
                color: badgeVariant === 'warning' ? '#92400E' : (badgeVariant === 'success' ? '#065F46' : '#3730A3'),
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </div>
  );
}
